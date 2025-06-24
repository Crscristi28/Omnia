import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// 🎨 NEW OMNIA LOGO - Nový modro-fialový design ze screenshotu
const OmniaLogo = ({ size = 80, animate = false }) => {
  return (
    <div
      className={`omnia-logo ${animate ? 'animate' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 40%, 
            #00ffff 0%,
            #0096ff 30%,
            #6432ff 60%,
            #9932cc 80%,
            #4b0082 100%
          )
        `,
        boxShadow: `
          0 0 ${size * 0.4}px rgba(100, 50, 255, 0.6),
          0 0 ${size * 0.2}px rgba(0, 150, 255, 0.4),
          inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.2)
        `,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          filter: 'blur(8px)'
        }}
      />
      {animate && (
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

const MiniOmniaLogo = ({ size = 28, onClick, isAudioPlaying = false, loading = false }) => {
  const getLogoStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: '50%',
      background: `
        radial-gradient(circle at 30% 40%, 
          #00ffff 0%,
          #0096ff 30%,
          #6432ff 60%,
          #9932cc 80%,
          #4b0082 100%
        )
      `,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    if (loading) {
      return {
        ...baseStyle,
        animation: 'pulse-omnia 1.5s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.6}px rgba(100, 50, 255, 0.8)`
      };
    }
    
    if (isAudioPlaying) {
      return {
        ...baseStyle,
        animation: 'pulse-audio 1s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.8}px rgba(0, 255, 255, 0.9)`
      };
    }
    
    return {
      ...baseStyle,
      boxShadow: `0 0 ${size * 0.4}px rgba(100, 50, 255, 0.5)`
    };
  };

  return (
    <div
      style={getLogoStyle()}
      onClick={onClick}
      title="Klepněte pro Voice Screen"
    />
  );
};

const ChatOmniaLogo = ({ size = 14 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 40%, 
            #00ffff 0%,
            #0096ff 30%,
            #6432ff 60%,
            #9932cc 80%,
            #4b0082 100%
          )
        `,
        boxShadow: `0 0 ${size * 0.5}px rgba(100, 50, 255, 0.6)`,
        display: 'inline-block',
        marginRight: '6px',
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    />
  );
};

const OmniaArrowButton = ({ onClick, disabled, loading, size = 50 }) => {
  const getButtonStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: '50%',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.3,
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
      color: 'white',
      opacity: disabled ? 0.5 : 1
    };

    if (disabled) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #4a5568, #2d3748)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      };
    }

    return {
      ...baseStyle,
      background: `
        radial-gradient(circle at 30% 40%, 
          #00ffff 0%,
          #0096ff 30%,
          #6432ff 60%,
          #9932cc 80%,
          #4b0082 100%
        )
      `,
      boxShadow: '0 4px 12px rgba(100, 50, 255, 0.4)'
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={getButtonStyle()}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-1px) scale(1.05)';
          e.target.style.boxShadow = '0 6px 16px rgba(100, 50, 255, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(100, 50, 255, 0.4)';
        }
      }}
      title="Odeslat zprávu"
    >
      {loading ? '⏳' : '→'}
    </button>
  );
};// ⌨️ TYPEWRITER EFFECT
function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
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
    const validMessages = messages.filter(msg => 
      msg.sender === 'user' || msg.sender === 'bot'
    );

    let claudeMessages = validMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || ''
    }));

    if (claudeMessages.length > 0 && claudeMessages[0].role === 'assistant') {
      claudeMessages = claudeMessages.slice(1);
    }

    const cleanMessages = [];
    for (let i = 0; i < claudeMessages.length; i++) {
      const current = claudeMessages[i];
      const previous = cleanMessages[cleanMessages.length - 1];
      
      if (!previous || previous.role !== current.role) {
        cleanMessages.push(current);
      }
    }

    if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === 'assistant') {
      cleanMessages.pop();
    }

    return cleanMessages;

  } catch (error) {
    console.error('💥 Error preparing Claude messages:', error);
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
    return lastUserMessage.map(msg => ({
      role: 'user',
      content: msg.text || ''
    }));
  }
};

// 🎤 VOICE RECORDER for Voice Screen
const VoiceRecorder = ({ onTranscript, disabled, mode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const touchStartTimeRef = useRef(null);
  const isIOSPWA = window.navigator.standalone;

  const startRecording = async () => {
    try {
      console.log('🎙️ Starting recording...');
      
      const constraints = {
        audio: {
          sampleRate: isIOSPWA ? 44100 : 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: isIOSPWA ? 'audio/mp4' : 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing...');
        setIsProcessing(true);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          streamRef.current = null;
        }
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: isIOSPWA ? 'audio/mp4' : 'audio/webm' 
          });
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
          console.log('✅ Transcribed:', data.text);
          
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
    }
  };

  const forceStopRecording = () => {
    console.log('🚨 Force stopping recording...');
    
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    touchStartTimeRef.current = Date.now();
    if (!disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touchDuration = Date.now() - (touchStartTimeRef.current || 0);
    if (touchDuration < 100) {
      return;
    }
    if (isRecording) {
      forceStopRecording();
    }
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRecording) {
      forceStopRecording();
    }
  };

  const handleMouseDown = (e) => {
    if (!isIOSPWA && !disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleMouseUp = (e) => {
    if (!isIOSPWA && isRecording) {
      forceStopRecording();
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        forceStopRecording();
      }
    };

    const handleBeforeUnload = () => {
      if (isRecording) {
        forceStopRecording();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '50%',
      padding: 0,
      fontSize: '2rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'none'
    };

    if (isProcessing) return { 
      ...baseStyle,
      backgroundColor: '#ffc107',
      color: 'white',
      boxShadow: '0 0 20px rgba(255, 193, 7, 0.5)'
    };
    if (isRecording) return { 
      ...baseStyle,
      backgroundColor: '#dc3545',
      color: 'white',
      transform: 'scale(1.1)',
      boxShadow: '0 0 30px rgba(220, 53, 69, 0.6)'
    };
    return { 
      ...baseStyle,
      backgroundColor: '#007bff',
      color: 'white',
      boxShadow: '0 0 15px rgba(0, 123, 255, 0.4)'
    };
  };

  const getButtonIcon = () => {
    if (isProcessing) return '⏳';
    if (isRecording) return '🔴';
    return '🎤';
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => !isIOSPWA && isRecording && forceStopRecording()}
      disabled={disabled || isProcessing}
      title="Držte pro mluvení"
      style={getButtonStyle()}
    >
      {getButtonIcon()}
    </button>
  );
};

// 🔊 VOICE BUTTON for message playback
const VoiceButton = ({ text, onAudioStart, onAudioEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleNewAudio = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
      }
    };

    window.addEventListener('omnia-audio-start', handleNewAudio);
    return () => window.removeEventListener('omnia-audio-start', handleNewAudio);
  }, [onAudioEnd]);

  const handleSpeak = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      if (onAudioEnd) onAudioEnd();
      return;
    }

    try {
      setIsLoading(true);
      window.dispatchEvent(new CustomEvent('omnia-audio-start'));
      if (onAudioStart) onAudioStart();

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('💥 Voice error:', error);
      if (onAudioEnd) onAudioEnd();
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
        fontSize: '0.9rem',
        opacity: isLoading ? 0.5 : 0.7,
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.opacity = '1'}
      onMouseLeave={(e) => e.target.style.opacity = isLoading ? '0.5' : '0.7'}
    >
      {isLoading ? '⏳' : isPlaying ? '⏸️' : '🔊'}
    </button>
  );
};// 🔎 SONAR SERVICE - Pro Omnia Search model
const sonarService = {
  async search(query, showNotification) {
    try {
      console.log('🔎 Sonar searching web for:', query);
      showNotification('🔎 Vyhledávám aktuální informace na internetu...', 'info');

      const enhancedQuery = this.enhanceQueryForCurrentData(query);
      console.log('🎯 Enhanced query (Sonar):', enhancedQuery);

      const response = await fetch('/api/sonar-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enhancedQuery
        })
      });

      if (!response.ok) {
        throw new Error(`Sonar request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error('Invalid Sonar response');
      }

      showNotification('🔍 Našel jsem aktuální informace!', 'info');
      
      return {
        success: true,
        result: data.result,
        citations: data.citations || [],
        source: 'sonar_search'
      };
    } catch (error) {
      console.error('💥 Sonar search error:', error);
      showNotification(`Chyba při vyhledávání: ${error.message}`, 'error');
      return {
        success: false,
        message: `Chyba při vyhledávání: ${error.message}`,
        source: 'sonar_search'
      };
    }
  },

  enhanceQueryForCurrentData(originalQuery) {
    const query = originalQuery.toLowerCase();
    const currentYear = new Date().getFullYear();
    
    if (query.includes('2024') || query.includes('2025')) {
      return originalQuery;
    }

    const temporalTriggers = [
      'aktuální', 'dnešní', 'současný', 'nejnovější', 'poslední',
      'zprávy', 'novinky', 'aktuality', 'cena', 'kurz', 'počasí',
      'dnes', 'teď', 'momentálně', 'current', 'latest', 'recent'
    ];

    const needsTimeFilter = temporalTriggers.some(trigger => query.includes(trigger));
    
    if (needsTimeFilter) {
      return `${originalQuery} ${currentYear} aktuální`;
    }

    const financialKeywords = ['cena', 'kurz', 'akcie', 'burza', 'bitcoin', 'krypto'];
    if (financialKeywords.some(keyword => query.includes(keyword))) {
      return `${originalQuery} ${currentYear} aktuální cena`;
    }

    const newsKeywords = ['zprávy', 'novinky', 'aktuality', 'události', 'situace'];
    if (newsKeywords.some(keyword => query.includes(keyword))) {
      return `${originalQuery} ${currentYear} nejnovější zprávy`;
    }

    return `${originalQuery} ${currentYear}`;
  }
};

