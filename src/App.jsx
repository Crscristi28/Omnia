import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// 🌍 IMPROVED LANGUAGE DETECTION - Méně agresivní, víc inteligentní
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'cs';
  
  const lowerText = text.toLowerCase().trim();
  
  // 🔧 FIX: Kratší texty = méně agresivní detekce
  if (lowerText.length < 10) {
    // Pro krátké texty - jen explicitní indikátory
    if (['hello', 'hi', 'yes', 'no', 'thanks'].some(word => lowerText.includes(word))) return 'en';
    if (['salut', 'bună', 'mulțumesc'].some(word => lowerText.includes(word))) return 'ro';
    return 'cs'; // Default pro krátké texty
  }

  // České indikátory - rozšířené ale ne agresivní
  const czechWords = [
    'být', 'mít', 'který', 'tento', 'jako', 'jeho', 'nebo', 'než', 'aby', 'když', 'kde',
    'čau', 'ahoj', 'děkuji', 'prosím', 'ano', 'ne', 'dobré', 'dobrý', 'den', 'večer', 'ráno',
    'co', 'jak', 'kde', 'proč', 'kdo', 'kdy', 'kolik', 'jaký', 'která', 'které',
    'se', 'si', 'je', 'jsou', 'má', 'máte', 'můžu', 'můžeš', 'umíš', 'umím',
    'dělám', 'děláš', 'dělá', 'říkej', 'mluv', 'povídej', 'vysvětli', 'pomoć', 'pomoz'
  ];
  
  // Anglické indikátory - rozšířené
  const englishWords = [
    'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'be', 'at', 'one', 'have', 'this',
    'hello', 'hi', 'thanks', 'thank', 'please', 'yes', 'no', 'what', 'how', 'where', 'why', 'who', 'when',
    'doing', 'think', 'know', 'want', 'like', 'good', 'time', 'can', 'could', 'would', 'should',
    'speak', 'talk', 'tell', 'explain', 'help', 'search', 'find'
  ];

  // Rumunské indikátory - rozšířené
  const romanianWords = [
    'și', 'de', 'la', 'cu', 'în', 'pe', 'că', 'ce', 'să', 'nu', 'un', 'o', 'el', 'ea', 'eu',
    'salut', 'bună', 'mulțumesc', 'te rog', 'da', 'nu', 'ce', 'cum', 'unde', 'de ce', 'cine', 'când',
    'fac', 'faci', 'face', 'vorbește', 'spune', 'explică', 'ajută', 'caută'
  ];

  // PRIORITNÍ fráze - vysoká důvěra
  const explicitCzech = [
    'mluv česky', 'mluvte česky', 'řekni mi česky', 'odpověz česky', 'chci česky',
    'přepni na češtinu', 'česká odpověď', 'v češtině'
  ];

  const explicitEnglish = [
    'speak english', 'talk english', 'answer in english', 'switch to english', 'i want english',
    'respond in english', 'english please', 'can you speak english'
  ];

  const explicitRomanian = [
    'vorbește română', 'răspunde în română', 'vreau română', 'schimbă la română',
    'poți vorbi română', 'limba română'
  ];

  // 🔧 FIX 1: Explicitní jazykové požadavky = OKAMŽITÉ přepnutí
  for (const phrase of explicitCzech) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  
  for (const phrase of explicitEnglish) {
    if (lowerText.includes(phrase)) return 'en';
  }

  for (const phrase of explicitRomanian) {
    if (lowerText.includes(phrase)) return 'ro';
  }

  // 🔧 FIX 2: Konverzační fráze - střední důvěra
  const conversationalCzech = [
    'co děláš', 'jak se máš', 'co se děje', 'jak to jde', 'co je nového',
    'děláš si srandu', 'myslíš si', 'co si myslíš', 'máš čas', 'můžeš mi'
  ];

  const conversationalEnglish = [
    'what are you doing', 'how are you', 'what\'s up', 'how\'s it going', 'what\'s new',
    'are you kidding', 'do you think', 'what do you think', 'can you help', 'tell me about'
  ];

  const conversationalRomanian = [
    'ce faci', 'cum ești', 'ce mai faci', 'cum merge', 'ce e nou',
    'îmi poți spune', 'mă poți ajuta', 'explică-mi', 'ce crezi'
  ];

  for (const phrase of conversationalCzech) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  
  for (const phrase of conversationalEnglish) {
    if (lowerText.includes(phrase)) return 'en';
  }

  for (const phrase of conversationalRomanian) {
    if (lowerText.includes(phrase)) return 'ro';
  }

  // 🔧 FIX 3: Word counting - vyšší práh pro přepnutí
  const czechCount = czechWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
  const romanianCount = romanianWords.filter(word => lowerText.includes(word)).length;

  const scores = {
    'cs': czechCount,
    'en': englishCount,
    'ro': romanianCount
  };

  const maxScore = Math.max(...Object.values(scores));
  
  // 🔧 FIX 4: Vyžaduje aspoň 2 shody pro přepnutí jazyka
  if (maxScore >= 2) {
    const detectedLang = Object.keys(scores).find(key => scores[key] === maxScore);
    console.log('🌍 Language detection:', { text: lowerText.substring(0, 30), scores, detected: detectedLang });
    return detectedLang || 'cs';
  }
  
  // 🔧 FIX 5: Fallback - zůstat v aktuálním jazyce místo force češtiny
  console.log('🌍 Language detection: insufficient confidence, keeping current');
  return 'cs'; // Pouze default pro úplně nové konverzace
};

// 🌍 ENHANCED UI TRANSLATIONS - Opravené missing keys
const uiTexts = {
  cs: {
    newChat: "Nový chat",
    save: "Uložit", 
    cancel: "Zrušit",
    copy: "Zkopírovat",
    copied: "Zkopírováno!",
    settings: "Nastavení",
    changeLanguage: "Změnit jazyk",
    interfaceLanguage: "Jazyk rozhraní",
    conversationLanguage: "Jazyk konverzace",
    sendMessage: "Odeslat zprávu",
    holdToSpeak: "Klikněte pro mluvení", // 🔧 ZMĚNA: už ne "držte"
    processing: "Zpracovávám...",
    speaking: "Mluví...",
    listening: "Poslouchám...", // 🆕 Nový key
    voiceScreen: "Voice Screen",
    newChatCreated: "Nový chat s Omnia vytvořen",
    audioStopped: "Audio zastaveno",
    streamingStopped: "Streaming zastaven",
    clickToStop: "klepněte pro zastavení",
    clickToReturn: "klepněte pro návrat",
    clickToSpeak: "klepněte pro mluvení", // 🆕 Nový key
    error: "Chyba",
    // Voice screen keys
    omniaStreaming: "Omnia mluví...",
    omniaPreparingResponse: "Omnia připravuje odpověď...",
    omniaSpeaking: "Omnia mluví...",
    streamingRealTime: "Mluví s vámi v reálném čase",
    advancedAIAssistant: "Pokročilý AI asistent",
    streaming: "mluví",
    or: "nebo",
    // Error messages
    searchError: "Chyba při vyhledávání",
    connectionError: "Chyba připojení - zkuste to znovu",
    voiceError: "Chyba při rozpoznávání řeči - zkuste znovu",
    voicePermissionError: "Nepodařilo se získat přístup k mikrofonu",
    apiError: "Chyba API serveru",
    unknownError: "Neočekávaná chyba",
    retryAction: "Klepněte pro opakování"
  },
  en: {
    newChat: "New chat",
    save: "Save",
    cancel: "Cancel", 
    copy: "Copy",
    copied: "Copied!",
    settings: "Settings",
    changeLanguage: "Change language",
    interfaceLanguage: "Interface language",
    conversationLanguage: "Conversation language",
    sendMessage: "Send message",
    holdToSpeak: "Click to speak", // 🔧 ZMĚNA: už ne "hold"
    processing: "Processing...",
    speaking: "Speaking...",
    listening: "Listening...", // 🆕 Nový key
    voiceScreen: "Voice Screen",
    newChatCreated: "New chat with Omnia created",
    audioStopped: "Audio stopped",
    streamingStopped: "Streaming stopped",
    clickToStop: "click to stop",
    clickToReturn: "click to return",
    clickToSpeak: "click to speak", // 🆕 Nový key
    error: "Error",
    // Voice screen keys
    omniaStreaming: "Omnia speaking...",
    omniaPreparingResponse: "Omnia preparing response...",
    omniaSpeaking: "Omnia speaking...",
    streamingRealTime: "Speaking with you in real time",
    advancedAIAssistant: "Advanced AI assistant",
    streaming: "speaking",
    or: "or",
    // Error messages
    searchError: "Search error",
    connectionError: "Connection error - please try again",
    voiceError: "Voice recognition error - try again",
    voicePermissionError: "Could not access microphone",
    apiError: "API server error",
    unknownError: "Unexpected error",
    retryAction: "Click to retry"
  },
  ro: {
    newChat: "Chat nou",
    save: "Salvează",
    cancel: "Anulează",
    copy: "Copiază",
    copied: "Copiat!",
    settings: "Setări",
    changeLanguage: "Schimbă limba",
    interfaceLanguage: "Limba interfeței",
    conversationLanguage: "Limba conversației",
    sendMessage: "Trimite mesaj",
    holdToSpeak: "Apasă pentru a vorbi", // 🔧 ZMĚNA: už ne "ține apăsat"
    processing: "Procesez...",
    speaking: "Vorbește...",
    listening: "Ascult...", // 🆕 Nový key
    voiceScreen: "Ecran vocal",
    newChatCreated: "Chat nou cu Omnia creat",
    audioStopped: "Audio oprit",
    streamingStopped: "Streaming oprit",
    clickToStop: "apasă pentru a opri",
    clickToReturn: "apasă pentru a reveni",
    clickToSpeak: "apasă pentru a vorbi", // 🆕 Nový key
    error: "Eroare",
    // Voice screen keys
    omniaStreaming: "Omnia vorbește...",
    omniaPreparingResponse: "Omnia pregătește răspunsul...",
    omniaSpeaking: "Omnia vorbește...",
    streamingRealTime: "Vorbește cu tine în timp real",
    advancedAIAssistant: "Asistent IA avansat",
    streaming: "vorbește",
    or: "sau",
    // Error messages
    searchError: "Eroare de căutare",
    connectionError: "Eroare de conexiune - încearcă din nou",
    voiceError: "Eroare de recunoaștere vocală - încearcă din nou",
    voicePermissionError: "Nu s-a putut accesa microfonul",
    apiError: "Eroare server API",
    unknownError: "Eroare neașteptată",
    retryAction: "Apasă pentru a reîncerca"
  }
};

