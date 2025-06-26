// 🌍 GLOBAL GOOGLE TTS - UNLIMITED LANGUAGES
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY;
  
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ 
      success: false,
      error: 'Google TTS API key not configured' 
    });
  }

  const { text, language = 'cs', voice = 'natural' } = req.body;

  if (!text) {
    return res.status(400).json({ 
      success: false,
      error: 'Text is required' 
    });
  }

  try {
    // 🌍 GLOBAL LANGUAGE MAPPING - Auto-detects best voice
    const languageMapping = {
      // European Languages
      'cs': { code: 'cs-CZ', voice: 'cs-CZ-Neural2-A', name: 'Czech' },
      'en': { code: 'en-US', voice: 'en-US-Neural2-C', name: 'English (US)' },
      'ro': { code: 'ro-RO', voice: 'ro-RO-Neural2-A', name: 'Romanian' },
      'de': { code: 'de-DE', voice: 'de-DE-Neural2-A', name: 'German' },
      'es': { code: 'es-ES', voice: 'es-ES-Neural2-A', name: 'Spanish' },
      'fr': { code: 'fr-FR', voice: 'fr-FR-Neural2-A', name: 'French' },
      'it': { code: 'it-IT', voice: 'it-IT-Neural2-A', name: 'Italian' },
      'pl': { code: 'pl-PL', voice: 'pl-PL-Neural2-A', name: 'Polish' },
      'pt': { code: 'pt-PT', voice: 'pt-PT-Neural2-A', name: 'Portuguese' },
      'nl': { code: 'nl-NL', voice: 'nl-NL-Neural2-A', name: 'Dutch' },
      'sv': { code: 'sv-SE', voice: 'sv-SE-Neural2-A', name: 'Swedish' },
      'da': { code: 'da-DK', voice: 'da-DK-Neural2-A', name: 'Danish' },
      'no': { code: 'nb-NO', voice: 'nb-NO-Neural2-A', name: 'Norwegian' },
      'fi': { code: 'fi-FI', voice: 'fi-FI-Neural2-A', name: 'Finnish' },
      'hu': { code: 'hu-HU', voice: 'hu-HU-Neural2-A', name: 'Hungarian' },
      'sk': { code: 'sk-SK', voice: 'sk-SK-Neural2-A', name: 'Slovak' },
      
      // Asian Languages
      'ja': { code: 'ja-JP', voice: 'ja-JP-Neural2-B', name: 'Japanese' },
      'ko': { code: 'ko-KR', voice: 'ko-KR-Neural2-A', name: 'Korean' },
      'zh': { code: 'zh-CN', voice: 'zh-CN-Neural2-A', name: 'Chinese (Simplified)' },
      'zh-tw': { code: 'zh-TW', voice: 'zh-TW-Neural2-A', name: 'Chinese (Traditional)' },
      'hi': { code: 'hi-IN', voice: 'hi-IN-Neural2-A', name: 'Hindi' },
      'th': { code: 'th-TH', voice: 'th-TH-Neural2-A', name: 'Thai' },
      'vi': { code: 'vi-VN', voice: 'vi-VN-Neural2-A', name: 'Vietnamese' },
      
      // Other Global Languages
      'ar': { code: 'ar-XA', voice: 'ar-XA-Neural2-A', name: 'Arabic' },
      'ru': { code: 'ru-RU', voice: 'ru-RU-Neural2-A', name: 'Russian' },
      'tr': { code: 'tr-TR', voice: 'tr-TR-Neural2-A', name: 'Turkish' },
      'he': { code: 'he-IL', voice: 'he-IL-Neural2-A', name: 'Hebrew' },
      'uk': { code: 'uk-UA', voice: 'uk-UA-Neural2-A', name: 'Ukrainian' },
      'bg': { code: 'bg-BG', voice: 'bg-BG-Neural2-A', name: 'Bulgarian' },
      'hr': { code: 'hr-HR', voice: 'hr-HR-Neural2-A', name: 'Croatian' },
      'sr': { code: 'sr-RS', voice: 'sr-RS-Neural2-A', name: 'Serbian' },
      
      // Alternative English variants
      'en-gb': { code: 'en-GB', voice: 'en-GB-Neural2-A', name: 'English (UK)' },
      'en-au': { code: 'en-AU', voice: 'en-AU-Neural2-A', name: 'English (Australia)' },
      'en-in': { code: 'en-IN', voice: 'en-IN-Neural2-A', name: 'English (India)' },
      
      // Alternative Spanish variants
      'es-mx': { code: 'es-MX', voice: 'es-MX-Neural2-A', name: 'Spanish (Mexico)' },
      'es-ar': { code: 'es-AR', voice: 'es-AR-Neural2-A', name: 'Spanish (Argentina)' },
      
      // Portuguese variants
      'pt-br': { code: 'pt-BR', voice: 'pt-BR-Neural2-A', name: 'Portuguese (Brazil)' }
    };

    // Get language config (fallback to Czech if not found)
    const langConfig = languageMapping[language.toLowerCase()] || languageMapping['cs'];
    
    console.log('🎵 Google TTS request:', { 
      inputLanguage: language,
      detectedConfig: langConfig,
      textLength: text.length 
    });

    // 🎤 VOICE SELECTION LOGIC
    let selectedVoice = langConfig.voice;
    
    // Allow voice customization
    if (voice && voice !== 'natural') {
      // Custom voice format: "Neural2-A", "Neural2-B", "Wavenet-A", etc.
      const voicePrefix = langConfig.code;
      selectedVoice = `${voicePrefix}-${voice}`;
    }

    // Google TTS API call with optimized settings
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { 
            languageCode: langConfig.code,
            name: selectedVoice
          },
          audioConfig: { 
            audioEncoding: 'MP3',
            speakingRate: 1.0,  // Normal speed
            pitch: 0.0,        // Normal pitch
            volumeGainDb: 0.0,  // Normal volume
            effectsProfileId: ['headphone-class-device'] // Optimized for headphones
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Google TTS API error:', data);
      
      // Try fallback with Standard voice if Neural2 fails
      if (selectedVoice.includes('Neural2')) {
        console.log('🔄 Retrying with Standard voice...');
        const fallbackVoice = selectedVoice.replace('Neural2', 'Standard');
        
        const fallbackResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text },
              voice: { 
                languageCode: langConfig.code,
                name: fallbackVoice
              },
              audioConfig: { 
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0
              }
            })
          }
        );

        const fallbackData = await fallbackResponse.json();
        
        if (fallbackResponse.ok && fallbackData.audioContent) {
          const audioBuffer = Buffer.from(fallbackData.audioContent, 'base64');
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', audioBuffer.length);
          res.status(200).send(audioBuffer);
          
          console.log('✅ Google TTS fallback success:', { 
            language: langConfig.name, 
            voice: fallbackVoice,
            audioSize: audioBuffer.length 
          });
          return;
        }
      }
      
      throw new Error(data.error?.message || `Google TTS API failed: ${response.status}`);
    }

    if (!data.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // Convert base64 to buffer and send as audio
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(audioBuffer);

    console.log('✅ Google TTS success:', { 
      language: langConfig.name,
      voice: selectedVoice, 
      audioSize: audioBuffer.length,
      duration: `${Math.round(audioBuffer.length / 1000)}KB`
    });

  } catch (error) {
    console.error('💥 Google TTS error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      language: language,
      fallback: 'ElevenLabs API can be used as backup'
    });
  }
}