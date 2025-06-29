// 🚀 OMNIA ENHANCED - CLEAN MODULAR VERSION - ČÁST 1/3
// ✅ Z ~1000 řádků na ~400 řádků!
// 🎯 Všechny komponenty jsou v samostatných souborech

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// 🔧 IMPORT SERVICES
import claudeService from './services/claude.service.js';
import openaiService from './services/openai.service.js';
import sonarService from './services/sonar.service.js';

// 🔧 IMPORT UTILS  
import { uiTexts, getTranslation } from './utils/translations.js';
import sessionManager from './utils/sessionManager.js';
import detectLanguage from './utils/smartLanguageDetection.js';
import { preprocessTextForTTS } from './utils/ttsPreprocessing.js';

// 🔧 IMPORT UI COMPONENTS
import SettingsDropdown from './components/ui/SettingsDropdown.jsx';
import { OmniaLogo, MiniOmniaLogo, ChatOmniaLogo } from './components/ui/OmniaLogos.jsx';
import OmniaArrowButton from './components/ui/OmniaArrowButton.jsx';
import TypewriterText from './components/ui/TypewriterText.jsx';
import VoiceButton from './components/ui/VoiceButton.jsx';
import CopyButton from './components/ui/CopyButton.jsx';

// 🔧 IMPORT VOICE COMPONENTS
import SimpleVoiceRecorder from './components/voice/SimpleVoiceRecorder.jsx';// 🚀 OMNIA ENHANCED - CLEAN MODULAR VERSION - ČÁST 2/3
// Pokračování z části 1/3...

// 🎵 GOOGLE TTS HELPER (jediná funkce co zůstala v App.jsx)
const generateInstantAudio = async (
  responseText, 
  setIsAudioPlaying, 
  currentAudioRef, 
  isIOS, 
  showNotification, 
  language = 'cs'
) => {
  try {
    const detectedLang = detectLanguage(responseText);
    console.log('🎵 Generating Google TTS audio for detected language:', detectedLang);
    
    const processedText = preprocessTextForTTS(responseText, detectedLang);
    
    const response = await fetch('/api/google-tts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ 
        text: processedText,
        language: detectedLang,
        voice: 'natural'
      })
    });

    if (!response.ok) {
      throw new Error(`Google TTS API failed: ${response.status}`);
    }

    setIsAudioPlaying(true);

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    currentAudioRef.current = audio;
    
    audio.onended = () => {
      console.log('✅ Google TTS audio playback finished');
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.onerror = (e) => {
      console.error('❌ Google TTS audio playback error:', e);
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
    };
    
    try {
      await audio.play();
      console.log('🎯 Google TTS audio plays IMMEDIATELY after AI response!');
    } catch (playError) {
      console.error('❌ Auto-play blocked:', playError);
      const playMsg = detectedLang === 'cs' ? 'Klepněte pro přehrání odpovědi' :
                     detectedLang === 'en' ? 'Click to play response' :
                     'Apasă pentru redare răspuns';
      showNotification(playMsg, 'info', () => {
        audio.play().catch(console.error);
      });
    }
    
    return audio;
    
  } catch (error) {
    console.error('💥 Google TTS audio generation failed:', error);
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    
    const errorMsg = language === 'cs' ? 'Google TTS se nepodařilo vygenerovat' :
                    language === 'en' ? 'Failed to generate Google TTS' :
                    'Nu s-a putut genera Google TTS';
    showNotification(errorMsg, 'error');
    throw error;
  }
};

