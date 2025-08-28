// 💾 CHAT DATABASE - IndexedDB with Dexie.js
// Handles chat history with asynchronous operations for better performance
// Replaces localStorage for chat data to prevent UI blocking

import Dexie from 'dexie';

// Initialize Dexie database
class ChatDatabase extends Dexie {
  constructor() {
    super('OmniaChatDB');
    
    // V1 Schema (OLD - monolithic)
    this.version(1).stores({
      chats: 'id, title, createdAt, updatedAt, messageCount'
    });
    
    // V2 Schema (NEW - normalized)
    this.version(2).stores({
      chats: 'id, title, createdAt, updatedAt, messageCount',
      messages: '++id, chatId, timestamp, sender, text, type, attachments, [chatId+timestamp]'
    }).upgrade(tx => {
      
      // Clear all old data - fresh start
      return tx.chats.clear().then(() => {
      });
    });
    
    // V3 Schema (ATTACHMENT FIX - add image column)
    this.version(3).stores({
      chats: 'id, title, createdAt, updatedAt, messageCount',
      messages: '++id, chatId, timestamp, sender, text, type, attachments, image, [chatId+timestamp]'
    }).upgrade(tx => {
    });
    
    // V4 Schema (UUID as primary key - fix duplicate sync bug)
    this.version(4).stores({
      chats: 'id, title, createdAt, updatedAt, messageCount',
      messages: 'uuid, chatId, timestamp, sender, text, type, attachments, image, [chatId+timestamp], [chatId+uuid]'
    }).upgrade(tx => {
      // Empty migration - all data cleared before deployment
    });
  }
}

// Create database instance
const db = new ChatDatabase();

// 📚 CHAT DATABASE SERVICE
const chatDB = {
  
  // 💾 Save a single chat (not all chats at once!)
  async saveChat(chatId, messages, title = null) {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      
      const chatData = {
        id: chatId,
        title: title || this.generateChatTitle(messages),
        messages: messages, // Full message array for this chat - OLD MONOLITHIC APPROACH
        createdAt: Date.now(), // Will be updated if chat exists
        updatedAt: Date.now(),
        messageCount: messages.length
      };

      // Check if chat already exists to preserve createdAt
      const existingChat = await db.chats.get(chatId);
      if (existingChat) {
        chatData.createdAt = existingChat.createdAt; // Keep original creation time
      } else {
      }

      // Save/update the chat
      await db.chats.put(chatData);
      
      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);
      
      
      return chatData;
      
    } catch (error) {
      console.error(`❌ [MONITOR] Error saving chat ${chatId}:`, {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  // 📋 Get all chats (metadata only for sidebar list)
  async getAllChats() {
    try {
      const chats = await db.chats
        .orderBy('updatedAt')
        .reverse() // Newest first
        .limit(50) // Limit to prevent performance issues
        .toArray();
      
      return chats;
      
    } catch (error) {
      console.error('❌ Error loading chats from IndexedDB:', error);
      return [];
    }
  },

  // 🚨 DISABLED V1 METHOD - Use V2 getLatestMessages() instead
  async getChat(chatId) {
    const error = new Error(`🚨 [CHAT-DB-V1] getChat() is DISABLED! Use getLatestMessages(chatId, limit) instead.
    
    V1: chatDB.getChat(chatId) → loads ALL messages (memory crash risk)
    V2: chatDB.getLatestMessages(chatId, 50) → loads only latest 50 messages
    
    CallStack will show you where this was called from.`);
    
    // Method disabled - use getLatestMessages() instead
    
    throw error;
  },

  // 🚨 DISABLED V1 METHOD - Use V2 methods instead
  async getChatMessages(chatId, offset = 0, limit = 15) {
    const error = new Error(`🚨 [CHAT-DB-V1] getChatMessages() is DISABLED! Use V2 methods instead.
    
    V1: chatDB.getChatMessages(chatId, offset, limit) → FAKE pagination (loads ALL messages!)
    V2: chatDB.getLatestMessages(chatId, limit) → TRUE pagination from database
    V2: chatDB.getMessagesBefore(chatId, timestamp, limit) → TRUE scroll loading
    
    CallStack will show you where this was called from.`);
    
    // Method disabled - use V2 methods instead
    
    throw error;
  },

  // 🗑️ Delete a specific chat
  async deleteChat(chatId, options = {}) {
    const { skipSync = false } = options;
    
    try {
      await db.chats.delete(chatId);
      
      // 🔄 SYNC DELETE - Remove from Supabase too (unless skipped)
      if (!skipSync) {
        try {
          const { chatSyncService } = await import('../sync/chatSync.js');
          await chatSyncService.deleteChat(chatId);
        } catch (error) {
          console.error('❌ [SYNC] Delete sync failed:', error.message);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting chat from IndexedDB:', error);
      return false;
    }
  },

  // ⚡ Update only chat metadata (faster than full save)
  async updateChatMetadata(chatId, metadata) {
    try {
      await db.chats.update(chatId, {
        ...metadata,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('❌ Error updating chat metadata:', error);
      return false;
    }
  },

  // 🔄 V1 → V2 MIGRATION HELPERS

  // 💾 Save multiple messages at once (V1 compatibility → V2 implementation)
  async saveChatV2(chatId, messages, title = null, skipSync = false) {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      
      if (messages.length === 0) {
        return;
      }

      // Get existing messages to avoid duplicates (append-only, no data loss)
      const existingMessages = await db.messages.where('chatId').equals(chatId).toArray();
      const existingUUIDs = new Set(existingMessages.map(msg => msg.uuid));
      console.log(`📋 [CHAT-DB-V2] Found ${existingMessages.length} existing messages for chat: ${chatId}`);

      // Save only NEW messages (append-only to prevent data loss)
      const messageIds = [];
      let newMessageCount = 0;
      for (const message of messages) {
        // 🚨 STRICT: No fallback - if timestamp missing, it's a bug!
        if (!message.timestamp) {
          console.error('❌ [CHAT-DB-V2] MISSING TIMESTAMP in bulk save:', {
            message,
            sender: message.sender,
            text: message.text?.substring(0, 50),
            callStack: new Error().stack
          });
          throw new Error(`Missing timestamp for message: ${message.sender || 'unknown'}`);
        }
        const timestamp = message.timestamp;
        const uuid = message.uuid || crypto.randomUUID();
        
        // 🔍 [TIMESTAMP-DEBUG] Log IndexedDB bulk save  
        console.log('🔍 [TIMESTAMP-DEBUG] IndexedDB bulk save:', {
          sender: message.sender,
          timestamp: timestamp,
          timestampDate: new Date(timestamp).toISOString(),
          hasOriginalTimestamp: !!message.timestamp,
          fallbackUsed: !message.timestamp
        });
        
        // Skip if message already exists (prevent duplicates by UUID)
        if (existingUUIDs.has(uuid)) {
          continue;
        }
        
        const messageRecord = {
          uuid: uuid, // UUID as primary key
          chatId: chatId,
          timestamp: timestamp,
          sender: message.sender,
          text: message.text,
          type: message.type || 'text',
          attachments: message.attachments || null,
          image: message.image || null  // Fix: Save Imagen images too
        };
        // Use put() instead of add() for upsert behavior with UUID
        await db.messages.put(messageRecord);
        messageIds.push(uuid);
        newMessageCount++;
      }
      
      console.log(`✅ [CHAT-DB-V2] APPEND-ONLY: Added ${newMessageCount} new messages, preserved ${existingMessages.length} existing`)

      // Calculate total message count (existing + new)
      const totalMessageCount = existingMessages.length + newMessageCount;

      // Update chat metadata with correct total count and title
      const chatData = {
        id: chatId,
        title: title || this.generateChatTitle(messages),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: totalMessageCount
      };

      const existingChat = await db.chats.get(chatId);
      if (existingChat) {
        chatData.createdAt = existingChat.createdAt;
        await db.chats.update(chatId, {
          title: chatData.title,
          updatedAt: chatData.updatedAt,
          messageCount: totalMessageCount
        });
        console.log(`🔄 [CHAT-DB-V2] Updated existing chat metadata: ${chatId}, total messages: ${totalMessageCount}`);
      } else {
        await db.chats.add(chatData);
        console.log(`🆕 [CHAT-DB-V2] Created new chat metadata: ${chatId}, total messages: ${totalMessageCount}`);
      }

      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);

      console.log(`✅ [CHAT-DB-V2] Chat conversion completed: ${chatId}`);
      console.log(`⚡ [CHAT-DB-V2] Duration: ${duration}ms, Memory delta: ${memDelta}MB`);
      console.log(`🎯 [CHAT-DB-V2] APPEND-ONLY: ${newMessageCount} new messages added, ${totalMessageCount} total messages`);

      // 🔄 SYNC HOOK - Disabled, using 30s timer sync instead
      // Auto-sync now handled by 30-second timer in App.jsx for better performance
      // if (!skipSync) {
      //   try {
      //     const { chatSyncService } = await import('../sync/chatSync.js');
      //     await chatSyncService.autoSyncMessage(chatId);
      //   } catch (error) {
      //     console.error('❌ [SYNC] Auto-sync failed:', error.message);
      //   }
      // }

      return { chatId, messageIds, messageCount: totalMessageCount };

    } catch (error) {
      console.error(`❌ [CHAT-DB-V2] Error in V1→V2 conversion:`, error);
      throw error;
    }
  },

  // 🚀 NEW V2 API METHODS - Normalized Schema

  // 💾 Save individual message (V2 - efficient)
  async saveMessage(chatId, message) {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      console.log(`💾 [CHAT-DB-V2] Saving message: ${message.sender}, ChatId: ${chatId}`);
      
      // Prepare message for storage
      // 🚨 STRICT: No fallback - if timestamp missing, it's a bug!
      if (!message.timestamp) {
        console.error('❌ [CHAT-DB-V2] MISSING TIMESTAMP in individual save:', {
          message,
          sender: message.sender,
          text: message.text?.substring(0, 50),
          callStack: new Error().stack
        });
        throw new Error(`Missing timestamp for message: ${message.sender || 'unknown'}`);
      }
      const finalTimestamp = message.timestamp;
      
      // 🔍 [TIMESTAMP-DEBUG] Log IndexedDB individual save
      console.log('🔍 [TIMESTAMP-DEBUG] IndexedDB individual save:', {
        sender: message.sender,
        timestamp: finalTimestamp,
        timestampDate: new Date(finalTimestamp).toISOString(),
        hasOriginalTimestamp: !!message.timestamp,
        fallbackUsed: !message.timestamp
      });
      
      const messageRecord = {
        uuid: message.uuid || crypto.randomUUID(), // UUID as primary key
        chatId: chatId,
        timestamp: finalTimestamp,
        sender: message.sender,
        text: message.text,
        type: message.type || 'text',
        attachments: message.attachments || null
      };
      
      // Save message to messages table using put for upsert
      await db.messages.put(messageRecord);
      const messageId = messageRecord.uuid;
      
      // Update chat metadata
      const existingChat = await db.chats.get(chatId);
      if (existingChat) {
        await db.chats.update(chatId, {
          updatedAt: Date.now(),
          messageCount: existingChat.messageCount + 1
        });
        console.log(`🔄 [CHAT-DB-V2] Updated existing chat metadata: ${chatId}`);
      } else {
        // Create new chat
        await db.chats.add({
          id: chatId,
          title: this.generateChatTitle([message]),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 1
        });
        console.log(`🆕 [CHAT-DB-V2] Created new chat: ${chatId}`);
      }
      
      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);
      
      // 🔄 SYNC HOOK - Disabled, using 30s timer sync instead
      // Auto-sync now handled by 30-second timer in App.jsx for better performance
      // try {
      //   const { chatSyncService } = await import('../sync/chatSync.js');
      //   await chatSyncService.autoSyncMessage(chatId);
      // } catch (error) {
      //   console.error('❌ [SYNC] Auto-sync failed:', error.message);
      // }
      
      return messageId;
      
    } catch (error) {
      console.error(`❌ [CHAT-DB-V2] Error saving message:`, error);
      throw error;
    }
  },

  // 📖 Get latest messages (V2 - bottom-first)
  async getLatestMessages(chatId, limit = 50) {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      
      // Get messages using compound index [chatId+timestamp] for efficient querying
      const messages = await db.messages
        .where('[chatId+timestamp]')
        .between([chatId, Dexie.minKey], [chatId, Dexie.maxKey])
        .reverse() // newest first
        .limit(limit)
        .toArray();
      
      // Reverse to display oldest to newest (normal chat order)
      const orderedMessages = messages.reverse();
      
      // Get total count
      const totalCount = await db.messages.where('chatId').equals(chatId).count();
      
      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);
      
      
      return {
        messages: orderedMessages,
        totalCount,
        hasMore: totalCount > limit,
        loadedRange: { start: Math.max(0, totalCount - limit), end: totalCount }
      };
      
    } catch (error) {
      console.error(`❌ [CHAT-DB-V2] Error getting latest messages:`, error);
      return { messages: [], totalCount: 0, hasMore: false };
    }
  },

  // 📚 Get ALL messages for a chat (unlimited - for Virtuoso)
  async getAllMessagesForChat(chatId) {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      
      // Get ALL messages using compound index [chatId+timestamp] for efficient querying
      const messages = await db.messages
        .where('[chatId+timestamp]')
        .between([chatId, Dexie.minKey], [chatId, Dexie.maxKey])
        .toArray(); // No reverse, no limit - get all messages in chronological order
      
      const totalCount = messages.length;
      
      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);
      
      
      return {
        messages: messages,
        totalCount,
        hasMore: false, // No more messages since we loaded everything
        loadedRange: { start: 0, end: totalCount }
      };
      
    } catch (error) {
      console.error(`❌ [CHAT-DB-FULL] Error getting all messages:`, error);
      return { messages: [], totalCount: 0, hasMore: false };
    }
  },

  // 📄 Get messages before specific message (V2 - scroll up)
  async getMessagesBefore(chatId, beforeTimestamp, limit = 15) {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      
      // Get older messages using compound index
      const messages = await db.messages
        .where('[chatId+timestamp]')
        .between([chatId, Dexie.minKey], [chatId, beforeTimestamp], false, true) // exclude beforeTimestamp
        .reverse() // newest first within older range
        .limit(limit)
        .toArray();
      
      // Reverse to display oldest to newest
      const orderedMessages = messages.reverse();
      
      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);
      
      
      return orderedMessages;
      
    } catch (error) {
      console.error(`❌ [CHAT-DB-V2] Error getting messages before:`, error);
      return [];
    }
  },

  // 🏷️ Generate chat title from first user message
  generateChatTitle(messages) {
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage && firstUserMessage.text) {
      // Take first 50 chars and clean up
      let title = firstUserMessage.text.substring(0, 50).trim();
      if (firstUserMessage.text.length > 50) {
        title += '...';
      }
      return title;
    }
    return `Chat ${new Date().toLocaleDateString('cs-CZ')}`;
  },

  // 🆔 Generate unique chat ID
  generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // 🧹 Clear all chat data (for debugging/reset)
  async clearAllChats() {
    try {
      await db.chats.clear();
      return true;
    } catch (error) {
      console.error('❌ Error clearing chats:', error);
      return false;
    }
  },

  // 📋 Get chat titles only (fast loading)
  async getChatTitles() {
    const startTime = performance.now();
    const memBefore = performance.memory?.usedJSHeapSize || 0;
    
    try {
      
      // TRUE lazy loading - use each() to prevent loading messages into memory
      const chatTitles = [];
      await db.chats
        .orderBy('updatedAt')
        .reverse()
        .limit(20) // Reduced from 50 to 20 for better mobile performance
        .each(chat => {
          // Only extract metadata - messages never loaded into memory
          chatTitles.push({
            id: chat.id,
            title: chat.title,
            updatedAt: chat.updatedAt,
            messageCount: chat.messageCount,
            createdAt: chat.createdAt
            // messages are NEVER touched - true lazy loading
          });
        });
      
      const duration = Math.round(performance.now() - startTime);
      const memAfter = performance.memory?.usedJSHeapSize || 0;
      const memDelta = Math.round((memAfter - memBefore) / 1024 / 1024);
      
      
      return chatTitles;
      
    } catch (error) {
      console.error(`❌ [CHAT-DB-V1] Error loading chat titles:`, error);
      return [];
    }
  },

  // 📊 Get database stats
  async getStats() {
    try {
      const chatCount = await db.chats.count();
      const totalSize = await db.chats.toArray().then(chats => 
        chats.reduce((size, chat) => size + JSON.stringify(chat).length, 0)
      );
      
      return {
        chatCount,
        totalSize: Math.round(totalSize / 1024) + ' KB'
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return { chatCount: 0, totalSize: '0 KB' };
    }
  },

  // 🧹 Clear all data from IndexedDB (for logout)
  async clearAllData() {
    try {
      console.log('🧹 [CHAT-DB] Clearing all IndexedDB data for logout...');
      
      // Clear both tables in a transaction
      await db.transaction('rw', db.chats, db.messages, async () => {
        await db.chats.clear();
        await db.messages.clear();
      });
      
      // Also clear any localStorage items related to sync timestamps
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lastSync_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ [CHAT-DB] All IndexedDB data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ [CHAT-DB] Error clearing IndexedDB:', error);
      return false;
    }
  }
};

// 🐛 DEVELOPMENT DEBUGGING HELPERS
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.omniaDB = {
    async showStats() {
      const stats = await chatDB.getStats();
      const messageCount = await db.messages.count();
      console.table([{
        'Chat Count': stats.chatCount,
        'Message Count': messageCount,
        'Total Size': stats.totalSize,
        'Database': 'IndexedDB (OmniaChatDB V2)'
      }]);
      return { ...stats, messageCount };
    },
    
    async showAllChats() {
      const chats = await chatDB.getAllChats();
      const chatSummary = chats.map(c => ({
        ID: c.id.substring(0, 12) + '...',
        Title: c.title.substring(0, 30) + (c.title.length > 30 ? '...' : ''),
        Messages: c.messageCount,
        Created: new Date(c.createdAt).toLocaleString('cs-CZ'),
        Updated: new Date(c.updatedAt).toLocaleString('cs-CZ')
      }));
      console.table(chatSummary);
      return chats;
    },
    
    async clearAll() {
      const confirmed = confirm('🚨 Really delete ALL chat history? This cannot be undone!');
      if (confirmed) {
        await db.chats.clear();
        await db.messages.clear();
        return true;
      }
      return false;
    },
    
    // V1 Test (old way)
    async saveTestChatV1() {
      const testMessages = [
        { sender: 'user', text: 'Test user message V1' },
        { sender: 'bot', text: 'Test AI response V1' }
      ];
      const chatId = chatDB.generateChatId();
      await chatDB.saveChat(chatId, testMessages);
      return chatId;
    },
    
    // V2 Test (new way)
    async saveTestChatV2() {
      const chatId = chatDB.generateChatId();
      
      // Save messages individually
      await chatDB.saveMessage(chatId, { sender: 'user', text: 'Test user message V2' });
      await chatDB.saveMessage(chatId, { sender: 'bot', text: 'Test AI response V2' });
      
      return chatId;
    },
    
    // Compare V1 vs V2 performance
    async comparePerformance() {
      
      const messages = Array.from({ length: 100 }, (_, i) => ({
        sender: i % 2 === 0 ? 'user' : 'bot',
        text: `Test message ${i + 1} with some content to make it realistic`,
        timestamp: Date.now() - (100 - i) * 1000
      }));
      
      // Test V1
      const startV1 = performance.now();
      const chatIdV1 = chatDB.generateChatId();
      await chatDB.saveChat(chatIdV1, messages);
      const durationV1 = Math.round(performance.now() - startV1);
      
      // Test V2
      const startV2 = performance.now();
      const chatIdV2 = chatDB.generateChatId();
      for (const message of messages) {
        await chatDB.saveMessage(chatIdV2, message);
      }
      const durationV2 = Math.round(performance.now() - startV2);
      
      console.table([
        { Version: 'V1 (Monolithic)', Duration: `${durationV1}ms`, ChatId: chatIdV1 },
        { Version: 'V2 (Normalized)', Duration: `${durationV2}ms`, ChatId: chatIdV2 }
      ]);
      
      return { v1: durationV1, v2: durationV2, chatIdV1, chatIdV2 };
    }
  };
  
  // Development debugging available in omniaDB object
}

export default chatDB;