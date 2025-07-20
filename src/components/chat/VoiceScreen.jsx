// 📁 src/components/voice/VoiceScreen.jsx
// 🎙️ Enhanced Voice Screen Modal with Chat History

import React, { useState, useRef, useEffect } from 'react';
import { SimpleVoiceRecorder } from '../voice';
import { MiniOmniaLogo } from '../ui';

const VoiceScreen = ({ 
  isOpen,
  onClose,
  onTranscript,
  isLoading,
  isAudioPlaying,
  uiLanguage,
  messages = [],
  currentResponse = null,
  // 🆕 Nové props
  voiceMessages = [],
  isOmniaSpeaking = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const messagesEndRef = useRef(null);
  
  const isMobile = window.innerWidth <= 768;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [voiceMessages, currentResponse]);

  if (!isOpen) return null;

  const handleTranscript = (text, confidence) => {
    console.log('🎙️ Voice transcript in VoiceScreen:', text);
    setLastTranscript(text);
    onTranscript(text, confidence);
  };

  const handleVoiceStateChange = (listening) => {
    setIsListening(listening);
  };

  // 🎨 ENHANCED UI s glow efektem
  const getBackgroundStyle = () => {
    if (isOmniaSpeaking) {
      return {
        background: `
          radial-gradient(circle at 50% 50%, 
            rgba(147, 51, 234, 0.3) 0%,
            rgba(100, 50, 255, 0.15) 40%,
            rgba(15, 20, 25, 0.95) 100%
          )
        `,
        animation: 'omnia-speaking-glow 2s ease-in-out infinite'
      };
    }
    
    if (isListening) {
      return {
        background: `
          radial-gradient(circle at 50% 50%, 
            rgba(0, 255, 255, 0.2) 0%,
            rgba(0, 150, 255, 0.1) 50%,
            rgba(15, 20, 25, 0.95) 100%
          )
        `,
        animation: 'pulse-bg 2s ease-in-out infinite'
      };
    }

    return {
      background: 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #2d3748 100%)'
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
        zIndex: 1001,
        padding: isMobile ? '1rem' : '2rem',
        minHeight: '100vh',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)',
        transition: 'background 0.5s ease'
      }}
    >
      {/* 🎯 HEADER WITH CLOSE BUTTON */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 'bold',
          background: isOmniaSpeaking
            ? 'linear-gradient(45deg, #9333ea, #6432ff, #00ffff)'
            : 'linear-gradient(45deg, #4299e1, #63b3ed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: isOmniaSpeaking ? 'glow-text 2s ease-in-out infinite' : 'none'
        }}>
          OMNIA Voice Chat
        </div>
        
        <button
          onClick={onClose}
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

      {/* 🆕 CHAT MESSAGES AREA */}
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: '800px',
        marginBottom: '2rem',
        overflowY: 'auto',
        maxHeight: '45vh',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {voiceMessages.length === 0 && !currentResponse && (
          <div style={{
            textAlign: 'center',
            opacity: 0.5,
            padding: '3rem'
          }}>
            {uiLanguage === 'cs' ? 'Začněte mluvit...' : 
             uiLanguage === 'en' ? 'Start speaking...' : 
             'Începeți să vorbiți...'}
          </div>
        )}
        
        {/* Voice Messages */}
        {voiceMessages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.4s ease-out'
          }}>
            {/* User Message */}
            {msg.type === 'user' && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '18px 18px 4px 18px',
                  maxWidth: '70%',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.3rem' }}>
                    🎙️ You
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            )}
            
            {/* Omnia Message */}
            {msg.type === 'assistant' && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  background: msg.isPlaying || (idx === voiceMessages.length - 1 && isOmniaSpeaking)
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(100, 50, 255, 0.3))'
                    : 'rgba(255, 255, 255, 0.05)',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '18px 18px 18px 4px',
                  maxWidth: '70%',
                  border: msg.isPlaying || (idx === voiceMessages.length - 1 && isOmniaSpeaking)
                    ? '2px solid rgba(147, 51, 234, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: msg.isPlaying || (idx === voiceMessages.length - 1 && isOmniaSpeaking)
                    ? '0 0 30px rgba(147, 51, 234, 0.5)' 
                    : 'none',
                  animation: msg.isPlaying || (idx === voiceMessages.length - 1 && isOmniaSpeaking)
                    ? 'omnia-message-glow 2s ease-in-out infinite' 
                    : 'none'
                }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.8, 
                    marginBottom: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <MiniOmniaLogo size={16} isAudioPlaying={msg.isPlaying || (idx === voiceMessages.length - 1 && isOmniaSpeaking)} />
                    Omnia {(msg.isPlaying || (idx === voiceMessages.length - 1 && isOmniaSpeaking)) && '🔊'}
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Current Response (Streaming) */}
        {currentResponse && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '0.5rem',
            animation: 'fadeInUp 0.4s ease-out'
          }}>
            <div style={{
              background: isOmniaSpeaking 
                ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(100, 50, 255, 0.3))'
                : 'rgba(255, 255, 255, 0.05)',
              padding: '0.8rem 1.2rem',
              borderRadius: '18px 18px 18px 4px',
              maxWidth: '70%',
              border: isOmniaSpeaking ? '2px solid rgba(147, 51, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isOmniaSpeaking ? '0 0 30px rgba(147, 51, 234, 0.5)' : 'none',
              animation: isOmniaSpeaking ? 'omnia-message-glow 2s ease-in-out infinite' : 'none'
            }}>
              <div style={{ 
                fontSize: '0.7rem', 
                opacity: 0.8, 
                marginBottom: '0.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MiniOmniaLogo size={16} isAudioPlaying={isOmniaSpeaking} />
                Omnia {isOmniaSpeaking && '🔊 mluví...'}
              </div>
              <div style={{ 
                whiteSpace: 'pre-wrap',
                fontSize: '1rem',
                lineHeight: '1.5',
                color: '#FFFFFF'
              }}>
                {currentResponse}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

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
          disabled={isLoading || isOmniaSpeaking}
          isAudioPlaying={isAudioPlaying}
          uiLanguage={uiLanguage}
        />
        
        {/* 🌊 VOICE VISUALIZER */}
        {(isListening || isOmniaSpeaking) && (
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
              border: `2px solid ${isOmniaSpeaking ? 'rgba(147, 51, 234, 0.5)' : 'rgba(0, 255, 255, 0.3)'}`,
              animation: isOmniaSpeaking 
                ? 'omnia-pulse-ring 1.5s ease-out infinite' 
                : 'pulse-ring 1.5s ease-out infinite',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* 🔄 LOADING STATE */}
      {isLoading && !currentResponse && (
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
          (uiLanguage === 'cs' ? 'Mluvte s Omnia' : 
           uiLanguage === 'en' ? 'Talk with Omnia' : 
           'Vorbește cu Omnia')
        }
      </div>

      {/* 🎨 ANIMATIONS */}
      <style>{`
        @keyframes omnia-speaking-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes omnia-message-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
            border-color: rgba(147, 51, 234, 0.5);
          }
          50% { 
            box-shadow: 0 0 40px rgba(147, 51, 234, 0.8);
            border-color: rgba(147, 51, 234, 0.8);
          }
        }
        
        @keyframes omnia-pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            border-color: rgba(147, 51, 234, 0.5);
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
            border-color: rgba(147, 51, 234, 0);
          }
        }
        
        @keyframes glow-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VoiceScreen;