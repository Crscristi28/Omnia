// 📁 src/components/voice/VoiceScreen.jsx
// 🎙️ Voice Screen Modal - SIMPLIFIED & WORKING VERSION

import React, { useState, useEffect } from 'react';
import SimpleVoiceRecorder from './SimpleVoiceRecorder.jsx';
import detectLanguage from '../../utils/smartLanguageDetection.js';

const VoiceScreen = ({ 
  isOpen,
  onClose,
  onTranscript,
  isLoading = false,
  isAudioPlaying = false,
  uiLanguage = 'cs',
  messages = [],
  currentResponse = null,
  audioManager = null
}) => {
  // Early return if not open
  if (!isOpen) return null;

  // Simple close handler
  const handleClose = () => {
    console.log('🛑 Closing Voice Screen');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        cursor: 'pointer'
      }}
      onClick={handleClose}
    >
      {/* HEADER */}
      <h1 style={{ 
        fontSize: '3rem',
        marginBottom: '2rem'
      }}>
        OMNIA VOICE
      </h1>

      {/* TEMPORARY MESSAGE */}
      <div style={{
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1rem' }}>
          Voice Screen - Temporarily Simplified
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          SimpleVoiceRecorder component disabled for debugging
        </p>
      </div>

      {/* MOCK MICROPHONE BUTTON */}
      <button
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #007bff, #0056b3)',
          color: 'white',
          border: 'none',
          fontSize: '2rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0, 123, 255, 0.5)'
        }}
        onClick={(e) => {
          e.stopPropagation();
          alert('Voice recording temporarily disabled for debugging');
        }}
      >
        🎤
      </button>

      {/* INSTRUCTIONS */}
      <p style={{ opacity: 0.7 }}>
        Click anywhere to close
      </p>
    </div>
  );
};

export default VoiceScreen;