// 🔄 UpdatePrompt.jsx - PWA Update Notification Component
// ✅ Shows notification when new version is available
// 🚀 Handles PWA update installation

import React from 'react';
import { RefreshCw, X, Download } from 'lucide-react';

const UpdatePrompt = ({ 
  isVisible = false, 
  onUpdateClick, 
  onDismiss,
  uiLanguage = 'cs' 
}) => {
  const texts = {
    cs: {
      title: 'Nová verze dostupná!',
      message: 'Aktualizujte aplikaci pro nejnovější funkce a opravy.',
      updateButton: 'Aktualizovat',
      dismissButton: 'Později'
    },
    en: {
      title: 'New version available!',
      message: 'Update the app to get the latest features and fixes.',
      updateButton: 'Update',
      dismissButton: 'Later'
    },
    ro: {
      title: 'Versiune nouă disponibilă!',
      message: 'Actualizează aplicația pentru cele mai noi funcții și corecții.',
      updateButton: 'Actualizează',
      dismissButton: 'Mai târziu'
    }
  };

  const t = texts[uiLanguage] || texts.cs;

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
      maxWidth: '360px',
      background: 'linear-gradient(135deg, rgba(0, 78, 146, 0.95), rgba(0, 4, 40, 0.95))',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '1rem',
      color: '#ffffff',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RefreshCw size={18} style={{ color: '#60A5FA' }} />
          <h3 style={{
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#ffffff'
          }}>
            {t.title}
          </h3>
        </div>
        
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#ffffff';
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'rgba(255, 255, 255, 0.6)';
            e.target.style.background = 'transparent';
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Message */}
      <p style={{
        margin: '0 0 1rem 0',
        fontSize: '0.85rem',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.4'
      }}>
        {t.message}
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <button
          onClick={onUpdateClick}
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            border: 'none',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <Download size={14} />
          {t.updateButton}
        </button>

        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.8)',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          {t.dismissButton}
        </button>
      </div>

      {/* Animation keyframes - inject into document head */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdatePrompt;