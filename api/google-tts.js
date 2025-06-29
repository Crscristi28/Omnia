// 🎵 api/google-tts.js - UTF-8 FIXED VERSION
// ✅ FIX: Přidány UTF-8 headers pro opravu diakritiky v TTS

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // ✅ ERROR s UTF-8:
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language = 'cs', voice = 'natural' } = req.body;

    // ✅ DEBUGGING UTF-8 INPUT:
    console.log('🎵 Google TTS Request Language:', language);
    console.log('📝 Input text preview:', text?.substring(0, 100));
    console.log('🔤 Request Content-Type:', req.headers['content-type']);
    
    // Test Czech characters in input
    if (language === 'cs' && text) {
      const hasCzechChars = /[áčďéěíňóřšťúůýž]/i.test(text);
      console.log('🧪 Czech diacritics in input:', hasCzechChars);
      if (hasCzechChars) {
        console.log('✅ Czech characters detected:', text.match(/[áčďéěíňóřšťúůýž]/gi));
      }
    }

    if (!text || text.trim().length === 0) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ error: 'Text is required' });
    }

    // Mapping languages to Google TTS codes
    const languageMap = {
      'cs': 'cs-CZ',
      'en': 'en-US', 
      'ro': 'ro-RO'
    };

    const voiceMap = {
      'cs': 'cs-CZ-Wavenet-A',
      'en': 'en-US-Neural2-F',
      'ro': 'ro-RO-Wavenet-A'
    };

    const ttsLanguage = languageMap[language] || 'cs-CZ';
    const ttsVoice = voiceMap[language] || 'cs-CZ-Wavenet-A';

    // ✅ Google TTS API call s UTF-8:
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',  // ✅ FIX: UTF-8 pro Google API
        'Authorization': `Bearer ${process.env.GOOGLE_TTS_API_KEY}`,
      },
      body: JSON.stringify({
        input: { text: text },  // ✅ Text with diacritics preserved
        voice: {
          languageCode: ttsLanguage,
          name: ttsVoice,
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Google TTS API Error:', response.status, errorData);
      
      // ✅ ERROR s UTF-8:
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(response.status).json({ 
        error: `Google TTS API Error: ${response.status}`,
        details: errorData 
      });
    }

    const data = await response.json();

    if (!data.audioContent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ error: 'No audio content received from Google TTS' });
    }

    // ✅ AUDIO RESPONSE:
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    
    console.log('✅ Google TTS Success:', {
      language: ttsLanguage,
      voice: ttsVoice,
      audioSize: audioBuffer.length
    });

    // ✅ AUDIO headers (UTF-8 metadata):
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('X-Audio-Language', language);  // ✅ Language metadata
    
    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error('💥 Google TTS Error:', error);
    
    // ✅ ENSURE UTF-8 for error responses:
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}