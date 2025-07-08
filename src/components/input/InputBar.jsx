// 🚀 InputBar.jsx - CLAUDE.AI STYLE WITH FIXED BUTTONS
// ✅ Text area on top
// ✅ All buttons visible below
// ✅ One unified glass container

import React, { useState } from 'react';
import { getTranslation } from '../../utils/translations.js';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// 🎨 CLEAN SVG ICONS
const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor"></line>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor"></line>
  </svg>
);

const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor"></line>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor"></line>
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor"></line>
  </svg>
);

const MicIcon = ({ size = 20, className = "h-5 w-5 text-white" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

  // Unified button style for all toolbar actions
  const toolbarButtonStyle = {
    width: 34,
    height: 34,
    borderRadius: '8px',
    border: '1px solid rgba(0, 200, 200, 0.3)',
    background: 'rgba(0, 150, 150, 0.15)',
    color: 'rgba(255, 255, 255, 0.95)',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    opacity: isLoading ? 0.5 : 1
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
                  style={toolbarButtonStyle}
                  title="Add Content"
                >
                  <PlusIcon size={20} />
                </button>
                
                {/* MODELS BUTTON */}
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  disabled={isLoading}
                  style={toolbarButtonStyle}
                  title="AI Models"
                >
                  <MenuIcon size={20} />
                </button>
                
              {/* RESEARCH BUTTON */}
              <button
                onClick={handleDeepSearch}
                disabled={isLoading}
                style={toolbarButtonStyle}
                title="Deep Search"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-sky-900/50"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-white" />
              </button>
              </div>
              
              {/* CENTER: VOICE CHAT */}
              <button
                onClick={onVoiceScreen}
                disabled={isLoading}
                style={toolbarButtonStyle}
                title="Voice Chat"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-sky-900/50"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-white" />
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
                    ...toolbarButtonStyle,
                    color: isRecording ? '#ff4444' : toolbarButtonStyle.color,
                    cursor: (isLoading || isAudioPlaying) ? 'not-allowed' : toolbarButtonStyle.cursor,
                    opacity: (isLoading || isAudioPlaying) ? 0.5 : toolbarButtonStyle.opacity
                  }}
                  title={isRecording ? 'Stop Recording' : 'Voice Input'}
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-sky-900/50"
                >
                  <MicIcon className="h-5 w-5 text-white" />
                </button>
                
                {/* SEND BUTTON */}
                {input.trim() ? (
                  <button
                    onClick={onSend}
                    disabled={isLoading}
                    style={{
                      ...toolbarButtonStyle,
                      background: 'rgba(0, 150, 150, 0.85)',
                      border: '1px solid rgba(0, 200, 200, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Send"
                    className="w-10 h-10 flex items-center justify-center rounded-md bg-sky-900/50"
                  >
                    <svg className="h-5 w-5 text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" fill="currentColor" />
                    </svg>
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      ...toolbarButtonStyle,
                      background: 'rgba(0, 200, 200, 0.3)',
                      border: '1px solid rgba(0, 200, 200, 0.3)',
                      opacity: 0.5
                    }}
                    title="Send"
                    className="w-10 h-10 flex items-center justify-center rounded-md bg-sky-900/50"
                  >
                    <svg className="h-5 w-5 text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" fill="currentColor" />
                    </svg>
                  </button>
                )}
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