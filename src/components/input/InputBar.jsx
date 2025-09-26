// 🚀 InputBar.jsx - PŘESNĚ PODLE UI.MD
// ✅ Textarea nahoře, 4 kulatá tlačítka dole
// ✅ Žádné experimenty, čistý jednoduchý kód

import React, { useState, useRef } from 'react';
import { Plus, Search, Mic, Send, AudioWaveform, FileText, Camera, Image, Palette, Sparkles } from 'lucide-react';
import { getTranslation } from '../../utils/text';
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from '../../services/storage/supabaseStorage.js';
import { uploadDirectToGCS } from '../../services/directUpload.js';
import { useTheme } from '../../contexts/ThemeContext';

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
                  onImageGenerate();
                  onClose();
                } else if (item.key === 'document' && onDocumentUpload) {
                  console.log('📄 Document upload initiated');
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.gif,.txt,application/pdf,image/png,image/jpeg,image/bmp,image/tiff,image/gif,text/plain';
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
  onPreviewImage,
  audioLevel = 0
}) => {
  // THEME HOOK
  const { theme, isDark } = useTheme();

  // LOCAL STATE FOR INPUT - Performance optimization
  const [localInput, setLocalInput] = useState('');
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const plusButtonRef = useRef(null);
  const textareaRef = useRef(null);
  // Modern feature detection (2025) - podle Omnia doporučení
  const hasTouchScreen = navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const needsVirtualKeyboard = hasTouchScreen && isCoarsePointer;
  const t = getTranslation(uiLanguage);
  
  // Auto-resize textarea
  const autoResize = (textarea) => {
    if (!textarea) return;
    
    const minHeight = needsVirtualKeyboard ? 50 : 60;
    const maxHeight = 200;
    
    // If empty, reset to minHeight immediately
    if (!textarea.value.trim()) {
      textarea.style.height = minHeight + 'px';
      return;
    }
    
    // Reset height to get the correct scrollHeight
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    
    // Set height to content height, clamped between min and max
    const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
    textarea.style.height = newHeight + 'px';
  };
  
  // Audio-reactive listening placeholder with infinite animation
  const [dotCount, setDotCount] = useState(0);
  
  // Animate dots when recording
  React.useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4); // 0, 1, 2, 3, then repeat
      }, 500); // Change every 500ms
    } else {
      setDotCount(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  const getListeningPlaceholder = () => {
    const baseDots = '.'.repeat(dotCount);
    
    // Audio-reactive: add extra dots based on volume
    let extraDots = '';
    if (audioLevel > 0.6) {
      extraDots = '•••';
    } else if (audioLevel > 0.3) {
      extraDots = '••';
    } else if (audioLevel > 0.1) {
      extraDots = '•';
    }
    
    return `${t('listening')}${baseDots}${extraDots}`;
  };
  
  // Synchronize with parent input prop (for STT/Voice compatibility)
  React.useEffect(() => {
    // Only sync if parent input is different and not empty
    // This handles STT/Voice setting the input from App.jsx
    if (input && input !== localInput) {
      console.log('📝 [InputBar] Syncing input from parent:', input);
      setLocalInput(input);
      // Auto-resize after setting new input
      setTimeout(() => {
        if (textareaRef.current) {
          autoResize(textareaRef.current);
        }
      }, 0);
    }
  }, [input]);

  // Auto-resize on mount and when localInput changes externally
  React.useEffect(() => {
    if (textareaRef.current && localInput) {
      autoResize(textareaRef.current);
    }
  }, [localInput]);

  // Visual Viewport API keyboard detection (fallback for iOS/Android)
  React.useEffect(() => {
    if (window.visualViewport && needsVirtualKeyboard) {
      const handleViewportChange = () => {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        const isKeyboardVisible = keyboardHeight > 150; // threshold pro keyboard detection
        setIsKeyboardOpen(isKeyboardVisible);
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport.removeEventListener('resize', handleViewportChange);
    }
  }, [needsVirtualKeyboard]);

  // Simple keyboard detection - no performance-impacting resize listeners
  const handleTextareaFocus = () => {
    if (needsVirtualKeyboard) {
      setIsKeyboardOpen(true);
    }
  };

  const handleTextareaBlur = (e) => {
    if (needsVirtualKeyboard) {
      // Don't close keyboard if clicking on send button
      // Check if the blur is moving to a button within InputBar
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isClickingButton = activeElement && (
          activeElement.tagName === 'BUTTON' ||
          activeElement.closest('.input-bar-container')
        );
        
        if (!isClickingButton) {
          setIsKeyboardOpen(false);
        }
      }, 100); // Small delay to check where focus went
    }
  };

  // 🚫 CHECK IF ALL UPLOADS ARE COMPLETED
  const allUploadsCompleted = pendingDocuments.every(doc => doc.uploadStatus === 'completed');
  const canSend = (localInput.trim() || pendingDocuments.length > 0) && allUploadsCompleted;
  
  const handleSendMessage = () => {
    // Don't send if uploads are still pending
    if (pendingDocuments.length > 0 && !allUploadsCompleted) {
      console.log('⏳ Cannot send - uploads still pending');
      return;
    }
    
    if (pendingDocuments.length > 0) {
      // Send with documents (only if all uploads completed)
      if (onSendWithDocuments) {
        onSendWithDocuments(localInput, pendingDocuments);
        setPendingDocuments([]); // Clear chips after sending
        setLocalInput(''); // Clear local input
        // Reset textarea size after sending
        setTimeout(() => {
          if (textareaRef.current) {
            autoResize(textareaRef.current);
          }
        }, 0);
      }
    } else if (localInput.trim() && onSend) {
      // Regular text-only send - pass the text up
      onSend(localInput);
      setLocalInput(''); // Clear local input after sending
      // Reset textarea size after sending
      setTimeout(() => {
        if (textareaRef.current) {
          autoResize(textareaRef.current);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (!needsVirtualKeyboard && e.key === 'Enter' && !e.shiftKey && !isLoading && canSend) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeepSearch = () => {
    console.log('🔍 Deep Search clicked - Coming Soon!');
  };

  const handleImageGenerate = () => {
    if (onImageGenerate) {
      onImageGenerate();
    }
  };


  // Handle document upload to chips ONLY
  const handleDocumentUploadToChips = (event) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file, index) => {
      
      // Format file size properly
      let formattedSize = 'Unknown size';
      if (file.size !== undefined && file.size !== null && typeof file.size === 'number' && !isNaN(file.size)) {
        const sizeInBytes = file.size;
        
        if (sizeInBytes < 1024) {
          formattedSize = `${sizeInBytes}B`;
        } else if (sizeInBytes < 1024 * 1024) {
          formattedSize = `${(sizeInBytes / 1024).toFixed(1)}KB`;
        } else {
          formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`;
        }
      }

      // Enhanced chip structure for background upload
      const docChip = {
        id: Date.now() + index, // Unique ID for each file
        name: file.name,
        size: formattedSize,
        file: file, // Store file for later upload
        uploadStatus: 'pending', // 'pending' | 'uploading' | 'completed' | 'error'
        uploadProgress: 0, // 0-100% for visual progress
        supabaseUrl: null,
        supabasePath: null, // Pro cleanup
        geminiFileUri: null,
        gcsUri: null
      };
      setPendingDocuments(prev => [...prev, docChip]);
      
      // 🚀 START BACKGROUND UPLOAD immediately
      startBackgroundUpload(docChip);
    });
    
    // Clear the file input for next time
    event.target.value = '';
  };

  // 🗑️ CLEANUP FUNCTION - Remove document and cleanup cloud files
  const handleRemoveDocument = async (docId) => {
    const docToRemove = pendingDocuments.find(doc => doc.id === docId);
    
    if (!docToRemove) return;
    
    console.log(`🗑️ [CLEANUP] Removing document: ${docToRemove.name}`);
    
    // Remove from UI first for immediate feedback
    setPendingDocuments(prev => prev.filter(d => d.id !== docId));
    
    // Cleanup cloud files in background
    try {
      if (docToRemove.supabasePath) {
        console.log(`🗑️ [CLEANUP] Deleting from Supabase: ${docToRemove.supabasePath}`);
        await deleteFromSupabaseStorage(docToRemove.supabasePath, 'attachments');
      }
      
      // TODO: Add GCS cleanup if there's a delete API
      // TODO: Add Gemini file cleanup if there's a delete API
      
      console.log(`✅ [CLEANUP] Successfully cleaned up: ${docToRemove.name}`);
    } catch (error) {
      console.error(`❌ [CLEANUP] Failed to cleanup cloud files for: ${docToRemove.name}`, error);
      // Don't show error to user - file is already removed from UI
    }
  };

  // 🚮 CLEANUP ON UNMOUNT - Remove unused files from cloud
  React.useEffect(() => {
    return () => {
      // Cleanup any pending documents that weren't sent
      pendingDocuments.forEach(doc => {
        if (doc.uploadStatus === 'completed') {
          console.log(`🚮 [UNMOUNT-CLEANUP] Cleaning up unsent file: ${doc.name}`);
          handleRemoveDocument(doc.id);
        }
      });
    };
  }, []); // Empty dependency array = cleanup on unmount only

  // 🚀 BACKGROUND UPLOAD FUNCTION
  const startBackgroundUpload = async (docChip) => {
    console.log(`🚀 [BACKGROUND-UPLOAD] Starting upload for: ${docChip.name}`);
    
    // Update status to uploading
    setPendingDocuments(prev => prev.map(doc => 
      doc.id === docChip.id ? { ...doc, uploadStatus: 'uploading', uploadProgress: 0 } : doc
    ));
    
    try {
      // 🔄 STEP-BY-STEP UPLOAD with progress updates
      
      // Step 1: Supabase upload (33%)
      const supabaseResult = await uploadToSupabaseStorage(docChip.file, 'attachments');
      setPendingDocuments(prev => prev.map(doc => 
        doc.id === docChip.id ? { ...doc, uploadProgress: 33 } : doc
      ));
      console.log(`✅ [BACKGROUND-UPLOAD] Supabase completed (33%) for: ${docChip.name}`);
      
      // Step 2: GCS upload (66%)
      const gcsResult = await uploadDirectToGCS(docChip.file);
      setPendingDocuments(prev => prev.map(doc => 
        doc.id === docChip.id ? { ...doc, uploadProgress: 66 } : doc
      ));
      console.log(`✅ [BACKGROUND-UPLOAD] GCS completed (66%) for: ${docChip.name}`);
      
      // Step 3: Gemini upload (100%)
      const geminiResponse = await fetch('/api/upload-to-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl: gcsResult.gcsUri,
          originalName: gcsResult.originalName
        })
      });
      
      if (!geminiResponse.ok) {
        throw new Error('Gemini upload failed');
      }
      
      const geminiData = await geminiResponse.json();
      
      console.log(`✅ [BACKGROUND-UPLOAD] All uploads completed (100%) for: ${docChip.name}`);
      
      // Final update - completed with all URLs
      setPendingDocuments(prev => prev.map(doc => 
        doc.id === docChip.id ? {
          ...doc,
          uploadStatus: 'completed',
          uploadProgress: 100,
          supabaseUrl: supabaseResult.publicUrl,
          supabasePath: supabaseResult.path,
          gcsUri: gcsResult.gcsUri,
          geminiFileUri: geminiData.fileUri
        } : doc
      ));
      
    } catch (error) {
      console.error(`❌ [BACKGROUND-UPLOAD] Failed for ${docChip.name}:`, error);
      
      // Update status to error
      setPendingDocuments(prev => prev.map(doc => 
        doc.id === docChip.id ? { ...doc, uploadStatus: 'error' } : doc
      ));
    }
  };

  // UNIFIED BUTTON STYLE - KULATÉ PODLE UI.MD
  const buttonSize = needsVirtualKeyboard ? 36 : 44;
  const iconSize = needsVirtualKeyboard ? 20 : 24;

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
        height: needsVirtualKeyboard ? '140px' : '120px',
        background: 'transparent',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        pointerEvents: 'none', // Allow clicks to pass through to input
        zIndex: 9,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: needsVirtualKeyboard ? '18px' : '6px',
      }}>
        {/* Disclaimer text */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: needsVirtualKeyboard ? '10px' : '11px',
          textAlign: 'center',
          fontWeight: '400',
          letterSpacing: '0.02em',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}>
          {t('aiCanMakeErrors')}
        </div>
      </div>
      
      {/* HLAVNÍ KONTEJNER */}
      <div className="input-bar-container" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transform: needsVirtualKeyboard && isKeyboardOpen 
          ? 'translateZ(0) translateY(0)' 
          : 'translateZ(0)',
        padding: needsVirtualKeyboard ? '0.5rem' : '1.5rem',
        paddingBottom: needsVirtualKeyboard 
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
            background: isDark
              ? 'rgba(0, 0, 0, 0.6)' // Dark mode: black glass
              : 'rgba(255, 255, 255, 0.06)', // Light mode: current white glass
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.15)' // Dark mode: slightly brighter border
              : '1px solid rgba(255, 255, 255, 0.08)', // Light mode: current border
            boxShadow: isDark
              ? '0 12px 40px rgba(0, 0, 0, 0.8)' // Dark mode: deeper shadow
              : '0 12px 40px rgba(0, 0, 0, 0.4)', // Light mode: current shadow
            padding: needsVirtualKeyboard ? '1rem' : '1.5rem',
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
                        onPreviewImage({
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
                        // 🎨 SIMPLE BACKGROUND - no complex gradients
                        background: doc.uploadStatus === 'error' 
                          ? 'rgba(239, 68, 68, 0.2)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        border: doc.uploadStatus === 'error' 
                          ? '2px solid #ef4444' 
                          : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        // 🎨 PROGRESSIVE OPACITY - starts dim, gets brighter with progress
                        opacity: doc.uploadStatus === 'error' 
                          ? 0.7 
                          : 0.4 + (doc.uploadProgress * 0.006), // 0.4 → 1.0
                        transition: 'opacity 0.2s ease',
                        // 🎯 SUBTLE PULSE ANIMATION when uploading
                        animation: doc.uploadStatus === 'uploading' ? 'progressPulse 2s infinite' : 'none',
                      }}
                    >
                      {/* X Button */}
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
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
            <style>{`
              .omnia-chat-input::placeholder {
                color: ${isRecording ? '#ff4444' : 'rgba(255, 255, 255, 0.6)'};
                opacity: 1;
              }
              
              /* Upload progress animation - subtle pulse on uploading cards */
              @keyframes progressPulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            `}</style>
            <textarea
              className="omnia-chat-input"
              ref={textareaRef}
              value={localInput}
              onChange={(e) => {
                setLocalInput(e.target.value);
                autoResize(e.target);
              }}
              onClick={(e) => {
                // iOS PWA fix - ensure focus on click
                if (needsVirtualKeyboard && window.navigator.standalone) {
                  e.target.focus();
                }
              }}
              onFocus={handleTextareaFocus}
              onBlur={handleTextareaBlur}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? getListeningPlaceholder() : (isLoading ? t('omniaPreparingResponse') : t('chatPlaceholder'))}
              disabled={isLoading}
              rows={1}
              style={{
                width: '100%',
                minHeight: needsVirtualKeyboard ? '50px' : '60px',
                maxHeight: '200px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.95)' // Dark mode: brighter white text
                  : 'rgba(255, 255, 255, 0.9)', // Light mode: current white text
                caretColor: 'white', // Force white cursor/caret color on all platforms
                fontSize: needsVirtualKeyboard ? '16px' : '18px',
                fontFamily: 'inherit',
                resize: 'none',
                lineHeight: '1.5',
                padding: '0.4rem',
                marginBottom: '0.3rem',
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
                gap: needsVirtualKeyboard ? '8px' : '12px',
              }}>
                {/* 1. PLUS BUTTON */}
                <button
                  ref={plusButtonRef}
                  onClick={() => {
                    // Close keyboard first on mobile
                    if (needsVirtualKeyboard && textareaRef.current) {
                      textareaRef.current.blur();
                    }
                    
                    // Wait for keyboard to close, then open file picker
                    setTimeout(() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.gif,.txt,application/pdf,image/png,image/jpeg,image/bmp,image/tiff,image/gif,text/plain';
                      input.onchange = handleDocumentUploadToChips;
                      input.click();
                    }, needsVirtualKeyboard ? 100 : 0);
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
                gap: needsVirtualKeyboard ? '8px' : '12px',
              }}>
                {/* 4. MIKROFON BUTTON */}
                <button
                  // Mobile: hold-to-talk
                  onTouchStart={needsVirtualKeyboard && !isLoading && !isAudioPlaying ? onSTT : undefined}
                  onTouchEnd={needsVirtualKeyboard && isRecording ? onSTT : undefined}
                  // Desktop: click-to-toggle  
                  onClick={!needsVirtualKeyboard ? onSTT : undefined}
                  disabled={isLoading || isAudioPlaying}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: isLoading || isAudioPlaying ? 'not-allowed' : 'pointer',
                    opacity: isLoading || isAudioPlaying ? 0.5 : 1,
                  }}
                  title={isRecording ? 'Stop Recording' : (needsVirtualKeyboard ? 'Hold to speak' : 'Voice Input')}
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
                  onClick={canSend ? handleSendMessage : onVoiceScreen}
                  disabled={isLoading || (pendingDocuments.length > 0 && !allUploadsCompleted)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: (isLoading || (pendingDocuments.length > 0 && !allUploadsCompleted)) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || (pendingDocuments.length > 0 && !allUploadsCompleted)) ? 0.5 : 1,
                  }}
                  title={canSend ? 'Send Message' : (pendingDocuments.length > 0 && !allUploadsCompleted) ? 'Uploading files...' : 'Voice Chat'}
                >
                  {(localInput.trim() || pendingDocuments.length > 0) ? 
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