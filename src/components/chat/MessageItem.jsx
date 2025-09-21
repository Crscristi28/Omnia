// 🎨 MessageItem.jsx - Individual message rendering component
// ✅ Extracted from App.jsx to reduce file size and improve maintainability

import React, { useState } from 'react';

// Import components that are used in message rendering
import MessageRenderer from '../MessageRenderer';
import { SourcesButton } from '../sources';
import { VoiceButton, CopyButton, ChatOmniaLogo } from '../ui';
import PdfViewer from '../PdfViewer';

// Import utilities
import { detectLanguage } from '../../utils/text';
import { getViewerType } from '../../utils/fileTypeUtils';

// Import styles
import * as styles from '../../styles/ChatStyles.js';

const MessageItem = ({ 
  msg, 
  index, 
  onPreviewImage, 
  onDocumentView, 
  onSourcesClick, 
  onAudioStateChange 
}) => {
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
      key={msg.id || `fallback_${index}`} 
      data-sender={msg.sender}
      style={msg.sender === 'user' ? userMessageContainerStyle : botMessageContainerStyle}
    >
      {/* COMMENTED OUT - Using animate-pulse indicator in message text instead */}
      {/* {msg.isLoading ? (
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
      ) : */}
      {msg.sender === 'user' ? (
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
          
          {/* 📝 MESSAGE TEXT - Display first to prevent jumping */}
          <MessageRenderer 
            content={msg.text || ''}
            className="text-white"
          />
          
          {/* 🎨 GENERATED IMAGE - Display after text with loading skeleton */}
          {msg.image && <GeneratedImageWithSkeleton msg={msg} onPreviewImage={onPreviewImage} imageStyle={imageStyle} />}

          {/* 📄 GENERATED PDF - Display view link */}
          {msg.pdf && <GeneratedPdfView msg={msg} onDocumentView={onDocumentView} />}

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
};

// 🎨 Generated Image with Loading Skeleton Component
const GeneratedImageWithSkeleton = ({ msg, onPreviewImage, imageStyle }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = msg.image.storageUrl || (msg.image.base64 ? `data:${msg.image.mimeType};base64,${msg.image.base64}` : msg.image);

  return (
    <div style={{
      paddingTop: '1rem',
      paddingBottom: '1rem',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '100%'
    }}>
      {/* Loading Skeleton */}
      {!imageLoaded && (
        <div
          className="image-skeleton"
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%)',
            backgroundSize: '200% 100%',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            animation: 'shimmer-skeleton 2s infinite'
          }}>
          Loading image...
        </div>
      )}

      {/* Actual Image */}
      <img
        src={imageUrl}
        alt={`Generated image for: ${msg.text}`}
        onClick={() => {
          onPreviewImage({
            url: imageUrl,
            name: `Generated: ${msg.text.slice(0, 30)}...`
          });
        }}
        style={{
          ...imageStyle,
          display: imageLoaded ? 'block' : 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.02) translateZ(0)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) translateZ(0)';
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />

    </div>
  );
};

// 📄 Generated PDF View Component
const GeneratedPdfView = ({ msg, onDocumentView }) => {
  const [showCleanPdf, setShowCleanPdf] = React.useState(false);
  const [pdfDataUrl, setPdfDataUrl] = React.useState('');
  const [longPressTimer, setLongPressTimer] = React.useState(null);

  const handleViewPdf = () => {
    if (msg.pdf && msg.pdf.base64) {
      // Convert JSON byte array to real PDF base64
      try {
        const jsonString = atob(msg.pdf.base64);
        const byteArray = JSON.parse(jsonString);
        const uint8Array = new Uint8Array(Object.keys(byteArray).length);
        Object.keys(byteArray).forEach(key => {
          uint8Array[parseInt(key)] = byteArray[key];
        });
        const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
        const realBase64 = btoa(binaryString);
        const dataUrl = `data:application/pdf;base64,${realBase64}`;

        setPdfDataUrl(dataUrl);
        setShowCleanPdf(true);
      } catch (error) {
        console.error('❌ PDF conversion error:', error);
      }
    }
  };

  const handleTouchStart = (e) => {
    // Start long press timer
    const timer = setTimeout(() => {
      // Long press detected - prepare for native context menu
      if (msg.pdf && msg.pdf.base64) {
        try {
          const jsonString = atob(msg.pdf.base64);
          const byteArray = JSON.parse(jsonString);
          const uint8Array = new Uint8Array(Object.keys(byteArray).length);
          Object.keys(byteArray).forEach(key => {
            uint8Array[parseInt(key)] = byteArray[key];
          });
          const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
          const realBase64 = btoa(binaryString);
          const dataUrl = `data:application/pdf;base64,${realBase64}`;

          // Create invisible link for native context menu
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = msg.pdf.filename || `${msg.pdf.title || 'document'}.pdf`;
          link.style.position = 'absolute';
          link.style.left = '-9999px';
          document.body.appendChild(link);

          // Trigger context menu on the link
          const contextEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
          });
          link.dispatchEvent(contextEvent);

          setTimeout(() => document.body.removeChild(link), 100);
        } catch (error) {
          console.error('❌ Long press PDF error:', error);
        }
      }
    }, 500); // 500ms for long press

    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div style={{
      paddingTop: '1rem',
      paddingBottom: '0.5rem'
    }}>
      <div
        onClick={handleViewPdf}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '300px'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {/* PDF Icon */}
        <div style={{
          fontSize: '24px',
          color: '#3b82f6'
        }}>
          📄
        </div>

        {/* PDF Info */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '2px'
          }}>
            {msg.pdf.title || 'Generated Document'}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            Click to view PDF
          </div>
        </div>

        {/* View Icon */}
        <div style={{
          fontSize: '16px',
          color: '#3b82f6'
        }}>
          👁️
        </div>
      </div>

      {/* PDF Modal Overlay */}
      {showPdf && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Close Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '20px'
          }}>
            <button
              onClick={() => setShowPdf(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* PDF Iframe */}
          <iframe
            src={pdfDataUrl}
            style={{
              flex: 1,
              border: 'none',
              margin: '0 20px 20px 20px',
              borderRadius: '8px'
            }}
            title={msg.pdf.title || 'PDF Document'}
          />
        </div>
      )}

      {/* NEW: Clean PDF Viewer */}
      <PdfViewer
        isOpen={showCleanPdf}
        onClose={() => setShowCleanPdf(false)}
        pdfData={{
          url: pdfDataUrl,
          title: msg.pdf?.title || 'Generated PDF',
          base64: msg.pdf?.base64
        }}
      />
    </div>
  );
};

export default MessageItem;