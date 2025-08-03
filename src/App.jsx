// 🚀 OMNIA - APP.JSX PART 1/3 - IMPORTS + STATE + EFFECTS (REDESIGNED)
// ✅ ADDED: ChatSidebar + NewChatButton imports
// ✅ ADDED: welcomeTexts for multilingual welcome
// ✅ SIMPLIFIED: Removed complex scroll system
// 🎯 UNCHANGED: Všechny původní importy a funkčnost
// 🆕 STREAMING: Added streamingUtils import

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Menu, ChevronDown } from 'lucide-react';
import './App.css';

// 🔧 IMPORT SERVICES (MODULAR)
import { claudeService, openaiService, grokService, geminiService } from './services/ai';
import { elevenLabsService } from './services/voice';

// 🔧 IMPORT UTILS (MODULAR + STREAMING)
import { uiTexts, getTranslation, detectLanguage, sanitizeText } from './utils/text';
import { sessionManager } from './services/storage';
import chatDB from './services/storage/chatDB'; // 💾 IndexedDB for chat history
import { crashMonitor } from './utils/crashMonitor';
import { streamMessageWithEffect, smartScrollToBottom } from './utils/ui'; // 🆕 STREAMING

// 🔧 IMPORT UI COMPONENTS (MODULAR)
import { SettingsDropdown, OmniaLogo, MiniOmniaLogo, ChatOmniaLogo, VoiceButton, CopyButton, OfflineIndicator } from './components/ui';
import { VoiceScreen } from './components/chat';
import MessageRenderer from './components/MessageRenderer';

// 🆕 IMPORT INPUT BAR (MODULAR)
import { InputBar } from './components/input';

// 🔗 IMPORT SOURCES COMPONENTS (UNCHANGED)
import { SourcesButton, SourcesModal } from './components/sources';

// 🆕 NEW COMPONENTS - Added for redesign
import { ChatSidebar } from './components/layout';

// 📶 HOOKS - For offline detection
import { useOnlineStatus } from './hooks/useOnlineStatus';

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

