// 🚀 OMNIA - APP.JSX PART 1/3 - IMPORTS + STATE + EFFECTS (REDESIGNED)
// ✅ ADDED: ChatSidebar + NewChatButton imports
// ✅ ADDED: welcomeTexts for multilingual welcome
// ✅ SIMPLIFIED: Removed complex scroll system
// 🎯 UNCHANGED: Všechny původní importy a funkčnost
// 🆕 STREAMING: Added streamingUtils import

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Menu, ChevronDown } from 'lucide-react';
import './App.css';
import { Virtuoso } from 'react-virtuoso';
import MDEditor from '@uiw/react-md-editor';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

// 🔧 IMPORT SERVICES (MODULAR)
import { claudeService, openaiService, grokService, geminiService } from './services/ai';
import { elevenLabsService } from './services/voice';
import authService from './services/auth/supabaseAuth'; // 🔐 Auth service
import { chatSyncService } from './services/sync/chatSync.js'; // 🔄 Chat sync service

// 🔧 IMPORT UTILS (MODULAR + STREAMING)
import { uiTexts, getTranslation, detectLanguage, sanitizeText } from './utils/text';
import { sessionManager } from './services/storage';
import chatDB from './services/storage/chatDB'; // 💾 IndexedDB for chat history
import { smartIncrementalSave } from './services/storage/smartSave.js';
import { crashMonitor } from './utils/crashMonitor';
import { streamMessageWithEffect, smartScrollToBottom } from './utils/ui'; // 🆕 STREAMING
import mobileAudioManager from './utils/MobileAudioManager.js'; // 🎵 Mobile audio handling
import * as styles from './styles/ChatStyles.js'; // 🎨 All chat styles
import { generateMessageId } from './utils/messageUtils.js'; // 📝 Message utilities
import { welcomeTexts, getTimeBasedGreeting } from './constants/welcomeTexts.js'; // 🌍 Welcome texts
import { createNotificationSystem } from './utils/notificationUtils.js'; // 🔔 Notifications
import { convertFileToBase64 } from './utils/fileUtils.js'; // 📁 File utilities
import { uploadToSupabaseStorage, uploadBase64ToSupabaseStorage } from './services/storage/supabaseStorage.js'; // 📦 Supabase Storage
import { getUploadErrorMessages } from './constants/errorMessages.js'; // 🚨 Error messages
import { uploadDirectToGCS, processGCSDocument, shouldUseDirectUpload, formatFileSize } from './services/directUpload.js'; // 🗂️ Direct upload to GCS
import { scrollToUserMessageAt, scrollToLatestMessage, scrollToBottom } from './utils/scrollUtils.js'; // 📜 Scroll utilities
import { convertMessagesForOpenAI } from './utils/messageConverters.js'; // 🔄 Message format converters

// 🔧 IMPORT UI COMPONENTS (MODULAR)
import { SettingsDropdown, OmniaLogo, MiniOmniaLogo, OfflineIndicator, SplashScreen } from './components/ui';

import { VoiceScreen } from './components/chat';
import MessageItem from './components/chat/MessageItem';

// 🆕 IMPORT INPUT BAR (MODULAR)
import { InputBar } from './components/input';

// 🔗 IMPORT SOURCES COMPONENTS (UNCHANGED)
import { SourcesModal } from './components/sources';

// 🆕 NEW COMPONENTS - Added for redesign
import { ChatSidebar } from './components/layout';
import DocumentViewer from './components/modals/DocumentViewer.jsx'; // 📄 Document viewer
import AuthModal from './components/auth/AuthModal.jsx'; // 🔐 Auth modal
import ResetPasswordModal from './components/auth/ResetPasswordModal.jsx'; // 🔐 Reset password modal

// 📶 HOOKS - For offline detection
import { useOnlineStatus } from './hooks/useOnlineStatus';


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
  const [previewImage, setPreviewImage] = useState(null); // For fullscreen photo preview
  const [documentViewer, setDocumentViewer] = useState({ isOpen: false, document: null }); // For document viewer
  const [isRecordingSTT, setIsRecordingSTT] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  
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
  
  // 🔐 AUTH STATE - for Supabase authentication
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const currentChatIdRef = useRef(null); // 🔧 useRef backup to prevent race condition
  const [chatHistories, setChatHistories] = useState([]);
  
  // 🔄 Sync dirty tracking - for 30s incremental sync
  const [syncDirtyChats, setSyncDirtyChats] = useState(new Set());

  // 🎬 SPLASH SCREEN STATE - PWA startup animation
  const [showSplashScreen, setShowSplashScreen] = useState(true);

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
  
  // 🎨 BREATHING ANIMATION - Removed for performance (now using CSS only)
  
  // 🔽 SCROLL TO BOTTOM - Show button when user scrolled up
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [shouldFollowOutput, setShouldFollowOutput] = useState(true); // Follow output when chat opens
  
  // Reset followOutput when switching chats or loading new messages
  useEffect(() => {
    setShouldFollowOutput(true);
    
    // Explicitly scroll to bottom when chat opens
    if (virtuosoRef.current && messages.length > 0) {
      // Small delay to ensure Virtuoso is ready
      setTimeout(() => {
        virtuosoRef.current.scrollToIndex({
          index: messages.length - 1,
          behavior: 'smooth'
        });
      }, 100);
    }
    
    // Disable followOutput after a short delay 
    const timer = setTimeout(() => {
      setShouldFollowOutput(false);
    }, 1500); // 1.5 seconds to scroll to bottom, then disable
    
    return () => clearTimeout(timer);
  }, [currentChatId]); // Trigger only when switching chats
  
  // ❌ REMOVED: All scroll limit logic - keeping only spacer
  
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
  const virtuosoRef = useRef(null);
  
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
    
    // Service Worker is now handled automatically
  }, []);


  // 🔐 AUTH INITIALIZATION - Test Supabase connection
  useEffect(() => {
    let subscription;
    
    const initAuth = async () => {
      console.log('🔐 Testing Supabase auth connection...');
      
      try {
        // Get current user if exists
        const currentUser = await authService.getCurrentUser();
        console.log('👤 Current user:', currentUser?.email || 'Not logged in');
        setUser(currentUser);
        
        // ⚡ Smart sync: Full sync if DB is empty, incremental if has data
        if (currentUser) {
          // Check if IndexedDB is empty (after sign out or fresh install)
          const localChats = await chatDB.getAllChats();
          
          if (localChats.length === 0) {
            console.log('📥 [SYNC] Empty IndexedDB detected, starting FULL sync...');
            chatSyncService.clearSyncCooldown();
            try {
              await chatSyncService.fullSync();
            } catch (error) {
              console.error('❌ [SYNC] Full sync failed:', error);
            }
          } else {
            console.log('⚡ [SYNC] Local chats found, starting incremental sync...');
            chatSyncService.clearSyncCooldown();
            try {
              await chatSyncService.backgroundSync(); // Now calls incrementalSync() internally
            } catch (error) {
              console.error('❌ [SYNC] Background sync failed:', error);
            }
          }
        }
        
        // Listen to auth changes
        // Track if we're already signed in to avoid PWA wake sync loops
        let isAlreadySignedIn = !!currentUser; // Set to true if user already logged in
        
        subscription = authService.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth event:', event);
          console.log('🔄 Session user:', session?.user?.email || 'No user in session');
          setUser(session?.user || null);
          
          // 🔄 Start background sync ONLY for real logins, not PWA wake events
          if (session?.user && event === 'SIGNED_IN') {
            if (isAlreadySignedIn) {
              // PWA wake with existing session - skip unnecessary sync
              console.log('✅ [SYNC] PWA wake with existing session, skipping unnecessary sync');
              return;
            }
            
            // Real login - do full sync with ghost cleanup (only time we need full sync)
            console.log('🚀 [SYNC] Real user login, starting full sync with ghost cleanup...');
            isAlreadySignedIn = true;
            try {
              await chatSyncService.fullSync(); // Only genuine first login needs full sync
            } catch (error) {
              console.error('❌ [SYNC] Full sync failed:', error);
            }
          } else if (event === 'SIGNED_OUT') {
            // Reset flag on logout
            isAlreadySignedIn = false;
          }
        });
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setAuthLoading(false);
        console.log('✅ Auth loading complete');
      }
    };
    
    initAuth();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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

