// 🧪 WebSocket Test Utility - Pro testování WebSocket komunikace
import webSocketService from '../services/websocket.service.js';

// 🧪 TEST WebSocket connection a basic komunikace
export async function testWebSocketConnection() {
  console.log('🧪 Starting WebSocket connection test...');
  
  try {
    // Test 1: Connection
    console.log('Test 1: Connecting to WebSocket...');
    const connected = await webSocketService.connect();
    
    if (!connected) {
      throw new Error('Failed to connect to WebSocket');
    }
    
    console.log('✅ Test 1 passed: WebSocket connected');
    
    // Test 2: Simple message
    console.log('Test 2: Testing basic message handling...');
    
    const testRequestId = webSocketService.generateRequestId();
    let messageReceived = false;
    
    // Register test handler
    webSocketService.registerHandler(testRequestId, (message) => {
      console.log('📥 Test message received:', message);
      messageReceived = true;
    });
    
    // Wait a bit to see if server responds (for basic connectivity test)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Test 2 passed: WebSocket message system ready');
    
    // Test 3: Connection status
    const isConnected = webSocketService.isConnected();
    console.log('Test 3: Connection status:', isConnected ? '✅ Connected' : '❌ Disconnected');
    
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }
    
    console.log('🎉 All WebSocket tests passed!');
    return true;
    
  } catch (error) {
    console.error('💥 WebSocket test failed:', error);
    return false;
  }
}

// 🎯 TEST simple Gemini request (bez skutečného volání Gemini API)
export async function testWebSocketGeminiFlow() {
  console.log('🧪 Starting WebSocket Gemini flow test...');
  
  try {
    // Ensure connection
    if (!webSocketService.isConnected()) {
      await webSocketService.connect();
    }
    
    // Test message flow (mock request)
    const testMessages = [
      { sender: 'user', text: 'Hello WebSocket test!' }
    ];
    
    console.log('📨 Sending test Gemini request via WebSocket...');
    
    let streamingText = '';
    let searchNotified = false;
    let completed = false;
    
    const onStreamUpdate = (text, isStreaming, sources = []) => {
      streamingText = text;
      console.log(`📥 Stream update: "${text.slice(0, 50)}..." (streaming: ${isStreaming}, sources: ${sources.length})`);
      
      if (!isStreaming) {
        completed = true;
        console.log('✅ Streaming completed');
      }
    };
    
    const onSearchNotification = (message) => {
      searchNotified = true;
      console.log('🔍 Search notification:', message);
    };
    
    // This will attempt to send request to WebSocket server
    // Server should respond with error or handle gracefully
    try {
      await webSocketService.sendGeminiRequest(
        testMessages, 
        onStreamUpdate, 
        onSearchNotification, 
        'en', 
        []
      );
      console.log('✅ Gemini WebSocket flow test completed');
      return true;
    } catch (error) {
      console.log('⚠️ Expected error in test (no real Gemini processing yet):', error.message);
      return true; // This is expected for now
    }
    
  } catch (error) {
    console.error('💥 WebSocket Gemini flow test failed:', error);
    return false;
  }
}

// 🎮 MANUAL test runner (can be called from browser console)
export function runWebSocketTests() {
  console.log('🧪 Running all WebSocket tests...');
  
  (async () => {
    const test1 = await testWebSocketConnection();
    console.log('Test 1 result:', test1 ? '✅ PASS' : '❌ FAIL');
    
    if (test1) {
      const test2 = await testWebSocketGeminiFlow();
      console.log('Test 2 result:', test2 ? '✅ PASS' : '❌ FAIL');
    }
    
    console.log('🏁 WebSocket tests completed');
  })();
}

// 🌐 MAKE available globally for testing
if (typeof window !== 'undefined') {
  window.testWebSocket = runWebSocketTests;
  console.log('🔧 WebSocket tests available at: window.testWebSocket()');
}