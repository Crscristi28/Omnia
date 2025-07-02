// 📁 src/components/voice/VoiceScreen.jsx
// 🎙️ UPGRADED Voice Screen - Mobile audio fix + Visual redesign
// ✅ Kompletní verze s opravami

import React, { useState, useRef, useEffect } from 'react';
import SimpleVoiceRecorder from './SimpleVoiceRecorder.jsx';
import { MiniOmniaLogo } from '../ui/OmniaLogos.jsx';
import detectLanguage from '../../utils/smartLanguageDetection.js';
import TypewriterText from '../ui/TypewriterText.jsx';

const VoiceScreen = ({ 
  isOpen,
  onClose,
  onTranscript,
  isLoading,
  isAudioPlaying,
  uiLanguage,
  messages = [],
  audioManager,
  currentModel = 'gpt-4o'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState([]);
  const messagesEndRef = useRef(null);
  
  const isMobile = window.innerWidth <= 768 || /iPhone|iPad|Android/i.test(navigator.userAgent);

  // 🔓 MOBILE AUDIO UNLOCK
  useEffect(() => {
    if (isOpen && isMobile && audioManager) {
      console.log('📱 Voice Screen opened on mobile - unlocking audio');
      audioManager.unlockAudioContext();
    }
  }, [isOpen, isMobile, audioManager]);

  // 🔓 Touch handler
  const handleTouchInteraction = () => {
    if (isMobile && audioManager && !audioManager.isUnlocked) {
      console.log('👆 Touch detected - unlocking audio context');
      audioManager.unlockAudioContext();
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [voiceHistory]);

  // Reset voice history when opening
  useEffect(() => {
    if (isOpen) {
      setVoiceHistory([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTranscript = (text, confidence) => {
    console.log('🎙️ Voice transcript received:', { text, confidence });
    setVoiceHistory(prev => [...prev, { type: 'user', text }]);
    
    if (isMobile && audioManager) {
      audioManager.unlockAudioContext();
    }
    
    onTranscript(text, confidence);
  };

  const handleVoiceStateChange = (listening) => {
    setIsListening(listening);
    if (isMobile && audioManager) {
      audioManager.unlockAudioContext();
    }
  };

  // Add bot response to history when it arrives
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'bot' && !lastMsg.isStreaming) {
        const lastHistoryMsg = voiceHistory[voiceHistory.length - 1];
        if (!lastHistoryMsg || lastHistoryMsg.type !== 'assistant' || lastHistoryMsg.text !== lastMsg.text) {
          setVoiceHistory(prev => [...prev, { type: 'assistant', text: lastMsg.text }]);
        }
      }
    }
  }, [messages]);

  // Background style
  const getBackgroundStyle = () => {
    if (isAudioPlaying) {
      return {
        background: `radial-gradient(circle at 50% 50%, 
          rgba(147, 51, 234, 0.4) 0%,
          rgba(100, 50, 255, 0.2) 30%,
          rgba(0, 150, 255, 0.1) 60%,
          rgba(15, 20, 25, 0.95) 100%)`,
        animation: 'omnia-speaking-bg 3s ease-in-out infinite'
      };
    }
    
    if (isListening) {
      return {
        background: `radial-gradient(circle at 50% 50%, 
          rgba(0, 255, 255, 0.3) 0%,
          rgba(0, 150, 255, 0.15) 40%,
          rgba(15, 20, 25, 0.95) 100%)`,
        animation: 'listening-bg 2s ease-in-out infinite'
      };
    }

    return {
      background: `radial-gradient(circle at 50% 30%, 
        rgba(0, 78, 146, 0.2) 0%,
        rgba(0, 4, 40, 0.95) 50%,
        rgba(15, 20, 25, 0.98) 100%)`
    };
  };

  return (
    <div 
      className="voice-screen-overlay"
      onTouchStart={handleTouchInteraction}
      onClick={handleTouchInteraction}
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
        backdropFilter: 'blur(20px)',
        transition: 'background 0.8s ease'
      }}
    >
      {/* HEADER */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MiniOmniaLogo 
            size={40} 
            isAudioPlaying={isAudioPlaying}
            loading={isLoading}
          />
          <div>
            <div style={{
              fontSize: isMobile ? '1.3rem' : '1.8rem',
              fontWeight: 'bold',
              background: isAudioPlaying
                ? 'linear-gradient(45deg, #9333ea, #6432ff, #00ffff)'
                : 'linear-gradient(45deg, #4299e1, #63b3ed, #00ffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: isAudioPlaying ? 'shimmer 2s ease-in-out infinite' : 'none'
            }}>
              Omnia Voice
            </div>
            <div style={{
              fontSize: '0.75rem',
              opacity: 0.7,
              color: '#ffc107',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginTop: '0.2rem'
            }}>
              ⚡ Fast Mode (GPT-4)
              {isLoading && <span style={{ animation: 'pulse 1s infinite' }}>•</span>}
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: 'white',
            fontSize: '1.2rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* CHAT MESSAGES */}
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        marginBottom: '2rem',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        minHeight: '200px',
        maxHeight: isMobile ? '40vh' : '50vh',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isAudioPlaying 
          ? '0 0 40px rgba(147, 51, 234, 0.3)' 
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
        transition: 'box-shadow 0.5s ease'
      }}>
        {voiceHistory.length === 0 && (
          <div style={{
            textAlign: 'center',
            opacity: 0.5,
            padding: '3rem',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}>
            {uiLanguage === 'cs' ? '👋 Ahoj! Začněte mluvit...' : 
             uiLanguage === 'en' ? '👋 Hello! Start speaking...' : 
             '👋 Salut! Începeți să vorbiți...'}
          </div>
        )}
        
        {voiceHistory.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.4s ease-out'
          }}>
            {msg.type === 'user' && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  padding: isMobile ? '0.7rem 1rem' : '0.8rem 1.2rem',
                  borderRadius: '20px 20px 4px 20px',
                  maxWidth: '75%',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  fontSize: isMobile ? '0.95rem' : '1rem'
                }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.3rem' }}>
                    🎙️ You
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            )}
            
            {msg.type === 'assistant' && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  background: (idx === voiceHistory.length - 1 && isAudioPlaying)
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(100, 50, 255, 0.3))'
                    : 'rgba(255, 255, 255, 0.08)',
                  padding: isMobile ? '0.7rem 1rem' : '0.8rem 1.2rem',
                  borderRadius: '20px 20px 20px 4px',
                  maxWidth: '75%',
                  border: (idx === voiceHistory.length - 1 && isAudioPlaying)
                    ? '2px solid rgba(147, 51, 234, 0.6)' 
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: (idx === voiceHistory.length - 1 && isAudioPlaying)
                    ? '0 0 30px rgba(147, 51, 234, 0.5)' 
                    : 'none',
                  animation: (idx === voiceHistory.length - 1 && isAudioPlaying)
                    ? 'omnia-message-glow 2s ease-in-out infinite' 
                    : 'none',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  transition: 'all 0.5s ease'
                }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.8, 
                    marginBottom: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <MiniOmniaLogo size={16} isAudioPlaying={idx === voiceHistory.length - 1 && isAudioPlaying} />
                    Omnia {(idx === voiceHistory.length - 1 && isAudioPlaying) && '🔊'}
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* VOICE RECORDER */}
      <div style={{ 
        marginBottom: '2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {(isListening || isAudioPlaying) && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: isAudioPlaying 
                ? 'radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent)'
                : 'radial-gradient(circle, rgba(0, 255, 255, 0.4), transparent)',
              filter: 'blur(40px)',
              animation: 'pulse-glow 2s ease-in-out infinite',
              pointerEvents: 'none'
            }}/>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: `2px solid ${isAudioPlaying ? 'rgba(147, 51, 234, 0.5)' : 'rgba(0, 255, 255, 0.3)'}`,
              animation: 'pulse-ring 1.5s ease-out infinite',
              pointerEvents: 'none'
            }}/>
          </>
        )}
        
        <SimpleVoiceRecorder 
          onTranscript={handleTranscript}
          onListeningChange={handleVoiceStateChange}
          disabled={isLoading || isAudioPlaying}
          isAudioPlaying={isAudioPlaying}
          uiLanguage={uiLanguage}
        />
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.8rem',
          marginBottom: '2rem',
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid rgba(255,255,255,0.3)', 
            borderTop: '2px solid #9333ea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}/>
          <span>
            {uiLanguage === 'cs' ? 'Omnia přemýšlí...' : 
             uiLanguage === 'en' ? 'Omnia thinking...' : 'Omnia gândește...'}
          </span>
        </div>
      )}

      {/* MOBILE HINT */}
      {isMobile && !audioManager?.isUnlocked && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '12px',
          padding: '0.5rem 1rem',
          fontSize: '0.8rem',
          color: '#ffc107',
          animation: 'fadeInUp 0.5s ease-out'
        }}>
          👆 {uiLanguage === 'cs' ? 'Tapněte kdekoli pro audio' : 
              uiLanguage === 'en' ? 'Tap anywhere for audio' : 
              'Apasă oriunde pentru audio'}
        </div>
      )}

      <style>{`
        @keyframes omnia-speaking-bg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        @keyframes listening-bg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        @keyframes omnia-message-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
            border-color: rgba(147, 51, 234, 0.6);
          }
          50% { 
            box-shadow: 0 0 40px rgba(147, 51, 234, 0.8);
            border-color: rgba(147, 51, 234, 0.9);
          }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
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
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default VoiceScreen;