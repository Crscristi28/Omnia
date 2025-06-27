import React, { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// 🌍 OPRAVENÁ LANGUAGE DETECTION - 3 core jazyky pouze
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'cs';
  
  const lowerText = text.toLowerCase();
  
  // České indikátory
  const czechWords = [
    'být', 'mít', 'který', 'tento', 'jako', 'jeho', 'nebo', 'než', 'aby', 'když', 'kde',
    'čau', 'ahoj', 'děkuji', 'prosím', 'ano', 'ne', 'dobré', 'dobrý', 'den', 'večer', 'ráno',
    'co', 'jak', 'kde', 'proč', 'kdo', 'kdy', 'kolik', 'jaký', 'která', 'které',
    'se', 'si', 'je', 'jsou', 'má', 'máte', 'můžu', 'můžeš', 'umíš', 'umím',
    'dělám', 'děláš', 'dělá', 'děláme', 'děláte', 'dělají', 'učím', 'učíš', 'myslím',
    'řekni', 'povídej', 'vysvětli', 'pomoć', 'pomoz', 'pomozte', 'díky', 'taky', 'také'
  ];
  
  // Anglické indikátory
  const englishWords = [
    'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'be', 'at', 'one', 'have', 'this',
    'hello', 'hi', 'thanks', 'thank', 'please', 'yes', 'no', 'what', 'how', 'where', 'why', 'who', 'when',
    'doing', 'think', 'know', 'want', 'like', 'good', 'time', 'can', 'could', 'would', 'should'
  ];

  // Rumunské indikátory
  const romanianWords = [
    'și', 'de', 'la', 'cu', 'în', 'pe', 'că', 'ce', 'să', 'nu', 'un', 'o', 'el', 'ea', 'eu',
    'salut', 'bună', 'mulțumesc', 'te rog', 'da', 'nu', 'ce', 'cum', 'unde', 'de ce', 'cine', 'când',
    'fac', 'faci', 'face', 'facem', 'gândesc', 'gândești', 'pot', 'poți', 'bun', 'bună'
  ];

  // Počítej výskyty
  const czechCount = czechWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
  const romanianCount = romanianWords.filter(word => lowerText.includes(word)).length;

  // Speciální konverzační fráze
  const conversationalCzech = [
    'co děláš', 'jak se máš', 'co se děje', 'jak to jde', 'co je nového',
    'děláš si srandu', 'myslíš si', 'co si myslíš', 'máš čas', 'můžeš mi',
    'řekni mi', 'vysvětli mi', 'pomož mi', 'pomoć mi', 'poradíš mi'
  ];

  const conversationalEnglish = [
    'what are you doing', 'how are you', 'what\'s up', 'how\'s it going', 'what\'s new',
    'are you kidding', 'do you think', 'what do you think', 'do you have time', 'can you',
    'tell me', 'explain to me', 'help me', 'can you help'
  ];

  const conversationalRomanian = [
    'ce faci', 'cum ești', 'ce mai faci', 'cum merge', 'ce e nou',
    'îmi poți spune', 'mă poți ajuta', 'explică-mi', 'ce crezi'
  ];

  // Pokud najdeme konverzační frázi, použijeme ji (nejvyšší priorita)
  for (const phrase of conversationalCzech) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  
  for (const phrase of conversationalEnglish) {
    if (lowerText.includes(phrase)) return 'en';
  }

  for (const phrase of conversationalRomanian) {
    if (lowerText.includes(phrase)) return 'ro';
  }

  // Spočítej skóre pro 3 hlavní jazyky
  const scores = {
    'cs': czechCount,
    'en': englishCount,
    'ro': romanianCount
  };

  const maxScore = Math.max(...Object.values(scores));
  
  // Pokud je český skór aspoň 1 a nejvyšší, vrať češtinu
  if (scores.cs >= 1 && scores.cs === maxScore) return 'cs';
  
  // Jinak vrať jazyk s nejvyšším skórem, nebo češtinu jako default
  if (maxScore === 0) return 'cs';
  
  return Object.keys(scores).find(key => scores[key] === maxScore) || 'cs';
};

// 🌍 UI TRANSLATIONS - 3 core jazyky
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
    holdToSpeak: "Držte pro mluvení",
    processing: "Zpracovávám...",
    speaking: "Mluví...",
    voiceScreen: "Voice Screen",
    newChatCreated: "Nový chat s Omnia vytvořen",
    audioStopped: "Audio zastaveno",
    streamingStopped: "Streaming zastaven",
    clickToStop: "klepněte pro zastavení",
    clickToReturn: "klepněte pro návrat",
    error: "Chyba"
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
    holdToSpeak: "Hold to speak",
    processing: "Processing...",
    speaking: "Speaking...",
    voiceScreen: "Voice Screen",
    newChatCreated: "New chat with Omnia created",
    audioStopped: "Audio stopped",
    streamingStopped: "Streaming stopped",
    clickToStop: "click to stop",
    clickToReturn: "click to return",
    error: "Error"
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
    holdToSpeak: "Ține apăsat pentru a vorbi",
    processing: "Procesez...",
    speaking: "Vorbește...",
    voiceScreen: "Ecran vocal",
    newChatCreated: "Chat nou cu Omnia creat",
    audioStopped: "Audio oprit",
    streamingStopped: "Streaming oprit",
    clickToStop: "apasă pentru a opri",
    clickToReturn: "apasă pentru a reveni",
    error: "Eroare"
  }
};

// 🔧 SESSION MANAGEMENT - Unchanged
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
          console.log('📂 Loaded conversation history');
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
};// 🎨 LOGO KOMPONENTY - Unchanged but optimized
const OmniaLogo = ({ size = 80, animate = false, shouldHide = false }) => {
  if (shouldHide) return null;
  
  return (
    <div
      className={`omnia-logo ${animate ? 'animate' : ''}`}
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
        boxShadow: `
          0 0 ${size * 0.4}px rgba(100, 50, 255, 0.6),
          0 0 ${size * 0.2}px rgba(0, 150, 255, 0.4),
          inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.2)
        `,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 255, 255, 0.1)'
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
      {animate && (
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

const MiniOmniaLogo = ({ size = 28, onClick, isAudioPlaying = false, loading = false, streaming = false }) => {
  const getLogoStyle = () => {
    const baseStyle = {
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
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    if (streaming) {
      return {
        ...baseStyle,
        animation: 'pulse-streaming 1.2s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.8}px rgba(0, 255, 255, 1)`
      };
    }

    if (loading) {
      return {
        ...baseStyle,
        animation: 'pulse-omnia 1.5s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.6}px rgba(100, 50, 255, 0.8)`
      };
    }
    
    if (isAudioPlaying) {
      return {
        ...baseStyle,
        animation: 'pulse-audio 1s ease-in-out infinite',
        boxShadow: `0 0 ${size * 0.8}px rgba(0, 255, 255, 0.9)`
      };
    }
    
    return {
      ...baseStyle,
      boxShadow: `0 0 ${size * 0.4}px rgba(100, 50, 255, 0.5)`
    };
  };

  return (
    <div
      style={getLogoStyle()}
      onClick={onClick}
      title={streaming ? "Omnia pracuje..." : "Voice Screen"}
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

// 🔄 MODERN ARROW BUTTON
const OmniaArrowButton = ({ onClick, disabled, loading, size = 50 }) => {
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
        if (!disabled) {
          e.target.style.transform = 'translateY(-1px) scale(1.05)';
          e.target.style.boxShadow = '0 6px 16px rgba(100, 50, 255, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(100, 50, 255, 0.4)';
        }
      }}
      title="Odeslat zprávu"
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
      ) : '→'}
    </button>
  );
};

// ⌨️ TYPEWRITER EFFECT
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

// 🔧 HELPER pro Claude messages
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
};// 🎯 FIXED TTS PREPROCESSING - 3 jazyky s opravenými "AI" pronunciation
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

// 🇨🇿 FIXED CZECH TTS PREPROCESSING
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
  
  // 🔧 FIXED ZKRATKY - Správná výslovnost "AI"
  const abbreviations = {
    'atd': 'a tak dále', 
    'apod': 'a podobně', 
    'tj': 'to jest',
    'tzn': 'to znamená', 
    'např': 'například', 
    'resp': 'respektive',
    'tzv': 'takzvaný', 
    'AI': 'éj áj',        // ✅ FIXED: místo "ajaj"
    'API': 'éj pí áj',    // ✅ FIXED: místo "á pé jaj"
    'URL': 'jú ár el',
    'USD': 'jú es dolar',
    'EUR': 'euro'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\*/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};

