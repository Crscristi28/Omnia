import React from 'react';
import MessageRenderer from '../MessageRenderer';
import { SourcesButton } from '../sources';
import { ChatOmniaLogo, VoiceButton, CopyButton } from '../ui';
import { detectLanguage } from '../../utils/text';
import { smartScrollToBottom } from '../../utils/ui';

/**
 * ChatMessage - Individual message component with full styling preservation
 * Extracted from App.jsx to work with virtualization while maintaining all features
 */
const ChatMessage = ({ 
  message, 
  isMobile, 
  onImageClick, 
  onSourcesClick,
  onAudioStart,
  onAudioEnd,
  onLongPress,
  scrollContainer
}) => {
  const { sender, text, attachments, image, sources, isStreaming } = message;

  // User message rendering
  if (sender === 'user') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingLeft: isMobile ? '0' : '1rem',
        paddingRight: isMobile ? '0' : '1rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.8rem',
          width: '100%',
          paddingLeft: isMobile ? '5%' : '25%',
          paddingRight: isMobile ? '5%' : '0'
        }}>
          {/* User text bubble */}
          {text && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: isMobile ? '1.2rem 1.4rem' : '1.4rem 1.6rem',
              borderRadius: '25px 25px 8px 25px',
              fontSize: isMobile ? '1rem' : '0.95rem',
              lineHeight: isMobile ? '1.3' : '1.6', 
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}>
              <MessageRenderer 
                content={text}
                className="user-message-content"
              />
            </div>
          )}
          
          {/* File attachments */}
          {attachments && attachments.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              width: '100%'
            }}>
              {attachments.map((attachment, index) => {
                // Generated images display as large standalone images
                if (attachment.isGenerated && attachment.type && attachment.type.startsWith('image/')) {
                  return (
                    <div
                      key={index}
                      style={{
                        marginTop: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        maxWidth: '100%'
                      }}
                    >
                      <img 
                        src={attachment.base64}
                        alt={attachment.name}
                        onClick={() => {
                          onImageClick?.({
                            url: attachment.base64,
                            name: attachment.name
                          });
                        }}
                        style={{
                          maxWidth: isMobile ? '280px' : '400px',
                          width: '100%',
                          height: 'auto',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                        onLoad={() => {
                          // Scroll to show the generated image
                          setTimeout(() => {
                            scrollContainer && smartScrollToBottom(scrollContainer, {
                              behavior: 'smooth',
                              force: true
                            });
                          }, 100);
                        }}
                      />
                    </div>
                  );
                }
                
                // Upload attachments display as compact cards
                return (
                  <div
                    key={index}
                    onClick={() => {
                      onImageClick?.({
                        url: attachment.base64,
                        name: attachment.name
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    {/* File icon/thumbnail */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'rgba(96, 165, 250, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {attachment.type && attachment.type.startsWith('image/') ? (
                        <img 
                          src={attachment.base64}
                          alt={attachment.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        attachment.name.match(/\.(png|jpe?g|gif|webp)$/i) ? '🖼️' : '📄'
                      )}
                    </div>
                    
                    {/* File info */}
                    <div style={{
                      flex: 1,
                      minWidth: 0
                    }}>
                      <div style={{
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '0.2rem'
                      }}>
                        {attachment.name}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        opacity: 0.7
                      }}>
                        {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'Generated'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI message rendering
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      paddingLeft: isMobile ? '0' : '1rem',
      paddingRight: isMobile ? '0' : '1rem'
    }}>
      <div 
        className="p-4"
        style={{
          width: isMobile ? '95%' : '100%',
          margin: isMobile ? '0 auto' : '0',
          fontSize: isMobile ? '1rem' : '0.95rem',
          lineHeight: isMobile ? '1.3' : '1.6',
          whiteSpace: 'pre-wrap',
          color: '#FFFFFF',
          textAlign: 'left'
        }}>
        {/* AI Header */}
        <div style={{ 
          fontSize: '0.75rem', 
          opacity: 0.7, 
          marginBottom: '0.8rem',
          display: 'flex', 
          alignItems: 'center', 
          paddingBottom: '0.6rem'
        }}>
          <span style={{ 
            fontWeight: '600', 
            color: '#a0aec0', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <ChatOmniaLogo size={18} />
            Omnia {isStreaming ? ' • streaming' : ''}
          </span>
        </div>
        
        {/* Generated Image */}
        {image && (
          <div style={{
            marginTop: '1rem',
            marginBottom: '1rem',
            borderRadius: '12px',
            overflow: 'hidden',
            maxWidth: '100%'
          }}>
            <img 
              src={`data:${image.mimeType};base64,${image.base64}`}
              alt={`Generated image for: ${text}`}
              onClick={(e) => {
                if (!e.target.longPressDetected) {
                  const imageUrl = `data:${image.mimeType};base64,${image.base64}`;
                  onImageClick?.({
                    url: imageUrl,
                    name: `Generated: ${text.slice(0, 30)}...`
                  });
                }
              }}
              onTouchStart={(e) => {
                const startTime = Date.now();
                const startX = e.touches[0].clientX;
                const startY = e.touches[0].clientY;
                
                e.target.longPressTimer = setTimeout(() => {
                  e.target.longPressDetected = true;
                  
                  onLongPress?.({
                    imageData: `data:${image.mimeType};base64,${image.base64}`,
                    imageName: `generated-image-${Date.now()}.png`,
                    position: { x: startX, y: startY }
                  });
                }, 500);
                
                e.target.longPressDetected = false;
              }}
              onTouchEnd={(e) => {
                if (e.target.longPressTimer) {
                  clearTimeout(e.target.longPressTimer);
                }
                setTimeout(() => {
                  e.target.longPressDetected = false;
                }, 100);
              }}
              onTouchMove={(e) => {
                if (e.target.longPressTimer) {
                  const currentX = e.touches[0].clientX;
                  const currentY = e.touches[0].clientY;
                  const startX = e.touches[0].pageX;
                  const startY = e.touches[0].pageY;
                  
                  const distance = Math.sqrt((currentX - startX) ** 2 + (currentY - startY) ** 2);
                  if (distance > 10) {
                    clearTimeout(e.target.longPressTimer);
                    e.target.longPressDetected = false;
                  }
                }
              }}
              style={{
                maxWidth: isMobile ? '280px' : '400px',
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              onLoad={() => {
                setTimeout(() => {
                  scrollContainer && smartScrollToBottom(scrollContainer, {
                    behavior: 'smooth',
                    force: true
                  });
                }, 100);
              }}
            />
          </div>
        )}
        
        {/* AI Message Text */}
        <MessageRenderer 
          content={text || ''}
          className="text-white"
          isStreaming={isStreaming}
        />
        
        {/* Action Buttons */}
        {!isStreaming && (
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '1rem',
            paddingTop: '0.8rem',
            justifyContent: 'flex-start'
          }}>
            <SourcesButton 
              sources={sources || []}
              onClick={() => onSourcesClick?.(sources || [])}
              language={detectLanguage(text)}
            />
            <VoiceButton 
              text={text} 
              onAudioStart={onAudioStart}
              onAudioEnd={onAudioEnd}
            />
            <CopyButton 
              text={text} 
              language={detectLanguage(text)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;