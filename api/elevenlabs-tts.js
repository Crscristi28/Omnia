// api/elevenlabs-tts.js - FIXED VERSION with optimized voice settings
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ 
      error: 'ElevenLabs API key not configured' 
    });
  }

  const { 
    text, 
    voice_id = process.env.ELEVENLABS_VOICE_ID || 'MpbYQvoTmXjHkaxtLiSh',
    model_id = 'eleven_multilingual_v2',
    // 🆕 OPTIMIZED VOICE SETTINGS - FIXED FOR NUMBERS!
    voice_settings = {
      stability: 0.75,        // ↑ Vyšší pro konzistentní čísla (bylo 0.30)
      similarity_boost: 0.90, // ↑ Vyšší pro přesnější výslovnost (bylo 0.25)
      style: 0.15,           // ↓ Nižší pro neutrálnější čtení (bylo 0.30)
      use_speaker_boost: true
    }
  } = req.body;

  if (!text) {
    return res.status(400).json({ 
      error: 'Text is required' 
    });
  }

  try {
    // 🔍 DEBUG LOGGING for problematic patterns
    const hasNumbers = /\d/.test(text);
    const hasTemperature = /\d+\s*°[CF]/i.test(text);
    const hasCurrency = /\d+\s*[Kč€$]/i.test(text);
    
    console.log('🎵 ElevenLabs TTS Request (FIXED):', {
      textLength: text.length,
      textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      hasNumbers,
      hasTemperature,
      hasCurrency,
      voice_id: voice_id,
      model: model_id,
      optimizedSettings: voice_settings
    });

    // 🚨 SPECIAL LOGGING for temperature patterns
    if (hasTemperature) {
      const tempMatches = text.match(/\d+\s*°[CF]/gi);
      console.log('🌡️ Temperature patterns detected:', tempMatches);
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,              // ← RAW TEXT (no preprocessing!)
          model_id: model_id,
          voice_settings: voice_settings // ← OPTIMIZED SETTINGS
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid API key' 
        });
      }
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded or quota reached' 
        });
      }
      
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.status}`,
        details: errorText
      });
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    
    console.log('✅ ElevenLabs TTS SUCCESS (OPTIMIZED):', {
      textContainedNumbers: hasNumbers,
      textContainedTemperature: hasTemperature,
      audioSize: audioBuffer.byteLength,
      sizeKB: Math.round(audioBuffer.byteLength / 1024),
      settings: {
        stability: voice_settings.stability,
        similarity_boost: voice_settings.similarity_boost,
        style: voice_settings.style
      }
    });
    
    // Send audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('💥 ElevenLabs route error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}

// 🎯 SETTINGS EXPLANATION:
/*
🔧 OPTIMIZED VOICE SETTINGS BREAKDOWN:

OLD (PROBLEMATIC):
- stability: 0.30      → číslová výslovnost nestabilní ❌
- similarity_boost: 0.25 → hlas se vzdaluje od originálu ❌  
- style: 0.30          → přidává nechtěné efekty ❌

NEW (OPTIMIZED):
- stability: 0.75      → konzistentní číslová výslovnost ✅
- similarity_boost: 0.90 → hlas zůstává věrný originálu ✅
- style: 0.15          → minimální efekty, čistá řeč ✅

🧪 TEST CASES TO VERIFY:
- "31°C" → should say "třicet jedna stupňů Celsia"
- "45 tisíc dolarů" → should be clear
- "75%" → should say "sedmdesát pět procent"
- "API klíč" → should say "á pé í klíč"

🎯 EXPECTED RESULTS:
- Numbers: Clear, consistent pronunciation ✅
- Temperature: Natural reading of °C symbol ✅  
- Currency: Proper handling of amounts ✅
- Tech terms: Correct abbreviation reading ✅
*/