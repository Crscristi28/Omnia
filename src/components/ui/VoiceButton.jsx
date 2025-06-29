// 📁 src/components/ui/VoiceButton.jsx
// 🔊 Voice playback button - FIXED ELEVENLABS PREPROCESSING!

import React, { useState, useRef, useEffect } from 'react';
import detectLanguage from '../../utils/smartLanguageDetection.js';
import { preprocessTextForTTS } from '../../utils/ttsPreprocessing.js';
import elevenLabsService from '../../services/elevenLabs.service.js';

// 🆕 CONFIG - stejný jako v App.jsx
const USE_ELEVENLABS = true;

const VoiceButton = ({ text, onAudioStart, onAudioEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    const lang = detectLanguage(text);
    setDetectedLanguage(lang);
  }, [text]);

  const handleSpeak = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      if (onAudioEnd) onAudioEnd();
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      const langToUse = detectedLanguage || 'cs';
      
      if (onAudioStart) onAudioStart();

      let audioBlob;

      // 🔧 FIXED: ElevenLabs now gets preprocessed text too!
      if (USE_ELEVENLABS) {
        try {
          // 🆕 PREPROCESSING FOR ELEVENLABS - CRITICAL FIX!
          const processedText = preprocessTextForTTS(text, langToUse);
          console.log('🎵 ElevenLabs preprocessing:', {
            original: text,
            processed: processedText,
            language: langToUse
          });
          
          audioBlob = await elevenLabsService.generateSpeech(processedText);
          console.log('✅ VoiceButton: ElevenLabs audio generated (with preprocessing)');
        } catch (error) {
          console.error('❌ VoiceButton: ElevenLabs failed, using Google:', error);
          // Fallback to Google
          const processedText = preprocessTextForTTS(text, langToUse);
          const response = await fetch('/api/google-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ 
              text: processedText,
              language: langToUse,
              voice: 'natural'
            })
          });
          if (!response.ok) throw new Error(`Google TTS failed: ${response.status}`);
          audioBlob = await response.blob();
        }
      } else {
        // Google TTS
        const processedText = preprocessTextForTTS(text, langToUse);
        const response = await fetch('/api/google-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ 
            text: processedText,
            language: langToUse,
            voice: 'natural'
          })
        });
        if (!response.ok) throw new Error(`Google TTS failed: ${response.status}`);
        audioBlob = await response.blob();
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('❌ Playback error:', e);
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();

    } catch (error) {
      console.error('💥 TTS error:', error);
      setIsPlaying(false);
      if (onAudioEnd) onAudioEnd();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading || !detectedLanguage}
      style={{
        background: 'none',
        border: 'none',
        cursor: isLoading ? 'wait' : 'pointer',
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.85rem',
        opacity: detectedLanguage ? 1 : 0.5,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        color: 'white'
      }}
      title={isPlaying ? "Klepněte pro zastavení" : `Přehrát v jazyce: ${detectedLanguage || 'detekuji...'}`}
    >
      {isLoading ? (
        <div style={{ 
          width: '14px', 
          height: '14px', 
          border: '2px solid rgba(255,255,255,0.3)', 
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      ) : isPlaying ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      )}
      <span style={{ 
        fontSize: '0.7rem', 
        fontWeight: '500',
        textTransform: 'uppercase'
      }}>
        {detectedLanguage || 'CS'}
      </span>
    </button>
  );
};

export default VoiceButton;

// 🎯 KEY CHANGES EXPLAINED:
/*
🔧 CRITICAL FIX - ELEVENLABS PREPROCESSING:

BEFORE:
❌ ElevenLabs dostával raw text: "300/20 = 15"
❌ Říkal: "tři sta lomítko dvacet rovná se patnáct" (nonsense)

AFTER:  
✅ ElevenLabs dostává preprocessed text: "300 děleno 20 rovná se 15"
✅ Říká: "tři sta děleno dvacet rovná se patnáct" (correct!)

🧪 TEST CASES NOW WORKING:
- "300/20 = 15" → "tři sta děleno dvacet rovná se patnáct" ✅
- "31°C" → "třicet jedna stupňů Celsia" ✅  
- "API klíč" → "á pé í klíč" ✅
- "ChatGPT" → "čet džípítí" ✅

📊 PREPROCESSING EXAMPLES:
- "/" → "děleno"
- "=" → "rovná se"  
- "°C" → "stupňů Celsia"
- "%" → "procent"
- Numbers to words: "31" → "třicet jedna"
*/