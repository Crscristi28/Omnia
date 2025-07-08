// 🚀 InputBar.jsx - CLAUDE.AI STYLE WITH FIXED BUTTONS
// ✅ Text area on top
// ✅ All buttons visible below
// ✅ One unified glass container

import React, { useState } from 'react';
import '../../App.css'; // Ensure global styles (including responsive input bar styles) are loaded
import { getTranslation } from '../../utils/translations.js';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon, MicrophoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

// 🎨 CLEAN SVG ICONS
const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19" stroke="white"></line>
    <line x1="5" y1="12" x2="19" y2="12" stroke="white"></line>
  </svg>
);

const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
    <line x1="3" y1="6" x2="21" y2="6" stroke="white"></line>
    <line x1="3" y1="12" x2="21" y2="12" stroke="white"></line>
    <line x1="3" y1="18" x2="21" y2="18" stroke="white"></line>
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
    width: isMobile ? 28 : 34,
    height: isMobile ? 28 : 34,
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
            {isMobile ? (
              <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', padding: '0.75rem' }}>
                {/* PLUS BUTTON */}
                <button onClick={() => setShowPlusMenu(true)} disabled={isLoading} style={toolbarButtonStyle} title="Add Content">
                  <PlusIcon size={20} />
                </button>

                {/* MODELS BUTTON */}
                <button onClick={() => setShowModelDropdown(!showModelDropdown)} disabled={isLoading} style={toolbarButtonStyle} title="AI Models">
                  <MenuIcon size={20} />
                </button>

                {/* RESEARCH BUTTON */}
                <button onClick={handleDeepSearch} disabled={isLoading} style={toolbarButtonStyle} title="Deep Search">
                  <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" width="20" height="20">
                    <circle cx="10" cy="10" r="6" />
                    <line x1="14" y1="14" x2="20" y2="20" />
                    <line x1="8" y1="9" x2="12" y2="9" />
                    <line x1="8" y1="11" x2="12" y2="11" />
                  </svg>
                </button>

                {/* OMNIA BUTTON */}
                <button onClick={onVoiceScreen} disabled={isLoading} style={toolbarButtonStyle} title="Voice Chat">
                  <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" width="20" height="20">
                    <line x1="4" y1="12" x2="4" y2="16" />
                    <line x1="8" y1="8" x2="8" y2="16" />
                    <line x1="12" y1="4" x2="12" y2="16" />
                    <line x1="16" y1="10" x2="16" y2="16" />
                    <line x1="20" y1="14" x2="20" y2="16" />
                  </svg>
                </button>

                {/* MICROPHONE BUTTON */}
                <button onClick={onSTT} disabled={isLoading || isAudioPlaying} style={toolbarButtonStyle} title={isRecording ? 'Stop Recording' : 'Voice Input'}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="white" strokeWidth="1.5">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.5-2 4.5-4.5 4.5S8 13.5 8 11H6c0 3.03 2.13 5.44 5 5.92V21h2v-4.08c2.87-.48 5-2.89 5-5.92h-2z"/>
                  </svg>
                </button>

                {/* SEND BUTTON */}
                {input.trim() ? (
                  <button onClick={onSend} disabled={isLoading} style={{ ...toolbarButtonStyle, background: 'rgba(0, 150, 150, 0.85)', border: '1px solid rgba(0, 200, 200, 0.3)' }} title="Send">
                    <svg className="h-5 w-5" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5">
                      <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" />
                    </svg>
                  </button>
                ) : (
                  <button disabled style={{ ...toolbarButtonStyle, opacity: 0.5 }} title="Send">
                    <svg className="h-5 w-5" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5">
                      <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                padding: '1rem',
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
                  >
                    <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" width="20" height="20">
                      <circle cx="10" cy="10" r="6" />
                      <line x1="14" y1="14" x2="20" y2="20" />
                      <line x1="8" y1="9" x2="12" y2="9" />
                      <line x1="8" y1="11" x2="12" y2="11" />
                    </svg>
                  </button>
                  {/* OMNIA VOICE CHAT BUTTON */}
                  <button
                    onClick={onVoiceScreen}
                    disabled={isLoading}
                    style={toolbarButtonStyle}
                    title="Voice Chat"
                  >
                    <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" width="20" height="20">
                      <line x1="4" y1="12" x2="4" y2="16" />
                      <line x1="8" y1="8" x2="8" y2="16" />
                      <line x1="12" y1="4" x2="12" y2="16" />
                      <line x1="16" y1="10" x2="16" y2="16" />
                      <line x1="20" y1="14" x2="20" y2="16" />
                    </svg>
                  </button>
                </div>
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
                    style={toolbarButtonStyle}
                    title={isRecording ? 'Stop Recording' : 'Voice Input'}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="white" strokeWidth="1.5">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.5-2 4.5-4.5 4.5S8 13.5 8 11H6c0 3.03 2.13 5.44 5 5.92V21h2v-4.08c2.87-.48 5-2.89 5-5.92h-2z"/>
                    </svg>
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
                    >
                      <svg className="h-5 w-5" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5">
                        <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        ...toolbarButtonStyle,
                        opacity: 0.5
                      }}
                      title="Send"
                    >
                      <svg className="h-5 w-5" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5">
                        <path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
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