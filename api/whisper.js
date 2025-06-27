// api/whisper.js - OPRAVENÉ SPEECH-TO-TEXT
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
    console.log('🎤 Whisper API called');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key missing');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuration error',
          message: 'OpenAI API key není nastaven'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Získej audio data z request body
    const audioBuffer = await req.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error('❌ No audio data received');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No audio data',
          message: 'Nebyla přijata žádná audio data'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎵 Audio data received:', {
      size: audioBuffer.byteLength,
      sizeKB: Math.round(audioBuffer.byteLength / 1024)
    });

    // Vytvoř FormData pro Whisper API
    const formData = new FormData();
    
    // Převeď ArrayBuffer na Blob
    const audioBlob = new Blob([audioBuffer], { 
      type: 'audio/webm' // Nebo audio/mp4 pro iOS
    });
    
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'cs'); // Česky jako default, ale Whisper auto-detekuje
    formData.append('response_format', 'json');

    console.log('📤 Sending to OpenAI Whisper...');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        // Neposíláme Content-Type - nechej browser nastavit boundary pro FormData
      },
      body: formData
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ Whisper API error:', {
        status: whisperResponse.status,
        statusText: whisperResponse.statusText,
        error: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Whisper API failed',
          message: `Whisper API chyba: ${whisperResponse.status}`,
          details: errorText
        }), 
        { status: whisperResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const whisperResult = await whisperResponse.json();
    
    console.log('✅ Whisper transcription successful:', {
      text: whisperResult.text?.substring(0, 100) + '...',
      textLength: whisperResult.text?.length || 0
    });

    // Detekce jazyka z textu (jednoduchá)
    const detectedLanguage = detectLanguageFromText(whisperResult.text || '');

    return new Response(
      JSON.stringify({
        success: true,
        text: whisperResult.text || '',
        language: detectedLanguage,
        message: 'Řeč úspěšně rozpoznána',
        details: {
          originalLanguage: whisperResult.language || 'unknown',
          detectedLanguage: detectedLanguage
        }
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Whisper API unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Speech recognition failed',
        message: 'Rozpoznávání řeči selhalo',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Pomocná funkce pro detekci jazyka
function detectLanguageFromText(text) {
  if (!text) return 'cs';
  
  const lowerText = text.toLowerCase();
  
  // České indikátory
  const czechWords = ['že', 'který', 'být', 'mít', 'se', 'na', 'do', 'od', 'co', 'jak', 'kde'];
  const englishWords = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they'];
  
  const czechCount = czechWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
  
  if (czechCount > englishCount) return 'cs';
  if (englishCount > czechCount) return 'en';
  
  return 'cs'; // Default
}