// 🔧 SESSION MANAGEMENT - Simplified for UI settings only
// Handles localStorage and sessionStorage for basic app persistence
// 📝 Chat History moved to chatDB.js (IndexedDB) for better performance

const sessionManager = {
  // 🆕 Basic session management
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

  // 🗑️ Clear current session data
  clearSession() {
    sessionStorage.removeItem('omnia-session-id');
    localStorage.removeItem('omnia-memory');
    console.log('🗑️ Session cleared completely');
  },

  // 💾 Save current session messages (temporary, not persistent history)
  saveMessages(messages) {
    try {
      const data = JSON.stringify(messages);
      if (data.length > 4 * 1024 * 1024) { // 4MB limit
        console.warn('⚠️ [MONITOR] Message data too large, truncating');
        const truncated = messages.slice(-20); // Keep last 20 messages
        localStorage.setItem('omnia-memory', JSON.stringify(truncated));
      } else {
        localStorage.setItem('omnia-memory', data);
      }
      console.log(`💾 [MONITOR] Saved ${messages.length} messages to localStorage`);
    } catch (error) {
      console.error('❌ [MONITOR] Failed to save messages:', error);
    }
  },

  // 🌍 UI Language preference
  saveUILanguage(language) {
    localStorage.setItem('omnia-ui-language', language);
  },

  getUILanguage() {
    return localStorage.getItem('omnia-ui-language') || 'cs';
  },

  // 🎤 Voice mode preference
  saveVoiceMode(enabled) {
    localStorage.setItem('omnia-voice-mode', enabled.toString());
  },

  getVoiceMode() {
    return localStorage.getItem('omnia-voice-mode') === 'true';
  },

  // 🤖 Selected AI model preference
  saveSelectedModel(model) {
    localStorage.setItem('omnia-selected-model', model);
  },

  getSelectedModel() {
    return localStorage.getItem('omnia-selected-model');
  },

  // 💾 Save current chat ID for recovery
  saveCurrentChatId(chatId) {
    try {
      sessionStorage.setItem('omnia-current-chat-id', chatId);
      console.log('💾 [MONITOR] Current chat ID saved to session');
    } catch (error) {
      console.error('❌ [MONITOR] Failed to save chat ID:', error);
    }
  },

  // 📖 Get current chat ID
  getCurrentChatId() {
    try {
      return sessionStorage.getItem('omnia-current-chat-id');
    } catch (error) {
      console.error('❌ [MONITOR] Failed to get chat ID:', error);
      return null;
    }
  }

  // ❌ REMOVED: All chat history methods moved to chatDB.js
  // - saveChatHistory() → chatDB.saveChat()
  // - getAllChatHistories() → chatDB.getAllChats()
  // - getChatHistory() → chatDB.getChat()
  // - deleteChatHistory() → chatDB.deleteChat()
  // - generateChatTitle() → chatDB.generateChatTitle()
  // - generateChatId() → chatDB.generateChatId()
};

export default sessionManager;