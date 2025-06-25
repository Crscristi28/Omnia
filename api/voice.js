// api/voice.js - POUZE ELEVENLABS TTS
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
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('🎵 ElevenLabs TTS API called');

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key missing');
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key missing',
          message: 'ElevenLabs API key není nastaven'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();
    const { text, language = 'cs', voice = 'natural' } = requestData;
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No text provided',
          message: 'Text pro TTS nebyl poskytnut' 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎤 ElevenLabs TTS Request:', { 
      text: text.substring(0, 50) + '...', 
      language, 
      voice,
      textLength: text.length 
    });

    // ElevenLabs voice IDs - můžeš změnit podle preference
    const voiceIds = {
      'cs': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual) - dobrý pro češtinu
      'en': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
      'de': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
      'es': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
      'fr': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
      'ro': 'pNInz6obpgDQGcFmaJgB'  // Adam (multilingual)
    };

    const voiceId = voiceIds[language] || voiceIds['cs'];

    const audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
          stability: 0.6,        // Stabilita hlasu (0.0-1.0)
          similarity_boost: 0.7, // Podobnost originálnímu hlasu (0.0-1.0)
          style: 0.4,            // Styl/výraznost (0.0-1.0)
          use_speaker_boost: true // Zlepšení kvality
        }
      })
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('❌ ElevenLabs API error:', {
        status: audioResponse.status,
        statusText: audioResponse.statusText,
        error: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API failed',
          message: `ElevenLabs API chyba: ${audioResponse.status}`,
          details: errorText
        }), 
        { status: audioResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ ElevenLabs TTS successful');
    const audioBlob = await audioResponse.blob();
    
    console.log('🎵 Audio generated:', {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    return new Response(audioBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBlob.size.toString(),
        'Cache-Control': 'public, max-age=3600' // Cache na 1 hodinu
      }
    });

  } catch (error) {
    console.error('💥 ElevenLabs TTS unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'TTS generation failed',
        message: 'Generování hlasu selhalo',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}