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
  // State for uploaded PDF viewer
  const [uploadedPdfData, setUploadedPdfData] = useState(null);
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
                    } else if (viewerType === 'pdf') {
                      // Use dedicated PdfViewer for uploaded PDFs
                      setUploadedPdfData({
                        url: attachment.previewUrl || attachment.storageUrl || attachment.base64,
                        name: attachment.name,
                        base64: attachment.base64
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
          
          {/* 🎨 GENERATED IMAGES - Display after text with loading skeleton */}
          {(msg.image || msg.images) && <GeneratedImagesGallery msg={msg} onPreviewImage={onPreviewImage} imageStyle={imageStyle} />}

          {/* 📄 PDF VIEWER - Display view link for both generated and uploaded PDFs */}
          {msg.pdf && <PdfViewComponent msg={msg} onDocumentView={onDocumentView} />}
          {uploadedPdfData && (
            <PdfViewComponent
              msg={msg}
              onDocumentView={onDocumentView}
              uploadedPdfData={uploadedPdfData}
              onCloseUploadedPdf={() => setUploadedPdfData(null)}
            />
          )}

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

// 🎨 Generated Images Gallery Component (supports single or multiple images)
const GeneratedImagesGallery = ({ msg, onPreviewImage, imageStyle }) => {
  // Support both single image (legacy) and multiple images (new)
  const images = msg.images || (msg.image ? [msg.image] : []);

  if (images.length === 0) return null;

  // Single image - use original layout
  if (images.length === 1) {
    return <SingleImageWithSkeleton image={images[0]} msg={msg} onPreviewImage={onPreviewImage} imageStyle={imageStyle} />;
  }

  // Multiple images - use gallery grid
  return (
    <div style={{
      paddingTop: '1rem',
      paddingBottom: '1rem',
      maxWidth: '100%'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: images.length === 2 ? '1fr 1fr' :
                            images.length === 3 ? '1fr 1fr 1fr' :
                            '1fr 1fr', // 4 images: 2x2 grid
        gridTemplateRows: images.length === 4 ? '1fr 1fr' : 'auto',
        gap: '0.5rem',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {images.map((image, index) => (
          <SingleImageWithSkeleton
            key={index}
            image={image}
            msg={msg}
            onPreviewImage={onPreviewImage}
            imageStyle={{
              ...imageStyle,
              width: '100%',
              height: images.length === 4 ? '150px' : '200px',
              objectFit: 'cover'
            }}
            index={index}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div style={{
          textAlign: 'center',
          marginTop: '0.5rem',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px'
        }}>
          {images.length} images generated
        </div>
      )}
    </div>
  );
};

// Single Image Component (used by gallery)
const SingleImageWithSkeleton = ({ image, msg, onPreviewImage, imageStyle, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = image.storageUrl || (image.base64 ? `data:${image.mimeType};base64,${image.base64}` : image);

  return (
    <div style={{
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      width: '100%'
    }}>
      {/* Loading Skeleton */}
      {!imageLoaded && (
        <div
          className="image-skeleton"
          style={{
            width: '100%',
            height: imageStyle?.height || '300px',
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
        alt={`Generated image ${index + 1} for: ${msg.text}`}
        onClick={() => {
          onPreviewImage({
            url: imageUrl,
            name: `Generated ${index + 1}: ${msg.text.slice(0, 30)}...`
          });
        }}
        style={{
          ...imageStyle,
          display: imageLoaded ? 'block' : 'none',
          cursor: 'pointer'
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

// 📄 PDF View Component (for both generated and uploaded PDFs)
const PdfViewComponent = ({ msg, onDocumentView, uploadedPdfData = null, onCloseUploadedPdf = null }) => {
  const [showCleanPdf, setShowCleanPdf] = React.useState(false);
  const [pdfDataUrl, setPdfDataUrl] = React.useState('');
  const [longPressTimer, setLongPressTimer] = React.useState(null);

  // Determine if this is generated or uploaded PDF
  const isGeneratedPdf = !!msg.pdf;
  const isUploadedPdf = !!uploadedPdfData;

  const handleViewPdf = () => {
    if (isGeneratedPdf && msg.pdf) {
      console.log('🔍 [PDF-VIEWER] Opening generated PDF:', msg.pdf);

      // PDF object with fallback chain (like images)
      if (msg.pdf.storageUrl) {
        console.log('📄 [PDF-VIEWER] Using storage URL');
        setPdfDataUrl(msg.pdf.storageUrl);
        setShowCleanPdf(true);
      } else if (msg.pdf.base64) {
        console.log('📄 [PDF-VIEWER] Using base64 fallback');
        const dataUrl = `data:application/pdf;base64,${msg.pdf.base64}`;
        setPdfDataUrl(dataUrl);
        setShowCleanPdf(true);
      } else if (typeof msg.pdf === 'string') {
        // Backward compatibility: string URL format
        console.log('📄 [PDF-VIEWER] Using legacy string format');
        setPdfDataUrl(msg.pdf);
        setShowCleanPdf(true);
      } else {
        console.error('❌ [PDF-VIEWER] No PDF data available');
      }
    } else if (isUploadedPdf && uploadedPdfData) {
      console.log('📄 [PDF-VIEWER] Using uploaded PDF data');
      // Use uploaded PDF data directly
      const url = uploadedPdfData.url || uploadedPdfData.base64;
      setPdfDataUrl(url);
      setShowCleanPdf(true);
    }
  };

  const handleTouchStart = (e) => {
    // Start long press timer
    const timer = setTimeout(() => {
      // Long press detected - prepare for native context menu
      let dataUrl = null;
      let filename = 'document.pdf';

      if (isGeneratedPdf && msg.pdf && msg.pdf.base64) {
        // PDF base64 is already properly processed in App.jsx - use directly
        dataUrl = `data:application/pdf;base64,${msg.pdf.base64}`;
        filename = msg.pdf.filename || `${msg.pdf.title || 'document'}.pdf`;
      } else if (isUploadedPdf && uploadedPdfData) {
        dataUrl = uploadedPdfData.url || uploadedPdfData.base64;
        filename = uploadedPdfData.name || 'document.pdf';
      }

      if (dataUrl) {
        // Create invisible link for native context menu
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
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
{isGeneratedPdf ? (msg.pdf.title || 'Generated PDF') : (uploadedPdfData?.name || 'PDF Document')}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            Click to view PDF
          </div>
        </div>

      </div>

      {/* Clean PDF Viewer */}
      <PdfViewer
        isOpen={showCleanPdf}
        onClose={() => {
          setShowCleanPdf(false);
          setPdfDataUrl(null); // 🧹 MEMORY: Clear data URL from state to free RAM
          if (isUploadedPdf && onCloseUploadedPdf) {
            onCloseUploadedPdf();
          }
        }}
        pdfData={{
          url: pdfDataUrl,
          title: isGeneratedPdf ? (msg.pdf.title || 'Generated PDF') : (uploadedPdfData?.name || 'PDF Document')
        }}
      />
    </div>
  );
};

export default MessageItem;