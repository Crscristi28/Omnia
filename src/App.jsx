// 🚀 OMNIA - FIXED APP.JSX (ČÁST 1/2) - VOICE RESPONSE OPRAVENO
// ✅ FIXED: Voice response funguje ve VoiceScreen i mimo něj
// ✅ FIXED: Audio unlock při voice interakci
// ✅ FIXED: isVoiceMode persistence pro dokončení TTS
// ✅ ENHANCED: Debug logging pro troubleshooting

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// 🔧 IMPORT SERVICES
import claudeService from './services/claude.service.js';
import openaiService from './services/openai.service.js';
import sonarService from './services/sonar.service.js';
import elevenLabsService from './services/elevenLabs.service.js';

// 🔧 IMPORT UTILS  
import { uiTexts, getTranslation } from './utils/translations.js';
import sessionManager from './utils/sessionManager.js';
import detectLanguage from './utils/smartLanguageDetection.js';

// 🔧 IMPORT UI COMPONENTS
import SettingsDropdown from './components/ui/SettingsDropdown.jsx';
import { OmniaLogo, MiniOmniaLogo, ChatOmniaLogo } from './components/ui/OmniaLogos.jsx';
import OmniaArrowButton from './components/ui/OmniaArrowButton.jsx';
import TypewriterText from './components/ui/TypewriterText.jsx';
import VoiceButton from './components/ui/VoiceButton.jsx';
import CopyButton from './components/ui/CopyButton.jsx';
import VoiceScreen from './components/voice/VoiceScreen.jsx';

// 🆕 SANITIZE TEXT FUNCTION (backup pro ElevenLabs)
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\bnapř\.\b/gi, 'například')
    .replace(/\batd\.\b/gi, 'a tak dále')
    .replace(/(\d+)\s*%/g, '$1 procent')
    .replace(/(\d+)[\s]*°C/g, '$1 stupňů Celsia')
    .replace(/(\d+)[\s]*°/g, '$1 stupňů')
    .replace(/(\d{1,2}):(\d{2})/g, '$1 hodin $2 minut')
    .replace(/(\d+)\s*Kč/g, '$1 korun')
    .replace(/(\d+)\s*\$/g, '$1 dolarů')
    .replace(/(\d+)\s*€/g, '$1 eur')
    .replace(/(\d+)[.,](\d+)/g, '$1 celá $2')
    .replace(/(\d+)\s*km\/h/g, '$1 kilometrů za hodinu')
    .replace(/(\d+)\s*kg/g, '$1 kilogramů')
    .replace(/(\d+)\s*kWh/g, '$1 kilowatthodin')
    .replace(/\b1\/2\b/g, 'půl')
    .replace(/\b1\/4\b/g, 'čtvrt')
    .replace(/\s+/g, ' ')
    .trim();
}

// 🆕 ENHANCED MOBILE AUDIO MANAGER (ZACHOVÁVÁME TVOJI VERZI!)
class MobileAudioManager {
  constructor() {
    this.currentAudio = null;
    this.isUnlocked = false;
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
  }
  
  async initialize() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      console.log('📱 AudioContext initialized:', this.audioContext.state);
    } catch (e) {
      console.warn('⚠️ Could not create AudioContext early:', e);
    }
  }
  
  async unlockAudioContext() {
    if (this.isUnlocked) {
      console.log('🔓 Audio already unlocked');
      return true;
    }
    
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.001;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
      
      const silentAudio = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmY1OC4yOS4xMDAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xAAIAAIAGAAAAABJbmZvAAAADwAAAAMAABqyAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAA5TEFNRTMuOTlyAc0AAAAAAAAAABUgJAUHQQAB4AAAAbIqPqsqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xDsAAAGkAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xP4AAAGkAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      silentAudio.volume = 0.01;
      
      try {
        await silentAudio.play();
        silentAudio.pause();
      } catch (e) {
        console.warn('⚠️ Silent audio play failed:', e);
      }
      
      this.isUnlocked = true;
      console.log('🔓 Mobile audio unlocked successfully!');
      this.processQueue();
      return true;
    } catch (error) {
      console.error('❌ Failed to unlock audio:', error);
      return false;
    }
  }
  
  async queueAudio(audioBlob) {
    console.log('🎵 Queueing audio blob:', audioBlob.size, 'bytes');
    this.audioQueue.push(audioBlob);
    
    if (!this.isPlaying) {
      console.log('▶️ Starting queue processing');
      this.processQueue();
    } else {
      console.log('⏸️ Already playing, audio queued');
    }
  }
  
  async processQueue() {
    if (this.audioQueue.length === 0 || this.isPlaying) {
      console.log('🔄 Queue status:', { 
        queueLength: this.audioQueue.length, 
        isPlaying: this.isPlaying 
      });
      return;
    }
    
    this.isPlaying = true;
    
    while (this.audioQueue.length > 0) {
      const audioBlob = this.audioQueue.shift();
      console.log('🎵 Processing audio from queue, remaining:', this.audioQueue.length);
      
      try {
        await this.playAudio(audioBlob);
        // Malá pauza mezi větami
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error('❌ Error playing queued audio:', error);
      }
    }
    
    this.isPlaying = false;
    console.log('✅ Queue processing complete');
  }
  
  async playAudio(audioBlob) {
    console.log('🔊 Playing audio blob:', audioBlob.size, 'bytes');
    this.stop();
    
    if (!this.isUnlocked) {
      console.log('🔒 Audio locked, attempting unlock...');
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        throw new Error('Audio context locked');
      }
    }
    
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        console.log('✅ Audio playback ended');
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        resolve();
      };
      
      this.currentAudio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        reject(e);
      };
      
      this.currentAudio.play()
        .then(() => console.log('▶️ Audio playing successfully'))
        .catch(reject);
    });
  }
  
  stop() {
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('⏹️ Audio stopped');
    }
  }
  
  isCurrentlyPlaying() {
    return this.isPlaying || (this.currentAudio && !this.currentAudio.paused);
  }
}

// Create global instance
const mobileAudioManager = new MobileAudioManager();
if (typeof window !== 'undefined') window.mobileAudioManager = mobileAudioManager;

// 🆕 SENTENCE SPLITTER for progressive voice
function splitIntoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

function isCompleteSentence(sentence) {
  return sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?');
}

