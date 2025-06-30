// api/voice-to-voice.js - NO EXTERNAL DEPENDENCIES
// 🎵 Voice-to-Voice API - Pure Node.js implementation

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
  const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'MpbYQvoTmXjHkaxtLiSh';
  
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY');
    return res.status(500).json({ 
      error: 'ElevenLabs API key not configured' 
    });
  }

  try {
    console.log('🎵 VOICE-TO-VOICE: Processing request...');

    // 🔧 Get raw audio buffer from request
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      console.error('❌ No audio data received');
      return res.status(400).json({ 
        success: false,
        error: 'No audio data received'
      });
    }

    const audioSizeKB = Math.round(audioBuffer.length / 1024);
    console.log('🎤 Input audio:', { sizeKB: audioSizeKB });

    // Validate audio size
    if (audioBuffer.length < 1000) {
      return res.status(400).json({ 
        success: false,
        error: 'Audio too short - likely silence'
      });
    }

    if (audioBuffer.length > 25 * 1024 * 1024) { // 25MB limit
      return res.status(400).json({ 
        success: false,
        error: 'Audio too large - max 25MB'
      });
    }

    console.log('📤 Sending to ElevenLabs Voice Changer API...');

    // 🆕 SIMPLE APPROACH: Send raw audio with proper headers
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'audio/webm', // Direct audio upload
        'Content-Length': audioBuffer.length.toString()
      },
      body: audioBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs Voice Changer error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid ElevenLabs API key' 
        });
      }
      if (response.status === 422) {
        return res.status(422).json({ 
          error: 'Audio format not supported - try different recording format' 
        });
      }
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded or quota reached' 
        });
      }
      
      return res.status(response.status).json({ 
        error: `Voice-to-Voice API error: ${response.status}`,
        details: errorText,
        voiceId: ELEVENLABS_VOICE_ID
      });
    }

    // Get transformed audio
    const audioResult = await response.arrayBuffer();
    const audioResultBuffer = Buffer.from(audioResult);
    
    console.log('✅ VOICE-TO-VOICE SUCCESS:', {
      inputSize: audioSizeKB,
      outputSize: Math.round(audioResultBuffer.length / 1024),
      transformation: 'complete',
      voiceId: ELEVENLABS_VOICE_ID
    });
    
    // Send transformed audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioResultBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Voice-Transform', 'elevenlabs_vtv');
    res.setHeader('X-Original-Size', audioSizeKB.toString());
    res.setHeader('X-Output-Size', Math.round(audioResultBuffer.length / 1024).toString());
    
    res.send(audioResultBuffer);

  } catch (error) {
    console.error('💥 Voice-to-Voice error:', error);
    res.status(500).json({ 
      error: 'Voice transformation failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🎯 SIMPLIFIED APPROACH:
/*
✅ NO EXTERNAL DEPENDENCIES - pure Node.js
✅ DIRECT AUDIO UPLOAD - Content-Type: audio/webm
✅ NO FORMDATA COMPLEXITY - simple buffer transfer
✅ BETTER ERROR HANDLING - detailed responses
✅ VERCEL COMPATIBLE - no package.json dependencies

🔧 TESTING:
If this still fails, we can try:
1. Different Content-Type headers
2. Multipart boundary manual creation
3. Base64 encoding approach
4. Edge runtime with different buffer handling
*/