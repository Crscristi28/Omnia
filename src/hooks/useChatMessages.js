import { useState, useEffect, useCallback, useRef } from 'react';
import chatDB from '../services/storage/chatDB';

/**
 * Custom hook for managing chat messages with virtualization
 * Handles message loading, caching, and state management for virtualized chat
 */
export const useChatMessages = (chatId) => {
  // Virtualization state
  const [messageIds, setMessageIds] = useState([]);
  const [messageData, setMessageData] = useState(new Map());
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  
  // Refs for stable references
  const currentStreamingId = useRef(null);
  const cacheSize = useRef(0);
  const maxCacheSize = 100; // Keep max 100 messages in cache

  // Load initial chat messages
  const loadChat = useCallback(async (chatId) => {
    if (!chatId) {
      setMessageIds([]);
      setMessageData(new Map());
      return;
    }

    try {
      console.log(`🎯 [VIRTUALIZATION] Loading chat: ${chatId}`);
      
      // Get all message IDs for this chat
      const allIds = await chatDB.getMessageIds(chatId);
      setMessageIds(allIds);
      
      // Load the most recent 20 messages data
      const recentIds = allIds.slice(-20);
      const recentMessages = await chatDB.getMessagesByIds(recentIds);
      
      // Create message data map
      const dataMap = new Map();
      recentMessages.forEach(msg => {
        dataMap.set(msg.id, msg);
      });
      
      setMessageData(dataMap);
      setHasMoreMessages(allIds.length > 20);
      cacheSize.current = recentMessages.length;
      
      console.log(`✅ [VIRTUALIZATION] Chat loaded: ${allIds.length} total, ${recentMessages.length} cached`);
    } catch (error) {
      console.error('❌ [VIRTUALIZATION] Failed to load chat:', error);
    }
  }, []);

  // Load older messages when scrolling to top
  const loadOlderMessages = useCallback(async () => {
    if (!chatId || loadingOlderMessages || !hasMoreMessages) return;
    
    setLoadingOlderMessages(true);
    
    try {
      // Find the oldest message ID we don't have data for
      const uncachedIds = messageIds.filter(id => !messageData.has(id));
      const oldestUncachedIds = uncachedIds.slice(0, 20); // Load 20 more
      
      if (oldestUncachedIds.length === 0) {
        setHasMoreMessages(false);
        return;
      }
      
      const olderMessages = await chatDB.getMessagesByIds(oldestUncachedIds);
      
      setMessageData(prevData => {
        const newData = new Map(prevData);
        olderMessages.forEach(msg => {
          newData.set(msg.id, msg);
        });
        return newData;
      });
      
      cacheSize.current += olderMessages.length;
      
      // Cleanup cache if it's getting too large
      if (cacheSize.current > maxCacheSize) {
        cleanupCache();
      }
      
      console.log(`✅ [VIRTUALIZATION] Loaded ${olderMessages.length} older messages`);
    } catch (error) {
      console.error('❌ [VIRTUALIZATION] Failed to load older messages:', error);
    } finally {
      setLoadingOlderMessages(false);
    }
  }, [chatId, messageIds, messageData, loadingOlderMessages, hasMoreMessages]);

  // Smart cache cleanup - keep visible messages and recent messages
  const cleanupCache = useCallback(() => {
    const recentIds = messageIds.slice(-50); // Keep 50 most recent
    
    setMessageData(prevData => {
      const newData = new Map();
      recentIds.forEach(id => {
        if (prevData.has(id)) {
          newData.set(id, prevData.get(id));
        }
      });
      return newData;
    });
    
    cacheSize.current = recentIds.filter(id => messageData.has(id)).length;
    console.log(`🧹 [VIRTUALIZATION] Cache cleaned, kept ${cacheSize.current} messages`);
  }, [messageIds, messageData]);

  // Add new message (user or AI)
  const addMessage = useCallback(async (message) => {
    if (!chatId) return;
    
    // Generate ID if not provided
    const messageWithId = {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: message.timestamp || Date.now()
    };
    
    // Add to state
    setMessageIds(prev => [...prev, messageWithId.id]);
    setMessageData(prev => new Map([...prev, [messageWithId.id, messageWithId]]));
    
    console.log(`➕ [VIRTUALIZATION] Added message: ${messageWithId.id}`);
    return messageWithId.id;
  }, [chatId]);

  // Update streaming message (for real-time AI responses)
  const updateStreamingMessage = useCallback((messageId, updates) => {
    setMessageData(prev => {
      const newData = new Map(prev);
      const existingMessage = newData.get(messageId);
      
      if (existingMessage) {
        newData.set(messageId, { ...existingMessage, ...updates });
      }
      
      return newData;
    });
  }, []);

  // Start streaming for a new AI message
  const startStreaming = useCallback(async (initialMessage) => {
    const messageId = await addMessage({ ...initialMessage, isStreaming: true });
    currentStreamingId.current = messageId;
    return messageId;
  }, [addMessage]);

  // Update streaming content
  const updateStreamingContent = useCallback((text, sources = []) => {
    if (currentStreamingId.current) {
      updateStreamingMessage(currentStreamingId.current, {
        text,
        sources,
        isStreaming: true
      });
    }
  }, [updateStreamingMessage]);

  // Finish streaming
  const finishStreaming = useCallback(() => {
    if (currentStreamingId.current) {
      updateStreamingMessage(currentStreamingId.current, {
        isStreaming: false
      });
      currentStreamingId.current = null;
    }
  }, [updateStreamingMessage]);

  // Load chat when chatId changes
  useEffect(() => {
    loadChat(chatId);
  }, [chatId, loadChat]);

  return {
    // State
    messageIds,
    messageData,
    hasMoreMessages,
    loadingOlderMessages,
    
    // Actions
    loadOlderMessages,
    addMessage,
    updateStreamingMessage,
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    
    // Utilities
    getCurrentStreamingId: () => currentStreamingId.current,
    getCacheSize: () => cacheSize.current
  };
};