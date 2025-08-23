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

      // Upload messages with UUID schema and UPSERT
      const batchSize = 100;
      let uploadedCount = 0;

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const messagesToUpload = batch.map(msg => ({
          id: crypto.randomUUID(), // Generate UUID for each message
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

      // Process each chat
      for (const remoteChat of remoteChats) {
        await this.downloadChatMessages(remoteChat);
      }

      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now().toString();
      localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp);

      console.log(`✅ [SYNC-UUID] Successfully downloaded ${remoteChats.length} chats`);
      return true;

    } catch (error) {
      console.error('❌ [SYNC-UUID] Error downloading chats:', error);
      return false;
    }
  }

  // 📥 Download messages for specific chat with UUID schema mapping
  async downloadChatMessages(remoteChat) {
    try {
      const chatId = remoteChat.id;
      console.log(`📥 [SYNC-UUID] Downloading messages for chat: ${chatId}`);

      // Get messages for this chat from Supabase
      const { data: remoteMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true });

      if (messagesError) {
        console.error(`❌ [SYNC-UUID] Error fetching messages for chat ${chatId}:`, messagesError);
        return;
      }

      if (!remoteMessages || remoteMessages.length === 0) {
        console.log(`📭 [SYNC-UUID] No messages found for chat: ${chatId}`);
        return;
      }

      // Convert Supabase format to IndexedDB format with proper schema mapping
      const localMessages = remoteMessages.map(msg => ({
        id: msg.id, // Keep UUID from Supabase
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

      // Step 1: Upload all local chats to Supabase
      const localChats = await chatDB.getAllChats();
      console.log(`📤 [SYNC-UUID] Uploading ${localChats.length} local chats...`);

      let uploadedCount = 0;
      for (const chat of localChats) {
        const success = await this.uploadChat(chat.id);
        if (success) uploadedCount++;
      }

      console.log(`✅ [SYNC-UUID] Uploaded ${uploadedCount}/${localChats.length} chats`);

      // Step 2: Download all remote chats from Supabase
      await this.downloadChats();

      const duration = Math.round(performance.now() - startTime);
      console.log(`🎯 [SYNC-UUID] Full sync completed in ${duration}ms`);

    } catch (error) {
      console.error('❌ [SYNC-UUID] Error during full sync:', error);
    } finally {
      this.syncInProgress = false;
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

    console.log('🚀 [SYNC-UUID] Starting background sync...');
    await this.fullSync();
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