// 🇺🇸 FIXED ENGLISH TTS PREPROCESSING
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
  
  // 🔧 FIXED ABBREVIATIONS - Proper pronunciation
  const abbreviations = {
    'etc': 'et cetera', 
    'vs': 'versus', 
    'AI': 'A I',              // ✅ FIXED: proper pronunciation
    'API': 'A P I',           // ✅ FIXED: proper pronunciation
    'URL': 'U R L',
    'USD': 'U S dollars',
    'EUR': 'euros'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup
  processedText = processedText.replace(/\.\.\./g, ', pause,');
  processedText = processedText.replace(/--/g, ', pause,');
  processedText = processedText.replace(/\*/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};

// 🇷🇴 FIXED ROMANIAN TTS PREPROCESSING
const preprocessRomanianTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Numbers to words (basic)
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
  
  // 🔧 FIXED ABBREVIATIONS - Proper pronunciation
  const abbreviations = {
    'AI': 'a i',              // ✅ FIXED: proper pronunciation
    'API': 'a pi i',          // ✅ FIXED: proper pronunciation
    'URL': 'u ăr el',
    'USD': 'dolari americani',
    'EUR': 'euro'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup
  processedText = processedText.replace(/\.\.\./g, ', pauză,');
  processedText = processedText.replace(/--/g, ', pauză,');
  processedText = processedText.replace(/\*/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};// 🚀 MAIN APP COMPONENT - CLEAN FIXED VERSION
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
  
  // 🌍 LANGUAGE STATES - 3 core jazyky
  const [userLanguage, setUserLanguage] = useState('cs');
  const [uiLanguage, setUILanguage] = useState('cs');
  
  const currentAudioRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const t = (key) => uiTexts[uiLanguage][key] || uiTexts['cs'][key] || key;

  const showNotification = (message, type = 'info', onClick = null) => {
    showNotificationHelper(message, type, onClick);
  };

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsAudioPlaying(false);
    window.dispatchEvent(new CustomEvent('omnia-audio-start'));
  };

  const handleNewChat = () => {
    if (isAudioPlaying) {
      stopCurrentAudio();
    }
    if (streaming) {
      setStreaming(false);
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

  // 🔧 FIXED handleSend - Clean bez spam notifikací
  const handleSend = async (textInput = input) => {
    if (!textInput.trim()) return;
    if (loading || streaming) return;

    const detectedLang = detectLanguage(textInput);
    setUserLanguage(detectedLang);
    console.log('🌍 Language detected:', detectedLang, 'for text:', textInput.substring(0, 50));

    if (isAudioPlaying) {
      stopCurrentAudio();
    }

    setInput('');
    setLoading(true);

    try {
      if (showVoiceScreen) {
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
      showNotification(`${t('error')}: ${err.message}`, 'error');
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleTranscript = (text) => {
    if (showVoiceScreen) {
      handleSend(text);
    } else {
      setInput(text);
    }
  };

  useEffect(() => {
    const { isNewSession, messages: savedMessages } = sessionManager.initSession();
    
    if (!isNewSession && savedMessages.length > 0) {
      setMessages(savedMessages);
      console.log('📂 Loaded', savedMessages.length, 'messages from previous session');
    } else {
      console.log('🆕 Starting fresh session');
    }
  }, []);

  // ⌨️ KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showVoiceScreen) {
          if (isAudioPlaying) stopCurrentAudio();
          if (streaming) setStreaming(false);
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
      
      if (e.key === ' ' && (isAudioPlaying || streaming) && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        if (isAudioPlaying) {
          stopCurrentAudio();
          showNotification(t('audioStopped'), 'info');
        }
        if (streaming) {
          setStreaming(false);
          showNotification(t('streamingStopped'), 'info');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAudioPlaying, streaming, showVoiceScreen, showModelDropdown, showSettingsDropdown, uiLanguage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const shouldHideLogo = messages.length > 0;

  // 🌍 UI LANGUAGE SWITCHER
  const LanguageSwitcher = () => (
    <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #4a5568' }}>
      <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.5rem' }}>
        {t('interfaceLanguage')}
      </div>
      <select 
        value={uiLanguage} 
        onChange={(e) => {
          setUILanguage(e.target.value);
          localStorage.setItem('omnia-ui-language', e.target.value);
          showNotification(`Interface changed to ${e.target.value.toUpperCase()}`, 'success');
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
  );

  // 🎤 VOICE SCREEN COMPONENT
  const VoiceScreen = ({ 
    onClose, 
    onTranscript, 
    loading, 
    isAudioPlaying,
    isMobile,
    stopCurrentAudio,
    model,
    streaming = false
  }) => {

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
      onClose();
    };

    const handleElementClick = (e) => {
      e.stopPropagation();
      if (isAudioPlaying) {
        stopCurrentAudio();
      }
    };

    const getStatusMessage = () => {
      if (streaming) {
        return `Omnia mluví...`;
      }
      if (loading) {
        return `Omnia připravuje odpověď...`;
      }
      if (isAudioPlaying) {
        return `Omnia mluví... (${t('clickToStop')})`;
      }
      return t('holdToSpeak');
    };

    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: streaming 
            ? 'linear-gradient(135deg, #000428, #004e92, #009ffd)' 
            : 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          color: 'white',
          transition: 'background 0.5s ease'
        }}
        onClick={handleScreenClick}
      >
        <button
          onClick={handleCloseClick}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: '2px solid rgba(255,255,255,0.7)',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.borderColor = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.borderColor = 'rgba(255,255,255,0.7)';
          }}
        >
          ×
        </button>

        <div 
          style={{ marginBottom: '2rem', cursor: 'pointer' }}
          onClick={handleElementClick}
        >
          <OmniaLogo size={isMobile ? 120 : 140} animate={streaming || loading} />
        </div>

        <div style={{
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          fontWeight: '600',
          marginBottom: '1rem',
          textAlign: 'center',
          opacity: 0.9,
          cursor: 'pointer'
        }}
        onClick={handleElementClick}
        >
          Omnia
          {streaming && <span style={{ color: '#00ffff', marginLeft: '8px' }}>●</span>}
        </div>

        <div style={{
          fontSize: isMobile ? '0.9rem' : '1rem',
          marginBottom: '2rem',
          textAlign: 'center',
          opacity: 0.7,
          cursor: 'pointer'
        }}
        onClick={handleElementClick}
        >
          {streaming ? 'Mluví s vámi v reálném čase' : 'Pokročilý AI asistent'}
        </div>

        <div style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          fontWeight: '600',
          marginBottom: '2.5rem',
          textAlign: 'center',
          opacity: 0.9,
          cursor: 'pointer',
          maxWidth: isMobile ? '300px' : '400px',
          lineHeight: '1.4'
        }}
        onClick={handleElementClick}
        >
          {getStatusMessage()}
        </div>

        <div 
          style={{ marginBottom: '3rem' }}
          onClick={handleElementClick}
        >
          <VoiceRecorder onTranscript={onTranscript} disabled={loading} mode="voice" />
        </div>

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
          {streaming ? (
            `Omnia mluví • ${t('clickToStop')}`
          ) : isMobile ? (
            `Omnia • ${t('clickToReturn')}`
          ) : (
            `Omnia • ESC nebo ${t('clickToReturn')}`
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const savedUILanguage = localStorage.getItem('omnia-ui-language');
    if (savedUILanguage && uiTexts[savedUILanguage]) {
      setUILanguage(savedUILanguage);
    }
  }, []);

// 🎤 FIXED VOICE RECORDER - Push to talk opravený
const VoiceRecorder = ({ onTranscript, disabled, mode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const touchStartTimeRef = useRef(null);
  const isIOSPWA = window.navigator.standalone;

  const startRecording = async () => {
    try {
      console.log('🎙️ Starting voice recording...');

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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing...');
        setIsProcessing(true);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          streamRef.current = null;
        }
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: isIOSPWA ? 'audio/mp4' : 'audio/webm' 
          });
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
            
            onTranscript(transcribedText);
          } else {
            console.warn('⚠️ Empty or failed transcription');
            onTranscript('[Nepodařilo se rozpoznat řeč - zkuste znovu]');
          }

        } catch (error) {
          console.error('💥 Whisper error:', error);
          onTranscript('[Chyba při rozpoznávání řeči - zkuste to znovu]');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('💥 Recording start error:', error);
      alert('Nepodařilo se získat přístup k mikrofonu. Zkontrolujte oprávnění.');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const forceStopRecording = () => {
    console.log('🚨 Force stopping recording...');

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
    
    setIsRecording(false);
    setIsProcessing(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    touchStartTimeRef.current = Date.now();
    if (!disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touchDuration = Date.now() - (touchStartTimeRef.current || 0);
    if (touchDuration < 100) {
      return;
    }
    if (isRecording) {
      forceStopRecording();
    }
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRecording) {
      forceStopRecording();
    }
  };

  const handleMouseDown = (e) => {
    if (!isIOSPWA && !disabled && !isProcessing && !isRecording) {
      startRecording();
    }
  };

  const handleMouseUp = (e) => {
    if (!isIOSPWA && isRecording) {
      forceStopRecording();
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        forceStopRecording();
      }
    };

    const handleBeforeUnload = () => {
      if (isRecording) {
        forceStopRecording();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '50%',
      padding: 0,
      fontSize: '2rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
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
      animation: 'pulse-processing 1.5s ease-in-out infinite'
    };
    if (isRecording) return { 
      ...baseStyle,
      backgroundColor: '#dc3545',
      color: 'white',
      transform: 'scale(1.1)',
      boxShadow: '0 0 30px rgba(220, 53, 69, 0.6)',
      animation: 'pulse-recording 1s ease-in-out infinite'
    };
    return { 
      ...baseStyle,
      backgroundColor: '#007bff',
      color: 'white',
      boxShadow: '0 0 15px rgba(0, 123, 255, 0.4)'
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
    if (isRecording) return (
      <div style={{
        width: '12px',
        height: '12px',
        backgroundColor: 'white',
        borderRadius: '2px',
        animation: 'pulse 1s ease-in-out infinite'
      }}></div>
    );
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    );
  };

  const getButtonTitle = () => {
    if (isProcessing) return 'Zpracovávám nahrávku...';
    if (isRecording) return 'Nahrávám - pusťte pro ukončení';
    return 'Držte pro mluvení';
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => !isIOSPWA && isRecording && forceStopRecording()}
      disabled={disabled || isProcessing}
      title={getButtonTitle()}
      style={getButtonStyle()}
    >
      {getButtonIcon()}
    </button>
  );
};// 🔊 FIXED GOOGLE TTS VOICE BUTTON - Migrace z ElevenLabs
const VoiceButton = ({ text, onAudioStart, onAudioEnd, language = 'cs' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleNewAudio = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
      }
    };

    window.addEventListener('omnia-audio-start', handleNewAudio);
    return () => window.removeEventListener('omnia-audio-start', handleNewAudio);
  }, [onAudioEnd]);

  const handleSpeak = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      if (onAudioEnd) onAudioEnd();
      return;
    }

    try {
      setIsLoading(true);
      window.dispatchEvent(new CustomEvent('omnia-audio-start'));
      if (onAudioStart) onAudioStart();

      // 🎵 FIXED TTS PREPROCESSING s opravenými "AI"
      const processedText = preprocessTextForTTS(text, language);
      console.log('🎵 Processing text for Google TTS:', { language, original: text.substring(0, 50), processed: processedText.substring(0, 50) });

      // 🔥 KRITICKÁ ZMĚNA: ElevenLabs → Google TTS
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

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        console.log('🔊 Google TTS playback started for language:', language);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
        console.log('✅ Google TTS playback finished');
      };
      
      audio.onerror = (e) => {
        console.error('❌ Google TTS playback error:', e);
        setIsPlaying(false);
        setIsLoading(false);
        if (onAudioEnd) onAudioEnd();
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('💥 Google TTS error:', error);
      if (onAudioEnd) onAudioEnd();
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = () => {
    return {
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
    };
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
    if (isLoading) return 'Generuji Google TTS...';
    if (isPlaying) return 'Klepněte pro zastavení';
    return 'Přehrát s Google hlasem';
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading}
      style={getButtonStyle()}
      title={getButtonTitle()}
      onMouseEnter={(e) => e.target.style.opacity = '1'}
      onMouseLeave={(e) => e.target.style.opacity = '1'}
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

// 📋 COPY BUTTON
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
    if (copied) {
      switch(language) {
        case 'en': return 'Copied!';
        case 'ro': return 'Copiat!';
        default: return 'Zkopírováno!';
      }
    }
    switch(language) {
      case 'en': return 'Copy text';
      case 'ro': return 'Copiază textul';
      default: return 'Zkopírovat text';
    }
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
      onMouseEnter={(e) => e.target.style.opacity = '1'}
      onMouseLeave={(e) => e.target.style.opacity = '1'}
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
};

