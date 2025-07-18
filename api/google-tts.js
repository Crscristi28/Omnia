// 🌍 UPGRADED GOOGLE TTS - RYCHLEJŠÍ + PLNĚ MULTIJAZYČNÝ
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

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ 
      success: false,
      error: 'Google API key not configured' 
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
    // 🎵 UPGRADED TO STUDIO VOICES - NEJREALISTIČTĚJŠÍ HLASY 2025
    const languageMapping = {
      // Core jazyky s nejnovějšími Studio hlasy (ultra-realistic)
      'cs': { code: 'cs-CZ', voice: 'cs-CZ-Studio-A', name: 'Czech (Studio Ultra-Realistic)' },
      'en': { code: 'en-US', voice: 'en-US-Studio-D', name: 'English (Studio Expressive)' },
      'ro': { code: 'ro-RO', voice: 'ro-RO-Studio-A', name: 'Romanian (Studio Natural)' },
      
      // European Languages s nejnovějšími Studio hlasy
      'de': { code: 'de-DE', voice: 'de-DE-Studio-C', name: 'German (Studio Dynamic)' },
      'es': { code: 'es-ES', voice: 'es-ES-Studio-C', name: 'Spanish (Studio Expressive)' },
      'fr': { code: 'fr-FR', voice: 'fr-FR-Studio-C', name: 'French (Studio Energetic)' },
      'it': { code: 'it-IT', voice: 'it-IT-Studio-C', name: 'Italian (Studio Vivid)' },
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
      
      // Alternative variants with Studio voices
      'en-gb': { code: 'en-GB', voice: 'en-GB-Studio-C', name: 'English UK (Studio)' },
      'en-au': { code: 'en-AU', voice: 'en-AU-Studio-C', name: 'English AU (Studio)' },
      'es-mx': { code: 'es-MX', voice: 'es-MX-Neural2-A', name: 'Spanish (Mexico)' },
      'pt-br': { code: 'pt-BR', voice: 'pt-BR-Neural2-A', name: 'Portuguese (Brazil)' }
    };

    // Get language config (fallback to detected language, NOT always Czech!)
    const langConfig = languageMapping[language.toLowerCase()] || languageMapping['en'];
    
    console.log('🎵 FAST TTS request:', { 
      inputLanguage: language,
      detectedConfig: langConfig,
      textLength: text.length 
    });

    // 🎤 VOICE SELECTION LOGIC
    let selectedVoice = langConfig.voice;
    
    // Allow voice customization
    if (voice && voice !== 'natural') {
      const voicePrefix = langConfig.code;
      selectedVoice = `${voicePrefix}-${voice}`;
    }

    // 🎵 OPTIMÁLNÍ RYCHLOST - Živě ale příjemně
    const audioConfig = {
      audioEncoding: 'MP3',
      speakingRate: 1.15,  // 15% rychleji - příjemná rychlost
      pitch: 0.4,          // Mírně vyšší, ale ne moc
      volumeGainDb: 2.5,   // Hlasitější, ale ne příliš
      effectsProfileId: ['headphone-class-device'] // Kvalitní ale ne agresivní
    };

    // Google TTS API call
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
          audioConfig
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Google TTS API error:', data);
      
      // Fallback with Neural2 if Studio fails, then Standard if Neural2 fails
      if (selectedVoice.includes('Studio')) {
        console.log('🔄 Studio failed, trying Neural2 fallback...');
        const fallbackVoice = selectedVoice.replace('Studio', 'Neural2');
        
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
              audioConfig
            })
          }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.audioContent) {
            const audioBuffer = Buffer.from(fallbackData.audioContent, 'base64');
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', audioBuffer.length);
            res.status(200).send(audioBuffer);
            
            console.log('✅ Neural2 fallback success:', { 
              language: langConfig.name, 
              voice: fallbackVoice,
              audioSize: audioBuffer.length 
            });
            return;
          }
        }
      }
      
      // Final fallback with Standard voice if all premium fails
      if (selectedVoice.includes('Studio') || selectedVoice.includes('Wavenet') || selectedVoice.includes('Neural2')) {
        console.log('🔄 Fallback to Standard voice...');
        const fallbackVoice = selectedVoice.replace('Studio', 'Standard').replace('Wavenet', 'Standard').replace('Neural2', 'Standard');
        
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
              audioConfig
            })
          }
        );

        const fallbackData = await fallbackResponse.json();
        
        if (fallbackResponse.ok && fallbackData.audioContent) {
          const audioBuffer = Buffer.from(fallbackData.audioContent, 'base64');
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', audioBuffer.length);
          res.status(200).send(audioBuffer);
          
          console.log('✅ Optimized TTS fallback success:', { 
            language: langConfig.name, 
            voice: fallbackVoice,
            speed: 'Optimized (1.15x)',
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
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30min cache
    res.status(200).send(audioBuffer);

    console.log('✅ OPTIMIZED TTS SUCCESS:', { 
      language: langConfig.name,
      voice: selectedVoice, 
      speed: 'Optimized (1.15x)',
      pitch: 'Pleasant (+0.4)',
      volume: 'Clear (+2.5dB)',
      audioSize: audioBuffer.length,
      duration: `${Math.round(audioBuffer.length / 1000)}KB`
    });

  } catch (error) {
    console.error('💥 Fast TTS error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      language: language,
      fallback: 'Standard voices available as backup'
    });
  }
}