// ✅ CONSOLE CLEANUP: Vite automatically removes console.log in production builds

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
  
  const inputRef = useRef();
  const messagesRef = useRef();
  const uploadedDocumentsRef = useRef();
  
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
  
  // 🔗 SOURCES STATE (UNCHANGED)
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [currentSources, setCurrentSources] = useState([]);
  
  // 🆕 NEW SIDEBAR STATE - Added for redesign
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const currentChatIdRef = useRef(null); // 🔧 useRef backup to prevent race condition
  const [chatHistories, setChatHistories] = useState([]);

  // 🔧 Helper functions for safe chatId management
  const updateCurrentChatId = (newId) => {
    setCurrentChatId(newId);
    currentChatIdRef.current = newId;
  };

  const getSafeChatId = () => {
    return currentChatId || currentChatIdRef.current;
  };
  
  // 🆕 STREAMING STATE - For controlling streaming effect
  const [stopStreamingRef, setStopStreamingRef] = useState(null);
  
  // 📄 BATCH LOADING STATE - For pagination
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [currentMessageOffset, setCurrentMessageOffset] = useState(0);
  
  // 🎨 BREATHING ANIMATION - Removed for performance (now using CSS only)
  
  // 🔽 SCROLL TO BOTTOM - Show button when user scrolled up
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  // 🎨 IMAGE GENERATION STATE - For switching between chat and image modes
  const [isImageMode, setIsImageMode] = useState(false);
  
  // 🔄 PWA UPDATE STATE - For handling app updates
  
  // 📶 ONLINE STATUS - For offline detection
  const { isOnline, isOffline, connectionType, connectionInfo } = useOnlineStatus();
  
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

  // 🔄 PWA UPDATE EVENT LISTENERS
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('🔍 Setting up PWA event listeners...');
    console.log('📱 Mobile device:', isMobile);
    console.log('📱 PWA mode:', isPWA);
    console.log('📱 User agent:', navigator.userAgent);
    
    // Service Worker is now handled automatically
  }, []);

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
  }, [userHasInteracted]);

  // ⚙️ INITIALIZATION (UNCHANGED)
  useEffect(() => {
    // Track PWA mode
    if (window.navigator.standalone) {
      crashMonitor.trackPWAEvent('standalone_mode', { source: 'iOS' });
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      crashMonitor.trackPWAEvent('standalone_mode', { source: 'PWA' });
    }
    
    // Session management removed - using only IndexedDB for chat persistence

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
    // LAZY LOADING: Načti JEN metadata chatů (názvy) - BEZ celých zpráv
    loadChatTitles();
  };

  const handleSidebarClose = () => {
    setShowChatSidebar(false);
  };


  const handleNewChatKeepSidebar = async () => {
    // Same as handleSidebarNewChat but keeps sidebar open
    // 💾 SMART POJISTKA: Save only NEW messages to prevent duplicates
    if (currentChatId && messages.length > 0) {
      console.log('💾 [SMART-SAVE] Checking for unsaved messages before sidebar new chat:', currentChatId);
      
      // Get existing message count from database
      const existingData = await chatDB.getLatestMessages(currentChatId, 1);
      const lastSavedCount = existingData.totalCount || 0;
      const currentCount = messages.length;
      
      // Save only NEW messages since last save
      if (currentCount > lastSavedCount) {
        const unsavedMessages = messages.slice(lastSavedCount);
        console.log(`💾 [SMART-SAVE] Saving ${unsavedMessages.length} new messages (${lastSavedCount} already saved)`);
        await chatDB.saveChatV2(currentChatId, unsavedMessages);
        console.log('✅ [SMART-SAVE] New messages protected before sidebar new chat');
      } else {
        console.log('✅ [SMART-SAVE] All messages already protected - no duplicates');
      }
    }
    handleNewChat();
    const newKeepSidebarId = chatDB.generateChatId();
    console.log('🔴 [DEBUG] handleNewChatKeepSidebar - setting new chatId:', newKeepSidebarId);
    updateCurrentChatId(newKeepSidebarId);
    // ❌ REMOVED: loadChatHistories() - historie se aktualizuje lazy
    // Note: sidebar stays open
  };

  // 📚 CHAT TITLES FUNCTION - Only metadata, no full messages
  const loadChatTitles = async () => {
    try {
      console.log('📋 [MONITOR] Loading chat titles only (metadata)...');
      const startTime = performance.now();
      
      const titles = await chatDB.getChatTitles(); // ONLY titles/metadata - NO messages
      setChatHistories(titles);
      
      const loadTime = performance.now() - startTime;
      console.log(`✅ [MONITOR] Loaded ${titles.length} chat titles (metadata only) in ${loadTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('❌ [MONITOR] Error loading chat titles:', error);
      setChatHistories([]); // Fallback to empty array
    }
  };

  const handleSelectChat = async (chatId) => {
    crashMonitor.trackChatOperation('switch_chat_start', { fromChatId: currentChatId, toChatId: chatId });
    try {
      // ✅ SAVE POINT #2: Save current chat before switching
      if (currentChatId && messages.length > 0) {
        console.log('🔄 [MONITOR-V2] Saving current chat before switch:', currentChatId);
        await chatDB.saveChatV2(currentChatId, messages);
        crashMonitor.trackIndexedDB('save', currentChatId, true);
        console.log('✅ [MONITOR-V2] Current chat saved successfully');
      }
      
      // 📖 Load selected chat - V2 BOTTOM-FIRST LOADING
      console.log('📖 [MONITOR-V2] Loading chat with V2 API:', chatId);
      
      // V2: Always load latest 50 messages (bottom-first)
      const chatData = await chatDB.getLatestMessages(chatId, 50);
      if (!chatData || chatData.messages.length === 0) {
        crashMonitor.trackIndexedDB('load', chatId, false, new Error('Chat not found or empty'));
        console.warn('⚠️ [MONITOR-V2] Chat not found or empty:', chatId);
        return;
      }
      
      console.log(`✅ [MONITOR-V2] V2 Loading successful: ${chatData.messages.length}/${chatData.totalCount} messages`);
      console.log(`🎯 [MONITOR-V2] BOTTOM-FIRST: Chat opens on latest messages, ${chatData.hasMore ? 'has' : 'no'} older messages`);
      
      // V2 chatData structure is already correct: { messages, totalCount, hasMore, loadedRange }
      
      if (chatData && chatData.messages.length > 0) {
        setMessages(chatData.messages);
        updateCurrentChatId(chatId);
        setHasMoreMessages(chatData.hasMore);
        // V2: No offset tracking needed - using timestamp-based pagination
        crashMonitor.trackIndexedDB('load', chatId, true);
        crashMonitor.trackChatOperation('switch_chat_success', { 
          chatId, 
          messageCount: chatData.messages.length,
          totalMessages: chatData.totalCount,
          hasMore: chatData.hasMore
        });
        console.log('✅ [MONITOR-V2] Chat loaded successfully with V2 API:', {
          chatId,
          loadedMessages: chatData.messages.length,
          totalMessages: chatData.totalCount,
          hasMore: chatData.hasMore,
          loadedRange: chatData.loadedRange
        });
        
        // 🎯 SCROLL FIX: Ensure chat opens at bottom after V2 loading
        setTimeout(() => {
          scrollToBottom();
          console.log('🎯 [UX-FIXED] Chat scrolled to bottom after V2 loading');
        }, 100);
      } else if (chatData && chatData.messages.length === 0) {
        // Empty chat - start fresh
        setMessages([]);
        updateCurrentChatId(chatId);
        setHasMoreMessages(false);
        // V2: No offset tracking needed
        console.log('🆕 [MONITOR] Starting with empty chat:', chatId);
      } else {
        crashMonitor.trackIndexedDB('load', chatId, false, new Error('Chat not found'));
        console.warn('⚠️ [MONITOR] Chat not found:', chatId);
      }
      
    } catch (error) {
      crashMonitor.trackChatOperation('switch_chat_failed', { 
        error: error.message, 
        fromChatId: currentChatId, 
        toChatId: chatId 
      });
      console.error('❌ [MONITOR] Chat switch failed:', error);
      // No localStorage fallback - IndexedDB only
      console.log('🔄 [MONITOR] Chat switch failed, no fallback used');
    }
  };

  // 📄 LOAD OLDER MESSAGES - When user scrolls to top
  const loadOlderMessages = async () => {
    if (!currentChatId || !hasMoreMessages || loadingOlderMessages) {
      return;
    }

    setLoadingOlderMessages(true);
    try {
      // V2: Get timestamp of oldest message for true pagination
      const oldestMessage = messages[0];
      if (!oldestMessage || !oldestMessage.timestamp) {
        console.warn('⚠️ [MONITOR-V2] No oldest message timestamp for pagination');
        setLoadingOlderMessages(false);
        return;
      }

      console.log('📄 [MONITOR-V2] Loading older messages before timestamp:', oldestMessage.timestamp);
      
      const olderMessages = await chatDB.getMessagesBefore(currentChatId, oldestMessage.timestamp, 15);
      
      if (olderMessages && olderMessages.length > 0) {
        // Prepend older messages to current messages
        const allMessages = [...olderMessages, ...messages];
        
        // 🪟 SLIDING WINDOW - Keep max 50 messages in RAM for optimal performance
        if (allMessages.length > 50) {
          console.log(`🪟 [SLIDING-WINDOW] Too many messages: ${allMessages.length} > 50, applying sliding window...`);
          // Keep only the latest 50 messages for sliding window approach
          const trimmedMessages = allMessages.slice(-50);
          setMessages(trimmedMessages);
          console.log(`🧹 [SLIDING-WINDOW] Trimmed ${allMessages.length} → 50 messages in RAM`);
        } else {
          setMessages(allMessages);
        }
        
        setHasMoreMessages(olderMessages.length === 15); // If we got less than requested, no more messages
        
        console.log('✅ [MONITOR-V2] V2 Older messages loaded:', {
          loadedCount: olderMessages.length,
          beforeTimestamp: oldestMessage.timestamp,
          hasMore: olderMessages.length === 15,
          totalInDOM: allMessages.length > 50 ? 50 : allMessages.length,
          actualTotal: allMessages.length
        });
      } else {
        setHasMoreMessages(false);
        console.log('🔚 [MONITOR-V2] No more older messages to load');
      }
    } catch (error) {
      console.error('❌ Error loading older messages:', error);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  // 🔄 INITIALIZATION - NO chat loading on mount (lazy loading)
  React.useEffect(() => {
    // ❌ REMOVED: loadChatHistories() - načte se až při otevření sidebaru
    console.log('🔴 [DEBUG] useEffect init - currentChatId at mount:', currentChatId);
    
    if (!currentChatId) {
      const newId = chatDB.generateChatId();
      console.log('🔴 [DEBUG] useEffect generating NEW chatId (initial):', newId);
      updateCurrentChatId(newId);
    } else {
      console.log('🔴 [DEBUG] useEffect - using existing chatId:', currentChatId);
    }
  }, []);

  // 💾 Strategic save point #5: Save chat on page visibility change (more reliable than beforeunload)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      // Only save when page becomes hidden AND it's not just opening a document viewer
      if (document.hidden && currentChatId && messages.length > 0) {
        console.log('👁️ [MONITOR] Page hidden - saving to IndexedDB and sessionStorage');
        
        chatDB.saveChatV2(currentChatId, messages).catch(error => {
          console.error('❌ Failed to save to IndexedDB V2 on visibility change:', error);
        });
        
        sessionManager.saveCurrentChatId(currentChatId);
      }
    };

    const handleBeforeUnload = () => {
      // Keep minimal beforeunload for actual page closing
      if (currentChatId && messages.length > 0) {
        console.log('🚪 [MONITOR] App closing - final save');
        chatDB.saveChatV2(currentChatId, messages).catch(error => {
          console.error('❌ Failed to save to IndexedDB V2 on close:', error);
        });
        sessionManager.saveCurrentChatId(currentChatId);
      }
    };

    // Use visibilitychange as primary save trigger (doesn't interfere with document viewing)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Keep beforeunload as backup for actual page close
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentChatId, messages]);

  // 🎨 BREATHING ANIMATION - Pure CSS animation (performance optimized)
  // Note: Removed JavaScript animation loop to improve performance by ~95%

  // 🔽 SCROLL DETECTION - Show scroll-to-bottom button when scrolled up + Load older messages when scrolled to top
  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainContent;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // Increase threshold for mobile
      const isAtTop = scrollTop <= 100; // Increase threshold for mobile
      
      setShowScrollToBottom(!isNearBottom);
      
      // Load older messages when scrolled to top
      if (isAtTop && hasMoreMessages && !loadingOlderMessages) {
        console.log('🔝 User scrolled to top - loading older messages...');
        loadOlderMessages();
      }
    };

    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, loadingOlderMessages]);

  // 🔄 AUTO-SAVE HELPER - volá se po přidání AI response
  const checkAutoSave = async (allMessages, chatId = currentChatId) => {
    console.log(`🔴 [DEBUG] checkAutoSave() CALLED! Messages: ${allMessages.length}, ChatID: ${chatId ? 'EXISTS' : 'NULL'}`);
    console.log(`🔴 [DEBUG] Auto-save - currentChatId from state: ${currentChatId}, passed chatId: ${chatId}`);
    
    if (!chatId || allMessages.length === 0) {
      console.log(`🔴 [DEBUG] Early return: chatId=${chatId ? 'EXISTS' : 'NULL'}, length=${allMessages.length}`);
      return allMessages;
    }
    
    console.log(`📊 [AUTO-SAVE-CHECK] Total messages (user+AI): ${allMessages.length}, Checking auto-save condition...`);
    console.log(`🔍 [AUTO-SAVE-DEBUG] Length: ${allMessages.length}, Modulo 10: ${allMessages.length % 10}, ChatID: ${chatId ? 'EXISTS' : 'NULL'}`);
    
    // 💾 AUTO-SAVE - každých 10 zpráv (bez cleanup!)
    if (allMessages.length % 10 === 0 && allMessages.length > 0) {
      console.log(`🔄 [AUTO-SAVE] Trigger: ${allMessages.length} total messages - exact multiple of 10!`);
      try {
        await chatDB.saveChatV2(chatId, allMessages);
        console.log(`✅ [AUTO-SAVE] SUCCESS: ${allMessages.length} total messages saved to DB`);
      } catch (error) {
        console.error(`❌ [AUTO-SAVE] FAILED:`, error);
      }
    }
    
    // 🪟 SLIDING WINDOW - Memory management handled by loadOlderMessages only
    // Removed fixed RAM cleanup to prevent conflicts with scroll loading
    
    return allMessages; // No cleanup, return original
  };

  // 🔽 SCROLL TO BOTTOM FUNCTION
  const scrollToBottom = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: mainContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // ❌ REMOVED: Problematic auto-save useEffect that caused UI freezing
  // 📝 Chat saving moved to strategic moments (user send, stream end, chat switch, etc.)
  // 🚀 This eliminates localStorage blocking during AI streaming

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
  const handleNewChat = async () => {
    crashMonitor.trackChatOperation('new_chat_start', { currentChatId, messageCount: messages.length });
    try {
      // ✅ SMART POJISTKA: Save only NEW messages to prevent duplicates
      if (currentChatId && messages.length > 0) {
        console.log('💾 [SMART-SAVE] Checking for unsaved messages before new chat:', currentChatId);
        
        // Get existing message count from database
        const existingData = await chatDB.getLatestMessages(currentChatId, 1);
        const lastSavedCount = existingData.totalCount || 0;
        const currentCount = messages.length;
        
        // Save only NEW messages since last save
        if (currentCount > lastSavedCount) {
          const unsavedMessages = messages.slice(lastSavedCount);
          console.log(`💾 [SMART-SAVE] Saving ${unsavedMessages.length} new messages (${lastSavedCount} already saved)`);
          await chatDB.saveChatV2(currentChatId, unsavedMessages);
          crashMonitor.trackIndexedDB('save', currentChatId, true);
          console.log('✅ [SMART-SAVE] New messages protected before new chat');
        } else {
          console.log('✅ [SMART-SAVE] All messages already protected - no duplicates');
        }
      }

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
      
      // 📄 Clear document states to prevent context leakage
      setActiveDocumentContexts([]);
      setUploadedDocuments([]);
      
      // 📄 Reset batch loading state for new chat
      setHasMoreMessages(false);
      // V2: No offset tracking needed
      setLoadingOlderMessages(false);
    
      // Create new chat ID for history tracking
      const newChatId = chatDB.generateChatId();
      updateCurrentChatId(newChatId);
      
      crashMonitor.trackChatOperation('new_chat_success', { newChatId });
      console.log('🆕 [MONITOR] New chat prepared:', newChatId);
      
    } catch (error) {
      crashMonitor.trackChatOperation('new_chat_failed', { error: error.message });
      console.error('❌ [MONITOR] New chat preparation failed:', error);
      // Fallback - still create new chat but without IndexedDB save
      const newChatId = chatDB.generateChatId();
      updateCurrentChatId(newChatId);
    }
  };

  // Gemini markdown preprocessing helper (without regex)
  const fixGeminiMarkdown = (text) => {
    const lines = text.split('\n');
    const fixed = [];
    let lastNumbered = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Fix duplicate numbering (1. then 1. again)
      if (trimmed.match(/^\d+\./)) {
        const num = parseInt(trimmed.match(/^(\d+)/)[1]);
        if (num === 1 && lastNumbered > 0 && i > 0 && lines[i-1].trim() === '') {
          // Found duplicate 1. after empty line - fix it
          const correctedLine = line.replace(/^(\s*)\d+/, `$1${lastNumbered + 1}`);
          fixed.push(correctedLine);
          lastNumbered++;
        } else {
          fixed.push(line);
          lastNumbered = num;
        }
      }
      // Fix empty bullets
      else if (trimmed === '•') {
        // Skip empty bullet line
        continue;
      }
      // Fix nested bullets with extra spacing
      else if (trimmed.startsWith('•') && i > 0 && lines[i-1].trim() === '•') {
        // Remove extra indentation from nested bullets
        fixed.push('• ' + trimmed.substring(1).trim());
      }
      else {
        fixed.push(line);
        // Reset counter if not a numbered line
        if (!trimmed.match(/^\d+\./) && trimmed !== '') {
          lastNumbered = 0;
        }
      }
    }
    
    return fixed.join('\n');
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

  useEffect(() => {
    inputRef.current = input;
    messagesRef.current = messages;
    uploadedDocumentsRef.current = uploadedDocuments;
  }, [input, messages, uploadedDocuments]);

// 🤖 AI CONVERSATION - WITH STREAMING EFFECT
  const handleSend = useCallback(async (textInput, fromVoice = false) => {
    const currentInput = inputRef.current;
    const currentMessages = messagesRef.current;
    const currentDocuments = uploadedDocumentsRef.current;
    
    const finalTextInput = textInput || currentInput;
    
    if (!finalTextInput.trim() || loading) return;
    
    // 📶 Check if offline - prevent sending
    if (isOffline) {
      console.warn('📵 Cannot send message - device is offline');
      // You could show a toast notification here
      return;
    }
    
    crashMonitor.trackChatOperation('send_message_start', { 
      model, 
      messageLength: finalTextInput.length, 
      fromVoice,
      currentChatId 
    });
    
    // Variables for final save point
    let responseText = '';
    let sourcesToSave = [];
    
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

    const detectedLang = detectLanguage(finalTextInput);
    if (detectedLang !== userLanguage) {
      setUserLanguage(detectedLang);
    }

    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    currentAudioRef.current = null;

    if (!fromVoice) setInput('');
    setLoading(true);

    try {
      // 🔴 [DEBUG] Track currentChatId state at handleSend start
      console.log("🔴 [DEBUG] handleSend start - currentChatId:", currentChatId, "ref:", currentChatIdRef.current);
      
      // 🎯 ENSURE CHAT ID EXISTS - use safe getter to prevent race condition
      let activeChatId = getSafeChatId();
      console.log("🔴 [DEBUG] activeChatId from getSafeChatId():", activeChatId);
      
      if (!activeChatId) {
        activeChatId = chatDB.generateChatId();
        updateCurrentChatId(activeChatId);
        console.log('🔴 [DEBUG] CREATING NEW CHAT - no chatId found! New chatId:', activeChatId);
        console.trace('🔍 [DEBUG] New chat creation call stack:');
      } else {
        console.log('🔴 [DEBUG] Using existing safe chatId:', activeChatId);
      }
      
      const userMessage = { sender: 'user', text: finalTextInput };
      let messagesWithUser = [...currentMessages, userMessage];
      setMessages(messagesWithUser);

      // ❌ REMOVED: Old auto-save from handleSend - moved to AI response locations

      // ✅ REMOVED: First message save logic - using only auto-save every 10 messages

      // 🎨 IMAGE GENERATION MODE
      if (isImageMode) {
        console.log('🎨 Image generation mode - calling Imagen API');
        
        try {
          const response = await fetch('/api/imagen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: finalTextInput,
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
              text: `🎨 Generated image for: "${finalTextInput}"`,
              image: result.images[0], // Contains base64, mimeType, etc.
              isStreaming: false
            };
            
            const finalMessages = [...messagesWithUser, imageMessage];
            
            // 🔄 Check auto-save after image generation
            const cleanedMessages = await checkAutoSave(finalMessages, activeChatId);
            setMessages(cleanedMessages);
            
            // showNotification('Obrázek byl úspěšně vygenerován! 🎨', 'success');
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
          
          // 🔄 Check auto-save after error message
          const cleanedMessages = await checkAutoSave(finalMessages, activeChatId);
          setMessages(cleanedMessages);
          
          showNotification('Chyba při generování obrázku', 'error');
        }
        
        // Reset to chat mode after image generation
        setIsImageMode(false);
        return;
      }

      // Using global responseText variable

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
        responseText = finalText;
        sourcesToSave = sources;
        
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

        // ❌ REMOVED: Save after Claude response (to prevent race conditions)
        
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
        sourcesToSave = [];
        
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

        // ❌ REMOVED: Save after OpenAI response (to prevent race conditions)
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 GPT response complete, processing voice...');
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
        sourcesToSave = sources;
        
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

        // ❌ REMOVED: Save after Grok response (to prevent race conditions)
        
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
          if (finalTextInput.toLowerCase().includes(doc.name.toLowerCase())) {
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
          const explicitlyForget = finalTextInput.toLowerCase().includes(`zapomeň na ${doc.name.toLowerCase()}`);
          if (explicitlyForget) {
            // showNotification(`Zapomínám na dokument "${doc.name}".`, 'info');
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
        
        // Don't update UI during streaming - collect full response first
        
        // Collect full response without showing partial text
        const result = await geminiService.sendMessage(
          messagesWithUser,
          null, // No streaming updates to UI
          () => {
            setIsSearching(true);
            setTimeout(() => setIsSearching(false), 3000);
          },
          detectedLang,
          documentsToPassToGemini
        );
        
        // Apply Gemini markdown preprocessing
        responseText = fixGeminiMarkdown(result.text);
        const sources = result.sources || [];
        sourcesToSave = sources;
        
        console.log('🎯 GEMINI FINAL SOURCES:', sources);
        
        // Final message update with isStreaming: false
        const finalMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: responseText,
          sources: sources,
          isStreaming: false
        }];
        
        // 🔄 Check auto-save after AI response
        const cleanedMessages = await checkAutoSave(finalMessages, activeChatId);
        setMessages(cleanedMessages);

        // ❌ REMOVED: Save after Gemini response (to prevent race conditions)
        
        if (fromVoice && showVoiceScreen && responseText) {
          console.log('🎵 Gemini response complete, processing voice...');
          await processVoiceResponse(responseText, detectedLang);
        }
      }

    } catch (err) {
      crashMonitor.trackChatOperation('send_message_failed', { 
        error: err.message, 
        model, 
        stack: err.stack 
      });
      console.error('💥 API call error:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
      setStreaming(false);
      setIsSearching(false);
      
      // ✅ SINGLE SAVE POINT - Only save when conversation is complete
      if (currentChatId && responseText && !fromVoice) {
        try {
          console.log('💾 [MONITOR] Saving completed conversation:', {
            chatId: currentChatId,
            messageCount: messages.length + 2, // user + AI
            model: model,
            timestamp: new Date().toISOString()
          });
          
          const finalMessages = [...currentMessages, 
            { sender: 'user', text: finalTextInput },
            { sender: 'bot', text: responseText, sources: sourcesToSave || [] }
          ];
          
          // ❌ REMOVED: zbytečné save po každé zprávě - save jen na 4 místech!
          // ❌ REMOVED: zbytečné loadChatHistories - aktualizuje se jen při switch
          
          crashMonitor.trackIndexedDB('conversation_updated', currentChatId, true);
          crashMonitor.trackChatOperation('send_message_success', { 
            model, 
            responseLength: responseText.length,
            sourcesCount: sourcesToSave?.length || 0 
          });
          console.log('✅ [MONITOR] Conversation saved successfully');
          
        } catch (error) {
          crashMonitor.trackIndexedDB('save_conversation', currentChatId, false, error);
          console.error('❌ [MONITOR] IndexedDB save failed:', {
            error: error.message,
            stack: error.stack,
            chatId: currentChatId,
            timestamp: new Date().toISOString()
          });
          
          // No localStorage fallback - IndexedDB save failed but we continue
          sessionManager.saveCurrentChatId(currentChatId);
          console.log('🔄 [MONITOR] IndexedDB save failed, no fallback used');
        }
      } else if (responseText) {
        crashMonitor.trackChatOperation('send_message_success', { 
          model, 
          responseLength: responseText.length,
          fromVoice: true 
        });
      }
    }
  }, [model, isImageMode]);

  const handleTranscript = useCallback(async (text, confidence = 1.0) => {
    console.log('🎙️ Voice transcript received:', { text, confidence });
    
    const detectedLang = detectLanguage(text);
    setUserLanguage(detectedLang);
    console.log('🌍 Voice detected language:', detectedLang);
    
    if (showVoiceScreen) {
      await handleSend(text, true);
    } else {
      setInput(text);
    }
  }, [showVoiceScreen, handleSend]);


  // 📄 HANDLE FILE CLICK - Actually open/download files  
  const handleFileClick = (filename, file) => {
    console.log('📄 File clicked:', filename, file);
    
    if (!file) {
      showNotification(`Soubor ${filename} není dostupný`, 'error');
      return;
    }
    
    try {
      // Create blob URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      // 🛡️ PREVENT STATE LOSS: Monitor document viewer window to preserve chat state
      
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        // For images, open in new tab for viewing
        const newWindow = window.open(fileUrl, '_blank');
        
        // 🛡️ Monitor new window to detect when it closes
        if (newWindow) {
          const checkClosed = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(checkClosed);
              console.log('🔄 Document viewer closed - state preserved');
            }
          }, 1000);
        }
        // showNotification(`Obrázek ${filename} otevřen`, 'success');
      } else {
        // For documents (PDF, etc.), try to open in new tab
        // If browser can display it, it will show inline
        // Otherwise it will download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = filename;
        link.target = '_blank';
        
        // Try to open in new tab first
        const newWindow = window.open(fileUrl, '_blank');
        
        if (!newWindow) {
          // If popup blocked, fall back to download
          link.click();
          // showNotification(`Dokument ${filename} stažen`, 'success');
        } else {
          // 🛡️ Monitor new window to detect when it closes
          const checkClosed = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(checkClosed);
              console.log('🔄 Document viewer closed - state preserved');
            }
          }, 1000);
          // showNotification(`Dokument ${filename} otevřen`, 'success');
        }
      }
      
      // Clean up URL after some time
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 10000);
      
    } catch (error) {
      console.error('Failed to open file:', error);
      showNotification(`Chyba při otevírání souboru ${filename}`, 'error');
    }
  };

  // Custom code component for syntax highlighting
// 🚀 OMNIA - APP.JSX PART 3/3 - JSX RENDER (REDESIGNED podle fotky)
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
  // showNotification(messages.processing, 'info');
  
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
    // showNotification(messages.preparing, 'info');

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
      isHidden: true
    };

    // Add to messages context but don't display to user
    setMessages(prev => [...prev, hiddenContextMessage]);
    // showNotification(messages.success, 'success');
    
  } catch (error) {
    console.error('Document upload error:', error);
    showNotification(error.message || 'Chyba při zpracování dokumentu', 'error');
  } finally {
    setLoading(false);
  }
};

// 📄 HANDLE SEND WITH DOCUMENTS
const handleSendWithDocuments = useCallback(async (text, documents) => {
  const currentMessages = messagesRef.current;
  const currentDocuments = uploadedDocumentsRef.current;
  const currentLoading = loading;
  const currentStreaming = streaming;
  
  // 🛡️ Safety check: Ensure documents is always an array
  const safeDocuments = documents || [];
  
  console.log('📤 Sending with documents:', text, safeDocuments);
  console.log('🔍 DEBUG - text.trim():', `"${text.trim()}"`, 'length:', text.trim().length);
  console.log('🔍 DEBUG - safeDocuments.length:', safeDocuments.length);
  
  if (!text.trim() && safeDocuments.length === 0) return;
  if (currentLoading || currentStreaming) return;
  
  // Add user message to chat immediately (with document info)
  const userMessage = {
    sender: 'user',
    text: text.trim(), // Keep empty if no text - no default message
    attachedFiles: safeDocuments.map(doc => ({
      name: doc.name,
      size: doc.size,
      file: doc.file // Store the actual file for later access
    }))
  };
  // Add message and get current state
  let currentMessagesWithUser;
  setMessages(prev => {
    currentMessagesWithUser = [...prev, userMessage];
    return currentMessagesWithUser;
  });

  // 🔄 AUTO-SAVE + RAM CLEANUP for document handler - každých 50 zpráv
  console.log(`📊 [DOC-AUTO-SAVE-CHECK] Current messages: ${currentMessagesWithUser.length}, Checking auto-save condition...`);
  
  if (currentMessagesWithUser.length % 50 === 0 && currentMessagesWithUser.length > 0 && currentChatId) {
    console.log(`🔄 [DOC-AUTO-SAVE] Trigger: ${currentMessagesWithUser.length} messages - exact multiple of 50!`);
    try {
      await chatDB.saveChatV2(currentChatId, currentMessagesWithUser);
      console.log(`✅ [DOC-AUTO-SAVE] SUCCESS: ${currentMessagesWithUser.length} messages saved to DB`);
      
      // RAM cleanup - ponech jen posledních 50 zpráv
      const beforeCleanup = currentMessagesWithUser.length;
      currentMessagesWithUser = currentMessagesWithUser.slice(-50);
      setMessages(currentMessagesWithUser);
      console.log(`🧹 [DOC-RAM-CLEANUP] ${beforeCleanup} → 50 messages in RAM`);
      console.log(`💾 [DOC-RAM-CLEANUP] ${beforeCleanup - 50} messages moved to DB only`);
      console.log(`📊 [DOC-RAM-STATUS] Current messages in memory: ${currentMessagesWithUser.length}`);
    } catch (error) {
      console.error(`❌ [DOC-AUTO-SAVE] FAILED - NO CLEANUP:`, error);
    }
  }
  
  // Scroll to user's message after sending
  setTimeout(() => {
    smartScrollToBottom(mainContentRef.current, {
      behavior: 'smooth',
      force: true,
      delay: 100
    });
  }, 100);
  
  setLoading(true);
  setStreaming(true);
  
  try {
    // Process documents first and collect them
    const processedDocuments = [];
    
    for (const doc of safeDocuments) {
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
      
      // Use the cleaned messages if cleanup happened, otherwise use current
      const messagesWithUser = currentMessagesWithUser || [...currentMessages, userMessage];
      
      // Get current uploaded documents (including newly processed ones)
      const allDocuments = [...currentDocuments, ...processedDocuments];
      
      // Combine existing and new documents BEFORE sending to AI
      const newActiveDocuments = processedDocuments.map(doc => ({
        uri: doc.geminiFileUri,
        name: doc.name,
        uploadTimestamp: Date.now(),
        lastAccessedTimestamp: Date.now(),
        lastAccessedMessageIndex: messagesWithUser.length
      }));
      
      const allActiveDocuments = [...activeDocumentContexts, ...newActiveDocuments];
      
      // Apply same filtering logic as in handleSend
      let filteredActiveDocs = allActiveDocuments;
      
      // Update timestamps for mentioned documents
      filteredActiveDocs = filteredActiveDocs.map(doc => {
        if ((text || '').toLowerCase().includes(doc.name.toLowerCase())) {
          return { 
            ...doc, 
            lastAccessedTimestamp: Date.now(), 
            lastAccessedMessageIndex: messagesWithUser.length 
          };
        }
        return doc;
      });

      // Filter out old/irrelevant documents based on time and message count
      filteredActiveDocs = filteredActiveDocs.filter(doc => {
        const timeSinceUpload = Date.now() - doc.uploadTimestamp;
        const timeSinceLastAccess = Date.now() - doc.lastAccessedTimestamp;
        const messagesSinceUpload = messagesWithUser.length - doc.lastAccessedMessageIndex;
        const messagesSinceLastAccess = messagesWithUser.length - doc.lastAccessedMessageIndex;
        
        // Rule 1: Very recent upload (5 messages OR 10 minutes from upload)
        const isVeryRecentUpload = messagesSinceUpload <= 5 || timeSinceUpload < 10 * 60 * 1000;
        
        // Rule 2: Recently mentioned (7 messages OR 15 minutes since last access)
        const isRecentlyMentioned = messagesSinceLastAccess <= 7 || timeSinceLastAccess < 15 * 60 * 1000;
        
        // Rule 3: Explicit forget command
        const explicitlyForget = (text || '').toLowerCase().includes(`zapomeň na ${doc.name.toLowerCase()}`);
        if (explicitlyForget) {
          // showNotification(`Zapomínám na dokument "${doc.name}".`, 'info');
          return false;
        }
        
        return isVeryRecentUpload || isRecentlyMentioned;
      });
      
      // Prepare messages for AI - ALWAYS add document context when documents are present
      const messagesForAI = messagesWithUser.map(msg => {
        if (msg === userMessage && processedDocuments.length > 0) {
          // If user provided text, keep it and add document references
          // If no text, just add document references
          const documentReferences = processedDocuments.map(doc => {
            const isImage = doc.name.match(/\.(png|jpe?g|gif|webp)$/i);
            const emoji = isImage ? '🖼️' : '📄';
            return `${emoji} ${doc.name}`;
          }).join('\n');
          
          const combinedText = text.trim() 
            ? `${text.trim()}\n\n${documentReferences}`
            : documentReferences;
          
          console.log('🔍 DEBUG - AI message preparation:');
          console.log('   - Original text:', `"${text.trim()}"`);
          console.log('   - Document references:', documentReferences);
          console.log('   - Combined text for AI:', `"${combinedText}"`);
          
          return {
            ...msg,
            text: combinedText
          };
        }
        return msg;
      });
      
      // Add hidden context message for AI when sending documents
      const hiddenContextMessage = {
        sender: 'system',
        text: `📄 User uploaded ${processedDocuments.length} document(s) for analysis. AI has full access to the document(s) and should analyze them.`,
        isHidden: true
      };
      
      // Add to messages context but don't display to user
      const messagesWithHiddenContext = [...messagesForAI, hiddenContextMessage];
      
      // No streaming for document uploads - same as regular Gemini chat
      
      // Send to Gemini with FILTERED documents only
      const result = await geminiService.sendMessage(
        messagesWithHiddenContext,
        null, // No streaming updates - get full response at once
        (searchMsg) => {
          setIsSearching(true);
          setTimeout(() => setIsSearching(false), 3000);
        },
        detectedLang,
        filteredActiveDocs.map(doc => ({ geminiFileUri: doc.uri, name: doc.name }))
      );
      
      // Update uploadedDocuments state AFTER successful AI response
      if (processedDocuments.length > 0) {
        setUploadedDocuments(prev => [...prev, ...processedDocuments]);
      }
      
      // Update activeDocumentContexts with the filtered list
      setActiveDocumentContexts(filteredActiveDocs);
      
      // Apply Gemini markdown preprocessing to document upload response
      const cleanedText = fixGeminiMarkdown(result.text);
      
      // Add final message - same as regular Gemini chat (no streaming effect)
      const finalMessages = [...messagesWithUser, {
        sender: 'bot',
        text: cleanedText,
        sources: result.sources || [],
        isStreaming: false
      }];
      
      // Check auto-save after AI response
      const cleanedMessages = await checkAutoSave(finalMessages, currentChatId);
      setMessages(cleanedMessages);
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
}, [model, isImageMode]);

// 🎯 MODEL CHANGE HANDLER - Optimized with useCallback
const handleModelChange = useCallback((newModel) => {
  setModel(newModel);
  setShowModelDropdown(false);
}, []);

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
      
      {/* 📌 FIXED TOP BUTTONS - NOTCH/DYNAMIC ISLAND AWARE */}
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
        paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '0',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        minHeight: isMobile ? 'calc(60px + env(safe-area-inset-top))' : '70px',
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
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{model === 'claude' ? 'o1' : model === 'gpt-4o' ? 'o2' : model === 'grok-3' ? 'o3' : 'o4'}</span>
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
                onClick={() => handleModelChange('claude')}
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
                onClick={() => handleModelChange('gpt-4o')}
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
                onClick={() => handleModelChange('grok-3')}
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
                }}>o3</span>
              </button>
              
              <button
                onClick={() => handleModelChange('gemini-2.5-flash')}
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
                }}>o4</span>
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
        className="scrollable"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          padding: isMobile ? '0' : '2rem',
          paddingTop: isMobile 
            ? 'calc(80px + env(safe-area-inset-top))' 
            : '100px', // Space for fixed header + notch/Dynamic Island
          paddingBottom: isMobile 
            ? '240px' 
            : '200px', // More breathing room for scrolling
          width: '100%',
          position: 'relative', // Create proper stacking context
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'none', // Prevent elastic scroll
          WebkitOverscrollBehavior: 'none', // iOS Safari support
          touchAction: 'pan-y', // Only allow vertical scrolling
          transition: 'padding-bottom 0.3s ease-out'
        }}
      >
        <div 
          className={streaming ? 'streaming-breathing' : ''}
          style={{ 
            maxWidth: '1000px', 
            margin: '0 auto',
            minHeight: 'auto',
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: messages.length === 0 ? 'center' : 'flex-end'
        }}>
          
          {/* 🎨 WELCOME SCREEN - když nejsou zprávy */}
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isMobile ? '1.5rem' : '2rem'
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

          {/* 📄 LOADING OLDER MESSAGES INDICATOR */}
          {loadingOlderMessages && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #666',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                {t('loadingOlderMessages') || 'Načítám starší zprávy...'}
              </div>
            </div>
          )}

          {/* 💬 CHAT MESSAGES - UNCHANGED styling */}
          {messages.filter(msg => !msg.isHidden).map((msg, idx) => (
            <div key={idx} data-sender={msg.sender} style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '2rem',
              animation: 'fadeInUp 0.4s ease-out',
              paddingLeft: msg.sender === 'user' && isMobile ? '0' : '1rem',
              paddingRight: msg.sender === 'user' && isMobile ? '0' : '1rem'
            }}>
              {msg.sender === 'user' ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.8rem',
                  width: '100%',
                  paddingLeft: isMobile ? '5%' : '25%',
                  paddingRight: isMobile ? '5%' : '0'
                }}>
                  {/* User text bubble */}
                  {msg.text && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: isMobile ? '1.2rem 1.4rem' : '1.4rem 1.6rem',
                      borderRadius: '25px 25px 8px 25px',
                      fontSize: isMobile ? '1rem' : '0.95rem',
                      lineHeight: isMobile ? '1.3' : '1.6', 
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}>
                      <MessageRenderer 
                        content={msg.text || ''}
                        className="user-message-content"
                      />
                    </div>
                  )}
                  
                  {/* File attachments as separate cards */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      width: '100%'
                    }}>
                      {msg.attachedFiles.map((file, index) => (
                        <div
                          key={index}
                          onClick={() => handleFileClick(file.name, file.file)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                          }}
                        >
                          {/* File icon/thumbnail */}
                          <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'rgba(96, 165, 250, 0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            {file.file && file.file.type.startsWith('image/') ? (
                              <img 
                                src={URL.createObjectURL(file.file)}
                                alt={file.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px'
                                }}
                                onLoad={(e) => {
                                  // Clean up URL after image loads to prevent memory leak
                                  setTimeout(() => {
                                    URL.revokeObjectURL(e.target.src);
                                  }, 1000);
                                }}
                                onError={(e) => {
                                  // Clean up URL even on error
                                  setTimeout(() => {
                                    URL.revokeObjectURL(e.target.src);
                                  }, 1000);
                                }}
                              />
                            ) : (
                              file.name.match(/\.(png|jpe?g|gif|webp)$/i) ? '🖼️' : '📄'
                            )}
                          </div>
                          
                          {/* File info */}
                          <div style={{
                            flex: 1,
                            minWidth: 0
                          }}>
                            <div style={{
                              fontWeight: '500',
                              fontSize: '0.95rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: '0.2rem'
                            }}>
                              {file.name}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              opacity: 0.7
                            }}>
                              {file.size}
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="p-4"
                  style={{
                    width: isMobile ? '95%' : '100%', // Use width instead of maxWidth
                    margin: isMobile ? '0 auto' : '0', // Center the container on mobile
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    lineHeight: isMobile ? '1.3' : '1.6',
                    whiteSpace: 'pre-wrap',
                    color: '#FFFFFF',
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
                  
                  <MessageRenderer 
                    content={msg.text || ''}
                    className="text-white"
                  />
                  
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

      {/* 🔽 SCROLL TO BOTTOM BUTTON - Show when scrolled up */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'fixed',
            bottom: isMobile ? '110px' : '120px', // Above input bar
            right: isMobile ? '20px' : '50px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11, // Above input bar (10) and gradient (9)
            transition: 'all 0.3s ease',
            animation: showScrollToBottom ? 'fadeIn 0.3s ease' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.8)" 
            strokeWidth="2"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </button>
      )}

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
        onNewChatKeepSidebar={handleNewChatKeepSidebar}
        uiLanguage={uiLanguage}
        setUILanguage={setUILanguage}
        chatHistory={chatHistories}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        onChatDeleted={() => {
          // Historie se aktualizuje lazy při příštím otevření sidebaru
          console.log('🗑️ Chat deleted - lazy update on next sidebar open');
        }}
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
        * { box-sizing: border-box; }
        html { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; }
        body { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important; }
        #root { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; display: flex; flex-direction: column; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px) translateZ(0); } 100% { opacity: 1; transform: translateY(0) translateZ(0); } }
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes omnia-pulse { 0%, 100% { box-shadow: 0 0 15px rgba(100, 50, 255, 0.8); transform: scale(1) translateZ(0); } 50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.9); transform: scale(1.05) translateZ(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes omnia-listening { 0% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); } 50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.9); } 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); } }
        
        /* User message markdown styles */
        .user-message-content .markdown-container {
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        .user-message-content .markdown-container strong {
          color: #60A5FA !important;
          font-weight: bold !important;
        }
        .user-message-content .markdown-container code {
          background-color: rgba(0, 0, 0, 0.2) !important;
          color: #93C5FD !important;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .user-message-content .markdown-container pre {
          background-color: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin: 0.5rem 0;
          overflow-x: auto;
          max-width: 100%;
        }
        .user-message-content .markdown-container pre code {
          background-color: transparent !important;
          color: #E5E7EB !important;
          padding: 0;
          white-space: pre;
          word-break: normal;
        }
        .user-message-content .markdown-container ul,
        .user-message-content .markdown-container ol {
          margin-left: 1rem !important;
          color: white !important;
        }
        
        * { -webkit-tap-highlight-color: transparent; }
        @media (max-width: 768px) { input { font-size: 16px !important; } button { min-height: 44px; min-width: 44px; } }
        
        /* Dynamic Island & Notch Specific Optimizations */
        @supports (top: env(safe-area-inset-top)) {
          /* iPhone 14 Pro/15 Pro Dynamic Island */
          @media screen and (device-width: 393px) and (device-height: 852px) {
            .header-area { padding-top: max(1rem, env(safe-area-inset-top)); }
          }
          /* iPhone X/11/12/13 Notch */
          @media screen and (device-width: 375px) and (device-height: 812px) {
            .header-area { padding-top: max(1rem, env(safe-area-inset-top)); }
          }
          /* iPhone Plus models with notch */
          @media screen and (device-width: 414px) and (device-height: 896px) {
            .header-area { padding-top: max(1rem, env(safe-area-inset-top)); }
          }
        }
        
        /* Status bar theming for PWA */
        @media (display-mode: standalone) {
          body { 
            background: linear-gradient(135deg, #000428, #004e92, #009ffd);
          }
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(26, 32, 44, 0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(74, 85, 104, 0.8); border-radius: 4px; }
        button { -webkit-user-select: none; user-select: none; }
        input:focus { outline: none !important; }
      `}</style>
      
      
      {/* 📶 OFFLINE INDICATOR */}
      <OfflineIndicator
        isOnline={isOnline}
        connectionType={connectionType}
        connectionInfo={connectionInfo}
        uiLanguage={uiLanguage}
        position="top-left"
      />
    </div>
  );
};

export default App;