// 🚀 MAIN APP COMPONENT
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // 🆕 VOICE STATES
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  
  // 🌍 LANGUAGE STATES
  const [userLanguage, setUserLanguage] = useState('cs');
  const [uiLanguage, setUILanguage] = useState('cs');
  
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const t = getTranslation(uiLanguage);

  // 🔧 NOTIFICATION SYSTEM
  const showNotification = (message, type = 'info', onClick = null) => {
    const notification = document.createElement('div');
    
    const baseStyle = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 10000;
      cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      font-weight: 500;
      max-width: 350px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    const typeStyles = {
      error: 'background: linear-gradient(135deg, rgba(220, 53, 69, 0.95), rgba(200, 35, 51, 0.95)); color: white;',
      success: 'background: linear-gradient(135deg, rgba(40, 167, 69, 0.95), rgba(32, 201, 151, 0.95)); color: white;',
      info: 'background: linear-gradient(135deg, rgba(0, 123, 255, 0.95), rgba(0, 150, 255, 0.95)); color: white;'
    };
    
    notification.style.cssText = baseStyle + (typeStyles[type] || typeStyles.info);
    
    const icons = { error: '⚠️', success: '✅', info: 'ℹ️' };
    notification.innerHTML = `
      <span style="font-size: 16px;">${icons[type] || icons.info}</span>
      <span>${message}</span>
      ${onClick ? '<span style="margin-left: auto; font-size: 12px; opacity: 0.8;">↗️</span>' : ''}
    `;
    
    if (onClick) {
      notification.addEventListener('click', () => {
        onClick();
        document.body.removeChild(notification);
      });
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px) scale(0.9)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 400);
      }
    }, type === 'error' ? 8000 : 4000);
  };

  // 🆕 handleNewChat
  const handleNewChat = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
    
    if (streaming) {
      setStreaming(false);
    }
    if (isListening) {
      setIsListening(false);
    }
    
    sessionManager.clearSession();
    setMessages([]);
    setUserLanguage('cs');
    
    showNotification(t('newChatCreated'), 'success');
  };

  // 🔧 ENHANCED handleSend
  const handleSend = async (textInput = input, fromVoice = false) => {
    if (!textInput.trim()) return;
    if (loading || streaming) return;

    const detectedLang = detectLanguage(textInput);
    
    if (detectedLang !== userLanguage) {
      console.log('🌍 Language change detected:', userLanguage, '→', detectedLang);
      setUserLanguage(detectedLang);
    }

    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }

    if (!fromVoice) {
      setInput('');
    }
    
    setLoading(true);

    try {
      const userMessage = { sender: 'user', text: textInput };
      const messagesWithUser = [...messages, userMessage];
      setMessages(messagesWithUser);
      sessionManager.saveMessages(messagesWithUser);

      let responseText = '';

      if (model === 'sonar') {
        const searchResult = await sonarService.search(textInput, showNotification, detectedLang);
        if (searchResult.success) {
          responseText = searchResult.result;
          if (searchResult.sources && searchResult.sources.length > 0) {
            const sourceText = detectedLang === 'cs' ? 'Zdroje' :
                              detectedLang === 'en' ? 'Sources' : 'Surse';
            responseText += `. ${sourceText}: ${searchResult.sources.slice(0, 2).join(', ')}`;
          }
        } else {
          const errorPrefix = detectedLang === 'cs' ? 'Nepodařilo se najít informace' :
                             detectedLang === 'en' ? 'Could not find information' :
                             'Nu am găsit informații';
          responseText = `${errorPrefix}: ${searchResult.message}`;
        }
        
        const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);

        if (showVoiceScreen || fromVoice) {
          await generateInstantAudio(
            responseText, setIsAudioPlaying, currentAudioRef, isIOS, 
            showNotification, detectLanguage(responseText)
          );
        }
      }
      else if (model === 'claude') {
        setStreaming(true);

        const streamingBotMessage = { sender: 'bot', text: '', isStreaming: true };
        const messagesWithBot = [...messagesWithUser, streamingBotMessage];
        setMessages(messagesWithBot);

        const onStreamUpdate = (text, isStillStreaming) => {
          const updatedMessages = [...messagesWithUser, { 
            sender: 'bot', 
            text: text, 
            isStreaming: isStillStreaming 
          }];
          setMessages(updatedMessages);
          
          if (!isStillStreaming) {
            sessionManager.saveMessages(updatedMessages);
            setStreaming(false);
            responseText = text;
            
            if (showVoiceScreen || fromVoice) {
              setTimeout(async () => {
                try {
                  await generateInstantAudio(
                    text, setIsAudioPlaying, currentAudioRef, isIOS,
                    showNotification, detectLanguage(text)
                  );
                } catch (error) {
                  console.error('❌ Claude auto-TTS failed:', error);
                }
              }, 300);
            }
          }
        };

        responseText = await claudeService.sendMessage(
          messagesWithUser, onStreamUpdate, null, detectedLang
        );
      }
      else if (model === 'gpt-4o') {
        const openAiMessages = [
          {
            role: 'system',
            content: openaiService.getSystemPrompt(detectedLang)
          },
          ...messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: textInput }
        ];

        responseText = await openaiService.sendMessage(openAiMessages, detectedLang);
        
        const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);

        if (showVoiceScreen || fromVoice) {
          await generateInstantAudio(
            responseText, setIsAudioPlaying, currentAudioRef, isIOS,
            showNotification, detectLanguage(responseText)
          );
        }
      }

    } catch (err) {
      console.error('💥 API call error:', err);
      showNotification(err.message, 'error', () => handleSend(textInput, fromVoice));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  // 🎙️ VOICE HANDLERS
  const handleTranscript = (text, confidence = 1.0) => {
    console.log('🎙️ Voice transcript received:', { text, confidence, voiceMode });
    
    if (showVoiceScreen || voiceMode) {
      handleSend(text, true);
    } else {
      setInput(text);
    }
  };

  const handleVoiceStateChange = (listening) => {
    console.log('🎙️ Voice state change:', listening);
    setIsListening(listening);
  };

  // 🔧 INITIALIZATION
  useEffect(() => {
    const { isNewSession, messages: savedMessages } = sessionManager.initSession();
    
    if (!isNewSession && savedMessages.length > 0) {
      setMessages(savedMessages);
      console.log('📂 Loaded', savedMessages.length, 'messages from previous session');
    }

    const savedUILanguage = sessionManager.getUILanguage();
    if (savedUILanguage && uiTexts[savedUILanguage]) {
      setUILanguage(savedUILanguage);
    }

    const savedVoiceMode = sessionManager.getVoiceMode();
    if (savedVoiceMode) {
      setVoiceMode(true);
    }
  }, []);

  // 🔄 AUTO-SCROLL
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const shouldHideLogo = messages.length > 0;

// POKRAČOVÁNÍ V ČÁSTI 3/3...// 🚀 OMNIA ENHANCED - CLEAN MODULAR VERSION - ČÁST 3/3
// Pokračování z části 2/3...

  // 🎨 JSX RETURN - CLEAN & SIMPLE!
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: isListening 
        ? 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
        : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif',
      width: '100vw',
      margin: 0,
      padding: 0,
      transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      
      {/* HEADER */}
      <header style={{ 
        padding: isMobile ? '1rem 1rem 0.5rem' : '1.5rem 2rem 1rem',
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.85), rgba(0, 78, 146, 0.6))',
        backdropFilter: 'blur(20px)',
        zIndex: 10
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: isMobile ? '1.5rem' : '2rem'
        }}>
          
          {/* MODEL SELECTOR */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={loading || streaming}
              style={{
                background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.8), rgba(45, 55, 72, 0.6))',
                border: '1px solid rgba(74, 85, 104, 0.6)',
                borderRadius: '10px',
                padding: '0.6rem 0.9rem',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {model === 'claude' ? '🧠 Omnia' : model === 'sonar' ? '🔍 Omnia Search' : '⚡ Omnia GPT'}
              {!streaming && !loading && !isListening && ' ▼'}
            </button>
            
            {/* MODEL DROPDOWN */}
            {showModelDropdown && !loading && !streaming && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'rgba(45, 55, 72, 0.95)',
                border: '1px solid rgba(74, 85, 104, 0.6)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(16px)',
                zIndex: 1000,
                minWidth: '220px',
                overflow: 'hidden'
              }}>
                {[
                  { key: 'gpt-4o', label: '⚡ Omnia GPT', desc: 'Konverzace' },
                  { key: 'claude', label: '🧠 Omnia', desc: 'AI + Streaming' },
                  { key: 'sonar', label: '🔍 Omnia Search', desc: 'Real-time' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { setModel(item.key); setShowModelDropdown(false); }}
                    style={{
                      display: 'block', 
                      width: '100%', 
                      padding: '0.8rem 1rem',
                      border: 'none', 
                      background: model === item.key ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                      textAlign: 'left', 
                      fontSize: '0.85rem', 
                      cursor: 'pointer',
                      fontWeight: model === item.key ? '600' : '400', 
                      color: model === item.key ? '#00ffff' : '#e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>{item.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SETTINGS BUTTON - ✅ FIXED WITH onClick! */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              disabled={loading || streaming}
              style={{
                background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.8), rgba(45, 55, 72, 0.6))',
                border: '1px solid rgba(74, 85, 104, 0.6)',
                borderRadius: '10px', 
                padding: '0.6rem', 
                fontSize: '1rem',
                color: '#e2e8f0',
                cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)'
              }}
              title={t('settings')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>
            
            <SettingsDropdown 
              isOpen={showSettingsDropdown && !loading && !streaming}
              onClose={() => setShowSettingsDropdown(false)}
              onNewChat={handleNewChat}
              uiLanguage={uiLanguage}
              setUILanguage={setUILanguage}
              t={t}
            />
          </div>
        </div>

        {/* LOGO SECTION */}
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '1rem', 
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <OmniaLogo 
            size={isMobile ? 70 : 90} 
            animate={streaming || loading}
            isListening={isListening}
            shouldHide={shouldHideLogo}
          />
          {!shouldHideLogo && (
            <>
              <h1 style={{ 
                fontSize: isMobile ? '2.2rem' : '2.8rem', 
                fontWeight: '700',
                margin: 0, 
                color: '#ffffff',
                letterSpacing: '0.02em'
              }}>
                OMNIA
              </h1>
              <div style={{
                fontSize: '0.95rem', 
                opacity: 0.8, 
                textAlign: 'center',
                padding: '6px 12px',
                borderRadius: '15px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: '500'
              }}>
                🌍 multilingual AI assistant
              </div>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: isMobile ? '1rem' : '2rem',
        paddingBottom: '160px',
        width: '100%'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          minHeight: messages.length === 0 ? '60vh' : 'auto',
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: messages.length === 0 ? 'center' : 'flex-start'
        }}>
          
          {messages.length === 0 && !shouldHideLogo && (
            <div style={{ height: '40vh' }}></div>
          )}

          {/* MESSAGES */}
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '2rem',
              animation: 'fadeInUp 0.4s ease-out'
            }}>
              {msg.sender === 'user' ? (
                <div style={{
                  backgroundColor: 'rgba(45, 55, 72, 0.8)',
                  color: '#ffd700',
                  padding: isMobile ? '1.2rem 1.4rem' : '1.4rem 1.6rem',
                  borderRadius: '25px 25px 8px 25px',
                  maxWidth: isMobile ? '85%' : '75%',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {msg.text}
                </div>
              ) : (
                <div style={{
                  maxWidth: isMobile ? '90%' : '85%',
                  padding: isMobile ? '1.2rem' : '1.6rem',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `3px solid ${msg.isStreaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                  borderRadius: '0 12px 12px 0',
                  paddingLeft: '1.8rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.7, 
                    marginBottom: '0.8rem',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingBottom: '0.6rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#a0aec0', 
                      display: 'flex', 
                      alignItems: 'center' 
                    }}>
                      <ChatOmniaLogo size={18} />
                      Omnia
                      {msg.isStreaming ? ' • streaming' : ''}
                    </span>
                    {!msg.isStreaming && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <VoiceButton 
                          text={msg.text} 
                          onAudioStart={() => setIsAudioPlaying(true)}
                          onAudioEnd={() => setIsAudioPlaying(false)}
                        />
                        <CopyButton text={msg.text} language={detectLanguage(msg.text)} />
                      </div>
                    )}
                  </div>
                  
                  <TypewriterText text={msg.text} isStreaming={msg.isStreaming} />
                </div>
              )}
            </div>
          ))}
          
          {/* LOADING INDICATOR */}
          {(loading || streaming) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-start', 
              marginBottom: '2rem',
              animation: 'fadeInUp 0.4s ease-out'
            }}>
              <div style={{
                padding: isMobile ? '1.2rem' : '1.6rem',
                fontSize: isMobile ? '1rem' : '0.95rem',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: `3px solid ${streaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                borderRadius: '0 12px 12px 0',
                paddingLeft: '1.8rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid #00ffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ 
                    color: streaming ? '#00ffff' : '#a0aec0', 
                    fontWeight: '500' 
                  }}>
                    {streaming ? t('omniaStreaming') : t('omniaPreparingResponse')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      {/* INPUT AREA */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8))',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '1.2rem' : '1.6rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1.2rem)' : '1.6rem',
        zIndex: 10
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          display: 'flex', 
          gap: '0.8rem', 
          alignItems: 'center'
        }}>
          
          {/* INPUT FIELD */}
          <div style={{ flex: 1 }}>
            <input
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && !streaming && handleSend()}
              placeholder={isListening ? t('listening') + '...' :
                          streaming ? t('omniaStreaming') : 
                          `${t('sendMessage')} Omnia...`}
              disabled={loading || streaming}
              style={{ 
                width: '100%', 
                padding: isMobile ? '1.1rem 1.4rem' : '1.2rem 1.6rem',
                fontSize: isMobile ? '16px' : '0.95rem', 
                borderRadius: '30px',
                border: '2px solid rgba(74, 85, 104, 0.6)',
                outline: 'none',
                backgroundColor: (loading || streaming) 
                  ? 'rgba(45, 55, 72, 0.6)' 
                  : 'rgba(26, 32, 44, 0.8)',
                color: '#ffffff',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                opacity: (loading || streaming) ? 0.7 : 1,
                backdropFilter: 'blur(10px)',
                fontWeight: '400'
              }}
            />
          </div>
          
          {/* VOICE SCREEN BUTTON */}
          <MiniOmniaLogo 
            size={isMobile ? 54 : 60} 
            onClick={() => !loading && !streaming && setShowVoiceScreen(true)}
            isAudioPlaying={isAudioPlaying}
            isListening={isListening}
            loading={loading}
            streaming={streaming}
          />

          {/* SEND BUTTON */}
          <OmniaArrowButton
            onClick={() => handleSend()}
            disabled={loading || streaming || !input.trim()}
            loading={loading || streaming}
            isListening={isListening}
            size={isMobile ? 54 : 60}
          />
        </div>
      </div>

      {/* VOICE SCREEN MODAL */}
      {showVoiceScreen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #4a5568 100%)',
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
            backdropFilter: 'blur(10px)'
          }}
          onClick={() => setShowVoiceScreen(false)}
        >
          <div 
            style={{
              fontSize: isMobile ? '3.5rem' : '4.5rem',
              fontWeight: 'bold',
              marginBottom: '2rem',
              background: 'linear-gradient(45deg, #4299e1, #63b3ed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            OMNIA
          </div>
          
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
              disabled={loading}
              isAudioPlaying={isAudioPlaying}
              uiLanguage={uiLanguage}
            />
          </div>
        </div>
      )}

      {/* ✅ CSS STYLES */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        @keyframes blink { 
          0%, 50% { opacity: 1; } 
          51%, 100% { opacity: 0; } 
        }
        @keyframes pulse { 
          0%, 100% { opacity: 1; transform: scale(1); } 
          50% { opacity: 0.7; transform: scale(0.95); } 
        }
        
        @keyframes omnia-pulse {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(100, 50, 255, 0.8); 
            transform: scale(1) translateZ(0); 
          }
          50% { 
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.9); 
            transform: scale(1.05) translateZ(0); 
          }
        }
        
        @keyframes omnia-listening {
          0%, 100% { 
            transform: scale(1) translateZ(0); 
            filter: brightness(1) hue-rotate(0deg); 
          }
          50% { 
            transform: scale(1.03) translateZ(0); 
            filter: brightness(1.2) hue-rotate(10deg); 
          }
        }
        
        @keyframes omnia-breathe {
          0%, 100% { 
            transform: scale(1) translateZ(0); 
            filter: brightness(1); 
          }
          50% { 
            transform: scale(1.02) translateZ(0); 
            filter: brightness(1.1); 
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px) translateZ(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateZ(0);
          }
        }

        html, body { 
          margin: 0; 
          padding: 0; 
          width: 100%; 
          overflow-x: hidden; 
          background: #000000;
        }
        
        * { 
          -webkit-tap-highlight-color: transparent; 
          box-sizing: border-box;
        }
        
        @media (max-width: 768px) { 
          input { font-size: 16px !important; }
          button { min-height: 44px; min-width: 44px; }
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(26, 32, 44, 0.5); }
        ::-webkit-scrollbar-thumb { 
          background: rgba(74, 85, 104, 0.8); 
          border-radius: 4px; 
        }
        
        button { 
          -webkit-user-select: none; 
          user-select: none; 
        }
        
        input:focus { outline: none !important; }
      `}</style>
    </div>
  );
};

export default App;