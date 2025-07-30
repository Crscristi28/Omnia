// 💾 CHAT DATABASE - IndexedDB with Dexie.js
// Handles chat history with asynchronous operations for better performance
// Replaces localStorage for chat data to prevent UI blocking

import Dexie from 'dexie';

// Initialize Dexie database
class ChatDatabase extends Dexie {
  constructor() {
    super('OmniaChatDB');
    
    // Define schema
    this.version(1).stores({
      // Chats table: stores individual chat conversations
      chats: 'id, title, createdAt, updatedAt, messageCount',
      // Settings could be added later if needed
      // settings: 'key, value'
    });
  }
}

// Create database instance
const db = new ChatDatabase();

// 📚 CHAT DATABASE SERVICE
const chatDB = {
  
  // 💾 Save a single chat (not all chats at once!)
  async saveChat(chatId, messages, title = null) {
    try {
      console.log(`💾 [MONITOR] Starting save for chat ${chatId}`);
      
      const chatData = {
        id: chatId,
        title: title || this.generateChatTitle(messages),
        messages: messages, // Full message array for this chat
        createdAt: Date.now(), // Will be updated if chat exists
        updatedAt: Date.now(),
        messageCount: messages.length
      };

      // Check if chat already exists to preserve createdAt
      const existingChat = await db.chats.get(chatId);
      if (existingChat) {
        chatData.createdAt = existingChat.createdAt; // Keep original creation time
      }

      // Save/update the chat
      await db.chats.put(chatData);
      
      console.log(`✅ [MONITOR] Chat saved successfully: ${chatId}`);
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
      
      console.log(`📋 Loaded ${chats.length} chats from IndexedDB`);
      return chats;
      
    } catch (error) {
      console.error('❌ Error loading chats from IndexedDB:', error);
      return [];
    }
  },

  // 📖 Get specific chat with full messages
  async getChat(chatId) {
    try {
      const chat = await db.chats.get(chatId);
      if (chat) {
        console.log(`📖 Loaded chat from IndexedDB:`, chatId);
        return chat;
      } else {
        console.warn(`⚠️ Chat not found in IndexedDB:`, chatId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting chat from IndexedDB:', error);
      return null;
    }
  },

  // 🗑️ Delete a specific chat
  async deleteChat(chatId) {
    try {
      await db.chats.delete(chatId);
      console.log('🗑️ Chat deleted from IndexedDB:', chatId);
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
      console.log('⚡ Chat metadata updated:', chatId);
      return true;
    } catch (error) {
      console.error('❌ Error updating chat metadata:', error);
      return false;
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
      console.log('🧹 All chats cleared from IndexedDB');
      return true;
    } catch (error) {
      console.error('❌ Error clearing chats:', error);
      return false;
    }
  },

  // 📋 Get chat titles only (fast loading)
  async getChatTitles() {
    try {
      const chats = await db.chats
        .orderBy('updatedAt')
        .reverse()
        .limit(50)
        .toArray();
      
      // Return metadata only
      return chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updatedAt,
        messageCount: chat.messageCount,
        createdAt: chat.createdAt
      }));
      
    } catch (error) {
      console.error('❌ [MONITOR] Error loading chat titles:', error);
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
  }
};

// 🐛 DEVELOPMENT DEBUGGING HELPERS
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.omniaDB = {
    async showStats() {
      const stats = await chatDB.getStats();
      console.table([{
        'Chat Count': stats.chatCount,
        'Total Size': stats.totalSize,
        'Database': 'IndexedDB (OmniaChatDB)'
      }]);
      return stats;
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
        await chatDB.clearAllChats();
        console.log('🧹 All chats cleared from IndexedDB');
        return true;
      }
      return false;
    },
    
    async saveTestChat() {
      const testMessages = [
        { sender: 'user', text: 'Test user message' },
        { sender: 'bot', text: 'Test AI response' }
      ];
      const chatId = chatDB.generateChatId();
      await chatDB.saveChat(chatId, testMessages);
      console.log('✅ Test chat saved:', chatId);
      return chatId;
    }
  };
  
  console.log('🐛 Development mode: IndexedDB debugging available');
  console.log('📋 Commands: omniaDB.showStats(), omniaDB.showAllChats(), omniaDB.clearAll(), omniaDB.saveTestChat()');
}

export default chatDB;