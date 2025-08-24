// 🔧 UserSettingsModal.jsx - Fullscreen Settings Modal inspired by Claude app
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Check, User, DollarSign, Globe, Shield, LogOut } from 'lucide-react';
import { getTranslation } from '../../utils/text/translations';
import ResetPasswordModal from '../auth/ResetPasswordModal';

const UserSettingsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  uiLanguage = 'cs',
  setUILanguage,
  onSignOut,
  onResetPassword
}) => {
  const t = getTranslation(uiLanguage);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Add CSS to remove iOS focus styles
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.id = 'user-settings-focus-fix';
      style.textContent = `
        .user-settings-modal button:focus,
        .user-settings-modal button:active,
        .user-settings-modal button:focus-visible {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          box-shadow: none !important;
        }
        .user-settings-modal button {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('user-settings-focus-fix');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isOpen]);
  
  // Language options
  const languageOptions = [
    { code: 'cs', flag: '🇨🇿', label: 'Čeština' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'ro', flag: '🇷🇴', label: 'Română' }
  ];

  const handleLanguageChange = (langCode) => {
    setUILanguage(langCode);
    setIsLanguageExpanded(false);
  };

  const getDisplayEmail = (email) => {
    if (!email) return '';
    if (email.length <= 30) return email;
    return email.substring(0, 27) + '...';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MODAL OVERLAY */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* MODAL CONTENT */}
        <div 
          className="user-settings-modal"
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '100vh',
            background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.90))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER - Fixed Top */}
          <div style={{
            padding: '2rem 2rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent !important',
                WebkitFocusRingColor: 'transparent !important',
                boxShadow: 'none !important',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                padding: '0.25rem',
                borderRadius: '6px',
                fontSize: '1.25rem',
                lineHeight: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h1 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 0 1rem 0'
            }}>
              {t('settings') || 'Settings'}
            </h1>

            {/* User Email */}
            {user?.email && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.75rem 1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                width: '100%',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                {getDisplayEmail(user.email)}
              </div>
            )}
          </div>

          {/* SCROLLABLE CONTENT */}
          <div style={{
            flex: 1,
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>

            {/* Profile Card */}
            <button
              onClick={() => {
                // TODO: Implement Profile modal/page
                console.log('Profile - TODO');
              }}
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
                WebkitTapHighlightColor: 'transparent !important',
                WebkitFocusRingColor: 'transparent !important',
                boxShadow: 'none !important',
                userSelect: 'none',
                WebkitUserSelect: 'none',
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
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <User size={18} style={{ opacity: 0.7 }} />
              <span style={{ flex: 1 }}>
                {uiLanguage === 'cs' ? 'Profil' : 
                 uiLanguage === 'en' ? 'Profile' : 
                 'Profil'}
              </span>
              <ChevronDown 
                size={16} 
                style={{
                  opacity: 0.6,
                  transform: 'rotate(-90deg)' // Make it point right like →
                }}
              />
            </button>

            {/* Interface Language Card */}
            <div>
              <button
                onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
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
                  WebkitTapHighlightColor: 'transparent',
                  WebkitFocusRingColor: 'transparent',
                  boxShadow: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
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
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <Globe size={18} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>
                  {uiLanguage === 'cs' ? 'Jazyk rozhraní' : 
                   uiLanguage === 'en' ? 'Interface Language' : 
                   'Limba interfeței'}
                </span>
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isLanguageExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.6
                  }}
                />
              </button>

              {/* Language Options */}
              {isLanguageExpanded && (
                <div style={{
                  marginTop: '0.5rem',
                  marginLeft: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        background: uiLanguage === lang.code 
                          ? 'rgba(255, 255, 255, 0.12)' 
                          : 'rgba(255, 255, 255, 0.02)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        outline: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitFocusRingColor: 'transparent',
                        boxShadow: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
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
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}>
                        {lang.flag}
                      </span>
                      <span style={{ flex: 1 }}>{lang.label}</span>
                      {uiLanguage === lang.code && (
                        <Check size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Password Card */}
            <button
              onClick={() => {
                setShowResetPasswordModal(true);
              }}
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
                WebkitTapHighlightColor: 'transparent !important',
                WebkitFocusRingColor: 'transparent !important',
                boxShadow: 'none !important',
                userSelect: 'none',
                WebkitUserSelect: 'none',
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
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <Shield size={18} style={{ opacity: 0.7 }} />
              <span style={{ flex: 1 }}>
                {uiLanguage === 'cs' ? 'Změnit heslo' : 
                 uiLanguage === 'en' ? 'Reset password' : 
                 'Resetează parola'}
              </span>
              <ChevronDown 
                size={16} 
                style={{
                  opacity: 0.6,
                  transform: 'rotate(-90deg)' // Make it point right like →
                }}
              />
            </button>

            {/* Billing Card */}
            <button
              onClick={() => {
                // TODO: Implement billing
                console.log('Billing - TODO');
              }}
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
                WebkitTapHighlightColor: 'transparent !important',
                WebkitFocusRingColor: 'transparent !important',
                boxShadow: 'none !important',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                fontWeight: '600',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <DollarSign size={18} style={{ opacity: 0.7 }} />
              <span style={{ flex: 1 }}>
                {uiLanguage === 'cs' ? 'Fakturace' : 
                 uiLanguage === 'en' ? 'Billing' : 
                 'Facturare'}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  opacity: 0.5,
                  fontWeight: 'normal'
                }}>
                  {uiLanguage === 'cs' ? 'Brzy' : 
                   uiLanguage === 'en' ? 'Soon' : 
                   'Curând'}
                </span>
                <ChevronDown 
                  size={16} 
                  style={{
                    opacity: 0.6,
                    transform: 'rotate(-90deg)' // Make it point right like →
                  }}
                />
              </div>
            </button>

          </div>

          {/* FIXED FOOTER - Log Out Button */}
          <div style={{
            padding: '1rem 2rem 6rem', // Increased bottom padding for mobile safe area
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.875rem',
                color: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitFocusRingColor: 'transparent',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
                e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #DC2626, #B91C1C)';
                e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={18} strokeWidth={2} />
              <span>
                {uiLanguage === 'cs' ? 'Odhlásit se' : 
                 uiLanguage === 'en' ? 'Sign out' : 
                 'Deconectare'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Reset Password Modal - Higher z-index for stacking */}
      {showResetPasswordModal && (
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          uiLanguage={uiLanguage}
          user={user}
        />
      )}
    </>
  );
};

export default UserSettingsModal;