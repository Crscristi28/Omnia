// 📁 src/components/voice/VoiceScreen.jsx
// 🎙️ Simplified Voice Screen Modal

import React, { useState } from 'react';
import { SimpleVoiceRecorder } from '../voice';

const VoiceScreen = ({ 
  isOpen,
  onClose,
  onTranscript,
  isLoading,
  isAudioPlaying,
  uiLanguage,
  audioManager
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  
  const isMobile = window.innerWidth <= 768;

  if (!isOpen) return null;

  const handleTranscript = (text, confidence) => {
    console.log('🎙️ Voice transcript in VoiceScreen:', text);
    setLastTranscript(text);
    onTranscript(text, confidence);
  };

  const handleVoiceStateChange = (listening) => {
    setIsListening(listening);
  };

  const handleClose = () => {
    // 🔧 CRITICAL: Stop all voice activities before closing
    if (isListening) {
      console.log('🛑 Force stopping voice recording before close');
      // The SimpleVoiceRecorder should handle cleanup in its own useEffect
    }
    
    // 🔧 CRITICAL: Stop audio if available via props
    if (audioManager && audioManager.stop) {
      console.log('🛑 Stopping audio from VoiceScreen X button');
      audioManager.stop();
    }
    
    onClose();
  };

  // 🎨 ENHANCED UI s glow efektem
  const getBackgroundStyle = () => {
    if (isListening) {
      return {
        background: 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
      };
    }

    return {
      background: 'linear-gradient(135deg, #000428, #004e92, #009ffd)'
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
        zIndex: 1001,
        padding: isMobile ? '1rem' : '2rem',
        minHeight: '100vh',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)',
        transition: 'background 0.5s ease',
        animation: isAudioPlaying ? 'screenPulse 1.5s ease-in-out infinite' : 'none'
      }}
    >
      {/* 🎯 HEADER WITH CLOSE BUTTON */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center'
      }}>
        <div style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #4299e1, #63b3ed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          OMNIA Voice Chat
        </div>
        
        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: 'white',
            fontSize: '1.2rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>
      
      {/* 🎤 CENTRAL CONTENT - Flex container for centering */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* 🎤 VOICE RECORDER - NEMĚNÍM HO! */}
        <div 
          style={{ 
            marginBottom: '2rem',
            position: 'relative'
          }}
        >
          <SimpleVoiceRecorder 
            onTranscript={handleTranscript}
            onListeningChange={handleVoiceStateChange}
            disabled={isLoading}
            isAudioPlaying={isAudioPlaying}
            uiLanguage={uiLanguage}
          />
          
          {/* 🌊 VOICE VISUALIZER */}
          {isListening && (
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

        {/* 🔄 LOADING STATE */}
        {isLoading && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              marginTop: '2rem'
            }}
          >
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid rgba(255,255,255,0.3)', 
              borderTop: '2px solid #9333ea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>
              {uiLanguage === 'cs' ? 'Omnia přemýšlí...' : 
               uiLanguage === 'en' ? 'Omnia thinking...' : 'Omnia gândește...'}
            </span>
          </div>
        )}

        {/* ℹ️ INSTRUCTIONS */}
        <div 
          style={{
            marginTop: '2rem',
            fontSize: '0.9rem',
            opacity: 0.6,
            textAlign: 'center'
          }}
        >
          {isListening ? 
            (uiLanguage === 'cs' ? 'Klepněte na mikrofon pro ukončení' : 
             uiLanguage === 'en' ? 'Tap microphone to stop' : 
             'Apasă microfonul pentru a opri') :
            (uiLanguage === 'cs' ? 'Mluvte s Omnia' : 
             uiLanguage === 'en' ? 'Talk with Omnia' : 
             'Vorbește cu Omnia')
          }
        </div>
      </div>

      {/* 🌟 AI SPEAKING PULSE EFFECT - Screen Border Glow */}
      {isAudioPlaying && (
        <div
          className="ai-speaking-glow"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 900,
            border: '4px solid transparent',
            borderImage: 'linear-gradient(45deg, #4299e1, #9333ea, #06b6d4, #3b82f6) 1',
            boxShadow: `
              inset 0 0 30px rgba(66, 153, 225, 0.3),
              inset 0 0 60px rgba(147, 51, 234, 0.2),
              0 0 30px rgba(66, 153, 225, 0.4),
              0 0 60px rgba(147, 51, 234, 0.3)
            `,
            animation: 'aiSpeakingPulse 2s ease-in-out infinite alternate'
          }}
        />
      )}

      {/* 🎨 ANIMATIONS */}
      <style>{`
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes aiSpeakingPulse {
          0% {
            opacity: 0.3;
            box-shadow: 
              inset 0 0 20px rgba(66, 153, 225, 0.2),
              inset 0 0 40px rgba(147, 51, 234, 0.1),
              0 0 20px rgba(66, 153, 225, 0.3),
              0 0 40px rgba(147, 51, 234, 0.2);
          }
          50% {
            opacity: 0.6;
            box-shadow: 
              inset 0 0 40px rgba(66, 153, 225, 0.4),
              inset 0 0 80px rgba(147, 51, 234, 0.3),
              0 0 40px rgba(66, 153, 225, 0.5),
              0 0 80px rgba(147, 51, 234, 0.4);
          }
          100% {
            opacity: 0.8;
            box-shadow: 
              inset 0 0 60px rgba(66, 153, 225, 0.5),
              inset 0 0 120px rgba(147, 51, 234, 0.4),
              0 0 60px rgba(66, 153, 225, 0.6),
              0 0 120px rgba(147, 51, 234, 0.5);
          }
        }

        @keyframes screenPulse {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceScreen;