// api/whisper.js - FINÁLNÍ OPRAVA PRO HTTP 400

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
    console.log('🎙️ Whisper API called');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OpenAI API key není nastaven'
      });
    }

    // 🔧 OPRAVENO: Čtení binary dat z Node.js request
    let audioBuffer;
    
    if (req.body) {
      // Pokud už je req.body Buffer
      audioBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    } else {
      // Fallback: čtení z raw streamu
      const chunks = [];
      
      await new Promise((resolve, reject) => {
        req.on('data', chunk => {
          chunks.push(chunk);
        });
        
        req.on('end', () => {
          resolve();
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        // Timeout po 10 sekundách
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000);
      });
      
      audioBuffer = Buffer.concat(chunks);
    }
    
    if (!audioBuffer || audioBuffer.length === 0) {
      console.error('❌ No audio data received');
      return res.status(400).json({ 
        error: 'No audio data',
        message: 'Audio data nebyla přijata' 
      });
    }

    console.log('📊 Audio buffer size:', audioBuffer.length, 'bytes');

    // 🔧 OPRAVENO: Použití form-data package (Node.js compatible)
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Přidej audio jako stream
    formData.append('file', audioBuffer, {
      filename: 'recording.webm',
      contentType: 'audio/webm',
      knownLength: audioBuffer.length
    });
    
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    console.log('🔍 Sending to OpenAI Whisper...');

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

    // Získej text a jazyk
    const transcribedText = whisperData.text;
    const detectedLanguage = whisperData.language || 'unknown';

    console.log('✅ Transcribed text:', transcribedText);
    console.log('🌍 Detected language:', detectedLanguage);

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