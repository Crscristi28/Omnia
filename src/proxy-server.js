import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const app = express();
const port = 3001; // Changed to match Vite proxy config

app.use(cors({ origin: 'http://localhost:5173' })); // Updated for local development
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Claude2 endpoint - Simplified Express version
app.post('/claude2', async (req, res) => {
  // CORS headers for streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  try {
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      res.write(JSON.stringify({
        error: true,
        message: 'Claude API key není nastaven'
      }) + '\n');
      return res.end();
    }

    const recentMessages = messages.slice(-8);
    const finalSystem = system || "Jsi Omnia, pokročilý AI asistent.";

    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: finalSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    console.log('🚀 Sending request to Claude...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      res.write(JSON.stringify({
        error: true,
        message: `HTTP ${response.status}: ${errorText}`
      }) + '\n');
      return res.end();
    }

    const data = await response.json();
    console.log('✅ Claude response received');
    
    // Check for web search usage
    const toolUses = data.content?.filter(item => item.type === 'server_tool_use') || [];
    const webSearchUsed = toolUses.some(t => t.name === 'web_search');
    
    // Extract sources
    let extractedSources = [];
    
    if (data.content) {
      console.log('🔍 Extracting sources from Claude response...');
      
      // Extract from citations in text blocks
      for (const item of data.content) {
        if (item.type === 'text' && item.citations && Array.isArray(item.citations)) {
          for (const citation of item.citations) {
            if (citation.url && citation.title && extractedSources.length < 5) {
              try {
                const urlObj = new URL(citation.url);
                extractedSources.push({
                  title: citation.title,
                  url: citation.url,
                  domain: urlObj.hostname.replace('www.', ''),
                  type: 'citation'
                });
              } catch (urlError) {
                console.warn('⚠️ Invalid URL in citation:', citation.url);
              }
            }
          }
        }
      }
      
      // Extract from web_search_tool_result blocks
      const toolResults = data.content.filter(item => item.type === 'web_search_tool_result');
      
      for (const result of toolResults) {
        if (result.content && Array.isArray(result.content)) {
          for (const searchResult of result.content) {
            if (searchResult.type === 'web_search_result' && 
                searchResult.url && 
                searchResult.title && 
                extractedSources.length < 5) {
              try {
                const urlObj = new URL(searchResult.url);
                extractedSources.push({
                  title: searchResult.title,
                  url: searchResult.url,
                  domain: urlObj.hostname.replace('www.', ''),
                  type: 'search_result'
                });
              } catch (urlError) {
                console.warn('⚠️ Invalid URL in search result:', searchResult.url);
              }
            }
          }
        }
      }
      
      // Remove duplicates
      const uniqueSources = [];
      const seenUrls = new Set();
      
      for (const source of extractedSources) {
        if (!seenUrls.has(source.url) && uniqueSources.length < 5) {
          seenUrls.add(source.url);
          uniqueSources.push(source);
        }
      }
      
      extractedSources = uniqueSources;
      console.log('🔗 Total unique sources extracted:', extractedSources.length);
    }
    
    if (webSearchUsed) {
      console.log('🔍 Claude used web_search!');
      res.write(JSON.stringify({
        type: 'search_start',
        message: '🔍 Vyhledávám aktuální informace...'
      }) + '\n');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Extract text response
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🔗 Sources found:', extractedSources.length);

    // Letter-by-letter streaming
    const letters = textContent.split('');

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];

      res.write(JSON.stringify({
        type: 'text',
        content: char
      }) + '\n');

      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Send final completion with sources
    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      webSearchUsed: webSearchUsed,
      sources: extractedSources,
      citations: extractedSources,
      toolResults: data.content?.filter(item => item.type === 'web_search_tool_result') || [],
      searchData: {
        sources: extractedSources
      }
    }) + '\n');

    console.log('✅ Streaming completed with', extractedSources.length, 'sources');
    res.end();

  } catch (error) {
    console.error('💥 Fatal error in streaming:', error);
    
    res.write(JSON.stringify({
      error: true,
      message: 'Server error: ' + error.message
    }) + '\n');
    
    res.end();
  }
});

// OpenAI endpoint
app.post('/openai', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'OpenAI API communication error.' });
  }
});

// ElevenLabs TTS endpoint
app.post('/elevenlabs-tts', async (req, res) => {
  try {
    const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL' } = req.body;
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ElevenLabs STT endpoint
app.post('/elevenlabs-stt', async (req, res) => {
  try {
    // For local development, use OpenAI Whisper as fallback
    const audioData = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        success: false, 
        error: 'Speech-to-text not configured for local development' 
      });
    }

    // Create a buffer from the audio data
    const audioBuffer = Buffer.from(audioData);
    
    // For now, return a mock response
    res.json({ 
      success: false, 
      error: 'Speech-to-text requires complex multipart form handling - not implemented in local proxy' 
    });

  } catch (error) {
    console.error('ElevenLabs STT error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google TTS endpoint
app.post('/google-tts', async (req, res) => {
  try {
    const { text, language = 'cs', voice = 'natural' } = req.body;
    
    // Fallback TTS implementation
    res.status(503).json({ error: 'Google TTS not configured for local development' });
  } catch (error) {
    console.error('Google TTS error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Claude web search endpoint
app.post('/claude-web-search', async (req, res) => {
  try {
    // Fallback implementation
    res.json({
      success: false,
      message: 'Claude web search not configured for local development'
    });
  } catch (error) {
    console.error('Claude web search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Proxy server running on http://localhost:${port}`);
  console.log('📝 Available endpoints:');
  console.log('  - POST /claude2');
  console.log('  - POST /openai');
  console.log('  - POST /elevenlabs-tts');
  console.log('  - POST /elevenlabs-stt');
  console.log('  - POST /google-tts');
  console.log('  - POST /claude-web-search');
});