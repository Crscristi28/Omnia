// 🚀 OMNIA - APP.JSX PART 1/3 - IMPORTS + STATE + EFFECTS (REDESIGNED)
// ✅ ADDED: ChatSidebar + NewChatButton imports
// ✅ ADDED: welcomeTexts for multilingual welcome
// ✅ SIMPLIFIED: Removed complex scroll system
// 🎯 UNCHANGED: Všechny původní importy a funkčnost
// 🆕 STREAMING: Added streamingUtils import

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Menu, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './App.css';

// 🔧 IMPORT SERVICES (MODULAR)
import { claudeService, openaiService, sonarService, grokService, geminiService } from './services/ai';
import { elevenLabsService } from './services/voice';

// 🔧 IMPORT UTILS (MODULAR + STREAMING)
import { uiTexts, getTranslation, detectLanguage, sanitizeText } from './utils/text';
import { sessionManager } from './services/storage';
import { streamMessageWithEffect, smartScrollToBottom } from './utils/ui'; // 🆕 STREAMING

// 🔧 IMPORT UI COMPONENTS (MODULAR)
import { SettingsDropdown, OmniaLogo, MiniOmniaLogo, ChatOmniaLogo, VoiceButton, CopyButton } from './components/ui';
import { VoiceScreen } from './components/chat';

// 🆕 IMPORT INPUT BAR (MODULAR)
import { InputBar } from './components/input';

// 🔗 IMPORT SOURCES COMPONENTS (UNCHANGED)
import { SourcesButton, SourcesModal } from './components/sources';

// 🆕 NEW COMPONENTS - Added for redesign
import { ChatSidebar } from './components/layout';

// 🌍 MULTILINGUAL WELCOME TEXTS - NEW!
const welcomeTexts = {
  cs: { 
    hello: "Ahoj!", 
    subtitle: "Jak se dnes máš?" 
  },
  en: { 
    hello: "Hello!", 
    subtitle: "How's it going today?" 
  },
  ro: { 
    hello: "Salut!", 
    subtitle: "Cum îți merge astăzi?" 
  }
};

// 🆕 MOBILE AUDIO MANAGER (UNCHANGED)
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
    if (this.isUnlocked) return true;
    
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
      
      const silentAudio = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmY1OC4yOS4xMAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xAAIAAIAGAAAAABJbmZvAAAADwAAAAMAABqyAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAA5TEFNRTMuOTlyAc0AAAAAAAAAABUgJAUHQQAB4AAAAbIqPqsqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xDsAAAGkAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      silentAudio.volume = 0.01;
      
      try {
        await silentAudio.play();
        silentAudio.pause();
      } catch (e) {
        console.warn('⚠️ Silent audio play failed:', e);
      }
      
      this.isUnlocked = true;
      console.log('🔓 Mobile audio unlocked!');
      this.processQueue();
      return true;
    } catch (error) {
      console.error('❌ Failed to unlock audio:', error);
      return false;
    }
  }
  
  async queueAudio(audioBlob) {
    console.log('🎵 Adding audio to queue. Queue length:', this.audioQueue.length);
    this.audioQueue.push(audioBlob);
    
    if (!this.isPlaying) {
      await this.processQueue();
    }
  }
  
  async processQueue() {
    if (this.audioQueue.length === 0 || this.isPlaying) return;
    
    this.isPlaying = true;
    console.log('🎵 Starting audio queue processing...');
    
    while (this.audioQueue.length > 0) {
      const audioBlob = this.audioQueue.shift();
      console.log('🎵 Playing audio. Remaining in queue:', this.audioQueue.length);
      
      try {
        await this.playAudio(audioBlob);
        console.log('✅ Audio finished, continuing to next...');
        await new Promise(resolve => setTimeout(resolve, 0));
      } catch (error) {
        console.error('❌ Error playing queued audio:', error);
      }
    }
    
    this.isPlaying = false;
    console.log('🏁 Audio queue processing complete');
  }
  
  async playAudio(audioBlob) {
    this.stop();
    
    if (!this.isUnlocked) {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        throw new Error('Audio context locked');
      }
    }
    
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        console.log('🎵 Audio ended naturally');
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
        .then(() => {
          console.log('▶️ Audio started playing');
        })
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
    }
    
    console.log('🛑 Audio stopped and queue cleared');
  }
}

// Create global instance (UNCHANGED)
const mobileAudioManager = new MobileAudioManager();

// 🆕 SENTENCE SPLITTER (UNCHANGED)
function splitIntoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

function App() {
  // 📊 BASIC STATE (UNCHANGED)
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState(() => {
    const savedModel = sessionManager.getSelectedModel();
    return savedModel || 'gemini-2.5-flash'; // Gemini as default
  });
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // 🎤 VOICE STATE (UNCHANGED)
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isRecordingSTT, setIsRecordingSTT] = useState(false);
  
  // 🆕 MODEL SWITCH STATE FOR VOICE (UNCHANGED)
  const [previousModel, setPreviousModel] = useState(null);
  
  // 🌍 LANGUAGE & UI STATE (UNCHANGED)
  const [userLanguage, setUserLanguage] = useState('cs');
  const [uiLanguage, setUILanguage] = useState('cs');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // 🔗 SOURCES STATE (UNCHANGED)
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [currentSources, setCurrentSources] = useState([]);
  
  // 🆕 NEW SIDEBAR STATE - Added for redesign
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  
  // 🆕 STREAMING STATE - For controlling streaming effect
  const [stopStreamingRef, setStopStreamingRef] = useState(null);
  
  // 🎨 IMAGE GENERATION STATE - For switching between chat and image modes
  const [isImageMode, setIsImageMode] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  
  // 📄 Smart document context management - tracks which documents AI can currently see
  const [activeDocumentContexts, setActiveDocumentContexts] = useState([]);
  
  // 📱 DEVICE STATE (UNCHANGED)
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const sttRecorderRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

  // 💾 SAVE SELECTED MODEL TO LOCALSTORAGE
  useEffect(() => {
    sessionManager.saveSelectedModel(model);
  }, [model]);

  // 🆕 AUDIO INITIALIZATION (UNCHANGED)
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

  // ⚙️ INITIALIZATION (UNCHANGED)
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

  // 🆕 SIMPLE SCROLL - NO AUTO-SCROLL! User controls everything
  // Scroll will only happen when user sends message (in handleSend)

  const shouldHideLogo = messages.length > 0;// 🚀 OMNIA - APP.JSX PART 2/3 - UTILITY FUNCTIONS + MESSAGE HANDLING (REDESIGNED)