// 🔔 NOTIFICATION SYSTEM - Initialize with setIsSearching callback
  const { showNotification } = createNotificationSystem(setIsSearching);

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



  // 🔐 AUTH HANDLERS
  const handleSignOut = async () => {
    try {
      // 🧹 STEP 1: Clear IndexedDB first (prevent data mixing between users)
      console.log('🧹 Clearing IndexedDB before logout...');
      await chatDB.clearAllData();
      
      // 🧹 STEP 2: Clear all React state immediately
      setMessages([]);
      setCurrentChatId(null);
      setChatHistories([]);
      sessionManager.clearSession();
      
      // 🔐 STEP 3: Sign out from Supabase
      const { error } = await authService.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        return;
      }
      
      // ✅ STEP 4: Clear user and close UI
      console.log('✅ User signed out successfully with clean IndexedDB');
      setUser(null);
      
      // Close sidebar
      setShowChatSidebar(false);
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  // 🔐 RESET PASSWORD HANDLER
  const handleResetPassword = () => {
    setShowResetPasswordModal(true);
  };

  // 🔐 AUTH SUCCESS HANDLER - Clear cooldown and sync immediately
  const handleAuthSuccess = async (authenticatedUser) => {
    console.log('✅ User authenticated successfully:', authenticatedUser?.email);
    
    // Set the user first
    setUser(authenticatedUser);
    
    // Clear sync cooldown for immediate sync
    chatSyncService.clearSyncCooldown();
    
    // Start immediate full sync for the new user (first time setup)
    console.log('🚀 [SYNC] Starting immediate full sync for new user signup...');
    try {
      await chatSyncService.fullSync(); // New user needs full sync setup
    } catch (error) {
      console.error('❌ [SYNC] Initial sync failed:', error);
    }
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
    // ❌ REMOVED problematic save - prevents chat resurrection after delete
    handleNewChat();
    const newKeepSidebarId = chatDB.generateChatId();
    updateCurrentChatId(newKeepSidebarId);
    // ❌ REMOVED: loadChatHistories() - historie se aktualizuje lazy
    // Note: sidebar stays open
  };

  // 📚 CHAT TITLES FUNCTION - Only metadata, no full messages
  const loadChatTitles = async () => {
    try {
      const startTime = performance.now();
      
      const titles = await chatDB.getChatTitles(); // ONLY titles/metadata - NO messages
      setChatHistories(titles);
      
      const loadTime = performance.now() - startTime;
      
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
        const wasSaved = await smartIncrementalSave(currentChatId, messages);
        if (wasSaved) {
          setSyncDirtyChats(prev => new Set(prev).add(currentChatId));
        }
        if (wasSaved) {
          crashMonitor.trackIndexedDB('save', currentChatId, true);
        }
      }
      
      // 📖 Load selected chat - V2 BOTTOM-FIRST LOADING
      
      // V2: Load ALL messages for chat (unlimited - Virtuoso optimized)
      const chatData = await chatDB.getAllMessagesForChat(chatId);
      if (!chatData || chatData.messages.length === 0) {
        crashMonitor.trackIndexedDB('load', chatId, false, new Error('Chat not found or empty'));
        console.warn('⚠️ [MONITOR-V2] Chat not found or empty:', chatId);
        return;
      }
      
      console.log(`✅ [MONITOR-V2] V2 Loading successful: ${chatData.messages.length}/${chatData.totalCount} messages`);
      console.log(`🎯 [MONITOR-V2] BOTTOM-FIRST: Chat opens on latest messages, ${chatData.hasMore ? 'has' : 'no'} older messages`);
      
      // V2 chatData structure is already correct: { messages, totalCount, hasMore, loadedRange }
      
      if (chatData && chatData.messages.length > 0) {
        // 🧹 EXPLICIT MEMORY CLEAR: Remove old chat from RAM before loading new one
        console.log('🧹 [MEMORY] Clearing RAM before loading new chat');
        setMessages([]); // Clear old messages from memory first
        
        // 🔄 Load new chat into clean memory
        setMessages(chatData.messages);
        updateCurrentChatId(chatId);
        // V2: No offset tracking needed - using timestamp-based pagination
        crashMonitor.trackIndexedDB('load', chatId, true);
        crashMonitor.trackChatOperation('switch_chat_success', { 
          chatId, 
          messageCount: chatData.messages.length,
          totalMessages: chatData.totalCount,
          hasMore: chatData.hasMore
        });
        
        // ✅ REMOVED: setTimeout scroll - was causing race condition with other scroll logic
      } else if (chatData && chatData.messages.length === 0) {
        // 🧹 MEMORY CLEAR: Empty chat - ensure RAM is clean
        setMessages([]);
        updateCurrentChatId(chatId);
        // V2: No offset tracking needed
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
    }
  };


  // 🔄 INITIALIZATION - Create chat ID but don't load messages (lazy loading)
  React.useEffect(() => {
    const initializeChat = async () => {
      
      let chatIdToUse = currentChatId;
      
      if (!chatIdToUse) {
        const newId = chatDB.generateChatId();
        updateCurrentChatId(newId);
        chatIdToUse = newId;
      } else {
      }
      
      // ✅ LAZY LOADING: Don't load messages at startup - only when user selects chat
      setMessages([]);
    };
    
    initializeChat();
  }, []);

  // ❌ REMOVED: Auto-scroll useEffect - scroll now handled directly in handleSend functions
  // This prevents conflicts between multiple scroll systems

  // 💾 Strategic save point #5: Save chat on page visibility change (more reliable than beforeunload)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      // Primary save trigger for PWA (minimize, app switch)
      if (document.hidden && currentChatId && messages.length > 0) {
        
        smartIncrementalSave(currentChatId, messages).then(() => {
          setSyncDirtyChats(prev => new Set(prev).add(currentChatId));
        }).catch(error => {
          console.error('❌ Failed smart save on visibility change:', error);
        });
        
        sessionManager.saveCurrentChatId(currentChatId);
      }
    };

    const handleBeforeUnload = () => {
      // Emergency backup for PWA force close - also uses smart save
      if (currentChatId && messages.length > 0) {
        
        smartIncrementalSave(currentChatId, messages).then(() => {
          setSyncDirtyChats(prev => new Set(prev).add(currentChatId));
        }).catch(error => {
          console.error('❌ Failed emergency smart save on close:', error);
        });
        
        sessionManager.saveCurrentChatId(currentChatId);
      }
    };

    // PWA Hybrid save system: both events use smartIncrementalSave (prevents duplicates)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Keep beforeunload as emergency backup for PWA force close
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentChatId, messages]);

  // 🎨 BREATHING ANIMATION - Pure CSS animation (performance optimized)
  // Note: Removed JavaScript animation loop to improve performance by ~95%
  
  // 🔄 30-SECOND INCREMENTAL SYNC TIMER
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (syncDirtyChats.size > 0 && navigator.onLine) {
        console.log(`⏰ [SYNC-TIMER] Processing ${syncDirtyChats.size} dirty chats for sync`);
        
        // Process each dirty chat
        for (const chatId of syncDirtyChats) {
          try {
            console.log(`📤 [SYNC-TIMER] Syncing chat: ${chatId}`);
            await chatSyncService.autoSyncMessage(chatId);
            
            // Remove from dirty set after successful sync
            setSyncDirtyChats(prev => {
              const newSet = new Set(prev);
              newSet.delete(chatId);
              return newSet;
            });
            
            console.log(`✅ [SYNC-TIMER] Successfully synced chat: ${chatId}`);
          } catch (error) {
            console.error(`❌ [SYNC-TIMER] Failed to sync chat ${chatId}:`, error);
            // Keep in dirty set to retry next interval
          }
        }
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(syncInterval);
  }, [syncDirtyChats]);


  // 🔄 AUTO-SAVE HELPER - volá se po přidání AI response
  const checkAutoSave = async (allMessages, chatId = currentChatId) => {
    
    if (!chatId || allMessages.length === 0) {
      return allMessages;
    }
    
    // 🆕 CRITICAL SAVE: First conversation protection (user + bot)
    if (allMessages.length === 2) {
      console.log('💾 [CRITICAL-SAVE] First conversation, saving immediately');
      try {
        await smartIncrementalSave(chatId, allMessages);
        // Immediate sync for critical first messages
        await chatSyncService.autoSyncMessage(chatId);
        // Remove from dirty set since we just synced (prevent duplicate sync)
        setSyncDirtyChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
      } catch (error) {
        console.error('❌ [CRITICAL-SAVE] First message save failed:', error);
      }
      return allMessages;
    }
    
    // 💾 AUTO-SAVE - každá zpráva pro maximální bezpečnost
    if (allMessages.length > 0) {
      try {
        await smartIncrementalSave(chatId, allMessages);
        setSyncDirtyChats(prev => new Set(prev).add(chatId));
      } catch (error) {
        console.error(`❌ [AUTO-SAVE] FAILED:`, error);
      }
    }
    
    // 🪟 SLIDING WINDOW - Memory management handled by loadOlderMessages only
    // Removed fixed RAM cleanup to prevent conflicts with scroll loading
    
    return allMessages; // No cleanup, return original
  };

  // ❌ REMOVED: Auto-scroll useEffect - caused scrolling on AI responses too
  // Now scroll happens ONLY when user sends message, in handleSend function


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
      
      // 🔧 ENABLED: ElevenLabs TTS as primary with Google fallback
      console.log('🎵 Using elevenLabsService.generateSpeech (same as VoiceButton)');
      
      try {
        const audioBlob = await elevenLabsService.generateSpeech(textToSpeak);
        console.log('✅ ElevenLabs TTS success in generateAudioForSentence');
        return audioBlob;
      } catch (error) {
        console.warn('⚠️ ElevenLabs TTS failed, using Google TTS fallback...', error);
        
        // 🔧 FALLBACK: Use Google TTS with language detection
        const actualLanguage = detectLanguage(textToSpeak);
        console.log('🌍 Language detection for Google fallback:', {
          parameterLanguage: language,
          detectedFromText: actualLanguage,
          using: actualLanguage
        });
        
        const googleResponse = await fetch('/api/google-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ 
            text: textToSpeak,  // Use sanitized text
            language: actualLanguage, // Use detected language from text!
            voice: 'natural'
          })
        });
        
        if (!googleResponse.ok) {
          throw new Error(`Google TTS fallback failed: ${googleResponse.status}`);
        }
        
        console.log('✅ Google TTS fallback success');
        return await googleResponse.blob();
      }
      
    } catch (error) {
      console.error('💥 Google TTS failed:', error);
      throw error;
    }
  };

  // 🎵 VOICE PROCESSING - WEB AUDIO API VIA MOBILE AUDIO MANAGER
  const processVoiceResponse = async (responseText, language) => {
    console.log('🎵 Processing voice response - WEB AUDIO API MODE:', {
      textLength: responseText.length,
      language: language
    });
    
    try {
      const audioBlob = await generateAudioForSentence(responseText, language);
      
      // Use mobileAudioManager with Web Audio API (maintains unlocked context)
      setIsAudioPlaying(true);
      await mobileAudioManager.playAudio(audioBlob);
      setIsAudioPlaying(false);
      
      console.log('✅ Web Audio API playing successfully via mobileAudioManager');
      
    } catch (error) {
      console.error('❌ Failed to generate/play audio via Web Audio API:', error);
      setIsAudioPlaying(false);
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

      // Audio level monitoring for reactive dots
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!isRecordingSTT) return;
        
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 50, 1);
        setAudioLevel(normalizedLevel);
        
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();

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
        audioContext.close();
        setIsRecordingSTT(false);
        setAudioLevel(0);
        
        if (recordingDuration < 1000) {
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        if (audioBlob.size < 1000) {
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
      setAudioLevel(0);
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
      // ❌ REMOVED problematic save - prevents chat resurrection (same fix as handleNewChatKeepSidebar)

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
      
    
      // Create new chat ID for history tracking
      const newChatId = chatDB.generateChatId();
      updateCurrentChatId(newChatId);
      
      crashMonitor.trackChatOperation('new_chat_success', { newChatId });
      
    } catch (error) {
      crashMonitor.trackChatOperation('new_chat_failed', { error: error.message });
      console.error('❌ [MONITOR] New chat preparation failed:', error);
      // Fallback - still create new chat but without IndexedDB save
      const newChatId = chatDB.generateChatId();
      updateCurrentChatId(newChatId);
    }
  };



  // 🆕 VOICE SCREEN OPEN/CLOSE WITH GEMINI FORCE (UPDATED)
  const handleVoiceScreenOpen = async () => {
    setShowVoiceScreen(true);
    
    if (model !== 'gemini-2.5-flash') {
      console.log('🎤 Voice mode: Auto-switching to Gemini for cost-effective responses');
      setPreviousModel(model);
      setModel('gemini-2.5-flash');
    }
    
    console.log('🔓 Attempting audio unlock on VoiceScreen open...');
    try {
      await mobileAudioManager.unlockAudioContext();
      console.log('✅ VoiceScreen audio unlock completed');
    } catch (error) {
      console.error('❌ VoiceScreen audio unlock failed:', error);
    }
  };

  const handleVoiceScreenClose = () => {
    // 🔧 CRITICAL: Stop all audio playback when closing voice chat
    console.log('🛑 Stopping all audio playback on voice chat close...');
    mobileAudioManager.stop();
    setIsAudioPlaying(false);
    
    setShowVoiceScreen(false);
    
    if (previousModel && previousModel !== 'gemini-2.5-flash') {
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
    // ❌ REMOVED: Scroll limit logic
    
    const currentInput = inputRef.current;
    const currentMessages = messagesRef.current;
    const currentDocuments = uploadedDocumentsRef.current;
    
    const finalTextInput = textInput || currentInput;
    
    if (!finalTextInput.trim() || loading) return;
    
    // Transform single newlines to double newlines for proper markdown rendering in user messages
    const userMessageText = finalTextInput.replace(/\n/g, '\n\n');
    
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
      
      // 🎯 ENSURE CHAT ID EXISTS - use safe getter to prevent race condition
      let activeChatId = getSafeChatId();
      
      if (!activeChatId) {
        activeChatId = chatDB.generateChatId();
        updateCurrentChatId(activeChatId);
        console.trace('🔍 [DEBUG] New chat creation call stack:');
      } else {
      }
      
      const userTimestamp = Date.now();
      const userMessage = { 
  id: generateMessageId(),
  sender: 'user', 
  text: userMessageText,
  timestamp: userTimestamp
};
      
      let messagesWithUser = [...currentMessages, userMessage];
      setMessages(messagesWithUser);

      // 🔼 SCROLL TO THIS USER MESSAGE immediately after adding it (fixed large spacer)
      const newUserMessageIndex = messagesWithUser.length - 1; // Index nové user zprávy
      
      scrollToUserMessageAt(virtuosoRef, newUserMessageIndex); // Scroll to the new user message

      // ❌ REMOVED: Old auto-save from handleSend - moved to AI response locations

      // ✅ REMOVED: First message save logic - using only auto-save every 10 messages

      // 🎨 IMAGE GENERATION MODE
      if (isImageMode) {
        
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
            const t = getTranslation(detectedLang);
            
            // Upload generated image to Supabase Storage
            let imageData = result.images[0];
            let storageUrl = null;
            let storagePath = null;
            
            try {
              // Convert base64 to data URI if needed
              const base64String = imageData.base64.startsWith('data:') 
                ? imageData.base64 
                : `data:${imageData.mimeType};base64,${imageData.base64}`;
              
              // Upload to Supabase Storage
              const uploadResult = await uploadBase64ToSupabaseStorage(
                base64String,
                `generated-${Date.now()}.png`,
                'generated-images'
              );
              
              storageUrl = uploadResult.publicUrl;
              storagePath = uploadResult.path;
              
              console.log('✅ Generated image uploaded to Supabase Storage:', storageUrl);
            } catch (uploadError) {
              console.error('Failed to upload generated image to Storage:', uploadError);
              // Continue with base64 if upload fails
            }
            
            const imageMessage = {
              id: generateMessageId(),
              sender: 'bot',
              text: `${t('imageGenerated')} "${finalTextInput}"`,
              image: {
                // Keep only essential metadata and Storage URLs for database
                mimeType: imageData.mimeType,
                width: imageData.width,
                height: imageData.height,
                storageUrl, // Storage URL for database and display
                storagePath, // Storage path for operations
                // Keep base64 temporarily for immediate display
                base64: storageUrl ? undefined : imageData.base64
              },
              timestamp: Date.now() + 100,
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
            id: generateMessageId(),
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
        const botTimestamp = Date.now() + 1; // +1ms to ensure bot comes after user
        
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
          id: generateMessageId(),
          sender: 'bot', 
          text: finalText,
          sources: sources,
          isStreaming: false,
          timestamp: botTimestamp
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
          id: generateMessageId(),
          sender: 'bot', 
          text: responseText,
          sources: [],
          isStreaming: false
        }];

        // ❌ REMOVED: Save after OpenAI response (to prevent race conditions)
        
        // 🔍 DEBUG: Check TTS conditions for GPT
        console.log('🔍 [DEBUG] GPT TTS Conditions:', { fromVoice, responseText: !!responseText });
        
        if (fromVoice && responseText) {
          console.log('🎵 GPT response complete, processing voice...');
          setTimeout(async () => {
            await processVoiceResponse(responseText, detectedLang);
          }, 500);
        } else {
          console.log('❌ [DEBUG] GPT TTS skipped');
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
          id: generateMessageId(),
          sender: 'bot', 
          text: responseText,
          sources: sources,
          isStreaming: false
        }];

        // ❌ REMOVED: Save after Grok response (to prevent race conditions)
        
        if (fromVoice && responseText) {
          console.log('🎵 Grok response complete, processing voice...');
          setTimeout(async () => {
            await processVoiceResponse(responseText, detectedLang);
          }, 500);
        }
      }
      
      else if (model === 'gemini-2.5-flash') {
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
        
        // 🚀 PROGRESSIVE STREAMING: Process chunks immediately as they arrive
        let geminiSources = [];
        let accumulatedText = ''; // Track total text for final save
        const botTimestamp = Date.now() + 100; // +100ms to ensure bot comes after user
        let messageCreated = false;
        
        const result = await geminiService.sendMessage(
          messagesWithUser,
          (chunk, isStreaming, sources = []) => {
            // Update sources immediately
            if (sources.length > 0) {
              geminiSources = sources;
            }
            
            // Accumulate text for final save
            accumulatedText += chunk;
            
            if (chunk.trim()) {
              // Immediate processing: 50ms delay for markdown then word-by-word
              setTimeout(() => {
                const words = chunk.split(' ').filter(w => w.trim());
                
                words.forEach((word, index) => {
                  setTimeout(() => {
                    setMessages(prev => {
                      const lastIndex = prev.length - 1;
                      
                      if (!messageCreated) {
                        // Create initial bot message with first word
                        messageCreated = true;
                        const newMessage = {
                          id: generateMessageId(),
                          sender: 'bot',
                          text: word,
                          isStreaming: true,
                          sources: geminiSources,
                          timestamp: botTimestamp
                        };
                        return [...prev, newMessage];
                      } else {
                        // Append words to existing message
                        if (lastIndex >= 0 && prev[lastIndex]?.sender === 'bot') {
                          const updated = [...prev];
                          updated[lastIndex] = {
                            ...updated[lastIndex],
                            text: updated[lastIndex].text + ' ' + word,
                            sources: geminiSources
                          };
                          return updated;
                        }
                        return prev;
                      }
                    });
                  }, index * 10); // 10ms delay between words
                });
              }, 50); // 50ms delay for markdown processing
            }
            
            if (!isStreaming) {
              // Hide loading indicators when streaming complete
              setIsSearching(false);
              setLoading(false);
              setStreaming(false);
              
              // Mark message as complete
              setTimeout(() => {
                setMessages(prev => {
                  const lastIndex = prev.length - 1;
                  if (lastIndex >= 0 && prev[lastIndex]?.sender === 'bot') {
                    const updated = [...prev];
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      isStreaming: false
                    };
                    return updated;
                  }
                  return prev;
                });
              }, 100);
            }
          },
          () => {
            setIsSearching(true);
            setTimeout(() => setIsSearching(false), 3000);
          },
          detectedLang,
          documentsToPassToGemini
        );
        
        // Use accumulated text for saving
        responseText = accumulatedText;
        const sources = geminiSources.length > 0 ? geminiSources : (result.sources || []);
        sourcesToSave = sources;
        
        console.log('🎯 GEMINI FINAL SOURCES:', sources);
        
        // Messages already updated via streaming, just check auto-save
        const currentMessages = [...messagesWithUser, { 
          id: generateMessageId(),
          sender: 'bot', 
          text: responseText,
          sources: sources,
          isStreaming: false,
          timestamp: botTimestamp // Use same timestamp as streaming
        }];
        
        // 🔄 Check auto-save after AI response
        const cleanedMessages = await checkAutoSave(currentMessages, activeChatId);
        setMessages(cleanedMessages);
        
        // ❌ REMOVED: Scroll limit activation

        // ❌ REMOVED: Save after Gemini response (to prevent race conditions)
        
        // 🔍 DEBUG: Check TTS conditions (removed showVoiceScreen requirement)
        console.log('🔍 [DEBUG] TTS Conditions Check:', {
          fromVoice,
          responseText: responseText ? `"${responseText.substring(0, 50)}..."` : 'null',
          responseLength: responseText?.length || 0,
          willPlayTTS: !!(fromVoice && responseText)
        });
        
        if (fromVoice && responseText) {
          console.log('🎵 Gemini response complete, processing voice...');
          setTimeout(async () => {
            await processVoiceResponse(responseText, detectedLang);
          }, 500);
        } else {
          console.log('❌ [DEBUG] TTS skipped - conditions not met');
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
            { id: generateMessageId(), sender: 'user', text: finalTextInput },
            { id: generateMessageId(), sender: 'bot', text: responseText, sources: sourcesToSave || [] }
          ];
          
          // ❌ REMOVED: zbytečné save po každé zprávě - save jen na 4 místech!
          // ❌ REMOVED: zbytečné loadChatHistories - aktualizuje se jen při switch
          
          crashMonitor.trackIndexedDB('conversation_updated', currentChatId, true);
          crashMonitor.trackChatOperation('send_message_success', { 
            model, 
            responseLength: responseText.length,
            sourcesCount: sourcesToSave?.length || 0 
          });
          
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

  // Close photo preview and cleanup
  const closePreview = () => {
    if (previewImage?.url) {
      URL.revokeObjectURL(previewImage.url);
    }
    setPreviewImage(null);
  };

  // 🔄 Helper function to convert File object to base64 string


  // Custom code component for syntax highlighting
