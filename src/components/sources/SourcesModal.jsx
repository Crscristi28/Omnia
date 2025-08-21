// 📁 src/components/sources/SourcesModal.jsx
// 🔗 Modal for displaying sources with clean cards

import React, { useEffect } from 'react';

const SourcesModal = ({ isOpen, onClose, sources = [], language = 'cs' }) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTitle = () => {
    const titles = {
      'cs': 'Zdroje informací',
      'en': 'Information Sources', 
      'ro': 'Surse de informații'
    };
    return titles[language] || titles['cs'];
  };

  const getEmptyMessage = () => {
    const messages = {
      'cs': 'Žádné zdroje k zobrazení',
      'en': 'No sources to display',
      'ro': 'Nu există surse de afișat'
    };
    return messages[language] || messages['cs'];
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '1rem' : '2rem',
        paddingTop: isMobile ? '2rem' : '2rem',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.95))',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: isMobile ? 'calc(100vh - 4rem)' : '80vh',
          border: '1px solid rgba(74, 85, 104, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(74, 85, 104, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {/* Chain icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
            {getTitle()} ({sources.length})
          </h3>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#ffffff';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#a0aec0';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 10rem)' : '60vh'
          }}
        >
          {sources.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#a0aec0',
                fontSize: '0.9rem',
                padding: '2rem'
              }}
            >
              {getEmptyMessage()}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url || '#'}
                  {...(!isMobile && { target: "_blank" })}
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(74, 85, 104, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(74, 85, 104, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(74, 85, 104, 0.3)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    {/* Favicon placeholder */}
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(74, 85, 104, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#a0aec0">
                        <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/>
                      </svg>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          marginBottom: '0.25rem',
                          lineHeight: '1.4'
                        }}
                      >
                        {source.title || 'Untitled'}
                      </div>
                      
                      <div
                        style={{
                          color: '#a0aec0',
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {source.url || 'No URL'}
                      </div>
                    </div>

                    {/* External link icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#a0aec0"
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    >
                      <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
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
    </div>
  );
};

export default SourcesModal;