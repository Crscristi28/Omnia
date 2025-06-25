// api/voice.js - S ČESKÝM TTS PREPROCESSING
export const config = {
  runtime: 'edge',
}

// 🎯 CZECH TTS PREPROCESSING - Opraví česká čísla
function preprocessCzechTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Číslá na slova (rozšířené)
  const numberMap = {
    '0': 'nula', '1': 'jedna', '2': 'dva', '3': 'tři', '4': 'čtyři',
    '5': 'pět', '6': 'šest', '7': 'sedm', '8': 'osm', '9': 'devět',
    '10': 'deset', '11': 'jedenáct', '12': 'dvanáct', '13': 'třináct',
    '14': 'čtrnáct', '15': 'patnáct', '16': 'šestnáct', '17': 'sedmnáct',
    '18': 'osmnáct', '19': 'devatenáct', '20': 'dvacet',
    '21': 'dvacet jedna', '22': 'dvacet dva', '23': 'dvacet tři',
    '30': 'třicet', '40': 'čtyřicet', '50': 'padesát',
    '60': 'šedesát', '70': 'sedmdesát', '80': 'osmdesát', '90': 'devadesát',
    '100': 'sto', '1000': 'tisíc'
  };
  
  // Nahradit jednotlivá čísla slovy
  Object.entries(numberMap).forEach(([num, word]) => {
    const regex = new RegExp(`\\b${num}\\b`, 'g');
    processedText = processedText.replace(regex, word);
  });
  
  // Měny
  processedText = processedText.replace(/(\d+)\s*Kč/gi, '$1 korun českých');
  processedText = processedText.replace(/(\d+)\s*€/gi, '$1 eur');
  processedText = processedText.replace(/(\d+)\s*\$/gi, '$1 dolarů');
  
  // Procenta
  processedText = processedText.replace(/(\d+)\s*%/gi, '$1 procent');
  
  // Teploty
  processedText = processedText.replace(/(\d+)\s*°C/gi, '$1 stupňů celsia');
  
  // Časy
  processedText = processedText.replace(/(\d{1,2}):(\d{2})/g, '$1 hodin $2 minut');
  
  // Zkratky
  const abbreviations = {
    'atd': 'a tak dále', 'apod': 'a podobně', 'tj': 'to jest',
    'tzn': 'to znamená', 'např': 'například', 'resp': 'respektive',
    'tzv': 'takzvaný', 'AI': 'ajaj', 'API': 'á pé jaj'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // Cleanup speciálních znaků
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\*/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
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

    // 🎯 POUŽIJ CZECH PREPROCESSING
    const processedText = preprocessCzechTextForTTS(text);
    
    console.log('🎵 Czech TTS Processing:', {
      original: text.substring(0, 50),
      processed: processedText.substring(0, 50)
    });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/MpbYQvoTmXjHkaxtLiSh`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText, // 🎯 POŠLI PŘEDPRACOVANÝ TEXT
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
    console.log('✅ Czech TTS success!');
    
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