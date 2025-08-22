// 🎨 ChatSidebar.jsx - GPT-style sidebar pro History + Settings
// ✅ Clean professional design podle fotky
// 🚀 Animované slide-in/out, responsive

import React, { useState } from 'react';
import { MessageCircle, Check, X, ChevronDown, LogOut, User } from 'lucide-react';
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
  onChatDeleted = () => {}, // Callback to refresh history after deletion
  user = null, // Current user object
  onSignOut = () => {} // Sign out handler
}) => {
  const isMobile = window.innerWidth <= 768;
  
  // Long press state
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Settings expansion states
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  
  // User menu expansion state
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);
  
  // 👤 USER HELPERS
  const getUserInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };
  
  const getDisplayEmail = (email) => {
    if (!email) return '';
    if (email.length <= 20) return email;
    const [local, domain] = email.split('@');
    return `${local.slice(0, 8)}...@${domain}`;
  };

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
            <div style={{ padding: '0 0.5rem' }}>
              {/* 🎛️ SETTINGS MAIN CARD */}
              <button
                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  margin: '0.125rem 0',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <span style={{
                  fontSize: '0.8rem',
                  opacity: 0.7
                }}>⚙️</span>
                <span style={{ flex: 1 }}>
                  {uiLanguage === 'cs' ? 'Nastavení' : uiLanguage === 'en' ? 'Settings' : 'Setări'}
                </span>
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isSettingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.6
                  }}
                />
              </button>

              {/* EXPANDED SETTINGS CONTENT */}
              {isSettingsExpanded && (
                <div style={{
                  marginTop: '0.5rem',
                  marginLeft: '0.5rem',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {/* 🌍 LANGUAGE ITEM */}
                  <button
                    onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: 'none',
                      padding: '0.6rem 0.75rem',
                      margin: '0.125rem 0',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <span style={{
                      fontSize: '0.8rem',
                      opacity: 0.7
                    }}>🌍</span>
                    <span style={{ flex: 1 }}>
                      {uiLanguage === 'cs' ? 'Jazyk rozhraní' : 
                       uiLanguage === 'en' ? 'Interface Language' : 
                       'Limba interfeței'}
                    </span>
                    <ChevronDown 
                      size={14} 
                      style={{
                        transform: isLanguageExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.5
                      }}
                    />
                  </button>

                  {/* LANGUAGE OPTIONS */}
                  {isLanguageExpanded && (
                    <div style={{
                      marginTop: '0.25rem',
                      marginLeft: '1rem',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      {languageOptions.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            margin: '0.125rem 0',
                            background: uiLanguage === lang.code 
                              ? 'rgba(255, 255, 255, 0.12)' 
                              : 'rgba(255, 255, 255, 0.02)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                          }}
                          onMouseEnter={(e) => {
                            if (uiLanguage !== lang.code) {
                              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (uiLanguage !== lang.code) {
                              e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                            }
                          }}
                        >
                          <span style={{ 
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            minWidth: '22px',
                            textAlign: 'center'
                          }}>
                            {lang.flag}
                          </span>
                          <span style={{ flex: 1 }}>{lang.label}</span>
                          {uiLanguage === lang.code && (
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Check size={10} strokeWidth={2} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 👤 USER SECTION - FIXED BOTTOM */}
        {user && (
          <div style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.90))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}>
            {/* EXPANDED USER MENU */}
            {isUserMenuExpanded && (
              <div style={{
                padding: '1rem 0.5rem 0.5rem',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{
                  marginLeft: '0.5rem'
                }}>
                  {/* 🚪 LOG OUT */}
                  <button
                    onClick={onSignOut}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: 'none',
                      padding: '0.6rem 0.75rem',
                      margin: '0.125rem 0',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <LogOut size={16} strokeWidth={2} style={{ opacity: 0.7 }} />
                    <span style={{ flex: 1 }}>
                      {uiLanguage === 'cs' ? 'Odhlásit se' : 
                       uiLanguage === 'en' ? 'Sign out' : 
                       'Deconectare'}
                    </span>
                  </button>

                  {/* 🔐 RESET PASSWORD */}
                  <button
                    onClick={() => {
                      // TODO: Implement reset password
                      console.log('Reset password - TODO');
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: 'none',
                      padding: '0.6rem 0.75rem',
                      margin: '0.125rem 0',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    <span style={{ fontSize: '16px', opacity: 0.7 }}>🔐</span>
                    <span style={{ flex: 1 }}>
                      {uiLanguage === 'cs' ? 'Změnit heslo' : 
                       uiLanguage === 'en' ? 'Reset password' : 
                       'Resetează parola'}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                      {uiLanguage === 'cs' ? 'Brzy' : 
                       uiLanguage === 'en' ? 'Soon' : 
                       'Curând'}
                    </span>
                  </button>

                  {/* 💳 BILLING */}
                  <button
                    onClick={() => {
                      // TODO: Implement billing
                      console.log('Billing - TODO');
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: 'none',
                      padding: '0.6rem 0.75rem',
                      margin: '0.125rem 0',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    <span style={{ fontSize: '16px', opacity: 0.7 }}>💳</span>
                    <span style={{ flex: 1 }}>
                      {uiLanguage === 'cs' ? 'Fakturace' : 
                       uiLanguage === 'en' ? 'Billing' : 
                       'Facturare'}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                      {uiLanguage === 'cs' ? 'Brzy' : 
                       uiLanguage === 'en' ? 'Soon' : 
                       'Curând'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* USER MAIN CARD - CLICKABLE */}
            <div style={{ padding: '1rem 0.5rem 1.5rem' }}>
              <button
                onClick={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {/* USER AVATAR */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  {getUserInitials(user.email)}
                </div>
                
                {/* USER INFO */}
                <div style={{
                  flex: 1,
                  minWidth: 0
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '0.125rem'
                  }}>
                    {uiLanguage === 'cs' ? 'Přihlášen jako' : 
                     uiLanguage === 'en' ? 'Signed in as' : 
                     'Autentificat ca'}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {getDisplayEmail(user.email)}
                  </div>
                </div>
                
                {/* CHEVRON ARROW */}
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isUserMenuExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.6,
                    color: '#ffffff'
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatSidebar;