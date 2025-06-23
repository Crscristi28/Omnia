import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// 🎨 LOGO - KEEP ORIGINAL with minor enhancements
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
};// 🎤 VOICE RECORDER - Enhanced with better push-to-talk
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
      console.log('🎙️ Starting recording... iOS PWA:', isIOSPWA);
      
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

      const audioTracks = stream.getAudioTracks();
      console.log('🎵 Audio tracks:', audioTracks.length, audioTracks[0]?.readyState);

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
            console.log('🔇 Track stopped (iOS PWA):', track.kind, track.readyState);
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
    console.log('🚨 Force stopping recording (iOS PWA)...');
    
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
          console.log('🔇 Force stopped track:', track.kind);
        }
      });
      streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  // Touch handlers same as before...
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    touchStartTimeRef.current = Date.now();
    if (!disabled && !isProcessing && !isRecording) {
      console.log('👆 Touch start - iOS PWA');
      startRecording();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touchDuration = Date.now() - (touchStartTimeRef.current || 0);
    console.log('👆 Touch end - duration:', touchDuration, 'ms');
    if (touchDuration < 100) {
      console.log('⚠️ Touch too short, ignoring');
      return;
    }
    if (isRecording) {
      forceStopRecording();
    }
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('❌ Touch cancelled (iOS PWA)');
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

  // Cleanup effects same as before...
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        console.log('🚨 Page hidden - force stop (iOS PWA)');
        forceStopRecording();
      }
    };

    const handleBeforeUnload = () => {
      if (isRecording) {
        forceStopRecording();
      }
    };

    const handlePageShow = () => {
      if (isRecording) {
        console.log('🔄 Page shown - check recording state');
        forceStopRecording();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      console.log('🧹 Component unmount - iOS PWA cleanup');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 🎨 RAINBOW ACCENT STYLING
  const getButtonStyle = () => {
    if (isProcessing) return { 
      backgroundColor: '#ffc107', // Žlutá
      color: 'white',
      boxShadow: '0 0 25px rgba(255, 193, 7, 0.6)'
    };
    if (isRecording) return { 
      backgroundColor: '#dc3545', // Červená
      color: 'white', 
      transform: 'scale(1.05)',
      boxShadow: '0 0 25px rgba(220, 53, 69, 0.6)'
    };
    return { 
      backgroundColor: '#007bff', // Modrá pro voice
      color: 'white'
    };
  };

  const getButtonText = () => {
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
      style={{
        ...getButtonStyle(),
        border: 'none',
        borderRadius: '1rem',
        padding: '1.2rem',
        fontSize: '1.2rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '70px',
        minHeight: '70px',
        transition: 'all 0.2s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none'
      }}
    >
      {getButtonText()}
    </button>
  );
};

// 🎤 VOICE BUTTON - Keep same but add rainbow accent
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
      console.log('🎤 Manual voice button clicked');

      window.dispatchEvent(new CustomEvent('omnia-audio-start'));
      if (onAudioStart) onAudioStart();

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
        console.error('Audio playback error');
      };

      await audio.play();
      console.log('🔊 Manual audio playback started');

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
        background: isPlaying ? '#28a745' : (isLoading ? '#ffc107' : '#6c757d'), // Zelená for playing
        border: 'none',
        cursor: isLoading ? 'wait' : 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        color: 'white',
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

// Helper functions remain the same as your original...
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

    console.log('📝 Prepared Claude messages:', cleanMessages);
    return cleanMessages;

  } catch (error) {
    console.error('💥 Error preparing Claude messages:', error);
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
    return lastUserMessage.map(msg => ({
      role: 'user',
      content: msg.text || ''
    }));
  }
};// 🎵 OKAMŽITÉ AUDIO GENEROVÁNÍ
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
        console.log('🎵 INSTANT audio started - user hears response NOW!');
        showNotification('🔊 Přehrávám odpověď okamžitě!', 'info');
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

// 📝 POSTUPNÉ ZOBRAZENÍ TEXTU
const displayResponseText = async (responseText, currentMessages, setMessages, showTempMessage = true) => {
  if (showTempMessage) {
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  console.log('📝 Displaying response text while audio plays...');
  
  const finalMessages = [...currentMessages, { 
    sender: 'bot', 
    text: responseText 
  }];
  
  setMessages(finalMessages);
  localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));
  
  return true;
};

