// App.jsx - OMNIA UI REDESIGN - Claude Style + Rainbow Accents
// PART 1/4: Imports, Logo, VoiceRecorder, VoiceButton

import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// 🎨 REDESIGNED OMNIA LOGO - Rainbow Gradient
const OmniaLogo = ({ size = 100, animate = false }) => {
  return (
    <div
      className={`omnia-logo ${animate ? 'animate' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          linear-gradient(135deg, 
            #007bff 0%,
            #28a745 25%,
            #ffc107 50%,
            #fd7e14 75%,
            #6f42c1 100%
          )
        `,
        boxShadow: `
          0 0 ${size * 0.4}px rgba(0, 123, 255, 0.3),
          inset 0 0 ${size * 0.15}px rgba(255, 255, 255, 0.4)
        `,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Glossy highlight effect */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.5)',
          filter: 'blur(8px)'
        }}
      />
      {/* Animated shimmer effect */}
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

// 🎤 REDESIGNED VOICE RECORDER - Clean iOS Style
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

  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '50%',
      padding: 0,
      fontSize: '1.5rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isRecording 
        ? '0 0 25px rgba(255, 68, 68, 0.6), 0 4px 15px rgba(0,0,0,0.2)' 
        : '0 4px 15px rgba(0,0,0,0.1)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'none',
      transform: isRecording ? 'scale(1.05)' : 'scale(1)',
      position: 'relative',
      overflow: 'hidden'
    };

    if (isProcessing) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
        color: 'white'
      };
    }
    
    if (isRecording) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #dc3545, #fd5e53)',
        color: 'white'
      };
    }
    
    return {
      ...baseStyle,
      background: 'linear-gradient(135deg, #007bff, #0056b3)',
      color: 'white'
    };
  };

  const getButtonIcon = () => {
    if (isProcessing) return '⏳';
    if (isRecording) return '⏹️';
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
      {isRecording && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            animation: 'pulse-ring 1.5s ease-out infinite'
          }}
        />
      )}
      {getButtonIcon()}
    </button>
  );
};

// 🎤 REDESIGNED VOICE BUTTON - Minimal Clean Style
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
        background: isPlaying 
          ? 'linear-gradient(135deg, #28a745, #20c997)' 
          : 'linear-gradient(135deg, #6c757d, #495057)',
        border: 'none',
        borderRadius: '8px',
        cursor: isLoading ? 'wait' : 'pointer',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        color: 'white',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: '32px',
        height: '32px'
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {isLoading ? '⏳' : isPlaying ? '⏸️' : '🔊'}
    </button>
  );
};// PART 2/4: TypewriterText, Helper Functions, Audio & Search Functions

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
};

// 🎵 OKAMŽITÉ AUDIO GENEROVÁNÍ - HLAVNÍ FUNKCE
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

// 📝 POSTUPNÉ ZOBRAZENÍ TEXTU (zatímco hraje audio)
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
};// PART 3/4: API Services & Main App Component Start

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
};

