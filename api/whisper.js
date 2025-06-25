// api/whisper.js - BACKUP VERZE (vrať se k tomuto, pokud nová nefunguje)

export default async function handler(req, res) {
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
    console.log('🎙️ Whisper API call');

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

    console.log('🎵 Processing audio, size:', audioBuffer.length, 'bytes');

    // PŮVODNÍ FUNGUJÍCÍ ZPŮSOB
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    console.log('🔍 Using automatic language detection');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
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
    
    console.log('✅ Transcribed text:', data.text);

    if (!data.text) {
      return res.status(500).json({
        error: 'No transcription received'
      });
    }

    return res.status(200).json({
      success: true,
      text: data.text,
      language: data.language || 'unknown'
    });

  } catch (error) {
    console.error('💥 Whisper API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}