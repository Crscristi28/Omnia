import React, { forwardRef, useCallback, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useChatMessages } from '../../hooks/useChatMessages';
import ChatMessage from './ChatMessage';

/**
 * VirtualizedChatContainer - High-performance chat container using React Virtuoso
 * Renders only visible messages for optimal memory usage and smooth scrolling
 */
const VirtualizedChatContainer = forwardRef(({
  chatId,
  messages = [], // Use messages from App.jsx state
  streaming,
  isMobile,
  onImageClick,
  onCopy,
  onShare,
  scrollContainer,
  className = ''
}, ref) => {
  // For now, use the passed messages directly instead of the hook
  // TODO: Eventually migrate fully to hook-based approach
  
  // 🔍 STEP 1: Comprehensive debug logging
  console.log('🎯 [VIRTUOSO] VirtualizedChatContainer received:', {
    chatId,
    messagesCount: messages.length,
    messages: messages.slice(0, 3), // Show first 3 messages for debugging
    streaming
  });
  
  // 🔧 STEP 3: Fix ID generation consistency 
  const messagesWithIds = messages.map((msg, idx) => ({
    ...msg,
    id: msg.id || `msg_${idx}_${Date.now()}`
  }));
  
  const messageIds = messagesWithIds.map(msg => msg.id);
  const messageData = new Map(messagesWithIds.map(msg => [msg.id, msg]));
  const hasMoreMessages = false; // Will be implemented later
  const loadingOlderMessages = false;
  
  // 📋 COMPREHENSIVE DEBUG: Log everything
  console.log('📋 [VIRTUOSO] FULL DEBUG:', {
    originalMessages: messages,
    messagesWithIds: messagesWithIds,
    messageIds: messageIds,
    messageDataSize: messageData.size,
    isHiddenValues: messages.map(m => ({ sender: m.sender, isHidden: m.isHidden, hasId: !!m.id })),
    firstMessageData: messageData.get(messageIds[0])
  });

  // Loading indicator component
  const LoadingIndicator = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      gap: '0.5rem'
    }}>
      <div style={{
        width: '16px',
        height: '16px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #666',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <span style={{ color: '#a0aec0' }}>Načítám starší zprávy...</span>
    </div>
  );

  // Message item renderer
  const renderMessage = useCallback((index, messageId) => {
    const message = messageData.get(messageId);
    
    // If message data not loaded yet, show placeholder
    if (!message) {
      return (
        <div key={messageId} style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5
        }}>
          Loading message...
        </div>
      );
    }

    // Skip hidden messages
    if (message.isHidden) {
      return null;
    }

    return (
      <div
        key={messageId}
        style={{
          animation: 'fadeInUp 0.4s ease-out',
          marginBottom: '2rem'
        }}
      >
        <ChatMessage
          message={message}
          isMobile={isMobile}
          onImageClick={onImageClick}
          onCopy={onCopy}
          onShare={onShare}
        />
      </div>
    );
  }, [messageData, isMobile, onImageClick, onCopy, onShare]);

  // Start reached callback for loading older messages (simplified for now)
  const handleStartReached = useCallback(() => {
    // TODO: Implement with proper hook integration
    console.log('📜 [VIRTUOSO] Start reached - older messages loading disabled temporarily');
  }, []);

  // Expose basic methods to parent component via ref
  React.useImperativeHandle(ref, () => ({
    getMessageCount: () => messageIds.length,
    getCachedMessageCount: () => messageData.size
  }), [messageIds.length, messageData.size]);

  // 🔧 STEP 2: Fix hidden message filter condition
  const visibleMessageIds = messageIds.filter(id => {
    const message = messageData.get(id);
    const isVisible = message && message.isHidden !== true; // ✅ FIXED: explicit check
    console.log('🔍 [FILTER DEBUG]:', { id, hasMessage: !!message, isHidden: message?.isHidden, isVisible });
    return isVisible;
  });
  
  console.log('📊 [VIRTUOSO] FILTER RESULTS:', {
    totalIds: messageIds.length,
    visibleIds: visibleMessageIds.length,
    visibleMessageIds: visibleMessageIds
  });

  return (
    <div className={`virtualized-chat-container ${className}`} style={{ height: '100%' }}>
      {/* 🧪 TEMPORARY: Bypass Virtuoso for testing */}
      <div className={streaming ? 'streaming-breathing' : ''} style={{ 
        height: '100%', 
        overflowY: 'auto',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* 🔬 DIRECT RENDERING TEST - Skip Virtuoso */}
        {visibleMessageIds.map((messageId, index) => {
          const message = messageData.get(messageId);
          console.log('🧪 [DIRECT RENDER]:', { messageId, message });
          
          if (!message) {
            return (
              <div key={messageId} style={{ color: 'red', padding: '1rem' }}>
                ❌ Missing message data for ID: {messageId}
              </div>
            );
          }

          return (
            <div
              key={messageId}
              style={{
                animation: 'fadeInUp 0.4s ease-out',
                marginBottom: '2rem',
                border: '1px solid lime', // 🔍 DEBUG: Green border to see if rendered
                padding: '0.5rem'
              }}
            >
              <div style={{ color: 'cyan', fontSize: '12px', marginBottom: '0.5rem' }}>
                🧪 DEBUG: ID={messageId}, sender={message.sender}
              </div>
              <ChatMessage
                message={message}
                isMobile={isMobile}
                onImageClick={onImageClick}
                onSourcesClick={onSourcesClick}
                onAudioStart={onAudioStart}
                onAudioEnd={onAudioEnd}
                onLongPress={onLongPress}
                scrollContainer={scrollContainer}
              />
            </div>
          );
        })}
        
        <div style={{ color: 'yellow', padding: '1rem', border: '1px solid yellow' }}>
          🧪 RENDER TEST: {visibleMessageIds.length} messages rendered
        </div>
      </div>

      {/* Preserve CSS animations */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px) translateZ(0); }
          100% { opacity: 1; transform: translateY(0) translateZ(0); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .streaming-breathing {
          animation: breathe 3s ease-in-out infinite;
        }
        
        @keyframes breathe {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 1; }
        }
        
        .virtualized-chat-container {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
});

VirtualizedChatContainer.displayName = 'VirtualizedChatContainer';

export default VirtualizedChatContainer;