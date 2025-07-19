// api/google-stt.js - GOOGLE SPEECH-TO-TEXT FALLBACK
// 🎤 Google Cloud STT with same functionality as ElevenLabs STT
// ✅ Maintains exact same response format and language detection

export const config = {
  runtime: 'edge',
  maxDuration: 30,
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
    console.log('🎤 Google STT API called');

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      console.error('❌ Google API key missing');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuration error',
          message: 'Google API key není nastaven'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audio data from request body
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

    // 🔧 ENHANCED: Better size validation (same as ElevenLabs)
    const audioSizeKB = Math.round(audioBuffer.byteLength / 1024);
    console.log('🎵 Audio data received:', {
      size: audioBuffer.byteLength,
      sizeKB: audioSizeKB,
      sizeMB: Math.round(audioSizeKB / 1024 * 100) / 100
    });

    // 🔧 Reject too small files (likely silence/noise)
    if (audioBuffer.byteLength < 1000) { // Less than 1KB
      console.warn('⚠️ Audio file too small - likely silence');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Audio too short',
          message: 'Audio nahrávka je příliš krátká nebo tichá'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔧 Reject too large files (Google limit is 10MB for sync)
    if (audioBuffer.byteLength > 10 * 1024 * 1024) { // 10MB limit
      console.warn('⚠️ Audio file too large');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Audio too large',
          message: 'Audio nahrávka je příliš velká (max 10MB)'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔧 Smart audio encoding detection and conversion
    const audioEncoding = detectGoogleAudioEncoding(audioBuffer);
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // 🔧 Detect sample rate from encoding type (iOS PWA uses 44100, others 16000)
    const sampleRate = (audioEncoding === 'MP4') ? 44100 : 16000;
    
    console.log('🎵 Audio analysis:', {
      encoding: audioEncoding,
      sampleRate: sampleRate,
      audioSize: audioBuffer.byteLength
    });

    // 🔧 Google STT request with optimized settings
    const sttRequest = {
      config: {
        encoding: audioEncoding,
        sampleRateHertz: sampleRate, // Dynamic rate based on device
        languageCode: 'cs-CZ', // Default to Czech, auto-detect will override
        alternativeLanguageCodes: ['en-US', 'ro-RO'], // Support other languages
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        maxAlternatives: 1,
        profanityFilter: false,
        useEnhanced: true, // Use enhanced model for better accuracy
        model: 'latest_long', // Best model for speech recognition
      },
      audio: {
        content: base64Audio
      }
    };

    console.log('📤 Sending to Google STT API...');

    const googleResponse = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sttRequest)
      }
    );

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('❌ Google STT API error:', {
        status: googleResponse.status,
        statusText: googleResponse.statusText,
        error: errorText
      });
      
      // 🔧 Better error messages (same format as ElevenLabs)
      const errorMessage = getLocalizedErrorMessage(googleResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Google STT API failed',
          message: errorMessage,
          details: errorText,
          retryable: isRetryableError(googleResponse.status)
        }), 
        { status: googleResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sttResult = await googleResponse.json();
    
    // 🔧 Extract transcription from Google response
    if (!sttResult.results || sttResult.results.length === 0 || 
        !sttResult.results[0].alternatives || sttResult.results[0].alternatives.length === 0) {
      console.warn('⚠️ Google returned empty transcription');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Empty transcription',
          message: 'Nepodařilo se rozpoznat žádný text',
          details: 'Zkuste mluvit hlasitěji nebo blíže k mikrofonu'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bestResult = sttResult.results[0].alternatives[0];
    const transcriptText = bestResult.transcript || '';
    const confidence = bestResult.confidence || 0.85;

    if (!transcriptText.trim()) {
      console.warn('⚠️ Google returned empty text');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Empty transcription',
          message: 'Nepodařilo se rozpoznat žádný text',
          details: 'Zkuste mluvit hlasitěji nebo blíže k mikrofonu'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Google STT transcription successful:', {
      text: transcriptText?.substring(0, 100) + '...',
      textLength: transcriptText?.length || 0,
      confidence: confidence
    });

    // 🔧 Enhanced language detection (same logic as ElevenLabs)
    const detectedLanguage = enhancedLanguageDetection(transcriptText, null);
    
    // 🔧 Text post-processing (same logic as ElevenLabs)
    const cleanedText = postProcessTranscription(transcriptText, detectedLanguage);

    // 🔧 Extract word timestamps for compatibility
    const words = bestResult.words || [];

    // 🔧 Return EXACT same format as ElevenLabs STT for compatibility
    return new Response(
      JSON.stringify({
        success: true,
        text: cleanedText,
        language: detectedLanguage,
        confidence: confidence,
        message: 'Řeč úspěšně rozpoznána pomocí Google STT',
        details: {
          service: 'google_stt',
          originalLanguage: 'auto-detected',
          detectedLanguage: detectedLanguage,
          audioSize: audioSizeKB,
          words: words,
          originalText: transcriptText
        }
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Google STT unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Speech recognition failed',
        message: 'Google rozpoznávání řeči selhalo - zkuste to znovu',
        details: error.message,
        retryable: true
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// 🔧 Detect Google audio encoding from buffer
function detectGoogleAudioEncoding(audioBuffer) {
  const uint8Array = new Uint8Array(audioBuffer.slice(0, 12));
  
  // Check for WebM signature
  if (uint8Array[0] === 0x1A && uint8Array[1] === 0x45 && uint8Array[2] === 0xDF && uint8Array[3] === 0xA3) {
    return 'WEBM_OPUS';
  }
  
  // Check for MP4 signature
  if (uint8Array[4] === 0x66 && uint8Array[5] === 0x74 && uint8Array[6] === 0x79 && uint8Array[7] === 0x70) {
    return 'MP4';
  }
  
  // Check for WAV signature
  if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46) {
    return 'LINEAR16';
  }
  
  // 🔧 Try to detect OGG Opus (alternative WebM format)
  if (uint8Array[0] === 0x4F && uint8Array[1] === 0x67 && uint8Array[2] === 0x67 && uint8Array[3] === 0x53) {
    return 'OGG_OPUS';
  }
  
  // Default fallback - prefer LINEAR16 for better compatibility
  return 'LINEAR16';
}

// 🔧 Enhanced language detection combining text analysis (SAME AS ELEVENLABS)
function enhancedLanguageDetection(text, originalLanguage) {
  if (!text) return 'cs';
  
  const lowerText = text.toLowerCase().trim();
  
  // Strong indicators for explicit language requests
  const explicitCzech = ['mluvte česky', 'v češtině', 'česká odpověď', 'přepni na češtinu'];
  const explicitEnglish = ['speak english', 'in english', 'switch to english', 'english please'];
  const explicitRomanian = ['vorbește română', 'în română', 'schimbă la română'];
  
  for (const phrase of explicitCzech) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  for (const phrase of explicitEnglish) {
    if (lowerText.includes(phrase)) return 'en';
  }
  for (const phrase of explicitRomanian) {
    if (lowerText.includes(phrase)) return 'ro';
  }
  
  // Enhanced word-based detection (real-world no-diacritics support)
  const czechWords = ['muzes', 'muzeme', 'dekuji', 'prosim', 'ahoj', 'jsem', 'jsi', 'mas', 'jak', 'co', 'kde'];
  const englishWords = ['what', 'how', 'where', 'when', 'why', 'doing', 'think', 'help', 'please', 'the', 'and'];
  const romanianWords = ['ce', 'cum', 'unde', 'faci', 'esti', 'sunt', 'multumesc', 'salut', 'cine', 'sa', 'si'];
  
  const czechCount = czechWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
  const romanianCount = romanianWords.filter(word => lowerText.includes(word)).length;
  
  const maxCount = Math.max(czechCount, englishCount, romanianCount);
  
  if (maxCount >= 2) {
    if (czechCount === maxCount) return 'cs';
    if (englishCount === maxCount) return 'en';
    if (romanianCount === maxCount) return 'ro';
  }
  
  return 'cs'; // Safe default
}

// 🔧 Post-process transcription for better quality (SAME AS ELEVENLABS)
function postProcessTranscription(text, language) {
  if (!text) return '';
  
  let cleaned = text.trim();
  
  // Remove common STT artifacts
  cleaned = cleaned.replace(/\[.*?\]/g, ''); // Remove [bracketed] content
  cleaned = cleaned.replace(/\(.*?\)/g, ''); // Remove (parenthetical) content
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize whitespace
  
  // Language-specific cleaning
  switch (language) {
    case 'cs':
      // Czech-specific post-processing
      cleaned = cleaned.replace(/\buum\b/gi, ''); // Remove filler words
      cleaned = cleaned.replace(/\behm\b/gi, '');
      break;
    case 'en':
      // English-specific post-processing
      cleaned = cleaned.replace(/\buh\b/gi, ''); // Remove filler words
      cleaned = cleaned.replace(/\bum\b/gi, '');
      break;
    case 'ro':
      // Romanian-specific post-processing
      cleaned = cleaned.replace(/\beh\b/gi, ''); // Remove filler words
      break;
  }
  
  return cleaned.trim();
}

// 🔧 Better error messages (SAME AS ELEVENLABS)
function getLocalizedErrorMessage(status, errorText) {
  switch (status) {
    case 400:
      return 'Neplatný audio formát - zkuste jiný typ nahrávky';
    case 413:
      return 'Audio soubor je příliš velký - zkuste kratší nahrávku';
    case 429:
      return 'Příliš mnoho požadavků - zkuste to za chvíli';
    case 500:
    case 502:
    case 503:
      return 'Chyba Google serveru - zkuste to znovu za chvíli';
    default:
      return `Chyba rozpoznávání řeči (${status}) - zkuste to znovu`;
  }
}

// 🔧 Check if error is retryable (SAME AS ELEVENLABS)
function isRetryableError(status) {
  // Retryable errors: server errors, rate limits, timeouts
  return [429, 500, 502, 503, 504].includes(status);
}