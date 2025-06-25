// api/voice.js - JEMNĚJŠÍ CZECH PREPROCESSING
export const config = {
  runtime: 'edge',
}

// 🎯 JEMNĚJŠÍ CZECH PREPROCESSING - Méně agresivní
function preprocessCzechTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // ✅ POUZE ZÁKLADNÍ ČÍSLA (méně změn = méně artefaktů)
  const basicNumbers = {
    ' 0 ': ' nula ',
    ' 1 ': ' jedna ',
    ' 2 ': ' dva ',
    ' 3 ': ' tři ',
    ' 4 ': ' čtyři ',
    ' 5 ': ' pět ',
    ' 6 ': ' šest ',
    ' 7 ': ' sedm ',
    ' 8 ': ' osm ',
    ' 9 ': ' devět ',
    ' 10 ': ' deset '
  };
  
  // Nahradit jen pokud jsou čísla oddělená mezerami
  Object.entries(basicNumbers).forEach(([num, word]) => {
    processedText = processedText.replace(new RegExp(num, 'g'), word);
  });
  
  // ✅ JEN ZÁKLADNÍ ZKRATKY (ne všechny)
  const essentialAbbreviations = {
    'AI': 'ajaj',
    'API': 'á pé jaj',
    'např': 'například'
  };
  
  Object.entries(essentialAbbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // ✅ JEMNÉ ÚPRAVY (bez radikálních změn)
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 procent');
  processedText = processedText.replace(/(\d+)\s*Kč/gi, '$1 korun');
  
  // ✅ MINIMÁLNÍ CLEANUP
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
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

    // 🎯 JEMNÝ PREPROCESSING
    const processedText = preprocessCzechTextForTTS(text);
    
    console.log('🎵 Gentle Czech preprocessing:', {
      original: text.substring(0, 80),
      processed: processedText.substring(0, 80),
      changed: text !== processedText
    });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/MpbYQvoTmXjHkaxtLiSh`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.9,         // 🎯 VYŠŠÍ stabilita = méně artefaktů
          similarity_boost: 0.8,  // 🎯 Mírnější boost
          style: 0.1,            // 🎯 NIŽŠÍ styl = přírodzenější
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
    console.log('✅ Gentle TTS success!');
    
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