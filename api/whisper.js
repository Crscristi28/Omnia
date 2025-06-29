// api/whisper.js - ENHANCED SPEECH-TO-TEXT for Voice-to-Voice
export const config = {
  runtime: 'edge',
  maxDuration: 30, // 30s max pro dlouhé nahrávky
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
    console.log('🎤 Enhanced Whisper API called');

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

    // 🔧 ENHANCED: Better size validation
    const audioSizeKB = Math.round(audioBuffer.byteLength / 1024);
    console.log('🎵 Audio data received:', {
      size: audioBuffer.byteLength,
      sizeKB: audioSizeKB,
      sizeMB: Math.round(audioSizeKB / 1024 * 100) / 100
    });

    // 🔧 ENHANCED: Reject too small files (likely silence/noise)
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

    // 🔧 ENHANCED: Reject too large files (>25MB Whisper limit)
    if (audioBuffer.byteLength > 25 * 1024 * 1024) { // 25MB limit
      console.warn('⚠️ Audio file too large');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Audio too large',
          message: 'Audio nahrávka je příliš velká (max 25MB)'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔧 ENHANCED: Smart MIME type detection
    const audioBlob = new Blob([audioBuffer], { 
      type: detectAudioMimeType(audioBuffer)
    });
    
    // Vytvoř FormData pro Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, getAudioFileName(audioBuffer));
    formData.append('model', 'whisper-1');
    
    // 🔧 ENHANCED: Remove fixed language - let Whisper auto-detect
    // formData.append('language', 'cs'); // Odstraněno - lepší auto-detekce
    
    formData.append('response_format', 'verbose_json'); // 🆕 Get confidence + language info
    
    // 🆕 ENHANCED: Add prompt for better recognition
    const prompt = getRecognitionPrompt();
    if (prompt) {
      formData.append('prompt', prompt);
    }

    console.log('📤 Sending to OpenAI Whisper with enhanced settings...');

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
      
      // 🔧 ENHANCED: Better error messages
      const errorMessage = getLocalizedErrorMessage(whisperResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Whisper API failed',
          message: errorMessage,
          details: errorText,
          retryable: isRetryableError(whisperResponse.status)
        }), 
        { status: whisperResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const whisperResult = await whisperResponse.json();
    
    // 🔧 ENHANCED: Better result validation
    if (!whisperResult.text || whisperResult.text.trim().length === 0) {
      console.warn('⚠️ Whisper returned empty text');
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

    console.log('✅ Whisper transcription successful:', {
      text: whisperResult.text?.substring(0, 100) + '...',
      textLength: whisperResult.text?.length || 0,
      language: whisperResult.language,
      duration: whisperResult.duration,
      confidence: calculateConfidence(whisperResult)
    });

    // 🔧 ENHANCED: Better language detection
    const detectedLanguage = enhancedLanguageDetection(whisperResult.text, whisperResult.language);
    const confidence = calculateConfidence(whisperResult);
    
    // 🔧 ENHANCED: Text post-processing
    const cleanedText = postProcessTranscription(whisperResult.text, detectedLanguage);

    return new Response(
      JSON.stringify({
        success: true,
        text: cleanedText,
        language: detectedLanguage,
        confidence: confidence,
        message: 'Řeč úspěšně rozpoznána',
        details: {
          originalLanguage: whisperResult.language || 'unknown',
          detectedLanguage: detectedLanguage,
          duration: whisperResult.duration || 0,
          originalText: whisperResult.text,
          audioSize: audioSizeKB
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
        message: 'Rozpoznávání řeči selhalo - zkuste to znovu',
        details: error.message,
        retryable: true
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// 🔧 ENHANCED: Smart MIME type detection
function detectAudioMimeType(audioBuffer) {
  const uint8Array = new Uint8Array(audioBuffer.slice(0, 12));
  
  // Check for WebM signature
  if (uint8Array[0] === 0x1A && uint8Array[1] === 0x45 && uint8Array[2] === 0xDF && uint8Array[3] === 0xA3) {
    return 'audio/webm';
  }
  
  // Check for MP4 signature
  if (uint8Array[4] === 0x66 && uint8Array[5] === 0x74 && uint8Array[6] === 0x79 && uint8Array[7] === 0x70) {
    return 'audio/mp4';
  }
  
  // Check for WAV signature
  if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46) {
    return 'audio/wav';
  }
  
  // Default fallback
  return 'audio/webm';
}

// 🔧 ENHANCED: Smart filename generation
function getAudioFileName(audioBuffer) {
  const mimeType = detectAudioMimeType(audioBuffer);
  
  switch (mimeType) {
    case 'audio/mp4':
      return 'audio.m4a';
    case 'audio/wav':
      return 'audio.wav';
    case 'audio/webm':
    default:
      return 'audio.webm';
  }
}

// 🆕 ENHANCED: Recognition prompts for better accuracy
function getRecognitionPrompt() {
  // Prompt helps Whisper understand context and improve accuracy
  return "OMNIA, AI asistent, chat, conversation, česky, English, română, technologie, umělá inteligence, speech-to-text";
}

// 🔧 ENHANCED: Better language detection combining Whisper + text analysis
function enhancedLanguageDetection(text, whisperLanguage) {
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
  
  // Enhanced word-based detection
  const czechWords = ['že', 'který', 'být', 'mít', 'se', 'na', 'do', 'od', 'co', 'jak', 'kde', 'ano', 'ne', 'prosím', 'děkuji'];
  const englishWords = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'this', 'have', 'from', 'but', 'not'];
  const romanianWords = ['și', 'de', 'la', 'cu', 'în', 'pe', 'că', 'ce', 'să', 'nu', 'un', 'o', 'pentru', 'despre'];
  
  const czechCount = czechWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
  const romanianCount = romanianWords.filter(word => lowerText.includes(word)).length;
  
  const maxCount = Math.max(czechCount, englishCount, romanianCount);
  
  if (maxCount >= 2) {
    if (czechCount === maxCount) return 'cs';
    if (englishCount === maxCount) return 'en';
    if (romanianCount === maxCount) return 'ro';
  }
  
  // Fallback to Whisper's detection if confident enough
  if (whisperLanguage && ['cs', 'en', 'ro'].includes(whisperLanguage)) {
    return whisperLanguage;
  }
  
  // Map common Whisper language codes
  const languageMap = {
    'czech': 'cs',
    'english': 'en',
    'romanian': 'ro',
    'cz': 'cs',
    'us': 'en',
    'gb': 'en'
  };
  
  if (whisperLanguage && languageMap[whisperLanguage.toLowerCase()]) {
    return languageMap[whisperLanguage.toLowerCase()];
  }
  
  return 'cs'; // Safe default
}

// 🔧 ENHANCED: Calculate confidence from Whisper result
function calculateConfidence(whisperResult) {
  // Whisper doesn't provide confidence directly, so we estimate
  if (!whisperResult.text) return 0;
  
  const textLength = whisperResult.text.trim().length;
  const duration = whisperResult.duration || 1;
  
  // Longer text with reasonable duration = higher confidence
  if (textLength < 5) return 0.3; // Very short text
  if (textLength < 15) return 0.6; // Short text
  if (textLength < 50) return 0.8; // Medium text
  
  // Good length text
  return Math.min(0.95, 0.7 + (textLength / 100) * 0.2);
}

// 🔧 ENHANCED: Post-process transcription for better quality
function postProcessTranscription(text, language) {
  if (!text) return '';
  
  let cleaned = text.trim();
  
  // Remove common Whisper artifacts
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

// 🔧 ENHANCED: Better error messages
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
      return 'Chyba serveru - zkuste to znovu za chvíli';
    default:
      return `Chyba rozpoznávání řeči (${status}) - zkuste to znovu`;
  }
}

// 🔧 ENHANCED: Check if error is retryable
function isRetryableError(status) {
  // Retryable errors: server errors, rate limits, timeouts
  return [429, 500, 502, 503, 504].includes(status);
}