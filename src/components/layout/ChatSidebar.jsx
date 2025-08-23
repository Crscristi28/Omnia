// 🎨 ChatSidebar.jsx - GPT-style sidebar pro History + Settings
// ✅ Clean professional design podle fotky
// 🚀 Animované slide-in/out, responsive

import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, X, ChevronDown, LogOut, User, Trash2, Settings } from 'lucide-react';
import { getTranslation } from '../../utils/text';
import chatDB from '../../services/storage/chatDB';
import UserSettingsModal from '../modals/UserSettingsModal';

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
  onSignOut = () => {}, // Sign out handler
  onResetPassword = () => {} // Reset password handler
}) => {
  const isMobile = window.innerWidth <= 768;
  
  // Long press state
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Expansion states
  const [isChatHistoryExpanded, setIsChatHistoryExpanded] = useState(true); // Default open
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, chatId: null, chatTitle: '' });
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  
  // 🔧 Reset expansion states when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      // Modal states are handled separately
    }
  }, [isOpen]);
  
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

  // 🗑️ DELETE MODAL HANDLERS
  const openDeleteModal = (chatId, chatTitle) => {
    setDeleteModal({ isOpen: true, chatId, chatTitle });
  };
  
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' });
  };
  
  const confirmDeleteChat = async () => {
    const { chatId } = deleteModal;
    
    // If deleting the current chat, start new chat but keep sidebar open
    const isDeletingCurrentChat = chatId === currentChatId;
    
    await chatDB.deleteChat(chatId);
    
    if (isDeletingCurrentChat) {
      onNewChatKeepSidebar(); // This will clear messages and start fresh but keep sidebar open
    }
    
    onChatDeleted(); // Refresh the chat history
    closeDeleteModal();
  };

  const handleDeleteChat = async (chatId, chatTitle) => {
    // Keep old confirm for long press (backward compatibility)
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
                outline: 'none',
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
          
          {/* 💬 CHATS SECTION */}
          <div style={{ padding: '1rem 0' }}>
            <div style={{ padding: '0 0.5rem' }}>
              {/* 💬 CHATS MAIN CARD */}
              <button
                onClick={() => setIsChatHistoryExpanded(!isChatHistoryExpanded)}
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
                  outline: 'none',
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
                }}>💬</span>
                <span style={{ flex: 1 }}>
                  Chats
                </span>
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isChatHistoryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.6
                  }}
                />
              </button>

              {/* EXPANDED CHATS CONTENT */}
              {isChatHistoryExpanded && (
                <div style={{
                  marginTop: '0.5rem',
                  marginLeft: '0.5rem',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {chatHistory.length === 0 ? (
                    <div style={{
                      padding: '1rem 0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}>
                      {uiLanguage === 'cs' ? 'Žádné konverzace' : 
                       uiLanguage === 'en' ? 'No conversations' : 
                       'Nicio conversație'}
                    </div>
                  ) : (
                    chatHistory.map((chat, index) => (
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
                          padding: '0.6rem 0.75rem',
                          margin: '0.125rem 0',
                          background: currentChatId === chat.id 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(255, 255, 255, 0.03)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          userSelect: 'none',
                          WebkitUserSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (currentChatId !== chat.id) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                          }
                          // Show delete button on hover (desktop)
                          const deleteBtn = e.target.querySelector('button');
                          if (deleteBtn && !isMobile) {
                            deleteBtn.style.opacity = '1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentChatId !== chat.id) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                          }
                          // Hide delete button when not hovering (desktop)
                          const deleteBtn = e.target.querySelector('button');
                          if (deleteBtn && !isMobile) {
                            deleteBtn.style.opacity = '0';
                          }
                          handleLongPressEnd();
                        }}
                      >
                        <span style={{ 
                          fontSize: '0.75rem',
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <MessageCircle size={12} strokeWidth={2} />
                        </span>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {chat.title || `Chat ${index + 1}`}
                        </span>
                        
                        {/* DELETE BUTTON */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent chat selection
                            openDeleteModal(chat.id, chat.title || `Chat ${index + 1}`);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isMobile ? 1 : 0, // Always visible on mobile
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.target.style.color = 'rgba(255, 100, 100, 0.8)';
                            e.target.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'rgba(255, 255, 255, 0.4)';
                            e.target.style.opacity = isMobile ? '1' : '0';
                          }}
                          title={uiLanguage === 'cs' ? 'Smazat chat' : 
                                 uiLanguage === 'en' ? 'Delete chat' : 
                                 'Șterge chat'}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 📏 DIVIDER */}
          <div style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.08)',
            margin: '0.5rem 1.25rem'
          }} />

        </div>
        
        {/* 👤 USER SECTION - FIXED BOTTOM */}
        {user && (
          <div style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {/* USER MAIN CARD - CLICKABLE */}
            <div style={{ padding: '1rem 0.5rem 1.5rem' }}>
              <button
                onClick={() => setShowUserSettingsModal(true)}
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
                  outline: 'none',
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
                
                {/* SETTINGS ICON */}
                <Settings 
                  size={16} 
                  style={{
                    opacity: 0.6,
                    color: '#ffffff'
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <>
          {/* MODAL OVERLAY */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2000,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={closeDeleteModal}
          >
            {/* MODAL CONTENT */}
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.90))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                minWidth: '280px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div style={{
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  {uiLanguage === 'cs' ? 'Smazat chat' : 
                   uiLanguage === 'en' ? 'Delete chat' : 
                   'Șterge chat'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.4'
                }}>
                  {uiLanguage === 'cs' ? 
                    `Opravdu chcete smazat chat "${deleteModal.chatTitle}"? Tato akce nelze vrátit zpět.` :
                   uiLanguage === 'en' ? 
                    `Are you sure you want to delete "${deleteModal.chatTitle}"? This action cannot be undone.` :
                    `Sigur doriți să ștergeți "${deleteModal.chatTitle}"? Această acțiune nu poate fi anulată.`}
                </div>
              </div>
              
              {/* MODAL BUTTONS */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                {/* CANCEL BUTTON */}
                <button
                  onClick={closeDeleteModal}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.25rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  {uiLanguage === 'cs' ? 'Zrušit' : 
                   uiLanguage === 'en' ? 'Cancel' : 
                   'Anulează'}
                </button>
                
                {/* DELETE BUTTON */}
                <button
                  onClick={confirmDeleteChat}
                  style={{
                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.25rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
                    e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #DC2626, #B91C1C)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  {uiLanguage === 'cs' ? 'Smazat' : 
                   uiLanguage === 'en' ? 'Delete' : 
                   'Șterge'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* USER SETTINGS MODAL */}
      {showUserSettingsModal && (
        <UserSettingsModal
          isOpen={showUserSettingsModal}
          onClose={() => setShowUserSettingsModal(false)}
          user={user}
          uiLanguage={uiLanguage}
          setUILanguage={setUILanguage}
          onResetPassword={onResetPassword}
          onSignOut={onSignOut}
        />
      )}
    </>
  );
};

export default ChatSidebar;