// api/voice.js - KOMPLETNÍ CZECH PREPROCESSING FIX
export const config = {
  runtime: 'edge',
}

// 🔢 CONVERT NUMBER TO CZECH WORDS
function convertNumberToWords(num) {
  if (num === 0) return 'nula';
  
  const ones = ['', 'jedna', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět'];
  const teens = ['deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct', 'osmnáct', 'devatenáct'];
  const tens = ['', '', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát'];
  const hundreds = ['', 'sto', 'dvě stě', 'tři sta', 'čtyři sta', 'pět set', 'šest set', 'sedm set', 'osm set', 'devět set'];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return hundreds[hundred] + (rest > 0 ? ' ' + convertNumberToWords(rest) : '');
  }
  
  // Pro tisíce
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    let result = '';
    
    if (thousands === 1) result += 'tisíc';
    else if (thousands < 5) result += convertNumberToWords(thousands) + ' tisíce';
    else result += convertNumberToWords(thousands) + ' tisíc';
    
    if (rest > 0) result += ' ' + convertNumberToWords(rest);
    return result;
  }
  
  return num.toString(); // Pro větší čísla vrať původní
}

// 🎯 KOMPLETNÍ CZECH PREPROCESSING - OPRAVUJE VŠE
function preprocessCzechTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  console.log('🔧 Original text:', text);
  
  // 🎯 OPRAVA MĚNY A DESETINNÝCH ČÍSEL
  // $176.6USD → "sto sedmdesát šest dolarů a šedesát centů"
  processedText = processedText.replace(/\$(\d+)\.(\d+)\s*USD/gi, (match, dollars, cents) => {
    const dollarWords = convertNumberToWords(parseInt(dollars));
    const centWords = convertNumberToWords(parseInt(cents));
    return `${dollarWords} dolarů a ${centWords} centů`;
  });
  
  // $176USD → "sto sedmdesát šest dolarů"
  processedText = processedText.replace(/\$(\d+)\s*USD/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} dolarů`;
  });
  
  // Obyčejné $176 → "sto sedmdesát šest dolarů"
  processedText = processedText.replace(/\$(\d+)/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} dolarů`;
  });
  
  // 🎯 OPRAVA EUR
  processedText = processedText.replace(/(\d+)\s*EUR/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} eur`;
  });
  
  // 🎯 OPRAVA ČESKÝCH KORUN
  processedText = processedText.replace(/(\d+)\s*Kč/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} korun českých`;
  });
  
  // 🎯 OPRAVA DOMÉN
  processedText = processedText.replace(/\.cz\b/gi, ' tečka cé zet');
  processedText = processedText.replace(/\.com\b/gi, ' tečka kom');
  processedText = processedText.replace(/\.org\b/gi, ' tečka org');
  processedText = processedText.replace(/\.net\b/gi, ' tečka net');
  
  // 🎯 OPRAVA DESETINNÝCH ČÍSEL (obecně)
  processedText = processedText.replace(/(\d+)\.(\d+)/g, (match, whole, decimal) => {
    const wholeWords = convertNumberToWords(parseInt(whole));
    const decimalWords = convertNumberToWords(parseInt(decimal));
    return `${wholeWords} celá ${decimalWords}`;
  });
  
  // 🎯 OPRAVA PROCENT
  processedText = processedText.replace(/(\d+)\s*%/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} procent`;
  });
  
  // 🎯 OPRAVA ZÁKLADNÍCH ČÍSEL (jen malá čísla pro plynulost)
  processedText = processedText.replace(/\b(\d{1,2})\b/g, (match, num) => {
    const number = parseInt(num);
    if (number >= 0 && number <= 30) {
      return convertNumberToWords(number);
    }
    return match; // Větší čísla nech být aby nebyl hlas moc pozměněný
  });
  
  // 🎯 ZKRATKY A SPECIÁLNÍ VÝRAZY
  const abbreviations = {
    'AI': 'ajaj',
    'API': 'á pé jaj',
    'URL': 'jů ár el',
    'HTTP': 'há té té pé',
    'HTTPS': 'há té té pé es',
    'HTML': 'há té em el',
    'CSS': 'cé es es',
    'JS': 'džej es',
    'např': 'například',
    'atd': 'a tak dále',
    'apod': 'a podobně',
    'tj': 'to jest',
    'tzn': 'to znamená',
    'resp': 'respektive',
    'tzv': 'takzvaný'
  };
  
  Object.entries(abbreviations).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  // 🎯 CLEANUP SPECIÁLNÍCH ZNAKŮ
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\*/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
  
  // Vyčisti vícenásobné mezery
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  console.log('🔧 Processed text:', processedText);
  
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

    // 🎯 POUŽIJ KOMPLETNÍ CZECH PREPROCESSING
    const processedText = preprocessCzechTextForTTS(text);
    
    console.log('🎵 Voice generation with preprocessing:', {
      originalLength: text.length,
      processedLength: processedText.length,
      voiceId: 'MpbYQvoTmXjHkaxtLiSh'
    });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/MpbYQvoTmXjHkaxtLiSh`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText, // 🎯 PŘEDPRACOVANÝ TEXT
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.85,        // Stabilita pro plynulý hlas
          similarity_boost: 0.8,  // Podobnost původnímu hlasu
          style: 0.2,            // Mírně expresivní
          use_speaker_boost: true // Zlepšení kvality
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs failed:', response.status, errorText);
      throw new Error(`ElevenLabs failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log('✅ Czech TTS with full preprocessing success!');
    
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