// 🔧 SESSION MANAGEMENT - Unchanged but optimized
const sessionManager = {
  initSession() {
    const sessionId = sessionStorage.getItem('omnia-session-id');
    const isNewSession = !sessionId;
    
    if (isNewSession) {
      const newSessionId = Date.now().toString();
      sessionStorage.setItem('omnia-session-id', newSessionId);
      localStorage.removeItem('omnia-memory');
      console.log('🆕 New OMNIA session started');
      return { isNewSession: true, messages: [] };
    } else {
      const saved = localStorage.getItem('omnia-memory');
      if (saved) {
        try {
          const messages = JSON.parse(saved);
          console.log('📂 Loaded conversation history:', messages.length, 'messages');
          return { isNewSession: false, messages };
        } catch (error) {
          console.error('❌ Error loading saved messages:', error);
          localStorage.removeItem('omnia-memory');
          return { isNewSession: false, messages: [] };
        }
      }
      return { isNewSession: false, messages: [] };
    }
  },

  clearSession() {
    sessionStorage.removeItem('omnia-session-id');
    localStorage.removeItem('omnia-memory');
    console.log('🗑️ Session cleared');
  }
};// 🎨 OPTIMIZED LOGO KOMPONENTY - Enhanced animations for voice mode
const OmniaLogo = ({ size = 80, animate = false, shouldHide = false, isListening = false }) => {
  if (shouldHide) return null;
  
  // 🆕 Listening animation - pulzuje když poslouchá
  const getAnimation = () => {
    if (isListening) return 'omnia-listening 2s ease-in-out infinite';
    if (animate) return 'omnia-breathe 4s ease-in-out infinite';
    return 'none';
  };
  
  return (
    <div
      className="omnia-logo"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 40%, 
            ${isListening ? '#00ffff' : '#00ffff'} 0%,
            ${isListening ? '#0099ff' : '#0096ff'} 30%,
            #6432ff 60%,
            #9932cc 80%,
            #4b0082 100%
          )
        `,
        boxShadow: `
          0 0 ${size * 0.4}px ${isListening ? 'rgba(0, 255, 255, 0.8)' : 'rgba(100, 50, 255, 0.6)'},
          0 0 ${size * 0.2}px rgba(0, 150, 255, 0.4),
          inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.2)
        `,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        animation: getAnimation()
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          filter: 'blur(8px)'
        }}
      />
      {(animate || isListening) && (
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            animation: isListening ? 'shimmer 1.5s ease-in-out infinite' : 'shimmer 3s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

const MiniOmniaLogo = ({ size = 28, onClick, isAudioPlaying = false, loading = false, streaming = false, isListening = false }) => {
  const getLogoStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: '50%',
      background: `
        radial-gradient(circle at 30% 40%, 
          ${isListening ? '#00ffff' : '#00ffff'} 0%,
          ${isListening ? '#0099ff' : '#0096ff'} 30%,
          #6432ff 60%,
          #9932cc 80%,
          #4b0082 100%
        )
      `,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    // 🎨 UNIFIED ANIMATION SYSTEM - Enhanced for listening
    if (isListening) {
      return {
        ...baseStyle,
        animation: 'omnia-pulse 1s ease-in-out infinite',
        boxShadow: `0 0 ${size * 1.2}px rgba(0, 255, 255, 1)`,
        '--pulse-color': 'rgba(0, 255, 255, 1)'
      };
    }

    if (streaming) {
      return {
        ...baseStyle,
        animation: 'omnia-pulse 1.2s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.8}px rgba(0, 255, 255, 1)`,
        '--pulse-color': 'rgba(0, 255, 255, 1)'
      };
    }

    if (loading) {
      return {
        ...baseStyle,
        animation: 'omnia-pulse 1.5s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.6}px rgba(100, 50, 255, 0.8)`,
        '--pulse-color': 'rgba(100, 50, 255, 0.8)'
      };
    }
    
    if (isAudioPlaying) {
      return {
        ...baseStyle,
        animation: 'omnia-pulse 1s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.8}px rgba(0, 255, 255, 0.9)`,
        '--pulse-color': 'rgba(0, 255, 255, 0.9)'
      };
    }
    
    return {
      ...baseStyle,
      boxShadow: `0 0 ${size * 0.4}px rgba(100, 50, 255, 0.5)`
    };
  };

  const getTitle = () => {
    if (isListening) return "Poslouchám...";
    if (streaming) return "Omnia pracuje...";
    return "Voice Screen";
  };

  return (
    <div
      style={getLogoStyle()}
      onClick={onClick}
      title={getTitle()}
    />
  );
};

