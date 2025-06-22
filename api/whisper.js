// api/whisper.js - OpenAI Whisper Speech-to-Text API

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
    console.log('🎙️ Whisper STT API call');

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

    console.log('🎵 Přepisuji audio, velikost:', audioBuffer.length, 'bytes');

    // Vytvoř FormData pro Whisper API
    const formData = new FormData();
    
    // Vytvoř Blob z audio buffer
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'cs'); // Čeština
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
    console.log('✅ Text přepsán:', data.text);

    if (!data.text) {
      return res.status(500).json({
        error: 'No transcription received'
      });
    }

    return res.status(200).json({
      success: true,
      text: data.text,
      language: data.language || 'cs'
    });

  } catch (error) {
    console.error('💥 Whisper API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}