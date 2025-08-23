// 🔄 CHAT SYNC SERVICE - IndexedDB ↔ Supabase with UUID Schema
// Synchronizes chats between local IndexedDB and cloud Supabase database
// Following Omnia's UUID design with UPSERT for duplicate protection

import { supabase, isSupabaseReady } from '../supabase/client.js';
import { authService } from '../auth/supabaseAuth.js';
import chatDB from '../storage/chatDB.js';

class ChatSyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.lastSyncTimestamp = localStorage.getItem('lastSyncTimestamp') || '0';
    this.syncInProgress = false;
    
    // Listen to network changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.backgroundSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    console.log('🔄 [SYNC-UUID] ChatSyncService initialized with UUID schema');
  }

  // 🔐 Get current user ID for auth-scoped operations
  async getCurrentUserId() {
    try {
      const user = await authService.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      console.error('❌ [SYNC-UUID] Error getting current user:', error);
      return null;
    }
  }

  // 👤 Ensure user profile exists (auto-create if needed)
  async ensureUserProfile() {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;

    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!profile) {
        // Auto-create profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: null,
            avatar_url: null
          });

        if (error) {
          console.error('❌ [SYNC-UUID] Error creating profile:', error);
          return false;
        }
        
        console.log('✅ [SYNC-UUID] Auto-created user profile');
      }

      return true;
    } catch (error) {
      console.error('❌ [SYNC-UUID] Error ensuring profile:', error);
      return false;
    }
  }

  // 📤 Upload local chat to Supabase with UUID schema
  async uploadChat(chatId) {
    if (!isSupabaseReady()) {
      console.warn('⚠️ [SYNC-UUID] Supabase not configured - sync disabled');
      throw new Error('Supabase configuration missing');
    }
    
    if (!this.isOnline) {
      console.log('📶 [SYNC-UUID] Offline - queuing chat for sync');
      this.queueChatForSync(chatId);
      return false;
    }

    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.warn('👤 [SYNC-UUID] User not authenticated - sync disabled');
      throw new Error('User authentication required for sync');
    }

    // Ensure profile exists
    const profileReady = await this.ensureUserProfile();
    if (!profileReady) return false;

    try {
      console.log(`📤 [SYNC-UUID] Uploading chat: ${chatId}`);
      
      // Get chat metadata from IndexedDB
      const localChats = await chatDB.getAllChats();
      const chatMetadata = localChats.find(c => c.id === chatId);
      
      if (!chatMetadata) {
        console.warn(`⚠️ [SYNC-UUID] Chat not found in IndexedDB: ${chatId}`);
        return false;
      }

      // Get all messages for this chat
      const { messages } = await chatDB.getAllMessagesForChat(chatId);
      
      console.log(`📋 [SYNC-UUID] Found ${messages.length} messages for chat: ${chatId}`);

      // Upload chat metadata with original IndexedDB ID (text format)
      const chatData = {
        id: chatId, // Use original IndexedDB chat ID
        user_id: userId,
        title: chatMetadata.title,
        created_at: new Date(chatMetadata.createdAt).toISOString(),
        updated_at: new Date(chatMetadata.updatedAt).toISOString()
      };

      // Upsert chat (insert or update)
      const { error: chatError } = await supabase
        .from('chats')
        .upsert(chatData, { onConflict: 'id' });

      if (chatError) {
        console.error('❌ [SYNC-UUID] Error uploading chat metadata:', chatError);
        return false;
      }

      // 🚀 TIMESTAMP-BASED SYNC OPTIMIZATION
      // Get last sync timestamp for this chat (if exists)
      const lastSyncKey = `lastSync_${chatId}`;
      const lastSyncTimestamp = localStorage.getItem(lastSyncKey);
      
      let newMessages;
      
      if (lastSyncTimestamp) {
        // ⚡ OPTIMIZED: Filter messages by timestamp (much faster)
        const lastSyncTime = new Date(lastSyncTimestamp).getTime();
        newMessages = messages.filter(localMsg => 
          new Date(localMsg.timestamp).getTime() > lastSyncTime
        );
        
        console.log(`⚡ [SYNC-UUID] Using timestamp-based sync. Last sync: ${lastSyncTimestamp}, found ${newMessages.length} new messages`);
      } else {
        // 🐌 FALLBACK: Use content-based check for first sync (backward compatibility)
        console.log(`🐌 [SYNC-UUID] First sync for chat ${chatId} - using content-based check`);
        
        const { data: existingMessages } = await supabase
          .from('messages')
          .select('content, sender, timestamp')
          .eq('chat_id', chatId);

        newMessages = messages.filter(localMsg => 
          !existingMessages?.some(existing => 
            existing.content === localMsg.text && 
            existing.sender === localMsg.sender
          )
        );
      }

      if (newMessages.length === 0) {
        console.log(`✅ [SYNC-UUID] No new messages to upload for chat: ${chatId}`);
        return true;
      }

      console.log(`📤 [SYNC-UUID] Uploading ${newMessages.length} new messages (${messages.length - newMessages.length} already exist)`);

      // Upload only new messages with UUID schema and UPSERT
      const batchSize = 100;
      let uploadedCount = 0;

      for (let i = 0; i < newMessages.length; i += batchSize) {
        const batch = newMessages.slice(i, i + batchSize);
        const messagesToUpload = batch.map(msg => ({
          id: msg.uuid, // Use UUID from IndexedDB (stable ID)
          chat_id: chatId, // Use original chat ID
          user_id: userId,
          content: msg.text, // ✅ IndexedDB 'text' → Supabase 'content'
          sender: msg.sender,
          timestamp: new Date(msg.timestamp).toISOString(),
          synced: true,
          type: msg.type || 'text',
          attachments: msg.attachments || null,
          image: msg.image || null
        }));

        // Use UPSERT for duplicate protection
        const { error: messagesError } = await supabase
          .from('messages')
          .upsert(messagesToUpload, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (messagesError) {
          console.error(`❌ [SYNC-UUID] Error uploading messages batch ${i / batchSize + 1}:`, messagesError);
          return false;
        }

        uploadedCount += batch.length;
      }

      console.log(`✅ [SYNC-UUID] Successfully uploaded chat: ${chatId} (${uploadedCount} messages)`);
      
      // 🚀 SAVE SYNC TIMESTAMP for next optimization
      const syncTimestamp = new Date().toISOString();
      localStorage.setItem(`lastSync_${chatId}`, syncTimestamp);
      console.log(`⏰ [SYNC-UUID] Saved sync timestamp: ${syncTimestamp}`);
      
      return true;

    } catch (error) {
      console.error(`❌ [SYNC-UUID] Error uploading chat ${chatId}:`, error);
      return false;
    }
  }

  // 📥 Download chats from Supabase to IndexedDB with UUID schema
  async downloadChats() {
    if (!isSupabaseReady()) {
      console.warn('⚠️ [SYNC-UUID] Supabase not configured - download disabled');
      throw new Error('Supabase configuration missing');
    }
    
    if (!this.isOnline) {
      console.log('📶 [SYNC-UUID] Offline - cannot download');
      return false;
    }

    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.warn('👤 [SYNC-UUID] User not authenticated - download disabled');
      throw new Error('User authentication required for sync');
    }

    try {
      console.log('📥 [SYNC-UUID] Downloading chats from Supabase...');

      // Get all user's chats from Supabase
      const { data: remoteChats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        console.error('❌ [SYNC-UUID] Error fetching chats:', chatsError);
        return false;
      }

      if (!remoteChats || remoteChats.length === 0) {
        console.log('📭 [SYNC-UUID] No chats found in Supabase');
        return true;
      }

      console.log(`📋 [SYNC-UUID] Found ${remoteChats.length} chats in Supabase`);

      // 🚀 BATCH QUERIES OPTIMIZATION
      // Instead of N queries (one per chat), use 1 query for all messages
      console.log('⚡ [SYNC-UUID] Using batch query for all messages...');
      
      const { data: allRemoteMessages, error: allMessagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (allMessagesError) {
        console.error('❌ [SYNC-UUID] Error fetching all messages:', allMessagesError);
        return false;
      }

      // Group messages by chat_id locally (much faster than N database queries)
      const messagesByChat = {};
      if (allRemoteMessages) {
        allRemoteMessages.forEach(msg => {
          if (!messagesByChat[msg.chat_id]) {
            messagesByChat[msg.chat_id] = [];
          }
          messagesByChat[msg.chat_id].push(msg);
        });
      }

      console.log(`⚡ [SYNC-UUID] Fetched ${allRemoteMessages?.length || 0} messages with 1 query, grouped into ${Object.keys(messagesByChat).length} chats`);

      // Process each chat with its pre-fetched messages
      for (const remoteChat of remoteChats) {
        const chatMessages = messagesByChat[remoteChat.id] || [];
        await this.processChatWithMessages(remoteChat, chatMessages);
      }

      // Clean up orphaned chats (exist locally but not in Supabase)
      const localChats = await chatDB.getAllChats();
      const orphanedChats = localChats.filter(local => 
        !remoteChats.some(remote => remote.id === local.id)
      );

      if (orphanedChats.length > 0) {
        console.log(`🧹 [SYNC-UUID] Found ${orphanedChats.length} orphaned chats to clean up`);
        for (const chat of orphanedChats) {
          await chatDB.deleteChat(chat.id, { skipSync: true });
          console.log(`🗑️ [SYNC-UUID] Cleaned up deleted chat: ${chat.id}`);
        }
      }

      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now().toString();
      localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp);

      console.log(`✅ [SYNC-UUID] Successfully downloaded ${remoteChats.length} chats and cleaned ${orphanedChats.length} orphaned chats`);
      return true;

    } catch (error) {
      console.error('❌ [SYNC-UUID] Error downloading chats:', error);
      return false;
    }
  }

  // 📥 Process chat with pre-fetched messages (optimized batch version)
  async processChatWithMessages(remoteChat, remoteMessages) {
    try {
      const chatId = remoteChat.id;
      console.log(`📥 [SYNC-UUID] Processing ${remoteMessages.length} messages for chat: ${chatId}`);

      if (!remoteMessages || remoteMessages.length === 0) {
        console.log(`📭 [SYNC-UUID] No messages found for chat: ${chatId}`);
        return;
      }

      // Convert Supabase format to IndexedDB format with proper schema mapping
      const localMessages = remoteMessages.map(msg => ({
        uuid: msg.id, // Store Supabase UUID as primary key in IndexedDB
        timestamp: new Date(msg.timestamp).getTime(), // Convert timestamptz to bigint
        sender: msg.sender,
        text: msg.content, // ✅ Supabase 'content' → IndexedDB 'text'
        type: msg.type || 'text',
        attachments: msg.attachments,
        image: msg.image
      }));

      // Use the same chat ID from Supabase (no conversion needed)
      const localChatId = remoteChat.id;

      // Save messages using IndexedDB's existing logic (skip sync to prevent loop)
      await chatDB.saveChatV2(localChatId, localMessages, remoteChat.title, true);

      console.log(`✅ [SYNC-UUID] Downloaded ${localMessages.length} messages for chat: ${chatId}`);

    } catch (error) {
      console.error(`❌ [SYNC-UUID] Error downloading chat messages:`, error);
    }
  }

  // 🔄 Full bidirectional sync
  async fullSync() {
    if (this.syncInProgress) {
      console.log('⏳ [SYNC-UUID] Sync already in progress, skipping');
      return;
    }

    this.syncInProgress = true;
    const startTime = performance.now();

    try {
      console.log('🔄 [SYNC-UUID] Starting full bidirectional sync...');

      // Step 1: Clean up ghost chats FIRST (prevent resurrection)
      const ghostsExorcised = await this.syncDeletedChats();
      if (ghostsExorcised > 0) {
        console.log(`👻 [SYNC-UUID] Exorcised ${ghostsExorcised} ghost chats before sync`);
      }

      // Step 2: Upload remaining clean local chats to Supabase
      const localChats = await chatDB.getAllChats();
      console.log(`📤 [SYNC-UUID] Uploading ${localChats.length} local chats...`);

      let uploadedCount = 0;
      for (const chat of localChats) {
        const success = await this.uploadChat(chat.id);
        if (success) uploadedCount++;
      }

      console.log(`✅ [SYNC-UUID] Uploaded ${uploadedCount}/${localChats.length} chats`);

      // Step 3: Download all remote chats from Supabase
      await this.downloadChats();

      const duration = Math.round(performance.now() - startTime);
      console.log(`🎯 [SYNC-UUID] Full sync completed in ${duration}ms`);

    } catch (error) {
      console.error('❌ [SYNC-UUID] Error during full sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // 👻 Clean up ghost chats (exist locally but not in Supabase - deleted elsewhere)
  async syncDeletedChats() {
    if (!isSupabaseReady() || !this.isOnline) {
      console.log('📶 [SYNC-UUID] Not ready for ghost cleanup (offline or Supabase not ready)');
      return 0;
    }

    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.log('👤 [SYNC-UUID] User not authenticated, skipping ghost cleanup');
      return 0;
    }

    try {
      console.log('👻 [SYNC-UUID] Starting ghost chat cleanup...');

      // Get current truth from Supabase
      const { data: supabaseChats, error: supabaseError } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', userId);

      if (supabaseError) {
        console.error('❌ [SYNC-UUID] Error fetching Supabase chats for cleanup:', supabaseError);
        return 0;
      }

      // Get local IndexedDB state
      const localChats = await chatDB.getAllChats();
      
      // Find ghost chats (exist locally but NOT in Supabase - deleted elsewhere)
      const ghostChats = localChats.filter(local =>
        !supabaseChats.some(remote => remote.id === local.id)
      );

      if (ghostChats.length === 0) {
        console.log('✅ [SYNC-UUID] No ghost chats found');
        return 0;
      }

      console.log(`🧹 [SYNC-UUID] Found ${ghostChats.length} ghost chats to exorcise`);

      // Exorcise the ghosts (delete from local IndexedDB only)
      for (const ghostChat of ghostChats) {
        await chatDB.deleteChat(ghostChat.id, { skipSync: true });
        console.log(`🗑️ [SYNC-UUID] Exorcised ghost chat: ${ghostChat.id}`);
      }

      console.log(`✅ [SYNC-UUID] Ghost cleanup complete - exorcised ${ghostChats.length} ghosts`);
      return ghostChats.length;

    } catch (error) {
      console.error('❌ [SYNC-UUID] Error during ghost cleanup:', error);
      return 0;
    }
  }

  // 🚀 Background sync (called when app loads or network comes back)
  async backgroundSync() {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.log('👤 [SYNC-UUID] User not authenticated, skipping background sync');
      return;
    }

    if (!isSupabaseReady() || !this.isOnline) {
      console.log('📶 [SYNC-UUID] Not ready for background sync (offline or Supabase not ready)');
      return;
    }

    // Sync cooldown - only sync once per minute
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    const now = Date.now();
    if (lastSyncTime && (now - parseInt(lastSyncTime)) < 60000) {
      console.log('⏰ [SYNC-UUID] Sync skipped - cooldown active (less than 1 minute since last sync)');
      return;
    }

    console.log('🚀 [SYNC-UUID] Starting background sync...');
    await this.fullSync();
    
    // Update last sync time
    localStorage.setItem('lastSyncTime', now.toString());
  }

  // 🗑️ Delete chat from Supabase (called when user deletes chat)
  async deleteChat(chatId) {
    if (!isSupabaseReady()) {
      console.warn('⚠️ [SYNC-UUID] Supabase not configured - delete sync disabled');
      return false;
    }
    
    if (!this.isOnline) {
      console.log('📶 [SYNC-UUID] Offline - cannot delete from Supabase');
      return false;
    }

    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.warn('👤 [SYNC-UUID] User not authenticated - delete sync disabled');
      return false;
    }

    try {
      console.log(`🗑️ [SYNC-UUID] Deleting chat from Supabase: ${chatId}`);
      
      // Delete chat from Supabase (messages will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', userId); // Security: only delete own chats

      if (error) {
        console.error('❌ [SYNC-UUID] Error deleting chat from Supabase:', error);
        return false;
      }

      console.log(`✅ [SYNC-UUID] Successfully deleted chat from Supabase: ${chatId}`);
      return true;

    } catch (error) {
      console.error(`❌ [SYNC-UUID] Error during chat deletion sync: ${error}`);
      return false;
    }
  }

  // 📱 Auto-sync after saving message (called from chatDB hook)
  async autoSyncMessage(chatId) {
    const userId = await this.getCurrentUserId();
    if (!userId || !this.isOnline || !isSupabaseReady()) {
      // Queue for later sync when conditions are met
      this.queueChatForSync(chatId);
      return;
    }

    // Upload this specific chat immediately
    await this.uploadChat(chatId);
  }

  // 📝 Queue chat for sync when offline
  queueChatForSync(chatId) {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    if (!queue.includes(chatId)) {
      queue.push(chatId);
      localStorage.setItem('syncQueue', JSON.stringify(queue));
      console.log(`📝 [SYNC-UUID] Queued chat for sync: ${chatId}`);
    }
  }

  // 📊 Get sync status
  getSyncStatus() {
    const queueSize = JSON.parse(localStorage.getItem('syncQueue') || '[]').length;
    return {
      isOnline: this.isOnline,
      supabaseReady: isSupabaseReady(),
      syncInProgress: this.syncInProgress,
      lastSyncTimestamp: this.lastSyncTimestamp,
      queuedSyncs: queueSize
    };
  }

  // 🧹 Clear sync cooldown (for immediate sync after login)
  clearSyncCooldown() {
    localStorage.removeItem('lastSyncTime');
    localStorage.removeItem('lastSyncTimestamp');
    console.log('🧹 [SYNC-UUID] Sync cooldown cleared - ready for immediate sync');
  }
}

