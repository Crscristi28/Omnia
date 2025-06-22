// App.jsx - MOBILE OPTIMIZED VERZE (s gradient logem) - OPRAVENÝ LAYOUT PRO MACBOOK + CLAUDE PAMĚŤ

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// 🎨 GRADIENT LOGO KOMPONENTA
const OmniaLogo = ({ size = 100, animate = false }) => {
  return (
    <div
      className={`omnia-logo ${animate ? 'animate' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 30%, 
            rgba(0, 255, 255, 0.9) 0%,
            rgba(0, 150, 255, 1) 25%,
            rgba(100, 50, 255, 1) 50%,
            rgba(200, 50, 200, 0.9) 75%,
            rgba(100, 50, 255, 0.7) 100%
          )
        `,
        boxShadow: `
          0 0 ${size * 0.3}px rgba(0, 150, 255, 0.4),
          inset 0 0 ${size * 0.2}px rgba(255, 255, 255, 0.3)
        `,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Inner highlight */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '25%',
          height: '25%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.4)',
          filter: 'blur(6px)'
        }}
      />
    </div>
  );
};

// 🎤 VOICE RECORDING KOMPONENTA - PUSH TO TALK (FIXED)
const VoiceRecorder = ({ onTranscript, disabled, mode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null); // Track stream for proper cleanup

  const startRecording = async () => {
    try {
      console.log('🎙️ Začínám nahrávání...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      streamRef.current = stream; // Store stream reference

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Nahrávání ukončeno, zpracovávám...');
        setIsProcessing(true);
        
        // 🔧 OKAMŽITĚ VYPNI STREAM
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('🔇 Track stopped:', track.kind);
          });
          streamRef.current = null;
        }
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();

          const response = await fetch('/api/whisper', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: arrayBuffer
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ Přepsaný text:', data.text);
          
          onTranscript(data.text);

        } catch (error) {
          console.error('💥 Whisper error:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('💥 Recording error:', error);
      alert('Nepodařilo se získat přístup k mikrofonu');
    }
  };

  const stopRecording = () => {
    console.log('🔧 Force stop recording...');
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
    }
    
    // 🔧 FORCE CLEANUP - VŽDY VYPNI STREAM
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Force stopped track:', track.kind);
      });
      streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  // 🔧 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - cleanup');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 🔧 EMERGENCY CLEANUP pokud zůstane nahrávání aktivní
  useEffect(() => {
    const cleanup = () => {
      if (isRecording) {
        console.log('🚨 Emergency cleanup - stopping recording');
        stopRecording();
      }
    };

    // Cleanup při změně stránky
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('visibilitychange', () => {
      if (document.hidden && isRecording) {
        cleanup();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('visibilitychange', cleanup);
    };
  }, [isRecording]);

  // 🎯 ROBUSTNÍ PUSH-TO-TALK HANDLERS
  const handleStart = () => {
    if (!disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleStop = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // 📱 UNIFIED HANDLERS
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart();
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    handleStop();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    handleStart();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleStop();
  };

  // 🔧 CATCH-ALL STOP HANDLERS
  const handleMouseLeave = () => {
    if (isRecording) {
      console.log('🔧 Mouse left button - stopping');
      handleStop();
    }
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    if (isRecording) {
      console.log('🔧 Touch cancelled - stopping');
      handleStop();
    }
  };

  const getButtonStyle = () => {
    if (isProcessing) return { backgroundColor: '#FFA500', color: 'white' };
    if (isRecording) return { backgroundColor: '#FF4444', color: 'white', transform: 'scale(1.1)' };
    return { backgroundColor: '#007bff', color: 'white' };
  };

  const getButtonText = () => {
    if (isProcessing) return '⏳';
    if (isRecording) return '🔴';
    return '🎤';
  };

  const getButtonTitle = () => {
    return 'Držte pro mluvení';
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      disabled={disabled || isProcessing}
      title={getButtonTitle()}
      style={{
        ...getButtonStyle(),
        border: 'none',
        borderRadius: '1rem',
        padding: '1rem',
        fontSize: '1.1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '60px',
        transition: 'all 0.2s',
        boxShadow: isRecording ? '0 0 20px rgba(255, 68, 68, 0.5)' : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {getButtonText()}
    </button>
  );
};
const VoiceButton = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const handleSpeak = async () => {
    if (isPlaying) {
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🎤 Generuji hlas...');

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Vytvoř audio element
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error');
      };

      await audio.play();
      console.log('🔊 Audio přehrávání zahájeno');

    } catch (error) {
      console.error('💥 Voice error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading}
      style={{
        background: 'none',
        border: 'none',
        cursor: isLoading ? 'wait' : 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        opacity: isLoading ? 0.5 : 0.7,
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.opacity = '1'}
      onMouseLeave={(e) => e.target.style.opacity = isLoading ? '0.5' : '0.7'}
    >
      {isLoading ? '⏳' : isPlaying ? '⏸️' : '🔊'}
    </button>
  );
};

function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [charIndex, setCharIndex] = React.useState(0);
  const chars = React.useMemo(() => Array.from(text), [text]);

  React.useEffect(() => {
    if (charIndex >= chars.length) return;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + chars[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, 20);

    return () => clearTimeout(timeout);
  }, [charIndex, chars]);

  return <span>{displayedText}</span>;
}

// 🔧 HELPER FUNKCE PRO CLAUDE MESSAGES
const prepareClaudeMessages = (messages) => {
  try {
    // Filtrovat pouze user/assistant messages
    const validMessages = messages.filter(msg => 
      msg.sender === 'user' || msg.sender === 'bot'
    );

    // Konvertovat na Claude formát
    let claudeMessages = validMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || ''
    }));

    // Claude nesmí začínat assistant message
    if (claudeMessages.length > 0 && claudeMessages[0].role === 'assistant') {
      claudeMessages = claudeMessages.slice(1);
    }

    // Claude nesmí mít dva stejné role za sebou - oprava
    const cleanMessages = [];
    for (let i = 0; i < claudeMessages.length; i++) {
      const current = claudeMessages[i];
      const previous = cleanMessages[cleanMessages.length - 1];
      
      // Přidej pouze pokud není stejný role jako předchozí
      if (!previous || previous.role !== current.role) {
        cleanMessages.push(current);
      }
    }

    // Claude musí končit user message (pokud posíláme novou zprávu)
    if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === 'assistant') {
      cleanMessages.pop();
    }

    console.log('📝 Prepared Claude messages:', cleanMessages);
    return cleanMessages;

  } catch (error) {
    console.error('💥 Error preparing Claude messages:', error);
    // Fallback - vrať jen poslední user message
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
    return lastUserMessage.map(msg => ({
      role: 'user',
      content: msg.text || ''
    }));
  }
};