// 🚀 OMNIA - APP.JSX PART 3/3 - JSX RENDER (REDESIGNED podle fotky)
// ✅ NEW: Single gradient background + fixed top buttons + multilingual welcome
// ✅ NEW: Logo zmizí po první zprávě + clean layout
// 🎯 UNCHANGED: Chat messages, sources, copy buttons - vše stejné


// Helper function to check supported file extensions (fallback for MIME type detection)
const isFileExtensionSupported = (fileName) => {
  if (!fileName) return false;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  const supportedExtensions = [
    // Documents
    'pdf',
    // Images
    'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif', 'gif',
    // Text files
    'txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'htm',
    'xml', 'yaml', 'yml', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go',
    'sql', 'csv', 'log', 'config', 'ini', 'env'
  ];
  
  return supportedExtensions.includes(extension);
};

const handleDocumentUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const messages = getUploadErrorMessages(userLanguage);
  
  // Check if it's supported format
  const supportedTypes = [
    // Documents
    'application/pdf',        // PDF
    // Images  
    'image/png',             // PNG  
    'image/jpeg',            // JPEG/JPG
    'image/bmp',             // BMP
    'image/tiff',            // TIFF/TIF
    'image/gif',             // GIF
    // Text files
    'text/plain',            // TXT
    'text/markdown',         // MD
    'application/json',      // JSON
    'application/javascript', // JS
    'text/javascript',       // JS (alternative)
    'text/jsx',              // JSX
    'text/typescript',       // TS/TSX
    'text/css',              // CSS
    'text/html'              // HTML
  ];
  
  // Check MIME type or fallback to file extension for better compatibility
  const isSupported = supportedTypes.includes(file.type) || 
                      isFileExtensionSupported(file.name);
  
  if (!isSupported) {
    showNotification(messages.pdfOnly, 'error');
    return;
  }
  
  // Check file size - now supporting much larger files with direct upload
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB for direct upload
  if (file.size > MAX_FILE_SIZE) {
    showNotification(`Soubor je příliš velký. Maximální velikost je ${MAX_FILE_SIZE / (1024 * 1024)} MB.`, 'error');
    return;
  }

  // Check daily upload limit - increased for direct upload
  const DAILY_LIMIT = 200 * 1024 * 1024; // 200 MB daily limit with direct upload
  const todayUploaded = JSON.parse(localStorage.getItem('dailyUploads') || '{"date": "", "bytes": 0}');
  const today = new Date().toDateString();

  // Reset if new day
  if (todayUploaded.date !== today) {
    todayUploaded.date = today;
    todayUploaded.bytes = 0;
  }

  // Check if adding this file would exceed daily limit
  if (todayUploaded.bytes + file.size > DAILY_LIMIT) {
    const remainingMB = Math.max(0, (DAILY_LIMIT - todayUploaded.bytes) / (1024 * 1024)).toFixed(1);
    showNotification(messages.dailyLimit ? messages.dailyLimit(remainingMB) : `Denní limit překročen. Zbývá ${remainingMB} MB.`, 'error');
    return;
  }
  
  setLoading(true);
  console.log(`📤 [UPLOAD] Starting upload: ${file.name} (${formatFileSize(file.size)})`);
  
  // Decide upload method based on file size and type
  const useDirectUpload = shouldUseDirectUpload(file);
  console.log(`🎯 [UPLOAD] Using ${useDirectUpload ? 'DIRECT' : 'TRADITIONAL'} upload method`);
  
  try {
    let result;
    
    if (useDirectUpload) {
      // 🚀 DIRECT UPLOAD TO GCS - bypasses Vercel limits
      
      // Progress callback for user feedback
      const onProgress = (progress) => {
        console.log(`⬆️ [DIRECT-UPLOAD] Progress: ${progress.percent}% (${formatFileSize(progress.loaded)}/${formatFileSize(progress.total)})`);
        // TODO: Add progress UI if needed
      };
      
      // Upload directly to GCS
      const uploadResult = await uploadDirectToGCS(file, onProgress);
      
      // Process document from GCS
      console.log('🔄 [DIRECT-UPLOAD] Processing document...');
      result = await processGCSDocument(uploadResult.gcsUri, uploadResult.originalName);
      
      // Add GCS metadata to result
      result.gcsUri = uploadResult.gcsUri;
      result.publicUrl = uploadResult.publicUrl;
      
    } else {
      // 🔄 TRADITIONAL UPLOAD via Vercel API
      console.log('🔄 [TRADITIONAL-UPLOAD] Using traditional upload...');
      
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
      
      result = await response.json();
    }
    
    console.log('✅ [UPLOAD] Document processing completed');
    
    // Upload to Gemini File API (works for both upload methods)
    console.log('🔄 [UPLOAD] Uploading to Gemini...');
    
    const geminiResponse = await fetch('/api/upload-to-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: result.originalPdfUrl || result.gcsUri,
        originalName: result.originalName
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to upload to Gemini');
    }

    const geminiResult = await geminiResponse.json();
    console.log('✅ [UPLOAD] Gemini upload completed');

    // Save document reference with Gemini file URI
    const newDoc = {
      id: Date.now(),
      name: result.originalName,
      documentUrl: result.documentUrl,
      originalPdfUrl: result.originalPdfUrl || result.gcsUri,
      geminiFileUri: geminiResult.fileUri,
      fileName: result.fileName || file.name,
      pageCount: result.pageCount || 0,
      preview: result.preview || '',
      uploadMethod: useDirectUpload ? 'direct-gcs' : 'traditional',
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
      id: generateMessageId(),
      sender: 'system',
      text: `📄 Dokument "${result.originalName}" byl úspěšně nahrán (${result.pageCount || 0} stran, ${formatFileSize(file.size)}). AI má plný přístup k dokumentu a může jej analyzovat.`,
      isHidden: true
    };

    // Add to messages context but don't display to user
    setMessages(prev => [...prev, hiddenContextMessage]);
    
    console.log(`✅ [UPLOAD] Successfully uploaded: ${file.name} via ${useDirectUpload ? 'direct GCS' : 'traditional'} method`);
    
  } catch (error) {
    console.error('❌ [UPLOAD] Document upload error:', error);
    showNotification(error.message || 'Chyba při zpracování dokumentu', 'error');
  } finally {
    setLoading(false);
  }
};