// 🔍 INTERNET SEARCH FUNKCE - OPRAVENÁ
const searchInternet = async (query, showNotification) => {
  try {
    console.log('🔍 Searching internet for:', query);
    showNotification('🔍 Vyhledávám na internetu...', 'info');

    const response = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Search API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Search results:', data);

    if (!data.success || !data.results || data.results.length === 0) {
      showNotification('⚠️ Nenašel jsem žádné relevantní výsledky.', 'info');
      return {
        success: false,
        message: 'Nenašel jsem žádné relevantní výsledky.'
      };
    }

    const maxResults = 5;
    const resultsCount = data.results.length;

    const searchResults = data.results.slice(0, maxResults).map((result, index) => {
      return `${index + 1}. ${result.title}\n   ${result.snippet}\n   Zdroj: ${result.link}`;
    }).join('\n\n');

    showNotification(`🔍 Našel jsem ${resultsCount} výsledků, zobrazují se první ${Math.min(maxResults, resultsCount)}.`, 'info');

    return {
      success: true,
      results: searchResults,
      count: resultsCount
    };
  } catch (error) {
    console.error('💥 Search error:', error);
    showNotification(`Chyba při vyhledávání: ${error.message}`, 'error');
    return {
      success: false,
      message: `Chyba při vyhledávání: ${error.message}`
    };
  }
};

// 🧠 AI ROZHODNUTÍ O SEARCH - OPRAVENÉ (méně agresivní)
const shouldSearchInternet = (userInput) => {
  console.log('🧪 [DEBUG] shouldSearchInternet called with:', userInput);
  const input = (userInput || '').toLowerCase();
  
  // ❌ NIKDY nehledej pro basic conversation
  const conversationalPhrases = [
    'jak se má', 'co děláš', 'ahoj', 'čau', 'dobrý den',
    'děkuji', 'díky', 'jak se jmenuješ', 'kdo jsi',
    'umíš', 'můžeš mi', 'co umíš', 'jak funguje',
    'co je to', 'vysvětli', 'řekni mi'
  ];
  
  for (const phrase of conversationalPhrases) {
    if (input.includes(phrase)) {
      console.log('🧪 [DEBUG] Conversation detected, no search:', phrase);
      return false;
    }
  }
  
  // ✅ Hledej JEN pro explicitní požadavky
  const searchTriggers = [
    'vyhledej', 'najdi aktuální', 'co je nového',
    'dnešní zprávy', 'současná cena', 'nejnovější',
    'aktuální informace', 'latest', 'current'
  ];
  
  for (const trigger of searchTriggers) {
    if (input.includes(trigger)) {
      console.log('🧪 [DEBUG] Search triggered by:', trigger);
      return true;
    }
  }
  
  // ✅ Hledej pro temporal keywords
  if (input.includes('2024') || input.includes('2025') || 
      input.includes('dnes') || input.includes('včera') ||
      input.includes('tento týden') || input.includes('tento měsíc')) {
    console.log('🧪 [DEBUG] Search triggered by temporal keyword');
    return true;
  }
  
  console.log('🧪 [DEBUG] No search trigger found');
  return false;
};

