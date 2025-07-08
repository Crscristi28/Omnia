// 🚀 InputBar.jsx - CLAUDE.AI STYLE WITH FIXED BUTTONS
// ✅ Text area on top
// ✅ All buttons visible below
// ✅ One unified glass container

import React, { useState } from 'react';
import { getTranslation } from '../../utils/translations.js';

// 🎨 CLEAN SVG ICONS
const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor"></line>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor"></line>
  </svg>
);

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" stroke="currentColor"></circle>
    <path d="m21 21-4.35-4.35" stroke="currentColor"></path>
  </svg>
);

const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor"></line>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor"></line>
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor"></line>
  </svg>
);

const MicIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor"></path>
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor"></line>
    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor"></line>
  </svg>
);

// PLUS MENU COMPONENT
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

  // Unified button style
  const buttonStyle = {
    width: 36,
    height: 36,
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontSize: '18px'
  };

  return (
    <>
      {/* 🎨 CLAUDE.AI STYLE INPUT BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1.5rem',
        zIndex: 10,
        background: 'transparent',
        pointerEvents: 'none'
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
            
            {/* BOTTOM SECTION: BUTTONS */}
            <div style={{
              padding: isMobile ? '0.75rem' : '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              
              {/* LEFT GROUP */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                {/* PLUS BUTTON */}
                <button
                  onClick={() => setShowPlusMenu(true)}
                  disabled={isLoading}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  title="Add Content"
                >
                  <PlusIcon size={20} />
                </button>
                
                {/* MODELS BUTTON */}
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  disabled={isLoading}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  title="AI Models"
                >
                  <MenuIcon size={20} />
                </button>
                
                {/* RESEARCH BUTTON */}
                <button
                  onClick={handleDeepSearch}
                  disabled={isLoading}
                  style={{
                    width: 'auto',
                    height: 36,
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    gap: '6px',
                    fontSize: '14px',
                    padding: '0 14px',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  title="Deep Search"
                >
                  <SearchIcon size={16} />
                  <span>Research</span>
                </button>
              </div>
              
              {/* CENTER: VOICE CHAT */}
              <button
                onClick={onVoiceScreen}
                disabled={isLoading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.5 : 1
                }}
                title="Voice Chat"
              >
                {/* MiniOmniaLogo imported from OmniaLogos.jsx */}
                {/* eslint-disable-next-line */}
                {typeof MiniOmniaLogo !== "undefined" ? <MiniOmniaLogo /> : '🎙️'}
              </button>
              
              {/* RIGHT GROUP */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                {/* MICROPHONE BUTTON */}
                <button
                  onClick={onSTT}
                  disabled={isLoading || isAudioPlaying}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: isRecording ? '#ff4444' : '#ffffff',
                    cursor: (isLoading || isAudioPlaying) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: (isLoading || isAudioPlaying) ? 0.5 : 1
                  }}
                  title={isRecording ? 'Stop Recording' : 'Voice Input'}
                >
                  <MicIcon size={20} />
                </button>
                
                {/* SEND BUTTON */}
                <button
                  onClick={onSend}
                  disabled={isLoading || !input.trim()}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: input.trim()
                      ? 'rgba(255, 255, 255, 0.9)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: input.trim()
                      ? '#000000'
                      : '#ffffff',
                    cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  title="Send Message"
                >
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor"></polygon>
                  </svg>
                </button>
              </div>
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