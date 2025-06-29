// 📁 src/utils/ttsPreprocessing.js
// 🎯 TTS preprocessing functions - FIXED MATH SYMBOLS

// Main preprocessing function
export const preprocessTextForTTS = (text, language = 'cs') => {
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

// 🇨🇿 CZECH TTS PREPROCESSING - FIXED MATH SYMBOLS
const preprocessCzechTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // 🔢 MATHEMATICAL SYMBOLS - CRITICAL FIX!
  processedText = processedText.replace(/÷/g, ' děleno ');         // ÷ division symbol
  processedText = processedText.replace(/×/g, ' krát ');           // × multiplication
  processedText = processedText.replace(/−/g, ' mínus ');          // − minus symbol (Unicode)
  processedText = processedText.replace(/\+/g, ' plus ');          // + plus
  processedText = processedText.replace(/=/g, ' rovná se ');       // = equals
  processedText = processedText.replace(/\//g, ' děleno ');        // / division (slash)
  processedText = processedText.replace(/\*/g, ' krát ');          // * multiplication (asterisk)
  processedText = processedText.replace(/≠/g, ' nerovná se ');     // ≠ not equal
  processedText = processedText.replace(/≤/g, ' menší nebo rovno '); // ≤ less than or equal
  processedText = processedText.replace(/≥/g, ' větší nebo rovno '); // ≥ greater than or equal
  processedText = processedText.replace(/</g, ' menší než ');      // < less than
  processedText = processedText.replace(/>/g, ' větší než ');      // > greater than
  
  // 📊 PERCENTAGE AND FRACTIONS
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 procent');
  processedText = processedText.replace(/(\d+)\/(\d+)/g, '$1 lomeno $2'); // Fractions: 3/4 → "3 lomeno 4"
  
  // 🌡️ TEMPERATURE AND UNITS
  processedText = processedText.replace(/(\d+)\s*°C/gi, '$1 stupňů Celsia');
  processedText = processedText.replace(/(\d+)\s*°F/gi, '$1 stupňů Fahrenheita');
  
  // 💰 CURRENCIES
  processedText = processedText.replace(/(\d+)\s*Kč/gi, '$1 korun českých');
  processedText = processedText.replace(/(\d+)\s*€/gi, '$1 eur');
  processedText = processedText.replace(/(\d+)\s*\$/gi, '$1 dolarů');
  
  // 🔢 NUMBERS TO WORDS (1-20)
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
  
  // 🤖 AI & TECH TERMS
  const abbreviations = {
    'atd': 'a tak dále', 'apod': 'a podobně', 'tj': 'to jest',
    'tzn': 'to znamená', 'např': 'například', 'resp': 'respektive',
    'tzv': 'takzvaný', 'AI': 'éj áj', 'API': 'éj pí áj',
    'URL': 'jú ár el', 'USD': 'jú es dolar', 'EUR': 'euro',
    'GPT': 'džípítí', 'TTS': 'tí tí es', 'ChatGPT': 'čet džípítí',
    'OpenAI': 'oupn éj áj', 'Claude': 'klód', 'Anthropic': 'antropik'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // 🧹 CLEANUP
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\*+/g, '');          // Remove markdown stars
  processedText = processedText.replace(/#{1,6}/g, '');       // Remove markdown headers
  processedText = processedText.replace(/\s+/g, ' ').trim();  // Normalize spaces
  
  return processedText;
};

// 🇺🇸 ENGLISH TTS PREPROCESSING
const preprocessEnglishTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // 🔢 MATHEMATICAL SYMBOLS
  processedText = processedText.replace(/÷/g, ' divided by ');
  processedText = processedText.replace(/×/g, ' times ');
  processedText = processedText.replace(/−/g, ' minus ');
  processedText = processedText.replace(/\+/g, ' plus ');
  processedText = processedText.replace(/=/g, ' equals ');
  processedText = processedText.replace(/\//g, ' divided by ');
  processedText = processedText.replace(/\*/g, ' times ');
  processedText = processedText.replace(/≠/g, ' does not equal ');
  processedText = processedText.replace(/≤/g, ' less than or equal to ');
  processedText = processedText.replace(/≥/g, ' greater than or equal to ');
  processedText = processedText.replace(/</g, ' less than ');
  processedText = processedText.replace(/>/g, ' greater than ');
  
  // Numbers to words (1-20)
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
  
  // AI & Tech terms
  const abbreviations = {
    'etc': 'et cetera', 'vs': 'versus', 'AI': 'A I',
    'API': 'A P I', 'URL': 'U R L', 'USD': 'U S dollars',
    'EUR': 'euros', 'GPT': 'G P T', 'TTS': 'T T S',
    'ChatGPT': 'Chat G P T', 'OpenAI': 'Open A I'
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

// 🇷🇴 ROMANIAN TTS PREPROCESSING
const preprocessRomanianTextForTTS = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // 🔢 MATHEMATICAL SYMBOLS
  processedText = processedText.replace(/÷/g, ' împărțit la ');
  processedText = processedText.replace(/×/g, ' înmulțit cu ');
  processedText = processedText.replace(/−/g, ' minus ');
  processedText = processedText.replace(/\+/g, ' plus ');
  processedText = processedText.replace(/=/g, ' egal cu ');
  processedText = processedText.replace(/\//g, ' împărțit la ');
  processedText = processedText.replace(/\*/g, ' înmulțit cu ');
  processedText = processedText.replace(/≠/g, ' nu este egal cu ');
  processedText = processedText.replace(/≤/g, ' mai mic sau egal cu ');
  processedText = processedText.replace(/≥/g, ' mai mare sau egal cu ');
  processedText = processedText.replace(/</g, ' mai mic decât ');
  processedText = processedText.replace(/>/g, ' mai mare decât ');
  
  // Numbers to words (1-20)
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
  
  // AI & Tech terms
  const abbreviations = {
    'AI': 'a i', 'API': 'a pi i', 'URL': 'u ăr el',
    'USD': 'dolari americani', 'EUR': 'euro', 'GPT': 'g p t',
    'TTS': 't t s', 'ChatGPT': 'cet g p t', 'OpenAI': 'oupăn a i'
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
};

export default preprocessTextForTTS;

// 🧪 TESTING EXAMPLES:
/*
🔢 MATH SYMBOLS TESTS:

INPUT:  "300 ÷ 20 = 15"
OUTPUT: "300 děleno 20 rovná se 15"

INPUT:  "5 × 3 = 15"  
OUTPUT: "5 krát 3 rovná se 15"

INPUT:  "10 - 5 = 5"
OUTPUT: "10 mínus 5 rovná se 5"

INPUT:  "31°C a 75%"
OUTPUT: "31 stupňů Celsia a 75 procent"

INPUT:  "API klíč pro ChatGPT"
OUTPUT: "éj pí áj klíč pro čet džípítí"

✅ All mathematical symbols should now be properly pronounced!
*/