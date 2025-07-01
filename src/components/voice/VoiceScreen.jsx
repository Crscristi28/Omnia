// 📁 src/components/voice/VoiceScreen.jsx
// 🎙️ Enhanced Voice Screen Modal - Standalone Component

import React, { useState, useRef, useEffect } from 'react';
import SimpleVoiceRecorder from './SimpleVoiceRecorder.jsx';
import { MiniOmniaLogo } from '../ui/OmniaLogos.jsx';
import detectLanguage from '../../utils/smartLanguageDetection.js';

const VoiceScreen = ({ 
  isOpen,
  onClose,
  onTranscript,
  isLoading,
  isAudioPlaying,
  uiLanguage,
  messages = [],
  currentResponse = null
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [voiceHistory, setVoiceHistory] = useState([]);
  const [showVisualizer, setShowVisualizer] = useState(false);
  
  const isMobile = window.innerWidth <= 768;

  if (!isOpen) return null;

  const handleTranscript = (text, confidence) => {
    console.log('🎙️ Voice transcript in VoiceScreen:', text);
    setLastTranscript(text);
    setVoiceHistory(prev => [...prev, {
      text,
      confidence,
      timestamp: Date.now(),
      language: detectLanguage(text)
    }]);
    onTranscript(text, confidence);
  };

  const handleVoiceStateChange = (listening) => {
    setIsListening(listening);
    setShowVisualizer(listening);
  };

  // 🎨 ENHANCED UI s vizualizací
  const getBackgroundStyle = () => {
    if (isListening) {
      return {
        background: `
          radial-gradient(circle at 50% 50%, 
            rgba(0, 255, 255, 0.1) 0%,
            rgba(0, 150, 255, 0.05) 50%,
            rgba(15, 20, 25, 0.95) 100%
          )
        `,
        animation: 'pulse-bg 2s ease-in-out infinite'
      };
    }
    
    if (isAudioPlaying) {
      return {
        background: `
          radial-gradient(circle at 50% 50%, 
            rgba(100, 50, 255, 0.1) 0%,
            rgba(75, 0, 130, 0.05) 50%,
            rgba(15, 20, 25, 0.95) 100%
          )
        `
      };
    }

    return {
      background: 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #4a5568 100%)'
    };
  };

  return (
    <div 
      className="voice-screen-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...getBackgroundStyle(),
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        cursor: 'pointer',
        padding: isMobile ? '1rem' : '2rem',
        minHeight: '100vh',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)',
        transition: 'background 0.5s ease'
      }}
      onClick={onClose}
    >
      {/* 🎯 HEADER SECTION */}
      <div 
        style={{
          fontSize: isMobile ? '3.5rem' : '4.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          background: isListening 
            ? 'linear-gradient(45deg, #00ffff, #0099ff)'
            : 'linear-gradient(45deg, #4299e1, #63b3ed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          animation: isListening ? 'glow 2s ease-in-out infinite' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        OMNIA
      </div>

      {/* 🎤 VOICE RECORDER */}
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
          disabled={isLoading}
          isAudioPlaying={isAudioPlaying}
          uiLanguage={uiLanguage}
        />
        
        {/* 🌊 VOICE VISUALIZER */}
        {showVisualizer && (
          <div 
            className="voice-visualizer"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 255, 0.3)',
              animation: 'pulse-ring 1.5s ease-out infinite',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* 📝 TRANSCRIPT DISPLAY */}
      {lastTranscript && (
        <div 
          style={{
            maxWidth: '600px',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            animation: 'fadeInUp 0.4s ease-out'
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

      {/* 🎵 AUDIO PLAYING INDICATOR */}
      {isAudioPlaying && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <MiniOmniaLogo size={24} isAudioPlaying={true} />
          <span style={{ opacity: 0.8 }}>
            {uiLanguage === 'cs' ? 'Omnia mluví...' : 
             uiLanguage === 'en' ? 'Omnia speaking...' : 'Omnia vorbește...'}
          </span>
        </div>
      )}

      {/* 🔄 LOADING STATE */}
      {isLoading && (
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

      {/* 📊 VOICE HISTORY (Enhancement) */}
      {voiceHistory.length > 0 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            maxWidth: '300px',
            fontSize: '0.8rem',
            opacity: 0.6
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            {uiLanguage === 'cs' ? 'Historie:' : 
             uiLanguage === 'en' ? 'History:' : 'Istoric:'}
          </div>
          {voiceHistory.slice(-3).map((item, idx) => (
            <div key={idx} style={{ 
              marginBottom: '0.3rem',
              opacity: 0.5 + (idx * 0.15)
            }}>
              • {item.text.substring(0, 30)}...
            </div>
          ))}
        </div>
      )}

      {/* ℹ️ INSTRUCTIONS */}
      <div 
        style={{
          position: 'absolute',
          bottom: '2rem',
          fontSize: '0.9rem',
          opacity: 0.6,
          textAlign: 'center'
        }}
      >
        {isListening ? 
          (uiLanguage === 'cs' ? 'Klepněte na mikrofon pro ukončení' : 
           uiLanguage === 'en' ? 'Tap microphone to stop' : 
           'Apasă microfonul pentru a opri') :
          (uiLanguage === 'cs' ? 'Klepněte kamkoliv pro návrat' : 
           uiLanguage === 'en' ? 'Tap anywhere to return' : 
           'Apasă oriunde pentru a reveni')
        }
      </div>

      {/* 🎨 ANIMATIONS */}
      <style>{`
        @keyframes pulse-bg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceScreen;