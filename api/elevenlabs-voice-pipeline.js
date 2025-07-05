// api/elevenlabs-voice-pipeline.js - COMPLETE VOICE-TO-VOICE PIPELINE
// 🎤→🧠→🔊 Audio → STT → Claude → TTS → Audio
// ✅ End-to-end voice conversation with ElevenLabs

export const config = {
  runtime: 'edge',
  maxDuration: 90, // Extended timeout for full pipeline
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
    console.log('🎙️ ElevenLabs Voice Pipeline started');

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'MpbYQvoTmXjHkaxtLiSh';
    
    if (!ELEVENLABS_API_KEY || !CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuration error',
          message: 'API klíče nejsou nastaveny'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      audio_data,           // Base64 encoded audio
      conversation_history = [],
      language_hint = null, // Optional language hint
      voice_settings = {
        stability: 0.30,
        similarity_boost: 0.25,
        style: 0.30,
        use_speaker_boost: true,
        speed: 1.0
      },
      streaming = true      // Enable audio streaming
    } = await req.json();

    if (!audio_data) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Audio data required',
          message: 'Audio data jsou povinná'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🎤 STEP 1: SPEECH-TO-TEXT with ElevenLabs
    console.log('🎤 Step 1: Converting speech to text...');
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio_data, 'base64');
    
    // Create FormData for STT
    const sttFormData = new FormData();
    sttFormData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
    sttFormData.append('model_id', 'scribe_v1');
    sttFormData.append('enable_logging', 'false');
    sttFormData.append('timestamps_granularity', 'word');
    
    if (language_hint) {
      sttFormData.append('language_code', language_hint);
    }

    const sttResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: sttFormData
    });

    if (!sttResponse.ok) {
      const sttError = await sttResponse.text();
      console.error('❌ STT failed:', sttError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Speech recognition failed',
          message: 'Nepodařilo se rozpoznat řeč',
          details: sttError
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sttResult = await sttResponse.json();
    const userText = sttResult.text?.trim();
    const detectedLanguage = detectLanguageFromText(userText, sttResult.language_code);

    if (!userText) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Empty transcription',
          message: 'Nepodařilo se rozpoznat žádný text'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ STT Success:', { 
      text: userText.substring(0, 50) + '...',
      language: detectedLanguage
    });

    // 🧠 STEP 2: CLAUDE AI RESPONSE
    console.log('🧠 Step 2: Getting Claude response...');
    
    const claudeMessages = [
      ...conversation_history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: userText }
    ];

    const systemPrompt = getSystemPrompt(detectedLanguage);

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: claudeMessages
      })
    });

    if (!claudeResponse.ok) {
      const claudeError = await claudeResponse.text();
      console.error('❌ Claude failed:', claudeError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'AI response failed',
          message: 'Nepodařilo se získat odpověď od AI',
          details: claudeError
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeResult = await claudeResponse.json();
    const aiResponseText = claudeResult.content?.[0]?.text?.trim();

    if (!aiResponseText) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Empty AI response',
          message: 'AI nevrátila žádnou odpověď'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Claude Success:', { 
      response: aiResponseText.substring(0, 50) + '...',
      language: detectedLanguage
    });

    // 🔊 STEP 3: TEXT-TO-SPEECH with ElevenLabs
    console.log('🔊 Step 3: Converting response to speech...');
    
    const processedText = preprocessTextForTTS(aiResponseText);
    
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voice_settings,
        output_format: 'mp3_44100_128'
      })
    });

    if (!ttsResponse.ok) {
      const ttsError = await ttsResponse.text();
      console.error('❌ TTS failed:', ttsError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Speech synthesis failed',
          message: 'Nepodařilo se vygenerovat řeč',
          details: ttsError
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ TTS Success - returning audio stream');

    // 🎵 STEP 4: RETURN COMPLETE RESPONSE
    if (streaming && ttsResponse.body) {
      // Stream audio directly to client
      return new Response(ttsResponse.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'X-User-Text': encodeURIComponent(userText),
          'X-AI-Response': encodeURIComponent(aiResponseText),
          'X-Language': detectedLanguage,
          'X-Pipeline': 'elevenlabs_voice_complete'
        }
      });
    } else {
      // Return audio buffer with metadata
      const audioBuffer = await ttsResponse.arrayBuffer();
      
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'X-User-Text': encodeURIComponent(userText),
          'X-AI-Response': encodeURIComponent(aiResponseText),
          'X-Language': detectedLanguage,
          'X-Pipeline': 'elevenlabs_voice_complete'
        }
      });
    }

  } catch (error) {
    console.error('💥 Voice Pipeline error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Pipeline failed',
        message: 'Chyba v hlasovém pipeline',
        details: error.message 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// 🌍 SYSTEM PROMPTS for different languages
function getSystemPrompt(language) {
  const prompts = {
    'cs': `Jsi Omnia, pokročilý AI asistent s osobností. Odpovídej VŽDY v češtině.

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- Buď užitečná a přímá

🎵 VOICE OPTIMALIZACE:
- Používej krátké, jasné věty pro hlasové přehrání
- Vyhni se dlouhým souvětím
- Optimalizuj pro přirozený mluvený projev
- Používej správnou češtinu s diakritikou`,

    'en': `You are Omnia, an advanced AI assistant with personality. Respond ALWAYS in English.

🧠 OMNIA PERSONALITY:
- You're smart, witty, and a bit sassy (Boss Omnia vibes! 👑)
- You have business acumen and humor
- Answer simple questions naturally and friendly
- Be helpful and direct

🎵 VOICE OPTIMIZATION:
- Use short, clear sentences for voice playback
- Avoid long complex sentences
- Optimize for natural spoken delivery
- Use proper English with correct spelling`,

    'ro': `Ești Omnia, un asistent IA avansat cu personalitate. Răspunde ÎNTOTDEAUNA în română.

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai simț pentru business și umor
- Răspunde la întrebări simple natural și prietenos
- Fii utilă și directă

🎵 OPTIMIZARE VOCALĂ:
- Folosește propoziții scurte și clare pentru redarea vocală
- Evită propozițiile lungi și complexe
- Optimizează pentru livrare naturală vorbită
- Folosește româna corectă cu diacritice`
  };

  return prompts[language] || prompts['cs'];
}

// 🌍 Enhanced language detection
function detectLanguageFromText(text, elevenLabsLanguage) {
  if (!text) return 'cs';
  
  const lowerText = text.toLowerCase().trim();
  
  // Czech phrases
  const czechPhrases = ['jak se mas', 'co delas', 'muzes mi', 'ahoj', 'dekuji'];
  const englishPhrases = ['how are you', 'what are you', 'can you', 'hello', 'thank you'];
  const romanianPhrases = ['ce faci', 'cum esti', 'poti sa', 'salut', 'multumesc'];
  
  for (const phrase of czechPhrases) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  for (const phrase of englishPhrases) {
    if (lowerText.includes(phrase)) return 'en';
  }
  for (const phrase of romanianPhrases) {
    if (lowerText.includes(phrase)) return 'ro';
  }
  
  // Fallback to ElevenLabs detection
  const languageMap = {
    'czech': 'cs', 'cs': 'cs',
    'english': 'en', 'en': 'en', 
    'romanian': 'ro', 'ro': 'ro'
  };
  
  return languageMap[elevenLabsLanguage?.toLowerCase()] || 'cs';
}

// 🔧 Text preprocessing for TTS
function preprocessTextForTTS(text) {
  if (!text) return '';
  
  let processed = text;
  
  // Remove markdown
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '$1');
  processed = processed.replace(/\*([^*]+)\*/g, '$1');
  processed = processed.replace(/\*+/g, '');
  
  // Math symbols
  processed = processed.replace(/÷/g, ' děleno ');
  processed = processed.replace(/×/g, ' krát ');
  processed = processed.replace(/=/g, ' rovná se ');
  processed = processed.replace(/\//g, ' děleno ');
  
  // Percentages
  processed = processed.replace(/(\d+)\s*%/gi, '$1 procent');
  
  // Temperature
  processed = processed.replace(/(\d+)\s*°C/gi, '$1 stupňů Celsia');
  
  // Tech terms
  processed = processed.replace(/\bAPI\b/gi, 'éj pí áj');
  processed = processed.replace(/\bAI\b/gi, 'éj áj');
  
  // Cleanup
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
}