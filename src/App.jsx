// 🚀 OMNIA - APP.JSX PART 1/3 - IMPORTS + STATE + EFFECTS (REDESIGNED)
// ✅ ADDED: ChatSidebar + NewChatButton imports
// ✅ ADDED: welcomeTexts for multilingual welcome
// ✅ SIMPLIFIED: Removed complex scroll system
// 🎯 UNCHANGED: Všechny původní importy a funkčnost

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// 🔧 IMPORT SERVICES (UNCHANGED)
import claudeService from './services/claude.service.js';
import openaiService from './services/openai.service.js';
import sonarService from './services/sonar.service.js';
import elevenLabsService from './services/elevenLabs.service.js';

// 🔧 IMPORT UTILS (UNCHANGED)
import { uiTexts, getTranslation } from './utils/translations.js';
import sessionManager from './utils/sessionManager.js';
import detectLanguage from './utils/smartLanguageDetection.js';
import sanitizeText, { cleanMarkdownForUI } from './utils/sanitizeText.js';

// 🔧 IMPORT UI COMPONENTS (UNCHANGED + NEW)
import SettingsDropdown from './components/ui/SettingsDropdown.jsx';
import { OmniaLogo, MiniOmniaLogo, ChatOmniaLogo } from './components/ui/OmniaLogos.jsx';
import TypewriterText from './components/ui/TypewriterText.jsx';
import VoiceButton from './components/ui/VoiceButton.jsx';
import CopyButton from './components/ui/CopyButton.jsx';
import VoiceScreen from './components/voice/VoiceScreen.jsx';

// 🆕 IMPORT INPUT BAR (UNCHANGED)
import InputBar from './components/input/InputBar.jsx';

// 🔗 IMPORT SOURCES COMPONENTS (UNCHANGED)
import { SourcesButton, SourcesModal } from './components/sources';

// 🆕 NEW COMPONENTS - Added for redesign
import ChatSidebar from './components/ui/ChatSidebar.jsx';

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
      
      const silentAudio = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmY1OC4yOS4xMAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xAAIAAIAGAAAAABJbmZvAAAADwAAAAMAABqyAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAA5TEFNRTMuOTlyAc0AAAAAAAAAABUgJAUHQQAB4AAAAbIqPqsqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xDsAAAGkAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
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
  const [model, setModel] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
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
  
  // 📱 DEVICE STATE (UNCHANGED)
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const sttRecorderRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const isMobile = window.innerWidth <= 768;
  const t = getTranslation(uiLanguage);

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

