// 🚀 OMNIA - APP.JSX PART 1/3 - IMPORTS + STATE + EFFECTS (REDESIGNED)
// ✅ ADDED: ChatSidebar + NewChatButton imports
// ✅ ADDED: welcomeTexts for multilingual welcome
// ✅ SIMPLIFIED: Removed complex scroll system
// 🎯 UNCHANGED: Všechny původní importy a funkčnost
// 🆕 STREAMING: Added streamingUtils import

import React, { useState, useRef, useEffect } from 'react';
import { Menu, MessageSquare, Sun, Moon, Plus, Globe, Mic, Brain, Settings } from 'lucide-react';
import './App.css';
import { ThemeProvider, useTheme } from './contexts';

// 🔧 IMPORT SERVICES (MODULAR)
import { claudeService, openaiService, sonarService } from './services/ai';
import { elevenLabsService } from './services/voice';

// 🔧 IMPORT UTILS (MODULAR + STREAMING)
import { uiTexts, getTranslation, detectLanguage, sanitizeText, cleanMarkdownForUI } from './utils/text';
import { sessionManager } from './services/storage';
import { streamMessageWithEffect, smartScrollToBottom } from './utils/ui'; // 🆕 STREAMING

// 🔧 IMPORT UI COMPONENTS (MODULAR)
import { SettingsDropdown, OmniaLogo, MiniOmniaLogo, ChatOmniaLogo, TypewriterText, VoiceButton, CopyButton } from './components/ui';
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

function AppContent() {
  const { isDark, toggleTheme } = useTheme();
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
  
  // 🆕 STREAMING STATE - For controlling streaming effect
  const [stopStreamingRef, setStopStreamingRef] = useState(null);
  
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
// 🆕 STREAMING: Modified Claude message handling with streaming effect

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
          sources: sources
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
          sources: []
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
          sources: []
        }];
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
    <div className={`
      fixed inset-0 w-screen h-screen flex flex-col text-white font-inter overflow-hidden
      transition-all duration-500 ease-out
      ${isListening 
        ? 'bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-400' 
        : isDark 
          ? 'dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-slate-800'
          : 'bg-gradient-to-br from-blue-950 via-omnia-700 to-omnia-500'
      }
    `}>
      
      {/* 📌 FIXED TOP BUTTONS - VŽDY VIDITELNÉ */}
      <div className={`
        fixed top-0 left-0 right-0 z-50
        ${isMobile ? 'h-15' : 'h-18'}
        bg-black/10 dark:bg-black/20 backdrop-blur-lg 
        border-b border-white/10 dark:border-white/5
        flex justify-between items-center
        ${isMobile ? 'px-4' : 'px-8'}
      `}>
        
        {/* HAMBURGER BUTTON - vlevo */}
        <button
          onClick={handleSidebarOpen}
          disabled={loading || streaming}
          className={`
            ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
            rounded-xl border-none bg-transparent text-white
            ${(loading || streaming) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-70'}
            flex items-center justify-center
            transition-all duration-300 ease-out
            focus:outline-none
          `}
          title="Chat History & Settings"
        >
          <Menu className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
        </button>

        {/* THEME TOGGLE BUTTON */}
        <button
          onClick={toggleTheme}
          className={`
            ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
            rounded-xl border-none bg-transparent text-white
            cursor-pointer hover:opacity-70
            flex items-center justify-center
            transition-all duration-300 ease-out
            focus:outline-none
          `}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} /> : <Moon className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />}
        </button>

        {/* MODEL SELECTOR - uprostřed */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className={`
              px-4 py-2 rounded-full border-none bg-transparent text-white/90
              cursor-pointer flex items-center gap-1.5
              ${isMobile ? 'text-sm' : 'text-base'}
              font-medium transition-all duration-200 ease-out
              hover:bg-white/10 focus:outline-none
            `}
          >
            <span>{model === 'claude' ? 'o1' : model === 'gpt-4o' ? 'o2' : 'o3'}</span>
            <span className="text-xs opacity-80">▼</span>
          </button>

          {/* MODEL DROPDOWN */}
          {showModelDropdown && (
            <div className="
              absolute top-full left-1/2 transform -translate-x-1/2 mt-2
              bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl 
              border border-white/10 dark:border-white/5
              shadow-2xl min-w-[180px] overflow-hidden z-50
            ">
              <button
                onClick={() => { setModel('claude'); setShowModelDropdown(false); }}
                className={`
                  w-full px-4 py-3 border-none cursor-pointer
                  flex items-center justify-between text-sm
                  text-white/90 transition-colors duration-200
                  ${model === 'claude' ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}
                `}
              >
                <span>Omnia Claude</span>
                <span className="opacity-60 text-xs">o1</span>
              </button>
              
              <button
                onClick={() => { setModel('gpt-4o'); setShowModelDropdown(false); }}
                className={`
                  w-full px-4 py-3 border-none cursor-pointer
                  flex items-center justify-between text-sm
                  text-white/90 transition-colors duration-200
                  ${model === 'gpt-4o' ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}
                `}
              >
                <span>Omnia GPT</span>
                <span className="opacity-60 text-xs">o2</span>
              </button>
              
              <button
                onClick={() => { setModel('sonar'); setShowModelDropdown(false); }}
                className={`
                  w-full px-4 py-3 border-none cursor-pointer
                  flex items-center justify-between text-sm
                  text-white/90 transition-colors duration-200
                  ${model === 'sonar' ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}
                `}
              >
                <span>Omnia Sonar</span>
                <span className="opacity-60 text-xs">o3</span>
              </button>
            </div>
          )}
        </div>

        {/* NEW CHAT BUTTON - vpravo */}
        <button
          onClick={handleNewChat}
          disabled={loading || streaming}
          className={`
            ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
            rounded-xl border-none bg-transparent text-white/90
            ${(loading || streaming) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-70'}
            flex items-center justify-center
            transition-all duration-300 ease-out
            focus:outline-none
          `}
          title="New Chat"
        >
          <MessageSquare className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
        </button>
      </div>

      {/* 🎨 MAIN CONTENT AREA */}
      <main 
        ref={mainContentRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden w-full
          ${isMobile ? 'p-4 pt-20' : 'p-8 pt-24'}
          pb-60 scroll-smooth
        `}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={`
          max-w-4xl mx-auto flex flex-col
          ${messages.length === 0 ? 'min-h-[60vh] justify-center' : 'justify-start'}
        `}>
          
          {/* 🎨 WELCOME SCREEN - když nejsou zprávy */}
          {messages.length === 0 && (
            <div className={`
              text-center flex flex-col items-center mb-16
              ${isMobile ? 'gap-6' : 'gap-8'}
            `}>
              
              {/* OMNIA LOGO */}
              <OmniaLogo 
                size={isMobile ? 120 : 160} 
                animate={streaming || loading}
                isListening={isListening || isRecordingSTT}
                shouldHide={false}
              />
              
              {/* 🌍 MULTILINGUAL WELCOME TEXT */}
              <div className="flex flex-col items-center gap-4">
                <h1 className={`
                  ${isMobile ? 'text-5xl' : 'text-6xl'}
                  font-bold text-white tracking-wide m-0
                `}>
                  {welcomeTexts[uiLanguage]?.hello || welcomeTexts.cs.hello}
                </h1>
                
                <p className={`
                  ${isMobile ? 'text-xl' : 'text-2xl'}
                  font-normal text-white/80 tracking-wide m-0
                `}>
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;