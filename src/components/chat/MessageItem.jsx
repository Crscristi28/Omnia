// 🎨 MessageItem.jsx - Individual message rendering component
// ✅ Extracted from App.jsx to reduce file size and improve maintainability

import React from 'react';

// Import components that are used in message rendering
import MessageRenderer from '../MessageRenderer';
import { SourcesButton } from '../sources';
import { VoiceButton, CopyButton, ChatOmniaLogo } from '../ui';

// Import utilities
import { detectLanguage } from '../../utils/text';
import { getViewerType } from '../../utils/fileTypeUtils';

// Import styles
import * as styles from '../../styles/ChatStyles.js';

const MessageItem = React.forwardRef(({ 
  msg, 
  index, 
  onPreviewImage, 
  onDocumentView, 
  onSourcesClick, 
  onAudioStateChange 
}, ref) => {
  // Extract styles from ChatStyles.js
  const { 
    userMessageContainerStyle, 
    botMessageContainerStyle,
    loadingContainerStyle,
    loadingBoxStyle,
    userContainerStyle,
    userBubbleStyle,
    botContainerStyle,
    botHeaderStyle,
    botNameStyle,
    loadingAnimationContainerStyle,
    loadingSpinnerStyle,
    loadingTextStyleStreaming,
    loadingTextStyleNormal,
    loadingDotsContainerStyle,
    loadingDotStyle,
    loadingDot2Style,
    loadingDot3Style,
    imageStyle,
    userAttachmentsContainerStyle,
    userAttachmentWrapperStyle
  } = styles;

  return (
    <div 
      ref={ref}
      key={msg.id || `fallback_${index}`} 
      data-sender={msg.sender}
      style={msg.sender === 'user' ? userMessageContainerStyle : botMessageContainerStyle}
    >
      {/* Special rendering for loading indicator */}
      {msg.isLoading ? (
        <div style={loadingContainerStyle}>
          <div style={loadingBoxStyle}>
            <div style={loadingAnimationContainerStyle}>
              <div style={loadingSpinnerStyle}></div>
              <span style={msg.isStreaming ? loadingTextStyleStreaming : loadingTextStyleNormal}>
                {msg.isStreaming ? (
                  <span style={loadingDotsContainerStyle}>
                    <span style={loadingDotStyle}>●</span>
                    <span style={loadingDot2Style}>●</span>
                    <span style={loadingDot3Style}>●</span>
                  </span>
                ) : msg.text}
              </span>
            </div>
          </div>
        </div>
      ) : msg.sender === 'user' ? (
        <div style={userContainerStyle}>
          {/* User text bubble */}
          {msg.text && (
            <div style={userBubbleStyle}>
              <MessageRenderer 
                content={msg.text || ''}
                className="user-message-content"
              />
            </div>
          )}
          
          {/* File attachments - separate display for generated vs uploaded */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="hide-scrollbar" style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              width: '100%',
              paddingTop: '1rem',
              overflowX: 'auto',
              overflowY: 'hidden'
            }}>
              {msg.attachments.map((attachment, index) => {
                // Generated images display as large standalone images
                if (attachment.isGenerated && attachment.type && attachment.type.startsWith('image/')) {
                  return (
                    <div
                      key={index}
                      style={userAttachmentWrapperStyle}
                    >
                      <img 
                        src={attachment.previewUrl || attachment.storageUrl || attachment.base64}
                        alt={attachment.name}
                        onClick={() => {
                          onPreviewImage({
                            url: attachment.previewUrl || attachment.storageUrl || attachment.base64,
                            name: attachment.name
                          });
                        }}
                        style={imageStyle}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.02) translateZ(0)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1) translateZ(0)';
                        }}
                        onLoad={() => {
                          // Image loaded - scroll handled by useEffect
                        }}
                      />
                    </div>
                  );
                }
                
                // Upload attachments - smart viewer selection
                const viewerType = getViewerType(attachment.type, attachment.name);
                const isImage = attachment.type && attachment.type.startsWith('image/');
                
                return (
                <div
                  key={index}
                  onClick={() => {
                    // Route to appropriate viewer based on file type
                    if (viewerType === 'image') {
                      onPreviewImage({
                        url: attachment.previewUrl || attachment.storageUrl || attachment.base64,
                        name: attachment.name
                      });
                    } else {
                      onDocumentView({
                        isOpen: true,
                        document: {
                          url: attachment.previewUrl || attachment.storageUrl || attachment.base64,
                          name: attachment.name,
                          mimeType: attachment.type,
                          base64: attachment.base64
                        }
                      });
                    }
                  }}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: 'white',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isImage ? (
                    /* Image thumbnail */
                    <img 
                      src={attachment.previewUrl || attachment.storageUrl || attachment.base64}
                      alt={attachment.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    /* Document preview */
                    <>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '12px',
                        textAlign: 'center',
                        padding: '8px',
                        wordBreak: 'break-word',
                        lineHeight: '1.2',
                        maxHeight: '60%',
                        overflow: 'hidden',
                      }}>
                        {attachment.name}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '0',
                        right: '0',
                        textAlign: 'center',
                        fontSize: '10px',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        {attachment.size && typeof attachment.size === 'number' && !isNaN(attachment.size) 
                          ? attachment.size < 1024 
                            ? `${attachment.size}B`
                            : attachment.size < 1024 * 1024
                            ? `${Math.round(attachment.size / 1024)}KB`
                            : `${(attachment.size / (1024 * 1024)).toFixed(1)}MB`
                          : 'File'}
                      </div>
                    </>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div 
          className="p-4"
          style={botContainerStyle}>
          <div style={botHeaderStyle}>
            <span style={botNameStyle}>
              <ChatOmniaLogo size={18} />
              Omnia {msg.isStreaming ? ' • streaming' : ''}
            </span>
          </div>
          
          {/* 🎨 GENERATED IMAGE - Display if message contains image */}
          {msg.image && (
            <div style={{
              paddingTop: '1rem',
              paddingBottom: '1rem',
              borderRadius: '12px',
              overflow: 'hidden',
              maxWidth: '100%'
            }}>
              <img 
                src={msg.image.storageUrl || (msg.image.base64 ? `data:${msg.image.mimeType};base64,${msg.image.base64}` : msg.image)}
                alt={`Generated image for: ${msg.text}`}
                onClick={() => {
                  const imageUrl = msg.image.storageUrl || (msg.image.base64 ? `data:${msg.image.mimeType};base64,${msg.image.base64}` : msg.image);
                  onPreviewImage({
                    url: imageUrl,
                    name: `Generated: ${msg.text.slice(0, 30)}...`
                  });
                }}
                style={imageStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02) translateZ(0)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) translateZ(0)';
                }}
                onLoad={() => {
                  // Image loaded - scroll handled by useEffect
                }}
              />
            </div>
          )}
          
          <MessageRenderer 
            content={msg.text || ''}
            className="text-white"
          />
          
          {/* 🔘 ACTION BUTTONS - Always reserve space to prevent Virtuoso height jumping */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            paddingTop: '1.5rem',
            justifyContent: 'flex-start',
            opacity: msg.isStreaming ? 0 : 1,
            pointerEvents: msg.isStreaming ? 'none' : 'auto',
            transition: 'opacity 0.3s ease'
          }}>
            <SourcesButton 
              sources={msg.sources || []}
              onClick={() => onSourcesClick(msg.sources || [])}
              language={detectLanguage(msg.text)}
            />
            <VoiceButton 
              text={msg.text} 
              onAudioStart={() => onAudioStateChange(true)}
              onAudioEnd={() => onAudioStateChange(false)}
            />
            <CopyButton text={msg.text} language={detectLanguage(msg.text)} />
          </div>
        </div>
      )}
    </div>
  );
});

// Set displayName for better debugging
MessageItem.displayName = 'MessageItem';

export default MessageItem;