// ✅ ADDED: Sidebar handlers
// 🎯 UNCHANGED: Všechny původní funkce (TTS, STT, AI conversation)
// 🆕 STREAMING: Modified Claude message handling with streaming effect

// 🔧 NOTIFICATION SYSTEM (ENHANCED)
  const showNotification = (message, type = 'info', onClick = null) => {
    // Detect search messages and update state
    const searchKeywords = ['hledá', 'searching', 'caută', 'google', 'search'];
    if (searchKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      setIsSearching(true);
      // Reset search state when search is done
      setTimeout(() => setIsSearching(false), 3000);
    }
    const notification = document.createElement('div');
    
    const baseStyle = `
      position: fixed; top: 80px; right: 20px; padding: 12px 18px; border-radius: 12px;
      font-size: 14px; z-index: 10000; cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 8px 25px rgba(0,0,0,0.3); font-weight: 500; max-width: 350px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(10px);
      display: flex; align-items: center; gap: 8px;
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

  // 🔗 SOURCES MODAL HANDLERS (UNCHANGED)
  const handleSourcesClick = (sources) => {
    console.log('🔗 Opening sources modal with:', sources.length, 'sources');
    setCurrentSources(sources);
    setSourcesModalOpen(true);
  };

  const handleSourcesModalClose = () => {
    console.log('🔗 Closing sources modal');
    setSourcesModalOpen(false);
    setCurrentSources([]);
  };

  // 🆕 SIDEBAR HANDLERS - NEW for redesign
  const handleSidebarOpen = () => {
    setShowChatSidebar(true);
  };

  const handleSidebarClose = () => {
    setShowChatSidebar(false);
  };

  const handleSidebarNewChat = () => {
    handleNewChat();
    setShowChatSidebar(false);
  };

  // 🎵 TTS GENERATION - USING SAME LOGIC AS VOICEBUTTON (UNCHANGED)
  const generateAudioForSentence = async (sentence, language) => {
    try {
      console.log('🎵 Generating audio for sentence:', sentence.substring(0, 30) + '...');
      console.log('🌍 Target language:', language);
      
      let textToSpeak = sentence;
      const hasProblematicPatterns = /\d+[.,]\d+|%|\d+°C|\d+:\d+|\d+Kč|\d+€|\d+\$|km\/h|AI|API|0W-30|1\.?\s*července|2\.?\s*července|[ěščřžýáíéůú]/i.test(sentence);
      
      if (hasProblematicPatterns) {
        textToSpeak = sanitizeText(sentence);
        console.log('🔧 Applied sanitizeText (same as VoiceButton):', {
          original: sentence.substring(0, 50),
          sanitized: textToSpeak.substring(0, 50)
        });
      }
      
      console.log('🎵 Using elevenLabsService.generateSpeech (same as VoiceButton)');
      const audioBlob = await elevenLabsService.generateSpeech(textToSpeak);
      
      console.log('✅ TTS Success - same path as VoiceButton');
      return audioBlob;
      
    } catch (error) {
      console.error('💥 TTS generation failed:', error);
      
      try {
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
          throw new Error(`Google TTS failed: ${googleResponse.status}`);
        }
        
        return await googleResponse.blob();
      } catch (fallbackError) {
        console.error('💥 Both TTS services failed:', fallbackError);
        throw error;
      }
    }
  };

  // 🎵 VOICE PROCESSING (UNCHANGED)
  const processVoiceResponse = async (responseText, language) => {
    console.log('🎵 Processing voice response - INSTANT MODE:', {
      textLength: responseText.length,
      language: language
    });
    
    try {
      const audioBlob = await generateAudioForSentence(responseText, language);
      await mobileAudioManager.playAudio(audioBlob);
      console.log('✅ Audio playing instantly');
    } catch (error) {
      console.error('❌ Failed to generate audio:', error);
    }
  };

  // 🎤 STT FUNCTIONS (UNCHANGED)
  const startSTTRecording = async () => {
    try {
      console.log('🎤 Starting ElevenLabs STT recording...');
      setIsRecordingSTT(true);
      
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
        
        await processSTTAudio(audioBlob);
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
    }
    
    mobileAudioManager.unlockAudioContext();
    console.log('🔓 Audio unlocked via stop interaction');
  };

  const processSTTAudio = async (audioBlob) => {
    try {
      showNotification('Převádím řeč na text...', 'info');
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // 🔧 Try ElevenLabs STT first (primary)
      let response = await fetch('/api/elevenlabs-stt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: arrayBuffer
      });

      let data;
      let usedService = 'ElevenLabs';

      // 🔧 If ElevenLabs fails, try Google STT as fallback
      if (!response.ok) {
        console.warn('⚠️ ElevenLabs STT failed, trying Google STT fallback...');
        showNotification('Zkouším Google STT...', 'info');
        
        response = await fetch('/api/google-stt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: arrayBuffer
        });
        usedService = 'Google';
      }

      if (!response.ok) {
        throw new Error(`Speech-to-Text failed: HTTP ${response.status}`);
      }

      data = await response.json();
      
      if (data.success && data.text && data.text.trim()) {
        const transcribedText = data.text.trim();
        setInput(transcribedText);
        showNotification(`Text převeden pomocí ${usedService}! Zkontrolujte a odešlete.`, 'success');
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

  // 🔧 UTILITY FUNCTIONS (UNCHANGED)
  const handleNewChat = () => {
    // 🆕 STREAMING: Stop any ongoing streaming
    if (stopStreamingRef) {
      stopStreamingRef();
      setStopStreamingRef(null);
    }
    
    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    
    if (streaming) setStreaming(false);
    if (isListening) setIsListening(false);
    if (isRecordingSTT) stopSTTRecording();
    
    // 🔗 Close sources modal on new chat
    setSourcesModalOpen(false);
    setCurrentSources([]);
    
    sessionManager.clearSession();
    setMessages([]);
    setUserLanguage('cs');
    
    showNotification(t('newChatCreated'), 'success');
  };

  const convertMessagesForOpenAI = (messages) => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || ''
    }));
  };

  // 🆕 VOICE SCREEN OPEN/CLOSE WITH GPT FORCE (UNCHANGED)
  const handleVoiceScreenOpen = () => {
    setShowVoiceScreen(true);
    
    if (model !== 'gpt-4o') {
      console.log('🎤 Voice mode: Auto-switching to GPT for faster responses');
      setPreviousModel(model);
      setModel('gpt-4o');
    }
    
    mobileAudioManager.unlockAudioContext();
  };

  const handleVoiceScreenClose = () => {
    setShowVoiceScreen(false);
    
    if (previousModel && previousModel !== 'gpt-4o') {
      console.log('🔄 Voice closed: Restoring previous model:', previousModel);
      setModel(previousModel);
      setPreviousModel(null);
    }
  };

// 🤖 AI CONVERSATION - WITH STREAMING EFFECT
  const handleSend = async (textInput = input, fromVoice = false) => {
    if (!textInput.trim() || loading) return;
    
    // 🆕 STREAMING: Stop any ongoing streaming
    if (stopStreamingRef) {
      stopStreamingRef();
      setStopStreamingRef(null);
    }
    
    // Scroll to user's message after sending
    setTimeout(() => {
      smartScrollToBottom(mainContentRef.current, {
        behavior: 'smooth',
        force: true,
        delay: 100
      });
    }, 100);

    const detectedLang = detectLanguage(textInput);
    if (detectedLang !== userLanguage) {
      setUserLanguage(detectedLang);
    }

    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    currentAudioRef.current = null;

    if (!fromVoice) setInput('');
    setLoading(true);

    try {
      const userMessage = { sender: 'user', text: textInput };
      const messagesWithUser = [...messages, userMessage];
      setMessages(messagesWithUser);
      sessionManager.saveMessages(messagesWithUser);

      // 🎨 IMAGE GENERATION MODE
      if (isImageMode) {
        console.log('🎨 Image generation mode - calling Imagen API');
        
        try {
          const response = await fetch('/api/imagen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: textInput,
              imageCount: 1
            })
          });

          if (!response.ok) {
            throw new Error(`Image generation failed: HTTP ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success && result.images && result.images.length > 0) {
            const imageMessage = {
              sender: 'bot',
              text: `🎨 Generated image for: "${textInput}"`,
              image: result.images[0], // Contains base64, mimeType, etc.
              isStreaming: false
            };
            
            const finalMessages = [...messagesWithUser, imageMessage];
            setMessages(finalMessages);
            sessionManager.saveMessages(finalMessages);
            
            showNotification('Obrázek byl úspěšně vygenerován! 🎨', 'success');
          } else {
            throw new Error('No images generated');
          }
          
        } catch (imageError) {
          console.error('💥 Image generation error:', imageError);
          
          const errorMessage = {
            sender: 'bot',
            text: `❌ Nepodařilo se vygenerovat obrázek: ${imageError.message}`,
            isStreaming: false
          };
          
          const finalMessages = [...messagesWithUser, errorMessage];
          setMessages(finalMessages);
          sessionManager.saveMessages(finalMessages);
          
          showNotification('Chyba při generování obrázku', 'error');
        }
        
        // Reset to chat mode after image generation
        setIsImageMode(false);
        return;
      }

      let responseText = '';

      if (model === 'claude') {
        let finalText = '';
        let sources = [];
        
        const result = await claudeService.sendMessage(
          messagesWithUser,
          (text, isStreaming) => {
            // 🆕 STREAMING: Don't update messages here, we'll use streaming effect
            finalText = text;
            setStreaming(isStreaming);
          },
          (searchMsg) => showNotification(searchMsg, 'info'),
          detectedLang
        );
        
        finalText = finalText || result.text;
        sources = result.sources || [];
        
        // 🆕 STREAMING: Use streaming effect for final text
        const stopFn = streamMessageWithEffect(
          finalText,
          setMessages,
          messagesWithUser,
          mainContentRef.current,
          sources
        );
        setStopStreamingRef(() => stopFn);
        
        // Save final messages with sources
        const finalMessage = { 
          sender: 'bot', 
          text: finalText,
          sources: sources,
          isStreaming: false
        };
        
        const finalMessages = [...messagesWithUser, finalMessage];
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && finalText) {
          console.log('🎵 Claude complete, instant voice playback...');
          setTimeout(async () => {
            await processVoiceResponse(finalText, detectedLang);
          }, 500);
        }
      }
      else if (model === 'gpt-4o') {
        const openAIMessages = convertMessagesForOpenAI(messagesWithUser);
        
        const response = await openaiService.sendMessage(openAIMessages, detectedLang);
        responseText = (typeof response === 'object' && response.text) ? response.text : response;
        
        // 🆕 STREAMING: Use streaming effect for GPT too
        const stopFn = streamMessageWithEffect(
          responseText,
          setMessages,
          messagesWithUser,
          mainContentRef.current,
          [] // GPT doesn't have sources yet
        );
        setStopStreamingRef(() => stopFn);
        
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: [],
          isStreaming: false
        }];
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 GPT response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }
      else if (model === 'sonar') {
        const searchResult = await sonarService.search(textInput, showNotification, detectedLang);
        responseText = searchResult.success ? searchResult.result : searchResult.message;
        
        // 🆕 STREAMING: Use streaming effect for Sonar too
        const stopFn = streamMessageWithEffect(
          responseText,
          setMessages,
          messagesWithUser,
          mainContentRef.current,
          [] // Sonar doesn't have sources yet
        );
        setStopStreamingRef(() => stopFn);
        
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: [],
          isStreaming: false
        }];
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 Sonar response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }
      else if (model === 'grok-3') {
        let streamingSources = []; // Add this to capture sources during streaming
        
        const result = await grokService.sendMessage(
          messagesWithUser,
          (text, isStreaming, sources = []) => {
            setStreaming(isStreaming);
            if (sources && sources.length > 0) {
              streamingSources = sources; // Capture sources during streaming
            }
          },
          (searchMsg) => showNotification(searchMsg, 'info'),
          detectedLang
        );
        
        responseText = result.text;
        const sources = streamingSources.length > 0 ? streamingSources : (result.sources || []);
        
        console.log('🎯 GROK FINAL SOURCES:', sources);
        
        // 🆕 STREAMING: Use streaming effect for Grok with sources
        const stopFn = streamMessageWithEffect(
          responseText,
          setMessages,
          messagesWithUser,
          mainContentRef.current,
          sources
        );
        setStopStreamingRef(() => stopFn);
        
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: sources,
          isStreaming: false
        }];
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 Grok response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }
      
      else if (model === 'gemini-2.5-flash') {
        let streamingSources = []; // Add this to capture sources during streaming
        
        // 🧠 Smart document filtering logic
        let currentActiveDocs = [...activeDocumentContexts];

        // Update timestamps for mentioned documents
        currentActiveDocs = currentActiveDocs.map(doc => {
          if (textInput.toLowerCase().includes(doc.name.toLowerCase())) {
            return { 
              ...doc, 
              lastAccessedTimestamp: Date.now(), 
              lastAccessedMessageIndex: messagesWithUser.length 
            };
          }
          return doc;
        });

        // Filter out old/irrelevant documents based on time and message count
        currentActiveDocs = currentActiveDocs.filter(doc => {
          const timeSinceUpload = Date.now() - doc.uploadTimestamp;
          const timeSinceLastAccess = Date.now() - doc.lastAccessedTimestamp;
          const messagesSinceUpload = messagesWithUser.length - doc.lastAccessedMessageIndex;
          const messagesSinceLastAccess = messagesWithUser.length - doc.lastAccessedMessageIndex;
          
          // Rule 1: Very recent upload (5 messages OR 10 minutes from upload)
          const isVeryRecentUpload = messagesSinceUpload <= 5 || timeSinceUpload < 10 * 60 * 1000;
          
          // Rule 2: Recently mentioned (7 messages OR 15 minutes since last access)
          const isRecentlyMentioned = messagesSinceLastAccess <= 7 || timeSinceLastAccess < 15 * 60 * 1000;
          
          // Rule 3: Explicit forget command (optional feature)
          const explicitlyForget = textInput.toLowerCase().includes(`zapomeň na ${doc.name.toLowerCase()}`);
          if (explicitlyForget) {
            showNotification(`Zapomínám na dokument "${doc.name}".`, 'info');
            return false;
          }
          
          return isVeryRecentUpload || isRecentlyMentioned;
        });

        // Update the state with filtered documents
        setActiveDocumentContexts(currentActiveDocs);

        // Create filtered document list for AI
        const documentsToPassToGemini = currentActiveDocs.map(doc => ({ 
          geminiFileUri: doc.uri, 
          name: doc.name 
        }));
        
        const result = await geminiService.sendMessage(
          messagesWithUser,
          (text, isStreaming, sources = []) => {
            setStreaming(isStreaming);
            if (sources && sources.length > 0) {
              streamingSources = sources; // Capture sources during streaming
            }
          },
          () => {
            setIsSearching(true);
            setTimeout(() => setIsSearching(false), 3000);
          },
          detectedLang,
          documentsToPassToGemini
        );
        
        responseText = result.text;
        const sources = streamingSources.length > 0 ? streamingSources : (result.sources || []);
        
        console.log('🎯 GEMINI FINAL SOURCES:', sources);
        
        // 🆕 STREAMING: Use streaming effect for Gemini with sources
        const stopFn = streamMessageWithEffect(
          responseText,
          setMessages,
          messagesWithUser,
          mainContentRef.current,
          sources
        );
        setStopStreamingRef(() => stopFn);
        
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: sources,
          isStreaming: false
        }];
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 Gemini response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }

    } catch (err) {
      console.error('💥 API call error:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
      setStreaming(false);
      setIsSearching(false);
    }
  };

  const handleTranscript = async (text, confidence = 1.0) => {
    console.log('🎙️ Voice transcript received:', { text, confidence });
    
    const detectedLang = detectLanguage(text);
    setUserLanguage(detectedLang);
    console.log('🌍 Voice detected language:', detectedLang);
    
    if (showVoiceScreen) {
      await handleSend(text, true);
    } else {
      setInput(text);
    }
  };// 🚀 OMNIA - APP.JSX PART 3/3 - JSX RENDER (REDESIGNED podle fotky)
