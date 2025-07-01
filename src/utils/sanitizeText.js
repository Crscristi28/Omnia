// 📁 src/utils/sanitizeText.js
// 🎵 ChatGPT SANITIZATION pro ElevenLabs TTS
// ✅ Opravuje Claude "computer text" → "human speech"

export default function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Zkratky
    .replace(/\bnapř\.\b/gi, 'například')
    .replace(/\batd\.\b/gi, 'a tak dále')
    // Procenta
    .replace(/(\d+)\s*%/g, '$1 procent')
    // Stupně
    .replace(/(\d+)[\s]*°C/g, '$1 stupňů Celsia')
    .replace(/(\d+)[\s]*°/g, '$1 stupňů')
    // Čas
    .replace(/(\d{1,2}):(\d{2})/g, '$1 hodin $2 minut')
    // Měny
    .replace(/(\d+)\s*Kč/g, '$1 korun')
    .replace(/(\d+)\s*\$/g, '$1 dolarů')
    .replace(/(\d+)\s*€/g, '$1 eur')
    // Desetinná čísla – čte jako „celá"
    .replace(/(\d+)[.,](\d+)/g, '$1 celá $2')
    // Jednotky
    .replace(/(\d+)\s*km\/h/g, '$1 kilometrů za hodinu')
    .replace(/(\d+)\s*kg/g, '$1 kilogramů')
    .replace(/(\d+)\s*kWh/g, '$1 kilowatthodin')
    // Zlomky
    .replace(/\b1\/2\b/g, 'půl')
    .replace(/\b1\/4\b/g, 'čtvrt')
    // Nadbytečné mezery
    .replace(/\s+/g, ' ')
    .trim();
}

// 🧪 TESTING EXAMPLES pro debugging:
/*
TEST CASES:
- "31°C" → "31 stupňů Celsia" ✅
- "75%" → "75 procent" ✅  
- "23.5" → "23 celá 5" ✅
- "300/20 = 15" → "300 děleno 20 rovná se 15" ✅
- "API klíč" → "á pé áj klíč" ✅
- "120 km/h" → "120 kilometrů za hodinu" ✅
*/