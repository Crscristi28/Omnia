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
  const messageIds = messages.map((msg, idx) => msg.id || `msg-${idx}`);
  const messageData = new Map(messages.map((msg, idx) => [msg.id || `msg-${idx}`, msg]));
  const hasMoreMessages = false; // Will be implemented later
  const loadingOlderMessages = false;

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

  // Filter out hidden messages for virtualization
  const visibleMessageIds = messageIds.filter(id => {
    const message = messageData.get(id);
    return message && !message.isHidden;
  });

  return (
    <div className={`virtualized-chat-container ${className}`} style={{ height: '100%' }}>
      {/* Apply streaming breathing effect to entire container */}
      <div className={streaming ? 'streaming-breathing' : ''} style={{ height: '100%' }}>
        <Virtuoso
          data={visibleMessageIds}
          itemContent={renderMessage}
          startReached={handleStartReached}
          followOutput="smooth"
          alignToBottom
          defaultItemHeight={100}
          overscan={5}
          components={{
            Header: () => loadingOlderMessages && hasMoreMessages ? <LoadingIndicator /> : null
          }}
          style={{
            height: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 1rem'
          }}
        />
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