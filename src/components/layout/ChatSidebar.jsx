// 🎨 ChatSidebar.jsx - GPT-style sidebar pro History + Settings
// ✅ Clean professional design podle fotky
// 🚀 Animované slide-in/out, responsive

import React, { useState } from 'react';
import { MessageCircle, Check, X } from 'lucide-react';
import { getTranslation } from '../../utils/text';
import chatDB from '../../services/storage/chatDB';

const ChatSidebar = ({ 
  isOpen, 
  onClose, 
  onNewChatKeepSidebar = () => {}, // New chat without closing sidebar
  uiLanguage = 'cs',
  setUILanguage,
  chatHistory = [],
  onSelectChat,
  currentChatId = null,
  onChatDeleted = () => {} // Callback to refresh history after deletion
}) => {
  const isMobile = window.innerWidth <= 768;
  
  // Long press state
  const [longPressTimer, setLongPressTimer] = useState(null);

  // 📱 CLOSE ON OVERLAY CLICK
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 🌍 LANGUAGE OPTIONS
  const languageOptions = [
    { code: 'cs', label: 'Čeština', flag: 'CZ' },
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'ro', label: 'Română', flag: 'RO' }
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

  // 🗑️ LONG PRESS DELETE FUNCTIONALITY
  const handleLongPressStart = (chatId, chatTitle) => {
    const timer = setTimeout(() => {
      handleDeleteChat(chatId, chatTitle);
    }, 800); // 800ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleDeleteChat = async (chatId, chatTitle) => {
    const confirmText = uiLanguage === 'cs' ? 
      `Opravdu chcete smazat chat "${chatTitle}"?` :
      uiLanguage === 'en' ? 
      `Really delete chat "${chatTitle}"?` :
      `Ștergi conversația "${chatTitle}"?`;
      
    if (confirm(confirmText)) {
      // If deleting the current chat, start new chat but keep sidebar open
      const isDeletingCurrentChat = chatId === currentChatId;
      
      await chatDB.deleteChat(chatId);
      
      if (isDeletingCurrentChat) {
        onNewChatKeepSidebar(); // This will clear messages and start fresh but keep sidebar open
      }
      
      onChatDeleted(); // Refresh the chat history
      // Note: Sidebar stays open, no automatic chat selection
    }
    // Whether confirmed or cancelled, sidebar stays open
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
              <X size={16} strokeWidth={2} />
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
                    onTouchStart={() => handleLongPressStart(chat.id, chat.title)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                    onMouseDown={() => handleLongPressStart(chat.id, chat.title)}
                    onMouseUp={handleLongPressEnd}
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
                      gap: '0.5rem',
                      userSelect: 'none', // Prevent text selection during long press
                      WebkitUserSelect: 'none'
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
                      handleLongPressEnd(); // Also clear long press on mouse leave
                    }}
                  >
                    <span style={{ 
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <MessageCircle size={14} strokeWidth={2} />
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
            
            {/* 🎛️ SETTINGS CARD */}
            <div style={{ padding: '0 0.5rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.75rem',
                margin: '0.125rem 0',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}>
                {/* Settings Card Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    opacity: 0.7
                  }}>⚙️</span>
                  {uiLanguage === 'cs' ? 'Nastavení' : uiLanguage === 'en' ? 'Settings' : 'Setări'}
                </div>
                
                {/* 🌍 LANGUAGE SELECTOR */}
                <div>
                  <div style={{
                    padding: '0 0 0.5rem',
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
                        padding: '0.6rem 0.75rem',
                        margin: '0.125rem 0',
                        background: uiLanguage === lang.code 
                          ? 'rgba(255, 255, 255, 0.15)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                      onMouseEnter={(e) => {
                        if (uiLanguage !== lang.code) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (uiLanguage !== lang.code) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                        }
                      }}
                    >
                      <span style={{ 
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}>
                        {lang.flag}
                      </span>
                      <span style={{ flex: 1 }}>{lang.label}</span>
                      {uiLanguage === lang.code && (
                        <span style={{ 
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Check size={12} strokeWidth={2} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;