const ChatOmniaLogo = ({ size = 14 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 40%, 
            #00ffff 0%,
            #0096ff 30%,
            #6432ff 60%,
            #9932cc 80%,
            #4b0082 100%
          )
        `,
        boxShadow: `0 0 ${size * 0.5}px rgba(100, 50, 255, 0.6)`,
        display: 'inline-block',
        marginRight: '6px',
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    />
  );
};

// 🔄 MODERN ARROW BUTTON - Enhanced with voice state
const OmniaArrowButton = ({ onClick, disabled, loading, size = 50, isListening = false }) => {
  const getButtonStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: '50%',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.3,
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
      color: 'white',
      opacity: disabled ? 0.5 : 1
    };

    if (disabled) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #4a5568, #2d3748)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      };
    }

    // 🆕 Listening state
    if (isListening) {
      return {
        ...baseStyle,
        background: `
          radial-gradient(circle at 30% 40%, 
            #00ffff 0%,
            #0096ff 30%,
            #6432ff 60%,
            #9932cc 80%,
            #4b0082 100%
          )
        `,
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
        animation: 'omnia-pulse 1s ease-in-out infinite'
      };
    }

    return {
      ...baseStyle,
      background: `
        radial-gradient(circle at 30% 40%, 
          #00ffff 0%,
          #0096ff 30%,
          #6432ff 60%,
          #9932cc 80%,
          #4b0082 100%
        )
      `,
      boxShadow: '0 4px 12px rgba(100, 50, 255, 0.4)'
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={getButtonStyle()}
      onMouseEnter={(e) => {
        if (!disabled && !isListening) {
          e.target.style.transform = 'translateY(-1px) scale(1.05)';
          e.target.style.boxShadow = '0 6px 16px rgba(100, 50, 255, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isListening) {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(100, 50, 255, 0.4)';
        }
      }}
      title={isListening ? "Poslouchám..." : "Odeslat zprávu"}
    >
      {loading ? (
        <div style={{ 
          width: '12px', 
          height: '12px', 
          border: '2px solid rgba(255,255,255,0.3)', 
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      ) : isListening ? '🎙️' : '→'}
    </button>
  );
};

// ⌨️ TYPEWRITER EFFECT - Performance optimized
function TypewriterText({ text, isStreaming = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (text.length < displayedText.length) {
      setDisplayedText('');
      setCharIndex(0);
      return;
    }

    if (isStreaming) {
      setDisplayedText(text);
      setCharIndex(text.length);
      return;
    }

    if (charIndex >= chars.length) return;
    
    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + chars[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, 20);
    
    return () => clearTimeout(timeout);
  }, [charIndex, chars, text, isStreaming, displayedText]);

  return (
    <span>
      {displayedText}
      {isStreaming && (
        <span style={{ 
          animation: 'blink 1s infinite',
          color: '#00ffff',
          fontWeight: 'bold'
        }}>
          |
        </span>
      )}
    </span>
  );
}

// 🔧 HELPER pro Claude messages - Unchanged
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
    console.error('Error preparing Claude messages:', error);
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
    return lastUserMessage.map(msg => ({
      role: 'user',
      content: msg.text || ''
    }));
  }
};

// 🎯 ENHANCED TTS PREPROCESSING - Better pronunciation for all languages
const preprocessTextForTTS = (text, language = 'cs') => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  switch (language) {
    case 'cs':
      return preprocessCzechTextForTTS(processedText);
    case 'en':
      return preprocessEnglishTextForTTS(processedText);
    case 'ro':
      return preprocessRomanianTextForTTS(processedText);
    default:
      return preprocessCzechTextForTTS(processedText);
  }
};

// 🇨🇿 ENHANCED CZECH TTS PREPROCESSING - Better AI pronunciations
const preprocessCzechTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Číslá na slova
  const numberMap = {
    '0': 'nula', '1': 'jedna', '2': 'dva', '3': 'tři', '4': 'čtyři',
    '5': 'pět', '6': 'šest', '7': 'sedm', '8': 'osm', '9': 'devět',
    '10': 'deset', '11': 'jedenáct', '12': 'dvanáct', '13': 'třináct',
    '14': 'čtrnáct', '15': 'patnáct', '16': 'šestnáct', '17': 'sedmnáct',
    '18': 'osmnáct', '19': 'devatenáct', '20': 'dvacet'
  };
  
  Object.entries(numberMap).forEach(([num, word]) => {
    const regex = new RegExp(`\\b${num}\\b`, 'g');
    processedText = processedText.replace(regex, word);
  });
  
  // Měny a procenta
  processedText = processedText.replace(/(\d+)\s*Kč/gi, '$1 korun českých');
  processedText = processedText.replace(/(\d+)\s*€/gi, '$1 eur');
  processedText = processedText.replace(/(\d+)\s*\$/gi, '$1 dolarů');
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 procent');
  
  // Teploty a časy
  processedText = processedText.replace(/(\d+)\s*°C/gi, '$1 stupňů celsia');
  processedText = processedText.replace(/(\d{1,2}):(\d{2})/g, '$1 hodin $2 minut');
  
  // 🔧 ENHANCED ZKRATKY - Better AI/tech pronunciation
  const abbreviations = {
    'atd': 'a tak dále', 
    'apod': 'a podobně', 
    'tj': 'to jest',
    'tzn': 'to znamená', 
    'např': 'například', 
    'resp': 'respektive',
    'tzv': 'takzvaný',
    // 🆕 AI & Tech terms
    'AI': 'éj áj',
    'API': 'éj pí áj',
    'URL': 'jú ár el',
    'USD': 'jú es dolar',
    'EUR': 'euro',
    'GPT': 'džípítí',
    'TTS': 'tí tí es',
    'ChatGPT': 'čet džípítí',
    'OpenAI': 'oupn éj áj',
    'Claude': 'klód',
    'Anthropic': 'antropik',
    // 🔧 Website pronunciation
    'site': 'sajt',
    'website': 'websajt',
    'web site': 'web sajt'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\*+/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};

// 🇺🇸 ENHANCED ENGLISH TTS PREPROCESSING
const preprocessEnglishTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Numbers to words
  const numberMap = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
    '14': 'fourteen', '15': 'fifteen', '16': 'sixteen', '17': 'seventeen',
    '18': 'eighteen', '19': 'nineteen', '20': 'twenty'
  };
  
  Object.entries(numberMap).forEach(([num, word]) => {
    const regex = new RegExp(`\\b${num}\\b`, 'g');
    processedText = processedText.replace(regex, word);
  });
  
  // Currency and percentages
  processedText = processedText.replace(/(\d+)\s*\$/gi, '$1 dollars');
  processedText = processedText.replace(/(\d+)\s*€/gi, '$1 euros');
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 percent');
  
  // Temperature and time
  processedText = processedText.replace(/(\d+)\s*°F/gi, '$1 degrees fahrenheit');
  processedText = processedText.replace(/(\d+)\s*°C/gi, '$1 degrees celsius');
  processedText = processedText.replace(/(\d{1,2}):(\d{2})/g, '$1 $2');
  
  // 🆕 AI & Tech terms - English pronunciation
  const abbreviations = {
    'etc': 'et cetera', 
    'vs': 'versus', 
    'AI': 'A I',
    'API': 'A P I',
    'URL': 'U R L',
    'USD': 'U S dollars',
    'EUR': 'euros',
    'GPT': 'G P T',
    'TTS': 'T T S',
    'ChatGPT': 'Chat G P T',
    'OpenAI': 'Open A I'
    // English "site" stays the same - already pronounced correctly
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup
  processedText = processedText.replace(/\.\.\./g, ', pause,');
  processedText = processedText.replace(/--/g, ', pause,');
  processedText = processedText.replace(/\*+/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};

// 🇷🇴 ENHANCED ROMANIAN TTS PREPROCESSING
const preprocessRomanianTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Numbers to words
  const numberMap = {
    '0': 'zero', '1': 'unu', '2': 'doi', '3': 'trei', '4': 'patru',
    '5': 'cinci', '6': 'șase', '7': 'șapte', '8': 'opt', '9': 'nouă',
    '10': 'zece', '11': 'unsprezece', '12': 'doisprezece', '13': 'treisprezece',
    '14': 'paisprezece', '15': 'cincisprezece', '16': 'șaisprezece',
    '17': 'șaptesprezece', '18': 'optsprezece', '19': 'nouăsprezece', '20': 'douăzeci'
  };
  
  Object.entries(numberMap).forEach(([num, word]) => {
    const regex = new RegExp(`\\b${num}\\b`, 'g');
    processedText = processedText.replace(regex, word);
  });
  
  // Currency and percentages
  processedText = processedText.replace(/(\d+)\s*€/gi, '$1 euro');
  processedText = processedText.replace(/(\d+)\s*\$/gi, '$1 dolari');
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 la sută');
  
  // Temperature and time
  processedText = processedText.replace(/(\d+)\s*°C/gi, '$1 grade celsius');
  processedText = processedText.replace(/(\d{1,2}):(\d{2})/g, '$1 ore $2 minute');
  
  // 🆕 AI & Tech terms - Romanian pronunciation
  const abbreviations = {
    'AI': 'a i',
    'API': 'a pi i',
    'URL': 'u ăr el',
    'USD': 'dolari americani',
    'EUR': 'euro',
    'GPT': 'g p t',
    'TTS': 't t s',
    'ChatGPT': 'cet g p t',
    'OpenAI': 'oupăn a i',
    // Romanian site pronunciation
    'site': 'sait',
    'website': 'websait',
    'web site': 'web sait'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup
  processedText = processedText.replace(/\.\.\./g, ', pauză,');
  processedText = processedText.replace(/--/g, ', pauză,');
  processedText = processedText.replace(/\*+/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};// 🚀 MAIN APP COMPONENT - Enhanced with continuous voice support
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // 🆕 CONTINUOUS VOICE STATES
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false); // Toggle for continuous voice
  
  // 🌍 LANGUAGE STATES - Enhanced with persistence
  const [userLanguage, setUserLanguage] = useState('cs');
  const [uiLanguage, setUILanguage] = useState('cs');
  
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const t = (key) => uiTexts[uiLanguage][key] || uiTexts['cs'][key] || key;

  // 🚀 ENHANCED ERROR HANDLING - Lokalizované error messages
  const getLocalizedErrorMessage = (errorType, language, originalError = '') => {
    const errorMessages = {
      'search': {
        'cs': 'Chyba při vyhledávání - zkuste jiný dotaz',
        'en': 'Search error - try different query',
        'ro': 'Eroare căutare - încearcă altă întrebare'
      },
      'connection': {
        'cs': 'Chyba připojení - zkontrolujte internet',
        'en': 'Connection error - check internet',
        'ro': 'Eroare conexiune - verifică internetul'
      },
      'voice': {
        'cs': 'Chyba rozpoznání hlasu - zkuste znovu',
        'en': 'Voice recognition error - try again',
        'ro': 'Eroare recunoaștere vocală - încearcă din nou'
      },
      'api': {
        'cs': 'Chyba serveru - zkuste za chvíli',
        'en': 'Server error - try again later',
        'ro': 'Eroare server - încearcă mai târziu'
      },
      'unknown': {
        'cs': 'Neočekávaná chyba',
        'en': 'Unexpected error occurred',
        'ro': 'Eroare neașteptată'
      }
    };

    return errorMessages[errorType]?.[language] || errorMessages['unknown'][language] || originalError;
  };

  const showNotification = (message, type = 'info', onClick = null, errorType = null) => {
    let finalMessage = message;
    if (errorType) {
      finalMessage = getLocalizedErrorMessage(errorType, uiLanguage, message);
    }
    
    showNotificationHelper(finalMessage, type, onClick);
  };

  // 🔧 ENHANCED AUDIO CONTROL - Better interrupt handling
  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsAudioPlaying(false);
    window.dispatchEvent(new CustomEvent('omnia-audio-start'));
  };

  // 🆕 ENHANCED VOICE MODE TOGGLE
  const toggleVoiceMode = () => {
    if (voiceMode) {
      // Turning off voice mode
      setVoiceMode(false);
      setIsListening(false);
      if (showVoiceScreen) {
        setShowVoiceScreen(false);
      }
      console.log('🔇 Voice mode disabled');
    } else {
      // Turning on voice mode
      setVoiceMode(true);
      setShowVoiceScreen(true);
      console.log('🎙️ Voice mode enabled');
    }
  };

  const handleNewChat = () => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    if (streaming) {
      setStreaming(false);
    }
    if (isListening) {
      setIsListening(false);
    }
    
    sessionManager.clearSession();
    setMessages([]);
    setUserLanguage('cs');
    
    showNotification(t('newChatCreated'), 'success');
  };

  const handleEditMessage = (messageIndex, newText) => {
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], text: newText };
    
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    setMessages(messagesToKeep);
    localStorage.setItem('omnia-memory', JSON.stringify(messagesToKeep));
    
    handleSend(newText);
  };

  // 🔧 ENHANCED handleSend - Support for voice mode
  const handleSend = async (textInput = input, fromVoice = false) => {
    if (!textInput.trim()) return;
    if (loading || streaming) return;

    // 🌍 ENHANCED: Language detection with persistence
    const detectedLang = detectLanguage(textInput);
    
    // 🔧 FIX: Only change language if detection is confident AND different
    if (detectedLang !== userLanguage) {
      console.log('🌍 Language change detected:', userLanguage, '→', detectedLang);
      setUserLanguage(detectedLang);
    }

    if (isAudioPlaying) {
      stopCurrentAudio();
    }

    // Clear input only if not from voice
    if (!fromVoice) {
      setInput('');
    }
    
    setLoading(true);

    try {
      if (showVoiceScreen || fromVoice) {
        await handleVoiceScreenResponse(
          textInput, messages, model, detectedLang,
          setMessages, setLoading, setIsAudioPlaying, currentAudioRef,
          isIOS, showNotification, setStreaming
        );
      } else {
        await handleTextResponse(
          textInput, messages, model, detectedLang,
          setMessages, showNotification, setStreaming
        );
      }

    } catch (err) {
      console.error('💥 API call error:', err);
      
      let errorType = 'unknown';
      if (err.message.includes('search') || err.message.includes('sonar')) {
        errorType = 'search';
      } else if (err.message.includes('connection') || err.message.includes('network')) {
        errorType = 'connection';
      } else if (err.message.includes('voice') || err.message.includes('whisper')) {
        errorType = 'voice';
      } else if (err.message.includes('API') || err.message.includes('server')) {
        errorType = 'api';
      }
      
      showNotification(
        err.message, 
        'error', 
        () => handleSend(textInput, fromVoice),
        errorType
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  // 🎙️ ENHANCED VOICE TRANSCRIPT HANDLER
  const handleTranscript = (text, confidence = 1.0) => {
    console.log('🎙️ Voice transcript received:', { text, confidence, voiceMode });
    
    if (showVoiceScreen || voiceMode) {
      // In voice mode - immediate processing
      handleSend(text, true);
    } else {
      // In text mode - fill input
      setInput(text);
    }
  };

  // 🎙️ VOICE LISTENING STATE HANDLER
  const handleVoiceStateChange = (listening) => {
    console.log('🎙️ Voice state change:', listening);
    setIsListening(listening);
  };

  // 🔧 INITIALIZATION - Load saved preferences
  useEffect(() => {
    const { isNewSession, messages: savedMessages } = sessionManager.initSession();
    
    if (!isNewSession && savedMessages.length > 0) {
      setMessages(savedMessages);
      console.log('📂 Loaded', savedMessages.length, 'messages from previous session');
    } else {
      console.log('🆕 Starting fresh session');
    }

    // Load UI language preference
    const savedUILanguage = localStorage.getItem('omnia-ui-language');
    if (savedUILanguage && uiTexts[savedUILanguage]) {
      setUILanguage(savedUILanguage);
    }

    // Load voice mode preference
    const savedVoiceMode = localStorage.getItem('omnia-voice-mode');
    if (savedVoiceMode === 'true') {
      setVoiceMode(true);
    }
  }, []);

  // 🎨 ENHANCED KEYBOARD SHORTCUTS - Added voice controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showVoiceScreen) {
          if (isAudioPlaying) stopCurrentAudio();
          if (streaming) setStreaming(false);
          if (isListening) setIsListening(false);
          setShowVoiceScreen(false);
        } else if (isAudioPlaying) {
          stopCurrentAudio();
          showNotification(t('audioStopped'), 'info');
        } else if (streaming) {
          setStreaming(false);
          showNotification(t('streamingStopped'), 'info');
        }
        if (showModelDropdown) setShowModelDropdown(false);
        if (showSettingsDropdown) setShowSettingsDropdown(false);
      }
      
      // 🆕 SPACE for audio/voice control
      if (e.key === ' ' && (isAudioPlaying || streaming || isListening) && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        if (isAudioPlaying) {
          stopCurrentAudio();
          showNotification(t('audioStopped'), 'info');
        }
        if (streaming) {
          setStreaming(false);
          showNotification(t('streamingStopped'), 'info');
        }
        if (isListening) {
          setIsListening(false);
        }
      }

      // 🆕 V key for voice mode toggle
      if (e.key === 'v' && e.ctrlKey && !loading && !streaming) {
        e.preventDefault();
        toggleVoiceMode();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAudioPlaying, streaming, isListening, showVoiceScreen, showModelDropdown, showSettingsDropdown, uiLanguage, loading, voiceMode]);

  // 🔄 AUTO-SCROLL - Enhanced for voice mode
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  // 💾 SAVE VOICE MODE PREFERENCE
  useEffect(() => {
    localStorage.setItem('omnia-voice-mode', voiceMode.toString());
  }, [voiceMode]);

  const shouldHideLogo = messages.length > 0;

// 🔔 ENHANCED NOTIFICATION HELPER - Better UX + retry functionality
const showNotificationHelper = (message, type = 'info', onClick = null) => {
  const notification = document.createElement('div');
  
  const getNotificationStyle = (type) => {
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
      border: 1px solid;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    switch(type) {
      case 'error':
        return baseStyle + `
          background: linear-gradient(135deg, rgba(220, 53, 69, 0.95), rgba(200, 35, 51, 0.95));
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        `;
      case 'success':
        return baseStyle + `
          background: linear-gradient(135deg, rgba(40, 167, 69, 0.95), rgba(32, 201, 151, 0.95));
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        `;
      case 'info':
      default:
        return baseStyle + `
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.95), rgba(0, 150, 255, 0.95));
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        `;
    }
  };
  
  notification.style.cssText = getNotificationStyle(type);
  
  const getIcon = (type) => {
    switch(type) {
      case 'error':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };
  
  notification.innerHTML = `
    <span style="font-size: 16px;">${getIcon(type)}</span>
    <span>${message}</span>
    ${onClick ? '<span style="margin-left: auto; font-size: 12px; opacity: 0.8;">↗️</span>' : ''}
  `;
  
  if (onClick) {
    notification.addEventListener('click', () => {
      onClick();
      document.body.removeChild(notification);
    });
    notification.style.cursor = 'pointer';
    notification.title = t('retryAction');
  }
  
  notification.addEventListener('mouseenter', () => {
    notification.style.transform = 'translateY(-3px) scale(1.02)';
    notification.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
  });
  
  notification.addEventListener('mouseleave', () => {
    notification.style.transform = 'translateY(0) scale(1)';
    notification.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
  });
  
  document.body.appendChild(notification);
  
  // Auto-dismiss timing based on type and length
  const dismissTime = type === 'error' ? 8000 : message.length > 50 ? 6000 : 4000;
  
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
  }, dismissTime);
};// 🤖 ENHANCED CLAUDE SERVICE - Better multilingual prompts
const claudeService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Claude service with language:', detectedLanguage);
      const claudeMessages = prepareClaudeMessages(messages);
      
      const systemPrompt = this.getSystemPrompt(detectedLanguage);
      
      const response = await fetch('/api/claude2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: claudeMessages,
          system: systemPrompt,
          max_tokens: 2000,
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API failed: HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let fullText = '';
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                
                if (data.type === 'text' && data.content) {
                  fullText += data.content;
                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, true);
                  }
                }
                else if (data.type === 'search_start') {
                  if (onSearchNotification) {
                    onSearchNotification(this.getSearchMessage(detectedLanguage));
                  }
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, false);
                  }
                }
                else if (data.error) {
                  throw new Error(data.message || 'Streaming error');
                }

              } catch (parseError) {
                continue;
              }
            }
          }
        }
      } catch (streamError) {
        console.error('💥 Streaming read error:', streamError);
        throw streamError;
      }

      return fullText;

    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  },

  // 🔧 ENHANCED SYSTEM PROMPTS - Better multilinguality
  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý AI asistent schopný mluvit více jazyky.

🌍 MULTILINGUAL CAPABILITY:
- Komunikuješ primárně v ČEŠTINĚ, ale umíš odpovědět v jakémkoli jazyce
- Pokud uživatel řekne "speak english" → přepni na angličtinu
- Pokud uživatel řekne "vorbește română" → přepni na rumunštinu
- Pokud uživatel míchá jazyky → použij stejný mix v odpovědi

🔍 CAPABILITIES:
- Web search pro aktuální informace
- Analýza dat a insights
- Pokročilé reasoning
- Voice-optimalizované odpovědi

PRAVIDLA ODPOVĚDÍ:
- Odpovídej přirozeně v jazyce uživatele (nebo v češtině default)
- Na konverzační otázky odpovídej normálně a přátelsky
- Neříkej "jsem AI" - prostě odpověz jako inteligentní asistent
- Web search používej jen pro aktuální informace
- Piš přirozeně pro hlasové přehrání (krátké věty, jasné)`,

      'en': `You are Omnia, an advanced multilingual AI assistant.

🌍 MULTILINGUAL CAPABILITY:
- Communicate primarily in ENGLISH, but can respond in any language
- If user says "mluvte česky" → switch to Czech
- If user says "vorbește română" → switch to Romanian
- If user mixes languages → use the same mix in response

🔍 CAPABILITIES:
- Web search for current information
- Data analysis and insights
- Advanced reasoning
- Voice-optimized responses

RESPONSE RULES:
- Respond naturally in user's language (or English as default)
- Answer conversational questions normally and friendly
- Don't say "I'm an AI" - just respond as intelligent assistant
- Use web search only for current information
- Write naturally for voice playback (short sentences, clear)`,

      'ro': `Ești Omnia, un asistent IA avansat multilingv.

🌍 CAPACITATE MULTILINGVĂ:
- Comunici în principal în ROMÂNĂ, dar poți răspunde în orice limbă
- Dacă utilizatorul spune "speak english" → schimbă la engleză
- Dacă utilizatorul spune "mluvte česky" → schimbă la cehă
- Dacă utilizatorul amestecă limbile → folosește același mix în răspuns

🔍 CAPACITĂȚI:
- Căutare web pentru informații actuale
- Analiza datelor și perspective
- Raționament avansat
- Răspunsuri optimizate pentru voce

REGULI DE RĂSPUNS:
- Răspunde natural în limba utilizatorului (sau română implicit)
- Răspunde la întrebări conversaționale normal și prietenos
- Nu spune "Sunt o IA" - răspunde pur și simplu ca asistent inteligent
- Folosește căutarea web doar pentru informații actuale
- Scrie natural pentru redarea vocală (propoziții scurte, clare)`
    };

    return prompts[language] || prompts['cs'];
  },

  getSearchMessage(language) {
    const messages = {
      'cs': 'Vyhledávám aktuální informace...',
      'en': 'Searching for current information...',
      'ro': 'Caut informații actuale...'
    };

    return messages[language] || messages['cs'];
  }
};

