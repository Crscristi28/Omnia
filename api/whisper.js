// api/whisper.js - Enhanced OpenAI Whisper with Multilingual Support

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept-Language');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎙️ Enhanced Multilingual Whisper STT API call');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OpenAI API key není nastaven'
      });
    }

    // Získej audio data z body
    const audioBuffer = req.body;
    
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Audio data musí být poskytnut' 
      });
    }

    // 🌍 ENHANCED: Get preferred language from headers (optional)
    const acceptLanguage = req.headers['accept-language'];
    const preferredLanguage = acceptLanguage && acceptLanguage !== 'auto' ? acceptLanguage : null;

    console.log('🎵 Processing audio, size:', audioBuffer.length, 'bytes');
    console.log('🌍 Preferred language:', preferredLanguage || 'AUTO-DETECT');

    // Vytvoř FormData pro Whisper API
    const formData = new FormData();
    
    // Vytvoř Blob z audio buffer
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // 🎯 KLÍČOVÁ ZMĚNA: Conditional language parameter
    // Pokud není specifikován jazyk, Whisper automaticky detekuje
    if (preferredLanguage) {
      formData.append('language', preferredLanguage);
      console.log('🎯 Using preferred language:', preferredLanguage);
    } else {
      console.log('🔍 Using automatic language detection');
    }
    
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    });

    console.log('📡 Whisper response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Whisper API error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'Whisper API error',
        status: response.status,
        details: errorText 
      });
    }

    const data = await response.json();
    
    // 🌍 ENHANCED: Log detected language and text
    const detectedLanguage = data.language || 'unknown';
    console.log('✅ Detected language:', detectedLanguage);
    console.log('✅ Transcribed text:', data.text);

    if (!data.text) {
      return res.status(500).json({
        error: 'No transcription received'
      });
    }

    // 🎯 ENHANCED: Return both text and detected language
    return res.status(200).json({
      success: true,
      text: data.text,
      language: detectedLanguage,
      confidence: data.confidence || null,
      duration: data.duration || null
    });

  } catch (error) {
    console.error('💥 Enhanced Whisper API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🌍 ENHANCED: Language mapping for common languages
const SUPPORTED_LANGUAGES = {
  'cs': 'čeština',
  'en': 'English', 
  'de': 'Deutsch',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'pl': 'Polski',
  'ru': 'Русский',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文'
};

// Export language mapping for potential use
export { SUPPORTED_LANGUAGES };