// 📄 HANDLE SEND WITH DOCUMENTS
const handleSendWithDocuments = useCallback(async (text, documents) => {
  // ❌ REMOVED: Scroll limit logic
  
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
  
  // 🎯 ENSURE CHAT ID EXISTS - same logic as normal handleSend
  let activeChatId = getSafeChatId();
  
  if (!activeChatId) {
    activeChatId = chatDB.generateChatId();
    updateCurrentChatId(activeChatId);
    console.log('🆕 [DOC-SEND] Created new chat for documents:', activeChatId);
  }
  
  // Create attachments WITHOUT File objects (for IndexedDB persistence)
  const attachments = await Promise.all(safeDocuments.map(async (doc) => {
    // Create preview URL immediately for instant display
    const previewUrl = URL.createObjectURL(doc.file);
    
    // Start base64 conversion for persistence (non-blocking)
    const base64Promise = convertFileToBase64(doc.file).catch(error => {
      console.error(`Base64 conversion failed for ${doc.name}:`, error);
      return null;
    });
    
    return {
      name: doc.name,
      size: doc.file.size,
      type: doc.file.type,
      previewUrl: previewUrl, // For instant local display
      base64Promise: base64Promise, // Will resolve to base64 string
      storageUrl: null, // Will be added after background upload
      storagePath: null,
      // file: REMOVED - no File objects for IndexedDB compatibility
      _tempFile: doc.file // Temporary reference for upload, will be removed
    };
  }));
  
  // Add user message to chat immediately (with persistent attachment data)
  const userTimestamp = Date.now();
  const userMessage = {
    id: generateMessageId(),
    sender: 'user',
    text: text.trim(), // Keep empty if no text - no default message
    attachments: attachments, // Use new persistent base64 format
    timestamp: userTimestamp
  };
  
  // Add message and get current state
  let currentMessagesWithUser;
  setMessages(prev => {
    currentMessagesWithUser = [...prev, userMessage];
    return currentMessagesWithUser;
  });

  // 🔼 SCROLL TO THIS USER MESSAGE immediately after adding it (with documents, fixed large spacer)
  const newUserMessageIndex = currentMessagesWithUser.length - 1; // Index nové user zprávy
  
  scrollToUserMessageAt(virtuosoRef, newUserMessageIndex); // Scroll to the new user message

  // 🚀 BACKGROUND UPLOAD - Upload files without blocking UI
  attachments.forEach((attachment, index) => {
    if (attachment._tempFile) {
      // Upload to Supabase Storage in background
      uploadToSupabaseStorage(attachment._tempFile, 'attachments')
        .then(uploadResult => {
          // Update message with storage URL when upload completes
          setMessages(prev => prev.map(msg => 
            msg.timestamp === userTimestamp ? {
              ...msg,
              attachments: msg.attachments.map((att, i) => 
                i === index ? {
                  ...att,
                  storageUrl: uploadResult.publicUrl,
                  storagePath: uploadResult.path,
                  name: uploadResult.fileName, // Use the generated filename from storage
                  previewUrl: null, // 🎯 Remove blob URL - use storageUrl now
                  _tempFile: undefined // Clean temporary file reference
                } : att
              )
            } : msg
          ));
          
          // 🧹 Cleanup blob URL from memory after switching to storageUrl
          if (attachment.previewUrl) {
            URL.revokeObjectURL(attachment.previewUrl);
            console.log(`🧹 Cleaned up blob URL for ${attachment.name}`);
          }
          
          console.log(`✅ Background upload completed for ${attachment.name}`);
        })
        .catch(error => {
          console.error(`❌ Background upload failed for ${attachment.name}:`, error);
          // Keep local File object if upload fails - UI still works
        });
    }
  });

  // ❌ REMOVED: DOC-AUTO-SAVE - using unified auto-save system instead (every 10 messages)
  
  setLoading(true);
  setStreaming(true);
  
  try {
    // Process documents for AI (base64 conversion happens in background)
    // We'll wait a bit for base64 to be ready, but not for storage upload
    
    // Wait for base64 conversions that were started during attachment creation
    const base64WaitPromises = attachments.map((att, index) => {
      if (att.base64Promise) {
        return att.base64Promise.then(base64Data => {
          // Update attachment with base64 for persistence
          setMessages(prev => prev.map(msg => 
            msg.timestamp === userTimestamp ? {
              ...msg,
              attachments: msg.attachments.map((a, i) => 
                i === index ? {...a, base64: base64Data} : a
              )
            } : msg
          ));
          return base64Data;
        });
      }
      return Promise.resolve(null);
    });
    
    // Wait for base64 conversions (quick operation)
    const base64Results = await Promise.all(base64WaitPromises);
    
    // 🚀 CATEGORIZE FILES FOR OPTIMIZED PROCESSING
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/bmp',
      'image/tiff',
      'image/gif',
      'text/markdown',
      'application/json',
      'application/javascript',
      'text/javascript',
      'text/jsx',
      'text/typescript',
      'text/css',
      'text/html'
    ];
    
    const textFileTypes = [
      'text/plain',
      'text/markdown', 
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'text/jsx',
      'text/typescript',
      'application/json',
      'application/javascript',
      'application/xml',
      'text/xml'
    ];
    
    const imageFileTypes = [
      'image/png',
      'image/jpeg', 
      'image/jpg',
      'image/bmp',
      'image/tiff',
      'image/gif',
      'image/webp'
    ];
    
    // Categorize files for different processing approaches
    const textFiles = [];
    const imageFiles = [];
    const documentFiles = [];
    
    safeDocuments.forEach((doc, index) => {
      if (!doc.file) return;
      
      // Validate file format
      const isSupported = supportedTypes.includes(doc.file.type) || 
                          isFileExtensionSupported(doc.file.name);
      
      if (!isSupported) {
        throw new Error(`Nepodporovaný formát: ${doc.file.name}`);
      }
      
      // Categorize based on file type
      const isTextFile = textFileTypes.includes(doc.file.type) || 
                        doc.file.name.match(/\.(txt|md|json|csv|html|css|js|jsx|ts|tsx|xml|yml|yaml|log|conf|cfg|ini)$/i);
      
      const isImageFile = imageFileTypes.includes(doc.file.type) || 
                         doc.file.name.match(/\.(png|jpg|jpeg|bmp|tiff|tif|gif|webp)$/i);
      
      if (isTextFile) {
        textFiles.push({ doc, index });
      } else if (isImageFile) {
        imageFiles.push({ doc, index });
      } else {
        documentFiles.push({ doc, index });
      }
    });
    
    console.log(`📂 File categorization: ${textFiles.length} text, ${imageFiles.length} images, ${documentFiles.length} documents`);
    
    // Process files by category for optimal performance
    const processedDocuments = [];
    
    // 1️⃣ PROCESS TEXT FILES FIRST (instant, sequential)
    for (const { doc, index } of textFiles) {
      console.log(`📝 [LOCAL] Reading text file locally: ${doc.file.name}`);
      
      try {
        const textContent = await doc.file.text(); // INSTANT READ!
        
        const newDoc = {
          id: Date.now() + Math.random(),
          name: doc.file.name,
          extractedText: textContent, // Direct text content
          processingMethod: 'local-text-read',
          metadata: {
            size: doc.file.size,
            type: doc.file.type,
            lastModified: doc.file.lastModified
          },
          uploadedAt: new Date()
        };
        
        processedDocuments.push(newDoc);
        console.log(`✅ [LOCAL] Text file read instantly: ${doc.file.name} (${textContent.length} chars)`);
        
      } catch (error) {
        console.error(`❌ Failed to read text file locally:`, error);
        throw new Error(`Failed to read text file: ${doc.file.name}`);
      }
    }
    
    // 2️⃣ PROCESS IMAGES IN PARALLEL (fastest approach)
    if (imageFiles.length > 0) {
      console.log(`🖼️ [PARALLEL] Processing ${imageFiles.length} images simultaneously`);
      
      const imagePromises = imageFiles.map(async ({ doc, index }) => {
        console.log(`🖼️ [IMAGE] Direct GCS upload for visual analysis: ${doc.file.name}`);
        
        try {
          // Upload directly to GCS (no /api/process-document needed for images)
          console.log(`🚀 Uploading ${doc.file.name} directly to GCS for Gemini analysis`);
          const uploadResult = await uploadDirectToGCS(doc.file);
          
          console.log(`🖼️ Image uploaded to GCS - sending to Gemini for visual analysis: ${doc.file.name}`);
          
          // Upload to Gemini for visual analysis using GCS URI
          const geminiResponse = await fetch('/api/upload-to-gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pdfUrl: uploadResult.gcsUri, // Use GCS URI directly
              originalName: uploadResult.originalName
            })
          });
          
          if (!geminiResponse.ok) {
            throw new Error('Failed to process image for visual analysis');
          }
          
          const geminiResult = await geminiResponse.json();
          
          // Create document with Gemini URI for visual analysis
          const newDoc = {
            id: Date.now() + Math.random(),
            name: uploadResult.originalName,
            gcsUri: uploadResult.gcsUri,
            publicUrl: uploadResult.publicUrl,
            geminiFileUri: geminiResult.fileUri,
            uploadMethod: 'direct-gcs-image',
            processingMethod: 'image-visual-analysis-parallel',
            uploadedAt: new Date()
          };
          
          console.log(`✅ [PARALLEL] Image completed: ${doc.file.name}`);
          return newDoc;
          
        } catch (error) {
          console.error(`❌ Failed to process image via parallel GCS:`, error);
          throw new Error(`Failed to process image: ${doc.file.name}`);
        }
      });
      
      // Wait for all images to complete in parallel
      const imageResults = await Promise.all(imagePromises);
      processedDocuments.push(...imageResults);
      
      console.log(`✅ [PARALLEL] All ${imageFiles.length} images completed simultaneously`);
    }
    
    // 3️⃣ PROCESS DOCUMENTS SEQUENTIALLY (rate limits)  
    for (const { doc, index } of documentFiles) {
      console.log(`📄 [SEQUENTIAL] Processing document file: ${doc.file.name}`);
      
      // Decide upload method based on file size
      const useDirectUpload = shouldUseDirectUpload(doc.file);
      console.log(`🎯 Processing ${doc.file.name} via ${useDirectUpload ? 'DIRECT' : 'TRADITIONAL'} upload`);
      
      let result;
      
      if (useDirectUpload) {
        // 🚀 DIRECT UPLOAD TO GCS for large files
        const uploadResult = await uploadDirectToGCS(doc.file);
        result = await processGCSDocument(uploadResult.gcsUri, uploadResult.originalName);
        
        // Add GCS metadata to result
        result.gcsUri = uploadResult.gcsUri;
        result.publicUrl = uploadResult.publicUrl;
        
      } else {
        // 🔄 TRADITIONAL UPLOAD for smaller files
        const formData = new FormData();
        formData.append('file', doc.file);
        
        const response = await fetch('/api/process-document', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Document processing failed');
        }
        
        result = await response.json();
      }
      
      console.log('📄 Document - uploading to Gemini');
      
      // Upload to Gemini for document files
      const geminiResponse = await fetch('/api/upload-to-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl: result.originalPdfUrl || result.gcsUri,
          originalName: result.originalName
        })
      });
      
      if (!geminiResponse.ok) {
        throw new Error('Failed to process document');
      }
      
      const geminiResult = await geminiResponse.json();
      
      // Create document with Gemini URI for document files
      const newDoc = {
        id: Date.now() + Math.random(),
        name: result.originalName,
        documentUrl: result.documentUrl,
        originalPdfUrl: result.originalPdfUrl || result.gcsUri,
        geminiFileUri: geminiResult.fileUri,
        fileName: result.fileName,
        pageCount: result.pageCount,
        preview: result.preview,
        uploadMethod: useDirectUpload ? 'direct-gcs' : 'traditional',
        processingMethod: 'document-sequential',
        uploadedAt: new Date()
      };
      
      processedDocuments.push(newDoc);
      console.log(`✅ [SEQUENTIAL] Document completed: ${doc.file.name}`);
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
      // Include both Gemini files (images/documents) AND text files (with extractedText)
      const newActiveDocuments = processedDocuments
        .map(doc => {
          if (doc.geminiFileUri) {
            // Images and documents with Gemini URI
            return {
              uri: doc.geminiFileUri,
              name: doc.name,
              uploadTimestamp: Date.now(),
              lastAccessedTimestamp: Date.now(),
              lastAccessedMessageIndex: messagesWithUser.length,
              type: 'gemini-file'
            };
          } else if (doc.extractedText) {
            // Text files with direct content
            return {
              name: doc.name,
              extractedText: doc.extractedText,
              uploadTimestamp: Date.now(),
              lastAccessedTimestamp: Date.now(),
              lastAccessedMessageIndex: messagesWithUser.length,
              type: 'text-content'
            };
          }
          return null;
        })
        .filter(doc => doc !== null);
      
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
          // Separate text files (embed content) from other files (reference only)
          const textFiles = processedDocuments.filter(doc => doc.processingMethod === 'direct-text-extraction');
          const otherFiles = processedDocuments.filter(doc => doc.processingMethod !== 'direct-text-extraction');
          
          // Build document context
          let documentContext = '';
          
          // Add text file contents directly
          if (textFiles.length > 0) {
            documentContext += '\n\n--- OBSAH TEXTOVÝCH SOUBORŮ ---\n';
            textFiles.forEach(doc => {
              documentContext += `\n📝 ${doc.name}:\n`;
              documentContext += '```\n';
              documentContext += doc.extractedText || '[Prázdný soubor]';
              documentContext += '\n```\n';
            });
          }
          
          // Add references to other files
          if (otherFiles.length > 0) {
            const documentReferences = otherFiles.map(doc => {
              const isImage = doc.name.match(/\.(png|jpe?g|gif|webp)$/i);
              const emoji = isImage ? '🖼️' : '📄';
              return `${emoji} ${doc.name}`;
            }).join('\n');
            documentContext += '\n\n--- NAHRANÉ SOUBORY ---\n' + documentReferences;
          }
          
          // Create separate texts: one for UI display, one for AI processing
          const displayText = text.trim();
          const aiText = text.trim() 
            ? `${text.trim()}${documentContext}`
            : `Analyzuj nahraté soubory:${documentContext}`;
          
          console.log('   - Original text:', `"${text.trim()}"`);
          console.log('   - Text files:', textFiles.length);
          console.log('   - Other files:', otherFiles.length);
          console.log('   - Display text for user:', `"${displayText}"`);
          console.log('   - AI text with context:', `"${aiText}"`);
          
          return {
            ...msg,
            text: displayText,      // User sees clean message
            aiText: aiText         // AI gets full context
          };
        }
        return msg;
      });
      
      // Add hidden context message for AI when sending documents
      const hiddenContextMessage = {
        id: generateMessageId(),
        sender: 'system',
        text: `📄 User uploaded ${processedDocuments.length} document(s) for analysis. AI has full access to the document(s) and should analyze them.`,
        isHidden: true
      };
      
      // Add to messages context but don't display to user
      const messagesWithHiddenContext = [...messagesForAI, hiddenContextMessage];
      
      // No streaming for document uploads - same as regular Gemini chat
      
      // 🚀 PROGRESSIVE STREAMING: Process chunks immediately as they arrive (documents)
      let geminiSourcesForDocs = [];
      let accumulatedTextDocs = ''; // Track total text for final save
      const botTimestampDocs = Date.now() + 100; // +100ms to ensure bot comes after user
      let messageCreatedDocs = false;
      
      const result = await geminiService.sendMessage(
        messagesWithHiddenContext,
        (chunk, isStreaming, sources = []) => {
          // Update sources immediately
          if (sources.length > 0) {
            geminiSourcesForDocs = sources;
          }
          
          // Accumulate text for final save
          accumulatedTextDocs += chunk;
          
          if (chunk.trim()) {
            // Immediate processing: 50ms delay for markdown then word-by-word
            setTimeout(() => {
              const words = chunk.split(' ').filter(w => w.trim());
              
              words.forEach((word, index) => {
                setTimeout(() => {
                  setMessages(prev => {
                    const lastIndex = prev.length - 1;
                    
                    if (!messageCreatedDocs) {
                      // Create initial bot message with first word
                      messageCreatedDocs = true;
                      const newMessage = {
                        id: generateMessageId(),
                        sender: 'bot',
                        text: word,
                        isStreaming: true,
                        sources: geminiSourcesForDocs,
                        timestamp: botTimestampDocs
                      };
                      return [...prev, newMessage];
                    } else {
                      // Append words to existing message
                      if (lastIndex >= 0 && prev[lastIndex]?.sender === 'bot') {
                        const updated = [...prev];
                        updated[lastIndex] = {
                          ...updated[lastIndex],
                          text: updated[lastIndex].text + ' ' + word,
                          sources: geminiSourcesForDocs
                        };
                        return updated;
                      }
                      return prev;
                    }
                  });
                }, index * 10); // 10ms delay between words
              });
            }, 50); // 50ms delay for markdown processing
          }
          
          if (!isStreaming) {
            // Hide loading indicators when streaming complete
            setIsSearching(false);
            setLoading(false);
            setStreaming(false);
            
            // Mark message as complete
            setTimeout(() => {
              setMessages(prev => {
                const lastIndex = prev.length - 1;
                if (lastIndex >= 0 && prev[lastIndex]?.sender === 'bot') {
                  const updated = [...prev];
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    isStreaming: false
                  };
                  return updated;
                }
                return prev;
              });
            }, 100);
          }
        },
        (searchMsg) => {
          setIsSearching(true);
          setTimeout(() => setIsSearching(false), 3000);
        },
        detectedLang,
        filteredActiveDocs.map(doc => {
          if (doc.type === 'gemini-file') {
            return { geminiFileUri: doc.uri, name: doc.name };
          } else if (doc.type === 'text-content') {
            return { name: doc.name, extractedText: doc.extractedText };
          }
          // Fallback for existing documents (without type)
          return { geminiFileUri: doc.uri, name: doc.name };
        })
      );
      
      // Update uploadedDocuments state AFTER successful AI response
      if (processedDocuments.length > 0) {
        setUploadedDocuments(prev => [...prev, ...processedDocuments]);
      }
      
      // Update activeDocumentContexts with the filtered list
      setActiveDocumentContexts(filteredActiveDocs);
      
      // Use Gemini response directly without post-processing
      const cleanedText = accumulatedTextDocs;
      
      // Get all current messages from state (includes user message with updated base64)
      const currentMessagesFromState = messagesRef.current;
      
      // Add bot response to current messages
      const currentMessages = [...currentMessagesFromState, {
        id: generateMessageId(),
        sender: 'bot',
        text: cleanedText,
        timestamp: botTimestampDocs,
        sources: result.sources || [],
        isStreaming: false
      }];
      
      // Check auto-save after AI response (saves both user and bot messages with base64)
      const cleanedMessages = await checkAutoSave(currentMessages, activeChatId);
      // Update state with saved messages to ensure bot messages are persisted
      setMessages(cleanedMessages);
      
      // ❌ REMOVED: Scroll limit activation
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

