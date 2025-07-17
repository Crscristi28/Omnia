// 🔧 SESSION MANAGEMENT - Extracted from App.jsx
// Handles localStorage and sessionStorage for conversation persistence

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
  }
};

export default sessionManager;