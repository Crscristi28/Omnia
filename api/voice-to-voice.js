// api/voice-to-voice.js - ELEVENLABS VOICE-TO-VOICE (CLEAN!)
// 🎵 Direct audio-to-audio transformation - NO PREPROCESSING HELL!

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
    return res.status(500).json({ 
      error: 'ElevenLabs API key not configured' 
    });
  }

  try {
    console.log('🎵 VOICE-TO-VOICE: Direct audio transformation started');

    // Get audio data from request body (raw audio)
    const audioBuffer = await req.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No audio data received'
      });
    }

    const audioSizeKB = Math.round(audioBuffer.byteLength / 1024);
    console.log('🎤 Input audio:', { sizeKB: audioSizeKB });

    // Validate audio size
    if (audioBuffer.byteLength < 1000) {
      return res.status(400).json({ 
        success: false,
        error: 'Audio too short - likely silence'
      });
    }

    if (audioBuffer.byteLength > 25 * 1024 * 1024) { // 25MB limit
      return res.status(400).json({ 
        success: false,
        error: 'Audio too large - max 25MB'
      });
    }

    // Create FormData for ElevenLabs Voice Changer
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('audio', audioBlob, 'input.webm');
    
    // 🎵 VOICE CHANGER SETTINGS - optimized for Czech
    formData.append('model_id', 'eleven_multilingual_sts_v2');
    
    // Optional: Voice settings for quality
    formData.append('voice_settings', JSON.stringify({
      stability: 0.5,           // Balanced for conversation
      similarity_boost: 0.8,    // High similarity to target voice
      style: 0.3,              // Natural style
      use_speaker_boost: false  // Better for multilingual
    }));
    
    // Optional: Remove background noise
    formData.append('remove_background_noise', 'true');
    
    // Optional: Optimize for streaming (level 1 = good balance)
    formData.append('optimize_streaming_latency', '1');
    
    // Optional: Output format (high quality)
    formData.append('output_format', 'mp3_44100_128');

    console.log('📤 Sending to ElevenLabs Voice Changer API...');

    // Call ElevenLabs Voice Changer API
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        // Don't set Content-Type - let browser handle FormData boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs Voice Changer error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid API key' 
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
        details: errorText
      });
    }

    // Get transformed audio
    const audioResult = await response.arrayBuffer();
    
    console.log('✅ VOICE-TO-VOICE SUCCESS:', {
      inputSize: audioSizeKB,
      outputSize: Math.round(audioResult.byteLength / 1024),
      transformation: 'complete',
      voiceId: ELEVENLABS_VOICE_ID,
      quality: 'native_czech_support'
    });
    
    // Send transformed audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioResult.byteLength);
    res.setHeader('Cache-Control', 'no-cache'); // Don't cache voice transformations
    res.setHeader('X-Voice-Transform', 'elevenlabs_vtv');
    res.setHeader('X-Original-Size', audioSizeKB.toString());
    res.setHeader('X-Output-Size', Math.round(audioResult.byteLength / 1024).toString());
    
    res.send(Buffer.from(audioResult));

  } catch (error) {
    console.error('💥 Voice-to-Voice error:', error);
    res.status(500).json({ 
      error: 'Voice transformation failed',
      message: error.message,
      details: 'Try with different audio format or check API quota'
    });
  }
}

// 🎯 VOICE-TO-VOICE ADVANTAGES:
/*
✅ NO PREPROCESSING - direct audio transformation
✅ PRESERVES EMOTION - maintains conversation flow
✅ NATIVE CZECH - your voice supports Czech directly
✅ SINGLE API CALL - less failure points
✅ HIGH QUALITY - studio-grade voice transformation
✅ INCLUDED IN PLAN - 62 minutes available

🔧 USAGE:
- User speaks in Czech → gets back same content in target voice
- Perfect for voice cloning demo
- Great for accent training
- Ideal for personalized AI responses

⚠️ LIMITATION:
- Only transforms voice, doesn't generate new content
- For AI conversation, need hybrid approach:
  1. User audio → STT → AI response → TTS → Voice transform
  2. OR use this for voice training/demo features
*/