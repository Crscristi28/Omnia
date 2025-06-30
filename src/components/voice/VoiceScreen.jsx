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
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  
  const isMobile = window.innerWidth <= 768;

  // Early return if not open
  if (!isOpen) return null;

  // Enhanced close handler
  const handleClose = () => {
    console.log('🛑 Closing Voice Screen');
    
    // Stop audio if audioManager exists
    if (audioManager && typeof audioManager.stop === 'function') {
      audioManager.stop();
    }
    
    // Reset states
    setIsListening(false);
    setIsWaitingForResponse(false);
    setLastTranscript('');
    
    // Call parent onClose
    if (onClose) {
      onClose();
    }
  };

  // Handle transcript from voice recorder
  const handleTranscript = (text, confidence) => {
    console.log('🎙️ Voice transcript received:', text);
    
    if (!text || text.trim() === '') return;
    
    setLastTranscript(text);
    setIsWaitingForResponse(true);
    
    // Send to parent
    if (onTranscript) {
      onTranscript(text, confidence);
    }
  };

  // Handle voice state changes
  const handleVoiceStateChange = (listening) => {
    setIsListening(listening);
    
    if (!listening && lastTranscript) {
      setIsWaitingForResponse(true);
    }
  };

  // Reset waiting state when response arrives
  useEffect(() => {
    if (currentResponse || isAudioPlaying) {
      setIsWaitingForResponse(false);
    }
  }, [currentResponse, isAudioPlaying]);

  // Background style based on state
  const getBackgroundStyle = () => {
    if (isListening) {
      return 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, rgba(15, 20, 25, 0.95) 100%)';
    }
    if (isAudioPlaying) {
      return 'radial-gradient(circle at 50% 50%, rgba(100, 50, 255, 0.1) 0%, rgba(15, 20, 25, 0.95) 100%)';
    }
    if (isWaitingForResponse) {
      return 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, rgba(15, 20, 25, 0.95) 100%)';
    }
    return 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #2d3748 100%)';
  };

  // Get instruction text
  const getInstructionText = () => {
    if (isListening) {
      return uiLanguage === 'cs' ? 'Klepněte na mikrofon pro ukončení' : 
             uiLanguage === 'en' ? 'Tap microphone to stop' : 
             'Apasă microfonul pentru a opri';
    }
    if (isWaitingForResponse) {
      return uiLanguage === 'cs' ? 'Čekám na odpověď...' : 
             uiLanguage === 'en' ? 'Waiting for response...' : 
             'Aștept răspunsul...';
    }
    return uiLanguage === 'cs' ? 'Klepněte kamkoliv pro návrat' : 
           uiLanguage === 'en' ? 'Tap anywhere to return' : 
           'Apasă oriunde pentru a reveni';
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: getBackgroundStyle(),
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        cursor: 'pointer',
        padding: isMobile ? '1rem' : '2rem',
        minHeight: '100vh',
        backdropFilter: 'blur(10px)',
        transition: 'background 0.5s ease'
      }}
      onClick={handleClose}
    >
      {/* HEADER */}
      <div 
        style={{
          fontSize: isMobile ? '3rem' : '4rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          background: isListening 
            ? 'linear-gradient(45deg, #00ffff, #0099ff)'
            : isAudioPlaying
            ? 'linear-gradient(45deg, #9932cc, #6432ff)'
            : 'linear-gradient(45deg, #4299e1, #63b3ed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        OMNIA
      </div>

      {/* VOICE RECORDER */}
      <div 
        style={{ 
          marginBottom: '3rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <SimpleVoiceRecorder 
          onTranscript={handleTranscript}
          onListeningChange={handleVoiceStateChange}
          disabled={isLoading || isWaitingForResponse}
          isAudioPlaying={isAudioPlaying}
          uiLanguage={uiLanguage}
        />
      </div>

      {/* TRANSCRIPT DISPLAY */}
      {lastTranscript && (
        <div 
          style={{
            maxWidth: '600px',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            fontSize: '0.8rem', 
            opacity: 0.6, 
            marginBottom: '0.5rem' 
          }}>
            {uiLanguage === 'cs' ? 'Rozpoznáno:' : 
             uiLanguage === 'en' ? 'Recognized:' : 'Recunoscut:'}
          </div>
          <div style={{ fontSize: '1.1rem' }}>{lastTranscript}</div>
        </div>
      )}

      {/* WAITING INDICATOR */}
      {isWaitingForResponse && !isAudioPlaying && !currentResponse && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid rgba(255,215,0,0.3)', 
            borderTop: '2px solid #ffd700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ opacity: 0.8 }}>
            {uiLanguage === 'cs' ? 'Omnia přemýšlí...' : 
             uiLanguage === 'en' ? 'Omnia thinking...' : 'Omnia gândește...'}
          </span>
        </div>
      )}

      {/* RESPONSE DISPLAY */}
      {currentResponse && (
        <div 
          style={{
            maxWidth: '600px',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'rgba(100, 50, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 50, 255, 0.2)',
            textAlign: 'left'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            fontSize: '0.8rem', 
            opacity: 0.6, 
            marginBottom: '0.5rem'
          }}>
            {uiLanguage === 'cs' ? 'Omnia odpovídá:' : 
             uiLanguage === 'en' ? 'Omnia responding:' : 'Omnia răspunde:'}
          </div>
          <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
            {currentResponse}
          </div>
        </div>
      )}

      {/* AUDIO PLAYING INDICATOR */}
      {isAudioPlaying && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #9932cc, #6432ff)',
            animation: 'pulse 1s ease-in-out infinite'
          }} />
          <span style={{ opacity: 0.8 }}>
            {uiLanguage === 'cs' ? 'Omnia mluví...' : 
             uiLanguage === 'en' ? 'Omnia speaking...' : 'Omnia vorbește...'}
          </span>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && !isWaitingForResponse && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid rgba(255,255,255,0.3)', 
            borderTop: '2px solid #00ffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>
            {uiLanguage === 'cs' ? 'Zpracovávám...' : 
             uiLanguage === 'en' ? 'Processing...' : 'Procesez...'}
          </span>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div 
        style={{
          position: 'absolute',
          bottom: '2rem',
          fontSize: '0.9rem',
          opacity: 0.6,
          textAlign: 'center'
        }}
      >
        {getInstructionText()}
      </div>

      {/* INLINE STYLES */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default VoiceScreen;