// 🔍 GOOGLE SEARCH SERVICE for GPT-4o
const googleSearchService = {
  async search(query, showNotification) {
    try {
      showNotification('🔍 Vyhledávám aktuální informace na internetu (Google)...', 'info');
      const response = await fetch('/api/google-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!response.ok) {
        throw new Error(`Google search failed: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !data.results) {
        throw new Error('Invalid Google search response');
      }
      return data.results.map(r => `${r.title}\n${r.snippet}\n${r.link}`).join('\n\n');
    } catch (error) {
      console.error('💥 Google search error:', error);
      showNotification(`Chyba při Google vyhledávání: ${error.message}`, 'error');
      return '';
    }
  }
};

// 🤖 API SERVICES - Claude používá claude2
const claudeService = {
  async sendMessage(messages) {
    try {
      console.log('🔧 Claude service: Using /api/claude2');
      const claudeMessages = prepareClaudeMessages(messages);
      
      const systemPrompt = `Jsi Omnia, pokročilý český AI asistent s následujícími schopnostmi:

🔍 WEB_SEARCH - Máš přístup k web_search funkci pro vyhledávání aktuálních informací na internetu
📊 ANALÝZA DAT - Můžeš analyzovat data a poskytovat insights
🎯 EXTENDED THINKING - Používáš pokročilé reasoning s tool use

DŮLEŽITÉ INSTRUKCE:
- Odpovídej VŽDY výhradně v češtině, gramaticky správně a přirozeně
- Piš stručně, jako chytrý a lidsky znějící člověk
- NEPIŠ "Jsem AI" ani se nijak nepředstavuj
- Automaticky používej web_search když potřebuješ aktuální informace
- Když použiješ web_search, VŽDY poskytni konkrétní odpověď na základě nalezených informací
- NIKDY neříkaj "zkontroluj na jiných stránkách" nebo "hledej jinde"
- Buď konkrétní, užitečný a přímo odpověz na uživatelovu otázku`;
      
      const response = await fetch('/api/claude2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: claudeMessages,
          system: systemPrompt,
          max_tokens: 2000
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

      console.log('✅ Claude response received from /api/claude2');
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
      console.log('🔧 OpenAI service: Using /api/openai');
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

// 🎵 ENHANCED AUDIO GENERATION
const generateInstantAudio = async (responseText, setIsAudioPlaying, currentAudioRef, isIOS, showNotification) => {
  try {
    console.log('🚀 Generating INSTANT audio response...');
    
    const response = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: responseText })
    });

    if (!response.ok) {
      throw new Error(`Voice API failed: ${response.status}`);
    }

    setIsAudioPlaying(true);

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    currentAudioRef.current = audio;
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    if (isIOS) {
      audio.load();
    }
    
    let playbackInterrupted = false;
    
    const handleInterrupt = () => {
      playbackInterrupted = true;
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
    };
    
    window.addEventListener('omnia-audio-start', handleInterrupt, { once: true });
    
    audio.onplay = () => {
      if (!playbackInterrupted) {
        console.log('🎵 INSTANT audio started!');
      }
    };
    
    audio.onended = () => {
      console.log('✅ Instant audio finished');
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
      window.removeEventListener('omnia-audio-start', handleInterrupt);
    };
    
    audio.onerror = (e) => {
      console.error('❌ Instant audio error:', e);
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
      window.removeEventListener('omnia-audio-start', handleInterrupt);
    };
    
    try {
      await audio.play();
      console.log('🎯 Audio plays IMMEDIATELY after AI response!');
    } catch (playError) {
      console.error('❌ Auto-play blocked:', playError);
      showNotification('🔊 Klepněte pro přehrání odpovědi', 'info', () => {
        audio.play().catch(console.error);
      });
    }
    
    return audio;
    
  } catch (error) {
    console.error('💥 Instant audio generation failed:', error);
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    showNotification('🔇 Audio se nepodařilo vygenerovat', 'error');
    throw error;
  }
};

// 🔔 NOTIFICATION HELPER
const showNotificationHelper = (message, type = 'info', onClick = null) => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : '#007bff'};
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    cursor: ${onClick ? 'pointer' : 'default'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
  `;
  notification.textContent = message;
  
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
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
};// 🚨 shouldSearchInternet - Claude NIKDY netrigguje search preprocessing
const shouldSearchInternet = (userInput, model) => {
  if (model === 'claude') {
    return false; // Claude Sonnet 4 si web_search řídí sám
  }

  if (model !== 'gpt-4o') {
    return false;
  }

  const input = (userInput || '').toLowerCase();

  const conversationalPhrases = [
    'jak se má', 'co děláš', 'ahoj', 'čau', 'dobrý den', 'dobrý večer',
    'děkuji', 'díky', 'jak se jmenuješ', 'kdo jsi',
    'umíš', 'můžeš mi', 'co umíš', 'jak funguje',
    'co je to', 'vysvětli', 'řekni mi', 'pomoč', 'pomoz',
    'jak na to', 'co si myslíš', 'jaký je tvůj názor', 'co myslíš',
    'doporuč mi', 'jak se cítíš', 'bavíme se', 'povídej',
    'napiš mi', 'vytvoř', 'spočítej', 'překladej'
  ];

  for (const phrase of conversationalPhrases) {
    if (input.includes(phrase)) {
      return false;
    }
  }

  const searchTriggers = [
    'najdi', 'vyhledej', 'hledej', 'aktuální', 'dnešní', 'současný', 'nejnovější',
    'zprávy', 'novinky', 'aktuality', 'počasí', 'kurz', 'cena',
    'co je nového', 'co se děje', 'poslední', 'recent', 'latest',
    'current', 'today', 'now', 'dnes', 'teď', 'momentálně'
  ];

  for (const trigger of searchTriggers) {
    if (input.includes(trigger)) {
      return true;
    }
  }

  if (input.includes('2024') || input.includes('2025') ||
      input.includes('bitcoin') || input.includes('akcie')) {
    return true;
  }

  return false;
};

// ✅ VOICE SCREEN RESPONSE Handler
const handleVoiceScreenResponse = async (
  textInput,
  currentMessages,
  model,
  openaiService,
  claudeService,
  setMessages,
  setLoading,
  setIsAudioPlaying,
  currentAudioRef,
  isIOS,
  showNotification
) => {
  try {
    console.log('🔧 Voice Screen Model:', model);
    let responseText = '';

    if (model === 'sonar') {
      const searchResult = await sonarService.search(textInput, showNotification);
      if (searchResult.success) {
        responseText = searchResult.result;
      } else {
        responseText = `Chyba při vyhledávání: ${searchResult.message}`;
      }
    }
    else if (model === 'claude') {
      console.log('🚀 Calling Claude Sonnet 4 via /api/claude2');
      responseText = await claudeService.sendMessage([
        ...currentMessages,
        { sender: 'user', text: textInput }
      ]);
    }
    else if (model === 'gpt-4o') {
      console.log('🚀 Calling GPT-4o via /api/openai');
      
      let searchContext = '';
      const needsSearch = shouldSearchInternet(textInput, model);
      
      if (needsSearch) {
        const googleResults = await googleSearchService.search(textInput, showNotification);
        if (googleResults) {
          searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (Google):\n${googleResults}\n\nNa základě těchto aktuálních informací z internetu odpověz uživateli.`;
        }
      }

      const openAiMessages = [
        {
          role: 'system',
          content: `Jsi GPT, český AI asistent. DŮLEŽITÉ: Odpovídej VÝHRADNĚ v češtině, každé slovo musí být české. Nikdy nepoužívej anglická slova. Začínej odpovědi přímo česky. Piš stručně a přirozeně jako rodilý mluvčí češtiny. Nepiš "Jsem AI" ani se nijak nepředstavuj.${searchContext}`
        },
        ...currentMessages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: textInput }
      ];

      responseText = await openaiService.sendMessage(openAiMessages);
    }
    else {
      throw new Error(`Neznámý model: ${model}`);
    }

    const finalMessages = [...currentMessages, { sender: 'bot', text: responseText }];
    setMessages(finalMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));

    await generateInstantAudio(
      responseText,
      setIsAudioPlaying,
      currentAudioRef,
      isIOS,
      showNotification
    );

    return responseText;

  } catch (error) {
    console.error('💥 Voice Screen response error:', error);

    const errorText = `Chyba: ${error.message}`;
    const errorMessages = [...currentMessages, { sender: 'bot', text: errorText }];
    setMessages(errorMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(errorMessages));

    throw error;
  }
};

// ✅ TEXT RESPONSE Handler
const handleTextResponse = async (
  textInput,
  currentMessages,
  model,
  openaiService,
  claudeService,
  setMessages,
  showNotification
) => {
  console.log('🔧 Text Response Model:', model);
  let responseText = '';

  if (model === 'sonar') {
    const searchResult = await sonarService.search(textInput, showNotification);
    if (searchResult.success) {
      responseText = searchResult.result;
    } else {
      responseText = `Chyba při vyhledávání: ${searchResult.message}`;
    }
  }
  else if (model === 'claude') {
    console.log('🚀 Calling Claude Sonnet 4 via /api/claude2');
    responseText = await claudeService.sendMessage([
      ...currentMessages,
      { sender: 'user', text: textInput }
    ]);
  }
  else if (model === 'gpt-4o') {
    console.log('🚀 Calling GPT-4o via /api/openai');
    
    let searchContext = '';
    const needsSearch = shouldSearchInternet(textInput, model);
    
    if (needsSearch) {
      const googleResults = await googleSearchService.search(textInput, showNotification);
      if (googleResults) {
        searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (Google):\n${googleResults}\n\nNa základě těchto aktuálních informací z internetu odpověz uživateli.`;
      }
    }

    const openAiMessages = [
      {
        role: 'system',
        content: `Jsi GPT, český AI asistent. DŮLEŽITÉ: Odpovídej VÝHRADNĚ v češtině, každé slovo musí být české. Nikdy nepoužívej anglická slova. Začínej odpovědi přímo česky. Piš stručně a přirozeně jako rodilý mluvčí češtiny. Nepiš "Jsem AI" ani se nijak nepředstavuj.${searchContext}`
      },
      ...currentMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: textInput }
    ];

    responseText = await openaiService.sendMessage(openAiMessages);
  }
  else {
    throw new Error(`Neznámý model: ${model}`);
  }

  const updatedMessages = [...currentMessages, { sender: 'bot', text: responseText }];
  setMessages(updatedMessages);
  localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));

  return responseText;
};

// 🎤 VOICE SCREEN COMPONENT
const VoiceScreen = ({ 
  onClose, 
  onTranscript, 
  loading, 
  isAudioPlaying,
  isMobile,
  stopCurrentAudio,
  model
}) => {

  const handleScreenClick = (e) => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    onClose();
  };

  const handleElementClick = (e) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
  };

  const getModelName = () => {
    switch(model) {
      case 'claude': return 'Omnia';
      case 'sonar': return 'Omnia Search';
      case 'gpt-4o': return 'GPT';
      default: return 'GPT';
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
        background: 'linear-gradient(135deg, #000000, #1a1a2e)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        color: 'white'
      }}
      onClick={handleScreenClick}
    >
      <button
        onClick={handleCloseClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: '2px solid rgba(255,255,255,0.7)',
          color: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
          e.target.style.borderColor = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'none';
          e.target.style.borderColor = 'rgba(255,255,255,0.7)';
        }}
      >
        ×
      </button>

      <div 
        style={{ marginBottom: '3rem', cursor: 'pointer' }}
        onClick={handleElementClick}
      >
        <OmniaLogo size={140} animate={true} />
      </div>

      <div style={{
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        fontWeight: '600',
        marginBottom: '2rem',
        textAlign: 'center',
        opacity: 0.9,
        cursor: 'pointer'
      }}
      onClick={handleElementClick}
      >
        {loading ? (
          `🚀 ${getModelName()} připravuje odpověď...`
        ) : isAudioPlaying ? (
          `🔊 ${getModelName()} mluví... (klepněte pro stop)`
        ) : (
          `🎤 Držte mikrofon pro mluvení s ${getModelName()}`
        )}
      </div>

      <div 
        style={{ marginBottom: '3rem' }}
        onClick={handleElementClick}
      >
        <VoiceRecorder 
          onTranscript={onTranscript}
          disabled={loading}
          mode="conversation"
        />
      </div>

      <div style={{
        fontSize: '0.9rem',
        opacity: 0.6,
        textAlign: 'center',
        maxWidth: '360px',
        lineHeight: '1.4',
        cursor: 'pointer'
      }}
      onClick={handleElementClick}
      >
        {isMobile ? 
          `${getModelName()} • Klepněte kdekoli pro stop/návrat` : 
          `${getModelName()} • ESC nebo klepněte kdekoli pro stop/návrat`
        }
      </div>
    </div>
  );
};

