// 🔧 AboutModal.jsx - About modal with legal documents submenu
import React, { useState } from 'react';
import { X, ChevronDown, FileText, Shield, Cookie, Eye, BookOpen } from 'lucide-react';
import LegalDocModal from './LegalDocModal';

const AboutModal = ({
  isOpen,
  onClose,
  uiLanguage = 'cs'
}) => {

  const [showLegalDoc, setShowLegalDoc] = useState(null);

  const openLegalDoc = (docType) => {
    setShowLegalDoc(docType);
  };

  if (!isOpen) return null;

  return (
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
      {/* MODAL CONTENT - FULLSCREEN */}
      <div
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
        {/* HEADER - Fixed Top (like UserSettingsModal) */}
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
            About Omnia
          </h1>
        </div>

        {/* SCROLLABLE CONTENT (like UserSettingsModal) */}
        <div style={{
          flex: 1,
          padding: '1.5rem 2rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>

          {/* App Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0 0 1rem 0'
            }}>
              Omnia One AI
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              margin: '0 0 1rem 0'
            }}>
              Omnia One AI is your personal AI assistant that thinks global and answers local.
            </p>

            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              Powered by{' '}
              <a
                href="https://www.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#00d4ff',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderBottomColor = '#00d4ff'}
                onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
              >
                Anthropic
              </a>
              ,{' '}
              <a
                href="https://openai.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#00d4ff',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderBottomColor = '#00d4ff'}
                onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
              >
                OpenAI
              </a>
              ,{' '}
              <a
                href="https://ai.google"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#00d4ff',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderBottomColor = '#00d4ff'}
                onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
              >
                Google
              </a>
              ,{' '}
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#00d4ff',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderBottomColor = '#00d4ff'}
                onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
              >
                ElevenLabs
              </a>
              .
            </p>
          </div>

          {/* Important Data Processing Disclaimer */}
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            padding: '1rem',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              color: '#ffc107',
              fontSize: '0.95rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Important: Third-Party Data Processing
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              margin: 0
            }}>
              When using Omnia One AI, your conversations and data are processed by third-party AI providers (Anthropic, OpenAI, Google, ElevenLabs, X.AI) through their respective APIs. <strong>We are not responsible for how these providers handle your data.</strong> For detailed information about their data processing practices, please visit their privacy policies directly through the links above.
            </p>
          </div>

          {/* Legal Documents Section */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0 0 0.75rem 0'
            }}>
              Legal Documents
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>

              {/* Terms of Service */}
              <button
                onClick={() => openLegalDoc('terms')}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
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
                <FileText size={16} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>Terms of Service</span>
                <ChevronDown
                  size={14}
                  style={{
                    opacity: 0.6,
                    transform: 'rotate(-90deg)'
                  }}
                />
              </button>

              {/* Privacy Policy */}
              <button
                onClick={() => openLegalDoc('privacy')}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
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
                <Shield size={16} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>Privacy Policy</span>
                <ChevronDown
                  size={14}
                  style={{
                    opacity: 0.6,
                    transform: 'rotate(-90deg)'
                  }}
                />
              </button>

              {/* Cookie Policy */}
              <button
                onClick={() => openLegalDoc('cookies')}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
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
                <Cookie size={16} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>Cookie Policy</span>
                <ChevronDown
                  size={14}
                  style={{
                    opacity: 0.6,
                    transform: 'rotate(-90deg)'
                  }}
                />
              </button>

              {/* Data Processing Agreement */}
              <button
                onClick={() => openLegalDoc('gdpr')}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
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
                <Eye size={16} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>Data Processing Agreement</span>
                <ChevronDown
                  size={14}
                  style={{
                    opacity: 0.6,
                    transform: 'rotate(-90deg)'
                  }}
                />
              </button>

              {/* Acceptable Use Policy */}
              <button
                onClick={() => openLegalDoc('acceptable')}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
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
                <BookOpen size={16} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>Acceptable Use Policy</span>
                <ChevronDown
                  size={14}
                  style={{
                    opacity: 0.6,
                    transform: 'rotate(-90deg)'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Version Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.75rem',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              margin: 0
            }}>
              Version 2.0 • Built with ❤️ for AI enthusiasts
            </p>
          </div>
        </div>
      </div>

      {/* Legal Document Modal */}
      {showLegalDoc && (
        <LegalDocModal
          isOpen={!!showLegalDoc}
          onClose={() => setShowLegalDoc(null)}
          docType={showLegalDoc}
          uiLanguage={uiLanguage}
        />
      )}
    </div>
  );
};

export default AboutModal;