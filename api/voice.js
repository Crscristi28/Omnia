// api/voice.js - KOMPLETNÍ FIX BEZ ZBYTKOVÝCH MĚNOVÝCH ZKRATEK
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
  
  return num.toString();
}

// 🎯 KOMPLETNÍ CZECH PREPROCESSING - OPRAVUJE VŠE + ČISTÍ ZBYTKY
function preprocessCzechTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  console.log('🔧 Original text:', text);
  
  // 🎯 NEJDŘÍVE PROCENTA (před obecnými desetinnými čísly!)
  
  // 7.46% → "sedm celá čtyřicet šest procent"
  processedText = processedText.replace(/(\d+)\.(\d+)\s*%/gi, (match, whole, decimal) => {
    const wholeWords = convertNumberToWords(parseInt(whole));
    const decimalWords = convertNumberToWords(parseInt(decimal));
    return `${wholeWords} celá ${decimalWords} procent`;
  });
  
  // 7% → "sedm procent"
  processedText = processedText.replace(/(\d+)\s*%/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} procent`;
  });
  
  // 🎯 MĚNA S DESETINNÝMI MÍSTY (kompletní pokrytí)
  
  // $167.8USD → "sto šedesát sedm dolarů a osm centů"
  processedText = processedText.replace(/\$(\d+)\.(\d+)\s*USD/gi, (match, dollars, cents) => {
    const dollarWords = convertNumberToWords(parseInt(dollars));
    const centWords = convertNumberToWords(parseInt(cents));
    return `${dollarWords} dolarů a ${centWords} centů`;
  });
  
  // 167.8USD → "sto šedesát sedm dolarů a osm centů"
  processedText = processedText.replace(/(\d+)\.(\d+)\s*USD/gi, (match, dollars, cents) => {
    const dollarWords = convertNumberToWords(parseInt(dollars));
    const centWords = convertNumberToWords(parseInt(cents));
    return `${dollarWords} dolarů a ${centWords} centů`;
  });
  
  // $167.8 (bez USD) → "sto šedesát sedm dolarů a osm centů"
  processedText = processedText.replace(/\$(\d+)\.(\d+)(?!\s*USD)/gi, (match, dollars, cents) => {
    const dollarWords = convertNumberToWords(parseInt(dollars));
    const centWords = convertNumberToWords(parseInt(cents));
    return `${dollarWords} dolarů a ${centů} centů`;
  });
  
  // 167.8 EUR → "sto šedesát sedm eur a osm centů"
  processedText = processedText.replace(/(\d+)\.(\d+)\s*EUR/gi, (match, euros, cents) => {
    const euroWords = convertNumberToWords(parseInt(euros));
    const centWords = convertNumberToWords(parseInt(cents));
    return `${euroWords} eur a ${centWords} centů`;
  });
  
  // 167.8 Kč → "sto šedesát sedm korun a osm haléřů"
  processedText = processedText.replace(/(\d+)\.(\d+)\s*Kč/gi, (match, crowns, haleru) => {
    const crownWords = convertNumberToWords(parseInt(crowns));
    const haleruWords = convertNumberToWords(parseInt(haleru));
    return `${crownWords} korun a ${haleruWords} haléřů`;
  });
  
  // 🎯 MĚNA BEZ DESETIN
  
  // $167USD → "sto šedesát sedm dolarů"
  processedText = processedText.replace(/\$(\d+)\s*USD/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} dolarů`;
  });
  
  // $167 (bez USD) → "sto šedesát sedm dolarů"
  processedText = processedText.replace(/\$(\d+)(?!\.\d)/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} dolarů`;
  });
  
  // 167 USD → "sto šedesát sedm dolarů"
  processedText = processedText.replace(/(\d+)\s*USD/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} dolarů`;
  });
  
  // 167 EUR → "sto šedesát sedm eur"
  processedText = processedText.replace(/(\d+)\s*EUR/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} eur`;
  });
  
  // 167 Kč → "sto šedesát sedm korun českých"
  processedText = processedText.replace(/(\d+)\s*Kč/gi, (match, amount) => {
    const words = convertNumberToWords(parseInt(amount));
    return `${words} korun českých`;
  });
  
  // 🎯 KONTEXTOVÁ DETEKCE CENY
  processedText = processedText.replace(/(za|stojí|obchoduje za|cena je|cena)\s+(\d+)\.(\d+)/gi, (match, prefix, whole, decimal) => {
    const wholeWords = convertNumberToWords(parseInt(whole));
    const decimalWords = convertNumberToWords(parseInt(decimal));
    return `${prefix} ${wholeWords} dolarů a ${decimalWords} centů`;
  });
  
  // 🎯 DOMÉNY
  processedText = processedText.replace(/\.cz\b/gi, ' tečka cé zet');
  processedText = processedText.replace(/\.com\b/gi, ' tečka kom');
  processedText = processedText.replace(/\.org\b/gi, ' tečka org');
  processedText = processedText.replace(/\.net\b/gi, ' tečka net');
  processedText = processedText.replace(/\.co\b/gi, ' tečka ko');
  
  // 🎯 OBECNÉ DESETINNÉ ČÍSLA (pokud nejsou měna ani procenta)
  processedText = processedText.replace(/(\d+)\.(\d+)/g, (match, whole, decimal) => {
    const wholeWords = convertNumberToWords(parseInt(whole));
    const decimalWords = convertNumberToWords(parseInt(decimal));
    return `${wholeWords} celá ${decimalWords}`;
  });
  
  // 🎯 ZÁKLADNÍ ČÍSLA (jen malá pro plynulost)
  processedText = processedText.replace(/\b(\d{1,2})\b/g, (match, num) => {
    const number = parseInt(num);
    if (number >= 0 && number <= 20) {
      return convertNumberToWords(number);
    }
    return match;
  });
  
  // 🎯 ZKRATKY
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
  
  // 🎯 VYČISTI ZBYTKOVÉ MĚNOVÉ ZKRATKY (KLÍČOVÁ OPRAVA!)
  processedText = processedText.replace(/\s*USD\b/gi, '');
  processedText = processedText.replace(/\s*EUR\b/gi, '');
  processedText = processedText.replace(/\s*CZK\b/gi, '');
  
  // 🎯 CLEANUP
  processedText = processedText.replace(/\.\.\./g, ', pauza,');
  processedText = processedText.replace(/--/g, ', pauza,');
  processedText = processedText.replace(/\*/g, '');
  processedText = processedText.replace(/#{1,6}/g, '');
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

    // 🎯 POUŽIJ KOMPLETNÍ PREPROCESSING S CLEANUP
    const processedText = preprocessCzechTextForTTS(text);
    
    console.log('🎵 Final voice generation:', {
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
        text: processedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.85,
          similarity_boost: 0.8,
          style: 0.2,
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
    console.log('✅ Perfect Czech TTS success!');
    
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