// ✅ NEW: Single gradient background + fixed top buttons + multilingual welcome
// ✅ NEW: Logo zmizí po první zprávě + clean layout
// 🎯 UNCHANGED: Chat messages, sources, copy buttons - vše stejné

// 📄 UPLOAD ERROR MESSAGES - Multilingual
const getUploadErrorMessages = (language) => {
  const messages = {
    'cs': {
      pdfOnly: 'Podporované formáty: PDF, Word, Text, Obrázky (PNG/JPG)',
      fileTooBig: 'Soubor je příliš velký. Maximum je 15MB.',
      dailyLimit: (remainingMB) => `Překročen denní limit 20MB. Zbývá ${remainingMB}MB do půlnoci.`,
      processing: 'Zpracovávám dokument...',
      preparing: 'Připravuji dokument pro AI...',
      success: 'Dokument je připraven pro AI!'
    },
    'en': {
      pdfOnly: 'Supported formats: PDF, Word, Text, Images (PNG/JPG)',
      fileTooBig: 'File is too large. Maximum is 15MB.',
      dailyLimit: (remainingMB) => `Daily limit of 20MB exceeded. ${remainingMB}MB remaining until midnight.`,
      processing: 'Processing document...',
      preparing: 'Preparing document for AI...',
      success: 'Document is ready for AI!'
    },
    'ro': {
      pdfOnly: 'Formate acceptate: PDF, Word, Text, Imagini (PNG/JPG)',
      fileTooBig: 'Fișierul este prea mare. Maximul este 15MB.',
      dailyLimit: (remainingMB) => `Limita zilnică de 20MB a fost depășită. ${remainingMB}MB rămase până la miezul nopții.`,
      processing: 'Procesez documentul...',
      preparing: 'Pregătesc documentul pentru AI...',
      success: 'Documentul este gata pentru AI!'
    }
  };
  return messages[language] || messages['cs'];
};

const handleDocumentUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const messages = getUploadErrorMessages(userLanguage);
  
  // Check if it's supported format
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/plain', // .txt
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];
  
  if (!supportedTypes.includes(file.type)) {
    showNotification(messages.pdfOnly, 'error');
    return;
  }
  
  // Check file size (15MB limit)
  if (file.size > 15 * 1024 * 1024) {
    showNotification(messages.fileTooBig, 'error');
    return;
  }

  // Check daily upload limit (20MB per device)
  const todayUploaded = JSON.parse(localStorage.getItem('dailyUploads') || '{"date": "", "bytes": 0}');
  const today = new Date().toDateString();

  // Reset if new day
  if (todayUploaded.date !== today) {
    todayUploaded.date = today;
    todayUploaded.bytes = 0;
  }

  // Check if adding this file would exceed daily limit
  if (todayUploaded.bytes + file.size > 20 * 1024 * 1024) {
    const remainingMB = Math.max(0, (20 * 1024 * 1024 - todayUploaded.bytes) / (1024 * 1024)).toFixed(1);
    showNotification(messages.dailyLimit(remainingMB), 'error');
    return;
  }
  
  setLoading(true);
  showNotification(messages.processing, 'info');
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/process-document', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    const result = await response.json();
    
    // Upload to Gemini File API
    showNotification(messages.preparing, 'info');

    const geminiResponse = await fetch('/api/upload-to-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: result.originalPdfUrl,
        originalName: result.originalName
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to upload to Gemini');
    }

    const geminiResult = await geminiResponse.json();

    // Save document reference with Gemini file URI
    const newDoc = {
      id: Date.now(),
      name: result.originalName,
      documentUrl: result.documentUrl,
      originalPdfUrl: result.originalPdfUrl,
      geminiFileUri: geminiResult.fileUri, // DŮLEŽITÉ - URI pro Gemini
      fileName: result.fileName,
      pageCount: result.pageCount,
      preview: result.preview,
      uploadedAt: new Date()
    };

    setUploadedDocuments(prev => [...prev, newDoc]);

    // ✅ Add document to active AI context
    setActiveDocumentContexts(prev => [
      ...prev.filter(d => d.uri !== geminiResult.fileUri), // Prevent duplicates
      {
        uri: geminiResult.fileUri,
        name: result.originalName,
        uploadTimestamp: Date.now(),
        lastAccessedTimestamp: Date.now(),
        lastAccessedMessageIndex: messages.length + 1
      }
    ]);

    // Update daily upload tracking
    todayUploaded.bytes += file.size;
    localStorage.setItem('dailyUploads', JSON.stringify(todayUploaded));

    // Add hidden context message for AI (not visible to user)
    const hiddenContextMessage = {
      sender: 'system',
      text: `📄 Dokument "${result.originalName}" byl úspěšně nahrán (${result.pageCount} stran). AI má plný přístup k dokumentu a může jej analyzovat.`,
      timestamp: new Date(),
      isHidden: true
    };

    // Add to messages context but don't display to user
    setMessages(prev => [...prev, hiddenContextMessage]);
    showNotification(messages.success, 'success');
    
  } catch (error) {
    console.error('Document upload error:', error);
    showNotification(error.message || 'Chyba při zpracování dokumentu', 'error');
  } finally {
    setLoading(false);
  }
};

