/// App.jsx - MOBILE OPTIMIZED VERZE s OKAMŽITOU AUDIO ODPOVĚDÍ + INTERNET SEARCH

import React, { useState, useRef, useEffect, useMemo } from 'react';
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

// 🎤 VOICE RECORDING KOMPONENTA - iOS PWA OPTIMIZED
const VoiceRecorder = ({ onTranscript, disabled, mode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const touchStartTimeRef = useRef(null);
  const isIOSPWA = window.navigator.standalone; // Detekce iOS PWA

  const startRecording = async () => {
    try {
      console.log('🎙️ Starting recording... iOS PWA:', isIOSPWA);
      
      // 🍎 iOS PWA específická konfigurace
      const constraints = {
        audio: {
          sampleRate: isIOSPWA ? 44100 : 16000, // iOS PWA preferuje 44100
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // 🍎 iOS PWA - kontrola stream aktivity
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
        
        // 🔧 IMMEDIATE iOS PWA CLEANUP
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
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
    }
  };

  const forceStopRecording = () => {
    console.log('🚨 Force stopping recording (iOS PWA)...');
    
    // Aggressive cleanup pro iOS PWA
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

  // 🍎 iOS PWA TOUCH HANDLERS
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
    
    // iOS PWA - minimální doba dotyku
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

  // 🖱️ DESKTOP HANDLERS (fallback)
  const handleMouseDown = (e) => {
    // Pouze pro desktop (ne iOS PWA)
    if (!isIOSPWA && !disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleMouseUp = (e) => {
    if (!isIOSPWA && isRecording) {
      forceStopRecording();
    }
  };

  // 🔧 EMERGENCY CLEANUP
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

    // iOS PWA specific events
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

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmount - iOS PWA cleanup');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getButtonStyle = () => {
    if (isProcessing) return { backgroundColor: '#FFA500', color: 'white' };
    if (isRecording) return { backgroundColor: '#FF4444', color: 'white', transform: 'scale(1.05)' };
    return { backgroundColor: '#007bff', color: 'white' };
  };

  const getButtonText = () => {
    if (isProcessing) return '⏳';
    if (isRecording) return '🔴';
    return '🎤';
  };

  return (
    <button
      // iOS PWA - primárně touch eventy
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      // Desktop fallback
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
        boxShadow: isRecording ? '0 0 25px rgba(255, 68, 68, 0.6)' : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none' // iOS PWA - zabránit scroll během touch
      }}
    >
      {getButtonText()}
    </button>
  );
};

// 🎤 VOICE BUTTON KOMPONENTA - ANTI-OVERLAP
const VoiceButton = ({ text, onAudioStart, onAudioEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // 🔧 GLOBAL AUDIO MANAGER - zabránit překrývání
  useEffect(() => {
    // Pokud se spustí nové audio, zastav všechna ostatní
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
      // Stop current audio
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

      // 🔔 NOTIFY OTHER AUDIO TO STOP
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

      // Stop any existing audio
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

// 🚀 NOVÉ FUNKCE PRO OKAMŽITOU AUDIO ODPOVĚĎ

// 🎵 OKAMŽITÉ AUDIO GENEROVÁNÍ - HLAVNÍ FUNKCE
const generateInstantAudio = async (responseText, setIsAudioPlaying, currentAudioRef, isIOS, showNotification) => {
  try {
    console.log('🚀 Generating INSTANT audio response...');
    
    // Spuštění TTS API okamžitě
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
    
    // Interrupt handler
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
    
    // 🚀 OKAMŽITÉ PŘEHRÁNÍ
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

// 📝 POSTUPNÉ ZOBRAZENÍ TEXTU (zatímco hraje audio)
const displayResponseText = async (responseText, currentMessages, setMessages, showTempMessage = true) => {
  if (showTempMessage) {
    // Malá pauza aby user viděl audio feedback
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  console.log('📝 Displaying response text while audio plays...');
  
  // Nahraď placeholder skutečným textem
  const finalMessages = [...currentMessages, { 
    sender: 'bot', 
    text: responseText 
  }];
  
  setMessages(finalMessages);
  localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));
  
  return true;
};

// 🔍 INTERNET SEARCH FUNKCE
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

// 🧠 AI ROZHODNUTÍ O SEARCH
// NOVÁ DEBUG VERZE shouldSearchInternet
const shouldSearchInternet = (userInput) => {
  console.log('🧪 [DEBUG] shouldSearchInternet called with:', userInput);
  const searchTriggers = [
    'vyhledej', 'najdi', 'hledej', 'googluj', 'search',
    'aktuální', 'nejnovější', 'současný', 'dnešní', 'včerejší',
    'zprávy', 'news', 'novinky',
    'cena', 'kurz', 'počasí', 'weather',
    '2024', '2025', 'letos', 'loni', 'minulý rok',
    'co se děje', 'co je nového', 'informace o',
    'jak se má', 'co dělá', 'kde je'
  ];
  const input = (userInput || '').toLowerCase();
  for (const trigger of searchTriggers) {
    if (input.includes(trigger)) {
      console.log('🧪 [DEBUG] shouldSearchInternet: Triggered by keyword:', trigger);
      return true;
    }
  }
  const questionWords = ['co je', 'kde je', 'kdy', 'jak se', 'kdo je'];
  for (const question of questionWords) {
    if (input.startsWith(question)) {
      console.log('🧪 [DEBUG] shouldSearchInternet: Triggered by question word:', question);
      return true;
    }
  }
  console.log('🧪 [DEBUG] shouldSearchInternet: No trigger found.');
  return false;
};

// 🎯 HLAVNÍ FUNKCE PRO PARALELNÍ ZPRACOVÁNÍ S SEARCH
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
  
  // 1. Zobraz "Připravuji odpověď..." placeholder
  const tempMessages = [...currentMessages, { 
    sender: 'bot', 
    text: '🎵 Připravuji audio odpověď...',
    isGenerating: true 
  }];
  setMessages(tempMessages);

  try {
    let responseText = '';
    let searchContext = '';

    // 2. 🔍 ROZHODNUTÍ O SEARCH
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

    // 3. Zavolej AI API pro text odpověď (s možným search contextem)
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
      // Pro Claude přidáme search context do user message
      const userMessageWithContext = searchContext ? 
        `${textInput}${searchContext}` : textInput;
      
      responseText = await claudeService.sendMessage([
        ...currentMessages, 
        { sender: 'user', text: userMessageWithContext }
      ]);
    }

    console.log('✅ AI odpověď získána:', responseText);

    // 4. 🎯 PARALELNÍ SPUŠTĚNÍ: Audio generování + Text zobrazení
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

    // 5. Audio se spustí okamžitě, text se zobrazí postupně
    await Promise.allSettled([audioPromise, textPromise]);
    
    return responseText;
    
  } catch (error) {
    console.error('💥 Instant audio response error:', error);
    
    // Fallback - zobraz chybu jako text
    const errorText = `Chyba: ${error.message}`;
    const errorMessages = [...currentMessages, { sender: 'bot', text: errorText }];
    setMessages(errorMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(errorMessages));
    
    throw error;
  }
};

// 📄 KLASICKÝ TEXT FLOW S SEARCH (pro text a hybrid mode)
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

  // 🔍 ROZHODNUTÍ O SEARCH
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
    // Pro Claude přidáme search context do user message
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
  
  // Klasické audio po textu
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
  
  // 🔊 NOVÉ STAVY PRO AUDIO KONTROLU
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const currentAudioRef = useRef(null);
  
  const endOfMessagesRef = useRef(null);

  // Detekce mobile zařízení
  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  // 🔇 FUNKCE PRO ZASTAVENÍ AUDIO
  const stopCurrentAudio = () => {
    console.log('🔇 Stopping current audio...');
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsAudioPlaying(false);
    
    // Notify all other audio components
    window.dispatchEvent(new CustomEvent('omnia-audio-start'));
    
    console.log('🔇 Audio manually stopped');
  };

  // 🔊 UPRAVENÁ FUNKCE PRO AUTO-PLAY (zachována pro hybrid mode)
  const playResponseAudio = async (text) => {
    try {
      console.log('🔊 Auto-play attempting:', text.substring(0, 50) + '...');
      
      // Zastavit předchozí audio
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

      setIsAudioPlaying(true); // 🔥 NASTAVIT STAV

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      currentAudioRef.current = audio; // 🔥 ULOŽIT REFERENCI
      
      // Track this as auto-play audio
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
        setIsAudioPlaying(false); // 🔥 VYČISTIT STAV
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        window.removeEventListener('omnia-audio-start', handleInterrupt);
      };
      
      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        setIsAudioPlaying(false); // 🔥 VYČISTIT STAV
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        showNotification('🔇 Chyba přehrávání hlasu', 'error');
        window.removeEventListener('omnia-audio-start', handleInterrupt);
      };
      
      // 📱 MOBILE/DESKTOP STRATEGY
      if (isMobile) {
        if (voiceMode === 'conversation') {
          try {
            await audio.play();
            if (!playStarted && !playbackInterrupted) {
              throw new Error('Auto-play failed to start');
            }
          } catch (error) {
            console.error('❌ Mobile auto-play failed:', error);
            if (!playbackInterrupted) {
              showNotification('🔊 Klepněte pro přehrání odpovědi', 'info', () => {
                audio.play().catch(console.error);
              });
            }
          }
        } else {
          if (!playbackInterrupted) {
            showNotification('🔊 Klepněte pro přehrání odpovědi', 'info', () => {
              audio.play().catch(console.error);
            });
          }
        }
      } else {
        try {
          await audio.play();
          if (!playStarted && !playbackInterrupted) {
            throw new Error('Auto-play blocked');
          }
        } catch (error) {
          console.error('❌ Desktop auto-play failed:', error);
          if (!playbackInterrupted) {
            showNotification('🔊 Klikněte pro přehrání odpovědi', 'info', () => {
              audio.play().catch(console.error);
            });
          }
        }
      }
      
    } catch (error) {
      console.error('💥 Auto-play error:', error);
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      showNotification('🔇 Chyba při generování hlasu', 'error');
    }
  };

  // 🎯 GLOBÁLNÍ KLAVESOVÉ ZKRATKY
  useEffect(() => {
    const handleKeyPress = (e) => {
      // ESC = zastavit audio
      if (e.key === 'Escape' && isAudioPlaying) {
        e.preventDefault();
        stopCurrentAudio();
        showNotification('🔇 Audio zastaveno', 'info');
      }
      
      // SPACE = zastavit audio (pouze pokud není focus na input)
      if (e.key === ' ' && isAudioPlaying && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        stopCurrentAudio();
        showNotification('🔇 Audio zastaveno', 'info');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAudioPlaying]);

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

  // 🚀 NOVÁ HANDLESENД FUNKCE S OKAMŽITÝM AUDIEM A SEARCH
  const handleSend = async (textInput = input) => {
    console.log('🚀 handleSend called with:', textInput); // DEBUG
    
    if (!textInput.trim()) return;

    // FORCE TEST - přidej tohle pro test:
    console.log('🧪 Testing search detection...');
    const testResult = shouldSearchInternet(textInput);
    console.log('🧪 Search detection result:', testResult);

    // Zastavit audio před odesláním nové zprávy
    if (isAudioPlaying) {
      stopCurrentAudio();
    }

    const newMessages = [...messages, { sender: 'user', text: textInput }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // 🎯 KLÍČOVÁ ZMĚNA: Rozhodnutí o strategii zpracování
      if (voiceMode === 'conversation' || (autoPlay && voiceMode === 'hybrid')) {
        // 🚀 NOVÁ STRATEGIE: Okamžitá audio odpověď + search
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
        // 📄 KLASICKÁ STRATEGIE: Text první, pak audio + search
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
      // V conversation mode rovnou pošli s INSTANT AUDIO + SEARCH!
      handleSend(text);
    } else {
      // V hybrid mode vlož do input pole
      setInput(text);
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
      // 🔇 CLICK ANYWHERE TO STOP AUDIO
      onClick={() => {
        if (isAudioPlaying && isMobile) {
          stopCurrentAudio();
          showNotification('🔇 Audio zastaveno dotykem', 'info');
        }
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
            {/* 🔍 SEARCH INDICATOR */}
            <div style={{
              fontSize: '0.7rem',
              color: '#007bff',
              fontWeight: 'bold',
              opacity: 0.8
            }}>
              🔍 S internetovým vyhledáváním
            </div>
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
                onChange={(e) => {
                  // Zastavit audio při změně režimu
                  if (isAudioPlaying) {
                    stopCurrentAudio();
                  }
                  setVoiceMode(e.target.value);
                }}
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

            {/* Conversation mode info nebo audio status */}
            {voiceMode === 'conversation' && (
              <div style={{ 
                fontSize: '0.8rem',
                color: isAudioPlaying ? '#ff4444' : '#007bff',
                textAlign: 'center',
                fontWeight: 'bold',
                minWidth: '120px'
              }}>
                {isAudioPlaying ? '🚀 Instant Audio!' : '🗣️ Conversation'}
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
                if (isAudioPlaying) {
                  stopCurrentAudio();
                }
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
                  {/* 🎨 AI indikátor s malým logom */}
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
                        {msg.isGenerating && <span>🚀</span>}
                        {msg.text.includes('z internetu') && <span>🔍</span>}
                      </div>
                      {/* 🔊 VOICE BUTTON */}
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
                    {voiceMode === 'conversation' ? 'Připravuji instant odpověď...' : 'Omnia přemýšlí...'}
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>🔍</span>
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
                placeholder={voiceMode === 'hybrid' ? "Napište nebo použijte mikrofon..." : "Zeptej se Omnie nebo vyhledej na internetu…"}
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
                border: isAudioPlaying ? '2px solid #ff4444' : '2px solid #007bff',
                backgroundColor: isAudioPlaying ? '#fff5f5' : '#f8f9ff',
                color: isAudioPlaying ? '#ff4444' : '#007bff',
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
                    🚀 Připravuji instant odpověď s vyhledáváním...
                  </>
                ) : isAudioPlaying ? (
                  <>
                    🔊 Instant audio hraje - {isMobile ? 'dotkněte se' : 'ESC/Space'} pro zastavení
                  </>
                ) : (
                  "🎤 Držte tlačítko pro INSTANT audio odpověď + 🔍 search"
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

            {/* 🔇 STOP BUTTON - zobrazí se během přehrávání audio */}
            {isAudioPlaying && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Zabránit propagaci do main wrapper
                  stopCurrentAudio();
                  showNotification('🔇 Audio zastaveno', 'info');
                }}
                style={{ 
                  padding: isMobile ? '1.2rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  borderRadius: '1rem',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: isMobile ? '80px' : '100px',
                  flexShrink: 0,
                  boxShadow: '0 0 15px rgba(255, 68, 68, 0.5)',
                  animation: 'omnia-pulse 2s ease-in-out infinite'
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

          {/* 🔔 HELP TEXT PRO ZASTAVENÍ AUDIO */}
          {isAudioPlaying && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#666',
              marginTop: '0.5rem',
              maxWidth: '800px',
              margin: '0.5rem auto 0',
              padding: '0 1rem'
            }}>
              💡 {isMobile ? 'Klepněte kamkoli nebo na Stop tlačítko' : 'Stiskněte ESC, Space nebo Stop tlačítko'} pro zastavení
            </div>
          )}

          {/* 🚀 INSTANT AUDIO + SEARCH INFO */}
          {voiceMode === 'conversation' && !isAudioPlaying && !loading && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#007bff',
              marginTop: '0.5rem',
              maxWidth: '800px',
              margin: '0.5rem auto 0',
              padding: '0 1rem',
              fontWeight: 'bold'
            }}>
              🚀 Instant Audio Mode + 🔍 Internet Search: Nejrychlejší AI asistent s aktuálními informacemi!
            </div>
          )}

          {/* 🔍 SEARCH INFO PRO TEXT/HYBRID MODES */}
          {voiceMode !== 'conversation' && !isAudioPlaying && !loading && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#007bff',
              marginTop: '0.5rem',
              maxWidth: '800px',
              margin: '0.5rem auto 0',
              padding: '0 1rem',
              fontWeight: 'bold'
            }}>
              🔍 Automatické vyhledávání na internetu pro aktuální informace
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;