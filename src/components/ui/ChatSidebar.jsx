// 🎨 ChatSidebar.jsx - GPT-style sidebar pro History + Settings
// ✅ Clean professional design podle fotky
// 🚀 Animované slide-in/out, responsive

import React from 'react';
import { getTranslation } from '../../utils/translations.js';

const ChatSidebar = ({ 
  isOpen, 
  onClose, 
  onNewChat,
  uiLanguage = 'cs',
  setUILanguage,
  chatHistory = [],
  onSelectChat,
  currentChatId = null
}) => {
  const t = getTranslation(uiLanguage);
  const isMobile = window.innerWidth <= 768;

  // 📱 CLOSE ON OVERLAY CLICK
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 🌍 LANGUAGE OPTIONS
  const languageOptions = [
    { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ro', label: 'Română', flag: '🇷🇴' }
  ];

  const handleLanguageChange = (langCode) => {
    setUILanguage(langCode);
    // Auto-close on mobile after selection
    if (isMobile) {
      setTimeout(() => onClose(), 300);
    }
  };

  const handleChatSelect = (chatId) => {
    onSelectChat(chatId);
    onClose(); // Always close after selecting chat
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 🌫️ OVERLAY */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={handleOverlayClick}
      />
      
      {/* 📋 SIDEBAR */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: isMobile ? '85%' : '320px',
          maxWidth: isMobile ? '300px' : '320px',
          background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.90))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1001,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        
        {/* 📱 HEADER */}
        <div style={{
          padding: '1.5rem 1.25rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '0.02em'
            }}>
              Omnia Chat
            </h2>
            
            {/* ❌ CLOSE BUTTON */}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '6px',
                fontSize: '1.25rem',
                lineHeight: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ffffff';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                e.target.style.background = 'transparent';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* 📜 SCROLLABLE CONTENT */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}>
          
          {/* 📝 CHAT HISTORY SECTION */}
          <div style={{ padding: '1rem 0' }}>
            <div style={{
              padding: '0 1.25rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {uiLanguage === 'cs' ? 'Historie' : uiLanguage === 'en' ? 'History' : 'Istoric'}
            </div>
            
            {chatHistory.length === 0 ? (
              <div style={{
                padding: '1rem 1.25rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {uiLanguage === 'cs' ? 'Žádné konverzace' : 
                 uiLanguage === 'en' ? 'No conversations' : 
                 'Nicio conversație'}
              </div>
            ) : (
              <div style={{ padding: '0 0.5rem' }}>
                {chatHistory.map((chat, index) => (
                  <button
                    key={chat.id || index}
                    onClick={() => handleChatSelect(chat.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem',
                      margin: '0.125rem 0',
                      background: currentChatId === chat.id 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (currentChatId !== chat.id) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentChatId !== chat.id) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: '0.8rem',
                      opacity: 0.7
                    }}>
                      💬
                    </span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {chat.title || `Chat ${index + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📏 DIVIDER */}
          <div style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.08)',
            margin: '0.5rem 1.25rem'
          }} />

          {/* ⚙️ SETTINGS SECTION */}
          <div style={{ padding: '1rem 0 2rem' }}>
            <div style={{
              padding: '0 1.25rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {uiLanguage === 'cs' ? 'Nastavení' : uiLanguage === 'en' ? 'Settings' : 'Setări'}
            </div>
            
            {/* 🌍 LANGUAGE SELECTOR */}
            <div style={{ padding: '0 0.5rem' }}>
              <div style={{
                padding: '0.5rem 0.75rem 0.25rem',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500'
              }}>
                {uiLanguage === 'cs' ? 'Jazyk rozhraní' : 
                 uiLanguage === 'en' ? 'Interface Language' : 
                 'Limba interfeței'}
              </div>
              
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem',
                    margin: '0.125rem 0',
                    background: uiLanguage === lang.code 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    if (uiLanguage !== lang.code) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (uiLanguage !== lang.code) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                  <span style={{ flex: 1 }}>{lang.label}</span>
                  {uiLanguage === lang.code && (
                    <span style={{ 
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;