import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// 🎨 CLEAN OMNIA LOGO - Keep Original Design
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
      {animate && (
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

// 🎤 MINI OMNIA LOGO for Input Bar - Audio State Indicator
const MiniOmniaLogo = ({ size = 32, onClick, isAudioPlaying = false, loading = false }) => {
  const getLogoStyle = () => {
    const baseStyle = {
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
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: '2px solid transparent'
    };

    if (loading) {
      return {
        ...baseStyle,
        animation: 'pulse-blue 1.5s ease-in-out infinite',
        boxShadow: '0 0 15px rgba(0, 150, 255, 0.6)'
      };
    }
    
    if (isAudioPlaying) {
      return {
        ...baseStyle,
        animation: 'pulse-green 1s ease-in-out infinite',
        boxShadow: '0 0 15px rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 0.5)'
      };
    }
    
    return {
      ...baseStyle,
      boxShadow: '0 2px 8px rgba(0, 150, 255, 0.3)'
    };
  };

  return (
    <div
      style={getLogoStyle()}
      onClick={onClick}
      title="Klepněte pro Voice Screen"
    >
      <span style={{ fontSize: size * 0.4, color: 'white' }}>
        {loading ? '⚡' : isAudioPlaying ? '🔊' : '🎤'}
      </span>
    </div>
  );
};

// 🎤 CHAT OMNIA LOGO - Malé logo pro chat bubliny místo 🤖
const ChatOmniaLogo = ({ size = 16 }) => {
  return (
    <div
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
        boxShadow: `0 0 ${size * 0.5}px rgba(0, 150, 255, 0.4)`,
        display: 'inline-block',
        marginRight: '6px',
        flexShrink: 0
      }}
    />
  );
};

// ✅ OMNIA ARROW BUTTON - Samostatné tlačítko s Omnia barvami
const OmniaArrowButton = ({ onClick, disabled, loading, size = 56 }) => {
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
        background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      };
    }

    return {
      ...baseStyle,
      background: `
        radial-gradient(circle at 30% 30%, 
          rgba(0, 255, 255, 0.9) 0%,
          rgba(0, 150, 255, 1) 25%,
          rgba(100, 50, 255, 1) 50%,
          rgba(200, 50, 200, 0.9) 75%,
          rgba(100, 50, 255, 0.7) 100%
        )
      `,
      boxShadow: '0 4px 12px rgba(0, 150, 255, 0.3)'
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
          e.target.style.boxShadow = '0 6px 16px rgba(0, 150, 255, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0, 150, 255, 0.3)';
        }
      }}
      title="Odeslat zprávu"
    >
      {loading ? '⏳' : '→'}
    </button>
  );
};

// ⌨️ TYPEWRITER EFFECT
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
};// 🎤 VOICE RECORDER for Voice Screen
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

  // Touch handlers
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

  // Cleanup effects
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

  // Button styling
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
};

// 🔍 ENHANCED PERPLEXITY WEB SEARCH SERVICE
const perplexitySearchService = {
  async search(query, showNotification) {
    try {
      console.log('🔍 Perplexity searching web for:', query);
      showNotification('🔍 Vyhledávám aktuální informace na internetu...', 'info');

      const enhancedQuery = this.enhanceQueryForCurrentData(query);
      console.log('🎯 Enhanced query:', enhancedQuery);

      const response = await fetch('/api/perplexity-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: enhancedQuery,
          recency_filter: 'month',
          search_type: 'web',
          focus: 'recent',
          date_range: '2024-2025'
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error('Invalid Perplexity response');
      }

      const validatedResult = this.validateResultFreshness(data.result, query);
      showNotification('🔍 Našel jsem aktuální informace!', 'info');

      return {
        success: true,
        result: validatedResult,
        citations: data.citations || [],
        source: 'perplexity_search',
        enhanced_query: enhancedQuery
      };

    } catch (error) {
      console.error('💥 Perplexity search error:', error);
      showNotification(`Chyba při vyhledávání: ${error.message}`, 'error');
      return {
        success: false,
        message: `Chyba při vyhledávání: ${error.message}`,
        source: 'perplexity_search'
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
  },

  validateResultFreshness(result, originalQuery) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const hasOldData = result.includes('2023') || result.includes('2022') || result.includes('2021');
    const hasCurrentData = result.includes(currentYear.toString()) || result.includes(lastYear.toString());
    
    if (hasOldData && !hasCurrentData) {
      return `⚠️ UPOZORNĚNÍ: Našel jsem informace, ale některé mohou být starší. Aktuální data pro "${originalQuery}":\n\n${result}\n\n💡 TIP: Zkuste vyhledat přímo na specializovaných stránkách pro nejnovější informace.`;
    }
    
    return result;
  }
};

// 🔎 SONAR SERVICE - OPRAVENÝ PRO PŘÍMÉ ODPOVĚDI
const sonarService = {
  async search(query, showNotification) {
    try {
      console.log('🔎 Sonar searching web for:', query);
      showNotification('🔎 Vyhledávám aktuální informace na internetu... (Omnia Search)', 'info');

      const enhancedQuery = perplexitySearchService.enhanceQueryForCurrentData(query);
      console.log('🎯 Enhanced query (Sonar):', enhancedQuery);

      const response = await fetch('/api/sonar-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enhancedQuery,
          recency_filter: 'month',
          search_type: 'web',
          focus: 'recent',
          date_range: '2024-2025'
        })
      });

      if (!response.ok) {
        throw new Error(`Sonar request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error('Invalid Sonar response');
      }

      // ✅ SONAR VRACÍ PŘÍMO FINÁLNÍ ODPOVĚĎ, NE JEN KONTEXT
      const validatedResult = perplexitySearchService.validateResultFreshness(data.result, query);
      showNotification('🔍 Našel jsem aktuální informace! (Omnia Search)', 'info');
      
      return {
        success: true,
        result: validatedResult,
        citations: data.citations || [],
        source: 'sonar_search',
        enhanced_query: enhancedQuery,
        is_final_response: true // ✅ OZNAČENÍ ŽE TOTO JE FINÁLNÍ ODPOVĚĎ
      };
    } catch (error) {
      console.error('💥 Sonar search error:', error);
      showNotification(`Chyba při vyhledávání (Omnia Search): ${error.message}`, 'error');
      return {
        success: false,
        message: `Chyba při vyhledávání: ${error.message}`,
        source: 'sonar_search'
      };
    }
  }
};const shouldSearchInternet = (userInput, model) => {
  // Povolit web search pro Claude, GPT-4o i Sonar
  if (model !== 'claude' && model !== 'gpt-4o' && model !== 'sonar') {
    return false;
  }

  const input = (userInput || '').toLowerCase();

  // NIKDY nehledej pro základní konverzační fráze
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

  // Search triggery
  const searchTriggers = [
    'najdi', 'vyhledej', 'hledej', 'aktuální', 'dnešní', 'současný', 'nejnovější',
    'zprávy', 'novinky', 'aktuality', 'počasí', 'kurz', 'cena',
    'co je nového', 'co se děje', 'poslední', 'recent', 'latest',
    'current', 'today', 'now', 'dnes', 'teď', 'momentálně',
    'aktuální informace', 'aktuální stav', 'nové informace'
  ];

  for (const trigger of searchTriggers) {
    if (input.includes(trigger)) {
      return true;
    }
  }

  // Temporal keywords
  if (input.includes('2024') || input.includes('2025') ||
      input.includes('dnes') || input.includes('včera') ||
      input.includes('tento týden') || input.includes('tento měsíc') ||
      input.includes('letos') || input.includes('loni') ||
      input.includes('teď') || input.includes('právě') ||
      input.includes('momentálně') || input.includes('v současnosti')) {
    return true;
  }

  // Financial keywords
  if (input.includes('cena') || input.includes('kurz') ||
      input.includes('akcie') || input.includes('burza') ||
      input.includes('bitcoin') || input.includes('krypto')) {
    return true;
  }

  // Weather keywords
  if (input.includes('počasí') || input.includes('teplota') ||
      input.includes('déšť') || input.includes('sníh')) {
    return true;
  }

  return false;
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

// ✅ OPRAVENÁ FUNKCE PRO VOICE SCREEN - S PODPOROU SONAR
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
    let responseText = '';
    let searchContext = '';

    const needsSearch = shouldSearchInternet(textInput, model);

    // ✅ SONAR - PŘÍMO VRÁTÍ FINÁLNÍ ODPOVĚĎ
    if (model === 'sonar') {
      if (needsSearch) {
        const searchResult = await sonarService.search(textInput, showNotification);
        if (searchResult.success) {
          responseText = searchResult.result; // ✅ PŘÍMO FINÁLNÍ ODPOVĚĎ
        } else {
          responseText = `Chyba při vyhledávání: ${searchResult.message}`;
        }
      } else {
        // Pro konverzační dotazy bez vyhledávání použij základní odpověď
        responseText = "Omnia Search je specializovaná na vyhledávání aktuálních informací na internetu. Pro běžnou konverzaci zkuste Omnia v1 nebo v2.";
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
    }

    // ✅ CLAUDE A GPT-4O - STANDARDNÍ LOGIKA
    if (needsSearch) {
      if (model === 'claude') {
        const searchResult = await perplexitySearchService.search(textInput, showNotification);
        if (searchResult.success) {
          searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (Perplexity):\n${searchResult.result}\n\nNa základě těchto aktuálních informací z internetu odpověz uživateli. Informace jsou aktuální a ověřené.`;
        } else {
          searchContext = `\n\nPokus o vyhledání aktuálních informací se nezdařil: ${searchResult.message}`;
        }
      } else if (model === 'gpt-4o') {
        const googleResults = await googleSearchService.search(textInput, showNotification);
        if (googleResults) {
          searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (Google):\n${googleResults}\n\nNa základě těchto aktuálních informací z internetu odpověz uživateli.`;
        }
      }
    }

    if (model === 'gpt-4o') {
      const openAiMessages = [
        {
          role: 'system',
          content: `Jsi Omnia v1, český AI asistent. DŮLEŽITÉ: Odpovídej VÝHRADNĚ v češtině, každé slovo musí být české. Nikdy nepoužívej anglická slova. Začínej odpovědi přímo česky. Piš stručně a přirozeně jako rodilý mluvčí češtiny. Nepiš "Jsem AI" ani se nijak nepředstavuj.${searchContext}`
        },
        ...currentMessages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: textInput }
      ];

      responseText = await openaiService.sendMessage(openAiMessages);
    } else if (model === 'claude') {
      const userMessageWithContext = searchContext ?
        `${textInput}${searchContext}` : textInput;

      responseText = await claudeService.sendMessage([
        ...currentMessages,
        { sender: 'user', text: userMessageWithContext }
      ]);
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

// ✅ OPRAVENÁ FUNKCE PRO TEXT RESPONSE - S PODPOROU SONAR
const handleTextResponse = async (
  textInput,
  currentMessages,
  model,
  openaiService,
  claudeService,
  setMessages,
  showNotification
) => {
  let responseText = '';
  let searchContext = '';

  const needsSearch = shouldSearchInternet(textInput, model);

  // ✅ SONAR - PŘÍMO VRÁTÍ FINÁLNÍ ODPOVĚĎ
  if (model === 'sonar') {
    if (needsSearch) {
      const searchResult = await sonarService.search(textInput, showNotification);
      if (searchResult.success) {
        responseText = searchResult.result; // ✅ PŘÍMO FINÁLNÍ ODPOVĚĎ
      } else {
        responseText = `Chyba při vyhledávání: ${searchResult.message}`;
      }
    } else {
      // Pro konverzační dotazy bez vyhledávání
      responseText = "Omnia Search je specializovaná na vyhledávání aktuálních informací na internetu. Pro běžnou konverzaci zkuste Omnia v1 nebo v2.";
    }

    const updatedMessages = [...currentMessages, { sender: 'bot', text: responseText }];
    setMessages(updatedMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));

    return responseText;
  }

  // ✅ CLAUDE A GPT-4O - STANDARDNÍ LOGIKA
  if (needsSearch) {
    if (model === 'claude') {
      const searchResult = await perplexitySearchService.search(textInput, showNotification);
      if (searchResult.success) {
        searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (Perplexity):\n${searchResult.result}\n\nNa základě těchto aktuálních informací z internetu odpověz uživateli. Informace jsou aktuální a ověřené.`;
      } else {
        searchContext = `\n\nPokus o vyhledání aktuálních informací se nezdařil: ${searchResult.message}`;
      }
    } else if (model === 'gpt-4o') {
      const googleResults = await googleSearchService.search(textInput, showNotification);
      if (googleResults) {
        searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (Google):\n${googleResults}\n\nNa základě těchto aktuálních informací z internetu odpověz uživateli.`;
      }
    }
  }

  if (model === 'gpt-4o') {
    const openAiMessages = [
      {
        role: 'system',
        content: `Jsi Omnia v1, český AI asistent. DŮLEŽITÉ: Odpovídej VÝHRADNĚ v češtině, každé slovo musí být české. Nikdy nepoužívej anglická slova. Začínej odpovědi přímo česky. Piš stručně a přirozeně jako rodilý mluvčí češtiny. Nepiš "Jsem AI" ani se nijak nepředstavuj.${searchContext}`
      },
      ...currentMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: textInput }
    ];

    responseText = await openaiService.sendMessage(openAiMessages);
  } else if (model === 'claude') {
    const userMessageWithContext = searchContext ?
      `${textInput}${searchContext}` : textInput;

    responseText = await claudeService.sendMessage([
      ...currentMessages,
      { sender: 'user', text: userMessageWithContext }
    ]);
  }

  const updatedMessages = [...currentMessages, { sender: 'bot', text: responseText }];
  setMessages(updatedMessages);
  localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));

  return responseText;
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
};

// 🤖 ENHANCED API SERVICES
const claudeService = {
  async sendMessage(messages) {
    try {
      const claudeMessages = prepareClaudeMessages(messages);
      const systemPrompt = 'Jsi Omnia v2, pokročilý AI asistent s přístupem k internetu přes Perplexity. Máš tyto schopnosti:\n\n🔍 WEB SEARCH - můžeš vyhledávat aktuální informace na internetu\n📊 ANALÝZA DAT - můžeš analyzovat data a poskytovat insights\n\nOdpovídej vždy výhradně v češtině, gramaticky správně a přirozeně. Piš stručně, jako chytrý a lidsky znějící člověk. Nepiš "Jsem AI" ani se nijak nepředstavuj. Když dostaneš aktuální informace z internetu, zpracuj je a odpověz na základě nich.';
      
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
};// 🎤 VOICE SCREEN COMPONENT - Enhanced
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
      case 'claude': return 'Omnia v2';
      case 'sonar': return 'Omnia Search';
      case 'gpt-4o': return 'Omnia v1';
      default: return 'Omnia v1';
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

  const getModelName = () => {
    switch(model) {
      case 'claude': return 'Omnia v2';
      case 'sonar': return 'Omnia Search';
      case 'gpt-4o': return 'Omnia v1';
      default: return 'Omnia v1';
    }
  };

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
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '220px'
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
            background: 'white',
            textAlign: 'left',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: '400',
            borderRadius: '8px 8px 0 0',
            color: '#374151'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.target.style.background = 'white'}
        >
          🗑️ Nový chat
        </button>
        
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          color: '#9ca3af',
          borderTop: '1px solid #f3f4f6'
        }}>
          {model === 'claude' ? '🔍 Web search aktivní' : 
           model === 'sonar' ? '🔎 Sonar search aktivní' :
           '⚡ Rychlý chat režim'}
        </div>
        
        <div style={{
          padding: '0.25rem 1rem 0.75rem',
          fontSize: '0.75rem',
          color: '#9ca3af'
        }}>
          📊 Další funkce brzy...
        </div>
      </div>
    </>
  );
};

// 🚀 MAIN APP COMPONENT
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
    
    const modelName = model === 'claude' ? 'Omnia v2' : 
                     model === 'sonar' ? 'Omnia Search' : 'Omnia v1';
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

  // ✅ HLAVNÍ SEND HANDLER S OPRAVOU PRO SONAR
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
      case 'claude': return 'Omnia v2';
      case 'sonar': return 'Omnia Search';
      case 'gpt-4o': return 'Omnia v1';
      default: return 'Omnia v1';
    }
  };

  const getModelDescription = () => {
    switch(model) {
      case 'claude': return '🔍 • Claude s web search';
      case 'sonar': return '🔎 • Sonar web search';
      case 'gpt-4o': return '⚡ • OpenAI rychlý chat';
      default: return '⚡ • OpenAI rychlý chat';
    }
  };return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f5f5f5',
      color: '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      width: '100vw',
      margin: 0,
      padding: 0
    }}>
      
      <header style={{ 
        padding: isMobile ? '1rem 1rem 0.5rem' : '1.5rem 2rem 1rem',
        background: '#f5f5f5',
        position: 'relative',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
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
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                color: '#374151',
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
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '240px'
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
                    background: model === 'gpt-4o' ? '#f3f4f6' : 'white',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: model === 'gpt-4o' ? '600' : '400'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.background = model === 'gpt-4o' ? '#f3f4f6' : 'white'}
                >
                  ⚡ Omnia v1
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
                    background: model === 'claude' ? '#f3f4f6' : 'white',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: model === 'claude' ? '600' : '400'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.background = model === 'claude' ? '#f3f4f6' : 'white'}
                >
                  🔍 Omnia v2
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
                    background: model === 'sonar' ? '#f3f4f6' : 'white',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: model === 'sonar' ? '600' : '400',
                    borderRadius: '0 0 8px 8px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.background = model === 'sonar' ? '#f3f4f6' : 'white'}
                >
                  🔎 Omnia Search
                </button>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '1rem',
                color: '#6b7280',
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
            size={isMobile ? 80 : 100} 
            animate={false}
          />
          <h1 style={{ 
            fontSize: isMobile ? '2.5rem' : '3rem',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #007bff 0%, #28a745 50%, #ffc107 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.02em'
          }}>
            OMNIA
          </h1>
          
          <div style={{
            fontSize: isMobile ? '0.85rem' : '0.9rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {getModelDisplayName()} {getModelDescription()}
          </div>
        </div>
      </header>

      <main style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '1rem' : '2rem',
        paddingBottom: '140px',
        background: '#f5f5f5',
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
                  backgroundColor: '#ffffff',
                  color: '#000',
                  padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  maxWidth: isMobile ? '85%' : '75%',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: msg.sender === 'user' 
                    ? '2px solid #e3f2fd' 
                    : '1px solid #f0f0f0',
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
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
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
                backgroundColor: '#ffffff',
                padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                borderRadius: '20px 20px 20px 4px',
                fontSize: isMobile ? '1rem' : '0.95rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #e5e7eb', 
                    borderTop: '2px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>
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
        background: 'rgba(245, 245, 245, 0.95)', 
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '1rem' : '1.5rem',
        borderTop: '1px solid rgba(0,0,0,0.05)',
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
                border: '2px solid #e5e7eb',
                outline: 'none',
                backgroundColor: loading ? '#f9fafb' : '#ffffff',
                color: '#000000',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
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
        
        <div style={{
          maxWidth: '1000px',
          margin: '0.5rem auto 0',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center',
          opacity: 0.8
        }}>
          {model === 'claude'
            ? '🔍 Web search aktivní • 📊 Analýza dat připravena'
            : model === 'sonar'
            ? '🔎 Sonar web search aktivní'
            : '⚡ Rychlý chat režim • Pro web search přepněte na v2/Search'
          }
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
        
        @keyframes pulse-blue {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(0, 150, 255, 0.6);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 25px rgba(0, 150, 255, 0.8);
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse-green {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(40, 167, 69, 0.8);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 25px rgba(40, 167, 69, 1);
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
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
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