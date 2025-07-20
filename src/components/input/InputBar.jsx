// 🚀 InputBar.jsx - PŘESNĚ PODLE UI.MD
// ✅ Textarea nahoře, 4 kulatá tlačítka dole
// ✅ Žádné experimenty, čistý jednoduchý kód

import React, { useState, useRef } from 'react';
import { Plus, Search, Mic, Send, AudioWaveform, FileText, Camera, Image, Palette, Sparkles } from 'lucide-react';
import { getTranslation } from '../../utils/text';

// Using Lucide React icons instead of custom SVG components

// PLUS MENU
const PlusMenu = ({ isOpen, onClose, buttonRef, onImageGenerate, uiLanguage = 'cs' }) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: FileText, key: 'document', labelCs: 'Přidat dokument', labelEn: 'Add document', labelRo: 'Adaugă document' },
    { icon: Image, key: 'photo', labelCs: 'Přidat fotku', labelEn: 'Add photo', labelRo: 'Adaugă poză' },
    { icon: Camera, key: 'camera', labelCs: 'Vyfotit', labelEn: 'Take photo', labelRo: 'Fă poză' },
    { icon: Palette, key: 'generate', labelCs: 'Vytvořit obrázek', labelEn: 'Generate image', labelRo: 'Generează imagine' }
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
          {uiLanguage === 'cs' ? 'Multimodální funkce' : 
           uiLanguage === 'en' ? 'Multimodal features' : 
           'Funcții multimodale'}
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
  onSTT,
  onVoiceScreen,
  onImageGenerate,
  isLoading,
  isRecording,
  isAudioPlaying,
  isImageMode = false,
  uiLanguage = 'cs'
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusButtonRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

  const handleKeyDown = (e) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      onSend();
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
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    opacity: isLoading ? 0.5 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.target.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  title={t('multimodalFeatures')}
                >
                  <Plus size={iconSize} strokeWidth={2} />
                </button>
                
                {/* 2. RESEARCH BUTTON */}
                <button
                  onClick={handleDeepSearch}
                  disabled={isLoading || !input.trim()}
                  style={{
                    ...buttonStyle,
                    opacity: isLoading || !input.trim() ? 0.5 : 1,
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && input.trim()) e.target.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  title={t('deepSearch')}
                >
                  <Search size={iconSize} strokeWidth={2} />
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
                      color: isImageMode ? '#3B82F6' : 'rgba(255, 255, 255, 0.7)'
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
                    ...buttonStyle,
                    background: isRecording ? 'rgba(255, 0, 0, 0.15)' : 'transparent',
                    opacity: isLoading || isAudioPlaying ? 0.5 : 1,
                    cursor: isLoading || isAudioPlaying ? 'not-allowed' : 'pointer',
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
                  <Mic size={iconSize} strokeWidth={2} />
                </button>
                
                {/* 5. DYNAMIC BUTTON */}
                <button
                  onClick={input.trim() ? onSend : onVoiceScreen}
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    opacity: isLoading ? 0.5 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.target.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  title={input.trim() ? 'Send Message' : 'Voice Chat'}
                >
                  {input.trim() ? 
                    <Send size={iconSize} strokeWidth={2} /> : 
                    <AudioWaveform size={iconSize} strokeWidth={2} />
                  }
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
        buttonRef={plusButtonRef}
        onImageGenerate={onImageGenerate}
        uiLanguage={uiLanguage}
      />
    </>
  );
};

export default InputBar;