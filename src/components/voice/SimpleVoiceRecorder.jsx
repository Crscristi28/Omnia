// 🎙️ SIMPLE VOICE RECORDER - Manual Control Only
// ✅ FIXES: No infinite loops, no auto-silence detection
// 🔧 MANUAL: Click to start, click to stop

import React, { useState, useRef, useEffect } from 'react';

const SimpleVoiceRecorder = ({ 
  onTranscript, 
  onListeningChange,
  disabled, 
  isAudioPlaying,
  uiLanguage = 'cs'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  
  // ✅ FIXED VALUES - No aggressive detection
  const MIN_RECORDING_TIME = 2000;    // 2 seconds minimum  
  const MAX_RECORDING_TIME = 30000;   // 30 seconds maximum
  
  const isIOSPWA = window.navigator.standalone;

  const requestMicrophonePermission = async () => {
    try {
      console.log('🎙️ Requesting microphone permission...');
      
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
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionGranted(true);
      console.log('✅ Microphone permission granted');
      return true;
      
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setPermissionGranted(false);
      
      const errorMessage = {
        'cs': 'Nepodařilo se získat přístup k mikrofonu',
        'en': 'Could not access microphone',
        'ro': 'Nu s-a putut accesa microfonul'
      }[uiLanguage] || 'Microphone access denied';
      
      onTranscript(`[${errorMessage}]`);
      return false;
    }
  };

  const startListening = async () => {
    try {
      console.log('🎙️ Starting manual voice recording...');

      if (!permissionGranted) {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) return;
      }

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
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing...');
        setIsProcessing(true);
        
        const recordingDuration = Date.now() - recordingStartTimeRef.current;
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        try {
          if (audioChunksRef.current.length === 0 || recordingDuration < MIN_RECORDING_TIME) {
            console.warn('⚠️ Recording too short or no data');
            const shortMessage = {
              'cs': 'Nahrávka příliš krátká - zkuste znovu (min 2s)',
              'en': 'Recording too short - try again (min 2s)',
              'ro': 'Înregistrare prea scurtă - încearcă din nou (min 2s)'
            }[uiLanguage] || 'Recording too short';
            
            onTranscript(`[${shortMessage}]`);
            setIsProcessing(false);
            return;
          }

          const audioBlob = new Blob(audioChunksRef.current, { 
            type: isIOSPWA ? 'audio/mp4' : 'audio/webm' 
          });
          
          if (audioBlob.size < 1000) {
            console.warn('⚠️ Audio too small - likely silence');
            const silenceMessage = {
              'cs': 'Žádný zvuk nezaznamenán - zkuste znovu',
              'en': 'No audio detected - try again',
              'ro': 'Nu s-a detectat audio - încearcă din nou'
            }[uiLanguage] || 'No audio detected';
            
            onTranscript(`[${silenceMessage}]`);
            setIsProcessing(false);
            return;
          }

          const arrayBuffer = await audioBlob.arrayBuffer();
          console.log('📤 Sending to Whisper API...');
          
          const response = await fetch('/api/whisper', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: arrayBuffer
          });

          if (!response.ok) {
            throw new Error(`Whisper API failed: HTTP ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ Whisper response:', data);
          
          if (data.success && data.text && data.text.trim()) {
            const transcribedText = data.text.trim();
            const detectedLanguage = data.language || 'unknown';
            
            console.log('🌍 Detected language:', detectedLanguage);
            console.log('📝 Transcribed text:', transcribedText);
            
            onTranscript(transcribedText, data.confidence || 1.0);
          } else {
            console.warn('⚠️ Empty or failed transcription');
            const failMessage = {
              'cs': 'Nepodařilo se rozpoznat řeč - zkuste znovu',
              'en': 'Could not recognize speech - try again',
              'ro': 'Nu s-a putut recunoaște vorba - încearcă din nou'
            }[uiLanguage] || 'Speech recognition failed';
            
            onTranscript(`[${failMessage}]`);
          }

        } catch (error) {
          console.error('💥 Whisper error:', error);
          const errorMessage = {
            'cs': 'Chyba při rozpoznávání řeči - zkuste to znovu',
            'en': 'Speech recognition error - try again',
            'ro': 'Eroare recunoaștere vocală - încearcă din nou'
          }[uiLanguage] || 'Speech recognition error';
          
          onTranscript(`[${errorMessage}]`);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      if (onListeningChange) onListeningChange(true);
      
      console.log('🎯 Manual recording started');

      // ✅ FIXED: Only MAX timeout, no silence detection
      setTimeout(() => {
        if (isListening && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('⏰ Max recording time reached - stopping');
          stopListening();
        }
      }, MAX_RECORDING_TIME);

    } catch (error) {
      console.error('💥 Start listening error:', error);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsListening(false);
      setIsProcessing(false);
      setPermissionGranted(false);
      if (onListeningChange) onListeningChange(false);
      
      const errorMessage = {
        'cs': 'Nepodařilo se spustit nahrávání',
        'en': 'Could not start recording',
        'ro': 'Nu s-a putut porni înregistrarea'
      }[uiLanguage] || 'Recording failed';
      
      onTranscript(`[${errorMessage}]`);
    }
  };

  const stopListening = () => {
    console.log('🛑 Stopping manual recording...');

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
    
    setIsListening(false);
    if (onListeningChange) onListeningChange(false);
  };

  // ✅ SIMPLE TOGGLE - Manual control only
  const toggleListening = () => {
    if (disabled || isProcessing) return;
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  useEffect(() => {
    if (isAudioPlaying && isListening) {
      console.log('🔇 Stopping listening - audio playing');
      stopListening();
    }
  }, [isAudioPlaying]);

  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '50%',
      padding: 0,
      fontSize: '2rem',
      cursor: (disabled || isProcessing) ? 'not-allowed' : 'pointer',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'none',
      transform: 'translateZ(0)',
      willChange: 'transform, box-shadow'
    };

    if (isProcessing) return { 
      ...baseStyle,
      backgroundColor: '#ffc107',
      color: 'white',
      boxShadow: '0 0 25px rgba(255, 193, 7, 0.6)',
      animation: 'omnia-pulse 1.5s ease-in-out infinite'
    };
    
    if (isListening) return { 
      ...baseStyle,
      backgroundColor: '#dc3545',
      color: 'white',
      transform: 'scale(1.1) translateZ(0)',
      boxShadow: '0 0 35px rgba(220, 53, 69, 0.8)',
      animation: 'omnia-pulse 1s ease-in-out infinite'
    };
    
    return { 
      ...baseStyle,
      backgroundColor: '#007bff',
      color: 'white',
      boxShadow: '0 0 20px rgba(0, 123, 255, 0.5)'
    };
  };

  const getButtonIcon = () => {
    if (isProcessing) return (
      <div style={{ 
        width: '20px', 
        height: '20px', 
        border: '3px solid rgba(255,255,255,0.3)', 
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
    );
    
    if (isListening) {
      return (
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: 'white',
          borderRadius: '2px',
          animation: 'pulse 1s ease-in-out infinite'
        }}></div>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    );
  };

  const getButtonTitle = () => {
    const titles = {
      'cs': {
        processing: 'Zpracovávám nahrávku...',
        listening: 'Klikněte pro zastavení nahrávání',
        ready: 'Klikněte pro začátek nahrávání'
      },
      'en': {
        processing: 'Processing recording...',
        listening: 'Click to stop recording',
        ready: 'Click to start recording'
      },
      'ro': {
        processing: 'Procesez înregistrarea...',
        listening: 'Apasă pentru a opri înregistrarea',
        ready: 'Apasă pentru a începe înregistrarea'
      }
    };

    const langTitles = titles[uiLanguage] || titles['cs'];
    
    if (isProcessing) return langTitles.processing;
    if (isListening) return langTitles.listening;
    return langTitles.ready;
  };

  return (
    <button
      onClick={toggleListening}
      disabled={disabled || isProcessing}
      title={getButtonTitle()}
      style={getButtonStyle()}
    >
      {getButtonIcon()}
    </button>
  );
};

export default SimpleVoiceRecorder;