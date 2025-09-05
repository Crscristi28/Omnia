/**
 * 📜 Scroll Utilities
 * 
 * Helper functions for managing Virtuoso scroll behavior
 * Used for scrolling to specific messages and managing scroll state
 */

// 🔼 SCROLL TO SPECIFIC USER MESSAGE - ONLY called when user sends message
export const scrollToUserMessageAt = (virtuosoRef, userMessageIndex) => {
  if (virtuosoRef.current && userMessageIndex >= 0) {
    console.log(`🔼 Scrolling to user message at index: ${userMessageIndex}`);
    
    virtuosoRef.current.scrollToIndex({
      index: userMessageIndex,
      align: 'start'
    });
  }
};

// 🔼 SCROLL TO LATEST MESSAGE - Show latest message at TOP of viewport (legacy)
export const scrollToLatestMessage = (virtuosoRef, messages) => {
  if (virtuosoRef.current && messages.length > 0) {
    const latestMessageIndex = messages.length - 1; // Index poslední přidané zprávy
    
    console.log(`🔼 Scrolling to latest message at index: ${latestMessageIndex}`);
    
    virtuosoRef.current.scrollToIndex({
      index: latestMessageIndex, // Index poslední přidané zprávy
      align: 'start',
      behavior: 'smooth' // Pro plynulou animaci skrolování
    });
  } else if (virtuosoRef.current) {
    console.log('⚠️ No messages to scroll to');
  } else {
    console.log('❌ virtuosoRef.current is null in scrollToLatestMessage');
  }
};

// 🔼 SCROLL TO BOTTOM - For scroll button (use concrete index instead of 'LAST')
export const scrollToBottom = (virtuosoRef, messages = []) => {
  
  if (virtuosoRef.current) {
    const lastIndex = messages.length > 0 ? messages.length - 1 : 0;
    console.log(`🔼 [SCROLL-BOTTOM] Scrolling to concrete index: ${lastIndex}`);
    
    virtuosoRef.current.scrollToIndex({ 
      index: lastIndex, // ✅ Concrete number instead of 'LAST'
      behavior: 'smooth',
      align: 'end' // Ensure last message is fully visible
    });
  } else {
    console.log('❌ virtuosoRef.current is null in scrollToBottom');
  }
};

// 🎯 SMART SCROLL TO BOTTOM - With error handling and fallbacks (FIXED to use concrete indexes)
export const smartScrollToBottom = (virtuosoRef, messages = [], options = {}) => {
  const { 
    behavior = 'smooth',
    timeout = 100 
  } = options;

  try {
    if (virtuosoRef?.current) {
      const lastIndex = messages.length > 0 ? messages.length - 1 : 0;
      virtuosoRef.current.scrollToIndex({
        index: lastIndex, // ✅ Concrete number instead of 'LAST'
        behavior
      });
      console.log('✅ Smart scroll to bottom successful');
    } else {
      // Retry after timeout
      setTimeout(() => {
        if (virtuosoRef?.current) {
          const lastIndex = messages.length > 0 ? messages.length - 1 : 0;
          virtuosoRef.current.scrollToIndex({
            index: lastIndex, // ✅ Concrete number instead of 'LAST'
            behavior: 'auto' // Use auto behavior for retry
          });
          console.log('✅ Smart scroll retry successful');
        }
      }, timeout);
    }
  } catch (error) {
    console.error('❌ Smart scroll to bottom failed:', error);
  }
};

// 📐 CALCULATE USER MESSAGE INDEX - Find the index of a specific user message
export const calculateUserMessageIndex = (messages, messageId) => {
  return messages.findIndex(msg => msg.id === messageId);
};

// 🎯 SCROLL TO MESSAGE BY ID - Scroll to specific message by its ID
export const scrollToMessageById = (virtuosoRef, messages, messageId) => {
  const messageIndex = calculateUserMessageIndex(messages, messageId);
  if (messageIndex >= 0) {
    scrollToUserMessageAt(virtuosoRef, messageIndex);
    return true;
  }
  console.warn(`⚠️ Message with ID ${messageId} not found`);
  return false;
};