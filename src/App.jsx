import React, { useState, useRef, useEffect } from 'react';

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

// 🎤 FIXED VOICE RECORDER WITH BETTER ERROR HANDLING
const VoiceRecorder = ({ onTranscript, disabled, mode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const touchTimeRef = useRef(null);
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const showUserError = (message) => {
    setError(message);
    alert(message);
    setTimeout(() => setError(null), 5000);
  };

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('🎵 Using MIME type:', type);
        return type;
      }
    }
    
    console.warn('⚠️ No supported MIME type found, using default');
    return '';
  };

  const startRecording = async () => {
    try {
      console.log('🎙️ Starting recording...');
      setError(null);
      
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Nahrávání zvuku není podporováno ve vašem prohlížeči');
      }

      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder není podporován ve vašem prohlížeči');
      }

      const constraints = {
        audio: {
          sampleRate: isMobile ? 44100 : 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      // Request permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('Žádné audio stopy nenalezeny');
      }

      console.log('🎵 Audio tracks:', audioTracks.length, audioTracks[0].readyState);

      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      } catch (err) {
        console.warn('⚠️ Failed to create MediaRecorder with MIME type, trying without:', err);
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing...');
        setIsProcessing(true);
        
        // Stop all tracks immediately
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('🔇 Track stopped:', track.kind, track.readyState);
          });
          streamRef.current = null;
        }
        
        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error('Žádná audio data nebyla nahrána');
          }

          // Create blob with detected MIME type
          const finalMimeType = mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
          console.log('🎵 Audio blob created:', audioBlob.size, 'bytes, type:', finalMimeType);
          
          if (audioBlob.size === 0) {
            throw new Error('Audio soubor je prázdný');
          }

          const arrayBuffer = await audioBlob.arrayBuffer();

          // Send to Whisper API
          console.log('📤 Sending to Whisper API...');
          const response = await fetch('/api/whisper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: arrayBuffer
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Whisper API chyba (${response.status}): ${errorText}`);
          }

          const data = await response.json();
          console.log('✅ Whisper response:', data);
          
          if (!data.text || data.text.trim().length === 0) {
            showUserError('Nepodařilo se rozpoznat žádný text. Zkuste mluvit hlasitěji a jasněji.');
            return;
          }

          onTranscript(data.text.trim());

        } catch (error) {
          console.error('💥 Processing error:', error);
          showUserError(`Chyba při zpracování: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('💥 MediaRecorder error:', event.error);
        showUserError(`Chyba nahrávání: ${event.error?.message || 'Neznámá chyba'}`);
        cleanup();
      };

      // Start recording with appropriate timeslice
      const timeslice = isMobile ? 100 : 250;
      mediaRecorder.start(timeslice);
      setIsRecording(true);
      console.log('🎙️ Recording started with timeslice:', timeslice);

    } catch (error) {
      console.error('💥 Start recording error:', error);
      let userMessage = 'Nepodařilo se spustit nahrávání';
      
      if (error.name === 'NotAllowedError') {
        userMessage = 'Přístup k mikrofonu byl zamítnut. Povolte mikrofon v nastavení prohlížeče.';
      } else if (error.name === 'NotFoundError') {
        userMessage = 'Mikrofon nenalezen. Zkontrolujte, zda je mikrofon připojen.';
      } else if (error.name === 'NotReadableError') {
        userMessage = 'Mikrofon je již používán jinou aplikací.';
      } else {
        userMessage = `${userMessage}: ${error.message}`;
      }
      
      showUserError(userMessage);
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stop recording requested');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
    }
    setIsRecording(false);
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up...');
    
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping recorder during cleanup:', error);
      }
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.error('Error stopping track:', error);
        }
      });
      streamRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(false);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isProcessing || isRecording) return;
    
    touchTimeRef.current = Date.now();
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    startRecording();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const duration = Date.now() - (touchTimeRef.current || 0);
    
    if (duration < 300) { // Increased minimum duration
      console.log('⚠️ Touch too short:', duration, 'ms');
      cleanup();
      showUserError('Držte tlačítko déle pro nahrávání');
      return;
    }
    
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    console.log('❌ Touch cancelled');
    cleanup();
  };

  // Desktop handlers
  const handleMouseDown = (e) => {
    if (!isMobile && !disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleMouseUp = (e) => {
    if (!isMobile && isRecording) {
      stopRecording();
    }
  };

  // Cleanup effects
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (isRecording || streamRef.current)) {
        console.log('🚨 Page hidden - cleaning up');
        cleanup();
      }
    };

    const handleBeforeUnload = () => {
      cleanup();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      cleanup();
    };
  }, [isRecording]);

  useEffect(() => {
    return cleanup;
  }, []);

  const getButtonStyle = () => {
    if (error) return { 
      backgroundColor: '#ff6b6b', 
      color: 'white',
      boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)'
    };
    if (isProcessing) return { 
      backgroundColor: '#FFA500', 
      color: 'white',
      transform: 'scale(1.02)',
      boxShadow: '0 0 20px rgba(255, 165, 0, 0.5)'
    };
    if (isRecording) return { 
      backgroundColor: '#FF4444', 
      color: 'white', 
      transform: 'scale(1.1)',
      boxShadow: '0 0 25px rgba(255, 68, 68, 0.6)'
    };
    return { 
      backgroundColor: '#007bff', 
      color: 'white',
      boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
    };
  };

  const getButtonContent = () => {
    if (error) return '❌';
    if (isProcessing) return '⏳';
    if (isRecording) return '🔴';
    return '🎤';
  };

  const buttonSize = isMobile ? 80 : 70;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => !isMobile && isRecording && stopRecording()}
        disabled={disabled || isProcessing}
        title={error ? error : "Držte pro mluvení"}
        style={{
          ...getButtonStyle(),
          border: 'none',
          borderRadius: '50%',
          padding: 0,
          fontSize: isMobile ? '1.8rem' : '1.4rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: buttonSize,
          height: buttonSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none',
          position: 'relative',
          fontWeight: 'bold'
        }}
      >
        {getButtonContent()}
        {isRecording && (
          <div style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: '50%',
            border: '3px solid #ff4444',
            animation: 'pulse 1s infinite'
          }} />
        )}
      </button>
      
      {/* Error display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff4444',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          marginTop: '0.5rem',
          whiteSpace: 'nowrap',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

// 🔊 VOICE BUTTON (unchanged)
const VoiceButton = ({ text, onAudioStart, onAudioEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

      audio.preload = 'auto';
      audio.volume = 1.0;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('💥 Voice error:', error);
      if (onAudioEnd) onAudioEnd();
      alert(`Chyba při generování hlasu: ${error.message}`);
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
        padding: isMobile ? '8px' : '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        fontSize: isMobile ? '1.2rem' : '1rem',
        opacity: isLoading ? 0.5 : 0.7,
        transition: 'all 0.2s',
        minWidth: isMobile ? '40px' : '30px',
        minHeight: isMobile ? '40px' : '30px',
        justifyContent: 'center'
      }}
    >
      {isLoading ? '⏳' : isPlaying ? '⏸️' : '🔊'}
    </button>
  );
};

// Typewriter effect (unchanged)
function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const chars = React.useMemo(() => Array.from(text), [text]);

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

// Helper functions (unchanged)
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

const generateInstantAudio = async (responseText, setIsAudioPlaying, currentAudioRef, showNotification) => {
  try {
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
        showNotification('🔊 Audio se přehrává!', 'success');
      }
    };
    
    audio.onended = () => {
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
      window.removeEventListener('omnia-audio-start', handleInterrupt);
    };
    
    audio.onerror = () => {
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
      window.removeEventListener('omnia-audio-start', handleInterrupt);
      showNotification('🔇 Chyba přehrávání audio', 'error');
    };
    
    try {
      await audio.play();
    } catch (playError) {
      showNotification('🔊 Klepněte zde pro přehrání', 'info', () => {
        audio.play().catch(() => {
          showNotification('🔇 Nepodařilo se přehrát audio', 'error');
        });
      });
    }
    
    return audio;
    
  } catch (error) {
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    showNotification(`🔇 Audio chyba: ${error.message}`, 'error');
    throw error;
  }
};

// API Services (unchanged)
const claudeService = {
  async sendMessage(messages) {
    const claudeMessages = prepareClaudeMessages(messages);
    const systemPrompt = 'Jsi Omnia, chytrý AI asistent. Odpovídej vždy výhradně v češtině, gramaticky správně a přirozeně.';
    
    const response = await fetch('/api/claude2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    return data.content[0].text;
  }
};

const openaiService = {
  async sendMessage(messages) {
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
    return data.choices[0].message.content;
  }
};

// Main App Component (rest unchanged, only using the fixed VoiceRecorder)
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState('text');
  const [autoPlay, setAutoPlay] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsAudioPlaying(false);
    window.dispatchEvent(new CustomEvent('omnia-audio-start'));
  };

  const showNotification = (message, type = 'info', onClick = null) => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#ff4444' : type === 'success' ? '#4CAF50' : '#007bff';
    
    notification.style.cssText = `
      position: fixed;
      top: ${isMobile ? '120px' : '100px'};
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: ${isMobile ? '16px 20px' : '12px 16px'};
      border-radius: ${isMobile ? '12px' : '8px'};
      font-size: ${isMobile ? '16px' : '14px'};
      font-weight: bold;
      z-index: 10000;
      cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: ${isMobile ? '90vw' : '400px'};
      text-align: center;
    `;
    notification.textContent = message;
    
    if (onClick) {
      notification.addEventListener('click', () => {
        onClick();
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      });
    }
    
    document.body.appendChild(notification);
    
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(type === 'error' ? [100, 50, 100] : 50);
    }
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, onClick ? 8000 : 4000);
  };

  const playResponseAudio = async (text) => {
    try {
      stopCurrentAudio();
      
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
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
      
      audio.onended = () => {
        setIsAudioPlaying(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        window.removeEventListener('omnia-audio-start', handleInterrupt);
      };
      
      audio.onerror = () => {
        setIsAudioPlaying(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        showNotification('🔇 Chyba přehrávání hlasu', 'error');
        window.removeEventListener('omnia-audio-start', handleInterrupt);
      };
      
      try {
        await audio.play();
      } catch (playError) {
        if (!playbackInterrupted) {
          showNotification('🔊 Klepněte pro přehrání odpovědi', 'info', () => {
            audio.play().catch(() => {
              showNotification('🔇 Nepodařilo se přehrát', 'error');
            });
          });
        }
      }
      
    } catch (error) {
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      showNotification(`🔇 Audio chyba: ${error.message}`, 'error');
    }
  };

  const handleInstantAudioResponse = async (textInput, currentMessages) => {
    const tempMessages = [...currentMessages, { 
      sender: 'bot', 
      text: '🎵 Připravuji audio odpověď...',
      isGenerating: true 
    }];
    setMessages(tempMessages);

    try {
      let responseText = '';
      
      if (model === 'gpt-4o') {
        const openAiMessages = [
          { 
            role: 'system', 
            content: 'Jsi Omnia, chytrý český AI asistent. Odpovídej VÝHRADNĚ v češtině.' 
          },
          ...currentMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: textInput }
        ];

        responseText = await openaiService.sendMessage(openAiMessages);
      } else if (model === 'claude') {
        responseText = await claudeService.sendMessage([...currentMessages, { sender: 'user', text: textInput }]);
      }

      const audioPromise = generateInstantAudio(
        responseText, 
        setIsAudioPlaying, 
        currentAudioRef, 
        showNotification
      );
      
      setTimeout(() => {
        const finalMessages = [...currentMessages, { 
          sender: 'bot', 
          text: responseText 
        }];
        setMessages(finalMessages);
        localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));
      }, 800);

      await audioPromise;
      return responseText;
      
    } catch (error) {
      const errorText = `Chyba: ${error.message}`;
      const errorMessages = [...currentMessages, { sender: 'bot', text: errorText }];
      setMessages(errorMessages);
      localStorage.setItem('omnia-memory', JSON.stringify(errorMessages));
      throw error;
    }
  };

  const handleClassicTextResponse = async (textInput, currentMessages) => {
    let responseText = '';
    
    if (model === 'gpt-4o') {
      const openAiMessages = [
        { 
          role: 'system', 
          content: 'Jsi Omnia, chytrý český AI asistent. Odpovídej VÝHRADNĚ v češtině.' 
        },
        ...currentMessages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: textInput }
      ];

      responseText = await openaiService.sendMessage(openAiMessages);
    } else if (model === 'claude') {
      responseText = await claudeService.sendMessage([...currentMessages, { sender: 'user', text: textInput }]);
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
      if (voiceMode === 'conversation' || (autoPlay && voiceMode === 'hybrid')) {
        await handleInstantAudioResponse(textInput, newMessages);
      } else {
        await handleClassicTextResponse(textInput, newMessages);
      }
    } catch (err) {
      showNotification(`Chyba: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscript = (text) => {
    console.log('🎙️ Transcript received:', text);
    if (voiceMode === 'conversation') {
      handleSend(text);
    } else {
      setInput(text);
    }
  };

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
      }
      
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
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowX: 'hidden'
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
        padding: 0
      }}>
        
        {/* HEADER */}
        <header style={{ 
          padding: isMobile ? '1rem 0.5rem 0.5rem' : '2rem 1rem 1rem',
          background: '#ffffff',
          borderBottom: '1px solid #eee',
          textAlign: 'center',
          width: '100%',
          flexShrink: 0
        }}>
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
              fontFamily: 'Inter, system-ui, sans-serif',
              background: 'linear-gradient(135deg, #00aaff 0%, #6644ff 50%, #cc44aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.05em'
            }}>
              OMNIA
            </h1>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: isMobile ? 'space-between' : 'space-around',
            alignItems: 'center',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '0.5rem' : '1rem',
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '0' : '0 2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>
              <label style={{ fontWeight: 'bold' }}>Režim:</label>
              <select 
                value={voiceMode} 
                onChange={(e) => {
                  if (isAudioPlaying) stopCurrentAudio();
                  setVoiceMode(e.target.value);
                }}
                style={{ 
                  padding: isMobile ? '0.5rem' : '0.3rem',
                  fontSize: isMobile ? '0.9rem' : '0.8rem',
                  borderRadius: '0.4rem',
                  border: '1px solid #ccc'
                }}
              >
                <option value="text">📝 Text</option>
                <option value="hybrid">🎤 Hybrid</option>
                <option value="conversation">🗣️ Chat</option>
              </select>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>
              <label style={{ fontWeight: 'bold' }}>Model:</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ 
                  padding: isMobile ? '0.5rem' : '0.4rem',
                  fontSize: isMobile ? '0.9rem' : '0.9rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ccc'
                }}
              >
                <option value="gpt-4o">Omnia (GPT-4)</option>
                <option value="claude">Omnia (Claude)</option>
              </select>
            </div>

            {voiceMode === 'hybrid' && !isMobile && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.3rem',
                fontSize: '0.9rem'
              }}>
                <label>🔊 Auto:</label>
                <input 
                  type="checkbox" 
                  checked={autoPlay} 
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            )}

            <button
              onClick={() => {
                if (isAudioPlaying) stopCurrentAudio();
                localStorage.removeItem('omnia-memory');
                setMessages([]);
              }}
              style={{ 
                padding: isMobile ? '0.5rem 0.8rem' : '0.6rem 1.2rem',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              Nový
            </button>
          </div>
        </header>

        {/* CHAT CONTAINER */}
        <main style={{ 
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: isMobile ? '0.5rem' : '1rem',
          paddingBottom: isMobile ? '160px' : '120px',
          background: '#ffffff',
          WebkitOverflowScrolling: 'touch',
          width: '100%'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            minHeight: '50vh',
            width: '100%',
            padding: isMobile ? '0 0.5rem' : '0'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: isMobile ? '1.5rem' : '1rem'
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
                    color: '#000',
                    padding: isMobile ? '1.2rem' : '1rem',
                    borderRadius: isMobile ? '1.2rem' : '1rem',
                    maxWidth: isMobile ? '90%' : '70%',
                    fontSize: isMobile ? '1.1rem' : '1rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.sender === 'bot' && (
                    <div style={{ 
                      fontSize: isMobile ? '0.9rem' : '0.8rem',
                      opacity: 0.7, 
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <OmniaLogo size={16} />
                        Omnia
                        {msg.isGenerating && <span>🚀</span>}
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
                marginBottom: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#F1F0F0',
                  padding: isMobile ? '1.2rem' : '1rem',
                  borderRadius: isMobile ? '1.2rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <OmniaLogo size={14} animate={true} />
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      border: '2px solid #ccc', 
                      borderTop: '2px solid #007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    {voiceMode === 'conversation' ? 'Instant odpověď...' : 'Omnia přemýšlí...'}
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
          width: '100vw',
          background: '#ffffff', 
          padding: isMobile ? '1rem 0.5rem' : '1rem',
          borderTop: '1px solid #eee',
          paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex', 
            gap: isMobile ? '0.5rem' : '1rem',
            width: '100%',
            alignItems: 'flex-end'
          }}>
            {voiceMode !== 'conversation' && (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder={voiceMode === 'hybrid' ? "Napište nebo mluvte..." : "Zeptej se Omnie…"}
                disabled={loading}
                style={{ 
                  flex: 1,
                  padding: isMobile ? '1.2rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  borderRadius: isMobile ? '1.2rem' : '1rem',
                  border: '2px solid #e0e0e0',
                  outline: 'none',
                  backgroundColor: loading ? '#f5f5f5' : '#ffffff',
                  color: '#000000',
                  minHeight: isMobile ? '50px' : '45px'
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
                borderRadius: isMobile ? '1.2rem' : '1rem',
                border: isAudioPlaying ? '2px solid #ff4444' : '2px solid #007bff',
                backgroundColor: isAudioPlaying ? '#fff5f5' : '#f8f9ff',
                color: isAudioPlaying ? '#ff4444' : '#007bff',
                textAlign: 'center',
                fontWeight: 'bold',
                minHeight: isMobile ? '70px' : '50px'
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
                    🚀 Instant odpověď...
                  </>
                ) : isAudioPlaying ? (
                  <>
                    🔊 Audio hraje - {isMobile ? 'dotkněte se' : 'ESC'} pro stop
                  </>
                ) : (
                  "🎤 Držte pro INSTANT audio odpověď"
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
                  padding: isMobile ? '1.2rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  borderRadius: isMobile ? '1.2rem' : '1rem',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: isMobile ? '80px' : '80px',
                  flexShrink: 0,
                  boxShadow: '0 0 15px rgba(255, 68, 68, 0.5)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                ⏹️
              </button>
            )}
            
            {voiceMode !== 'conversation' && !isAudioPlaying && (
              <button 
                onClick={() => handleSend()} 
                disabled={loading || !input.trim()}
                style={{ 
                  padding: isMobile ? '1.2rem 1.5rem' : '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  borderRadius: isMobile ? '1.2rem' : '1rem',
                  backgroundColor: loading || !input.trim() ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  minWidth: isMobile ? '80px' : '80px',
                  flexShrink: 0
                }}
              >
                {loading ? '⏳' : 'Send'}
              </button>
            )}
          </div>

          {isAudioPlaying && (
            <div style={{
              textAlign: 'center',
              fontSize: isMobile ? '0.9rem' : '0.8rem',
              color: '#666',
              marginTop: '0.5rem',
              fontWeight: isMobile ? 'bold' : 'normal'
            }}>
              💡 {isMobile ? 'Klepněte kamkoli nebo na ⏹️ pro zastavení' : 'ESC, Space nebo ⏹️ pro zastavení'}
            </div>
          )}

          {voiceMode === 'conversation' && !isAudioPlaying && !loading && (
            <div style={{
              textAlign: 'center',
              fontSize: isMobile ? '0.9rem' : '0.8rem',
              color: '#007bff',
              marginTop: '0.5rem',
              fontWeight: 'bold'
            }}>
              🚀 Instant Audio: Slyšíte odpověď okamžitě!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;