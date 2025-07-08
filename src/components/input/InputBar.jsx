// 🚀 InputBar.jsx - FIXED podle fotky
// ✅ Clean white ikony, transparent tlačítka
// ✅ Správné pořadí: [+] [🔍] [≡] [🎤] [🎵/→]
// ✅ Dynamic Omnia/Send tlačítko úplně vpravo

import React, { useState } from 'react';
import { getTranslation } from '../../utils/translations.js';
import { MiniOmniaLogo } from '../ui/OmniaLogos.jsx';
import OmniaArrowButton from '../ui/OmniaArrowButton.jsx';

// 🎨 CLEAN SVG IKONY - přesně jako na fotce
const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const MicIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

// PLUS MENU COMPONENT (stejné jako předtím)
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
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
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
  uiLanguage = 'cs',
  model,
  setModel
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  const handleDeepSearch = () => {
    console.log('🔍 Research clicked - Coming Soon!');
  };

  // 🔧 RESPONSIVE SIZES podle fotky
  const buttonSize = isMobile ? 40 : 44;
  const iconSize = isMobile ? 18 : 20;

  const hasInput = input.trim().length > 0;

  return (
    <>
      {/* 🎨 INPUT AREA - přesně jako na fotce */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '1rem' : '2rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '2rem',
        zIndex: 10,
        background: 'transparent'
      }}>
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          
          {/* 💎 GLASS INPUT FIELD - přesně jako na fotce */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: isMobile ? '1.2rem 1.5rem' : '1.5rem 2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: isMobile ? '16px' : '18px',
                fontFamily: 'inherit',
                resize: 'none',
                lineHeight: '1.5',
                fontWeight: '400',
                letterSpacing: '0.01em'
              }}
            />
          </div>

          {/* 🔧 BUTTON BAR - SPRÁVNÉ POŘADÍ: [+] [🔍] [≡] [🎤] [🎵/→] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '1.2rem' : '1.5rem'
          }}>
            
            {/* 1. PLUS */}
            <button
              className="input-bar-button"
              onClick={() => setShowPlusMenu(true)}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.color = '#ffffff';
                }
              }}
              title="Add Content"
            >
              <PlusIcon size={iconSize} />
            </button>

            {/* 2. RESEARCH */}
            <button
              className="input-bar-button"
              onClick={handleDeepSearch}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.color = '#ffffff';
                }
              }}
              title="Research"
            >
              <SearchIcon size={iconSize} />
            </button>

            {/* 3. MODELS MENU */}
            <button
              className="input-bar-button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.color = '#ffffff';
                }
              }}
              title="AI Models"
            >
              <MenuIcon size={iconSize} />
            </button>

            {/* 4. MICROPHONE */}
            <button
              className="input-bar-button"
              onClick={onSTT}
              disabled={isLoading || isAudioPlaying}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                opacity: (isLoading || isAudioPlaying) ? 0.5 : 1,
                cursor: (isLoading || isAudioPlaying) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !isAudioPlaying) {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && !isAudioPlaying) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.color = '#ffffff';
                }
              }}
              title={isRecording ? 'Stop Recording' : 'Voice Input'}
            >
              <MicIcon size={iconSize} />
            </button>

            {/* 5. DYNAMIC OMNIA/SEND - ÚPLNĚ VPRAVO! */}
            {hasInput ? (
              <OmniaArrowButton
                onClick={onSend}
                disabled={isLoading || !input.trim()}
                loading={isLoading}
                isListening={isRecording}
                size={buttonSize}
              />
            ) : (
              <button
                className="input-bar-button"
                onClick={onVoiceScreen}
                disabled={isLoading}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(135, 206, 250, 0.8)', // Světle modrá
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.5 : 1,
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'rgba(135, 206, 250, 0.9)';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'rgba(135, 206, 250, 0.8)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
                title="Voice Chat"
              >
                <MiniOmniaLogo 
                  size={buttonSize - 4}
                  onClick={() => {}}
                  isAudioPlaying={isAudioPlaying}
                  loading={isLoading}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PLUS MENU MODAL */}
      <PlusMenu 
        isOpen={showPlusMenu}
        onClose={() => setShowPlusMenu(false)}
        uiLanguage={uiLanguage}
      />

      {/* MODEL DROPDOWN */}
      {showModelDropdown && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowModelDropdown(false)}
          />
          
          <div style={{
            position: 'fixed',
            bottom: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 1001,
            minWidth: '220px',
            overflow: 'hidden'
          }}>
            {[
              { key: 'claude', label: 'Omnia Claude', desc: 'Advanced reasoning' },
              { key: 'gpt-4o', label: 'Omnia GPT', desc: 'Fast responses' },
              { key: 'sonar', label: 'Omnia Search', desc: 'Real-time info' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => { 
                  setModel(item.key); 
                  setShowModelDropdown(false); 
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  background: model === item.key ? 'rgba(0, 78, 146, 0.1)' : 'transparent',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  color: 'rgba(0, 78, 146, 0.8)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (model !== item.key) {
                    e.target.style.background = 'rgba(0, 78, 146, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (model !== item.key) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ fontWeight: '500' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default InputBar;
// 💡 Input bar button styles for visibility
// (Move to CSS file in real project)
const style = document.createElement('style');
style.innerHTML = `
.input-bar-button {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  opacity: 1 !important;
  border-radius: 12px !important;
  padding: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
`;
if (typeof window !== 'undefined' && !document.querySelector('style[data-input-bar-button]')) {
  style.setAttribute('data-input-bar-button', 'true');
  document.head.appendChild(style);
}