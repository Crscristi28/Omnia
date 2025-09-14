// 🔧 AboutModal.jsx - About modal with legal documents submenu
import React from 'react';
import { X, ChevronDown, FileText, Shield, Cookie, Eye, BookOpen } from 'lucide-react';

const AboutModal = ({
  isOpen,
  onClose,
  uiLanguage = 'cs'
}) => {

  const openLegalDoc = (docType) => {
    // For now, we'll open in new tab - later we'll create proper HTML docs
    const urls = {
      terms: '/legal/terms.html',
      privacy: '/legal/privacy.html',
      cookies: '/legal/cookies.html',
      gdpr: '/legal/data-processing.html',
      acceptable: '/legal/acceptable-use.html'
    };

    if (urls[docType]) {
      window.open(urls[docType], '_blank');
    }
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
      {/* MODAL CONTENT */}
      <div
        style={{
          width: '90vw',
          maxWidth: '500px',
          maxHeight: '80vh',
          background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.90))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            About Omnia
          </h2>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              padding: '0.25rem',
              borderRadius: '6px',
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
        </div>

        {/* CONTENT */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
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
              margin: '0 0 0.5rem 0'
            }}>
              Omnia One AI
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              Your personal AI assistant that thinks global and answers local. Powered by multiple AI models including Claude, GPT-4, and Gemini.
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
    </div>
  );
};

export default AboutModal;