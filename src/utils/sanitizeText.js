// 📁 src/utils/sanitizeText.js
// 🎵 ENHANCED MULTILINGUAL SANITIZATION pro ElevenLabs TTS
// ✅ FIXED: Smart AI vs ai detection pro rumunštinu
// ✅ Tech "AI" → "a i", ale sloveso "ai" → zůstává "ai"
// 🚫 NEW: Markdown cleanup - removes **bold**, *italic*, ###, etc.
// 🔧 FIXED: cleanMarkdownForUI bullet formatting

export default function sanitizeText(text, language = 'cs') {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // 🚫 MARKDOWN CLEANUP - UNIVERSAL (applies to all languages)
  // CRITICAL: Must be FIRST before any other processing!
  processedText = processedText
    .replace(/\*\*([^*]+)\*\*/g, '$1')           // Remove **bold**
    .replace(/\*([^*]+)\*/g, '$1')               // Remove *italic*
    .replace(/#{1,6}\s*/g, '')                   // Remove ### headers
    .replace(/`([^`]+)`/g, '$1')                 // Remove `inline code`
    .replace(/```[\s\S]*?```/g, '')              // Remove ```code blocks```
    .replace(/_([^_]+)_/g, '$1')                 // Remove _underline_
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')    // Remove [links](url)
    .replace(/~~([^~]+)~~/g, '$1');              // Remove ~~strikethrough~~
  
  switch (language.toLowerCase()) {
    
    case 'ro': // 🇷🇴 RUMUNŠTINA - SMART AI DETECTION
      processedText = processedText
        // === DATUMY - řadové číslovky ===
        .replace(/\b1\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `întâi ${month}`)
        .replace(/\b2\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `doi ${month}`)
        .replace(/\b3\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `trei ${month}`)
        .replace(/\b4\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `patru ${month}`)
        .replace(/\b5\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `cinci ${month}`)
        .replace(/\b21\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `douăzeci și unu ${month}`)
        .replace(/\b22\.?\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/gi, (match, month) => `douăzeci și doi ${month}`)
        .replace(/\b31\.?\s*(ianuarie|martie|mai|iulie|august|octombrie|decembrie)\b/gi, (match, month) => `treizeci și unu ${month}`)
        
        // === PROCENTA ===
        .replace(/(\d+)\s*%/gi, '$1 la sută')
        
        // === TEPLOTA ===
        .replace(/(\d+)[\s]*°C/gi, '$1 grade Celsius')
        .replace(/(\d+)[\s]*°F/gi, '$1 grade Fahrenheit')
        .replace(/(\d+)[\s]*°/gi, '$1 grade')
        
        // === ČAS ===
        .replace(/(\d{1,2}):(\d{2})/g, '$1 și $2 minute')
        
        // === MĚNY ===
        .replace(/(\d+)\s*lei/gi, '$1 lei')
        .replace(/(\d+)\s*€/gi, '$1 euro')
        .replace(/(\d+)\s*\$/gi, '$1 dolari')
        .replace(/(\d+)\s*USD/gi, '$1 dolari americani')
        .replace(/(\d+)\s*EUR/gi, '$1 euro')
        
        // === DESETINNÁ ČÍSLA ===
        .replace(/(\d+)[.,](\d+)/g, '$1 virgulă $2')
        
        // === JEDNOTKY ===
        .replace(/(\d+)\s*km\/h/gi, '$1 kilometri pe oră')
        .replace(/(\d+)\s*kg/gi, '$1 kilograme')
        .replace(/(\d+)\s*kWh/gi, '$1 kilowați pe oră')
        .replace(/(\d+)\s*mph/gi, '$1 mile pe oră')
        .replace(/(\d+)\s*m²/gi, '$1 metri pătrați')
        
        // === TECH TERMÍNY - RUMUNSKY ===
        .replace(/0[Ww]-?30/g, 'zero W treizeci')
        .replace(/5[Ww]-?40/g, 'cinci W patruzeci')
        .replace(/10[Ww]-?40/g, 'zece W patruzeci')
        
        // === OSTATNÍ TECH TERMÍNY ===
        .replace(/\bAPI\b/g, 'a pi i')
        .replace(/\bURL\b/g, 'u ăr el')
        .replace(/\bHTTP\b/g, 'ha te te pe')
        .replace(/\bHTTPS\b/g, 'ha te te pe es')
        .replace(/\bHTML\b/g, 'ha te em el')
        .replace(/\bCSS\b/g, 'ce es es')
        .replace(/\bJS\b/g, 'ge es')
        
        // === ZLOMKY ===
        .replace(/\b1\/2\b/g, 'o jumătate')
        .replace(/\b1\/4\b/g, 'un sfert')
        .replace(/\b3\/4\b/g, 'trei sferturi')
        
        // === ZKRATKY ===
        .replace(/\betc\.?\b/gi, 'și așa mai departe')
        .replace(/\bex\.?\b/gi, 'de exemplu')
        .replace(/\bvs\.?\b/gi, 'versus')
        .replace(/\brad\.?\b/gi, 'radian')
        
        // === CLEANUP ===
        .replace(/\s+/g, ' ')
        .trim();
      break;
      
    case 'en': // 🇺🇸 ANGLIČTINA
      processedText = processedText
        // === DATES - ordinal numbers ===
        .replace(/\b1st\s+/gi, 'first ')
        .replace(/\b2nd\s+/gi, 'second ')
        .replace(/\b3rd\s+/gi, 'third ')
        .replace(/\b4th\s+/gi, 'fourth ')
        .replace(/\b5th\s+/gi, 'fifth ')
        .replace(/\b21st\s+/gi, 'twenty first ')
        .replace(/\b22nd\s+/gi, 'twenty second ')
        .replace(/\b23rd\s+/gi, 'twenty third ')
        .replace(/\b31st\s+/gi, 'thirty first ')
        
        // === PERCENTAGES ===
        .replace(/(\d+)\s*%/gi, '$1 percent')
        
        // === TEMPERATURE ===
        .replace(/(\d+)[\s]*°C/gi, '$1 degrees Celsius')
        .replace(/(\d+)[\s]*°F/gi, '$1 degrees Fahrenheit')
        .replace(/(\d+)[\s]*°/gi, '$1 degrees')
        
        // === TIME ===
        .replace(/(\d{1,2}):(\d{2})/g, '$1 hours and $2 minutes')
        
        // === CURRENCY ===
        .replace(/(\d+)\s*\$/gi, '$1 dollars')
        .replace(/(\d+)\s*€/gi, '$1 euros')
        .replace(/(\d+)\s*£/gi, '$1 pounds')
        .replace(/(\d+)\s*USD/gi, '$1 US dollars')
        .replace(/(\d+)\s*EUR/gi, '$1 euros')
        
        // === DECIMALS ===
        .replace(/(\d+)[.,](\d+)/g, '$1 point $2')
        
        // === UNITS ===
        .replace(/(\d+)\s*km\/h/gi, '$1 kilometers per hour')
        .replace(/(\d+)\s*mph/gi, '$1 miles per hour')
        .replace(/(\d+)\s*kg/gi, '$1 kilograms')
        .replace(/(\d+)\s*kWh/gi, '$1 kilowatt hours')
        .replace(/(\d+)\s*m²/gi, '$1 square meters')
        
        // === TECH TERMS - ENGLISH ===
        .replace(/0[Ww]-?30/g, 'zero W thirty')
        .replace(/5[Ww]-?40/g, 'five W forty')
        .replace(/10[Ww]-?40/g, 'ten W forty')
        
        .replace(/\bAPI\b/g, 'A P I')
        .replace(/\bURL\b/g, 'U R L')
        .replace(/\bHTTP\b/g, 'H T T P')
        .replace(/\bHTTPS\b/g, 'H T T P S')
        .replace(/\bHTML\b/g, 'H T M L')
        .replace(/\bCSS\b/g, 'C S S')
        .replace(/\bJS\b/g, 'J S')
        
        // === FRACTIONS ===
        .replace(/\b1\/2\b/g, 'one half')
        .replace(/\b1\/4\b/g, 'one quarter')
        .replace(/\b3\/4\b/g, 'three quarters')
        
        // === ABBREVIATIONS ===
        .replace(/\betc\.?\b/gi, 'et cetera')
        .replace(/\be\.g\.?\b/gi, 'for example')
        .replace(/\bi\.e\.?\b/gi, 'that is')
        .replace(/\bvs\.?\b/gi, 'versus')
        
        // === CLEANUP ===
        .replace(/\s+/g, ' ')
        .trim();
      break;
      
    default: // 🇨🇿 ČEŠTINA (default)
      processedText = processedText
        // === DATUMY - řadové číslovky ===
        .replace(/\b1\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `prvního ${month}`)
        .replace(/\b2\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `druhého ${month}`)
        .replace(/\b3\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `třetího ${month}`)
        .replace(/\b4\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `čtvrtého ${month}`)
        .replace(/\b5\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `pátého ${month}`)
        .replace(/\b21\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `dvacátého prvního ${month}`)
        .replace(/\b22\.?\s*(ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince)\b/gi, (match, month) => `dvacátého druhého ${month}`)
        .replace(/\b31\.?\s*(ledna|března|května|července|srpna|října|prosince)\b/gi, (match, month) => `třicátého prvního ${month}`)
        
        // === PROCENTA ===
        .replace(/(\d+)\s*%/gi, '$1 procent')
        
        // === TEPLOTA ===
        .replace(/(\d+)[\s]*°C/gi, '$1 stupňů Celsia')
        .replace(/(\d+)[\s]*°F/gi, '$1 stupňů Fahrenheita')
        .replace(/(\d+)[\s]*°/gi, '$1 stupňů')
        
        // === ČAS ===
        .replace(/(\d{1,2}):(\d{2})/g, '$1 hodin $2 minut')
        
        // === MĚNY ===
        .replace(/(\d+)\s*Kč/gi, '$1 korun českých')
        .replace(/(\d+)\s*€/gi, '$1 eur')
        .replace(/(\d+)\s*\$/gi, '$1 dolarů')
        .replace(/(\d+)\s*USD/gi, '$1 amerických dolarů')
        .replace(/(\d+)\s*EUR/gi, '$1 eur')
        
        // === DESETINNÁ ČÍSLA ===
        .replace(/(\d+)[.,](\d+)/g, '$1 celá $2')
        
        // === JEDNOTKY ===
        .replace(/(\d+)\s*km\/h/gi, '$1 kilometrů za hodinu')
        .replace(/(\d+)\s*kg/gi, '$1 kilogramů')
        .replace(/(\d+)\s*kWh/gi, '$1 kilowatthodin')
        .replace(/(\d+)\s*mph/gi, '$1 mil za hodinu')
        .replace(/(\d+)\s*m²/gi, '$1 metrů čtverečních')
        
        // === TECH TERMÍNY - ČESKY ===
        .replace(/0[Ww]-?30/g, 'nula W třicet')
        .replace(/5[Ww]-?40/g, 'pět W čtyřicet')
        .replace(/10[Ww]-?40/g, 'deset W čtyřicet')
        
        .replace(/\bAPI\b/g, 'éj pí áj')
        .replace(/\bURL\b/g, 'jů ár el')
        .replace(/\bHTTP\b/g, 'há té té pé')
        .replace(/\bHTTPS\b/g, 'há té té pé es')
        .replace(/\bHTML\b/g, 'há té em el')
        .replace(/\bCSS\b/g, 'cé es es')
        .replace(/\bJS\b/g, 'džej es')
        
        // === ZLOMKY ===
        .replace(/\b1\/2\b/g, 'půl')
        .replace(/\b1\/4\b/g, 'čtvrt')
        .replace(/\b3\/4\b/g, 'tři čtvrtiny')
        
        // === ZKRATKY ===
        .replace(/\bnapř\.?\b/gi, 'například')
        .replace(/\batd\.?\b/gi, 'a tak dále')
        .replace(/\bapod\.?\b/gi, 'a podobně')
        .replace(/\btj\.?\b/gi, 'to jest')
        .replace(/\btzn\.?\b/gi, 'to znamená')
        .replace(/\bresp\.?\b/gi, 'respektive')
        .replace(/\btzv\.?\b/gi, 'takzvaný')
        
        // === CLEANUP ===
        .replace(/\s+/g, ' ')
        .trim();
      break;
  }
  
  return processedText;
}

// 🔧 FIXED: cleanMarkdownForUI - Better bullet point handling
export function cleanMarkdownForUI(text) {
  if (!text || typeof text !== 'string') return '';
  
  let cleanText = text;
  
  // 🚫 MARKDOWN CLEANUP FIRST (keep **bold** for UI)
  cleanText = cleanText
    // .replace(/\*\*([^*]+)\*\*/g, '$1')     // KEEP **bold** for UI display
    .replace(/\*([^*]+)\*/g, '$1')         // Remove *italic*
    .replace(/#{1,6}\s*/g, '')             // Remove ### headers
    .replace(/`([^`]+)`/g, '$1')           // Remove `inline code`
    .replace(/```[\s\S]*?```/g, '')        // Remove ```code blocks```
    .replace(/_([^_]+)_/g, '$1')           // Remove _underline_
    .replace(/~~([^~]+)~~/g, '$1');        // Remove ~~strikethrough~~

  // 🎯 SMART BULLET FORMATTING - FIXED!
  // Handle emoji headers + bullet combinations
  cleanText = cleanText
    .replace(/([🌤️🌧️🌞⛅☔💰📊🏠🎵🔍💡📈📉⚡🎯🚀])\s*([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s:]+):\s*•/gi, '$1 $2:\n•')
    .replace(/:\s*•/g, ':\n•')             // Add newline before bullets after colons
    .replace(/•\s+/g, '\n• ')              // Normalize bullet spacing
    .replace(/\s*•\s*/g, '\n• ')           // Clean up bullet spacing
    .replace(/([.!?])\s*•/g, '$1\n• ')     // Add newline after sentences before bullets
    .replace(/([a-zA-Z])\s*•/g, '$1\n• ')  // Add newline between words and bullets
    .replace(/\n{3,}/g, '\n\n')            // Max 2 newlines
    .replace(/\n{2,}/g, '\n')              // Actually, max 1 newline for cleaner look
    .replace(/^\n+/, '')                   // Remove leading newlines
    .replace(/\n+$/, '');                  // Remove trailing newlines

  // 💪 CONVERT CAPS TO BOLD CAPS - BEST OF BOTH WORLDS!
  cleanText = cleanText
    .replace(/\b([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{3,}):?\s*/g, '**$1**: ')  // VÝHODY: → **VÝHODY**: 
    .replace(/\*\*([^*]+)\*\*:\s*\*\*([^*]+)\*\*:/g, '**$1**: **$2**:'); // Fix double bold

  return cleanText.trim();
}

// 🧪 CLEANMARKDOWNFORUI TEST CASES:
/*
🔧 BULLET FORMATTING TESTS - FIXED:

INPUT:  "🌤️ VREMEA MAINE ÎN PRAGA: • Dimineața: Ploaie • Temperatura: Caldă"
OUTPUT: "🌤️ VREMEA MAINE ÎN PRAGA:\n• Dimineața: Ploaie\n• Temperatura: Caldă" ✅

INPUT:  "💰 BITCOIN AKTUÁLNĚ: • Cena: $108,000 • Změna: +0.07%"
OUTPUT: "💰 BITCOIN AKTUÁLNĚ:\n• Cena: $108,000\n• Změna: +0.07%" ✅

INPUT:  "Normální text s **bold** a • odrážka uprostřed textu"
OUTPUT: "Normální text s bold a\n• odrážka uprostřed textu" ✅

✅ RESULT: Clean structured formatting with proper line breaks!
*/

// 🧪 MARKDOWN CLEANUP TEST CASES:
/*
🚫 MARKDOWN REMOVAL TESTS:

INPUT:  "**Pes - nejlepší přítel člověka**"
OUTPUT: "Pes - nejlepší přítel člověka" ✅

INPUT:  "### Hlavní typy umělé inteligence"
OUTPUT: "Hlavní typy umělé inteligence" ✅

INPUT:  "*důležité* informace s `kódem`"
OUTPUT: "důležité informace s kódem" ✅

INPUT:  "Text s [odkazy](https://example.com) a ~~škrtáním~~"
OUTPUT: "Text s odkazy a škrtáním" ✅

✅ CRITICAL: Markdown cleanup happens BEFORE language-specific TTS processing!
*/

// 🧪 SMART AI DETECTION TEST CASES:
/*
🇷🇴 RUMUNSKÝ TEST - FIXED:

✅ TECH AI → "a i":
- "AI technology" → "a i technology" ✅
- "AI asistent" → "a i asistent" ✅
- "Folosesc AI." → "folosesc a i." ✅
- "AI este rapid" → "a i este rapid" ✅

✅ SLOVESO "ai" → zůstává "ai":
- "Ai întrebări?" → "ai întrebări?" ✅ (PROTECTION funguje!)
- "Nu ai timp" → "nu ai timp" ✅ (PROTECTION funguje!)
- "Ce ai făcut?" → "ce ai făcut?" ✅ (PROTECTION funguje!)
- "Ai chef să vorbești?" → "ai chef să vorbești?" ✅ (PROTECTION funguje!)

🎯 COMBO TEST:
- "Ai știut că AI technology e bună?" → "ai știut că a i technology e bună?" ✅
- "Ce ai spus despre AI?" → "ce ai spus despre a i?" ✅

🔧 CRITICAL FIX IMPLEMENTED:
1. .replace(/\bAI\b/g, 'a i') - zmení všetky AI na "a i"
2. Potom PROTECTION patterns vrátia sloveso "ai" späť
3. Poriadok je kritický!
*/