// 🔔 CLEAN NOTIFICATION HELPER
const showNotificationHelper = (message, type = 'info', onClick = null) => {
  const notification = document.createElement('div');
  
  const getNotificationStyle = (type) => {
    const baseStyle = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      z-index: 10000;
      cursor: ${onClick ? 'pointer' : 'default'};
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      font-weight: 500;
      max-width: 350px;
      transition: all 0.3s ease;
      border: 1px solid;
    `;
    
    switch(type) {
      case 'error':
        return baseStyle + `
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border-color: rgba(255,255,255,0.2);
        `;
      case 'success':
        return baseStyle + `
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border-color: rgba(255,255,255,0.2);
        `;
      case 'info':
      default:
        return baseStyle + `
          background: linear-gradient(135deg, #007bff, #0096ff);
          color: white;
          border-color: rgba(255,255,255,0.2);
        `;
    }
  };
  
  notification.style.cssText = getNotificationStyle(type);
  notification.textContent = message;
  
  if (onClick) {
    notification.addEventListener('click', () => {
      onClick();
      document.body.removeChild(notification);
    });
    notification.style.cursor = 'pointer';
  }
  
  notification.addEventListener('mouseenter', () => {
    notification.style.transform = 'translateY(-2px) scale(1.02)';
  });
  
  notification.addEventListener('mouseleave', () => {
    notification.style.transform = 'translateY(0) scale(1)';
  });
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px) scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, type === 'error' ? 6000 : 4000);
};

// 🤖 CLEANED CLAUDE SERVICE - Bez spam notifikací
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

  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý AI asistent.

🔍 WEB_SEARCH - Máš přístup k web_search pro vyhledávání aktuálních informací
📊 ANALÝZA DAT - Můžeš analyzovat data a poskytovat insights  
🎯 POKROČILÉ MYŠLENÍ - Používáš pokročilé reasoning

PRAVIDLA ODPOVĚDÍ:
- Odpovídej přirozeně v českém jazyce
- Na otázky typu "co děláš", "jak se máš" odpovídej normálně a přátelsky
- Neříkej "jsem AI" - prostě odpověz jako inteligentní asistent
- Web search používej jen když potřebuješ aktuální informace
- Buď užitečný a odpověz přímo na otázku
- Piš přirozeně pro hlasové přehrání`,

      'en': `You are Omnia, an advanced AI assistant.

🔍 WEB_SEARCH - You have access to web_search for finding current information
📊 DATA ANALYSIS - You can analyze data and provide insights
🎯 ADVANCED THINKING - You use advanced reasoning

RESPONSE RULES:
- Respond naturally in English
- For questions like "what are you doing", "how are you" answer normally and friendly
- Don't say "I'm an AI" - just respond as an intelligent assistant
- Use web search only when you need current information
- Be helpful and answer the question directly
- Write naturally for voice playback`,

      'ro': `Ești Omnia, un asistent IA avansat.

🔍 WEB_SEARCH - Ai acces la web_search pentru a găsi informații actuale
📊 ANALIZA DATELOR - Poți analiza date și oferi perspective
🎯 GÂNDIRE AVANSATĂ - Folosești raționament avansat

REGULI DE RĂSPUNS:
- Răspunde natural în română
- La întrebări ca "ce faci", "cum ești" răspunde normal și prietenos
- Nu spune "Sunt o IA" - răspunde pur și simplu ca un asistent inteligent
- Folosește web search doar când ai nevoie de informații actuale
- Fii util și răspunde direct la întrebare
- Scrie natural pentru redarea vocală`
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

// 🤖 CLEANED OPENAI SERVICE
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

  getSystemPrompt(detectedLanguage) {
    const prompts = {
      'cs': `Jsi Omnia, český AI asistent.

PRAVIDLA:
- Odpovídej přirozeně v češtině
- Na konverzační otázky ("co děláš", "jak se máš") odpovídej normálně
- Neříkaj "jsem AI" - prostě odpověz přátelsky
- Buď užitečný a přímý
- Piš tak, aby to znělo přirozeně při hlasovém přehrání`,

      'en': `You are Omnia, an English AI assistant.

RULES:
- Respond naturally in English
- For conversational questions ("what are you doing", "how are you") answer normally
- Don't say "I'm an AI" - just respond friendly
- Be helpful and direct
- Write so it sounds natural when spoken aloud`,

      'ro': `Ești Omnia, un asistent IA român.

REGULI:
- Răspunde natural în română
- Pentru întrebări conversaționale ("ce faci", "cum ești") răspunde normal
- Nu spune "Sunt o IA" - răspunde doar prietenos
- Fii util și direct
- Scrie să sune natural când este vorbit`
    };

    return prompts[detectedLanguage] || prompts['cs'];
  }
};

// 🔎 FIXED SONAR SERVICE - Méně agresivní search
const sonarService = {
  async search(query, showNotification, detectedLanguage = 'cs') {
    try {
      console.log('🔍 Sonar detected language:', detectedLanguage);
      
      // 🔧 FIXED: Kontrola jestli opravdu potřebujeme search
      if (!this.shouldSearchForQuery(query)) {
        return {
          success: false,
          message: 'Query doesn\'t need web search',
          source: 'sonar_search'
        };
      }

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

  // 🔧 FIXED: Méně agresivní search logic
  shouldSearchForQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // 🚫 NEVYHLEDÁVEJ pro konverzační otázky
    const conversationalPhrases = [
      // České
      'ahoj', 'čau', 'jak se máš', 'co děláš', 'jak to jde', 'co je nového',
      'dobrý den', 'dobrý večer', 'dobré ráno', 'díky', 'děkuji',
      'jak se jmenuješ', 'kdo jsi', 'co jsi', 'představ se',
      'umíš', 'můžeš mi', 'pomoč', 'pomoz', 'poraď',
      'co si myslíš', 'jaký je tvůj názor', 'řekni mi něco',
      // Anglické
      'hello', 'hi', 'how are you', 'what are you doing', 'how is it going',
      'good morning', 'good evening', 'thank you', 'thanks',
      'what is your name', 'who are you', 'what are you', 'introduce yourself',
      'can you', 'help me', 'what do you think', 'tell me something',
      // Rumunské
      'salut', 'bună', 'cum ești', 'ce faci', 'cum merge',
      'bună dimineața', 'bună seara', 'mulțumesc', 'merci',
      'cum te cheamă', 'cine ești', 'ce ești', 'prezintă-te'
    ];

    // Pokud najdeme konverzační frázi, NEHLEDEJ
    for (const phrase of conversationalPhrases) {
      if (lowerQuery.includes(phrase)) {
        return false;
      }
    }

    // ✅ HLEDEJ pouze pro specifické typy dotazů
    const searchTriggers = [
      // České - aktuální informace
      'aktuální cena', 'dnešní počasí', 'současný kurz', 'nejnovější zprávy',
      'dnes v', 'aktuální situace', 'poslední novinky', 'čerstvé aktuality',
      'právě teď', 'momentální stav', 'nové zprávy', 'breaking news',
      'aktuální výsledky', 'dnešní výsledek',
      // Anglické - current info
      'current price', 'today weather', 'latest news', 'breaking news',
      'right now', 'current situation', 'fresh news', 'today results',
      'current exchange rate', 'stock price today', 'weather forecast today',
      // Rumunské - informații actuale
      'preț actual', 'vremea de azi', 'ultimele știri', 'știri de ultimă oră'
    ];

    // Pokud najdeme search trigger, HLEDEJ
    for (const trigger of searchTriggers) {
      if (lowerQuery.includes(trigger)) {
        return true;
      }
    }

    // Jinak NEHLEDEJ
    return false;
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

// 🎵 FIXED GOOGLE TTS AUDIO GENERATION
const generateInstantAudio = async (responseText, setIsAudioPlaying, currentAudioRef, isIOS, showNotification, language = 'cs') => {
  try {
    console.log('🎵 Generating Google TTS audio for language:', language);
    
    const processedText = preprocessTextForTTS(responseText, language);
    
    showNotification('Generuji Google hlas...', 'info');
    
    // 🔥 KRITICKÁ ZMĚNA: ElevenLabs → Google TTS
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
    showNotification('Přehrávám Google odpověď...', 'success');

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
      showNotification('Chyba při přehrávání Google TTS', 'error');
    };
    
    try {
      await audio.play();
      console.log('🎯 Google TTS audio plays IMMEDIATELY after AI response!');
    } catch (playError) {
      console.error('❌ Auto-play blocked:', playError);
      showNotification('Klepněte pro přehrání odpovědi', 'info', () => {
        audio.play().catch(console.error);
      });
    }
    
    return audio;
    
  } catch (error) {
    console.error('💥 Google TTS audio generation failed:', error);
    setIsAudioPlaying(false);
    currentAudioRef.current = null;
    showNotification('Google TTS se nepodařilo vygenerovat', 'error');
    throw error;
  }
};// ✅ CLEANED VOICE SCREEN RESPONSE Handler
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
    console.log('🎤 Voice Screen Response with model:', model, 'language:', detectedLanguage);

    const userMessage = { sender: 'user', text: textInput };
    const messagesWithUser = [...currentMessages, userMessage];
    setMessages(messagesWithUser);
    localStorage.setItem('omnia-memory', JSON.stringify(messagesWithUser));

    let responseText = '';

    if (model === 'sonar') {
      const searchResult = await sonarService.search(textInput, showNotification, detectedLanguage);
      if (searchResult.success) {
        responseText = searchResult.result;
        if (searchResult.sources && searchResult.sources.length > 0) {
          responseText += `\n\nZdroje: ${searchResult.sources.slice(0, 3).join(', ')}`;
        }
      } else {
        responseText = `Nepodařilo se najít aktuální informace: ${searchResult.message}`;
      }
      
      const finalMessages = [...messagesWithUser, { sender: 'bot', text: responseText }];
      setMessages(finalMessages);
      localStorage.setItem('omnia-memory', JSON.stringify(finalMessages));

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
          
          // 🎵 AUTO-AUDIO with Google TTS
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
              console.error('❌ Voice Screen auto-audio failed:', error);
            }
          }, 800);
        }
      };

      const onSearchNotification = (message) => {
        // Clean - žádné spam notifikace
      };

      responseText = await claudeService.sendMessage(
        messagesWithUser, 
        onStreamUpdate, 
        onSearchNotification,
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
      throw new Error(`Neznámý model: ${model}`);
    }

    return responseText;

  } catch (error) {
    console.error('💥 Voice Screen response error:', error);

    if (setStreaming) setStreaming(false);

    const errorText = `Omlouám se, ale vyskytla se chyba: ${error.message}`;
    const errorMessages = [...currentMessages, { sender: 'bot', text: errorText }];
    setMessages(errorMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(errorMessages));
    
    showNotification(`Chyba: ${error.message}`, 'error');

    throw error;
  }
};