// Export singleton instance
export const chatSyncService = new ChatSyncService();

// 🐛 DEVELOPMENT DEBUGGING HELPERS
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.omniaSync = {
    // Test upload single chat
    async testUpload(chatId) {
      if (!chatId) {
        const chats = await chatDB.getAllChats();
        chatId = chats[0]?.id;
        console.log('🧪 Using first available chat:', chatId);
      }
      
      if (!chatId) {
        console.error('❌ No chats found to test upload');
        return false;
      }
      
      console.log('🧪 Testing upload for chat:', chatId);
      return await chatSyncService.uploadChat(chatId);
    },
    
    // Test download all chats
    async testDownload() {
      console.log('🧪 Testing download from Supabase...');
      return await chatSyncService.downloadChats();
    },
    
    // Test full sync
    async testFullSync() {
      console.log('🧪 Testing full bidirectional sync...');
      return await chatSyncService.fullSync();
    },
    
    // Get sync status
    status() {
      const status = chatSyncService.getSyncStatus();
      console.table(status);
      return status;
    },
    
    // Manual sync trigger
    async sync() {
      await chatSyncService.backgroundSync();
    }
  };
  
  console.log('🔄 OMNIA SYNC UUID DEBUG: Use window.omniaSync.* for testing');
}

export default chatSyncService;