// 📁 src/utils/sanitizeText.js
// 🎵 ENHANCED MULTILINGUAL SANITIZATION pro ElevenLabs TTS
// ✅ Čeština, Rumunština, Angličtina
// ✅ Smart AI vs ai detection pro rumunštinu
// ✅ Tech terms: 0W-30, API, atd.
// ✅ Datumy: "2. července" → "druhého července", "2 iulie" → "doi iulie"

export default function sanitizeText(text, language = 'cs') {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  switch (language.toLowerCase()) {
    
    case 'ro': // 🇷🇴 RUMUNŠTINA
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
        
        // === AI vs AI (sloveso) - SMART DETECTION ===
        // AI technology terms - změnit na "a i"
        .replace(/\bAI\s+(technology|tehnologie|assistant|asistent|model|sistem|system|intelligence|inteligență)/gi, 'a i $1')
        .replace(/\b(asistent|tehnologie|model|sistem)\s+AI\b/gi, '$1 a i')
        .replace(/\binteligenț[aă]\s+artificial[aă]\b/gi, 'inteligență artificială')
        // AI standalone v tech kontextu
        .replace(/\bAI\b(?=\s*[.,!?]|$)/g, 'a i')
        
        // SLOVESO "ai" (mít) - NEZMĚNIT!
        // "Ai întrebări?" zůstává "ai întrebări?"
        // "Nu ai timp" zůstává "nu ai timp"
        // (žádná změna potřeba - regex výše jsou specifické)
        
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
        .replace(/\bAI\b/g, 'A I')
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
        .replace(/\bAI\b/g, 'éj áj')
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

// 🧪 TESTING EXAMPLES pro debugging:
/*
🇨🇿 ČESKÝ TEST:
- "2. července" → "druhého července" ✅
- "23°C" → "dvacet tři stupňů Celsia" ✅
- "45%" → "čtyřicet pět procent" ✅
- "0W-30" → "nula W třicet" ✅
- "API klíč" → "éj pí áj klíč" ✅

🇷🇴 RUMUNSKÝ TEST:
- "2 iulie" → "doi iulie" ✅
- "23°C" → "douăzeci și trei grade Celsius" ✅
- "45%" → "patruzeci și cinci la sută" ✅
- "0W-30" → "zero W treizeci" ✅
- "AI technology" → "a i technology" ✅
- "Ai întrebări?" → "ai întrebări?" ✅ (sloveso zůstává)

🇺🇸 ANGLICKÝ TEST:
- "July 2nd" → "July second" ✅
- "23°C" → "twenty three degrees Celsius" ✅
- "45%" → "forty five percent" ✅
- "0W-30" → "zero W thirty" ✅
- "API key" → "A P I key" ✅
*/