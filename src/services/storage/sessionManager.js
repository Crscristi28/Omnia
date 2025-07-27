// 🔧 SESSION MANAGEMENT - Extracted from App.jsx
// Handles localStorage and sessionStorage for conversation persistence
// 📚 Chat History Management - Multiple conversations support

const sessionManager = {
  initSession() {
    const sessionId = sessionStorage.getItem('omnia-session-id');
    const isNewSession = !sessionId;
    
    if (isNewSession) {
      const newSessionId = Date.now().toString();
      sessionStorage.setItem('omnia-session-id', newSessionId);
      localStorage.removeItem('omnia-memory');
      console.log('🆕 New OMNIA session started:', newSessionId);
      return { isNewSession: true, messages: [] };
    } else {
      const saved = localStorage.getItem('omnia-memory');
      if (saved) {
        try {
          const messages = JSON.parse(saved);
          console.log('📂 Loaded conversation history:', messages.length, 'messages');
          return { isNewSession: false, messages };
        } catch (error) {
          console.error('❌ Error loading saved messages:', error);
          localStorage.removeItem('omnia-memory');
          return { isNewSession: false, messages: [] };
        }
      }
      return { isNewSession: false, messages: [] };
    }
  },

  clearSession() {
    sessionStorage.removeItem('omnia-session-id');
    localStorage.removeItem('omnia-memory');
    console.log('🗑️ Session cleared completely');
  },

  saveMessages(messages) {
    try {
      localStorage.setItem('omnia-memory', JSON.stringify(messages));
      console.log('💾 Messages saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving messages:', error);
    }
  },

  // Save UI preferences
  saveUILanguage(language) {
    localStorage.setItem('omnia-ui-language', language);
  },

  getUILanguage() {
    return localStorage.getItem('omnia-ui-language') || 'cs';
  },

  saveVoiceMode(enabled) {
    localStorage.setItem('omnia-voice-mode', enabled.toString());
  },

  getVoiceMode() {
    return localStorage.getItem('omnia-voice-mode') === 'true';
  },

  // Save selected AI model
  saveSelectedModel(model) {
    localStorage.setItem('omnia-selected-model', model);
  },

  getSelectedModel() {
    return localStorage.getItem('omnia-selected-model');
  },

  // 📚 CHAT HISTORY MANAGEMENT
  // Save a chat conversation with metadata
  saveChatHistory(chatId, messages, title = null) {
    try {
      const chatData = {
        id: chatId,
        title: title || this.generateChatTitle(messages),
        messages: messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: messages.length
      };

      // Get existing chat histories
      const histories = this.getAllChatHistories();
      
      // Update or add this chat
      const existingIndex = histories.findIndex(chat => chat.id === chatId);
      if (existingIndex >= 0) {
        histories[existingIndex] = { ...histories[existingIndex], ...chatData, updatedAt: Date.now() };
      } else {
        histories.unshift(chatData); // Add to beginning (newest first)
      }

      // Keep only last 50 chats to avoid localStorage bloat
      const limitedHistories = histories.slice(0, 50);
      
      localStorage.setItem('omnia-chat-histories', JSON.stringify(limitedHistories));
      console.log('💾 Chat history saved:', chatId);
    } catch (error) {
      console.error('❌ Error saving chat history:', error);
    }
  },

  // Get all chat histories
  getAllChatHistories() {
    try {
      const saved = localStorage.getItem('omnia-chat-histories');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Error loading chat histories:', error);
      return [];
    }
  },

  // Get specific chat by ID
  getChatHistory(chatId) {
    const histories = this.getAllChatHistories();
    return histories.find(chat => chat.id === chatId);
  },

  // Delete a specific chat
  deleteChatHistory(chatId) {
    try {
      const histories = this.getAllChatHistories();
      const filtered = histories.filter(chat => chat.id !== chatId);
      localStorage.setItem('omnia-chat-histories', JSON.stringify(filtered));
      console.log('🗑️ Chat deleted:', chatId);
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
    }
  },

  // Generate chat title from first user message
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

  // Create new chat ID
  generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export default sessionManager;