// ONLINE API SERVICES (pro Vercel)
const claudeService = {
  async sendMessage(messages) {
    try {
      console.log('🔄 Volám Claude přes Vercel API...');
      
      // Příprava bezpečných messages pro Claude
      const claudeMessages = prepareClaudeMessages(messages);
      
      // System prompt pro Claude (samostatně)
      const systemPrompt = 'Jsi Omnia, chytrý AI asistent. Odpovídej vždy výhradně v češtině, gramaticky správně a přirozeně. Piš stručně, jako chytrý a lidsky znějící člověk, bez formálností. Nepiš "Jsem AI" ani se nijak nepředstavuj. Odpovědi musí být stylisticky i jazykově bezchybné, jako by je psal rodilý mluvčí.';
      
      const response = await fetch('/api/claude2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: claudeMessages,
          system: systemPrompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response structure');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  }
};

const openaiService = {
  async sendMessage(messages) {
    try {
      console.log('🔄 Volám OpenAI přes Vercel API...');
      
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('💥 OpenAI error:', error);
      throw error;
    }
  }
};

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('gpt-4o'); // 'gpt-4o' or 'claude'
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState('text'); // 'text', 'hybrid', 'conversation'
  const [autoPlay, setAutoPlay] = useState(true); // Default true pro conversation mode
  const endOfMessagesRef = useRef(null);

  // Detekce mobile zařízení
  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  // Force light mode pro celou aplikaci
  useEffect(() => {
    // Přidej meta tag pro color-scheme
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]') || document.createElement('meta');
    metaColorScheme.name = 'color-scheme';
    metaColorScheme.content = 'light only';
    if (!document.querySelector('meta[name="color-scheme"]')) {
      document.head.appendChild(metaColorScheme);
    }

    // Přidej CSS pro force light mode + LOGO ANIMATIONS
    const darkModeOverride = document.getElementById('dark-mode-override') || document.createElement('style');
    darkModeOverride.id = 'dark-mode-override';
    darkModeOverride.innerHTML = `
      html, body {
        color-scheme: light only !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        box-sizing: border-box !important;
      }
      
      #root {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      
      * {
        color-scheme: light only !important;
        box-sizing: border-box !important;
      }
      
      input, textarea, select, button {
        background-color: #ffffff !important;
        color: #000000 !important;
        border-color: #cccccc !important;
      }
      
      /* 🎨 LOGO ANIMATIONS */
      .omnia-logo:hover {
        transform: scale(1.05);
        filter: brightness(1.2);
      }
      
      .omnia-logo.animate {
        animation: omnia-pulse 4s ease-in-out infinite;
      }
      
      @keyframes omnia-pulse {
        0%, 100% { 
          transform: scale(1);
          filter: brightness(1);
        }
        50% { 
          transform: scale(1.03);
          filter: brightness(1.15);
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @media (prefers-color-scheme: dark) {
        html, body, #root {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        
        * {
          background-color: inherit !important;
          color: inherit !important;
        }
      }
    `;
    if (!document.getElementById('dark-mode-override')) {
      document.head.appendChild(darkModeOverride);
    }

    return () => {
      // Cleanup při unmount
      const meta = document.querySelector('meta[name="color-scheme"]');
      const style = document.getElementById('dark-mode-override');
      if (meta) meta.remove();
      if (style) style.remove();
    };
  }, []);

  // Načtení historie z localStorage při startu
  useEffect(() => {
    const navType = window.performance?.navigation?.type;
    if (navType === 1) { // Reload
      localStorage.removeItem('omnia-memory');
      setMessages([]);
    } else {
      const saved = localStorage.getItem('omnia-memory');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          setMessages([]);
        }
      }
    }
  }, []);

  const handleSend = async (textInput = input) => {
    if (!textInput.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: textInput }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let responseText = '';

    try {
      if (model === 'gpt-4o') {
        // OpenAI formát (nezměněno - funguje)
        const openAiMessages = [
          { 
            role: 'system', 
            content: 'Jsi Omnia, chytrý AI asistent. Odpovídej vždy výhradně v češtině, gramaticky správně a přirozeně. Piš stručně, jako chytrý a lidsky znějící člověk, bez formálností. Nepiš "Jsem AI" ani se nijak nepředstavuj. Odpovědi musí být stylisticky i jazykově bezchybné, jako by je psal rodilý mluvčí.' 
          },
          ...newMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ];

        responseText = await openaiService.sendMessage(openAiMessages);

      } else if (model === 'claude') {
        // Claude formát s pamětí (nově opraveno)
        responseText = await claudeService.sendMessage(newMessages);
      }

      console.log('✅ Odpověď získána:', responseText);

    } catch (err) {
      console.error('💥 Chyba při volání API:', err);
      responseText = `Chyba: ${err.message}`;
    }

    const updatedMessages = [...newMessages, { sender: 'bot', text: responseText }];
    setMessages(updatedMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
    setLoading(false);

    // Auto-play pro conversation mode
    if (voiceMode === 'conversation' || (autoPlay && voiceMode === 'hybrid')) {
      // Krátká pauza před přehráním
      setTimeout(() => {
        playResponseAudio(responseText);
      }, 1000);
    }
  };

  const handleTranscript = (text) => {
    if (voiceMode === 'conversation') {
      // V conversation mode rovnou pošli
      handleSend(text);
    } else {
      // V hybrid mode vlož do input pole
      setInput(text);
    }
  };

  const playResponseAudio = async (text) => {
    try {
      console.log('🔊 Attempting auto-play for:', text.substring(0, 50) + '...');
      console.log('📱 Mobile device:', isMobile, 'iOS:', isIOS, 'Android:', isAndroid);
      
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        console.error('❌ Voice API failed:', response.status);
        showNotification('🔇 Hlas se nepodařilo přehrát', 'error');
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // 📱 MOBILNÍ OPTIMALIZACE
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // iOS potřebuje speciální handling
      if (isIOS) {
        audio.load(); // Explicitní load pro iOS
      }
      
      let playStarted = false;
      
      audio.oncanplay = () => {
        console.log('🎵 Audio ready to play');
      };
      
      audio.onplay = () => {
        playStarted = true;
        console.log('🎵 Auto-play started successfully');
      };
      
      audio.onended = () => {
        console.log('✅ Auto-play finished');
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        showNotification('🔇 Chyba přehrávání hlasu', 'error');
      };
      
      // 📱 MOBILNÍ STRATEGIE
      if (isMobile) {
        // Na mobilu - pokud je conversation mode, zkus auto-play, jinak notifikace
        if (voiceMode === 'conversation') {
          try {
            await audio.play();
            if (!playStarted) {
              throw new Error('Play did not start');
            }
          } catch (error) {
            console.error('❌ Mobile auto-play failed:', error);
            showNotification('🔊 Tap to play response', 'info', () => {
              audio.play().catch(console.error);
            });
          }
        } else {
          // Pro jiné režimy ukáž notifikaci
          showNotification('🔊 Tap to play response', 'info', () => {
            audio.play().catch(console.error);
          });
        }
      } else {
        // Desktop - zkus auto-play
        try {
          await audio.play();
          if (!playStarted) {
            throw new Error('Play did not start');
          }
        } catch (error) {
          console.error('❌ Auto-play blocked/failed:', error);
          showNotification('🔊 Klikněte pro přehrání odpovědi', 'info', () => {
            audio.play().catch(console.error);
          });
        }
      }
      
    } catch (error) {
      console.error('💥 Auto-play error:', error);
      showNotification('🔇 Chyba při generování hlasu', 'error');
    }
  };

  // 🔔 HELPER FUNKCE PRO NOTIFIKACE
  const showNotification = (message, type = 'info', onClick = null) => {
    // Vytvoř dočasnou notifikaci
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : '#007bff'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    
    if (onClick) {
      notification.addEventListener('click', () => {
        onClick();
        document.body.removeChild(notification);
      });
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove po 4 sekundách
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <div 
      className="main-wrapper" 
      style={{ 
        minHeight: '100vh', 
        height: '100vh',
        display: 'flex', 
        flexDirection: 'column',
        background: '#ffffff',
        color: '#000000',
        width: '100vw',
        margin: 0,
        padding: 0,
        colorScheme: 'light only',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="app light" style={{ 
        minHeight: '100vh',
        height: '100vh',
        display: 'flex', 
        flexDirection: 'column',
        background: '#ffffff',
        color: '#000000',
        width: '100%',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}>
        
        {/* KOMPAKTNÍ HEADER PRO MOBILE */}
        <header style={{ 
          padding: isMobile ? '1rem 0.5rem 0.5rem' : '2rem 1rem 1rem',
          background: '#ffffff',
          color: '#000000',
          borderBottom: '1px solid #eee',
          position: 'relative',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          {/* 🎨 GRADIENT LOGO */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: isMobile ? '0.5rem' : '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <OmniaLogo 
              size={isMobile ? 60 : 80} 
              animate={true}
            />
            <h1 style={{ 
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              background: 'linear-gradient(135deg, #00aaff 0%, #6644ff 50%, #cc44aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.05em'
            }}>
              OMNIA
            </h1>
          </div>

          {/* Controls - větší na mobile */}
          <div style={{ 
            display: 'flex', 
            justifyContent: isMobile ? 'space-between' : 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '0' : '0 2rem'
          }}>
            {/* Voice Mode Selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              minWidth: isMobile ? 'auto' : '150px',
              justifyContent: isMobile ? 'flex-start' : 'center'
            }}>
              <label style={{ 
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 'bold' 
              }}>
                Režim:
              </label>
              <select 
                value={voiceMode} 
                onChange={(e) => setVoiceMode(e.target.value)}
                style={{ 
                  padding: isMobile ? '0.4rem' : '0.3rem',
                  fontSize: isMobile ? '0.9rem' : '0.8rem',
                  borderRadius: '0.4rem',
                  border: '1px solid #ccc',
                  minWidth: isMobile ? '100px' : 'auto'
                }}
              >
                <option value="text">📝 Text</option>
                <option value="hybrid">🎤 Hybrid</option>
                <option value="conversation">🗣️ Chat</option>
              </select>
            </div>

            {/* Model selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              minWidth: isMobile ? 'auto' : '200px',
              justifyContent: isMobile ? 'flex-start' : 'center'
            }}>
              <label style={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 'bold' 
              }}>
                Model:
              </label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ 
                  padding: isMobile ? '0.6rem' : '0.4rem',
                  fontSize: isMobile ? '1rem' : '0.9rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ccc',
                  minWidth: isMobile ? '140px' : 'auto'
                }}
              >
                <option value="gpt-4o">Omnia (GPT-4)</option>
                <option value="claude">Omnia (Claude)</option>
              </select>
            </div>

            {/* Skryj auto-play toggle - v conversation mode je vždy auto */}
            {voiceMode === 'hybrid' && !isMobile && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.3rem',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                color: '#666',
                minWidth: isMobile ? 'auto' : '120px',
                justifyContent: 'center'
              }}>
                <label style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  🔊 Auto:
                </label>
                <input 
                  type="checkbox" 
                  checked={autoPlay} 
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            )}

            {/* Conversation mode info */}
            {voiceMode === 'conversation' && (
              <div style={{ 
                fontSize: '0.8rem',
                color: '#007bff',
                textAlign: 'center',
                fontWeight: 'bold',
                minWidth: '120px'
              }}>
                🗣️ Conversation
              </div>
            )}

            {/* Online status */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              color: '#666',
              minWidth: isMobile ? 'auto' : '80px',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#4CAF50', 
                borderRadius: '50%' 
              }}></div>
              Online
            </div>

            {/* Nový chat button */}
            <button
              onClick={() => {
                localStorage.removeItem('omnia-memory');
                setMessages([]);
              }}
              style={{ 
                padding: isMobile ? '0.6rem 1rem' : '0.6rem 1.2rem',
                fontSize: isMobile ? '0.9rem' : '0.9rem',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                minWidth: isMobile ? 'auto' : '120px'
              }}
            >
              Nový chat
            </button>
          </div>
        </header>

        {/* CHAT CONTAINER */}
        <main style={{ 
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '1rem',
          paddingBottom: isMobile ? '140px' : '120px',
          background: '#ffffff',
          color: '#000000',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            minHeight: '50vh',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
                    color: '#000',
                    padding: isMobile ? '1rem' : '0.8rem 1rem',
                    borderRadius: '1rem',
                    maxWidth: isMobile ? '85%' : '70%',
                    fontSize: isMobile ? '1.1rem' : '1rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* 🎨 AI indikátor s malým logem */}
                  {msg.sender === 'bot' && (
                    <div style={{ 
                      fontSize: isMobile ? '0.8rem' : '0.7rem',
                      opacity: 0.7, 
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <OmniaLogo size={14} />
                        Omnia
                      </div>
                      {/* 🔊 VOICE BUTTON */}
                      <VoiceButton text={msg.text} />
                    </div>
                  )}
                  
                  {msg.sender === 'bot' ? (
                    <TypewriterText text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#F1F0F0',
                  padding: isMobile ? '1rem' : '0.8rem 1rem',
                  borderRadius: '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <OmniaLogo size={12} animate={true} />
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      border: '2px solid #ccc', 
                      borderTop: '2px solid #666',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Omnia přemýšlí...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
        </main>

        {/* FIXED INPUT AREA */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0,
          right: 0,
          width: '100vw',
          background: '#ffffff', 
          color: '#000000',
          padding: isMobile ? '1rem' : '1rem',
          borderTop: '1px solid #eee',
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 1rem)' : '1rem',
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex', 
            gap: isMobile ? '0.5rem' : '1rem',
            width: '100%',
            boxSizing: 'border-box',
            padding: '0 1rem'
          }}>
            {voiceMode !== 'conversation' && (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder={voiceMode === 'hybrid' ? "Napište nebo použijte mikrofon..." : "Zeptej se Omnie…"}
                disabled={loading}
                style={{ 
                  flex: 1,
                  padding: isMobile ? '1.2rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  borderRadius: '1rem',
                  border: '1px solid #ccc',
                  outline: 'none',
                  backgroundColor: loading ? '#f5f5f5' : '#ffffff',
                  color: '#000000',
                  width: '100%',
                  boxSizing: 'border-box',
                  colorScheme: 'light only'
                }}
              />
            )}
            
            {voiceMode === 'conversation' && (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '1.2rem' : '1rem',
                fontSize: isMobile ? '1.1rem' : '1rem',
                borderRadius: '1rem',
                border: '2px solid #007bff',
                backgroundColor: '#f8f9ff',
                color: '#007bff',
                textAlign: 'center',
                fontWeight: 'bold',
                minHeight: '50px'
              }}>
                {loading ? (
                  <>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid #007bff', 
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }}></div>
                    Omnia přemýšlí...
                  </>
                ) : (
                  "🎤 Držte tlačítko a mluvte"
                )}
              </div>
            )}

            {(voiceMode === 'hybrid' || voiceMode === 'conversation') && (
              <VoiceRecorder 
                onTranscript={handleTranscript}
                disabled={loading}
                mode={voiceMode}
              />
            )}
            
            {voiceMode !== 'conversation' && (
              <button 
                onClick={() => handleSend()} 
                disabled={loading || !input.trim()}
                style={{ 
                  padding: isMobile ? '1.2rem 1.5rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  borderRadius: '1rem',
                  backgroundColor: loading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  minWidth: isMobile ? '80px' : '100px',
                  flexShrink: 0
                }}
              >
                {loading ? '⏳' : 'Odeslat'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;