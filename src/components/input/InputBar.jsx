// 🚀 InputBar.jsx - PŘESNĚ PODLE UI.MD
// ✅ Textarea nahoře, 4 kulatá tlačítka dole
// ✅ Žádné experimenty, čistý jednoduchý kód

import React, { useState, useRef } from 'react';
import { Plus, Search, Mic, Send, AudioWaveform, FileText, Camera, Image, Palette, Sparkles } from 'lucide-react';
import { getTranslation } from '../../utils/text';

// Using Lucide React icons instead of custom SVG components


// PLUS MENU
const PlusMenu = ({ isOpen, onClose, buttonRef, onImageGenerate, onDocumentUpload, uiLanguage = 'cs' }) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: FileText, key: 'document', labelCs: 'Přidat dokument', labelEn: 'Add document', labelRo: 'Adaugă document' },
    { icon: Image, key: 'photo', labelCs: 'Přidat fotku', labelEn: 'Add photo', labelRo: 'Adaugă poză' },
    { icon: Camera, key: 'camera', labelCs: 'Vyfotit', labelEn: 'Take photo', labelRo: 'Fă poză' }
  ];

  const getLabel = (item) => {
    switch (uiLanguage) {
      case 'en': return item.labelEn;
      case 'ro': return item.labelRo;
      default: return item.labelCs;
    }
  };

  // Calculate position
  const buttonRect = buttonRef?.current?.getBoundingClientRect();
  const menuStyle = buttonRect ? {
    position: 'fixed',
    bottom: `${window.innerHeight - buttonRect.top + 8}px`,
    left: `${buttonRect.left}px`,
    zIndex: 1002,
  } : {
    position: 'fixed',
    bottom: '140px',
    left: '20px',
    zIndex: 1002,
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      
      {/* Menu container */}
      <div style={{
        ...menuStyle,
        minWidth: '220px',
        maxWidth: '280px',
        borderRadius: '12px',
        backgroundColor: 'rgba(55, 65, 81, 0.95)', // dark gray
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
          backgroundColor: 'rgba(75, 85, 99, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#60A5FA' }} strokeWidth={2} />
          {t('multimodalFeatures')}
        </div>

        {/* Menu items */}
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'generate' && onImageGenerate) {
                  console.log('🎨 Activating image generation mode');
                  onImageGenerate();
                  onClose();
                } else if (item.key === 'document' && onDocumentUpload) {
                  console.log('📄 Document upload initiated');
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.gif,.txt,.md,.js,.jsx,.ts,.tsx,.css,.html,.json,application/pdf,image/png,image/jpeg,image/bmp,image/tiff,image/gif,text/*,application/json,application/javascript';
                  input.onchange = onDocumentUpload;
                  input.click();
                  onClose();
                } else {
                  console.log(`${item.key} clicked - Coming Soon!`);
                  onClose();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#60A5FA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              <IconComponent style={{ width: '18px', height: '18px', color: '#60A5FA' }} strokeWidth={2} />
              <span style={{ fontWeight: '500' }}>{getLabel(item)}</span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '12px',
                color: 'rgba(156, 163, 175, 1)',
                fontStyle: 'italic',
                fontWeight: '400',
              }}>
                Soon
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

const InputBar = ({ 
  input,
  setInput,
  onSend,
  onSendWithDocuments, // NEW: Send text + documents
  onSTT,
  onVoiceScreen,
  onImageGenerate,
  onDocumentUpload,
  isLoading,
  isRecording,
  isAudioPlaying,
  isImageMode = false,
  uiLanguage = 'cs',
  previewImage,
  setPreviewImage
}) => {
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const plusButtonRef = useRef(null);
  const textareaRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

  // iOS keyboard detection with multiple fallback methods
  React.useEffect(() => {
    if (!isMobile) return;
    
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    let debounceTimer = null;
    
    const handleKeyboardDetection = () => {
      // Clear any existing timer
      if (debounceTimer) clearTimeout(debounceTimer);
      
      // Debounce to avoid rapid changes
      debounceTimer = setTimeout(() => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // More aggressive detection - if height difference > 100px, keyboard is probably open
        const keyboardOpen = heightDifference > 100;
        setIsKeyboardOpen(keyboardOpen);
        
        console.log('📱 Keyboard detection:', {
          initialHeight: initialViewportHeight,
          currentHeight,
          difference: heightDifference,
          keyboardOpen
        });
      }, 50); // Short debounce
    };

    // Method 1: Visual Viewport API (primary)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleKeyboardDetection);
    }
    
    // Method 2: Window resize fallback
    window.addEventListener('resize', handleKeyboardDetection);
    
    // Method 3: Input focus/blur detection as additional fallback
    const handleInputFocus = () => {
      setTimeout(() => {
        setIsKeyboardOpen(true);
        console.log('📱 Keyboard opened via input focus fallback');
      }, 200); // Shorter delay
    };
    
    const handleInputBlur = () => {
      setTimeout(() => {
        // Only close if viewport detection also suggests closed
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        if (heightDifference < 100) {
          setIsKeyboardOpen(false);
          console.log('📱 Keyboard closed via input blur fallback');
        }
      }, 100);
    };
    
    // Create named event handlers for proper cleanup
    const focusInHandler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        handleInputFocus();
      }
    };
    
    const focusOutHandler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        handleInputBlur();
      }
    };
    
    // Add focus/blur listeners using event delegation
    document.addEventListener('focusin', focusInHandler);
    document.addEventListener('focusout', focusOutHandler);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleKeyboardDetection);
      }
      window.removeEventListener('resize', handleKeyboardDetection);
      document.removeEventListener('focusin', focusInHandler);
      document.removeEventListener('focusout', focusOutHandler);
    };
  }, [isMobile]);

  const handleSendMessage = () => {
    if (pendingDocuments.length > 0) {
      // Send with documents (regardless of whether there's text or not)
      if (onSendWithDocuments) {
        onSendWithDocuments(input, pendingDocuments);
        setPendingDocuments([]); // Clear chips after sending
      }
    } else if (input.trim() && onSend) {
      // Regular text-only send
      onSend();
    }
  };

  const handleKeyDown = (e) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey && !isLoading && (input.trim() || pendingDocuments.length > 0)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeepSearch = () => {
    console.log('🔍 Deep Search clicked - Coming Soon!');
  };

  const handleImageGenerate = () => {
    console.log('🎨 Image generation from InputBar - toggling mode');
    if (onImageGenerate) {
      onImageGenerate();
    }
  };


  // Handle document upload to chips ONLY
  const handleDocumentUploadToChips = (event) => {
    console.log('📄 Document(s) selected for chips:', event);
    
    const files = Array.from(event.target.files || []);
    console.log(`🔍 Processing ${files.length} file(s)`);
    
    files.forEach((file, index) => {
      // Debug file properties
      console.log(`🔍 DEBUG - File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeType: typeof file.size,
        hasSize: file.hasOwnProperty('size')
      });
      
      // Format file size properly
      let formattedSize = 'Unknown size';
      if (file.size !== undefined && file.size !== null && typeof file.size === 'number' && !isNaN(file.size)) {
        const sizeInBytes = file.size;
        console.log(`🔍 DEBUG - File ${index + 1} size in bytes:`, sizeInBytes);
        
        if (sizeInBytes < 1024) {
          formattedSize = `${sizeInBytes}B`;
        } else if (sizeInBytes < 1024 * 1024) {
          formattedSize = `${(sizeInBytes / 1024).toFixed(1)}KB`;
        } else {
          formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`;
        }
        
        console.log(`🔍 DEBUG - File ${index + 1} formatted size:`, formattedSize);
      } else {
        console.log(`🔍 DEBUG - Invalid file.size for file ${index + 1}:`, file.size, typeof file.size);
      }
      
      // Only add chip - NO background upload yet
      const docChip = {
        id: Date.now() + index, // Unique ID for each file
        name: file.name,
        size: formattedSize,
        file: file // Store file for later upload
      };
      setPendingDocuments(prev => [...prev, docChip]);
    });
    
    // Clear the file input for next time
    event.target.value = '';
  };

  // UNIFIED BUTTON STYLE - KULATÉ PODLE UI.MD
  const buttonSize = isMobile ? 36 : 44;
  const iconSize = isMobile ? 20 : 24;

  const buttonStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  return (
    <>
      {/* GRADIENT OVERLAY - hides scrolling text behind input bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transform: 'translateZ(0)',
        height: isMobile ? '140px' : '120px',
        background: `linear-gradient(to top, 
          rgba(255, 255, 255, 0.08) 0%, 
          rgba(255, 255, 255, 0.06) 40%,
          rgba(255, 255, 255, 0.04) 70%,
          transparent 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        pointerEvents: 'none', // Allow clicks to pass through to input
        zIndex: 9,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: isMobile ? '18px' : '6px',
      }}>
        {/* Disclaimer text */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: isMobile ? '10px' : '11px',
          textAlign: 'center',
          fontWeight: '400',
          letterSpacing: '0.02em',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}>
          {t('aiCanMakeErrors')}
        </div>
      </div>
      
      {/* HLAVNÍ KONTEJNER */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transform: isMobile && isKeyboardOpen 
          ? 'translateZ(0) translateY(0)' 
          : 'translateZ(0)',
        padding: isMobile ? '0.5rem' : '1.5rem',
        paddingBottom: isMobile 
          ? (isKeyboardOpen ? '0.5rem' : 'calc(env(safe-area-inset-bottom, 0.5rem) + 0.5rem)')
          : '1.5rem',
        zIndex: 10,
      }}>
        
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          
          {/* GLASS CONTAINER */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            padding: isMobile ? '0.6rem' : '1rem',
          }}>
            
            {/* DOCUMENT PREVIEW CARDS */}
            {pendingDocuments.length > 0 && (
              <div className="hide-scrollbar" style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                overflowX: 'auto',
                overflowY: 'hidden',
                marginBottom: '0.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {pendingDocuments.map((doc) => {
                  const isImage = doc.file && doc.file.type.startsWith('image/');
                  const fileExtension = doc.name.split('.').pop()?.toUpperCase() || 'FILE';
                  
                  let longPressTimer = null;
                  
                  const handleTouchStart = () => {
                    longPressTimer = setTimeout(() => {
                      // Show custom fullscreen preview instead of iframe
                      if (isImage) {
                        const fileUrl = URL.createObjectURL(doc.file);
                        setPreviewImage({
                          url: fileUrl,
                          name: doc.name
                        });
                        // Clean up URL after 30 seconds (preview should be done by then)
                        setTimeout(() => {
                          URL.revokeObjectURL(fileUrl);
                        }, 30000);
                      }
                    }, 500);
                  };
                  
                  const handleTouchEnd = () => {
                    if (longPressTimer) {
                      clearTimeout(longPressTimer);
                      longPressTimer = null;
                    }
                  };
                  
                  return (
                    <div
                      key={doc.id}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleTouchStart}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                      style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        flexShrink: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {/* X Button */}
                      <button
                        onClick={() => setPendingDocuments(prev => prev.filter(d => d.id !== doc.id))}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          width: '18px',
                          height: '18px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          zIndex: 1,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 4L4 12M4 4L12 12"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      
                      {isImage ? (
                        /* Image thumbnail */
                        <img 
                          src={URL.createObjectURL(doc.file)} 
                          alt={doc.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onLoad={(e) => {
                            // Clean up URL after thumbnail loads to prevent memory leak
                            setTimeout(() => {
                              URL.revokeObjectURL(e.target.src);
                            }, 1000);
                          }}
                          onError={(e) => {
                            // Clean up URL on error too
                            setTimeout(() => {
                              URL.revokeObjectURL(e.target.src);
                            }, 1000);
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
                            {doc.name}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}>
                            {fileExtension}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* TEXTAREA NAHOŘE */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onClick={(e) => {
                // iOS PWA fix - ensure focus on click
                if (isMobile && window.navigator.standalone) {
                  e.target.focus();
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? t('omniaPreparingResponse') : t('chatPlaceholder')}
              disabled={isLoading}
              rows={1}
              style={{
                width: '100%',
                minHeight: isMobile ? '40px' : '48px',
                maxHeight: '120px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: isMobile ? '16px' : '18px',
                fontFamily: 'inherit',
                resize: 'none',
                lineHeight: '1.5',
                padding: '0.5rem',
                marginBottom: '0.5rem',
              }}
            />
            
            {/* 4 TLAČÍTKA DOLE */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              
              {/* LEFT SIDE BUTTONS */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '12px',
              }}>
                {/* 1. PLUS BUTTON */}
                <button
                  ref={plusButtonRef}
                  onClick={() => {
                    // Close keyboard first on mobile
                    if (isMobile && textareaRef.current) {
                      textareaRef.current.blur();
                    }
                    
                    // Wait for keyboard to close, then open file picker
                    setTimeout(() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.gif,.txt,.md,.js,.jsx,.ts,.tsx,.css,.html,.json,application/pdf,image/png,image/jpeg,image/bmp,image/tiff,image/gif,text/*,application/json,application/javascript';
                      input.onchange = handleDocumentUploadToChips;
                      input.click();
                    }, isMobile ? 100 : 0);
                  }}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  title={t('multimodalFeatures')}
                >
                  <Plus size={iconSize} strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </button>
                
                {/* 2. RESEARCH BUTTON */}
                <button
                  onClick={handleDeepSearch}
                  disabled={isLoading || !input.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !input.trim() ? 0.5 : 1,
                  }}
                  title={t('deepSearch')}
                >
                  <Search size={iconSize} strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </button>
                
                {/* 3. IMAGE GENERATION BUTTON */}
                <button
                  onClick={handleImageGenerate}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  title={t('generateImage') || 'Generate Image'}
                >
                  <Palette 
                    size={iconSize} 
                    strokeWidth={2} 
                    style={{
                      color: isImageMode ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                </button>
              </div>
              
              {/* RIGHT SIDE BUTTONS */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '12px',
              }}>
                {/* 4. MIKROFON BUTTON */}
                <button
                  onClick={onSTT}
                  disabled={isLoading || isAudioPlaying}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: isLoading || isAudioPlaying ? 'not-allowed' : 'pointer',
                    opacity: isLoading || isAudioPlaying ? 0.5 : 1,
                  }}
                  title={isRecording ? 'Stop Recording' : 'Voice Input'}
                >
                  <Mic 
                    size={iconSize} 
                    strokeWidth={2} 
                    style={{
                      color: isRecording ? '#EF4444' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                </button>
                
                {/* 5. DYNAMIC BUTTON */}
                <button
                  onClick={(input.trim() || pendingDocuments.length > 0) ? handleSendMessage : onVoiceScreen}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  title={(input.trim() || pendingDocuments.length > 0) ? 'Send Message' : 'Voice Chat'}
                >
                  {(input.trim() || pendingDocuments.length > 0) ? 
                    <Send size={iconSize} strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.7)' }} /> : 
                    <AudioWaveform size={iconSize} strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  }
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default InputBar;