// 🔍 DEBUG: Detailní analýza dat pro Virtuoso

// 🎯 STYLE CONSTANTS - Prevent inline style object recreation that causes re-renders

// Style constants still needed in App.jsx (MessageItem styles now in component)
const { 
  modelDropdownSpanStyle,
  modelDropdownIconStyle,
  modelDropdownContainerStyle,
  modelButtonBaseStyle,
  modelNameStyle,
  modelDescriptionStyle,
  mainContainerStyle,
  topHeaderStyle,
  hamburgerButtonStyle,
  newChatButtonStyle,
  mainContentStyle,
  messagesContainerStyle,
  welcomeScreenStyle,
  welcomeTextContainerStyle,
  welcomeTitleStyle,
  welcomeSubtitleStyle,
  chatMessagesWrapperStyle,
  virtuosoFooterStyle,
  virtuosoInlineStyle
} = styles;



// 🎯 VIRTUOSO COMPONENTS - Footer + main paddingBottom kombinace
const virtuosoComponents = React.useMemo(() => ({
  Footer: () => <div style={virtuosoFooterStyle} />,
  List: React.forwardRef((props, ref) => (
    <div {...props} ref={ref} style={{...props.style}} />
  ))
}), [virtuosoFooterStyle]);


// 🎨 JSX RENDER
  
  return (
    <>
      {/* 🎬 SPLASH SCREEN - PWA startup animation */}
      <SplashScreen
        isVisible={showSplashScreen}
        onComplete={() => {
          console.log('✅ Splash screen completed');
          setShowSplashScreen(false);
        }}
      />

      {/* 🔐 AUTH MODAL - zobrazí se po splash screenu když není přihlášený */}
      {!showSplashScreen && !user && !authLoading && (
        <AuthModal 
          onSuccess={handleAuthSuccess}
          onForgotPassword={(email) => {
            // Close auth modal and open reset password modal
            setResetPasswordEmail(email || '');
            setShowResetPasswordModal(true);
            console.log('Opening reset password modal for:', email || 'no email provided');
          }}
          uiLanguage={uiLanguage}
        />
      )}

      {/* 🔐 RESET PASSWORD MODAL */}
      <ResetPasswordModal 
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setResetPasswordEmail('');
        }}
        user={user}
        initialEmail={resetPasswordEmail}
        uiLanguage={uiLanguage}
      />

      {/* 🎨 MAIN APP - VŽDY renderovaná, jen možná překrytá modalem */}
      <div style={{
          ...mainContainerStyle,
          background: isListening 
            ? 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
            : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
          paddingTop: isMobile ? '70px' : '90px',
          paddingBottom: '120px', // Prostor pro InputBar - sníženo z 140px
        }}>
          
          {/* 📌 FIXED TOP BUTTONS - NOTCH/DYNAMIC ISLAND AWARE */}
      <div style={{
        ...topHeaderStyle,
        height: isMobile ? '60px' : '70px',
        padding: isMobile ? '0 1rem' : '0 2rem',
        paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '0',
        minHeight: isMobile ? 'calc(60px + env(safe-area-inset-top))' : '70px',
      }}>
        
        {/* HAMBURGER BUTTON - vlevo */}
        <button
          onClick={handleSidebarOpen}
          disabled={loading || streaming}
          style={{
            ...hamburgerButtonStyle,
            width: isMobile ? 40 : 44,
            height: isMobile ? 40 : 44,
            cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
            opacity: (loading || streaming) ? 0.5 : 1,
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
            <span style={modelDropdownSpanStyle}>{model === 'claude' ? 'o1' : model === 'gpt-4o' ? 'o2' : model === 'grok-3' ? 'o3' : 'o4'}</span>
            <ChevronDown size={14} strokeWidth={2} style={modelDropdownIconStyle} />
          </button>

          {/* MODEL DROPDOWN */}
          {showModelDropdown && (
            <div style={modelDropdownContainerStyle}>
              <button
                onClick={() => handleModelChange('claude')}
                style={{
                  ...modelButtonBaseStyle,
                  background: model === 'claude' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
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
                <span style={modelNameStyle}>Omnia Claude</span>
                <span style={{
                  ...modelDescriptionStyle,
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o1</span>
              </button>
              
              <button
                onClick={() => handleModelChange('gpt-4o')}
                style={{
                  ...modelButtonBaseStyle,
                  background: model === 'gpt-4o' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
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
                <span style={modelNameStyle}>Omnia GPT</span>
                <span style={{
                  ...modelDescriptionStyle,
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o2</span>
              </button>
              
              <button
                onClick={() => handleModelChange('grok-3')}
                style={{
                  ...modelButtonBaseStyle,
                  background: model === 'grok-3' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
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
                <span style={modelNameStyle}>Omnia X</span>
                <span style={{
                  ...modelDescriptionStyle,
                  color: 'rgba(156, 163, 175, 1)',
                  fontWeight: '400',
                }}>o3</span>
              </button>
              
              <button
                onClick={() => handleModelChange('gemini-2.5-flash')}
                style={{
                  ...modelButtonBaseStyle,
                  background: model === 'gemini-2.5-flash' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
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
                <span style={modelNameStyle}>Omnia G</span>
                <span style={{
                  ...modelDescriptionStyle,
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
            ...newChatButtonStyle,
            width: isMobile ? 40 : 44,
            height: isMobile ? 40 : 44,
            cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
            opacity: (loading || streaming) ? 0.5 : 1,
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
        style={mainContentStyle}
      >
        <div style={messagesContainerStyle}>
          
          {/* 🎨 WELCOME SCREEN - když nejsou zprávy */}
          {messages.length === 0 && (
            <div style={{
              ...welcomeScreenStyle,
              gap: isMobile ? '1.5rem' : '2rem'
            }}>
              
              
              {/* 🌍 MULTILINGUAL WELCOME TEXT */}
              <div style={welcomeTextContainerStyle}>
                <h1 className="text-shadow-lg shadow-white/30 drop-shadow-lg" style={{
                  ...welcomeTitleStyle,
                  fontSize: isMobile ? '2rem' : '2.5rem',
                }}>
                  {getTimeBasedGreeting(uiLanguage)}
                </h1>
                
                <p className="text-shadow shadow-white/20 drop-shadow" style={{
                  ...welcomeSubtitleStyle,
                  fontSize: isMobile ? '1rem' : '1.2rem',
                }}>
                  {welcomeTexts[uiLanguage]?.subtitle || welcomeTexts.cs.subtitle}
                </p>
              </div>
            </div>
          )}


          {/* 💬 CHAT MESSAGES - WRAPPER */}
          <div style={chatMessagesWrapperStyle}>
            <Virtuoso
              ref={virtuosoRef}
              style={virtuosoInlineStyle}
              overscan={800}
              atBottomThreshold={200}
              defaultItemHeight={200}
              increaseViewportBy={300}
              components={virtuosoComponents}
              computeItemKey={useCallback((index, item) => {
                // Use message UUID for better React reconciliation
                return item?.uuid || `fallback-${index}`;
              }, [])}
              // ❌ REMOVED: All scroll limit logic
            data={React.useMemo(() => {
              const filtered = messages.filter(msg => !msg.isHidden);
              
              if (loading || streaming) {
                return [...filtered, {
                  id: 'loading-indicator',
                  sender: 'bot',
                  text: streaming ? 'Streaming...' : (isSearching ? t('searching') : t('thinking')),
                  isLoading: true,
                  isStreaming: streaming
                }];
              }
              return filtered;
            }, [messages, loading, streaming, isSearching, uiLanguage])}
            itemContent={useCallback((index, msg) => (
              <MessageItem
                msg={msg}
                index={index}
                onPreviewImage={setPreviewImage}
                onDocumentView={setDocumentViewer}
                onSourcesClick={handleSourcesClick}
                onAudioStateChange={setIsAudioPlaying}
              />
            ), [setPreviewImage, setDocumentViewer, handleSourcesClick, setIsAudioPlaying])} // Close itemContent function
            followOutput={shouldFollowOutput ? "smooth" : false}
            atBottomStateChange={useCallback((atBottom) => {
              setShowScrollToBottom(!atBottom);
            }, [setShowScrollToBottom])}
          />
          </div>
          {/* End of Virtuoso wrapper with padding */}
          
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      {/* 🔽 SCROLL TO BOTTOM BUTTON - Fixed position overlay */}
      {showScrollToBottom && (
        <button
          onClick={() => scrollToBottom(virtuosoRef)}
          style={{
            position: 'fixed',
            bottom: isMobile ? '110px' : '120px', // Above input bar
            right: isMobile ? '20px' : '50px',
            transform: 'translateZ(0)',
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
            e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1) translateZ(0)';
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
        onSend={(text) => handleSend(text)}
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
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        audioLevel={audioLevel}
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
        onChatDeleted={(deletedChatId) => {
          // Remove deleted chat from current metadata without reloading all
          setChatHistories(prev => prev.filter(chat => chat.id !== deletedChatId));
          
          // 🚨 CRITICAL FIX: Clear messages state if we deleted current chat
          // This prevents async save operations from recreating deleted chat
          if (deletedChatId === currentChatId) {
            console.log('🗑️ Clearing messages state for deleted current chat:', deletedChatId);
            setMessages([]);
          }
        }}
        user={user}
        onSignOut={handleSignOut}
        onResetPassword={handleResetPassword}
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
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
        #root { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; display: flex; flex-direction: column; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px) translateZ(0); } 100% { opacity: 1; transform: translateY(0) translateZ(0); } }
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes omnia-pulse { 0%, 100% { box-shadow: 0 0 15px rgba(100, 50, 255, 0.8); transform: scale(1) translateZ(0); } 50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.9); transform: scale(1.05) translateZ(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes omnia-listening { 0% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); } 50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.9); } 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); } }
        
        /* Hide scrollbar for attachment cards */
        .hide-scrollbar {
          scrollbar-width: none;           /* Firefox */
          -ms-overflow-style: none;        /* Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;                   /* Chrome/Safari */
        }
        
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
      
      {/* 🖼️ FULLSCREEN PHOTO PREVIEW OVERLAY */}
      {previewImage && (
        <div
          onClick={closePreview}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            animation: 'fadeIn 0.3s ease',
            transform: 'translateZ(0)',
            cursor: 'pointer',
          }}
        >
          {/* Close hint text */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            zIndex: 1,
          }}>
            {previewImage.name}
            <br />
            <span style={{ fontSize: '12px', opacity: 0.6 }}>
              Tap to close
            </span>
          </div>

          {/* Image container */}
          <img 
            src={previewImage.url}
            alt={previewImage.name}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            style={{
              maxWidth: '90%',
              maxHeight: '80%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.3s ease',
              transform: 'scale(1) translateZ(0)',
              transition: 'transform 0.2s ease',
            }}
            onLoad={(e) => {
              // Subtle scale animation on load
              e.target.style.transform = 'scale(0.95) translateZ(0)';
              setTimeout(() => {
                e.target.style.transform = 'scale(1) translateZ(0)';
              }, 50);
            }}
          />
        </div>
      )}
      
      {/* 📄 DOCUMENT VIEWER */}
      <DocumentViewer
        isOpen={documentViewer.isOpen}
        onClose={() => setDocumentViewer({ isOpen: false, document: null })}
        document={documentViewer.document}
        uiLanguage={uiLanguage}
      />
      
      {/* 📶 OFFLINE INDICATOR */}
      <OfflineIndicator
        isOnline={isOnline}
        connectionType={connectionType}
        connectionInfo={connectionInfo}
        uiLanguage={uiLanguage}
        position="top-left"
      />

      </div>
    </>
  );
};

export default App;