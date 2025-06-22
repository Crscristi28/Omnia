// api/voice.js - ElevenLabs Text-to-Speech API - OPTIMIZED PRO RYCHLOST

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎤 ElevenLabs TTS API call (FAST)');
    
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Text musí být string' 
      });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // Rachel Voice ID
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ELEVENLABS_API_KEY not set');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'ElevenLabs API key není nastaven'
      });
    }

    if (!VOICE_ID) {
      console.error('❌ ELEVENLABS_VOICE_ID not set');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Voice ID není nastaven'
      });
    }

    console.log('🗣️ Generuji hlas (česky):', text.substring(0, 50) + '...');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // 🎯 ZPĚT K MULTILINGUAL PRO ČEŠTINU
        voice_settings: {
          stability: 0.5,              // 🎯 PŮVODNÍ NASTAVENÍ PRO ČEŠTINU
          similarity_boost: 0.5,       // 🎯 PŮVODNÍ NASTAVENÍ
          style: 0.0,                  // 🎯 BEZ STYLU PRO LEPŠÍ ČEŠTINU
          use_speaker_boost: true
        },
        // 🚀 DODATEČNÉ OPTIMALIZACE
        output_format: "mp3_44100_128", // Menší soubor = rychlejší
        optimize_streaming_latency: 4    // Max optimalizace pro rychlost
      })
    });

    console.log('📡 ElevenLabs response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'ElevenLabs API error',
        status: response.status,
        details: errorText 
      });
    }

    // Získej audio data jako buffer
    const audioBuffer = await response.arrayBuffer();
    console.log('✅ Audio vygenerováno (FAST), velikost:', audioBuffer.byteLength, 'bytes');

    // Nastav správné headers pro audio s cache
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 🚀 CACHE PRO RYCHLOST
    
    // Pošli audio data
    res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('💥 Voice API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}