// api/whisper.js - KOMPLETNĚ OPRAVENÝ Whisper API

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎙️ Whisper API - Multilingual Speech Recognition');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'OpenAI API key není nastaven'
      });
    }

    // Získej audio buffer z requestu
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      console.error('❌ No audio data received');
      return res.status(400).json({ 
        error: 'No audio data',
        message: 'Audio data nebyla přijata' 
      });
    }

    console.log('📊 Audio buffer size:', audioBuffer.length, 'bytes');

    // 🎯 KLÍČOVÁ OPRAVA: Proper FormData handling
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Vytvoř audio stream z bufferu
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json'); // 🔧 OPRAVENO: verbose pro více info
    
    // 🌍 AUTOMATICKÁ DETEKCE JAZYKA - bez language parametru
    console.log('🔍 Using automatic language detection');

    // API call k OpenAI Whisper
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📡 Whisper API response status:', whisperResponse.status);

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ Whisper API error:', whisperResponse.status, errorText);
      
      return res.status(whisperResponse.status).json({ 
        error: 'Whisper API failed',
        status: whisperResponse.status,
        message: 'Rozpoznávání řeči selhalo',
        details: errorText 
      });
    }

    const whisperData = await whisperResponse.json();
    console.log('🎯 Whisper response:', whisperData);

    // 🌍 DETEKCE JAZYKA A TEXT
    const transcribedText = whisperData.text;
    const detectedLanguage = whisperData.language || 'unknown';
    const confidence = whisperData.confidence || null;

    console.log('✅ Transcribed text:', transcribedText);
    console.log('🌍 Detected language:', detectedLanguage);
    console.log('📊 Confidence:', confidence);

    if (!transcribedText || transcribedText.trim().length === 0) {
      console.warn('⚠️ Empty transcription received');
      return res.status(200).json({
        success: false,
        text: '',
        language: detectedLanguage,
        message: 'Žádný text nebyl rozpoznán'
      });
    }

    // 🎯 ÚSPĚŠNÁ ODPOVĚĎ
    return res.status(200).json({
      success: true,
      text: transcribedText.trim(),
      language: detectedLanguage,
      confidence: confidence,
      duration: whisperData.duration || null,
      message: 'Řeč úspěšně rozpoznána'
    });

  } catch (error) {
    console.error('💥 Whisper API Critical Error:', error);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Chyba při rozpoznávání řeči',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
}

// 🌍 LANGUAGE MAPPING pro UI
export const SUPPORTED_LANGUAGES = {
  'cs': 'Čeština',
  'sk': 'Slovenčina', 
  'en': 'English',
  'de': 'Deutsch',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'pl': 'Polski',
  'ru': 'Русский',
  'uk': 'Українська',
  'ro': 'Română',
  'hu': 'Magyar',
  'nl': 'Nederlands',
  'pt': 'Português',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'tr': 'Türkçe',
  'sv': 'Svenska',
  'no': 'Norsk',
  'da': 'Dansk',
  'fi': 'Suomi'
};

// 🎯 DEBUG HELPER
export const debugWhisper = (audioSize, detectedLang, text) => {
  console.log('🔍 WHISPER DEBUG:');
  console.log('📊 Audio size:', audioSize, 'bytes');
  console.log('🌍 Language:', detectedLang);
  console.log('📝 Text length:', text?.length || 0);
  console.log('✅ Text preview:', text?.substring(0, 100) || 'EMPTY');
};