// 🚀 MAIN APP COMPONENT - REDESIGNED
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState('text');
  const [autoPlay, setAutoPlay] = useState(true);
  
  // 🔊 AUDIO STATES
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
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

  // 🎯 GLOBAL KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isAudioPlaying) {
        e.preventDefault();
        stopCurrentAudio();
        showNotification('🔇 Audio zastaveno', 'info');
      }
      
      if (e.key === ' ' && isAudioPlaying && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        stopCurrentAudio();
        showNotification('🔇 Audio zastaveno', 'info');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAudioPlaying]);

  // 🎨 FORCE LIGHT MODE + ANIMATIONS
  useEffect(() => {
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]') || document.createElement('meta');
    metaColorScheme.name = 'color-scheme';
    metaColorScheme.content = 'light only';
    if (!document.querySelector('meta[name="color-scheme"]')) {
      document.head.appendChild(metaColorScheme);
    }

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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
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
        border-color: #e9ecef !important;
        font-family: inherit !important;
      }
      
      /* 🎨 REDESIGNED ANIMATIONS */
      .omnia-logo:hover {
        transform: scale(1.05);
        filter: brightness(1.1);
      }
      
      .omnia-logo.animate {
        animation: omnia-breathe 4s ease-in-out infinite;
      }
      
      @keyframes omnia-breathe {
        0%, 100% { 
          transform: scale(1);
          filter: brightness(1) saturate(1);
        }
        50% { 
          transform: scale(1.02);
          filter: brightness(1.1) saturate(1.1);
        }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
      }
      
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* 🌈 RAINBOW TEXT GRADIENT */
      .rainbow-text {
        background: linear-gradient(135deg, #007bff 0%, #28a745 25%, #ffc107 50%, #fd7e14 75%, #6f42c1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      /* 📱 MOBILE OPTIMIZATIONS */
      @media (max-width: 768px) {
        input, textarea, select, button {
          font-size: 16px !important; /* Prevent zoom on iOS */
        }
      }
      
      @media (prefers-color-scheme: dark) {
        html, body, #root {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
      }
    `;
    if (!document.getElementById('dark-mode-override')) {
      document.head.appendChild(darkModeOverride);
    }

    return () => {
      const meta = document.querySelector('meta[name="color-scheme"]');
      const style = document.getElementById('dark-mode-override');
      if (meta) meta.remove();
      if (style) style.remove();
    };
  }, []);

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

  // 🚀 REDESIGNED HANDLE SEND FUNCTION
  const handleSend = async (textInput = input) => {
    console.log('🚀 handleSend called with:', textInput);
    
    if (!textInput.trim()) return;

    console.log('🧪 Testing search detection...');
    const testResult = shouldSearchInternet(textInput);
    console.log('🧪 Search detection result:', testResult);

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
      background: ${type === 'error' ? 'linear-gradient(135deg, #dc3545, #c82333)' : 'linear-gradient(135deg, #007bff, #0056b3)'};
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 10000;
      cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
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
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
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
  }, [messages]);// PART 4/4: REDESIGNED UI - Claude Style Clean Layout

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
        bottom: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}
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
        
        {/* 🎨 REDESIGNED HEADER - Claude Style */}
        <header style={{ 
          padding: isMobile ? '1.5rem 1rem 1rem' : '2rem 1.5rem 1.5rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          color: '#000000',
          borderBottom: '1px solid #e9ecef',
          position: 'relative',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* 🌈 RAINBOW LOGO SECTION */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: isMobile ? '1rem' : '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <OmniaLogo 
              size={isMobile ? 64 : 80} 
              animate={true}
            />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <h1 className="rainbow-text" style={{ 
                fontSize: isMobile ? '2rem' : '2.5rem',
                fontWeight: '800',
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                OMNIA
              </h1>
              <div style={{
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                color: '#6c757d',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                border: '1px solid rgba(0,123,255,0.1)'
              }}>
                <span>🔍</span>
                <span>Internet Search</span>
                <span>•</span>
                <span>🚀</span>
                <span>Instant Audio</span>
              </div>
            </div>
          </div>

          {/* 🎛️ CLEAN CONTROLS SECTION */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: isMobile ? '0.75rem' : '1.5rem',
            maxWidth: '900px',
            margin: '0 auto',
            padding: isMobile ? '0' : '0 1rem'
          }}>
            {/* Mode Selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: '#f8f9fa',
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <label style={{ 
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: '600',
                color: '#495057'
              }}>
                📋 Režim:
              </label>
              <select 
                value={voiceMode} 
                onChange={(e) => {
                  if (isAudioPlaying) {
                    stopCurrentAudio();
                  }
                  setVoiceMode(e.target.value);
                }}
                style={{ 
                  padding: '0.4rem 0.6rem',
                  fontSize: isMobile ? '0.85rem' : '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  background: '#ffffff',
                  color: '#495057',
                  fontWeight: '500',
                  minWidth: isMobile ? '100px' : 'auto'
                }}
              >
                <option value="text">📝 Text</option>
                <option value="hybrid">🎤 Hybrid</option>
                <option value="conversation">🗣️ Chat</option>
              </select>
            </div>

            {/* Model Selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: '#f8f9fa',
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <label style={{ 
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: '600',
                color: '#495057'
              }}>
                🧠 Model:
              </label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ 
                  padding: '0.4rem 0.6rem',
                  fontSize: isMobile ? '0.85rem' : '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  background: '#ffffff',
                  color: '#495057',
                  fontWeight: '500',
                  minWidth: isMobile ? '130px' : 'auto'
                }}
              >
                <option value="gpt-4o">Omnia v1 (GPT-4)</option>
                <option value="claude">Omnia v2 (Claude)</option>
              </select>
            </div>

            {/* Status Indicators */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              color: '#6c757d',
              fontWeight: '500'
            }}>
              {/* Online Status */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#d1edff',
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                border: '1px solid rgba(0,123,255,0.2)'
              }}>
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  backgroundColor: '#28a745', 
                  borderRadius: '50%',
                  animation: 'omnia-breathe 2s ease-in-out infinite'
                }}></div>
                Online
              </div>

              {/* Audio Status */}
              {voiceMode === 'conversation' && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: isAudioPlaying ? '#ffe6e6' : '#e6f3ff',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '8px',
                  border: `1px solid ${isAudioPlaying ? 'rgba(255,68,68,0.2)' : 'rgba(0,123,255,0.2)'}`,
                  color: isAudioPlaying ? '#dc3545' : '#007bff',
                  fontWeight: '600'
                }}>
                  {isAudioPlaying ? '🚀 Instant!' : '🗣️ Ready'}
                </div>
              )}
            </div>

            {/* Clear Chat Button */}
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
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                borderRadius: '10px',
                border: '1px solid #ced4da',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                color: '#495057',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
            >
              🗑️ Nový chat
            </button>
          </div>
        </header>

        {/* 💬 CHAT CONTAINER - Claude Style */}
        <main style={{ 
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: isMobile ? '1rem' : '1.5rem',
          paddingBottom: isMobile ? '160px' : '140px',
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
                  marginBottom: '1.5rem'
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)' 
                      : '#f8f9fa',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)' 
                      : 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                    color: '#000',
                    padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    maxWidth: isMobile ? '85%' : '75%',
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                >
                  {/* 🤖 AI INDICATOR */}
                  {msg.sender === 'bot' && (
                    <div style={{ 
                      fontSize: isMobile ? '0.75rem' : '0.7rem',
                      opacity: 0.8, 
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <OmniaLogo size={16} />
                        <span style={{ fontWeight: '600', color: '#495057' }}>
                          Omnia {model === 'claude' ? 'v2' : 'v1'}
                        </span>
                        {msg.isGenerating && <span>🚀</span>}
                        {msg.text.includes('z internetu') && <span>🔍</span>}
                      </div>
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
                  background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                  padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                  borderRadius: '18px 18px 18px 4px',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <OmniaLogo size={16} animate={true} />
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #e9ecef', 
                      borderTop: '2px solid #007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{ color: '#495057', fontWeight: '500' }}>
                      {voiceMode === 'conversation' ? 'Připravuji instant odpověď...' : 'Omnia přemýšlí...'}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>🔍</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
        </main>

        {/* 🎯 REDESIGNED INPUT AREA - Claude Style */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0,
          right: 0,
          width: '100vw',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, #ffffff 20%)', 
          color: '#000000',
          padding: isMobile ? '1rem' : '1.5rem',
          borderTop: '1px solid #e9ecef',
          paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1.5rem',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          boxSizing: 'border-box',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex', 
            gap: isMobile ? '0.75rem' : '1rem',
            width: '100%',
            boxSizing: 'border-box',
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
                    padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    borderRadius: '20px',
                    border: '2px solid #e9ecef',
                    outline: 'none',
                    backgroundColor: loading ? '#f8f9fa' : '#ffffff',
                    color: '#000000',
                    boxSizing: 'border-box',
                    colorScheme: 'light only',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                />
              </div>
            )}
            
            {voiceMode === 'conversation' && (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                fontSize: isMobile ? '0.9rem' : '0.85rem',
                borderRadius: '20px',
                border: isAudioPlaying ? '2px solid #dc3545' : '2px solid #007bff',
                background: isAudioPlaying 
                  ? 'linear-gradient(135deg, #ffe6e6, #fff5f5)' 
                  : 'linear-gradient(135deg, #e6f3ff, #f0f8ff)',
                color: isAudioPlaying ? '#dc3545' : '#007bff',
                textAlign: 'center',
                fontWeight: '600',
                minHeight: '50px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid #007bff', 
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    🚀 Připravuji instant odpověď s vyhledáváním...
                  </div>
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

            {isAudioPlaying && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  stopCurrentAudio();
                  showNotification('🔇 Audio zastaveno', 'info');
                }}
                style={{ 
                  padding: isMobile ? '1rem' : '1rem 1.25rem',
                  fontSize: isMobile ? '0.9rem' : '0.85rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  minWidth: isMobile ? '60px' : '80px',
                  flexShrink: 0,
                  boxShadow: '0 0 20px rgba(220, 53, 69, 0.4)',
                  animation: 'omnia-breathe 2s ease-in-out infinite',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
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
                  padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                  fontSize: isMobile ? '0.9rem' : '0.85rem',
                  borderRadius: '16px',
                  background: loading || !input.trim() 
                    ? 'linear-gradient(135deg, #6c757d, #495057)' 
                    : 'linear-gradient(135deg, #007bff, #0056b3)',
                  color: 'white',
                  border: 'none',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  minWidth: isMobile ? '60px' : '80px',
                  flexShrink: 0,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  opacity: loading || !input.trim() ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {loading ? '⏳' : '📤'}
              </button>
            )}
          </div>

          {/* 🔔 HELP TEXTS */}
          {isAudioPlaying && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#6c757d',
              marginTop: '0.75rem',
              maxWidth: '800px',
              margin: '0.75rem auto 0',
              fontWeight: '500'
            }}>
              💡 {isMobile ? 'Klepněte kamkoli nebo na Stop tlačítko' : 'Stiskněte ESC, Space nebo Stop tlačítko'} pro zastavení
            </div>
          )}

          {voiceMode === 'conversation' && !isAudioPlaying && !loading && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#007bff',
              marginTop: '0.75rem',
              maxWidth: '800px',
              margin: '0.75rem auto 0',
              fontWeight: '600'
            }}>
              🚀 Instant Audio Mode + 🔍 Internet Search: Nejrychlejší AI asistent!
            </div>
          )}

          {voiceMode !== 'conversation' && !isAudioPlaying && !loading && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#007bff',
              marginTop: '0.75rem',
              maxWidth: '800px',
              margin: '0.75rem auto 0',
              fontWeight: '600'
            }}>
              🔍 Automatické vyhledávání aktuálních informací z internetu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;