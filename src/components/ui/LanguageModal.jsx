// 🌍 LanguageModal.jsx - Language selection in OMNIA design style
import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { sessionManager } from '../../services/storage';

const LanguageModal = ({ 
  isOpen, 
  onClose, 
  uiLanguage, 
  setUILanguage, 
  t 
}) => {
  // Language options - CS, EN, RO + German
  const languageOptions = [
    { code: 'cs', flag: '🇨🇿', label: 'Čeština', nativeName: 'Čeština' },
    { code: 'en', flag: '🇺🇸', label: 'English', nativeName: 'English' },
    { code: 'ro', flag: '🇷🇴', label: 'Română', nativeName: 'Română' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch', nativeName: 'Deutsch' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский', nativeName: 'Русский' },
    { code: 'pl', flag: '🇵🇱', label: 'Polski', nativeName: 'Polski' }
  ];

  // Add CSS to remove iOS focus styles (copy from UserSettingsModal)
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.id = 'language-modal-focus-fix';
      style.textContent = `
        .language-modal button:focus,
        .language-modal button:active,
        .language-modal button:focus-visible,
        .language-modal button:focus-within {
          outline: none !important;
          outline-style: none !important;
          outline-width: 0 !important;
          outline-color: transparent !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          -webkit-appearance: none !important;
          box-shadow: none !important;
          border: inherit !important;
        }
        .language-modal button {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          -webkit-appearance: none !important;
          outline: none !important;
        }
        .language-modal button * {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        .language-modal button span,
        .language-modal button div {
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('language-modal-focus-fix');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isOpen]);

  const handleLanguageSelect = (langCode) => {
    setUILanguage(langCode);
    sessionManager.saveUILanguage(langCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MODAL OVERLAY - exact copy from UserSettingsModal */}
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
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* MODAL CONTENT - exact styling from UserSettingsModal */}
        <div 
          className="language-modal"
          style={{
            width: '100vw',
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
              margin: '0 0 0.5rem 0'
            }}>
              🌍 {t('interfaceLanguage')}
            </h1>

            {/* Subtitle */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              margin: '0',
              textAlign: 'center'
            }}>
              {t('changeLanguage')}
            </p>
          </div>

          {/* SCROLLABLE CONTENT - Language Cards */}
          <div style={{
            flex: 1,
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                style={{
                  width: '100%',
                  background: uiLanguage === lang.code 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: uiLanguage === lang.code 
                    ? '1px solid rgba(255, 255, 255, 0.2)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '1rem',
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
                  gap: '1rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (uiLanguage !== lang.code) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (uiLanguage !== lang.code) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {/* Flag */}
                <span style={{ 
                  fontSize: '2rem',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}>
                  {lang.flag}
                </span>

                {/* Language Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    color: uiLanguage === lang.code ? '#68d391' : '#ffffff'
                  }}>
                    {lang.nativeName}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    {lang.label}
                  </div>
                </div>

                {/* Check Icon for Active Language */}
                {uiLanguage === lang.code && (
                  <Check 
                    size={20} 
                    strokeWidth={2} 
                    style={{ 
                      color: '#68d391',
                      opacity: 0.8
                    }} 
                  />
                )}
              </button>
            ))}
          </div>

          {/* FOOTER - Status */}
          <div style={{
            padding: '1rem 2rem 6rem', // Extra bottom padding for mobile safe area
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem'
            }}>
              ✨ Interface language selection
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default LanguageModal;