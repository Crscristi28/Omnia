// api/elevenlabs-tts.js - ElevenLabs TTS API Route
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
    voice_settings = {
      stability: 0.30,
      similarity_boost: 0.25,
      style: 0.30,
      use_speaker_boost: true
    }
  } = req.body;

  if (!text) {
    return res.status(400).json({ 
      error: 'Text is required' 
    });
  }

  try {
    console.log('🎤 ElevenLabs TTS request:', {
      textLength: text.length,
      voice_id: voice_id,
      model: model_id,
      language: 'auto-detect'
    });

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
          text: text,
          model_id: model_id,
          voice_settings: voice_settings
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
    
    console.log('✅ ElevenLabs TTS success:', {
      audioSize: audioBuffer.byteLength,
      sizeKB: Math.round(audioBuffer.byteLength / 1024)
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