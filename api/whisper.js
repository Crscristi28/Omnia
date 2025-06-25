// api/whisper.js - VERCEL EDGE RUNTIME COMPATIBLE

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
    console.log('🎙️ Edge Whisper API called');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          message: 'OpenAI API key není nastaven'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔧 EDGE RUNTIME: Získej audio data jako ArrayBuffer
    const arrayBuffer = await req.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      console.error('❌ No audio data received');
      return new Response(
        JSON.stringify({ 
          error: 'No audio data',
          message: 'Audio data nebyla přijata' 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📊 Audio buffer size:', arrayBuffer.byteLength, 'bytes');

    // 🔧 EDGE RUNTIME: FormData s Blob
    const formData = new FormData();
    
    // Vytvoř Blob z ArrayBuffer
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    console.log('🔍 Using automatic language detection');

    // API call k OpenAI Whisper
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    });

    console.log('📡 Whisper API response status:', whisperResponse.status);

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ Whisper API error:', whisperResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Whisper API failed',
          status: whisperResponse.status,
          message: 'Rozpoznávání řeči selhalo',
          details: errorText 
        }), 
        { status: whisperResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const whisperData = await whisperResponse.json();
    console.log('🎯 Whisper response:', whisperData);

    // Získej text a jazyk
    const transcribedText = whisperData.text;
    const detectedLanguage = whisperData.language || 'unknown';

    console.log('✅ Transcribed text:', transcribedText);
    console.log('🌍 Detected language:', detectedLanguage);

    if (!transcribedText || transcribedText.trim().length === 0) {
      console.warn('⚠️ Empty transcription received');
      return new Response(
        JSON.stringify({
          success: false,
          text: '',
          language: detectedLanguage,
          message: 'Žádný text nebyl rozpoznán'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🎯 ÚSPĚŠNÁ ODPOVĚĎ
    return new Response(
      JSON.stringify({
        success: true,
        text: transcribedText.trim(),
        language: detectedLanguage,
        message: 'Řeč úspěšně rozpoznána'
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Edge Whisper API Critical Error:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Chyba při rozpoznávání řeči',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}