// ✅ CLEANED TEXT RESPONSE Handler
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
        responseText += `\n\nZdroje:\n${searchResult.citations.map(c => `• ${c}`).join('\n')}`;
      }
    } else {
      responseText = `Nepodařilo se najít aktuální informace: ${searchResult.message}`;
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

    const onSearchNotification = (message) => {
      // Clean - žádné spam notifikace
    };

    responseText = await claudeService.sendMessage(
      messagesWithUser, 
      onStreamUpdate, 
      onSearchNotification,
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
    throw new Error(`Neznámý model: ${model}`);
  }

  return responseText;
};

// ⚙️ SETTINGS DROPDOWN
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
          Google TTS aktivní
        </div>
        
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          color: '#a0aec0'
        }}>
          Streaming aktivní
        </div>
      </div>
    </>
  );
};

// ✏️ EDITABLE MESSAGE
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

// 🎉 MAIN JSX RETURN - CLEAN PROFESSIONAL VERSION
return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #000428, #004e92, #009ffd)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      width: '100vw',
      margin: 0,
      padding: 0,
      transition: 'background 0.5s ease'
    }}>
      
      <header style={{ 
        padding: isMobile ? '1rem 1rem 0.5rem' : '1.5rem 2rem 1rem',
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.8), rgba(0, 78, 146, 0.6))',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        width: '100%',
        transition: 'background 0.5s ease'
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
                background: streaming ? 'rgba(0, 255, 255, 0.2)' : '#2d3748',
                border: streaming ? '1px solid #00ffff' : '1px solid #4a5568',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                color: streaming ? '#00ffff' : '#e2e8f0',
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
              {streaming && <span style={{ color: '#00ffff' }}>●</span>}
              {!streaming && !loading && ' ▼'}
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
                background: streaming ? 'rgba(0, 255, 255, 0.2)' : '#2d3748',
                border: streaming ? '1px solid #00ffff' : '1px solid #4a5568',
                borderRadius: '8px', padding: '0.5rem', fontSize: '1rem',
                color: streaming ? '#00ffff' : '#e2e8f0',
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
            shouldHide={shouldHideLogo}
          />
          {!shouldHideLogo && (
            <>
              <h1 style={{ 
                fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: '700',
                margin: 0, color: streaming ? '#00ffff' : '#ffffff',
                letterSpacing: '0.02em', transition: 'color 0.5s ease'
              }}>
                OMNIA
              </h1>
              <div style={{
                fontSize: '0.9rem', opacity: 0.7, textAlign: 'center',
                color: streaming ? '#00ffff' : 'inherit',
                transition: 'color 0.5s ease'
              }}>
                {streaming ? 'streamuje v reálném čase' : 'multilingual AI assistant'}
              </div>
            </>
          )}
        </div>
      </header>

      <main style={{ 
        flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '2rem',
        paddingBottom: '140px',
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.3), rgba(0, 78, 146, 0.2))',
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
                // 👤 USER MESSAGES
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
                // 🤖 BOT MESSAGES
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
                    {streaming ? `Omnia mluví...` : `Omnia připravuje...`}
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
        background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.8))',
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '1rem' : '1.5rem',
        borderTop: streaming ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(255,255,255,0.1)',
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
              placeholder={streaming ? `Omnia mluví...` : `${t('sendMessage')} Omnia...`}
              disabled={loading || streaming}
              style={{ 
                width: '100%', padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                fontSize: isMobile ? '16px' : '0.95rem', borderRadius: '25px',
                border: streaming ? '2px solid #00ffff' : '2px solid #4a5568',
                outline: 'none',
                backgroundColor: (loading || streaming) ? '#2d3748' : '#1a202c',
                color: streaming ? '#00ffff' : '#ffffff',
                transition: 'all 0.3s ease',
                boxShadow: streaming ? '0 0 10px rgba(0, 255, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
                opacity: (loading || streaming) ? 0.7 : 1
              }}
              onFocus={(e) => {
                if (!streaming && !loading) {
                  e.target.style.borderColor = '#00ffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 255, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!streaming) {
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
            loading={loading}
            streaming={streaming}
          />

          <OmniaArrowButton
            onClick={() => handleSend()}
            disabled={loading || streaming || !input.trim()}
            loading={loading || streaming}
            size={isMobile ? 50 : 56}
          />
        </div>
      </div>

      {showVoiceScreen && (
        <VoiceScreen
          onClose={() => setShowVoiceScreen(false)}
          onTranscript={handleTranscript}
          loading={loading}
          isAudioPlaying={isAudioPlaying}
          isMobile={isMobile}
          stopCurrentAudio={stopCurrentAudio}
          model={model}
          streaming={streaming}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spin-fast { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        
        @keyframes pulse-omnia {
          0%, 100% { box-shadow: 0 0 15px rgba(100, 50, 255, 0.8); transform: scale(1); }
          50% { box-shadow: 0 0 25px rgba(0, 255, 255, 0.9); transform: scale(1.05); }
        }
        
        @keyframes pulse-streaming {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 1); transform: scale(1); }
          50% { box-shadow: 0 0 35px rgba(0, 255, 255, 1); transform: scale(1.08); }
        }
        
        @keyframes pulse-audio {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.9); transform: scale(1); }
          50% { box-shadow: 0 0 25px rgba(0, 255, 255, 1); transform: scale(1.05); }
        }
        
        @keyframes pulse-processing {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 193, 7, 0.5); transform: scale(1); }
          50% { box-shadow: 0 0 30px rgba(255, 193, 7, 0.8); transform: scale(1.03); }
        }
        
        @keyframes pulse-recording {
          0%, 100% { box-shadow: 0 0 30px rgba(220, 53, 69, 0.6); transform: scale(1.1); }
          50% { box-shadow: 0 0 40px rgba(220, 53, 69, 0.9); transform: scale(1.12); }
        }
        
        .omnia-logo.animate { animation: omnia-breathe 4s ease-in-out infinite; }
        
        @keyframes omnia-breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.02); filter: brightness(1.1); }
        }

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
}

export default App;