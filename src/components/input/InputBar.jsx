// 🚀 InputBar.jsx - COMPLETE REDESIGN
// ✅ 4 circular buttons: Plus | Research | Mikrofon | Dynamic
// ✅ Crystal glass container with layered button backgrounds
// ✅ Mobile & Desktop responsive
// ✅ No model selector (moved to header)

import React, { useState } from 'react';
import '../../App.css';
import { getTranslation } from '../../utils/translations.js';
import sonarService from '../../services/sonar.service.js';

// 🎨 SVG ICONS - BETTER CONTRAST
const PlusIcon = ({ size = 20, color = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 2, display: 'block' }}>
    <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2.5"></line>
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5"></line>
  </svg>
);

const ResearchIcon = ({ size = 20, color = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 2, display: 'block' }}>
    <circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2.5"></circle>
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2.5" strokeLinecap="round"></path>
    <line x1="9" y1="11" x2="13" y2="11" stroke={color} strokeWidth="2.5"></line>
    <line x1="9" y1="13" x2="13" y2="13" stroke={color} strokeWidth="2.5"></line>
  </svg>
);

const MikrofonIcon = ({ size = 20, color = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 2, display: 'block' }}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3z" fill={color}></path>
    <path d="M19 11c0 3.03-2.13 5.44-5 5.92V21h2v2H8v-2h2v-4.08C7.13 16.44 5 14.03 5 11" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"></path>
  </svg>
);

const OmniaVoiceIcon = ({ size = 20, color = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 2, display: 'block' }}>
    <circle cx="12" cy="12" r="10" fill="rgba(255, 255, 255, 0.2)"/>
    <rect x="9" y="8" width="2" height="8" rx="1" fill={color}/>
    <rect x="11" y="6" width="2" height="12" rx="1" fill={color}/>
    <rect x="13" y="9" width="2" height="6" rx="1" fill={color}/>
  </svg>
);

const SendArrowIcon = ({ size = 20, color = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 2, display: 'block' }}>
    <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" fill={color}/>
  </svg>
);

// 🆕 PLUS MENU COMPONENT (Simplified - NO research)
const PlusMenu = ({ isOpen, onClose, uiLanguage = 'cs' }) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: '📄', key: 'document', labelCs: 'Přidat dokument', labelEn: 'Add document', labelRo: 'Adaugă document' },
    { icon: '📸', key: 'photo', labelCs: 'Přidat fotku', labelEn: 'Add photo', labelRo: 'Adaugă poză' },
    { icon: '📷', key: 'camera', labelCs: 'Vyfotit', labelEn: 'Take photo', labelRo: 'Fă poză' },
    { icon: '🎨', key: 'generate', labelCs: 'Vytvořit obrázek', labelEn: 'Generate image', labelRo: 'Generează imagine' }
  ];

  const getLabel = (item) => {
    switch (uiLanguage) {
      case 'en': return item.labelEn;
      case 'ro': return item.labelRo;
      default: return item.labelCs;
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      <div style={{
        position: 'fixed',
        bottom: '140px',
        left: '20px',
        background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.95))',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1001,
        minWidth: '280px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          color: '#ffffff',
          fontWeight: '600'
        }}>
          🚀 {uiLanguage === 'cs' ? 'Multimodální funkce' : 
               uiLanguage === 'en' ? 'Multimodal features' : 
               'Funcții multimodale'}
        </div>

        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              console.log(`${item.key} clicked - Coming Soon!`);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '1rem',
              border: 'none',
              background: 'transparent',
              color: '#e2e8f0',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span>{getLabel(item)}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5, fontStyle: 'italic' }}>
              Soon
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

