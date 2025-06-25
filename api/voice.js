// api/voice.js - BEZ OPENAI FALLBACK
export const config = {
  runtime: 'edge',
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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key missing');
      return new Response(JSON.stringify({ 
        error: 'ElevenLabs API key missing' 
      }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const requestData = await req.json();
    const { text } = requestData;
    
    if (!text?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'No text provided' 
      }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('🎵 ElevenLabs only - using voice: MpbYQvoTmXjHkaxtLiSh');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/MpbYQvoTmXjHkaxtLiSh`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.85,
          similarity_boost: 0.9,
          style: 0.25,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs failed:', response.status, errorText);
      throw new Error(`ElevenLabs failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log('✅ ElevenLabs success!');
    
    return new Response(audioBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg'
      }
    });

  } catch (error) {
    console.error('💥 Voice API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Voice generation failed',
      details: error.message 
    }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}