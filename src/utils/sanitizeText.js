// 📁 src/utils/sanitizeText.js
// 🎵 SIMPLIFIED SANITIZATION - Only essential fixes for ElevenLabs TTS
// ✅ PHILOSOPHY: ElevenLabs umí česky/rumunsky/anglicky sám - nekazit to!
// 🎯 FOCUS: Jen čísla, procenta, markdown - zbytek nechat na ElevenLabs
// 🔧 CRITICAL FIX: Czech capitals → lowercase (DŮLEŽITÁ → důležitá)

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
    
    case 'ro': // 🇷🇴 RUMUNŠTINA - SIMPLIFIED
      processedText = processedText
        // === PROCENTA ===
        .replace(/(\d+)\s*%/gi, '$1 la sută')
        
        // === TEPLOTA ===
        .replace(/(\d+)[\s]*°C/gi, '$1 grade Celsius')
        .replace(/(\d+)[\s]*°F/gi, '$1 grade Fahrenheit')
        .replace(/(\d+)[\s]*°/gi, '$1 grade')
        
        // === ČAS ===
        .replace(/(\d{1,2}):(\d{2})/g, '$1 și $2 minute')
        
        // === MĚNY ===
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
        
        // === ZKRATKY ===
        .replace(/\betc\.?\b/gi, 'și așa mai departe')
        .replace(/\bex\.?\b/gi, 'de exemplu')
        .replace(/\bvs\.?\b/gi, 'versus')
        
        // === CLEANUP ===
        .replace(/\s+/g, ' ')
        .trim();
      break;
      
    case 'en': // 🇺🇸 ANGLIČTINA - SIMPLIFIED
      processedText = processedText
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
        
        // === ABBREVIATIONS ===
        .replace(/\betc\.?\b/gi, 'et cetera')
        .replace(/\be\.g\.?\b/gi, 'for example')
        .replace(/\bi\.e\.?\b/gi, 'that is')
        .replace(/\bvs\.?\b/gi, 'versus')
        
        // === CLEANUP ===
        .replace(/\s+/g, ' ')
        .trim();
      break;
      
    default: // 🇨🇿 ČEŠTINA - SIMPLIFIED + LOWERCASE FIX
      processedText = processedText
        // 🔧 CRITICAL FIX: Convert Czech capitals to lowercase for ElevenLabs
        .toLowerCase()  // DŮLEŽITÁ → důležitá, VÝHODA → výhoda, MŮJ → můj
        
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

// 🔧 cleanMarkdownForUI - Better bullet point handling
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

  // 🎯 SMART BULLET FORMATTING
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

  return cleanText.trim();
}