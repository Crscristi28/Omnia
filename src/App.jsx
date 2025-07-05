// 📱 App.jsx - KOMPLETNÍ NOVÁ VERZE - ČÁST 1/3
// ✅ FIXED: openai.service.js response format handling { text, sources }
// 🔧 Complete rebuild with all original functionality + fixes
// 🎯 ~1000 lines total, same as original but with GPT Enhanced fixes

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { detectLanguage } from './utils/smartLanguageDetection.js';
import { sessionManager } from './utils/sessionManager.js';
import { translations } from './utils/translations.js';
import claudeService from './services/claude.service.js';
import openaiService from './services/openai.service.js';
import sonarService from './services/sonar.service.js';
import OmniaLogos from './components/OmniaLogos.jsx';
import VoiceButton from './components/VoiceButton.jsx';
import TypewriterText from './components/TypewriterText.jsx';
import VoiceScreen from './components/VoiceScreen.jsx';
import { SimpleVoiceRecorder } from './components/SimpleVoiceRecorder.jsx';
import { mobileAudioManager } from './utils/mobileAudioManager.js';

function App() {
  // 🎯 CORE CHAT STATE
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [userLanguage, setUserLanguage] = useState('cs');
  const [model, setModel] = useState('claude');
  const [lastUserMessage, setLastUserMessage] = useState('');
  
  // 🎵 VOICE & AUDIO STATE
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentVoiceMessage, setCurrentVoiceMessage] = useState('');
  const [voiceSessionActive, setVoiceSessionActive] = useState(false);
  const [voiceConversationHistory, setVoiceConversationHistory] = useState([]);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  
  // 🎨 UI STATE
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const [deepSearchQuery, setDeepSearchQuery] = useState('');
  const [deepSearchResults, setDeepSearchResults] = useState([]);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [selectedMessageSources, setSelectedMessageSources] = useState([]);
  
  // 📱 MOBILE & RESPONSIVE STATE
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  
  // 🔧 PERFORMANCE STATE
  const [messageLoadingStates, setMessageLoadingStates] = useState({});
  const [retryAttempts, setRetryAttempts] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [apiUsageStats, setApiUsageStats] = useState({
    claude: 0,
    gpt: 0,
    sonar: 0,
    totalTokens: 0
  });
  
  // 📁 REFS
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentAudioRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const deepSearchRef = useRef(null);
  const retryTimeoutsRef = useRef({});
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  
  // 🔄 UTILITY FUNCTIONS
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  const scrollToBottomInstant = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 🔔 NOTIFICATION SYSTEM
  const showNotification = useCallback((message, type = 'info', action = null, duration = 4000) => {
    if (!showNotifications) return;
    
    const id = generateId();
    const notification = { 
      id, 
      message, 
      type, 
      action, 
      timestamp: Date.now(),
      duration 
    };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, [showNotifications]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 🌍 MESSAGE CONVERSION UTILITIES
  const convertMessagesForOpenAI = useCallback((omniaMessages) => {
    return omniaMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      name: msg.sender === 'user' ? undefined : model
    }));
  }, [model]);

  const convertMessagesForClaude = useCallback((omniaMessages) => {
    return omniaMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  }, []);

  const formatMessageForVoice = useCallback((text, language) => {
    // Format text specifically for voice output
    let formattedText = text;
    
    // Add pauses for better speech flow
    formattedText = formattedText.replace(/\. /g, '. ... ');
    formattedText = formattedText.replace(/! /g, '! ... ');
    formattedText = formattedText.replace(/\? /g, '? ... ');
    
    return formattedText;
  }, []);

  // 📊 SESSION MANAGEMENT
  const saveSession = useCallback(() => {
    try {
      sessionManager.saveMessages(messages);
      sessionManager.saveUserPreferences({
        language: userLanguage,
        model: model,
        showNotifications: showNotifications
      });
    } catch (error) {
      console.error('💾 Session save error:', error);
    }
  }, [messages, userLanguage, model, showNotifications]);

  const loadSession = useCallback(() => {
    try {
      const savedMessages = sessionManager.loadMessages();
      const savedPreferences = sessionManager.loadUserPreferences();
      
      if (savedMessages && savedMessages.length > 0) {
        setMessages(savedMessages);
      }
      
      if (savedPreferences) {
        if (savedPreferences.language) setUserLanguage(savedPreferences.language);
        if (savedPreferences.model) setModel(savedPreferences.model);
        if (typeof savedPreferences.showNotifications === 'boolean') {
          setShowNotifications(savedPreferences.showNotifications);
        }
      }
    } catch (error) {
      console.error('💾 Session load error:', error);
    }
  }, []);

  // 🎵 AUDIO CONTEXT MANAGEMENT
  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        // Unlock audio context on mobile
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.warn('🔊 Audio context initialization failed:', error);
      }
    }
  }, []);

  const cleanupAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
      gainNodeRef.current = null;
    }
  }, []);

  // 📱 RESPONSIVE HANDLERS
  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth;
    setScreenWidth(newWidth);
    setIsMobile(newWidth < 768);
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // App going to background
      saveSession();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    } else {
      // App coming to foreground
      loadSession();
    }
  }, [saveSession, loadSession]);

  // 🔄 MAIN USEEFFECT HOOKS
  useEffect(() => {
    loadSession();
    initializeAudioContext();
    
    const handleKeyboardResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      setKeyboardHeight(Math.max(0, windowHeight - viewportHeight));
    };

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleKeyboardResize);
    }

    // Initial setup
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleKeyboardResize);
      }
      
      cleanupAudioContext();
      
      // Clear any pending timeouts
      Object.values(retryTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [handleResize, handleVisibilityChange, loadSession, initializeAudioContext, cleanupAudioContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    saveSession();
  }, [messages, userLanguage, model, saveSession]);

  useEffect(() => {
    // Auto-focus input on desktop
    if (!isMobile && inputRef.current && !showVoiceScreen) {
      inputRef.current.focus();
    }
  }, [isMobile, showVoiceScreen, loading]);

  // 🔧 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      mobileAudioManager.stop();
      clearAllNotifications();
    };
  }, [clearAllNotifications]);// 🎵 VOICE PROCESSING FUNCTIONS
  const processVoiceResponse = useCallback(async (text, language, messageId = null) => {
    try {
      console.log('🎵 Processing voice response:', text.substring(0, 50) + '...');
      
      setIsProcessingAudio(true);
      
      // Format text for better voice output
      const formattedText = formatMessageForVoice(text, language);
      
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: formattedText, 
          language,
          optimize_streaming_latency: 3,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Initialize audio context if needed
      await initializeAudioContext();
      
      // Use mobile audio manager for iOS compatibility
      await mobileAudioManager.play(audioUrl);
      setIsAudioPlaying(true);
      
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      // Connect to audio context for better control
      if (audioContextRef.current && gainNodeRef.current) {
        try {
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(gainNodeRef.current);
        } catch (audioContextError) {
          console.warn('🔊 Audio context connection failed:', audioContextError);
        }
      }
      
      audio.onended = () => {
        setIsAudioPlaying(false);
        setIsProcessingAudio(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        
        // Process next audio in queue if available
        if (audioQueue.length > 0) {
          const nextAudio = audioQueue.shift();
          setAudioQueue(prev => prev.slice(1));
          processVoiceResponse(nextAudio.text, nextAudio.language, nextAudio.messageId);
        }
      };

      audio.onerror = (error) => {
        console.error('🔊 Audio playback error:', error);
        setIsAudioPlaying(false);
        setIsProcessingAudio(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        showNotification('Chyba při přehrávání zvuku', 'error');
      };

      // Start playback
      try {
        await audio.play();
      } catch (playError) {
        console.error('🔊 Audio play error:', playError);
        showNotification('Nelze přehrát zvuk. Zkuste kliknout na stránku a zkusit znovu.', 'warning');
      }

    } catch (error) {
      console.error('🔊 Voice processing error:', error);
      setIsAudioPlaying(false);
      setIsProcessingAudio(false);
      showNotification(`Chyba při zpracování hlasu: ${error.message}`, 'error');
    }
  }, [formatMessageForVoice, initializeAudioContext, audioQueue, showNotification]);

  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    setIsProcessingAudio(false);
    setAudioQueue([]);
  }, []);

  // 🎤 VOICE INPUT HANDLERS
  const handleVoiceInput = useCallback(async (audioBlob) => {
    try {
      setLoading(true);
      console.log('🎤 Processing voice input...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/elevenlabs-stt', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`STT failed: ${response.status}`);
      }

      const data = await response.json();
      const transcribedText = data.text?.trim();

      if (transcribedText) {
        console.log('✅ Transcription successful:', transcribedText);
        setLastUserMessage(transcribedText);
        await handleSend(transcribedText, true);
      } else {
        showNotification('Nepodařilo se rozpoznat řeč. Zkuste to znovu.', 'warning');
      }
    } catch (error) {
      console.error('🎤 Voice input error:', error);
      showNotification(`Chyba při zpracování hlasu: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setIsRecording(false);
    }
  }, [showNotification]);

  const handleVoiceInputError = useCallback((error) => {
    console.error('🎤 Voice input error:', error);
    setIsRecording(false);
    setLoading(false);
    showNotification('Chyba při nahrávání hlasu', 'error');
  }, [showNotification]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      voiceRecorderRef.current?.stopRecording();
      setIsRecording(false);
    } else {
      if (currentAudioRef.current) {
        stopCurrentAudio();
      }
      setIsRecording(true);
      voiceRecorderRef.current?.startRecording();
    }
  }, [isRecording, stopCurrentAudio]);

  // 🔍 DEEP SEARCH FUNCTIONS
  const performDeepSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsDeepSearching(true);
    setDeepSearchResults([]);
    
    try {
      console.log('🔍 Performing deep search:', query);
      
      // Use Sonar for deep search
      const searchResults = await sonarService.sendMessage(
        [{ sender: 'user', text: query }],
        userLanguage
      );
      
      setDeepSearchResults([{
        id: generateId(),
        query: query,
        result: searchResults,
        timestamp: Date.now(),
        model: 'sonar'
      }]);
      
      showNotification('Hluboké vyhledávání dokončeno', 'success');
      
    } catch (error) {
      console.error('🔍 Deep search error:', error);
      showNotification(`Chyba při hlubokém vyhledávání: ${error.message}`, 'error');
    } finally {
      setIsDeepSearching(false);
    }
  }, [userLanguage, showNotification]);

  const handleDeepSearchSubmit = useCallback(() => {
    if (deepSearchQuery.trim()) {
      performDeepSearch(deepSearchQuery);
      setDeepSearchQuery('');
    }
  }, [deepSearchQuery, performDeepSearch]);

  // 🔗 SOURCES HANDLING
  const handleShowSources = useCallback((sources) => {
    setSelectedMessageSources(sources);
    setShowSourcesModal(true);
  }, []);

  const handleRetryMessage = useCallback(async (messageIndex) => {
    const message = messages[messageIndex];
    if (!message || message.sender !== 'user') return;
    
    const messageId = `retry_${Date.now()}`;
    setMessageLoadingStates(prev => ({ ...prev, [messageId]: true }));
    
    try {
      // Retry the message with same content
      await handleSend(message.text, false, messageId);
    } catch (error) {
      console.error('🔄 Retry error:', error);
      showNotification('Opakování zprávy se nezdařilo', 'error');
    } finally {
      setMessageLoadingStates(prev => {
        const newStates = { ...prev };
        delete newStates[messageId];
        return newStates;
      });
    }
  }, [messages, showNotification]);

  // 🚀 MAIN MESSAGE HANDLER - FIXED FOR NEW openai.service.js FORMAT
  const handleSend = useCallback(async (textInput = input, fromVoice = false, messageId = null) => {
    if (!textInput.trim() || loading) return;

    const detectedLang = detectLanguage(textInput);
    if (detectedLang !== userLanguage) {
      setUserLanguage(detectedLang);
    }

    // Stop any current audio
    stopCurrentAudio();

    if (!fromVoice) setInput('');
    setLoading(true);
    setConnectionStatus('sending');

    const currentMessageId = messageId || generateId();

    try {
      const userMessage = { 
        id: currentMessageId,
        sender: 'user', 
        text: textInput,
        timestamp: Date.now(),
        language: detectedLang
      };
      
      const messagesWithUser = [...messages, userMessage];
      setMessages(messagesWithUser);
      sessionManager.saveMessages(messagesWithUser);

      let responseText = '';
      let responseSources = [];
      let responseModel = model;
      let apiUsage = {};

      // 🤖 CLAUDE HANDLER
      if (model === 'claude') {
        let streamedText = '';
        let streamedSources = [];
        
        responseText = await claudeService.sendMessage(
          messagesWithUser,
          (text, isStreaming, sources) => {
            streamedText = text;
            streamedSources = sources || [];
            const streamingMessages = [
              ...messagesWithUser,
              { 
                id: `${currentMessageId}_response`,
                sender: 'bot', 
                text: text, 
                isStreaming: true, 
                sources: sources,
                model: 'claude',
                timestamp: Date.now()
              }
            ];
            setMessages(streamingMessages);
            setStreaming(isStreaming);
          },
          (searchMsg) => showNotification(searchMsg, 'info', null, 2000),
          detectedLang
        );
        
        const finalText = streamedText || responseText;
        responseSources = streamedSources;
        
        const finalMessages = [...messagesWithUser, { 
          id: `${currentMessageId}_response`,
          sender: 'bot', 
          text: finalText,
          sources: responseSources,
          model: 'claude',
          timestamp: Date.now()
        }];
        
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && finalText) {
          console.log('🎵 Claude complete, instant voice playback...');
          setTimeout(async () => {
            await processVoiceResponse(finalText, detectedLang, `${currentMessageId}_response`);
          }, 500);
        }
      }
      
      // 🧠 GPT HANDLER - FIXED FOR NEW RESPONSE FORMAT
      else if (model === 'gpt-4o') {
        const openAIMessages = convertMessagesForOpenAI(messagesWithUser);
        
        console.log('🧠 Sending to GPT Enhanced with Claude web search...');
        
        // ✅ FIX: Handle new { text, sources } format from openai.service.js
        const response = await openaiService.sendMessage(openAIMessages, detectedLang);
        
        // ✅ FIX: Extract text and sources properly
        if (typeof response === 'string') {
          // Fallback for old format
          responseText = response;
          responseSources = [];
          console.log('📝 GPT response (old format):', responseText.substring(0, 100) + '...');
        } else if (response && typeof response === 'object') {
          // New format with sources
          responseText = response.text || response.content || '';
          responseSources = response.sources || [];
          apiUsage = response.usage || {};
          responseModel = response.model || 'gpt-4o';
          console.log('📝 GPT response (new format):', responseText.substring(0, 100) + '...');
          console.log('🔗 GPT sources found:', responseSources.length);
        } else {
          throw new Error('Invalid response format from GPT service');
        }
        
        if (!responseText) {
          throw new Error('Empty response from GPT service');
        }
        
        const finalMessages = [...messagesWithUser, { 
          id: `${currentMessageId}_response`,
          sender: 'bot', 
          text: responseText,
          sources: responseSources,
          model: 'gpt-4o',
          timestamp: Date.now(),
          usage: apiUsage
        }];
        
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        // 🆕 GPT VOICE PIPELINE - FIXED WITH SAME LOGIC AS CLAUDE
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 GPT response complete, processing voice...');
          console.log('🌍 Language for GPT voice:', detectedLang);
          setTimeout(async () => {
            await processVoiceResponse(responseText, detectedLang, `${currentMessageId}_response`);
          }, 500);
        }
      }
      
      // 🔍 SONAR HANDLER  
      else if (model === 'sonar') {
        responseText = await sonarService.sendMessage(messagesWithUser, detectedLang);
        
        const finalMessages = [...messagesWithUser, { 
          id: `${currentMessageId}_response`,
          sender: 'bot', 
          text: responseText,
          model: 'sonar',
          timestamp: Date.now()
        }];
        
        setMessages(finalMessages);
        sessionManager.saveMessages(finalMessages);
        
        if (fromVoice && showVoiceScreen && responseText) {
          setTimeout(async () => {
            await processVoiceResponse(responseText, detectedLang, `${currentMessageId}_response`);
          }, 500);
        }
      }

      // Update API usage stats
      setApiUsageStats(prev => ({
        ...prev,
        [model === 'gpt-4o' ? 'gpt' : model]: prev[model === 'gpt-4o' ? 'gpt' : model] + 1,
        totalTokens: prev.totalTokens + (apiUsage.total_tokens || 0)
      }));

      setConnectionStatus('connected');
      
      // Clear retry attempts for this message
      setRetryAttempts(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[currentMessageId];
        return newAttempts;
      });

    } catch (error) {
      console.error('💥 Send message error:', error);
      setConnectionStatus('error');
      
      const errorMessage = error.message || 'Neznámá chyba';
      showNotification(
        `Chyba při komunikaci s ${model.toUpperCase()}: ${errorMessage}`, 
        'error',
        () => handleRetryMessage(messages.length),
        6000
      );
      
      // Track retry attempts
      setRetryAttempts(prev => ({
        ...prev,
        [currentMessageId]: (prev[currentMessageId] || 0) + 1
      }));
      
      // Auto-retry logic for network errors
      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        const attempts = retryAttempts[currentMessageId] || 0;
        if (attempts < 3) {
          console.log(`🔄 Auto-retry attempt ${attempts + 1}/3 for message ${currentMessageId}`);
          retryTimeoutsRef.current[currentMessageId] = setTimeout(() => {
            handleSend(textInput, fromVoice, currentMessageId);
          }, 2000 * (attempts + 1)); // Exponential backoff
        }
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [
    input, loading, userLanguage, model, messages, stopCurrentAudio, 
    convertMessagesForOpenAI, showNotification, processVoiceResponse, 
    showVoiceScreen, retryAttempts, handleRetryMessage
  ]);

  // 🔄 UI HANDLERS
  const handleNewChat = useCallback(() => {
    stopCurrentAudio();
    setMessages([]);
    sessionManager.clearMessages();
    setInput('');
    setVoiceConversationHistory([]);
    setCurrentVoiceMessage('');
    setDeepSearchResults([]);
    setNotifications([]);
    clearAllNotifications();
    showNotification('Nová konverzace zahájena', 'success');
    
    // Focus input after clearing
    setTimeout(() => {
      if (inputRef.current && !isMobile) {
        inputRef.current.focus();
      }
    }, 100);
  }, [stopCurrentAudio, clearAllNotifications, showNotification, isMobile]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (e.target.scrollHeight > e.target.clientHeight) {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    setInputFocused(true);
    // Scroll to bottom when input is focused on mobile
    if (isMobile) {
      setTimeout(scrollToBottom, 300);
    }
  }, [isMobile, scrollToBottom]);

  const handleInputBlur = useCallback(() => {
    setInputFocused(false);
  }, []);

  const handleModelChange = useCallback((newModel) => {
    if (newModel !== model) {
      setModel(newModel);
      showNotification(`Přepnuto na ${newModel.toUpperCase()}`, 'info');
      
      // Update API usage display
      console.log(`📊 Switching to ${newModel}, current stats:`, apiUsageStats);
    }
  }, [model, showNotification, apiUsageStats]);

  const handleLanguageToggle = useCallback(() => {
    const newLang = userLanguage === 'cs' ? 'en' : userLanguage === 'en' ? 'ro' : 'cs';
    setUserLanguage(newLang);
    showNotification(`Jazyk změněn na ${newLang.toUpperCase()}`, 'info');
  }, [userLanguage, showNotification]);

  const handleExportConversation = useCallback(() => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        model: model,
        language: userLanguage,
        messageCount: messages.length,
        messages: messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          model: msg.model,
          sources: msg.sources ? msg.sources.length : 0
        })),
        stats: apiUsageStats
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `omnia-conversation-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification('Konverzace exportována', 'success');
    } catch (error) {
      console.error('📁 Export error:', error);
      showNotification('Chyba při exportu', 'error');
    }
  }, [model, userLanguage, messages, apiUsageStats, showNotification]);// 🎨 MAIN JSX RENDER
  return (
    <div className="app-container min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
      
      {/* 🎵 VOICE SCREEN OVERLAY */}
      {showVoiceScreen && (
        <VoiceScreen
          onClose={() => {
            setShowVoiceScreen(false);
            setVoiceSessionActive(false);
            setCurrentVoiceMessage('');
            stopCurrentAudio();
          }}
          onSendMessage={handleSend}
          userLanguage={userLanguage}
          model={model}
          currentMessage={currentVoiceMessage}
          isAudioPlaying={isAudioPlaying}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          conversationHistory={voiceConversationHistory}
          onClearHistory={() => setVoiceConversationHistory([])}
        />
      )}

      {/* 🔍 DEEP SEARCH MODAL */}
      {showDeepSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-md border border-white/20 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">🔍 Hluboké vyhledávání</h3>
                <button
                  onClick={() => setShowDeepSearch(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex space-x-4 mb-6">
                <input
                  ref={deepSearchRef}
                  type="text"
                  value={deepSearchQuery}
                  onChange={(e) => setDeepSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDeepSearchSubmit()}
                  placeholder="Zadejte dotaz pro hluboké vyhledávání..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isDeepSearching}
                />
                <button
                  onClick={handleDeepSearchSubmit}
                  disabled={isDeepSearching || !deepSearchQuery.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all duration-200"
                >
                  {isDeepSearching ? '⏳' : '🔍'}
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {deepSearchResults.map((result) => (
                  <div key={result.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-sm text-white/60 mb-2">
                      {new Date(result.timestamp).toLocaleString()} • {result.model.toUpperCase()}
                    </div>
                    <div className="text-white/80 mb-2 font-medium">"{result.query}"</div>
                    <div className="text-white whitespace-pre-wrap">{result.result}</div>
                  </div>
                ))}
                
                {isDeepSearching && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-white/60 ml-2">Vyhledávám...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔗 SOURCES MODAL */}
      {showSourcesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">🔗 Zdroje informací</h3>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-96">
              {selectedMessageSources.map((source, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-2">{source.title}</h4>
                      <p className="text-sm text-white/60 mb-2">{source.domain}</p>
                      {source.url && source.url !== '#' && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 text-sm break-all"
                        >
                          {source.url}
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-white/40 ml-4">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">⚙️ Nastavení</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Jazyk</label>
                <select
                  value={userLanguage}
                  onChange={(e) => setUserLanguage(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
                >
                  <option value="cs">Čeština</option>
                  <option value="en">English</option>
                  <option value="ro">Română</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
                >
                  <option value="claude">Omnia Claude (Sonnet 4)</option>
                  <option value="gpt-4o">Omnia GPT (Enhanced)</option>
                  <option value="sonar">Omnia Sonar (Search)</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showNotifications}
                    onChange={(e) => setShowNotifications(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-white/80">Zobrazovat notifikace</span>
                </label>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-white/60 space-y-1">
                  <div>Zpráv Claude: {apiUsageStats.claude}</div>
                  <div>Zpráv GPT: {apiUsageStats.gpt}</div>
                  <div>Zpráv Sonar: {apiUsageStats.sonar}</div>
                  <div>Celkem tokenů: {apiUsageStats.totalTokens}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleExportConversation}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
                >
                  📁 Export
                </button>
                <button
                  onClick={handleNewChat}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-xl transition-colors"
                >
                  🗑️ Smazat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📱 MAIN APP INTERFACE */}
      <div className="flex flex-col h-screen">
        
        {/* 🎨 HEADER */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <OmniaLogos />
            <select 
              value={model} 
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="claude">🧠 Omnia Claude</option>
              <option value="gpt-4o">⚡ Omnia GPT Enhanced</option>
              <option value="sonar">🔍 Omnia Sonar</option>
            </select>
            
            {/* CONNECTION STATUS INDICATOR */}
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'sending' ? 'bg-yellow-400 animate-pulse' : 
              'bg-red-400'
            }`} title={`Status: ${connectionStatus}`}></div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-3">
            <button 
              onClick={handleLanguageToggle}
              className="bg-white/10 hover:bg-white/20 px-2 lg:px-3 py-2 rounded-lg transition-colors text-sm"
              title="Změnit jazyk"
            >
              {userLanguage.toUpperCase()}
            </button>
            
            <button
              onClick={() => setShowDeepSearch(true)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Hluboké vyhledávání"
            >
              🔍
            </button>
            
            <button 
              onClick={handleNewChat}
              className="bg-white/10 hover:bg-white/20 px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm"
              title="Nová konverzace"
            >
              <span className="hidden lg:inline">{translations[userLanguage]?.newChat || 'Nový chat'}</span>
              <span className="lg:hidden">+</span>
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-lg transition-colors ${
                showNotifications ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-white/60'
              }`}
              title="Nastavení"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* 💬 CHAT MESSAGES */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6" 
          style={{ 
            maxHeight: `calc(100vh - 200px - ${keyboardHeight}px)`,
            paddingBottom: isMobile && inputFocused ? '100px' : undefined
          }}
        >
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-8">
                <OmniaLogos size="large" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white/90">
                {translations[userLanguage]?.welcome || 'Vítej v Omnia AI'}
              </h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                {translations[userLanguage]?.subtitle || 'Tvůj pokročilý AI asistent s hlasovým rozhraním a přístupem k aktuálním informacím'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">🧠</div>
                  <h3 className="font-medium mb-1">Claude Sonnet 4</h3>
                  <p className="text-sm text-white/60">Pokročilé reasoning a analýza</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-medium mb-1">GPT Enhanced</h3>
                  <p className="text-sm text-white/60">Rychlé odpovědi s web search</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎵</div>
                  <h3 className="font-medium mb-1">Voice Interface</h3>
                  <p className="text-sm text-white/60">Přirozená hlasová konverzace</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.id || index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl px-4 lg:px-6 py-3 lg:py-4 rounded-2xl relative group ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto' 
                  : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
              }`}>
                
                {message.sender === 'bot' && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        message.isStreaming ? 'bg-blue-400 animate-pulse' : 'bg-green-400'
                      }`}></div>
                      <span className="text-sm text-white/60 font-medium">
                        {message.model === 'claude' ? '🧠 Claude' : 
                         message.model === 'gpt-4o' ? '⚡ GPT Enhanced' : 
                         message.model === 'sonar' ? '🔍 Sonar' : 
                         model === 'claude' ? '🧠 Claude' : 
                         model === 'gpt-4o' ? '⚡ GPT Enhanced' : '🔍 Sonar'}
                      </span>
                      {message.timestamp && (
                        <span className="text-xs text-white/40">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* 🔗 SOURCES BUTTON */}
                      {message.sources && message.sources.length > 0 && (
                        <button 
                          onClick={() => handleShowSources(message.sources)}
                          className="text-blue-300 hover:text-blue-200 text-sm flex items-center space-x-1 bg-white/10 px-2 py-1 rounded-lg transition-colors"
                        >
                          <span>🔗</span>
                          <span>{message.sources.length}</span>
                        </button>
                      )}

                      {/* 🎵 VOICE BUTTON */}
                      <VoiceButton 
                        text={message.text}
                        language={userLanguage}
                        isPlaying={isAudioPlaying && currentAudioRef.current}
                        onPlayingChange={setIsAudioPlaying}
                        onAudioRef={(audio) => {
                          currentAudioRef.current = audio;
                        }}
                        size="small"
                      />
                      
                      {/* 🔄 RETRY BUTTON */}
                      <button
                        onClick={() => handleRetryMessage(index - 1)}
                        className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white transition-all p-1 rounded"
                        title="Opakovat zprávu"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-white">
                  {message.isStreaming ? (
                    <TypewriterText text={message.text} speed={30} />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
                  )}
                </div>
                
                {message.usage && (
                  <div className="text-xs text-white/40 mt-2">
                    Tokeny: {message.usage.total_tokens}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-white/60 ml-2">
                    {model === 'claude' ? '🧠 Claude' : model === 'gpt-4o' ? '⚡ GPT Enhanced' : '🔍 Sonar'} přemýšlí...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ⌨️ INPUT BAR */}
        <div className="p-4 lg:p-6 bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 lg:p-4">
            <div className="flex items-end space-x-3 lg:space-x-4">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={translations[userLanguage]?.inputPlaceholder || 'Třímíte zprávu Omnia...'}
                  className="w-full bg-transparent text-white placeholder-white/50 border-none outline-none resize-none min-h-[40px] max-h-32"
                  rows="1"
                  disabled={loading}
                  style={{ 
                    fontSize: isMobile ? '16px' : '14px' // Prevent zoom on iOS
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 🎙️ VOICE CHAT BUTTON */}
                <button
                  onClick={() => {
                    setShowVoiceScreen(true);
                    setVoiceSessionActive(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                  title="Hlasová konverzace"
                  disabled={loading}
                >
                  🎙️
                </button>

                {/* 🎤 QUICK STT BUTTON */}
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Rychlé nahrávání"
                  disabled={loading}
                >
                  🎤
                </button>

                {/* 📤 SEND BUTTON */}
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                  title="Odeslat zprávu"
                >
                  {loading ? '⏳' : '📤'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎤 HIDDEN VOICE RECORDER */}
      <SimpleVoiceRecorder
        ref={voiceRecorderRef}
        onRecordingComplete={handleVoiceInput}
        onRecordingStart={() => setIsRecording(true)}
        onRecordingStop={() => setIsRecording(false)}
        onError={handleVoiceInputError}
      />

      {/* 🔔 NOTIFICATIONS */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-40 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 text-white ${
                notification.type === 'success' ? 'bg-green-500/20 border-green-400/30' :
                notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-400/30' :
                notification.type === 'error' ? 'bg-red-500/20 border-red-400/30' :
                'bg-blue-500/20 border-blue-400/30'
              } transform transition-all duration-300 animate-slide-in-right`}
            >
              <div className="flex items-start justify-between">
                <span className="text-sm flex-1 pr-2">{notification.message}</span>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action();
                    dismissNotification(notification.id);
                  }}
                  className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                >
                  Opakovat
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 📱 MOBILE KEYBOARD SPACER */}
      {isMobile && keyboardHeight > 0 && (
        <div style={{ height: `${keyboardHeight}px` }} />
      )}
    </div>
  );
}

export default App;