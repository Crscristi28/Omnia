// api/voice-to-voice.js - FIXED VERSION
// 🎵 Správná implementace ElevenLabs Speech-to-Speech API

export const config = {
  runtime: 'edge',
  maxDuration: 30,
}

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'MpbYQvoTmXjHkaxtLiSh';
  
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'ElevenLabs API key not configured' 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('🎵 VOICE-TO-VOICE: Processing request...');

    // Get audio buffer from request
    const audioBuffer = await req.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error('❌ No audio data received');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No audio data received'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioSizeKB = Math.round(audioBuffer.byteLength / 1024);
    console.log('🎤 Input audio:', { sizeKB: audioSizeKB });

    // Validate audio size
    if (audioBuffer.byteLength < 1000) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Audio too short - likely silence'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔧 CRITICAL FIX: Create proper FormData for ElevenLabs
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');  // ← SPRÁVNÉ pole "audio"
    
    // Optional: Model specification
    formData.append('model_id', 'eleven_english_sts_v2');
    
    // Voice settings
    const voiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    };
    formData.append('voice_settings', JSON.stringify(voiceSettings));

    console.log('📤 Sending to ElevenLabs Speech-to-Speech API...');

    // 🎯 SPRÁVNÝ API CALL
    const response = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          // NEPOSÍLÁME Content-Type - nechej browser nastavit multipart boundary
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs Speech-to-Speech error:', response.status, errorText);
      
      // Specific error handling
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid ElevenLabs API key' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 422) {
        return new Response(
          JSON.stringify({ 
            error: 'Audio format not supported',
            details: 'Try recording in different format or check audio quality'
          }), 
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded or quota reached' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Voice-to-Voice API error: ${response.status}`,
          details: errorText
        }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transformed audio
    const audioResult = await response.arrayBuffer();
    const audioResultBuffer = Buffer.from(audioResult);
    
    console.log('✅ VOICE-TO-VOICE SUCCESS:', {
      inputSize: audioSizeKB,
      outputSize: Math.round(audioResultBuffer.length / 1024),
      voiceId: ELEVENLABS_VOICE_ID
    });
    
    // Return transformed audio
    return new Response(audioResultBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioResultBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('💥 Voice-to-Voice error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Voice transformation failed',
        message: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}