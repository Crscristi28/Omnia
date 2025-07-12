// 🚀 InputBar.jsx - PŘESNĚ PODLE UI.MD
// ✅ Textarea nahoře, 4 kulatá tlačítka dole
// ✅ Glass morphism design, SVG ikony s emoji fallback
// ✅ Modulární Send/Voice Chat, Microphone místo Menu
// ✅ Production-ready, responzivní

import React, { useState, useEffect } from 'react';
import { getTranslation } from '../../utils/translations.js';

// 🎨 SVG IKONY S FALLBACK NA EMOJI
const PlusIcon = ({ size = 18, isDarkMode }) => (
  isDarkMode ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M12 5V19M5 12H19" />
    </svg>
  ) : (
    <span role="img" aria-label="Add">➕</span>
  )
);

const ResearchIcon = ({ size = 18, isDarkMode }) => (
  isDarkMode ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21L16.65 16.65" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <span role="img" aria-label="Research">🌐</span>
  )
);

const MicrophoneIcon = ({ size = 18, isDarkMode }) => (
  isDarkMode ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 10V11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11V10" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  ) : (
    <span role="img" aria-label="Microphone">🎤</span>
  )
);

const VoiceIcon = ({ size = 18, isDarkMode }) => (
  isDarkMode ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <rect x="7" y="8" width="2" height="8" rx="1" />
      <rect x="11" y="5" width="2" height="14" rx="1" />
      <rect x="15" y="10" width="2" height="4" rx="1" />
    </svg>
  ) : (
    <span role="img" aria-label="Voice">💭</span>
  )
);

const SendArrowIcon = ({ size = 18, isDarkMode }) => (
  isDarkMode ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
    </svg>
  ) : (
    <span role="img" aria-label="Send">➤</span>
  )
);

// PLUS MENU (JEN DESIGN)
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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
          🚀 {uiLanguage === 'cs' ? 'Multimodální funkce' : uiLanguage === 'en' ? 'Multimodal features' : 'Funcții multimodale'}
        </div>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              console.log(`${item.key} clicked`);
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
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span>{getLabel(item)}</span>
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

  // DETEKCE DARK MODE
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleKeyDown = (e) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  const handlePlusClick = () => {
    if (!isLoading) setShowPlusMenu(true);
  };

  const handleResearchClick = () => {
    if (!isLoading && input.trim()) {
      console.log('🔍 Research clicked - Placeholder for future Claude API');
    }
  };

  const handleMicrophoneClick = () => {
    if (!isLoading && !isAudioPlaying) onSTT();
  };

  // UNIFIED BUTTON STYLE
  const buttonSize = isMobile ? 36 : 44;
  const iconSize = isMobile ? 20 : 24;

  const buttonStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: '50%',
    border: 'none',
    background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    color: isDarkMode ? '#fff' : '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s, background 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '0.5rem' : '1.5rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0.5rem) + 0.5rem)' : '1.5rem',
        zIndex: 10,
        background: isDarkMode ? 'linear-gradient(to top, #1a1a1a, #2c2c2c)' : 'linear-gradient(to top, #f0f0f0, #fff)',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div style={{
            background: isDarkMode ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDarkMode ? '0 12px 40px rgba(0, 0, 0, 0.6)' : '0 12px 40px rgba(0, 0, 0, 0.2)',
            padding: isMobile ? '0.6rem' : '1rem',
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? t('omniaPreparingResponse') : "Chat with Omnie..."}
              disabled={isLoading}
              rows={1}
              style={{
                width: '100%',
                minHeight: isMobile ? '40px' : '48px',
                maxHeight: '120px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: isDarkMode ? '#fff' : '#000',
                fontSize: isMobile ? '16px' : '18px',
                fontFamily: 'inherit',
                resize: 'none',
                lineHeight: '1.5',
                padding: '0.5rem',
                marginBottom: '0.5rem',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: isMobile ? '8px' : '12px',
            }}>
              {/* 1. PLUS BUTTON (FUTURE FEATURES) */}
              <button
                onClick={handlePlusClick}
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: iconSize,
                }}
                onMouseEnter={(e) => { if (!isLoading) e.target.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
                title="Multimodal Features (Coming Soon)"
              >
                <PlusIcon size={iconSize} isDarkMode={isDarkMode} />
              </button>

              {/* 2. RESEARCH BUTTON (FUTURE DEEP SEARCH) */}
              <button
                onClick={handleResearchClick}
                disabled={isLoading || !input.trim()}
                style={{
                  ...buttonStyle,
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: iconSize,
                }}
                onMouseEnter={(e) => { if (!isLoading && input.trim()) e.target.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
                title="Deep Search (Coming Soon)"
              >
                <ResearchIcon size={iconSize} isDarkMode={isDarkMode} />
              </button>

              {/* 3. MICROPHONE BUTTON */}
              <button
                onClick={handleMicrophoneClick}
                disabled={isLoading || isAudioPlaying}
                style={{
                  ...buttonStyle,
                  background: isRecording ? 'rgba(255, 0, 0, 0.15)' : 'transparent',
                  opacity: isLoading || isAudioPlaying ? 0.5 : 1,
                  cursor: isLoading || isAudioPlaying ? 'not-allowed' : 'pointer',
                  fontSize: iconSize,
                }}
                onMouseEnter={(e) => { if (!isLoading && !isAudioPlaying && !isRecording) e.target.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { if (!isRecording) e.target.style.opacity = '1'; }}
                title={isRecording ? 'Stop Recording' : 'Voice Input'}
              >
                <MicrophoneIcon size={iconSize} isDarkMode={isDarkMode} />
              </button>

              {/* 4. SEND/VOICE CHAT BUTTON (MODULÁRNÍ) */}
              <button
                onClick={input.trim() ? onSend : onVoiceScreen}
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: iconSize,
                }}
                onMouseEnter={(e) => { if (!isLoading) e.target.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
                title={input.trim() ? 'Send Message' : 'Voice Chat'}
              >
                {input.trim() ? <SendArrowIcon size={iconSize} isDarkMode={isDarkMode} /> : <VoiceIcon size={iconSize} isDarkMode={isDarkMode} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PlusMenu isOpen={showPlusMenu} onClose={() => setShowPlusMenu(false)} uiLanguage={uiLanguage} />
    </>
  );
};

export default InputBar;