// 🔧 NOTIFICATION SYSTEM (UNCHANGED)
  const showNotification = (message, type = 'info', onClick = null) => {
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
      
      const response = await fetch('/api/elevenlabs-stt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: arrayBuffer
      });

      if (!response.ok) {
        throw new Error(`Speech-to-Text failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.text && data.text.trim()) {
        const transcribedText = data.text.trim();
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

  // 🔧 UTILITY FUNCTIONS (UNCHANGED)
  const handleNewChat = () => {
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

// 🤖 AI CONVERSATION - CLEAN WITHOUT formatClaudeResponse() + SOURCES INTEGRATION (UNCHANGED)
  const handleSend = async (textInput = input, fromVoice = false) => {
    if (!textInput.trim() || loading) return;
    
    // Reset user scrolling flag when sending message
    // REMOVED - no more user scrolling detection
    
    // Scroll to user's message after sending
    setTimeout(() => {
      const userMessages = document.querySelectorAll('[data-sender="user"]');
      const lastUserMessage = userMessages[userMessages.length - 1];
      if (lastUserMessage) {
        lastUserMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

      let responseText = '';

      if (model === 'claude') {
        let streamedText = '';
        
        const result = await claudeService.sendMessage(
          messagesWithUser,
          (text, isStreaming) => {
            streamedText = text;
            const streamingMessages = [
              ...messagesWithUser,
              { sender: 'bot', text: text, isStreaming: true }
            ];
            setMessages(streamingMessages);
            setStreaming(isStreaming);
          },
          (searchMsg) => showNotification(searchMsg, 'info'),
          detectedLang
        );
        
        const finalText = streamedText || result.text;
        
        // 🔗 SOURCES INTEGRATION - Add sources to message
        const finalMessage = { 
          sender: 'bot', 
          text: finalText,
          sources: result.sources || []
        };
        
        console.log('🔗 Claude response with sources:', {
          textLength: finalText.length,
          sourcesCount: (result.sources || []).length,
          sources: result.sources
        });
        
        const finalMessages = [...messagesWithUser, finalMessage];
        setMessages(finalMessages);
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
        
        // 🔗 GPT doesn't have sources yet - add empty array
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: []
        }];
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 GPT response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }
      else if (model === 'sonar') {
        const searchResult = await sonarService.search(textInput, showNotification, detectedLang);
        responseText = searchResult.success ? searchResult.result : searchResult.message;
        
        // 🔗 Sonar doesn't have sources yet - add empty array
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: []
        }];
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 Sonar response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }

    } catch (err) {
      console.error('💥 API call error:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
      setStreaming(false);
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

// 🎨 JSX RENDER
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: isListening 
        ? 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
        : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif',
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
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
          title="Chat History & Settings"
        >
          ≡
        </button>

        {/* MODEL SELECTOR - uprostřed */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span>{model === 'claude' ? 'o1' : model === 'gpt-4o' ? 'o2' : 'o3'}</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>▼</span>
          </button>

          {/* MODEL DROPDOWN */}
          {showModelDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              background: 'rgba(26, 32, 44, 0.95)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: '180px',
              overflow: 'hidden',
              zIndex: 1001,
            }}>
              <button
                onClick={() => { setModel('claude'); setShowModelDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'claude' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.target.style.background = model === 'claude' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
              >
                <span>Omnia Claude</span>
                <span style={{ opacity: 0.6, fontSize: '12px' }}>o1</span>
              </button>
              
              <button
                onClick={() => { setModel('gpt-4o'); setShowModelDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'gpt-4o' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.target.style.background = model === 'gpt-4o' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
              >
                <span>Omnia GPT</span>
                <span style={{ opacity: 0.6, fontSize: '12px' }}>o2</span>
              </button>
              
              <button
                onClick={() => { setModel('sonar'); setShowModelDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: model === 'sonar' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.target.style.background = model === 'sonar' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
              >
                <span>Omnia Sonar</span>
                <span style={{ opacity: 0.6, fontSize: '12px' }}>o3</span>
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
          title="New Chat"
        >
          💬
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
          paddingBottom: '240px',
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
              <OmniaLogo 
                size={isMobile ? 120 : 160} 
                animate={streaming || loading}
                isListening={isListening || isRecordingSTT}
                shouldHide={false}
              />
              
              {/* 🌍 MULTILINGUAL WELCOME TEXT */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <h1 style={{ 
                  fontSize: isMobile ? '3rem' : '4rem', 
                  fontWeight: '700', 
                  margin: 0, 
                  color: '#ffffff',
                  letterSpacing: '0.02em'
                }}>
                  {welcomeTexts[uiLanguage]?.hello || welcomeTexts.cs.hello}
                </h1>
                
                <p style={{
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
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
          {messages.map((msg, idx) => (
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
                  lineHeight: '1.6', 
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {msg.text}
                </div>
              ) : (
                <div style={{
                  padding: isMobile ? '1.2rem' : '1.6rem',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: msg.isStreaming ? '#F0F8FF' : '#FFFFFF',
                  borderLeft: isMobile ? 'none' : `3px solid ${msg.isStreaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                  paddingLeft: '1.8rem',
                  textAlign: 'left',
                  marginBottom: '2rem'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.7, 
                    marginBottom: '0.8rem',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingBottom: '0.6rem', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
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
                    {!msg.isStreaming && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {/* 🔗 SOURCES BUTTON - UNCHANGED */}
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
                  
                  <TypewriterText 
                    text={cleanMarkdownForUI(typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text || ''))} 
                    isStreaming={msg.isStreaming}
                  />
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
              animation: 'fadeInUp 0.4s ease-out'
            }}>
              <div style={{
                padding: isMobile ? '1.2rem' : '1.6rem',
                fontSize: isMobile ? '1rem' : '0.95rem', 
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: isMobile ? 'none' : `3px solid ${streaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                borderRadius: '0 12px 12px 0',
                paddingLeft: '1.8rem', 
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
                    {streaming ? t('omniaStreaming') : t('omniaPreparingResponse')}
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
        isLoading={loading || streaming}
        isRecording={isRecordingSTT}
        isAudioPlaying={isAudioPlaying}
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