// 📄 HANDLE SEND WITH DOCUMENTS
const handleSendWithDocuments = async (text, documents) => {
  console.log('📤 Sending with documents:', text, documents);
  
  if (!text.trim() && documents.length === 0) return;
  
  // Add user message to chat immediately (with document info)
  let messageText = text.trim();
  if (documents.length > 0) {
    const docsList = documents.map(doc => `📄 ${doc.name}`).join('\n');
    messageText = messageText 
      ? `${messageText}\n\n${docsList}` 
      : docsList;
  }
  
  const userMessage = {
    sender: 'user',
    text: messageText || '📄 Dokument nahrán',
    timestamp: new Date()
  };
  setMessages(prev => [...prev, userMessage]);
  
  setLoading(true);
  setStreaming(true);
  
  try {
    // Process documents first and collect them
    const processedDocuments = [];
    
    for (const doc of documents) {
      if (doc.file) {
        // Validate file format before processing
        const supportedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'image/png',
          'image/jpeg',
          'image/jpg'
        ];
        
        if (!supportedTypes.includes(doc.file.type)) {
          throw new Error(`Nepodporovaný formát: ${doc.file.name}`);
        }
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', doc.file);
        
        // Process document (similar to handleDocumentUpload)
        const response = await fetch('/api/process-document', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Document processing failed');
        }
        
        const result = await response.json();
        
        // Upload to storage
        const geminiResponse = await fetch('/api/upload-to-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfUrl: result.originalPdfUrl,
            originalName: result.originalName
          })
        });
        
        if (!geminiResponse.ok) {
          throw new Error('Failed to process document');
        }
        
        const geminiResult = await geminiResponse.json();
        
        // Create processed document
        const newDoc = {
          id: Date.now() + Math.random(), // Unique ID
          name: result.originalName,
          documentUrl: result.documentUrl,
          originalPdfUrl: result.originalPdfUrl,
          geminiFileUri: geminiResult.fileUri,
          fileName: result.fileName,
          pageCount: result.pageCount,
          preview: result.preview,
          uploadedAt: new Date()
        };
        
        processedDocuments.push(newDoc);
      }
    }
    
    // Now send to AI with text and the processed documents
    if (text.trim() || processedDocuments.length > 0) {
      
      const detectedLang = detectLanguage(text || 'Dokument');
      setUserLanguage(detectedLang);
      
      // Get current messages for AI
      const currentMessages = [...messages, userMessage];
      
      // Get current uploaded documents (including newly processed ones)
      const allDocuments = [...uploadedDocuments, ...processedDocuments];
      
      // Combine existing and new documents BEFORE sending to AI
      const newActiveDocuments = processedDocuments.map(doc => ({
        uri: doc.geminiFileUri,
        name: doc.name,
        uploadTimestamp: Date.now(),
        lastAccessedTimestamp: Date.now(),
        lastAccessedMessageIndex: currentMessages.length
      }));
      
      const allActiveDocuments = [...activeDocumentContexts, ...newActiveDocuments];
      
      // Send to Gemini with ALL documents (existing + new)
      const result = await geminiService.sendMessage(
        currentMessages.slice(-10),
        (chunk) => {
          updateStreamingMessage(chunk, true);
        },
        (searchMsg) => {
          setIsSearching(true);
          setTimeout(() => setIsSearching(false), 3000);
        },
        detectedLang,
        allActiveDocuments.map(doc => ({ geminiFileUri: doc.uri, name: doc.name }))
      );
      
      // Update uploadedDocuments state AFTER successful AI response
      if (processedDocuments.length > 0) {
        setUploadedDocuments(prev => [...prev, ...processedDocuments]);
        
        // ✅ Add processed documents to active AI context
        setActiveDocumentContexts(prev => {
          const newActiveDocs = processedDocuments.map(doc => ({
            uri: doc.geminiFileUri,
            name: doc.name,
            uploadTimestamp: Date.now(),
            lastAccessedTimestamp: Date.now(),
            lastAccessedMessageIndex: messages.length + 1
          }));
          // Remove duplicates and add new documents
          return [...prev.filter(d => !newActiveDocs.some(nad => nad.uri === d.uri)), ...newActiveDocs];
        });
      }
      
      const currentMessagesWithUser = [...messages, userMessage];
      
      const stopFn = streamMessageWithEffect(
        result.text,
        setMessages,
        currentMessagesWithUser,
        mainContentRef.current,
        result.sources || []
      );
      setStopStreamingRef(() => stopFn);
    }
    
  } catch (error) {
    console.error('Send with documents error:', error);
    const messages = getUploadErrorMessages(userLanguage);
    showNotification(error.message || messages.processing, 'error');
  } finally {
    setLoading(false);
    setStreaming(false);
    // Clear input after sending
    setInput('');
  }
};

