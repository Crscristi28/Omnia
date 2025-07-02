// 🚀 InputBar.jsx - FIXED UNIFIED GLASS DESIGN
// ✅ JEDNA glass karta pro celý input area
// ✅ Kruhové buttony (menší ale ne oválné!)
// ✅ Clean design jako na fotce

import React, { useState } from 'react';
import { getTranslation } from '../../utils/translations.js';
import { MiniOmniaLogo } from '../ui/OmniaLogos.jsx';
import OmniaArrowButton from '../ui/OmniaArrowButton.jsx';

// 🆕 PLUS MENU COMPONENT
const PlusMenu = ({ 
  isOpen, 
  onClose, 
  uiLanguage = 'cs' 
}) => {
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
      {/* Backdrop */}
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
      
      {/* Menu */}
      <div style={{
        position: 'fixed',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.95))',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1001,
        minWidth: '280px',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
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

        {/* Menu Items */}
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
              transition: 'all 0.2s ease',
              borderTop: 'none'
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
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '0.7rem', 
              opacity: 0.5,
              fontStyle: 'italic'
            }}>
              Soon
            </span>
          </button>
        ))}

        {/* Footer */}
        <div style={{
          padding: '0.8rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          {uiLanguage === 'cs' ? 'Funkce budou brzy dostupné' : 
           uiLanguage === 'en' ? 'Features coming soon' : 
           'Funcțiile vor fi disponibile în curând'}
        </div>
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

  // 🔧 FIXED: Menší ale KRUHOVÉ buttony
  const buttonSize = isMobile ? 42 : 48; // Menší než original 54/60

  return (
    <>
      {/* 🆕 UNIFIED GLASS CONTAINER - JEDNA KARTA PRO VŠE */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8))',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 10,
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1.5rem'
      }}>
        
        {/* GLASS CARD - vše uvnitř jedné karty */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: isMobile ? '1rem' : '1.2rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(16px)'
        }}>
          
          {/* TEXTAREA */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? t('omniaPreparingResponse') : `${t('sendMessage')} Omnia...`}
            disabled={isLoading}
            rows={3}
            style={{
              width: '100%',
              minHeight: '60px',
              maxHeight: '120px',
              padding: '12px 16px',
              fontSize: isMobile ? '16px' : '15px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              outline: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              transition: 'all 0.3s ease',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              marginBottom: '12px'
            }}
          />

          {/* BUTTON ROW */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px'
          }}>
            
            {/* PLUS BUTTON */}
            <button
              onClick={() => setShowPlusMenu(true)}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%', // ✅ KRUHOVÝ!
                border: 'none',
                background: 'linear-gradient(45deg, #6b73ff, #9b59b6)',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(107, 115, 255, 0.3)'
              }}
              title="Plus Menu"
            >
              +
            </button>

            {/* DEEP SEARCH BUTTON */}
            <button
              onClick={handleDeepSearch}
              disabled={isLoading}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%', // ✅ KRUHOVÝ!
                border: 'none',
                background: 'linear-gradient(45deg, #17a2b8, #20c997)',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
              }}
              title="Deep Search"
            >
              🔍
            </button>

            {/* STT BUTTON */}
            <button
              onClick={onSTT}
              disabled={isLoading || isAudioPlaying}
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%', // ✅ KRUHOVÝ!
                border: 'none',
                background: isRecording 
                  ? 'linear-gradient(45deg, #dc3545, #c82333)' 
                  : 'linear-gradient(45deg, #28a745, #20c997)',
                color: 'white',
                cursor: (isLoading || isAudioPlaying) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                opacity: (isLoading || isAudioPlaying) ? 0.5 : 1,
                boxShadow: isRecording 
                  ? '0 0 20px rgba(220, 53, 69, 0.5)' 
                  : '0 4px 12px rgba(40, 167, 69, 0.3)'
              }}
              title={isRecording ? 'Zastavit nahrávání' : 'Speech-to-Text'}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>

            {/* VOICE SCREEN LOGO */}
            <MiniOmniaLogo 
              size={buttonSize} 
              onClick={onVoiceScreen}
              isAudioPlaying={isAudioPlaying}
              isListening={false}
              loading={isLoading} 
              streaming={false}
            />

            {/* SEND BUTTON */}
            <OmniaArrowButton
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              loading={isLoading}
              isListening={isRecording}
              size={buttonSize}
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