// 🤖 ENHANCED OPENAI SERVICE - Better multilingual support
const openaiService = {
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI service with language:', detectedLanguage);
      
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('💥 OpenAI error:', error);
      throw error;
    }
  },

  // 🔧 ENHANCED SYSTEM PROMPTS for multilingual support
  getSystemPrompt(detectedLanguage) {
    const prompts = {
      'cs': `Jsi Omnia, multijazyčný AI asistent.

JAZYKOVÉ PRAVIDLA:
- Odpovídej v ČEŠTINĚ (pokud uživatel nežádá jinak)
- Pokud uživatel říká "speak english" → přepni na angličtinu
- Pokud uživatel říká "vorbește română" → přepni na rumunštinu
- Respektuj jazykové preference uživatele

CHOVÁNÍ:
- Odpovídej přirozeně a přátelsky
- Na konverzační otázky ("co děláš") odpovídej normálně
- Neříkej "jsem AI" - jednoduše komunikuj
- Buď užitečný a přímý
- Optimalizuj pro hlasové přehrání (krátké, jasné věty)`,

      'en': `You are Omnia, a multilingual AI assistant.

LANGUAGE RULES:
- Respond in ENGLISH (unless user requests otherwise)
- If user says "mluvte česky" → switch to Czech
- If user says "vorbește română" → switch to Romanian
- Respect user's language preferences

BEHAVIOR:
- Respond naturally and friendly
- Answer conversational questions ("what are you doing") normally
- Don't say "I'm an AI" - just communicate naturally
- Be helpful and direct
- Optimize for voice playback (short, clear sentences)`,

      'ro': `Ești Omnia, un asistent IA multilingv.

REGULI LINGVISTICE:
- Răspunde în ROMÂNĂ (dacă utilizatorul nu cere altfel)
- Dacă utilizatorul spune "speak english" → schimbă la engleză
- Dacă utilizatorul spune "mluvte česky" → schimbă la cehă
- Respectă preferințele lingvistice ale utilizatorului

COMPORTAMENT:
- Răspunde natural și prietenos
- Răspunde la întrebări conversaționale ("ce faci") normal
- Nu spune "Sunt o IA" - comunică pur și simplu natural
- Fii util și direct
- Optimizează pentru redarea vocală (propoziții scurte, clare)`
    };

    return prompts[detectedLanguage] || prompts['cs'];
  }
};

// 🔎 ENHANCED SONAR SERVICE - Better search with multilingual support
const sonarService = {
  async search(query, showNotification, detectedLanguage = 'cs') {
    try {
      console.log('🔍 Sonar detected language:', detectedLanguage);
      
      showNotification(this.getSearchMessage(detectedLanguage), 'info');

      const enhancedQuery = this.enhanceQueryForCurrentData(query);

      const response = await fetch('/api/sonar-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enhancedQuery,
          freshness: 'recent',
          count: 10,
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Sonar request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error('Invalid Sonar response');
      }

      showNotification(this.getSuccessMessage(detectedLanguage), 'success');
      
      return {
        success: true,
        result: data.result,
        citations: data.citations || [],
        sources: data.sources || [],
        source: 'sonar_search'
      };
    } catch (error) {
      console.error('💥 Sonar error:', error);
      showNotification(this.getErrorMessage(detectedLanguage, error.message), 'error');
      return {
        success: false,
        message: this.getErrorMessage(detectedLanguage, error.message),
        source: 'sonar_search'
      };
    }
  },

  getSearchMessage(language) {
    const messages = {
      'cs': 'Vyhledávám nejnovější informace...',
      'en': 'Searching for latest information...',
      'ro': 'Caut informații recente...'
    };
    return messages[language] || messages['cs'];
  },

  getSuccessMessage(language) {
    const messages = {
      'cs': 'Nalezeny aktuální informace!',
      'en': 'Found current information!',
      'ro': 'Informații actuale găsite!'
    };
    return messages[language] || messages['cs'];
  },

  getErrorMessage(language, error) {
    const messages = {
      'cs': `Chyba při vyhledávání: ${error}`,
      'en': `Search error: ${error}`,
      'ro': `Eroare de căutare: ${error}`
    };
    return messages[language] || messages['cs'];
  },

  enhanceQueryForCurrentData(originalQuery) {
    const query = originalQuery.toLowerCase();
    const currentYear = new Date().getFullYear();
    
    if (query.includes('2024') || query.includes('2025')) {
      return originalQuery;
    }

    const temporalTriggers = [
      'aktuální', 'dnešní', 'současný', 'nejnovější', 'poslední',
      'current', 'latest', 'recent', 'today', 'now',
      'actual', 'recent', 'astăzi', 'acum'
    ];

    const needsTimeFilter = temporalTriggers.some(trigger => query.includes(trigger));
    
    if (needsTimeFilter) {
      return `${originalQuery} ${currentYear} latest current`;
    }

    return originalQuery;
  }
};