// 🎨 JSX RENDER  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: isListening 
        ? 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
        : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif',
      width: '100vw',
      margin: 0,
      padding: 0,
      transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    }}>
      
      {/* 📌 FIXED TOP BUTTONS - VŽDY VIDITELNÉ */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: isMobile ? '60px' : '70px',
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0 1rem' : '0 2rem',
        zIndex: 1000,
      }}>
        
        {/* HAMBURGER BUTTON - vlevo */}
        <button
          onClick={handleSidebarOpen}
          disabled={loading || streaming}
          style={{
            width: isMobile ? 40 : 44,
            height: isMobile ? 40 : 44,
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'white',
            cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: (loading || streaming) ? 0.5 : 1,
            outline: 'none',
            fontSize: isMobile ? '20px' : '24px',
          }}
          onMouseEnter={(e) => {
            if (!loading && !streaming) {
              e.target.style.opacity = '0.7';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !streaming) {
              e.target.style.opacity = '1';
            }
          }}
          title={t('chatHistory')}
        >
          <Menu size={isMobile ? 20 : 24} strokeWidth={2} />
        </button>

        {/* MODEL SELECTOR - uprostřed */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className={`px-4 py-2 rounded-full border-none bg-transparent text-white/90 cursor-pointer 
                       flex items-center gap-1.5 font-medium transition-all duration-200 outline-none
                       hover:bg-white/10 ${isMobile ? 'text-sm' : 'text-base'}`}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{model === 'claude' ? 'o1' : model === 'gpt-4o' ? 'o2' : model === 'sonar' ? 'o3' : model === 'grok-3' ? 'o4' : 'o5'}</span>
            <ChevronDown size={14} strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
          </button>

          {/* MODEL DROPDOWN */}
          {showModelDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              minWidth: '220px',
              maxWidth: '280px',
              borderRadius: '12px',
              backgroundColor: 'rgba(55, 65, 81, 0.95)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              zIndex: 1001,
            }}>
              <button
                onClick={() => { setModel('claude'); setShowModelDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'claude' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (model !== 'claude') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (model !== 'claude') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: '500' }}>Omnia Claude</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o1</span>
              </button>
              
              <button
                onClick={() => { setModel('gpt-4o'); setShowModelDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'gpt-4o' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (model !== 'gpt-4o') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (model !== 'gpt-4o') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: '500' }}>Omnia GPT</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o2</span>
              </button>
              
              <button
                onClick={() => { setModel('sonar'); setShowModelDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'sonar' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (model !== 'sonar') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (model !== 'sonar') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: '500' }}>Omnia Sonar</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o3</span>
              </button>
              
              <button
                onClick={() => { setModel('grok-3'); setShowModelDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'grok-3' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (model !== 'grok-3') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (model !== 'grok-3') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: '500' }}>Omnia X</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o4</span>
              </button>
              
              <button
                onClick={() => { setModel('gemini-2.5-flash'); setShowModelDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'gemini-2.5-flash' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (model !== 'gemini-2.5-flash') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (model !== 'gemini-2.5-flash') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: '500' }}>Omnia G</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o5</span>
              </button>
            </div>
          )}
        </div>

        {/* NEW CHAT BUTTON - vpravo */}
        <button
          onClick={handleNewChat}
          disabled={loading || streaming}
          style={{
            width: isMobile ? 40 : 44,
            height: isMobile ? 40 : 44,
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.9)',
            cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: (loading || streaming) ? 0.5 : 1,
            outline: 'none',
            fontSize: isMobile ? '20px' : '24px',
          }}
          onMouseEnter={(e) => {
            if (!loading && !streaming) {
              e.target.style.opacity = '0.7';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !streaming) {
              e.target.style.opacity = '1';
            }
          }}
          title={t('newChatButton')}
        >
          <MessageCircle size={isMobile ? 20 : 24} strokeWidth={2} />
        </button>
      </div>

      {/* 🎨 MAIN CONTENT AREA */}
      <main 
        ref={mainContentRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          padding: isMobile ? '1rem' : '2rem',
          paddingTop: isMobile ? '80px' : '100px', // Space for fixed header
          paddingBottom: '160px',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          minHeight: messages.length === 0 ? '60vh' : 'auto',
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: messages.length === 0 ? 'center' : 'flex-start'
        }}>
          
          {/* 🎨 WELCOME SCREEN - když nejsou zprávy */}
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isMobile ? '1.5rem' : '2rem',
              marginBottom: '4rem'
            }}>
              
              {/* OMNIA LOGO */}
              <div className="drop-shadow-2xl shadow-white/20">
                <OmniaLogo 
                  size={isMobile ? 80 : 100} 
                  animate={streaming || loading}
                  isListening={isListening || isRecordingSTT}
                  shouldHide={false}
                />
              </div>
              
              {/* 🌍 MULTILINGUAL WELCOME TEXT */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <h1 className="text-shadow-lg shadow-white/30 drop-shadow-lg" style={{ 
                  fontSize: isMobile ? '2rem' : '2.5rem', 
                  fontWeight: '700', 
                  margin: 0, 
                  color: '#ffffff',
                  letterSpacing: '0.02em'
                }}>
                  {welcomeTexts[uiLanguage]?.hello || welcomeTexts.cs.hello}
                </h1>
                
                <p className="text-shadow shadow-white/20 drop-shadow" style={{
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '400',
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.01em'
                }}>
                  {welcomeTexts[uiLanguage]?.subtitle || welcomeTexts.cs.subtitle}
                </p>
              </div>
            </div>
          )}

          {/* 💬 CHAT MESSAGES - UNCHANGED styling */}
          {messages.filter(msg => !msg.isHidden).map((msg, idx) => (
            <div key={idx} data-sender={msg.sender} style={{
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
                  lineHeight: isMobile ? '1.3' : '1.6', 
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {msg.text}
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  padding: '0',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingLeft: '0',
                  paddingRight: '0',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: isMobile ? '1.3' : '1.6',
                  whiteSpace: 'pre-wrap',
                  color: msg.isStreaming ? '#F0F8FF' : '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.7, 
                    marginBottom: '0.8rem',
                    display: 'flex', 
                    alignItems: 'center', 
                    paddingBottom: '0.6rem'
                  }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#a0aec0', 
                      display: 'flex', 
                      alignItems: 'center' 
                    }}>
                      <ChatOmniaLogo size={18} />
                      Omnia {msg.isStreaming ? ' • streaming' : ''}
                    </span>
                  </div>
                  
                  {/* 🎨 GENERATED IMAGE - Display if message contains image */}
                  {msg.image && (
                    <div style={{
                      marginTop: '1rem',
                      marginBottom: '1rem',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      maxWidth: '100%'
                    }}>
                      <img 
                        src={`data:${msg.image.mimeType};base64,${msg.image.base64}`}
                        alt={`Generated image for: ${msg.text}`}
                        onClick={() => {
                          // Create a temporary link to open image in new tab/native viewer
                          const link = document.createElement('a');
                          link.href = `data:${msg.image.mimeType};base64,${msg.image.base64}`;
                          link.download = `omnia-image-${Date.now()}.png`;
                          link.target = '_blank';
                          
                          // For iOS, this opens in native viewer
                          if (isMobile) {
                            window.open(link.href, '_blank');
                          } else {
                            // For desktop, download the image
                            link.click();
                          }
                        }}
                        style={{
                          maxWidth: isMobile ? '280px' : '400px',
                          width: '100%',
                          height: 'auto',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                        onLoad={() => {
                          // Scroll to show the generated image
                          setTimeout(() => {
                            smartScrollToBottom(mainContentRef.current, {
                              behavior: 'smooth',
                              force: true
                            });
                          }, 100);
                        }}
                      />
                      {msg.image.enhancedPrompt && msg.image.enhancedPrompt !== msg.text && (
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontStyle: 'italic'
                        }}>
                          Enhanced prompt: {msg.image.enhancedPrompt}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <ReactMarkdown 
                    components={{
                      // Vlastní styly pro různé elementy
                      strong: ({children}) => <strong style={{color: '#FFD700', fontWeight: '600'}}>{children}</strong>,
                      ul: ({children}) => (
                        <ul style={{
                          marginLeft: isMobile ? '10px' : '20px',
                          marginTop: '8px',
                          marginBottom: '8px',
                          paddingLeft: isMobile ? '15px' : '20px'
                        }}>
                          {children}
                        </ul>
                      ),
                      ol: ({children}) => (
                        <ol style={{
                          marginLeft: isMobile ? '10px' : '20px',
                          marginTop: '8px',
                          marginBottom: '8px',
                          paddingLeft: isMobile ? '15px' : '20px'
                        }}>
                          {children}
                        </ol>
                      ),
                      li: ({children}) => (
                        <li style={{
                          marginBottom: isMobile ? '6px' : '8px',
                          marginLeft: '0',
                          paddingLeft: '0',
                          listStyleType: 'disc',
                          listStylePosition: 'inside',
                          lineHeight: '1.5',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {children}
                        </li>
                      ),
                      code: ({inline, children}) => 
                        inline ? (
                          <code style={{
                            background: 'rgba(255, 255, 255, 0.1)', 
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                            display: 'inline-block'
                          }}>
                            {children}
                          </code>
                        ) : (
                          <pre style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: isMobile ? '12px' : '16px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            overflowY: 'visible',
                            margin: isMobile ? '12px 0' : '12px -1.6rem',
                            fontSize: isMobile ? '14px' : '14px',
                            lineHeight: '1.5',
                            WebkitOverflowScrolling: 'touch',
                            width: isMobile ? '100%' : 'calc(100% + 3.2rem)',
                            maxWidth: '100%',
                            position: 'relative',
                            left: '0'
                          }}>
                            <code style={{ 
                              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                              whiteSpace: 'pre',
                              display: 'block',
                              color: '#e0e0e0',
                              fontSize: 'inherit'
                            }}>
                              {children}
                            </code>
                          </pre>
                        ),
                      p: ({children}) => <p style={{margin: '6px 0', lineHeight: isMobile ? '1.3' : '1.6'}}>{children}</p>,
                      h1: ({children}) => <h1 style={{fontSize: '1.4em', fontWeight: '600', margin: '16px 0 8px 0', color: '#FFD700'}}>{children}</h1>,
                      h2: ({children}) => <h2 style={{fontSize: '1.2em', fontWeight: '600', margin: '12px 0 6px 0', color: '#FFD700'}}>{children}</h2>,
                      h3: ({children}) => <h3 style={{fontSize: '1.1em', fontWeight: '600', margin: '10px 0 5px 0', color: '#FFD700'}}>{children}</h3>,
                      em: ({children}) => <em style={{fontStyle: 'italic', color: '#E0E0E0'}}>{children}</em>,
                      a: ({href, children}) => (
                        <a href={href} style={{color: '#00ffff', textDecoration: 'underline'}} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      blockquote: ({children}) => (
                        <blockquote style={{
                          borderLeft: '3px solid rgba(255, 255, 255, 0.3)', 
                          paddingLeft: '12px', 
                          marginLeft: '0', 
                          marginTop: '8px', 
                          marginBottom: '8px', 
                          opacity: '0.9'
                        }}>
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {msg.text || ''}
                  </ReactMarkdown>
                  
                  {/* 🔘 ACTION BUTTONS - Moved below message */}
                  {!msg.isStreaming && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      marginTop: '1rem',
                      paddingTop: '0.8rem',
                      justifyContent: 'flex-start'
                    }}>
                      <SourcesButton 
                        sources={msg.sources || []}
                        onClick={() => handleSourcesClick(msg.sources || [])}
                        language={detectLanguage(msg.text)}
                      />
                      <VoiceButton 
                        text={msg.text} 
                        onAudioStart={() => setIsAudioPlaying(true)}
                        onAudioEnd={() => setIsAudioPlaying(false)}
                      />
                      <CopyButton text={msg.text} language={detectLanguage(msg.text)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* ⏳ LOADING INDICATOR - UNCHANGED */}
          {(loading || streaming) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-start', 
              marginBottom: '2rem', 
              animation: 'fadeInUp 0.4s ease-out',
              width: '100%'
            }}>
              <div style={{
                width: '100%',
                padding: isMobile ? '1.2rem' : '1.6rem',
                paddingLeft: isMobile ? '1rem' : '1.2rem',
                fontSize: isMobile ? '1rem' : '0.95rem', 
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid #00ffff',
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ 
                    color: streaming ? '#00ffff' : '#a0aec0', 
                    fontWeight: '500' 
                  }}>
                    {streaming ? (
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ 
                          animation: 'pulse 1.4s ease-in-out infinite',
                          fontSize: '24px',
                          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
                        }}>●</span>
                        <span style={{ 
                          animation: 'pulse 1.4s ease-in-out 0.2s infinite',
                          fontSize: '24px',
                          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
                        }}>●</span>
                        <span style={{ 
                          animation: 'pulse 1.4s ease-in-out 0.4s infinite',
                          fontSize: '24px',
                          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
                        }}>●</span>
                      </span>
                    ) : (isSearching ? t('searching') : t('thinking'))}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      {/* 📝 INPUT BAR - WITHOUT model prop */}
      <InputBar
        input={input}
        setInput={setInput}
        onSend={() => handleSend()}
        onSTT={toggleSTT}
        onVoiceScreen={handleVoiceScreenOpen}
        onImageGenerate={() => setIsImageMode(prev => !prev)}
        onDocumentUpload={handleDocumentUpload}
        onSendWithDocuments={handleSendWithDocuments}
        isLoading={loading || streaming}
        isRecording={isRecordingSTT}
        isAudioPlaying={isAudioPlaying}
        isImageMode={isImageMode}
        uiLanguage={uiLanguage}
      />

      {/* 📋 CHAT SIDEBAR - NEW! */}
      <ChatSidebar
        isOpen={showChatSidebar}
        onClose={handleSidebarClose}
        onNewChat={handleSidebarNewChat}
        uiLanguage={uiLanguage}
        setUILanguage={setUILanguage}
        chatHistory={[]} // TODO: Implement chat history
        onSelectChat={(chatId) => console.log('Select chat:', chatId)}
        currentChatId={null}
      />

      {/* 🎤 VOICE SCREEN - UNCHANGED */}
      <VoiceScreen 
        isOpen={showVoiceScreen}
        onClose={handleVoiceScreenClose}
        onTranscript={handleTranscript}
        isLoading={loading}
        isAudioPlaying={isAudioPlaying || mobileAudioManager.isPlaying}
        uiLanguage={uiLanguage}
        messages={messages}
        audioManager={mobileAudioManager}
      />

      {/* 🔗 SOURCES MODAL - UNCHANGED */}
      <SourcesModal 
        isOpen={sourcesModalOpen}
        onClose={handleSourcesModalClose}
        sources={currentSources}
        language={uiLanguage}
      />

      {/* 🎨 STYLES - UNCHANGED + nové animace */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; }
        body { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important; }
        #root { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; display: flex; flex-direction: column; }
        body > * { margin: 0 !important; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px) translateZ(0); } 100% { opacity: 1; transform: translateY(0) translateZ(0); } }
        @keyframes omnia-pulse { 0%, 100% { box-shadow: 0 0 15px rgba(100, 50, 255, 0.8); transform: scale(1) translateZ(0); } 50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.9); transform: scale(1.05) translateZ(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
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