const InputBar = ({ 
  input,
  setInput,
  onSend,
  onSTT,
  onVoiceScreen,
  isLoading,
  isRecording,
  isAudioPlaying,
  uiLanguage = 'cs'
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

  // 🔍 SONAR RESEARCH FUNCTION
  const handleResearch = async () => {
    if (!input.trim() || isLoading) return;
    
    try {
      console.log('🔍 Starting Sonar research for:', input.trim());
      const searchResult = await sonarService.search(input.trim(), null, uiLanguage);
      
      if (searchResult.success) {
        // Add research result as new message
        console.log('✅ Research completed:', searchResult.result.substring(0, 100) + '...');
        // You can integrate this with your message system
      } else {
        console.error('❌ Research failed:', searchResult.message);
      }
    } catch (error) {
      console.error('💥 Research error:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  // 🎨 UNIFIED SQUARE BUTTON STYLE - FIXED VISIBILITY & NO SHIFTING
  const getSquareButtonStyle = (isActive = false) => ({
    width: isMobile ? 40 : 44,
    height: isMobile ? 40 : 44,
    minWidth: isMobile ? 40 : 44,
    minHeight: isMobile ? 40 : 44,
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#e2e8f0',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isLoading ? 0.5 : 1,
    outline: 'none',
    fontWeight: 'bold',
    padding: 0,
    position: 'relative',
    transition: 'none',
    transform: 'none',
    boxSizing: 'border-box',
  });

  // Remove transform/scale on hover, only color highlight if needed
  const handleButtonHover = (e, isEnter) => {
    if (isLoading) return;
    e.target.style.transition = 'none';
    e.target.style.transform = 'none';
    if (isEnter) {
      e.target.style.background = 'rgba(100, 150, 255, 0.13)';
    } else {
      e.target.style.background = 'transparent';
    }
  };

  return (
    <>
      {/* 🎨 CRYSTAL GLASS INPUT CONTAINER */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1.5rem',
        zIndex: 10,
        background: 'transparent',
        pointerEvents: 'auto'
      }}>
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          pointerEvents: 'auto'
        }}>
          
          {/* 💎 UNIFIED GLASS CONTAINER */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }}>
            
            {/* TOP SECTION: TEXTAREA */}
            <div style={{
              padding: isMobile ? '1rem 1.5rem' : '1.25rem 1.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? t('omniaPreparingResponse') : "Chat with Omnia..."}
                disabled={isLoading}
                rows={1}
                style={{
                  width: '100%',
                  minHeight: isMobile ? '24px' : '28px',
                  maxHeight: '120px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: isMobile ? '16px' : '18px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  lineHeight: '1.5',
                  fontWeight: '400',
                  letterSpacing: '0.01em'
                }}
              />
            </div>
            
            {/* BOTTOM SECTION: 4 CIRCULAR BUTTONS */}
            <div style={{
              padding: isMobile ? '12px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '8px' : '12px'
            }}>
              
              {/* 1. PLUS BUTTON */}
              <div
                style={{
                  width: isMobile ? 40 : 44,
                  height: isMobile ? 40 : 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'none',
                  transform: 'none',
                }}
              >
                <button
                  onClick={() => setShowPlusMenu(true)}
                  disabled={isLoading}
                  style={getSquareButtonStyle()}
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                  title="Multimodal Features"
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: '6px',
                    position: 'relative',
                    transition: 'none',
                    transform: 'none',
                  }}>
                    <PlusIcon size={20} color="#FFD700" />
                  </div>
                </button>
              </div>

              {/* 2. RESEARCH BUTTON */}
              <div
                style={{
                  width: isMobile ? 40 : 44,
                  height: isMobile ? 40 : 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'none',
                  transform: 'none',
                }}
              >
                <button
                  onClick={handleResearch}
                  disabled={isLoading || !input.trim()}
                  style={getSquareButtonStyle()}
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                  title="Deep Search"
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: '6px',
                    position: 'relative',
                    transition: 'none',
                    transform: 'none',
                  }}>
                    <ResearchIcon size={20} color="#FFD700" />
                  </div>
                </button>
              </div>

              {/* 3. MIKROFON BUTTON */}
              <div
                style={{
                  width: isMobile ? 40 : 44,
                  height: isMobile ? 40 : 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'none',
                  transform: 'none',
                }}
              >
                <button
                  onClick={onSTT}
                  disabled={isLoading || isAudioPlaying}
                  style={getSquareButtonStyle(isRecording)}
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                  title={isRecording ? 'Stop Recording' : 'Voice Input'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: '6px',
                    position: 'relative',
                    transition: 'none',
                    transform: 'none',
                  }}>
                    <MikrofonIcon size={20} color="#FFD700" />
                  </div>
                </button>
              </div>

              {/* 4. DYNAMIC BUTTON - Omnia Voice OR Send */}
              {input.trim() ? (
                <div
                  style={{
                    width: isMobile ? 40 : 44,
                    height: isMobile ? 40 : 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'none',
                    transform: 'none',
                  }}
                >
                  <button
                    onClick={onSend}
                    disabled={isLoading}
                    style={{
                      ...getSquareButtonStyle(),
                      background: 'transparent',
                      color: '#e2e8f0'
                    }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    title="Send Message"
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '6px',
                      position: 'relative',
                      transition: 'none',
                      transform: 'none',
                    }}>
                      <SendArrowIcon size={20} color="#FFD700" />
                    </div>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    width: isMobile ? 40 : 44,
                    height: isMobile ? 40 : 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'none',
                    transform: 'none',
                  }}
                >
                  <button
                    onClick={onVoiceScreen}
                    disabled={isLoading}
                    style={getSquareButtonStyle()}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    title="Voice Chat"
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '6px',
                      position: 'relative',
                      transition: 'none',
                      transform: 'none',
                    }}>
                      <OmniaVoiceIcon size={20} color="#FFD700" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PLUS MENU MODAL */}
      <PlusMenu 
        isOpen={showPlusMenu}
        onClose={() => setShowPlusMenu(false)}
        uiLanguage={uiLanguage}
      />

      {/* 🎵 TRADEMARK ATTRIBUTION */}
      <div style={{
        position: 'fixed',
        bottom: '8px',
        right: '12px',
        fontSize: '10px',
        opacity: 0.6,
        color: 'rgba(255, 255, 255, 0.5)',
        zIndex: 11,
        pointerEvents: 'none'
      }}>
        Powered by ElevenLabs
      </div>
    </>
  );
};

export default InputBar;