// 🎵 ENHANCED VOICE-TO-VOICE RESPONSE HANDLER - Automatic TTS for all models
const handleVoiceScreenResponse = async (
  textInput,
  currentMessages,
  model,
  detectedLanguage,
  setMessages,
  setLoading,
  setIsAudioPlaying,
  currentAudioRef,
  isIOS,
  showNotification,
  setStreaming = null
) => {
  try {
    console.log('🎙️ Voice-to-Voice Response:', model, 'language:', detectedLanguage);

    const userMessage = { sender: 'user', text: textInput };
    const messagesWithUser = [...currentMessages, userMessage];
    setMessages(messagesWithUser);
    localStorage.setItem('omnia-memory', JSON.stringify(messagesWithUser));

    let responseText = '';

    if (model === 'sonar') {
      const searchResult = await sonarService.search(textInput, showNotification, detectedLanguage);
      if (searchResult.success) {
        responseText = searchResult.result;
        // Add sources for voice mode (spoken)
        if (searchResult.sources && searchResult.sources.length > 0) {
          const sourceText = detectedLanguage === 'cs' ? 'Zdroje' :
                            detectedLanguage === 'en' ? 'Sources' : 'Surse';
          responseText += `. ${sourceText}: ${searchResult.sources.slice(0, 2).join(', ')}`;
        }
      } else {
        const errorPrefix = detectedLanguage === 'cs' ? 'Nepodařilo se najít informace' :
                           detectedLanguage === 'en' ? 'Could not find information' :
                           'Nu am găsit informații';
        responseText = `${errorPrefix}: ${searchResult.message}`;
      }
      
      const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
      setMessages(finalMessages);
      localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));

      // ✅ IMMEDIATE TTS for Sonar
      await generateInstantAudio(
        responseText,
        setIsAudioPlaying,
        currentAudioRef,
        isIOS,
        showNotification,
        detectedLanguage
      );
    }
    else if (model === 'claude') {
      if (setStreaming) setStreaming(true);

      const streamingBotMessage = { sender: 'bot', text: '', isStreaming: true };
      const messagesWithBot = [...messagesWithUser, streamingBotMessage];
      setMessages(messagesWithBot);

      const onStreamUpdate = (text, isStillStreaming) => {
        const updatedMessages = [...messagesWithUser, { 
          sender: 'bot', 
          text: text, 
          isStreaming: isStillStreaming 
        }];
        setMessages(updatedMessages);
        
        if (!isStillStreaming) {
          localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
          if (setStreaming) setStreaming(false);
          responseText = text;
          
          // ✅ IMMEDIATE TTS after Claude streaming ends
          setTimeout(async () => {
            try {
              await generateInstantAudio(
                text,
                setIsAudioPlaying,
                currentAudioRef,
                isIOS,
                showNotification,
                detectedLanguage
              );
            } catch (error) {
              console.error('❌ Claude auto-TTS failed:', error);
            }
          }, 300); // Shorter delay for better voice experience
        }
      };

      responseText = await claudeService.sendMessage(
        messagesWithUser, 
        onStreamUpdate, 
        null, // No search notifications in voice mode
        detectedLanguage
      );
    }
    else if (model === 'gpt-4o') {
      const openAiMessages = [
        {
          role: 'system',
          content: openaiService.getSystemPrompt(detectedLanguage)
        },
        ...currentMessages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: textInput }
      ];

      responseText = await openaiService.sendMessage(openAiMessages, detectedLanguage);
      
      const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
      setMessages(finalMessages);
      localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));

      // ✅ IMMEDIATE TTS for GPT
      await generateInstantAudio(
        responseText,
        setIsAudioPlaying,
        currentAudioRef,
        isIOS,
        showNotification,
        detectedLanguage
      );
    }
    else {
      throw new Error(`Unknown model: ${model}`);
    }

    return responseText;

  } catch (error) {
    console.error('💥 Voice-to-Voice error:', error);
    if (setStreaming) setStreaming(false);

    const errorText = getLocalizedErrorMessage('voice', detectedLanguage, error.message);
    const errorMessages = [...currentMessages, { sender: 'bot', text: errorText }];
    setMessages(errorMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(errorMessages));
    
    showNotification(errorText, 'error');
    throw error;
  }
};

