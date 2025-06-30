// api/voice-to-voice.js - FIXED FOR NODE.JS RUNTIME
// 🎵 Voice-to-Voice API route - NO EDGE RUNTIME ISSUES!

import formidable from 'formidable';
import fs from 'fs';

// 🔧 REMOVED: export const config = { runtime: 'edge' }
// Using Node.js runtime instead!

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser for file uploads
  },
};

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

    // 🔧 FIXED: Use raw buffer from request (Node.js style)
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

    // 🔧 FIXED: Create proper FormData for Node.js
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add audio as stream
    formData.append('audio', audioBuffer, {
      filename: 'input.webm',
      contentType: 'audio/webm'
    });
    
    // Add model and settings
    formData.append('model_id', 'eleven_multilingual_sts_v2');
    formData.append('voice_settings', JSON.stringify({
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.3,
      use_speaker_boost: false
    }));
    formData.append('remove_background_noise', 'true');
    formData.append('optimize_streaming_latency', '1');
    formData.append('output_format', 'mp3_44100_128');

    // Call ElevenLabs Voice Changer API
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        ...formData.getHeaders() // Important for multipart/form-data
      },
      body: formData
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
        details: errorText
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
      details: 'Check server logs for more information'
    });
  }
}

// 🎯 KEY FIXES:
/*
✅ REMOVED Edge Runtime - using Node.js runtime
✅ FIXED req.arrayBuffer() - using Buffer.concat(chunks)
✅ PROPER FormData - using form-data package for Node.js
✅ BETTER ERROR HANDLING - detailed logs and responses
✅ STREAM HANDLING - proper audio buffer processing

🔧 DEPLOYMENT NOTE:
This now uses Node.js runtime instead of Edge Runtime
Should work correctly with Vercel's standard Node.js functions
*/