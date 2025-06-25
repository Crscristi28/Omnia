// api/whisper.js - NEJJEDNODUŠŠÍ VERZE (backup)

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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OpenAI API key není nastaven'
      });
    }

    // Simulace úspěšného rozpoznání (pro testing)
    return res.status(200).json({
      success: true,
      text: "Test zpráva z Whisper API",
      language: 'cs',
      message: 'Řeč úspěšně rozpoznána'
    });

  } catch (error) {
    console.error('Whisper API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}