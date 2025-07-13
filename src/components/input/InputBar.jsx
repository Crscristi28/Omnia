// 🚀 InputBar.jsx - PŘESNĚ PODLE UI.MD
// ✅ Textarea nahoře, 4 kulatá tlačítka dole
// ✅ Žádné experimenty, čistý jednoduchý kód

import React, { useState } from 'react';
import { Plus, Search, Mic, Send, AudioWaveform, FileText, Camera, Image, Palette, Sparkles } from 'lucide-react';
import { getTranslation } from '../../utils/text';

// Using Lucide React icons instead of custom SVG components

// PLUS MENU
const PlusMenu = ({ isOpen, onClose, uiLanguage = 'cs' }) => {
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

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[1000] backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu container */}
      <div className="fixed bottom-[140px] left-5 z-[1002] min-w-[280px] overflow-hidden rounded-2xl bg-gray-900/98 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl border border-white/20">
        {/* Header */}
        <div className="p-4 border-b border-white/20 text-center text-white font-semibold bg-gray-800/50">
          <Sparkles className="w-5 h-5 inline-block mr-2 text-blue-400" strokeWidth={2} />
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
                console.log(`${item.key} clicked - Coming Soon!`);
                onClose();
              }}
              className="flex items-center gap-4 w-full p-4 border-none bg-transparent text-white text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-blue-300"
            >
              <IconComponent className="w-5 h-5 text-blue-400" strokeWidth={2} />
              <span className="font-medium">{getLabel(item)}</span>
              <span className="ml-auto text-xs text-gray-400 italic font-normal">
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
  isLoading,
  isRecording,
  isAudioPlaying,
  uiLanguage = 'cs'
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
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
                  title="Multimodal Features"
                >
                  <Plus size={iconSize} strokeWidth={2} />
                </button>
                
                {/* 2. RESEARCH BUTTON */}
                <button
                  onClick={handleDeepSearch}
                  disabled={isLoading || !input.trim()}
                  style={{
                    ...buttonStyle,
                    width: 'auto',
                    paddingLeft: isMobile ? '12px' : '16px',
                    paddingRight: isMobile ? '12px' : '16px',
                    opacity: isLoading || !input.trim() ? 0.5 : 1,
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && input.trim()) e.target.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  title="Deep Search"
                >
                  <Search size={iconSize} strokeWidth={2} />
                  <span style={{ fontSize: isMobile ? '14px' : '16px' }}>Research</span>
                </button>
              </div>
              
              {/* RIGHT SIDE BUTTONS */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '12px',
              }}>
                {/* 3. MIKROFON BUTTON */}
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
                
                {/* 4. DYNAMIC BUTTON */}
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
        uiLanguage={uiLanguage}
      />
    </>
  );
};

export default InputBar;