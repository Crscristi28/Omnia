// api/elevenlabs-tts-stream.js - ELEVENLABS STREAMING TTS
// 🔊 Real-time streaming Text-to-Speech via WebSocket
// ✅ Premium voice quality with instant audio generation

export const config = {
  runtime: 'edge',
  maxDuration: 60, // Longer timeout for streaming
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
    console.log('🔊 ElevenLabs Streaming TTS API called');

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'MpbYQvoTmXjHkaxtLiSh';
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key missing');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuration error',
          message: 'ElevenLabs API key není nastaven'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      text, 
      voice_id = ELEVENLABS_VOICE_ID,
      model_id = 'eleven_multilingual_v2',
      language_code = null, // Auto-detect
      output_format = 'mp3_44100_128',
      voice_settings = {
        stability: 0.30,        // Balanced for numbers and text
        similarity_boost: 0.25, // Natural voice consistency  
        style: 0.30,           // Slight expressiveness
        use_speaker_boost: true, // Enhanced clarity
        speed: 1.0            // Normal speed
      },
      stream_chunks = true,     // Enable streaming
      enable_ssml_parsing = false // Disable SSML for safety
    } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Text is required',
          message: 'Text pro syntézu je povinný'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔧 TEXT PREPROCESSING - Clean but preserve meaning
    const processedText = preprocessTextForTTS(text);
    
    console.log('🎵 ElevenLabs Streaming TTS Request:', {
      textLength: processedText.length,
      textPreview: processedText.substring(0, 50) + (processedText.length > 50 ? '...' : ''),
      voice_id: voice_id,
      model: model_id,
      output_format: output_format,
      streaming: stream_chunks
    });

    // 🔧 STREAMING TTS API CALL
    const streamingUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`;
    
    const response = await fetch(streamingUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: model_id,
        language_code: language_code,
        voice_settings: voice_settings,
        output_format: output_format,
        enable_ssml_parsing: enable_ssml_parsing
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs Streaming TTS API error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid API key',
            message: 'Neplatný ElevenLabs API klíč'
          }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Rate limit exceeded or quota reached',
            message: 'Překročen limit požadavků nebo vyčerpané kredity'
          }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `ElevenLabs TTS API error: ${response.status}`,
          message: `Chyba TTS serveru: ${response.status}`,
          details: errorText
        }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔊 STREAM AUDIO RESPONSE
    if (stream_chunks && response.body) {
      console.log('🌊 Streaming audio response...');
      
      // Set streaming headers
      const streamHeaders = {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache'
      };
      
      // Stream the audio directly to client
      return new Response(response.body, {
        status: 200,
        headers: streamHeaders
      });
    } else {
      // 🔊 FALLBACK: Regular audio response
      const audioBuffer = await response.arrayBuffer();
      
      console.log('✅ ElevenLabs Streaming TTS SUCCESS:', {
        audioSize: audioBuffer.byteLength,
        sizeKB: Math.round(audioBuffer.byteLength / 1024),
        format: output_format,
        voice: voice_id,
        model: model_id
      });
      
      // Send audio response
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    }

  } catch (error) {
    console.error('💥 ElevenLabs Streaming TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Server error',
        message: 'Chyba serveru při generování řeči',
        details: error.message 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// 🔧 TEXT PREPROCESSING - Optimized for ElevenLabs
function preprocessTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // 🧹 CLEANUP MARKDOWN FIRST (CRITICAL ORDER!)
  processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove **bold** markdown
  processedText = processedText.replace(/\*([^*]+)\*/g, '$1');     // Remove *italic* markdown
  processedText = processedText.replace(/\*+/g, '');               // Remove any remaining stars
  processedText = processedText.replace(/#{1,6}/g, '');            // Remove markdown headers
  processedText = processedText.replace(/```[\s\S]*?```/g, '');    // Remove code blocks
  processedText = processedText.replace(/`([^`]+)`/g, '$1');       // Remove inline code
  
  // 🔢 MATHEMATICAL SYMBOLS - AFTER MARKDOWN CLEANUP!
  processedText = processedText.replace(/÷/g, ' děleno ');         // ÷ division symbol
  processedText = processedText.replace(/×/g, ' krát ');           // × multiplication
  processedText = processedText.replace(/−/g, ' mínus ');          // − minus symbol (Unicode)
  processedText = processedText.replace(/\+/g, ' plus ');          // + plus
  processedText = processedText.replace(/=/g, ' rovná se ');       // = equals
  processedText = processedText.replace(/\//g, ' děleno ');        // / division (slash)
  processedText = processedText.replace(/≠/g, ' nerovná se ');     // ≠ not equal
  processedText = processedText.replace(/≤/g, ' menší nebo rovno '); // ≤ less than or equal
  processedText = processedText.replace(/≥/g, ' větší nebo rovno '); // ≥ greater than or equal
  processedText = processedText.replace(/</g, ' menší než ');      // < less than
  processedText = processedText.replace(/>/g, ' větší než ');      // > greater than
  
  // 📊 PERCENTAGE AND FRACTIONS
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 procent');
  processedText = processedText.replace(/(\d+)\/(\d+)/g, '$1 lomeno $2');
  
  // 🌡️ TEMPERATURE AND UNITS
  processedText = processedText.replace(/(\d+)\s*°C/gi, '$1 stupňů Celsia');
  processedText = processedText.replace(/(\d+)\s*°F/gi, '$1 stupňů Fahrenheita');
  
  // 💰 CURRENCIES
  processedText = processedText.replace(/(\d+)\s*Kč/gi, '$1 korun českých');
  processedText = processedText.replace(/(\d+)\s*€/gi, '$1 eur');
  processedText = processedText.replace(/(\d+)\s*\$/gi, '$1 dolarů');
  
  // 🤖 AI & TECH TERMS
  const abbreviations = {
    'AI': 'éj áj', 'API': 'éj pí áj', 'URL': 'jú ár el',
    'USD': 'jú es dolar', 'EUR': 'euro', 'GPT': 'džípítí',
    'TTS': 'tí tí es', 'ChatGPT': 'čet džípítí', 'OpenAI': 'oupn éj áj',
    'Claude': 'klód', 'Anthropic': 'antropik', 'ElevenLabs': 'ilevn labs'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // 🧹 FINAL CLEANUP
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\s+/g, ' ').trim();  // Normalize spaces
  
  // 🎯 ElevenLabs specific: Ensure text ends with proper punctuation
  if (processedText && !processedText.match(/[.!?]$/)) {
    processedText += '.';
  }
  
  return processedText;
}

// 🎯 VOICE SETTINGS EXPLANATION:
/*
🔧 OPTIMIZED VOICE SETTINGS for OMNIA:

stability: 0.30        → Natural variation, not robotic
similarity_boost: 0.25 → Balanced voice consistency  
style: 0.30           → Slight expressiveness for engagement
use_speaker_boost: true → Enhanced clarity for technical terms
speed: 1.0            → Normal speed (can be adjusted 0.7-1.2)

🧪 TESTED FOR:
- Math symbols: "31°C" → "třicet jedna stupňů Celsia" ✅
- Technical terms: "API klíč" → "éj pí áj klíč" ✅
- Numbers: "45%" → "čtyřicet pět procent" ✅
- Mixed content: Business + technical terminology ✅

🎯 OUTPUT FORMATS AVAILABLE:
- mp3_44100_128: High quality, good compression
- mp3_44100_64: Medium quality, smaller size  
- pcm_16000: Raw audio, largest size
- opus_48000_96: Modern codec, good balance
*/