// ⚙️ SETTINGS DROPDOWN
const SettingsDropdown = ({ isOpen, onClose, onNewChat, model }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '4px',
        background: '#2d3748',
        border: '1px solid #4a5568',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem 1rem',
            border: 'none',
            background: '#2d3748',
            textAlign: 'left',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: '400',
            borderRadius: '8px 8px 0 0',
            color: '#e2e8f0'
          }}
          onMouseEnter={(e) => e.target.style.background = '#4a5568'}
          onMouseLeave={(e) => e.target.style.background = '#2d3748'}
        >
          🗑️ Nový chat
        </button>
        
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          color: '#a0aec0',
          borderTop: '1px solid #4a5568'
        }}>
          📊 Další funkce brzy...
        </div>
      </div>
    </>
  );
};// 🚀 MAIN APP COMPONENT
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const showNotification = showNotificationHelper;

  const stopCurrentAudio = () => {
    console.log('🔇 Stopping current audio...');
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsAudioPlaying(false);
    window.dispatchEvent(new CustomEvent('omnia-audio-start'));
  };

  const handleNewChat = () => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    localStorage.removeItem('omnia-memory');
    setMessages([]);
    
    const modelName = model === 'claude' ? 'Omnia' : 
                     model === 'sonar' ? 'Omnia Search' : 'GPT';
    showNotification(`Nový chat s ${modelName} vytvořen`, 'info');
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showVoiceScreen) {
          if (isAudioPlaying) {
            stopCurrentAudio();
          }
          setShowVoiceScreen(false);
        } else if (isAudioPlaying) {
          stopCurrentAudio();
          showNotification('🔇 Audio zastaveno', 'info');
        }
        if (showModelDropdown) {
          setShowModelDropdown(false);
        }
        if (showSettingsDropdown) {
          setShowSettingsDropdown(false);
        }
      }
      
      if (e.key === ' ' && isAudioPlaying && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        stopCurrentAudio();
        showNotification('🔇 Audio zastaveno', 'info');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAudioPlaying, showVoiceScreen, showModelDropdown, showSettingsDropdown]);

  useEffect(() => {
    const navType = window.performance?.navigation?.type;
    if (navType === 1) {
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

    if (isAudioPlaying) {
      stopCurrentAudio();
    }

    const newMessages = [...messages, { sender: 'user', text: textInput }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (showVoiceScreen) {
        await handleVoiceScreenResponse(
          textInput,
          newMessages,
          model,
          openaiService,
          claudeService,
          setMessages,
          setLoading,
          setIsAudioPlaying,
          currentAudioRef,
          isIOS,
          showNotification
        );
      } else {
        await handleTextResponse(
          textInput,
          newMessages,
          model,
          openaiService,
          claudeService,
          setMessages,
          showNotification
        );
      }

    } catch (err) {
      console.error('💥 Chyba při volání API:', err);
      const responseText = `Chyba: ${err.message}`;
      const updatedMessages = [...newMessages, { sender: 'bot', text: responseText }];
      setMessages(updatedMessages);
      localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
    } finally {
      setLoading(false);
    }
  };

  const handleTranscript = (text) => {
    if (showVoiceScreen) {
      handleSend(text);
    } else {
      setInput(text);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const getModelDisplayName = () => {
    switch(model) {
      case 'claude': return 'Omnia';
      case 'sonar': return 'Omnia Search';
      case 'gpt-4o': return 'GPT';
      default: return 'GPT';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#000000',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      width: '100vw',
      margin: 0,
      padding: 0
    }}>
      
      <header style={{ 
        padding: isMobile ? '1rem 1rem 0.5rem' : '1.5rem 2rem 1rem',
        background: '#000000',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        width: '100%'
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          width: '100%'
        }}>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              style={{
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              Model ▼
            </button>
            
            {showModelDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                minWidth: '200px'
              }}>
                <button
                  onClick={() => {
                    setModel('gpt-4o');
                    setShowModelDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: model === 'gpt-4o' ? '#4a5568' : '#2d3748',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: model === 'gpt-4o' ? '600' : '400',
                    color: '#e2e8f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4a5568'}
                  onMouseLeave={(e) => e.target.style.background = model === 'gpt-4o' ? '#4a5568' : '#2d3748'}
                >
                  GPT
                </button>
                <button
                  onClick={() => {
                    setModel('claude');
                    setShowModelDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: model === 'claude' ? '#4a5568' : '#2d3748',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: model === 'claude' ? '600' : '400',
                    color: '#e2e8f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4a5568'}
                  onMouseLeave={(e) => e.target.style.background = model === 'claude' ? '#4a5568' : '#2d3748'}
                >
                  Omnia
                </button>
                <button
                  onClick={() => {
                    setModel('sonar');
                    setShowModelDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: model === 'sonar' ? '#4a5568' : '#2d3748',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: model === 'sonar' ? '600' : '400',
                    borderRadius: '0 0 8px 8px',
                    color: '#e2e8f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4a5568'}
                  onMouseLeave={(e) => e.target.style.background = model === 'sonar' ? '#4a5568' : '#2d3748'}
                >
                  Omnia Search
                </button>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              style={{
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '1rem',
                color: '#e2e8f0',
                cursor: 'pointer'
              }}
              title="Nastavení a funkce"
            >
              ⚙️
            </button>
            
            <SettingsDropdown 
              isOpen={showSettingsDropdown}
              onClose={() => setShowSettingsDropdown(false)}
              onNewChat={handleNewChat}
              model={model}
            />
          </div>
        </div>

        <div style={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          <OmniaLogo 
            size={isMobile ? 60 : 80} 
            animate={false}
          />
          <h1 style={{ 
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            margin: 0,
            color: '#ffffff',
            letterSpacing: '0.02em'
          }}>
            OMNIA
          </h1>
        </div>
      </header><main style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '1rem' : '2rem',
        paddingBottom: '140px',
        background: '#000000',
        width: '100%'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          minHeight: messages.length === 0 ? '60vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: messages.length === 0 ? 'center' : 'flex-start',
          width: '100%'
        }}>
          
          {messages.length === 0 && (
            <div style={{ height: '40vh' }}></div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1.5rem'
              }}
            >
              <div
                style={{
                  backgroundColor: msg.sender === 'user' ? '#2d3748' : `
                    radial-gradient(circle at 30% 40%, 
                      rgba(0, 255, 255, 0.1) 0%,
                      rgba(0, 150, 255, 0.1) 30%,
                      rgba(100, 50, 255, 0.1) 60%,
                      rgba(153, 50, 204, 0.1) 80%,
                      rgba(75, 0, 130, 0.1) 100%
                    )
                  `,
                  color: msg.sender === 'user' ? '#ffd700' : '#ffffff',
                  padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  maxWidth: isMobile ? '85%' : '75%',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.sender === 'user' 
                    ? '0 2px 8px rgba(255, 215, 0, 0.2)' 
                    : '0 2px 8px rgba(100, 50, 255, 0.3)',
                  border: msg.sender === 'user' 
                    ? '1px solid rgba(255, 215, 0, 0.3)' 
                    : '1px solid rgba(100, 50, 255, 0.3)',
                  position: 'relative'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{ 
                    fontSize: '0.75rem',
                    opacity: 0.7, 
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontWeight: '600', color: '#a0aec0', display: 'flex', alignItems: 'center' }}>
                      <ChatOmniaLogo size={16} />
                      {getModelDisplayName()}
                    </span>
                    <VoiceButton 
                      text={msg.text} 
                      onAudioStart={() => setIsAudioPlaying(true)}
                      onAudioEnd={() => setIsAudioPlaying(false)}
                    />
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
              marginBottom: '1.5rem'
            }}>
              <div style={{
                backgroundColor: `
                  radial-gradient(circle at 30% 40%, 
                    rgba(0, 255, 255, 0.1) 0%,
                    rgba(0, 150, 255, 0.1) 30%,
                    rgba(100, 50, 255, 0.1) 60%,
                    rgba(153, 50, 204, 0.1) 80%,
                    rgba(75, 0, 130, 0.1) 100%
                  )
                `,
                padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                borderRadius: '20px 20px 20px 4px',
                fontSize: isMobile ? '1rem' : '0.95rem',
                boxShadow: '0 2px 8px rgba(100, 50, 255, 0.3)',
                border: '1px solid rgba(100, 50, 255, 0.3)',
                color: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid #00ffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ color: '#a0aec0', fontWeight: '500' }}>
                    {getModelDisplayName()} přemýšlí...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.95)', 
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '1rem' : '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1.5rem',
        width: '100%'
      }}>
        <div style={{ 
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex', 
          gap: '0.75rem',
          alignItems: 'center',
          width: '100%'
        }}>
          
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder={`Napište zprávu pro ${getModelDisplayName()}...`}
              disabled={loading}
              style={{ 
                width: '100%',
                padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                fontSize: isMobile ? '16px' : '0.95rem',
                borderRadius: '25px',
                border: '2px solid #4a5568',
                outline: 'none',
                backgroundColor: loading ? '#2d3748' : '#1a202c',
                color: '#ffffff',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00ffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4a5568';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              }}
            />
          </div>
          
          <MiniOmniaLogo 
            size={isMobile ? 50 : 56} 
            onClick={() => setShowVoiceScreen(true)}
            isAudioPlaying={isAudioPlaying}
            loading={loading}
          />

          <OmniaArrowButton
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            loading={loading}
            size={isMobile ? 50 : 56}
          />
        </div>
      </div>

      {showVoiceScreen && (
        <VoiceScreen
          onClose={() => setShowVoiceScreen(false)}
          onTranscript={handleTranscript}
          loading={loading}
          isAudioPlaying={isAudioPlaying}
          isMobile={isMobile}
          stopCurrentAudio={stopCurrentAudio}
          model={model}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse-omnia {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(100, 50, 255, 0.8);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.9);
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse-audio {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.9);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 25px rgba(0, 255, 255, 1);
            transform: scale(1.05);
          }
        }
        
        .omnia-logo.animate {
          animation: omnia-breathe 4s ease-in-out infinite;
        }
        
        @keyframes omnia-breathe {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.02);
            filter: brightness(1.1);
          }
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
          background: #000000;
        }

        @media (max-width: 768px) {
          input {
            font-size: 16px !important;
          }
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a202c;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }

        button {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        * {
          -webkit-tap-highlight-color: transparent;
          box-sizing: border-box;
        }

        #root {
          width: 100vw;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #000000;
        }

        input:focus {
          outline: none !important;
        }

        button, input, div[role="button"] {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>

      {(showModelDropdown || showSettingsDropdown) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setShowModelDropdown(false);
            setShowSettingsDropdown(false);
          }}
        />
      )}
    </div>
  );
}

export default App;