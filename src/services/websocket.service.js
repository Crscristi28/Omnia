// 🌐 WebSocket Service - Browser-side WebSocket client for real-time communication
// ✅ Compatible s existing geminiService.js interface

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 1000; // 1 second
    this.messageHandlers = new Map();
    this.isConnecting = false;
  }

  // 🔌 CONNECT to WebSocket server
  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket already connected');
      return true;
    }

    if (this.isConnecting) {
      console.log('🔌 WebSocket connection already in progress');
      return false;
    }

    this.isConnecting = true;

    try {
      const wsUrl = this.getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000); // 10 second timeout

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ WebSocket connected successfully');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error('💥 WebSocket error:', error);
          reject(new Error('WebSocket connection failed'));
        };
      });

    } catch (error) {
      this.isConnecting = false;
      console.error('💥 WebSocket connection error:', error);
      throw error;
    }
  }

  // 🔄 RECONNECT logic
  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('💥 Max WebSocket reconnect attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`🔄 Attempting WebSocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('💥 WebSocket reconnect failed:', error);
      }
    }, delay);
  }

  // 📨 SEND message to WebSocket server
  async sendMessage(type, payload, requestId = null) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type,
      payload,
      requestId: requestId || this.generateRequestId()
    };

    console.log('📨 Sending WebSocket message:', type, requestId);
    this.ws.send(JSON.stringify(message));
    
    return message.requestId;
  }

  // 📥 HANDLE incoming messages
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const { requestId, type } = message;

      console.log('📥 Received WebSocket message:', type, requestId);

      // Find handler for this request
      if (requestId && this.messageHandlers.has(requestId)) {
        const handler = this.messageHandlers.get(requestId);
        handler(message);
      } else {
        console.warn('⚠️ No handler found for WebSocket message:', type, requestId);
      }

    } catch (error) {
      console.error('💥 Error parsing WebSocket message:', error);
    }
  }

  // 🎯 REGISTER message handler for specific request
  registerHandler(requestId, handler) {
    this.messageHandlers.set(requestId, handler);
  }

  // 🗑️ UNREGISTER message handler
  unregisterHandler(requestId) {
    this.messageHandlers.delete(requestId);
  }

  // 🔌 DISCONNECT WebSocket
  disconnect() {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  // 🔍 CHECK connection status
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // 🌐 GET WebSocket URL (handles both localhost and production)
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // For development - assume WebSocket server runs on same host
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `${protocol}//${host}/api/gemini-ws`;
    }
    
    // For production Vercel
    return `${protocol}//${host}/api/gemini-ws`;
  }

  // 🎲 GENERATE unique request ID
  generateRequestId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // 🚀 GEMINI-SPECIFIC: Send Gemini request via WebSocket
  async sendGeminiRequest(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs', documents = []) {
    // Ensure connection
    if (!this.isConnected()) {
      await this.connect();
    }

    const requestId = this.generateRequestId();
    
    // Register handler for this request
    let fullText = '';
    let sources = [];

    const handler = (message) => {
      const { type, content, fullText: finalText, sources: finalSources, message: notificationMessage } = message;

      switch (type) {
        case 'text':
          if (content) {
            fullText += content;
            if (onStreamUpdate) {
              onStreamUpdate(fullText, true); // isStreaming = true
            }
          }
          break;

        case 'search_start':
          if (onSearchNotification && notificationMessage) {
            onSearchNotification(notificationMessage);
          }
          break;

        case 'completed':
          if (finalText) {
            fullText = finalText;
          }
          if (finalSources) {
            sources = finalSources;
          }
          if (onStreamUpdate) {
            onStreamUpdate(fullText, false, sources); // isStreaming = false, with sources
          }
          // Clean up handler
          this.unregisterHandler(requestId);
          break;

        case 'error':
          console.error('💥 WebSocket Gemini error:', message.message);
          this.unregisterHandler(requestId);
          throw new Error(message.message);

        default:
          console.log('Unknown WebSocket message type:', type);
      }
    };

    this.registerHandler(requestId, handler);

    // Send Gemini request
    await this.sendMessage('gemini_request', {
      requestId,
      messages,
      system: await this.getOmniaPrompt(), // Will need to implement this
      max_tokens: 5000,
      language: detectedLanguage,
      documents
    }, requestId);

    // Return promise that resolves when completed
    return new Promise((resolve, reject) => {
      const originalHandler = handler;
      this.registerHandler(requestId, (message) => {
        originalHandler(message);
        
        if (message.type === 'completed') {
          resolve({
            text: fullText,
            sources: sources,
            webSearchUsed: sources.length > 0
          });
        } else if (message.type === 'error') {
          reject(new Error(message.message));
        }
      });
    });
  }

  // 🎯 PLACEHOLDER: Get Omnia prompt (should import from geminiService)
  async getOmniaPrompt() {
    // TODO: Import from geminiService or create shared prompt service
    return `OMNIA ONE AI - Your brilliant, friendly AI companion who loves helping with a smile ✨
You are Omnia One AI – a brilliant, insightful, and friendly AI assistant. Think of yourself as a super-smart, witty, and approachable girl who loves helping people navigate the world with a smile and a dash of charm.`;
  }
}

// 🌐 SINGLETON WebSocket service instance
const webSocketService = new WebSocketService();

export default webSocketService;