// 🎯 HLAVNÍ FUNKCE PRO PARALELNÍ ZPRACOVÁNÍ
const handleInstantAudioResponse = async (
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
  console.log('🚀 Starting INSTANT audio response strategy...');
  
  const tempMessages = [...currentMessages, { 
    sender: 'bot', 
    text: '🎵 Připravuji audio odpověď...',
    isGenerating: true 
  }];
  setMessages(tempMessages);

  try {
    let responseText = '';
    let searchContext = '';

    const needsSearch = shouldSearchInternet(textInput);
    
    if (needsSearch) {
      console.log('🔍 Query needs internet search');
      const searchResult = await searchInternet(textInput, showNotification);
      
      if (searchResult.success) {
        searchContext = `\n\nNAJNOVĚJŠÍ INFORMACE Z INTERNETU:\n${searchResult.results}\n\nNa základě těchto aktuálních informací odpověz na otázku uživatele. Zmiň že informace jsou z internetu a aktuální.`;
        showNotification(`🔍 Našel jsem ${searchResult.count} výsledků`, 'info');
      } else {
        searchContext = `\n\nPokus o vyhledání aktuálních informací se nezdařil: ${searchResult.message}`;
      }
    }

    if (model === 'gpt-4o') {
      const openAiMessages = [
        { 
          role: 'system', 
          content: `Jsi Omnia, chytrý český AI asistent. DŮLEŽITÉ: Odpovídej VÝHRADNĚ v češtině, každé slovo musí být české. Nikdy nepoužívaj anglická slova jako "Oh", "Well", "So", "Now" apod. Začínej odpovědi přímo česky - například "Ano", "Rozumím", "To je", "Samozřejmě" atd. Piš stručně a přirozeně jako rodilý mluvčí češtiny. Nepiš "Jsem AI" ani se nijak nepředstavuj.${searchContext}` 
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

    console.log('✅ AI odpověď získána:', responseText);

    const audioPromise = generateInstantAudio(
      responseText, 
      setIsAudioPlaying, 
      currentAudioRef, 
      isIOS, 
      showNotification
    );
    
    const textPromise = displayResponseText(
      responseText, 
      currentMessages, 
      setMessages, 
      true
    );

    await Promise.allSettled([audioPromise, textPromise]);
    
    return responseText;
    
  } catch (error) {
    console.error('💥 Instant audio response error:', error);
    
    const errorText = `Chyba: ${error.message}`;
    const errorMessages = [...currentMessages, { sender: 'bot', text: errorText }];
    setMessages(errorMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(errorMessages));
    
    throw error;
  }
};

// 📄 KLASICKÝ TEXT FLOW 
const handleClassicTextResponse = async (
  textInput, 
  currentMessages, 
  model, 
  openaiService, 
  claudeService, 
  setMessages,
  autoPlay,
  voiceMode,
  playResponseAudio,
  showNotification
) => {
  let responseText = '';
  let searchContext = '';

  const needsSearch = shouldSearchInternet(textInput);
  
  if (needsSearch) {
    console.log('🔍 Query needs internet search');
    const searchResult = await searchInternet(textInput, showNotification);
    
    if (searchResult.success) {
      searchContext = `\n\nNAJNOVĚJŠÍ INFORMACE Z INTERNETU:\n${searchResult.results}\n\nNa základě těchto aktuálních informací odpověz na otázku uživatele. Zmiň že informace jsou z internetu a aktuální.`;
      showNotification(`🔍 Našel jsem ${searchResult.count} výsledků`, 'info');
    } else {
      searchContext = `\n\nPokus o vyhledání aktuálních informací se nezdařil: ${searchResult.message}`;
    }
  }
  
  if (model === 'gpt-4o') {
    const openAiMessages = [
      { 
        role: 'system', 
        content: `Jsi Omnia, chytrý český AI asistent. DŮLEŽITÉ: Odpovídej VÝHRADNĚ v češtině, každé slovo musí být české. Nikdy nepoužívaj anglická slova jako "Oh", "Well", "So", "Now" apod. Začínej odpovědi přímo česky - například "Ano", "Rozumím", "To je", "Samozřejmě" atd. Piš stručně a přirozeně jako rodilý mluvčí češtiny. Nepiš "Jsem AI" ani se nijak nepředstavuj.${searchContext}` 
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
  
  if (autoPlay && voiceMode === 'hybrid') {
    setTimeout(() => {
      playResponseAudio(responseText);
    }, 1000);
  }
  
  return responseText;
};

// ONLINE API SERVICES (pro Vercel)
const claudeService = {
  async sendMessage(messages) {
    try {
      console.log('🔄 Volám Claude přes Vercel API...');
      
      const claudeMessages = prepareClaudeMessages(messages);
      
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
};// 🚀 MAIN APP COMPONENT
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState('text'); // 'text', 'hybrid', 'conversation'
  const [autoPlay, setAutoPlay] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVoiceScreen, setShowVoiceScreen] = useState(false); // 🎤 NEW: Voice screen state
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  // Device detection
  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // 🔇 STOP AUDIO FUNCTION
  const stopCurrentAudio = () => {
    console.log('🔇 Stopping current audio...');
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsAudioPlaying(false);
    window.dispatchEvent(new CustomEvent('omnia-audio-start'));
    console.log('🔇 Audio manually stopped');
  };

  // 🔊 AUTO-PLAY FUNCTION
  const playResponseAudio = async (text) => {
    try {
      console.log('🔊 Auto-play attempting:', text.substring(0, 50) + '...');
      
      stopCurrentAudio();
      
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

      setIsAudioPlaying(true);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      currentAudioRef.current = audio;
      
      audio.dataset.autoPlay = 'true';
      
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
      
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      if (isIOS) {
        audio.load();
      }
      
      let playStarted = false;
      
      audio.onplay = () => {
        if (!playbackInterrupted) {
          playStarted = true;
          console.log('🎵 Auto-play started successfully');
        }
      };
      
      audio.onended = () => {
        console.log('✅ Auto-play finished');
        setIsAudioPlaying(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        window.removeEventListener('omnia-audio-start', handleInterrupt);
      };
      
      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        setIsAudioPlaying(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        showNotification('🔇 Chyba přehrávání hlasu', 'error');
        window.removeEventListener('omnia-audio-start', handleInterrupt);
      };
      
      try {
        await audio.play();
        if (!playStarted && !playbackInterrupted) {
          throw new Error('Auto-play failed to start');
        }
      } catch (error) {
        console.error('❌ Auto-play failed:', error);
        if (!playbackInterrupted) {
          showNotification('🔊 Klepněte pro přehrání odpovědi', 'info', () => {
            audio.play().catch(console.error);
          });
        }
      }
      
    } catch (error) {
      console.error('💥 Auto-play error:', error);
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      showNotification('🔇 Chyba při generování hlasu', 'error');
    }
  };

  // 🎯 GLOBAL KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showVoiceScreen) {
          setShowVoiceScreen(false);
        } else if (isAudioPlaying) {
          stopCurrentAudio();
          showNotification('🔇 Audio zastaveno', 'info');
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
  }, [isAudioPlaying, showVoiceScreen]);

  // 💾 LOAD HISTORY FROM LOCALSTORAGE
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

  // 🚀 HANDLE SEND FUNCTION
  const handleSend = async (textInput = input) => {
    console.log('🚀 handleSend called with:', textInput);
    
    if (!textInput.trim()) return;

    if (isAudioPlaying) {
      stopCurrentAudio();
    }

    const newMessages = [...messages, { sender: 'user', text: textInput }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (voiceMode === 'conversation' || (autoPlay && voiceMode === 'hybrid')) {
        console.log('🚀 Using INSTANT audio response strategy with search');
        
        await handleInstantAudioResponse(
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
        console.log('📄 Using classic text-first strategy with search');
        
        await handleClassicTextResponse(
          textInput,
          newMessages,
          model,
          openaiService,
          claudeService,
          setMessages,
          autoPlay,
          voiceMode,
          playResponseAudio,
          showNotification
        );
      }

      console.log('✅ Response processing completed');

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
    if (voiceMode === 'conversation') {
      handleSend(text);
    } else {
      setInput(text);
    }
  };

  // 🔔 NOTIFICATION HELPER
  const showNotification = (message, type = 'info', onClick = null) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  // 📜 AUTO SCROLL
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  // 🎤 VOICE SCREEN COMPONENT
  const VoiceScreen = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #000000, #1a1a1a)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      color: 'white'
    }}
    onClick={() => setShowVoiceScreen(false)} // Tap anywhere to close
    >
      {/* X Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowVoiceScreen(false);
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: '2px solid white',
          color: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>

      {/* Animated Logo */}
      <div style={{ marginBottom: '2rem' }}>
        <OmniaLogo size={120} animate={true} />
      </div>

      {/* Voice Status */}
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        {loading ? (
          <>🚀 Připravuji instant odpověď...</>
        ) : isAudioPlaying ? (
          <>🔊 Instant audio hraje</>
        ) : (
          <>🎤 Držte mikrofon pro mluvení</>
        )}
      </div>

      {/* Voice Button */}
      <VoiceRecorder 
        onTranscript={(text) => {
          handleSend(text);
        }}
        disabled={loading}
        mode="conversation"
      />

      {/* Instruction */}
      <div style={{
        fontSize: '1rem',
        opacity: 0.7,
        marginTop: '2rem',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        {isMobile ? 'Klepněte kamkoli pro návrat' : 'ESC nebo klepněte kamkoli pro návrat'}
      </div>
    </div>
  );

  return (
    <div className="app" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#ffffff',
      color: '#000000'
    }}>
      
      {/* 🎨 HEADER - Keep your original style but cleaner */}
      <header style={{ 
        padding: '1rem',
        background: '#ffffff',
        color: '#000000',
        borderBottom: '1px solid #e9ecef',
        position: 'relative'
      }}>
        {/* Logo Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <OmniaLogo 
            size={isMobile ? 80 : 100} 
            animate={false}
          />
          <h1 style={{ 
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(135deg, #007bff, #28a745, #ffc107)', // 🌈 Rainbow text
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            OMNIA
          </h1>
          <div style={{
            fontSize: '0.8rem',
            color: '#6c757d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔍 S internetovým vyhledáváním
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Mode Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>📋 Režim:</label>
            <select 
              value={voiceMode} 
              onChange={(e) => {
                if (isAudioPlaying) {
                  stopCurrentAudio();
                }
                setVoiceMode(e.target.value);
              }}
              style={{ 
                padding: '0.5rem',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                background: '#ffffff'
              }}
            >
              <option value="text">📝 Text</option>
              <option value="hybrid">🎤 Hybrid</option>
              <option value="conversation">🗣️ Chat</option>
            </select>
          </div>

          {/* Model Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Model:</label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              style={{ 
                padding: '0.5rem',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                background: '#ffffff'
              }}
            >
              <option value="gpt-4o">Omnia v1 (GPT-4)</option>
              <option value="claude">Omnia v2 (Claude)</option>
            </select>
          </div>

          {/* Online Status */}
          <div style={{ 
            fontSize: '0.9rem',
            color: '#28a745',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#28a745', 
              borderRadius: '50%' 
            }}></div>
            Online
          </div>

          {/* Clear Chat */}
          <button
            onClick={() => {
              if (isAudioPlaying) {
                stopCurrentAudio();
              }
              localStorage.removeItem('omnia-memory');
              setMessages([]);
            }}
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              background: '#f8f9fa',
              cursor: 'pointer'
            }}
          >
            Nový chat
          </button>

          {/* 🎤 VOICE SCREEN TRIGGER for Chat mode */}
          {voiceMode === 'conversation' && (
            <button
              onClick={() => setShowVoiceScreen(true)}
              style={{ 
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #28a745, #20c997)', // Zelená pro voice
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🎤 Voice Screen
            </button>
          )}
        </div>
      </header>

      {/* 💬 MESSAGES AREA */}
      <main style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        paddingBottom: '140px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                  backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f8f9fa',
                  color: '#000',
                  padding: '1rem',
                  borderRadius: '1rem',
                  maxWidth: '75%',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid #e9ecef'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{ 
                    fontSize: '0.8rem',
                    opacity: 0.8, 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>🤖 Omnia {model === 'claude' ? 'v2' : 'v1'}</span>
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
              marginBottom: '1rem'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '1rem',
                fontSize: '0.95rem',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #e9ecef', 
                    borderTop: '2px solid #007bff',
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

      {/* 🎯 INPUT AREA - Enhanced with integrated mic */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0,
        right: 0,
        background: '#ffffff', 
        padding: '1rem',
        borderTop: '1px solid #e9ecef',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1rem'
      }}>
        <div style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex', 
          gap: '0.5rem',
          alignItems: 'flex-end'
        }}>
          {voiceMode !== 'conversation' && (
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder={voiceMode === 'hybrid' ? "Napište nebo použijte mikrofon..." : "Zeptej se Omnie nebo vyhledej na internetu…"}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '1rem',
                  paddingRight: voiceMode === 'hybrid' ? '60px' : '1rem', // Space for mic button
                  fontSize: '1rem',
                  borderRadius: '1.5rem',
                  border: '2px solid #e9ecef',
                  outline: 'none',
                  backgroundColor: loading ? '#f8f9fa' : '#ffffff'
                }}
              />
              
              {/* 🎤 INTEGRATED MIC BUTTON for hybrid mode */}
              {voiceMode === 'hybrid' && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  <VoiceRecorder 
                    onTranscript={handleTranscript}
                    disabled={loading}
                    mode={voiceMode}
                  />
                </div>
              )}
            </div>
          )}
          
          {voiceMode === 'conversation' && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              fontSize: '0.9rem',
              borderRadius: '1.5rem',
              border: '2px solid #007bff',
              background: '#e6f3ff',
              color: '#007bff',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {loading ? (
                "🚀 Připravuji instant odpověď..."
              ) : isAudioPlaying ? (
                "🔊 Audio hraje - ESC pro stop"
              ) : (
                "🎤 Klepněte na Voice Screen pro mluvení"
              )}
            </div>
          )}

          {isAudioPlaying && (
            <button 
              onClick={() => {
                stopCurrentAudio();
                showNotification('🔇 Audio zastaveno', 'info');
              }}
              style={{ 
                padding: '1rem',
                fontSize: '0.9rem',
                borderRadius: '1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ⏹️ Stop
            </button>
          )}
          
          {voiceMode !== 'conversation' && !isAudioPlaying && (
            <button 
              onClick={() => handleSend()} 
              disabled={loading || !input.trim()}
              style={{ 
                padding: '1rem 1.5rem',
                fontSize: '0.9rem',
                borderRadius: '1rem',
                background: loading || !input.trim() ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? '⏳' : 'Odeslat'}
            </button>
          )}
        </div>
      </div>

      {/* 🎤 VOICE SCREEN OVERLAY */}
      {showVoiceScreen && <VoiceScreen />}

      {/* 🎨 CSS ANIMATIONS */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .omnia-logo.animate {
          animation: omnia-breathe 4s ease-in-out infinite;
        }
        
        @keyframes omnia-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default App;