// ✅ ENHANCED TEXT RESPONSE Handler - Better language support
const handleTextResponse = async (
  textInput,
  currentMessages,
  model,
  detectedLanguage,
  setMessages,
  showNotification,
  setStreaming = null
) => {
  console.log('💬 Text Response with model:', model, 'language:', detectedLanguage);

  const userMessage = { sender: 'user', text: textInput };
  const messagesWithUser = [...currentMessages, userMessage];
  setMessages(messagesWithUser);
  localStorage.setItem('omnia-memory', JSON.stringify(messagesWithUser));

  let responseText = '';

  if (model === 'sonar') {
    const searchResult = await sonarService.search(textInput, showNotification, detectedLanguage);
    if (searchResult.success) {
      responseText = searchResult.result;
      if (searchResult.citations && searchResult.citations.length > 0) {
        const citationText = detectedLanguage === 'cs' ? 'Zdroje' :
                            detectedLanguage === 'en' ? 'Sources' : 'Surse';
        responseText += `\n\n${citationText}:\n${searchResult.citations.map(c => `• ${c}`).join('\n')}`;
      }
    } else {
      const errorPrefix = detectedLanguage === 'cs' ? 'Nepodařilo se najít aktuální informace' :
                         detectedLanguage === 'en' ? 'Could not find current information' :
                         'Nu am găsit informații actuale';
      responseText = `${errorPrefix}: ${searchResult.message}`;
    }
    
    const updatedMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
    setMessages(updatedMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
  }
  else if (model === 'claude') {
    if (setStreaming) setStreaming(true);

    const streamingBotMessage = { sender: 'bot', text: '', isStreaming: true };
    const messagesWithBot = [...messagesWithUser, streamingBotMessage];
    setMessages(messagesWithBot);

    const onStreamUpdate = (text, isStillStreaming) => {
      const updatedMessages = [...messagesWithUser, { 
        sender: 'bot', 
        text: text, 
        isStreaming: isStillStreaming 
      }];
      setMessages(updatedMessages);
      
      if (!isStillStreaming) {
        localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
        if (setStreaming) setStreaming(false);
      }
    };

    responseText = await claudeService.sendMessage(
      messagesWithUser, 
      onStreamUpdate, 
      null,
      detectedLanguage
    );
  }
  else if (model === 'gpt-4o') {
    const openAiMessages = [
      {
        role: 'system',
        content: openaiService.getSystemPrompt(detectedLanguage)
      },
      ...currentMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: textInput }
    ];

    responseText = await openaiService.sendMessage(openAiMessages, detectedLanguage);
    
    const updatedMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
    setMessages(updatedMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
  }
  else {
    throw new Error(`Unknown model: ${model}`);
  }

  return responseText;
};// 🎙️ REVOLUTIONARY CONTINUOUS VOICE RECORDER - Nahrazuje push-to-talk
const ContinuousVoiceRecorder = ({ 
  onTranscript, 
  onListeningChange,
  disabled, 
  mode,
  isAudioPlaying,
  uiLanguage = 'cs'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [silenceDetected, setSilenceDetected] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const volumeCheckIntervalRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  
  // 🔧 VOICE DETECTION SETTINGS
  const SILENCE_THRESHOLD = 0.01; // Práh ticha
  const SILENCE_DURATION = 1800; // 1.8s ticha = stop recording
  const MIN_RECORDING_TIME = 800; // Minimálně 0.8s nahrávání
  const MAX_RECORDING_TIME = 30000; // Max 30s nahrávání
  
  const isIOSPWA = window.navigator.standalone;

  // 🔧 REQUEST MICROPHONE PERMISSION
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
      
      // Stop stream immediately after permission check
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

  // 🎙️ ENHANCED VOLUME DETECTION
  const setupAudioAnalysis = (stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);
      
      console.log('🔊 Audio analysis setup complete');
      return true;
    } catch (error) {
      console.error('❌ Audio analysis setup failed:', error);
      return false;
    }
  };

  // 🔊 CHECK AUDIO VOLUME
  const checkAudioLevel = () => {
    if (!analyserRef.current) return 0;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedVolume = average / 255; // Normalize to 0-1
    
    return normalizedVolume;
  };

  // 🎙️ START CONTINUOUS RECORDING
  const startListening = async () => {
    try {
      console.log('🎙️ Starting continuous voice detection...');

      // Check permission first
      if (!permissionGranted) {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          return;
        }
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

      // Setup audio analysis for volume detection
      setupAudioAnalysis(stream);

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
        setSilenceDetected(false);
        
        const recordingDuration = Date.now() - recordingStartTimeRef.current;
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        try {
          // Check if recording is long enough and has audio data
          if (audioChunksRef.current.length === 0 || recordingDuration < MIN_RECORDING_TIME) {
            console.warn('⚠️ Recording too short or no data');
            const shortMessage = {
              'cs': 'Nahrávka příliš krátká - zkuste znovu',
              'en': 'Recording too short - try again',
              'ro': 'Înregistrare prea scurtă - încearcă din nou'
            }[uiLanguage] || 'Recording too short';
            
            onTranscript(`[${shortMessage}]`);
            setIsProcessing(false);
            return;
          }

          const audioBlob = new Blob(audioChunksRef.current, { 
            type: isIOSPWA ? 'audio/mp4' : 'audio/webm' 
          });
          
          // Check blob size
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

      // Start recording
      mediaRecorder.start();
      setIsListening(true);
      if (onListeningChange) onListeningChange(true);
      
      console.log('🎯 Continuous recording started');

      // Start volume monitoring for silence detection
      volumeCheckIntervalRef.current = setInterval(() => {
        const volume = checkAudioLevel();
        
        if (volume > SILENCE_THRESHOLD) {
          // Voice detected - reset silence timer
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
          setSilenceDetected(false);
        } else {
          // Silence detected - start timer if not already running
          if (!silenceTimeoutRef.current) {
            setSilenceDetected(true);
            silenceTimeoutRef.current = setTimeout(() => {
              console.log('🔇 Silence detected - stopping recording');
              stopListening();
            }, SILENCE_DURATION);
          }
        }
      }, 100); // Check every 100ms

      // Max recording time safety
      setTimeout(() => {
        if (isListening) {
          console.log('⏰ Max recording time reached');
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

  // 🛑 STOP LISTENING
  const stopListening = () => {
    console.log('🛑 Stopping continuous listening...');

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (volumeCheckIntervalRef.current) {
      clearInterval(volumeCheckIntervalRef.current);
      volumeCheckIntervalRef.current = null;
    }

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

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
    setSilenceDetected(false);
    if (onListeningChange) onListeningChange(false);
  };

  // 🔄 TOGGLE LISTENING
  const toggleListening = () => {
    if (disabled || isProcessing) return;
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 🎨 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // 🔇 STOP WHEN AUDIO IS PLAYING
  useEffect(() => {
    if (isAudioPlaying && isListening) {
      console.log('🔇 Stopping listening - audio playing');
      stopListening();
    }
  }, [isAudioPlaying]);

  // 🎨 GET BUTTON STYLE
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
      transition: 'all 0.2s ease',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'none'
    };

    if (isProcessing) return { 
      ...baseStyle,
      backgroundColor: '#ffc107',
      color: 'white',
      boxShadow: '0 0 20px rgba(255, 193, 7, 0.5)',
      animation: 'omnia-pulse 1.5s ease-in-out infinite'
    };
    
    if (isListening) return { 
      ...baseStyle,
      backgroundColor: silenceDetected ? '#17a2b8' : '#dc3545',
      color: 'white',
      transform: 'scale(1.1)',
      boxShadow: silenceDetected ? 
        '0 0 30px rgba(23, 162, 184, 0.6)' : 
        '0 0 30px rgba(220, 53, 69, 0.6)',
      animation: silenceDetected ? 
        'omnia-pulse 2s ease-in-out infinite' : 
        'omnia-pulse 1s ease-in-out infinite'
    };
    
    return { 
      ...baseStyle,
      backgroundColor: '#007bff',
      color: 'white',
      boxShadow: '0 0 15px rgba(0, 123, 255, 0.4)'
    };
  };

  // 🎨 GET BUTTON ICON
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
      if (silenceDetected) {
        return '⏸️'; // Silence detected
      }
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

  // 🎨 GET BUTTON TITLE
  const getButtonTitle = () => {
    const titles = {
      'cs': {
        processing: 'Zpracovávám nahrávku...',
        listening: silenceDetected ? 'Poslouchám - ticho detekováno' : 'Poslouchám - mluvte',
        ready: 'Klikněte pro mluvení'
      },
      'en': {
        processing: 'Processing recording...',
        listening: silenceDetected ? 'Listening - silence detected' : 'Listening - speak now',
        ready: 'Click to speak'
      },
      'ro': {
        processing: 'Procesez înregistrarea...',
        listening: silenceDetected ? 'Ascult - tăcere detectată' : 'Ascult - vorbește acum',
        ready: 'Apasă pentru a vorbi'
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

// 🎵 ENHANCED GOOGLE TTS AUDIO GENERATION - Better error handling
const generateInstantAudio = async (responseText, setIsAudioPlaying, currentAudioRef, isIOS, showNotification, language = 'cs') => {
  try {
    console.log('🎵 Generating Google TTS audio for language:', language);
    
    const processedText = preprocessTextForTTS(responseText, language);
    
    const response = await fetch('/api/google-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: processedText,
        language: language,
        voice: 'natural'
      })
    });

    if (!response.ok) {
      throw new Error(`Google TTS API failed: ${response.status}`);
    }

    setIsAudioPlaying(true);

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    currentAudioRef.current = audio;
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    if (isIOS) {
      audio.load();
    }
    
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
        console.log('🎵 Google TTS audio started playing for language:', language);
      }
    };
    
    audio.onended = () => {
      console.log('✅ Google TTS audio playback finished');
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
      window.removeEventListener('omnia-audio-start', handleInterrupt);
    };
    
    audio.onerror = (e) => {
      console.error('❌ Google TTS audio playback error:', e);
      setIsAudioPlaying(false);
      currentAudioRef.current = null;
      URL.revokeObjectURL(audioUrl);
      window.removeEventListener('omnia-audio-start', handleInterrupt);
      
      const errorMsg = language === 'cs' ? 'Chyba při přehrávání Google TTS' :
                      language === 'en' ? 'Google TTS playback error' :
                      'Eroare redare Google TTS';
      showNotification(errorMsg, 'error');
    };
    
    try {
      await audio.play();
      console.log('🎯 Google TTS audio plays IMMEDIATELY after AI response!');
    } catch (playError) {
      console.error('❌ Auto-play blocked:', playError);
      const playMsg = language === 'cs' ? 'Klepněte pro přehrání odpovědi' :
                     language === 'en' ? 'Click to play response' :
                     'Apasă pentru redare răspuns';
      showNotification(playMsg, 'info', () => {
        audio.play().catch(console.error);
      });
    }
    
    return audio;
    
  } catch (error) {
    console.error('💥 Google TTS audio generation failed:', error);
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    
    const errorMsg = language === 'cs' ? 'Google TTS se nepodařilo vygenerovat' :
                    language === 'en' ? 'Failed to generate Google TTS' :
                    'Nu s-a putut genera Google TTS';
    showNotification(errorMsg, 'error');
    throw error;
  }
};

// 🔊 FIXED VOICE BUTTON - No more duplicate audio
const VoiceButton = ({ text, onAudioStart, onAudioEnd, language = 'cs' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // ✅ FIX: Better cleanup on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          const audioUrl = audioRef.current.src;
          if (audioUrl && audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
        } catch (error) {
          console.error('Cleanup error:', error);
        }
        audioRef.current = null;
      }
    };
  }, []);

  // ✅ FIX: Enhanced audio interrupt handling
  useEffect(() => {
    const handleNewAudio = () => {
      if (audioRef.current && !audioRef.current.paused) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          const audioUrl = audioRef.current.src;
          if (audioUrl && audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
        } catch (error) {
          console.error('Audio interrupt error:', error);
        }
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
      }
    };

    window.addEventListener('omnia-audio-start', handleNewAudio);
    return () => window.removeEventListener('omnia-audio-start', handleNewAudio);
  }, [onAudioEnd]);

  const handleSpeak = async () => {
    // ✅ FIX: Improved stop logic - no duplicate audio
    if (isPlaying) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          const audioUrl = audioRef.current.src;
          if (audioUrl && audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
        } catch (error) {
          console.error('Stop audio error:', error);
        }
        audioRef.current = null;
      }
      setIsPlaying(false);
      if (onAudioEnd) onAudioEnd();
      return;
    }

    // ✅ FIX: Prevent multiple simultaneous requests
    if (isLoading) {
      console.log('🚫 Audio generation already in progress');
      return;
    }

    try {
      setIsLoading(true);
      window.dispatchEvent(new CustomEvent('omnia-audio-start'));
      if (onAudioStart) onAudioStart();

      const processedText = preprocessTextForTTS(text, language);

      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: processedText,
          language: language,
          voice: 'natural'
        })
      });

      if (!response.ok) {
        throw new Error(`Google TTS API failed: HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // ✅ FIX: Clean up previous audio before creating new one
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          const oldUrl = audioRef.current.src;
          if (oldUrl && oldUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldUrl);
          }
        } catch (error) {
          console.error('Previous audio cleanup error:', error);
        }
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // ✅ FIX: Enhanced event handlers with proper cleanup
      audio.onplay = () => {
        setIsPlaying(true);
        console.log('🔊 Google TTS playback started for language:', language);
      };
      
      audio.onended = () => {
        console.log('✅ Google TTS playback finished');
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        
        try {
          URL.revokeObjectURL(audioUrl);
        } catch (error) {
          console.error('URL cleanup error:', error);
        }
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('❌ Google TTS playback error:', e);
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        
        try {
          URL.revokeObjectURL(audioUrl);
        } catch (error) {
          console.error('Error cleanup error:', error);
        }
        audioRef.current = null;
      };

      audio.onabort = () => {
        console.log('🛑 Audio playback aborted');
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        
        try {
          URL.revokeObjectURL(audioUrl);
        } catch (error) {
          console.error('Abort cleanup error:', error);
        }
        audioRef.current = null;
      };

      await audio.play();

    } catch (error) {
      console.error('💥 Google TTS error:', error);
      setIsPlaying(false);
      if (onAudioEnd) onAudioEnd();
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonIcon = () => {
    if (isLoading) return (
      <div style={{ 
        width: '14px', 
        height: '14px', 
        border: '2px solid rgba(255,255,255,0.3)', 
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
    );
    
    if (isPlaying) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    );
    
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    );
  };

  const getButtonTitle = () => {
    const titles = {
      'cs': {
        loading: 'Generuji Google TTS...',
        playing: 'Klepněte pro zastavení',
        ready: 'Přehrát s Google hlasem'
      },
      'en': {
        loading: 'Generating Google TTS...',
        playing: 'Click to stop',
        ready: 'Play with Google voice'
      },
      'ro': {
        loading: 'Generez Google TTS...',
        playing: 'Apasă pentru oprire',
        ready: 'Redă cu voce Google'
      }
    };

    const langTitles = titles[language] || titles['cs'];
    
    if (isLoading) return langTitles.loading;
    if (isPlaying) return langTitles.playing;
    return langTitles.ready;
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading}
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
        opacity: 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        color: 'white'
      }}
      title={getButtonTitle()}
    >
      {getButtonIcon()}
      {isLoading && (
        <span style={{ 
          fontSize: '0.7rem', 
          color: '#ffc107',
          fontWeight: '500'
        }}>
          {language.toUpperCase()}
        </span>
      )}
    </button>
  );
};

// 📋 ENHANCED COPY BUTTON - Better multilingual support
const CopyButton = ({ text, language = 'cs' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getButtonTitle = () => {
    const titles = {
      'cs': {
        copied: 'Zkopírováno!',
        ready: 'Zkopírovat text'
      },
      'en': {
        copied: 'Copied!',
        ready: 'Copy text'
      },
      'ro': {
        copied: 'Copiat!',
        ready: 'Copiază textul'
      }
    };

    const langTitles = titles[language] || titles['cs'];
    return copied ? langTitles.copied : langTitles.ready;
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.85rem',
        opacity: 1,
        transition: 'all 0.2s ease',
        color: copied ? '#28a745' : 'white'
      }}
      title={getButtonTitle()}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
      )}
    </button>
  );
};// 🎤 ENHANCED VOICE SCREEN - Continuous voice mode with better UX
const VoiceScreen = ({ 
  onClose, 
  onTranscript, 
  onListeningChange,
  loading, 
  isAudioPlaying,
  isListening,
  isMobile,
  stopCurrentAudio,
  model,
  streaming = false,
  uiLanguage = 'cs'
}) => {

  const t = (key) => uiTexts[uiLanguage][key] || uiTexts['cs'][key] || key;

  const handleScreenClick = (e) => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    if (isListening && onListeningChange) {
      onListeningChange(false);
    }
    onClose();
  };

  const handleElementClick = (e) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
  };

  // ✅ Enhanced status messages with listening state
  const getStatusMessage = () => {
    if (streaming) {
      return t('omniaStreaming');
    }
    if (loading) {
      return t('omniaPreparingResponse');
    }
    if (isAudioPlaying) {
      return `${t('omniaSpeaking')} (${t('clickToStop')})`;
    }
    if (isListening) {
      return t('listening'); // "Poslouchám..." / "Listening..." / "Ascult..."
    }
    return t('clickToSpeak'); // "Klikněte pro mluvení"
  };

  const getSubtitleText = () => {
    if (streaming) {
      return t('streamingRealTime');
    }
    if (isListening) {
      return 'Continuous voice mode • Speak naturally';
    }
    return t('advancedAIAssistant');
  };

  const getFooterText = () => {
    if (streaming) {
      return `Omnia ${t('streaming')} • ${t('clickToStop')}`;
    }
    if (isListening) {
      return `Omnia listening • ${t('clickToStop')}`;
    }
    if (isMobile) {
      return `Omnia • ${t('clickToReturn')}`;
    }
    return `Omnia • ESC ${t('or')} ${t('clickToReturn')}`;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isListening
          ? 'linear-gradient(135deg, #0f1419 0%, #1a202c 30%, #2d3748 70%, #4a5568 100%)'
          : streaming 
            ? 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #2d3748 100%)'
            : 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #4a5568 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        cursor: 'pointer',
        padding: isMobile ? '1rem' : '2rem',
        minHeight: '100vh',
        overflowY: 'auto',
        transition: 'background 0.5s ease'
      }}
      onClick={handleScreenClick}
    >
      {/* Close button */}
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '1rem' : '2rem',
          right: isMobile ? '1rem' : '2rem',
          cursor: 'pointer',
          fontSize: isMobile ? '1.5rem' : '2rem',
          opacity: 0.7,
          transition: 'opacity 0.2s ease',
          zIndex: 1002
        }}
        onClick={handleCloseClick}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        ✕
      </div>

      {/* Logo */}
      <div 
        style={{
          fontSize: isMobile ? '3rem' : '4rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: isListening
            ? 'linear-gradient(45deg, #00ffff, #63b3ed, #90cdf4, #bee3f8)'
            : streaming 
              ? 'linear-gradient(45deg, #4299e1, #63b3ed, #90cdf4)'
              : 'linear-gradient(45deg, #4299e1, #63b3ed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          cursor: 'pointer',
          letterSpacing: '0.1em',
          animation: isListening ? 'omnia-pulse 2s ease-in-out infinite' : 'none'
        }}
        onClick={handleElementClick}
      >
        OMNIA
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: isMobile ? '0.9rem' : '1rem',
        marginBottom: '2rem',
        textAlign: 'center',
        opacity: 0.7,
        cursor: 'pointer'
      }}
      onClick={handleElementClick}
      >
        {getSubtitleText()}
      </div>

      {/* Main status message */}
      <div style={{
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        fontWeight: '600',
        marginBottom: '2.5rem',
        textAlign: 'center',
        opacity: 0.9,
        cursor: 'pointer',
        maxWidth: isMobile ? '300px' : '400px',
        lineHeight: '1.4',
        color: isListening ? '#00ffff' : 'white',
        transition: 'color 0.3s ease'
      }}
      onClick={handleElementClick}
      >
        {getStatusMessage()}
      </div>

      {/* Continuous Voice Recorder */}
      <div 
        style={{ marginBottom: '3rem' }}
        onClick={handleElementClick}
      >
        <ContinuousVoiceRecorder 
          onTranscript={onTranscript}
          onListeningChange={onListeningChange}
          disabled={loading}
          mode="voice"
          isAudioPlaying={isAudioPlaying}
          uiLanguage={uiLanguage}
        />
      </div>

      {/* Footer text */}
      <div style={{
        fontSize: '0.9rem',
        opacity: 0.6,
        textAlign: 'center',
        maxWidth: '360px',
        lineHeight: '1.4',
        cursor: 'pointer'
      }}
      onClick={handleElementClick}
      >
        {getFooterText()}
      </div>
    </div>
  );
};

// ⚙️ ENHANCED SETTINGS DROPDOWN
const SettingsDropdown = ({ isOpen, onClose, onNewChat, uiLanguage, setUILanguage, t }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '4px',
        background: '#2d3748',
        border: '1px solid #4a5568',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        minWidth: '220px'
      }}>
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem 1rem',
            border: 'none',
            background: '#2d3748',
            textAlign: 'left',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: '400',
            borderRadius: '8px 8px 0 0',
            color: '#e2e8f0'
          }}
          onMouseEnter={(e) => e.target.style.background = '#4a5568'}
          onMouseLeave={(e) => e.target.style.background = '#2d3748'}
        >
          {t('newChat')}
        </button>
        
        <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #4a5568' }}>
          <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.5rem' }}>
            {t('interfaceLanguage')}
          </div>
          <select 
            value={uiLanguage} 
            onChange={(e) => {
              setUILanguage(e.target.value);
              localStorage.setItem('omnia-ui-language', e.target.value);
              onClose();
            }}
            style={{ 
              width: '100%', 
              padding: '4px 8px', 
              borderRadius: '4px',
              background: '#1a202c',
              border: '1px solid #4a5568',
              color: 'white',
              fontSize: '0.8rem'
            }}
          >
            <option value="cs">🇨🇿 Čeština</option>
            <option value="en">🇺🇸 English</option>
            <option value="ro">🇷🇴 Română</option>
          </select>
        </div>
        
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          color: '#a0aec0',
          borderTop: '1px solid #4a5568'
        }}>
          ✅ Continuous Voice Mode
        </div>
        
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          color: '#a0aec0'
        }}>
          ✅ Google TTS Enhanced
        </div>
      </div>
    </>
  );
};

// ✏️ ENHANCED EDITABLE MESSAGE
const EditableMessage = ({ message, onEdit, onCancel, uiLanguage, t }) => {
  const [editText, setEditText] = useState(message.text);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(message.text);
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  if (!isEditing) {
    return (
      <div 
        style={{ position: 'relative', width: '100%' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>{message.text}</span>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: '0.7rem',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: isHovered ? 'auto' : 'none'
          }}
          title="Upravit zprávu"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        style={{
          width: '100%',
          minHeight: '60px',
          padding: '8px',
          border: '1px solid #4a5568',
          borderRadius: '6px',
          background: '#1a202c',
          color: 'white',
          fontSize: '0.9rem',
          resize: 'vertical',
          outline: 'none'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
          }
          if (e.key === 'Escape') {
            handleCancel();
          }
        }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={handleSave}
          disabled={!editText.trim()}
          style={{
            padding: '4px 12px',
            border: 'none',
            borderRadius: '4px',
            background: editText.trim() ? '#28a745' : '#4a5568',
            color: 'white',
            cursor: editText.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.8rem'
          }}
        >
          {t('save')}
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: '4px 12px',
            border: '1px solid #4a5568',
            borderRadius: '4px',
            background: 'transparent',
            color: '#a0aec0',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

// 🎉 FINAL MAIN JSX RETURN - REVOLUTIONARY VOICE-TO-VOICE APP
return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: isListening 
        ? 'linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff)'
        : streaming
          ? 'linear-gradient(135deg, #000428, #004e92, #009ffd)'
          : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      width: '100vw',
      margin: 0,
      padding: 0,
      transition: 'background 0.5s ease'
    }}>
      
      <header style={{ 
        padding: isMobile ? '1rem 1rem 0.5rem' : '1.5rem 2rem 1rem',
        background: isListening
          ? 'linear-gradient(135deg, rgba(0, 4, 40, 0.9), rgba(0, 78, 146, 0.7), rgba(0, 159, 253, 0.5))'
          : 'linear-gradient(135deg, rgba(0, 4, 40, 0.8), rgba(0, 78, 146, 0.6))',
        position: 'relative',
        borderBottom: isListening 
          ? '1px solid rgba(0, 255, 255, 0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        width: '100%',
        transition: 'all 0.5s ease'
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          width: '100%'
        }}>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={loading || streaming}
              style={{
                background: streaming || isListening ? 'rgba(0, 255, 255, 0.2)' : '#2d3748',
                border: streaming || isListening ? '1px solid #00ffff' : '1px solid #4a5568',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                color: streaming || isListening ? '#00ffff' : '#e2e8f0',
                cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                opacity: (loading || streaming) ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {model === 'claude' ? 'Omnia' : model === 'sonar' ? 'Omnia Search' : 'Omnia GPT'}
              {(streaming || isListening) && <span style={{ color: '#00ffff' }}>●</span>}
              {!streaming && !loading && !isListening && ' ▼'}
            </button>
            
            {showModelDropdown && !loading && !streaming && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                minWidth: '200px'
              }}>
                <button
                  onClick={() => { setModel('gpt-4o'); setShowModelDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '0.75rem 1rem',
                    border: 'none', background: model === 'gpt-4o' ? '#4a5568' : '#2d3748',
                    textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer',
                    fontWeight: model === 'gpt-4o' ? '600' : '400', color: '#e2e8f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4a5568'}
                  onMouseLeave={(e) => e.target.style.background = model === 'gpt-4o' ? '#4a5568' : '#2d3748'}
                >
                  Omnia GPT • Konverzace
                </button>
                <button
                  onClick={() => { setModel('claude'); setShowModelDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '0.75rem 1rem',
                    border: 'none', background: model === 'claude' ? '#4a5568' : '#2d3748',
                    textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer',
                    fontWeight: model === 'claude' ? '600' : '400', color: '#e2e8f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4a5568'}
                  onMouseLeave={(e) => e.target.style.background = model === 'claude' ? '#4a5568' : '#2d3748'}
                >
                  Omnia • AI + Streaming
                </button>
                <button
                  onClick={() => { setModel('sonar'); setShowModelDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '0.75rem 1rem',
                    border: 'none', background: model === 'sonar' ? '#4a5568' : '#2d3748',
                    textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer',
                    fontWeight: model === 'sonar' ? '600' : '400',
                    borderRadius: '0 0 8px 8px', color: '#e2e8f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4a5568'}
                  onMouseLeave={(e) => e.target.style.background = model === 'sonar' ? '#4a5568' : '#2d3748'}
                >
                  Omnia Search • Real-time
                </button>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              disabled={loading || streaming}
              style={{
                background: streaming || isListening ? 'rgba(0, 255, 255, 0.2)' : '#2d3748',
                border: streaming || isListening ? '1px solid #00ffff' : '1px solid #4a5568',
                borderRadius: '8px', padding: '0.5rem', fontSize: '1rem',
                color: streaming || isListening ? '#00ffff' : '#e2e8f0',
                cursor: (loading || streaming) ? 'not-allowed' : 'pointer',
                opacity: (loading || streaming) ? 0.7 : 1,
                transition: 'all 0.3s ease'
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
          alignItems: 'center', gap: '1rem', maxWidth: '1200px',
          margin: '0 auto', width: '100%'
        }}>
          <OmniaLogo 
            size={isMobile ? 60 : 80} 
            animate={streaming || loading}
            isListening={isListening}
            shouldHide={shouldHideLogo}
          />
          {!shouldHideLogo && (
            <>
              <h1 style={{ 
                fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: '700',
                margin: 0, 
                color: isListening ? '#00ffff' : streaming ? '#00ffff' : '#ffffff',
                letterSpacing: '0.02em', 
                transition: 'color 0.5s ease',
                textShadow: isListening ? '0 0 20px rgba(0, 255, 255, 0.5)' : 'none'
              }}>
                OMNIA
              </h1>
              <div style={{
                fontSize: '0.9rem', opacity: 0.7, textAlign: 'center',
                color: isListening ? '#00ffff' : streaming ? '#00ffff' : 'inherit',
                transition: 'color 0.5s ease'
              }}>
                {isListening ? 'continuous voice mode active' : 
                 streaming ? 'streamuje v reálném čase' : 
                 'multilingual AI assistant'}
              </div>
            </>
          )}
        </div>
      </header>

      <main style={{ 
        flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '2rem',
        paddingBottom: '140px',
        background: isListening
          ? 'linear-gradient(135deg, rgba(0, 4, 40, 0.4), rgba(0, 78, 146, 0.3), rgba(0, 159, 253, 0.2))'
          : 'linear-gradient(135deg, rgba(0, 4, 40, 0.3), rgba(0, 78, 146, 0.2))',
        width: '100%', transition: 'background 0.5s ease'
      }}>
        <div style={{ 
          maxWidth: '1000px', margin: '0 auto',
          minHeight: messages.length === 0 ? '60vh' : 'auto',
          display: 'flex', flexDirection: 'column',
          justifyContent: messages.length === 0 ? 'center' : 'flex-start',
          width: '100%'
        }}>
          
          {messages.length === 0 && !shouldHideLogo && (
            <div style={{ height: '40vh' }}></div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1.5rem'
            }}>
              {msg.sender === 'user' ? (
                <div style={{
                  backgroundColor: '#2d3748',
                  color: '#ffd700',
                  padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                  borderRadius: '20px 20px 4px 20px',
                  maxWidth: isMobile ? '85%' : '75%',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}>
                  <EditableMessage 
                    message={msg}
                    onEdit={(newText) => handleEditMessage(idx, newText)}
                    uiLanguage={uiLanguage}
                    t={t}
                  />
                </div>
              ) : (
                <div style={{
                  maxWidth: isMobile ? '90%' : '85%',
                  padding: isMobile ? '1rem' : '1.5rem',
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: '#ffffff',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${msg.isStreaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                  paddingLeft: '1.5rem'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontWeight: '600', color: '#a0aec0', display: 'flex', alignItems: 'center' }}>
                      <ChatOmniaLogo size={16} />
                      Omnia
                      {msg.isStreaming ? ' • streaming' : ''}
                    </span>
                    {!msg.isStreaming && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <VoiceButton 
                          text={msg.text} 
                          language={userLanguage}
                          onAudioStart={() => setIsAudioPlaying(true)}
                          onAudioEnd={() => setIsAudioPlaying(false)}
                        />
                        <CopyButton text={msg.text} language={userLanguage} />
                      </div>
                    )}
                  </div>
                  
                  <TypewriterText text={msg.text} isStreaming={msg.isStreaming} />
                </div>
              )}
            </div>
          ))}
          
          {(loading || streaming) && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{
                padding: isMobile ? '1rem' : '1.5rem',
                fontSize: isMobile ? '1rem' : '0.95rem',
                color: '#ffffff',
                background: 'transparent',
                border: 'none',
                borderLeft: `3px solid ${streaming ? '#00ffff' : 'rgba(100, 50, 255, 0.6)'}`,
                paddingLeft: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '16px', height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: streaming ? '2px solid #00ffff' : '2px solid #00ffff',
                    borderRadius: '50%',
                    animation: streaming ? 'spin-fast 0.8s linear infinite' : 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ color: '#a0aec0', fontWeight: '500' }}>
                    {streaming ? t('omniaStreaming') : t('omniaPreparingResponse')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: isListening
          ? 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8), rgba(0, 159, 253, 0.6))'
          : 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8))',
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '1rem' : '1.5rem',
        borderTop: isListening 
          ? '1px solid rgba(0, 255, 255, 0.5)' 
          : streaming 
            ? '1px solid rgba(0, 255, 255, 0.3)' 
            : '1px solid rgba(255,255,255,0.1)',
        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)' : '1.5rem',
        width: '100%', transition: 'all 0.5s ease'
      }}>
        <div style={{ 
          maxWidth: '1000px', margin: '0 auto', display: 'flex', 
          gap: '0.75rem', alignItems: 'center', width: '100%'
        }}>
          
          <div style={{ flex: 1 }}>
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && !streaming && handleSend()}
              placeholder={isListening ? t('listening') + '...' :
                          streaming ? t('omniaStreaming') : 
                          `${t('sendMessage')} Omnia...`}
              disabled={loading || streaming}
              style={{ 
                width: '100%', padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                fontSize: isMobile ? '16px' : '0.95rem', borderRadius: '25px',
                border: isListening 
                  ? '2px solid #00ffff' 
                  : streaming 
                    ? '2px solid #00ffff' 
                    : '2px solid #4a5568',
                outline: 'none',
                backgroundColor: (loading || streaming) ? '#2d3748' : '#1a202c',
                color: isListening ? '#00ffff' : streaming ? '#00ffff' : '#ffffff',
                transition: 'all 0.3s ease',
                boxShadow: isListening 
                  ? '0 0 15px rgba(0, 255, 255, 0.5)' 
                  : streaming 
                    ? '0 0 10px rgba(0, 255, 255, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.3)',
                opacity: (loading || streaming) ? 0.7 : 1
              }}
              onFocus={(e) => {
                if (!streaming && !loading && !isListening) {
                  e.target.style.borderColor = '#00ffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 255, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!streaming && !isListening) {
                  e.target.style.borderColor = '#4a5568';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                }
              }}
            />
          </div>
          
          <MiniOmniaLogo 
            size={isMobile ? 50 : 56} 
            onClick={() => !loading && !streaming && setShowVoiceScreen(true)}
            isAudioPlaying={isAudioPlaying}
            isListening={isListening}
            loading={loading}
            streaming={streaming}
          />

          <OmniaArrowButton
            onClick={() => handleSend()}
            disabled={loading || streaming || !input.trim()}
            loading={loading || streaming}
            isListening={isListening}
            size={isMobile ? 50 : 56}
          />
        </div>
      </div>

      {showVoiceScreen && (
        <VoiceScreen
          onClose={() => setShowVoiceScreen(false)}
          onTranscript={handleTranscript}
          onListeningChange={handleVoiceStateChange}
          loading={loading}
          isAudioPlaying={isAudioPlaying}
          isListening={isListening}
          isMobile={isMobile}
          stopCurrentAudio={stopCurrentAudio}
          model={model}
          streaming={streaming}
          uiLanguage={uiLanguage}
        />
      )}

      {/* ✅ ENHANCED CSS STYLES - Revolutionary voice-to-voice animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spin-fast { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        
        /* ✅ ENHANCED VOICE-TO-VOICE ANIMATIONS */
        @keyframes omnia-pulse {
          0%, 100% { 
            box-shadow: 0 0 15px var(--pulse-color, rgba(100, 50, 255, 0.8)); 
            transform: scale(1); 
          }
          50% { 
            box-shadow: 0 0 25px var(--pulse-color, rgba(0, 255, 255, 0.9)); 
            transform: scale(1.05); 
          }
        }
        
        @keyframes omnia-listening {
          0%, 100% { 
            transform: scale(1); 
            filter: brightness(1) hue-rotate(0deg); 
          }
          50% { 
            transform: scale(1.03); 
            filter: brightness(1.2) hue-rotate(10deg); 
          }
        }
        
        @keyframes omnia-breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.02); filter: brightness(1.1); }
        }

        /* ✅ PERFORMANCE OPTIMIZATIONS */
        html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; background: #000000; }
        @media (max-width: 768px) { input { font-size: 16px !important; } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1a202c; }
        ::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #718096; }
        button { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        #root { width: 100vw; min-height: 100vh; margin: 0; padding: 0; background: #000000; }
        input:focus { outline: none !important; }
        button, input, div[role="button"] { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        @media (max-width: 768px) { button { min-height: 44px; min-width: 44px; } }

        /* ✅ VOICE-TO-VOICE SPECIFIC STYLES */
        .voice-active {
          background: linear-gradient(135deg, #000428, #004e92, #009ffd, #00d4ff) !important;
          transition: background 0.8s ease !important;
        }
        
        .listening-indicator {
          animation: omnia-pulse 1s ease-in-out infinite;
          --pulse-color: rgba(0, 255, 255, 1);
        }
      `}</style>

      {(showModelDropdown || showSettingsDropdown) && !loading && !streaming && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999
          }}
          onClick={() => {
            setShowModelDropdown(false);
            setShowSettingsDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default App;