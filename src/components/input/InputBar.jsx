// 🚀 InputBar.jsx - FIXED ARROW BUTTON
// ✅ Arrow button nyní funguje správně

import React, { useState } from 'react';
import { getTranslation } from '../../utils/translations.js';
import { MiniOmniaLogo } from '../ui/OmniaLogos.jsx';
import OmniaArrowButton from '../ui/OmniaArrowButton.jsx';

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

  // 🔧 OPTIMALIZOVANÉ VELIKOSTI PRO MOBIL
  const buttonSize = isMobile ? 34 : 44;
  const iconSize = isMobile ? '14px' : '18px';

  return (
    <>
      {/* 🎨 FLOATING INPUT CONTAINER - BEZ POZADÍ */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '0.5rem' : '1.5rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0.5rem) + 0.5rem)' : '1.5rem',
        zIndex: 10,
      }}>
        
        {/* FLOATING GLASS CARD */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '24px',
          padding: isMobile ? '0.6rem' : '1rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          
          {/* TEXTAREA */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? t('omniaPreparingResponse') : `${t('sendMessage')} Omnia...`}
            disabled={isLoading}
            rows={2}
            style={{
              width: '100%',
              minHeight: isMobile ? '44px' : '50px',
              maxHeight: isMobile ? '80px' : '100px',
              padding: isMobile ? '8px 12px' : '10px 14px',
              fontSize: isMobile ? '16px' : '15px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              outline: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              transition: 'all 0.3s ease',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              marginBottom: '8px'
            }}
          />

          {/* 🎯 NOVÉ ROZLOŽENÍ TLAČÍTEK - GRID PRO MOBIL */}
          <div style={{
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? '1fr 1fr auto 1fr 1fr' : undefined,
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px',
            padding: isMobile ? '0 2px' : '0',
          }}>
            
            {/* PLUS BUTTON */}
            <button
              onClick={() => setShowPlusMenu(true)}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #6b73ff, #9b59b6)',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: iconSize,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1,
                boxShadow: '0 3px 10px rgba(107, 115, 255, 0.3)',
                justifySelf: isMobile ? 'center' : undefined
              }}
              title="Plus Menu"
            >
              +
            </button>

            {/* DEEP SEARCH */}
            <button
              onClick={handleDeepSearch}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #17a2b8, #20c997)',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: iconSize,
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1,
                boxShadow: '0 3px 10px rgba(23, 162, 184, 0.3)',
                justifySelf: isMobile ? 'center' : undefined
              }}
              title="Deep Search"
            >
              🔍
            </button>

            {/* SPACER PRO DESKTOP / OMNIA LOGO PRO MOBIL */}
            {!isMobile && <div style={{ flex: 1 }} />}
            
            {/* VOICE SCREEN (Omnia Logo) */}
            <div style={{
              justifySelf: isMobile ? 'center' : undefined,
              margin: isMobile ? '0' : '0 auto'
            }}>
              <MiniOmniaLogo 
                size={buttonSize + 4}
                onClick={onVoiceScreen}
                isAudioPlaying={isAudioPlaying}
                isListening={false}
                loading={isLoading} 
                streaming={false}
              />
            </div>

            {/* SPACER PRO DESKTOP */}
            {!isMobile && <div style={{ flex: 1 }} />}

            {/* STT BUTTON */}
            <button
              onClick={onSTT}
              disabled={isLoading || isAudioPlaying}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%',
                border: 'none',
                background: isRecording 
                  ? 'linear-gradient(135deg, #dc3545, #c82333)' 
                  : 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                cursor: (isLoading || isAudioPlaying) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: iconSize,
                transition: 'all 0.3s ease',
                opacity: (isLoading || isAudioPlaying) ? 0.5 : 1,
                boxShadow: isRecording 
                  ? '0 0 16px rgba(220, 53, 69, 0.5)' 
                  : '0 3px 10px rgba(40, 167, 69, 0.3)',
                justifySelf: isMobile ? 'center' : undefined
              }}
              title={isRecording ? 'Zastavit nahrávání' : 'Speech-to-Text'}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>

            {/* ✅ SEND ARROW - OPRAVENO! */}
            <OmniaArrowButton
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              loading={isLoading}
              isListening={isRecording}
              size={buttonSize}
              style={{ justifySelf: isMobile ? 'center' : undefined }}
            />
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