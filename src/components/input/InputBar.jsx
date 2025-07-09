// 🚀 InputBar.jsx - PŘESNĚ PODLE UI.MD
// ✅ Textarea nahoře, 4 kulatá tlačítka dole
// ✅ Žádné experimenty, čistý jednoduchý kód

import React, { useState } from 'react';
import { getTranslation } from '../../utils/translations.js';

// 🎨 SVG IKONY - BÍLÉ PRO VIDITELNOST
const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5"/>
  </svg>
);

const ResearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
    <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="9" x2="14" y2="9" stroke="white" strokeWidth="1.5"/>
    <line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.5"/>
    <line x1="8" y1="13" x2="12" y2="13" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const MikrofonIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="3" width="6" height="11" rx="3" stroke="white" strokeWidth="2"/>
    <path d="M5 10V11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11V10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2"/>
    <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2"/>
  </svg>
);

const OmniaVoiceIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <rect x="7" y="8" width="2" height="8" rx="1" fill="white"/>
    <rect x="11" y="5" width="2" height="14" rx="1" fill="white"/>
    <rect x="15" y="10" width="2" height="4" rx="1" fill="white"/>
  </svg>
);

const SendArrowIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
  </svg>
);

// PLUS MENU
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
              transition: 'background 0.2s'
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
  uiLanguage = 'cs'
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  const handleDeepSearch = () => {
    console.log('🔍 Deep Search clicked - Coming Soon!');
  };

  // UNIFIED BUTTON STYLE - KULATÉ PODLE UI.MD
  const buttonSize = isMobile ? 36 : 44; // VĚTŠÍ TLAČÍTKA
  const iconSize = isMobile ? 20 : 24; // VĚTŠÍ EMOJI

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
      {/* HLAVNÍ KONTEJNER */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '0.5rem' : '1.5rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0.5rem) + 0.5rem)' : '1.5rem',
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
            
            {/* TEXTAREA NAHOŘE */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? t('omniaPreparingResponse') : "Chat with Omnia..."}
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
              justifyContent: 'center',
              gap: isMobile ? '8px' : '12px',
            }}>
              
                            {/* 1. PLUS BUTTON */}
              <button
                onClick={() => setShowPlusMenu(true)}
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '20px' : '24px',
                  filter: 'invert(1)', // BÍLÉ PLUS
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
                title="Multimodal Features"
              >
                ➕
              </button>
              
              {/* 2. RESEARCH BUTTON */}
              <button
                onClick={handleDeepSearch}
                disabled={isLoading || !input.trim()}
                style={{
                  ...buttonStyle,
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '20px' : '24px',
                  filter: 'invert(1)', // BÍLÉ RESEARCH
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) e.target.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
                title="Deep Search"
              >
                🌐
              </button>
              
              {/* 3. MIKROFON BUTTON */}
              <button
                onClick={onSTT}
                disabled={isLoading || isAudioPlaying}
                style={{
                  ...buttonStyle,
                  background: isRecording ? 'rgba(255, 0, 0, 0.15)' : 'transparent',
                  opacity: isLoading || isAudioPlaying ? 0.5 : 1,
                  cursor: isLoading || isAudioPlaying ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '16px' : '20px',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isAudioPlaying && !isRecording) {
                    e.target.style.opacity = '0.7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRecording) {
                    e.target.style.opacity = '1';
                  }
                }}
                title={isRecording ? 'Stop Recording' : 'Voice Input'}
              >
                🎤︎︎
              </button>
              
              {/* 4. DYNAMIC BUTTON */}
              <button
                onClick={input.trim() ? onSend : onVoiceScreen}
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '16px' : '20px',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                }}
                title={input.trim() ? 'Send Message' : 'Voice Chat'}
              >
                {input.trim() ? '➤' : '💭'}
              </button>
              
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
    </>
  );
};

export default InputBar;