// 🚀 MAIN APP COMPONENT
function App() {
  // 📊 BASIC STATE
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // 🎤 VOICE STATE
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  
  // 🆕 STT STATE
  const [isRecordingSTT, setIsRecordingSTT] = useState(false);
  
  // 🆕 VOICE MODE TRACKING - ✅ FIXED: Persistent across VoiceScreen close
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceResponseBuffer, setVoiceResponseBuffer] = useState('');
  const [pendingSentences, setPendingSentences] = useState([]);
  const [voiceResponseComplete, setVoiceResponseComplete] = useState(false);
  
  // 🌍 LANGUAGE & UI STATE
  const [userLanguage, setUserLanguage] = useState('cs');
  const [uiLanguage, setUILanguage] = useState('cs');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // 📱 DEVICE STATE
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const sttRecorderRef = useRef(null);
  const processedSentencesRef = useRef(new Set());
  const voiceModeTimeoutRef = useRef(null);
  
  // 🆕 PROGRESSIVE VOICE STATE
  const currentStreamTextRef = useRef('');
  const lastProcessedLengthRef = useRef(0);
  
  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const t = getTranslation(uiLanguage);

  // 🆕 MOBILE AUDIO INITIALIZATION
  useEffect(() => {
    mobileAudioManager.initialize();
    
    const handleUserInteraction = () => {
      if (!userHasInteracted) {
        setUserHasInteracted(true);
        console.log('👆 First user interaction detected');
        mobileAudioManager.unlockAudioContext();
      }
    };
    
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

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

  // 🆕 AUDIO-FIRST TTS GENERATION - ✅ FIXED: Working with sanitizeText backup
  const generateAudioForSentence = async (sentence, language) => {
    try {
      console.log('🎵 Generating audio for sentence:', sentence.substring(0, 30) + '...');
      
      let textToSpeak = sentence;
      
      const hasProblematicPatterns = /\d+[.,]\d+|%|\d+°C|\d+:\d+|\d+Kč|\d+€|\d+\$|km\/h/i.test(sentence);
      
      if (hasProblematicPatterns) {
        textToSpeak = sanitizeText(sentence);
        console.log('🔧 Applied sanitizeText backup:', {
          original: sentence.substring(0, 50),
          sanitized: textToSpeak.substring(0, 50),
          reason: 'Contains problematic patterns'
        });
      }
      
      const response = await fetch('/api/elevenlabs-tts-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ 
          text: textToSpeak,
          language: language,
          voice_id: process.env.ELEVENLABS_VOICE_ID || 'MpbYQvoTmXjHkaxtLiSh',
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
          voice_settings: {
            stability: 0.30,
            similarity_boost: 0.25,
            style: 0.30,
            use_speaker_boost: true,
            speed: 1.0
          }
        })
      });
      
      if (!response.ok) {
        console.warn('⚠️ ElevenLabs failed, trying Google TTS...');
        const googleResponse = await fetch('/api/google-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ 
            text: sentence,
            language: language,
            voice: 'natural'
          })
        });
        
        if (!googleResponse.ok) {
          throw new Error(`TTS failed: ${googleResponse.status}`);
        }
        
        return await googleResponse.blob();
      }
      
      return await response.blob();
      
    } catch (error) {
      console.error('💥 TTS generation failed:', error);
      throw error;
    }
  };

  // ✅ FIXED: Progressive sentence processor - WORKS WITHOUT VoiceScreen requirement!
  const processNewSentences = async (fullText, language, isStreaming) => {
    console.log('🎵 processNewSentences called:', {
      isVoiceMode,
      showVoiceScreen,
      textLength: fullText.length,
      language,
      isStreaming
    });
    
    // ✅ CRITICAL FIX: Only check isVoiceMode!
    if (!isVoiceMode) {
      console.warn('⚠️ Voice mode is false - skipping audio generation');
      return;
    }
    
    const currentLength = fullText.length;
    const newText = fullText.slice(lastProcessedLengthRef.current);
    
    if (newText.length === 0) return;
    
    currentStreamTextRef.current = fullText;
    lastProcessedLengthRef.current = currentLength;
    
    const allSentences = splitIntoSentences(fullText);
    const processedCount = processedSentencesRef.current.size;
    
    console.log('📝 Sentence processing:', {
      totalSentences: allSentences.length,
      processedCount: processedCount,
      newText: newText.substring(0, 50) + '...'
    });
    
    for (let i = processedCount; i < allSentences.length; i++) {
      const sentence = allSentences[i];
      
      if (isCompleteSentence(sentence) && !processedSentencesRef.current.has(sentence)) {
        console.log('🎵 Processing new complete sentence:', sentence.substring(0, 50) + '...');
        processedSentencesRef.current.add(sentence);
        
        try {
          const audioBlob = await generateAudioForSentence(sentence, language);
          console.log('✅ Audio blob generated:', audioBlob.size, 'bytes');
          
          await mobileAudioManager.queueAudio(audioBlob);
          console.log('✅ Audio queued for progressive sentence');
        } catch (error) {
          console.error('❌ Failed to generate progressive audio:', error);
        }
      }
    }
    
    // ✅ Handle final processing when streaming ends
    if (!isStreaming && allSentences.length === processedSentencesRef.current.size) {
      console.log('✅ All sentences processed, voice response complete');
      setVoiceResponseComplete(true);
      
      // Reset voice mode after a delay to ensure all audio plays
      if (voiceModeTimeoutRef.current) {
        clearTimeout(voiceModeTimeoutRef.current);
      }
      
      voiceModeTimeoutRef.current = setTimeout(() => {
        if (!mobileAudioManager.isCurrentlyPlaying()) {
          console.log('🔧 Resetting voice mode after completion');
          setIsVoiceMode(false);
          setVoiceResponseComplete(false);
        }
      }, 5000); // 5 seconds after completion
    }
  };// 🆕 SPEECH-TO-TEXT FUNCTIONS (unchanged - working)
  const startSTTRecording = async () => {
    try {
      console.log('🎤 Starting ElevenLabs STT recording...');
      setIsRecordingSTT(true);
      
      // ✅ UNLOCK AUDIO on STT start
      if (!mobileAudioManager.isUnlocked) {
        await mobileAudioManager.unlockAudioContext();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      sttRecorderRef.current = mediaRecorder;
      const audioChunks = [];
      const startTime = Date.now();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordingDuration = Date.now() - startTime;
        stream.getTracks().forEach(track => track.stop());
        setIsRecordingSTT(false);
        
        if (recordingDuration < 1000) {
          showNotification('Nahrávka příliš krátká - mluvte déle', 'error');
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        if (audioBlob.size < 1000) {
          showNotification('Žádný zvuk nezaznamenán', 'error');
          return;
        }
        
        console.log('🎯 STT Recording complete:', {
          duration: recordingDuration + 'ms',
          size: Math.round(audioBlob.size / 1024) + 'KB'
        });
        
        await processSTTAudio(audioBlob);
      };

      mediaRecorder.onerror = (error) => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecordingSTT(false);
        showNotification('Chyba při nahrávání', 'error');
      };

      mediaRecorder.start();
      
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000);

    } catch (error) {
      console.error('❌ STT Recording setup error:', error);
      setIsRecordingSTT(false);
      showNotification('Nepodařilo se získat přístup k mikrofonu', 'error');
    }
  };

  const stopSTTRecording = () => {
    if (sttRecorderRef.current && sttRecorderRef.current.state === 'recording') {
      sttRecorderRef.current.stop();
      console.log('🛑 STT Recording stopped manually');
      
      // ✅ UNLOCK AUDIO on stop interaction
      mobileAudioManager.unlockAudioContext();
    }
  };

  const processSTTAudio = async (audioBlob) => {
    try {
      console.log('📤 Sending audio to ElevenLabs STT...');
      showNotification('Převádím řeč na text...', 'info');
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      const response = await fetch('/api/elevenlabs-stt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: arrayBuffer
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs STT error:', response.status, errorText);
        throw new Error(`Speech-to-Text failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.text && data.text.trim()) {
        const transcribedText = data.text.trim();
        console.log('✅ STT Success:', transcribedText);
        
        setInput(transcribedText);
        showNotification('Text převeden! Zkontrolujte a odešlete.', 'success');
      } else {
        throw new Error('Nepodařilo se rozpoznat řeč');
      }

    } catch (error) {
      console.error('💥 STT processing error:', error);
      showNotification(`Chyba při převodu: ${error.message}`, 'error');
    }
  };

  const toggleSTT = () => {
    if (loading || streaming) return;
    
    if (isRecordingSTT) {
      stopSTTRecording();
    } else {
      startSTTRecording();
    }
  };

  // 🔧 CLASSIC FUNCTIONS with FIX
  const handleNewChat = () => {
    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    processedSentencesRef.current = new Set();
    setPendingSentences([]);
    
    currentStreamTextRef.current = '';
    lastProcessedLengthRef.current = 0;
    
    if (streaming) setStreaming(false);
    if (isListening) setIsListening(false);
    if (isRecordingSTT) stopSTTRecording();
    
    sessionManager.clearSession();
    setMessages([]);
    setUserLanguage('cs');
    setVoiceResponseBuffer('');
    setIsVoiceMode(false);
    setVoiceResponseComplete(false);
    
    if (voiceModeTimeoutRef.current) {
      clearTimeout(voiceModeTimeoutRef.current);
    }
    
    showNotification(t('newChatCreated'), 'success');
  };

  // ✅ FIXED: Convert messages for OpenAI
  const convertMessagesForOpenAI = (messages) => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || ''
    }));
  };

  // ✅ FIXED: Voice transcript handler
  const handleTranscript = async (text, confidence = 1.0) => {
    console.log('🎙️ Voice transcript received:', { text, confidence });
    
    // Close voice screen if open
    if (showVoiceScreen) {
      setShowVoiceScreen(false);
    }
    
    // ✅ CRITICAL: Keep voice mode active for response!
    console.log('🎙️ VOICE MODE ACTIVATED via transcript');
    setIsVoiceMode(true);
    
    // ✅ Force unlock audio on voice interaction
    if (!mobileAudioManager.isUnlocked) {
      await mobileAudioManager.unlockAudioContext();
    }
    
    // ✅ Always treat voice input as voice mode
    await handleSend(text, true); // fromVoice = true
  };

  // ✅ FIXED: AI CONVERSATION with voice response fixes
  const handleSend = async (textInput = input, fromVoice = false) => {
    if (!textInput.trim() || loading || streaming) return;

    console.log('📤 handleSend called:', { 
      fromVoice, 
      textInput: textInput.substring(0, 30) + '...',
      isVoiceMode 
    });

    const detectedLang = detectLanguage(textInput);
    if (detectedLang !== userLanguage) {
      setUserLanguage(detectedLang);
    }

    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    processedSentencesRef.current = new Set();
    setPendingSentences([]);

    currentStreamTextRef.current = '';
    lastProcessedLengthRef.current = 0;

    if (!fromVoice) setInput('');
    setLoading(true);
    
    // ✅ Set voice mode BEFORE sending
    if (fromVoice) {
      console.log('🎙️ VOICE MODE ACTIVATED in handleSend');
      setIsVoiceMode(true);
      
      // Force unlock audio
      if (!mobileAudioManager.isUnlocked) {
        await mobileAudioManager.unlockAudioContext();
      }
    }
    
    setVoiceResponseBuffer('');
    setVoiceResponseComplete(false);

    try {
      const userMessage = { sender: 'user', text: textInput };
      const messagesWithUser = [...messages, userMessage];
      setMessages(messagesWithUser);
      sessionManager.saveMessages(messagesWithUser);

      let responseText = '';
      let fullResponse = '';

      if (model === 'claude') {
        setStreaming(true);
        const streamingBotMessage = { sender: 'bot', text: '', isStreaming: true };
        const messagesWithBot = [...messagesWithUser, streamingBotMessage];
        setMessages(messagesWithBot);

        const onStreamUpdate = async (text, isStillStreaming) => {
          fullResponse = text;

          // ✅ FIXED: Progressive voice works with fromVoice only
          if (fromVoice || isVoiceMode) {
            setVoiceResponseBuffer(text);
            await processNewSentences(text, detectedLang, isStillStreaming);
          }

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
          }
        };

        responseText = await claudeService.sendMessage(
          messagesWithUser, onStreamUpdate, null, detectedLang
        );
      }
      else if (model === 'gpt-4o') {
        const openAIMessages = convertMessagesForOpenAI(messagesWithUser);
        console.log('🔧 GPT Fixed messages format:', {
          original: messagesWithUser[messagesWithUser.length - 1],
          converted: openAIMessages[openAIMessages.length - 1]
        });

        responseText = await openaiService.sendMessage(openAIMessages, detectedLang);
        const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        // ✅ FIXED: Voice response for GPT
        if ((fromVoice || isVoiceMode) && responseText) {
          console.log('🎵 Generating voice for GPT response');
          const sentences = splitIntoSentences(responseText);
          for (const sentence of sentences) {
            if (sentence.trim().length > 0) {
              try {
                const audioBlob = await generateAudioForSentence(sentence, detectedLang);
                await mobileAudioManager.queueAudio(audioBlob);
                console.log('✅ Audio played for GPT sentence');
              } catch (error) {
                console.error('❌ Failed to generate audio:', error);
              }
            }
          }
          setVoiceResponseComplete(true);
        }
      }
      else if (model === 'sonar') {
        const searchResult = await sonarService.search(textInput, showNotification, detectedLang);
        responseText = searchResult.success ? searchResult.result : searchResult.message;
        const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        // ✅ FIXED: Voice response for Sonar
        if ((fromVoice || isVoiceMode) && responseText) {
          console.log('🎵 Generating voice for Sonar response');
          const sentences = splitIntoSentences(responseText);
          for (const sentence of sentences) {
            if (sentence.trim().length > 0) {
              try {
                const audioBlob = await generateAudioForSentence(sentence, detectedLang);
                await mobileAudioManager.queueAudio(audioBlob);
                console.log('✅ Audio played for Sonar sentence');
              } catch (error) {
                console.error('❌ Failed to generate audio:', error);
              }
            }
          }
          setVoiceResponseComplete(true);
        }
      }

    } catch (err) {
      console.error('💥 API call error:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
      setStreaming(false);
      
      // ✅ Keep voice mode active until audio completes
      if (fromVoice || isVoiceMode) {
        console.log('🎵 Keeping voice mode active for audio completion');
        
        // Set timeout to reset voice mode after audio plays
        if (voiceModeTimeoutRef.current) {
          clearTimeout(voiceModeTimeoutRef.current);
        }
        
        voiceModeTimeoutRef.current = setTimeout(() => {
          if (!mobileAudioManager.isCurrentlyPlaying()) {
            console.log('🔧 Resetting voice mode after timeout');
            setIsVoiceMode(false);
            setVoiceResponseComplete(false);
          }
        }, 10000); // 10 seconds timeout
      }
    }
  };

  // ⚙️ INITIALIZATION + SIMPLE AUDIO SETUP
  useEffect(() => {
    const { isNewSession, messages: savedMessages } = sessionManager.initSession();
    
    if (!isNewSession && savedMessages.length > 0) {
      setMessages(savedMessages);
    }

    const savedUILanguage = sessionManager.getUILanguage();
    if (savedUILanguage && uiTexts[savedUILanguage]) {
      setUILanguage(savedUILanguage);
    }
  }, []);

  // 🔧 AUDIO STATE MONITORING
  useEffect(() => {
    const checkAudioState = setInterval(() => {
      const isPlaying = mobileAudioManager.isCurrentlyPlaying();
      if (isAudioPlaying !== isPlaying) {
        setIsAudioPlaying(isPlaying);
        console.log('🔊 Audio playing state changed:', isPlaying);
      }
    }, 500);

    return () => clearInterval(checkAudioState);
  }, [isAudioPlaying]);

  // 🔧 GLOBAL SCOPE for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.isVoiceMode = isVoiceMode;
      window.mobileAudioManager = mobileAudioManager;
      console.log('🔧 Voice mode updated:', isVoiceMode);
    }
  }, [isVoiceMode]);

  // 🔧 VOICE SCREEN UNLOCK
  useEffect(() => {
    if (showVoiceScreen && !mobileAudioManager.isUnlocked) {
      console.log('🎤 Voice screen opened - unlocking audio');
      mobileAudioManager.unlockAudioContext();
    }
  }, [showVoiceScreen]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const shouldHideLogo = messages.length > 0;// 🎨 JSX RENDER
  return (
    <div style={{ 
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw', height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      background: isListening 
        ? 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
        : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif',
      margin: 0, padding: 0,
      overflow: 'hidden',
      transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      
      {/* HEADER */}
      <header style={{ 
        padding: isMobile ? '1rem 1rem 0.5rem' : '1.5rem 2rem 1rem',
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.85), rgba(0, 78, 146, 0.6))',
        backdropFilter: 'blur(20px)',
        zIndex: 10,
        flexShrink: 0
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
            
            {showModelDropdown && !loading && !streaming && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                background: 'rgba(45, 55, 72, 0.95)',
                border: '1px solid rgba(74, 85, 104, 0.6)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(16px)',
                zIndex: 1000, minWidth: '220px', overflow: 'hidden'
              }}>
                {[
                  { key: 'gpt-4o', label: '⚡ Omnia GPT', desc: 'Voice Fixed! 🎵' },
                  { key: 'claude', label: '🧠 Omnia', desc: 'Progressive Voice ✅' },
                  { key: 'sonar', label: '🔍 Omnia Search', desc: 'Real-time + Voice ✅' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { setModel(item.key); setShowModelDropdown(false); }}
                    style={{
                      display: 'block', width: '100%', 
                      padding: '0.8rem 1rem', border: 'none', 
                      background: model === item.key ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                      textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer',
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

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              disabled={loading || streaming}
              style={{
                background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.8), rgba(45, 55, 72, 0.6))',
                border: '1px solid rgba(74, 85, 104, 0.6)',
                borderRadius: '10px', padding: '0.6rem', fontSize: '1rem',
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

        <div style={{ 
          textAlign: 'center', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '1rem', maxWidth: '1200px', margin: '0 auto'
        }}>
          <OmniaLogo 
            size={isMobile ? 70 : 90} 
            animate={streaming || loading}
            isListening={isListening || isRecordingSTT}
            shouldHide={shouldHideLogo}
          />
          {!shouldHideLogo && (
            <>
              <h1 style={{ 
                fontSize: isMobile ? '2.2rem' : '2.8rem', 
                fontWeight: '700', margin: 0, color: '#ffffff',
                letterSpacing: '0.02em'
              }}>
                OMNIA
              </h1>
              <div style={{
                fontSize: '0.95rem', opacity: 0.8, textAlign: 'center',
                padding: '6px 12px', borderRadius: '15px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: '500'
              }}>
                🎵 Voice Response Fixed! • ✅ Works everywhere • ⚡ Mobile ready
              </div>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ 
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: isMobile ? '1rem' : '2rem',
        paddingBottom: '160px', width: '100%'
      }}>
        <div style={{ 
          maxWidth: '1000px', margin: '0 auto',
          minHeight: messages.length === 0 ? '60vh' : 'auto',
          display: 'flex', flexDirection: 'column',
          justifyContent: messages.length === 0 ? 'center' : 'flex-start'
        }}>
          
          {messages.length === 0 && !shouldHideLogo && (
            <div style={{ height: '40vh' }}></div>
          )}

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
                  lineHeight: '1.6', whiteSpace: 'pre-wrap',
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
                  lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: isMobile ? 'none' : `3px solid ${msg.isStreaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                  borderRadius: '0 12px 12px 0',
                  paddingLeft: '1.8rem', backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ 
                      fontWeight: '600', color: '#a0aec0', 
                      display: 'flex', alignItems: 'center' 
                    }}>
                      <ChatOmniaLogo size={18} />
                      Omnia {msg.isStreaming ? ' • streaming...' : ' • voice ready'}
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
          
          {(loading || streaming) && (
            <div style={{ 
              display: 'flex', justifyContent: 'flex-start', 
              marginBottom: '2rem', animation: 'fadeInUp 0.4s ease-out'
            }}>
              <div style={{
                padding: isMobile ? '1.2rem' : '1.6rem',
                fontSize: isMobile ? '1rem' : '0.95rem', color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: isMobile ? 'none' : `3px solid ${streaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                borderRadius: '0 12px 12px 0',
                paddingLeft: '1.8rem', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ 
                    width: '18px', height: '18px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid #00ffff',
                    borderRadius: '50%', animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ 
                    color: streaming ? '#00ffff' : '#a0aec0', 
                    fontWeight: '500' 
                  }}>
                    {streaming ? t('omniaStreaming') : t('omniaPreparingResponse')}
                    {isVoiceMode && ' • 🎵 voice response active'}
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
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8))',
        backdropFilter: 'blur(20px)', padding: isMobile ? '1.2rem' : '1.6rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1.2rem)' : '1.6rem',
        zIndex: 10, flexShrink: 0
      }}>
        <div style={{ 
          maxWidth: '1000px', margin: '0 auto', 
          display: 'flex', gap: '0.8rem', alignItems: 'center'
        }}>
          
          <div style={{ flex: 1 }}>
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && !streaming && handleSend()}
              placeholder={isListening || isRecordingSTT ? (isRecordingSTT ? 'Nahrávám ElevenLabs STT...' : t('listening') + '...') :
                          streaming ? t('omniaStreaming') : 
                          `${t('sendMessage')} Omnia...`}
              disabled={loading || streaming}
              style={{ 
                width: '100%', 
                padding: isMobile ? '1.1rem 1.4rem' : '1.2rem 1.6rem',
                fontSize: isMobile ? '16px' : '0.95rem', 
                borderRadius: '30px',
                border: '2px solid rgba(74, 85, 104, 0.6)', outline: 'none',
                backgroundColor: (loading || streaming) 
                  ? 'rgba(45, 55, 72, 0.6)' 
                  : 'rgba(26, 32, 44, 0.8)',
                color: '#ffffff',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                opacity: (loading || streaming) ? 0.7 : 1,
                backdropFilter: 'blur(10px)', fontWeight: '400'
              }}
            />
          </div>
          
          <button
            onClick={toggleSTT}
            disabled={loading || streaming || isAudioPlaying}
            style={{
              width: isMobile ? 54 : 60,
              height: isMobile ? 54 : 60,
              borderRadius: '50%', border: 'none',
              background: isRecordingSTT 
                ? 'linear-gradient(45deg, #ff4444, #cc0000)' 
                : 'linear-gradient(45deg, #00ff88, #00cc66)',
              color: 'white',
              cursor: (loading || streaming || isAudioPlaying) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 'bold',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: (loading || streaming || isAudioPlaying) ? 0.5 : 1,
              boxShadow: isRecordingSTT 
                ? '0 0 20px rgba(255, 68, 68, 0.6)' 
                : '0 4px 12px rgba(0, 255, 136, 0.4)',
              transform: 'translateZ(0)'
            }}
            title={isRecordingSTT ? 'Zastavit STT nahrávání' : 'ElevenLabs Speech-to-Text'}
          >
            {isRecordingSTT ? '⏹️' : '🎤'}
          </button>

          <MiniOmniaLogo 
            size={isMobile ? 54 : 60} 
            onClick={() => !loading && !streaming && setShowVoiceScreen(true)}
            isAudioPlaying={isAudioPlaying}
            isListening={isListening}
            loading={loading} streaming={streaming}
          />

          <OmniaArrowButton
            onClick={() => handleSend()}
            disabled={loading || streaming || !input.trim()}
            loading={loading || streaming}
            isListening={isListening || isRecordingSTT}
            size={isMobile ? 54 : 60}
          />
        </div>
      </div>

      <VoiceScreen 
        isOpen={showVoiceScreen}
        onClose={() => {
          setShowVoiceScreen(false);
          setVoiceResponseBuffer('');
          currentStreamTextRef.current = '';
          lastProcessedLengthRef.current = 0;
          
          // ✅ SIMPLE: Reset voice mode after delay
          setTimeout(() => {
            if (!mobileAudioManager.isCurrentlyPlaying()) {
              setIsVoiceMode(false);
              console.log('🔧 Voice mode reset after VoiceScreen close');
            }
          }, 2000);
        }}
        onTranscript={handleTranscript}
        isLoading={loading}
        isAudioPlaying={isAudioPlaying || mobileAudioManager.isPlaying}
        uiLanguage={uiLanguage}
        messages={messages}
        currentResponse={voiceResponseBuffer || (streaming ? messages[messages.length - 1]?.text : null)}
        audioManager={mobileAudioManager}
      />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
        body { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important; position: fixed !important; top: 0 !important; left: 0 !important; }
        #root { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; position: fixed !important; top: 0 !important; left: 0 !important; }
        body > * { margin: 0 !important; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px) translateZ(0); } 100% { opacity: 1; transform: translateY(0) translateZ(0); } }
        @keyframes omnia-pulse { 0%, 100% { box-shadow: 0 0 15px rgba(100, 50, 255, 0.8); transform: scale(1) translateZ(0); } 50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.9); transform: scale(1.05) translateZ(0); } }
        @keyframes omnia-listening { 0% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); } 50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.9); } 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); } }
        
        * { -webkit-tap-highlight-color: transparent; }
        @media (max-width: 768px) { input { font-size: 16px !important; } button { min-height: 44px; min-width: 44px; } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(26, 32, 44, 0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(74, 85, 104, 0.8); border-radius: 4px; }
        button { -webkit-user-select: none; user-select: none; }
        input:focus { outline: none !important; }
      `}</style>
    </div>
  );
};

export default App;