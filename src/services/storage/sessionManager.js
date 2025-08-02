// 🔧 SESSION MANAGEMENT - Simplified for UI settings only
// Handles localStorage and sessionStorage for basic app persistence
// 📝 Chat History moved to chatDB.js (IndexedDB) for better performance

const sessionManager = {
  // 🗑️ Clear current session data
  clearSession() {
    sessionStorage.removeItem('omnia-session-id');
    console.log('🗑️ Session cleared completely');
  },

  // 🌍 UI Language preference
  saveUILanguage(language) {
    localStorage.setItem('omnia-ui-language', language);
  },

  getUILanguage() {
    return localStorage.getItem('omnia-ui-language') || 'cs';
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