// api/voice.js - OPRAVENÉ TTS API

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  // CORS headers
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
    console.log('🎵 TTS API called');

    // Zkontroluj API klíče
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!OPENAI_API_KEY && !ELEVENLABS_API_KEY) {
      console.error('❌ No TTS API keys configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          message: 'TTS API keys nejsou nastaveny'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Získej request data
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

    console.log('🎯 TTS Request:', { text: text.substring(0, 50), language, voice });

    let audioResponse;

    // 🎵 POKUS 1: ElevenLabs (pokud je k dispozici)
    if (ELEVENLABS_API_KEY) {
      try {
        console.log('🎤 Using ElevenLabs TTS');
        
        // ElevenLabs voice IDs
        const voiceIds = {
          'cs': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
          'en': 'pNInz6obpgDQGcFmaJgB', 
          'de': 'pNInz6obpgDQGcFmaJgB',
          'es': 'pNInz6obpgDQGcFmaJgB',
          'fr': 'pNInz6obpgDQGcFmaJgB',
          'ro': 'pNInz6obpgDQGcFmaJgB'
        };

        const voiceId = voiceIds[language] || voiceIds['cs'];

        audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (audioResponse.ok) {
          console.log('✅ ElevenLabs TTS successful');
          const audioBlob = await audioResponse.blob();
          
          return new Response(audioBlob, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBlob.size.toString()
            }
          });
        } else {
          console.warn('⚠️ ElevenLabs failed, trying OpenAI...');
        }
      } catch (error) {
        console.warn('⚠️ ElevenLabs error, trying OpenAI:', error.message);
      }
    }

    // 🎵 POKUS 2: OpenAI TTS (fallback)
    if (OPENAI_API_KEY) {
      try {
        console.log('🎤 Using OpenAI TTS');
        
        audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'alloy',
            response_format: 'mp3'
          })
        });

        if (audioResponse.ok) {
          console.log('✅ OpenAI TTS successful');
          const audioBlob = await audioResponse.blob();
          
          return new Response(audioBlob, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBlob.size.toString()
            }
          });
        } else {
          const errorText = await audioResponse.text();
          console.error('❌ OpenAI TTS error:', audioResponse.status, errorText);
          throw new Error(`OpenAI TTS failed: ${audioResponse.status}`);
        }
      } catch (error) {
        console.error('❌ OpenAI TTS error:', error);
        throw error;
      }
    }

    // Pokud se nic nepodařilo
    throw new Error('All TTS services failed');

  } catch (error) {
    console.error('💥 TTS API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'TTS failed',
        message: 'Generování hlasu selhalo',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}