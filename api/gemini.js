// api/gemini.js - GEMINI 2.5 FLASH WITH GOOGLE SEARCH GROUNDING
import { VertexAI } from '@google-cloud/vertexai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Save original env variable
  const originalCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    const { messages, system, max_tokens = 2000, language } = req.body;
    
    console.log('🎯 Received system prompt length:', system ? system.length : 'undefined/null');
    console.log('🎯 Received system prompt preview:', system ? system.substring(0, 100) + '...' : 'NO SYSTEM PROMPT');
    
    // Check for required environment variables
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      res.write(JSON.stringify({ error: true, message: 'Google Cloud credentials nejsou kompletní' }) + '\n');
      return res.end();
    }

    // Parse JSON credentials
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // Temporarily remove to prevent SDK from using it as file path
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Initialize Vertex AI with explicit credentials
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      }
    });
    console.log('✅ Vertex AI initialized with workaround credentials');

    // Get last user message
    const lastMessage = messages[messages.length - 1];
    
    // Prepare messages for Gemini (without system instruction in contents)
    const geminiMessages = messages.slice(-5)
      .filter(msg => msg.text || msg.content) // Filter out empty messages
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || msg.content || '' }]
      }));
    
    // Messages are ready as-is without enhancement

    // Build system instruction with language support
    const baseSystem = system || "Jsi Omnia, pokročilý AI asistent. Odpovídej přesně a informativně.";
    const languageInstruction = language ? `\n\nVŽDY odpovídaj v jazyce: ${language === 'cs' ? 'češtině' : language === 'en' ? 'English' : language === 'ro' ? 'română' : 'kterém se tě uživatel ptá'}` : '\n\nVŽDY odpovídaj v jazyce, ve kterém se tě uživatel ptá';

    // Initialize model with proper system instruction and Google Search grounding
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: baseSystem + languageInstruction,
      tools: [{
        google_search: {}
      }]
    });

    console.log('🚀 Sending to Gemini 2.5 Flash with Google Search grounding...');
    console.log('📝 Messages being sent:', JSON.stringify(geminiMessages, null, 2));
    console.log('🎯 System prompt being used (length):', baseSystem.length);
    console.log('🎯 System prompt preview:', baseSystem.substring(0, 300) + '...');
    console.log('🎯 Contains CRITICAL COMPLETION RULES:', baseSystem.includes('CRITICAL COMPLETION RULES'));

    // Generate response
    const result = await generativeModel.generateContent({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: max_tokens,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    const response = result.response;
    
    // Better error handling for response
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts || !response.candidates[0].content.parts[0]) {
      console.error('💥 Invalid response structure:', JSON.stringify(response, null, 2));
      throw new Error('Gemini vrátil prázdnou odpověď');
    }
    
    let textContent = response.candidates[0].content.parts[0].text || '';
    console.log('📝 Raw text content length:', textContent.length);
    console.log('📝 Text preview:', textContent.substring(0, 100) + '...');
    
    // Extract grounding metadata (sources)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = extractSources(groundingMetadata);

    console.log('✅ Gemini response received, sources:', sources.length);

    // Check if response is JSON structured
    let isStructuredResponse = false;
    let structuredData = null;
    try {
      if (textContent.trim().startsWith('{') && textContent.trim().endsWith('}')) {
        structuredData = JSON.parse(textContent);
        isStructuredResponse = true;
        console.log('🎯 Detected structured JSON response');
      }
    } catch (e) {
      // Not JSON, continue with regular text streaming
    }

    // Handle structured vs regular streaming
    if (sources.length > 0) {
      res.write(JSON.stringify({ type: 'search_start', message: '🔍 Vyhledávám aktuální data přes Google...' }) + '\n');
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    if (isStructuredResponse) {
      // Send structured response directly
      res.write(JSON.stringify({
        type: 'completed',
        fullText: textContent,
        structured: structuredData,
        sources: sources,
        webSearchUsed: sources.length > 0
      }) + '\n');
    } else {
      // Regular word-by-word streaming
      const words = textContent.split(' ');
      
      for (const word of words) {
        res.write(JSON.stringify({ type: 'text', content: word + ' ' }) + '\n');
        await new Promise(resolve => setTimeout(resolve, 12));
      }
      
      res.write(JSON.stringify({
        type: 'completed',
        fullText: textContent,
        sources: sources,
        webSearchUsed: sources.length > 0
      }) + '\n');
    }

    console.log('✅ Gemini streaming completed');
    res.end();

  } catch (error) {
    console.error('💥 Gemini API error:', error);
    res.write(JSON.stringify({ error: true, message: 'Server error: ' + error.message }) + '\n');
    res.end();
  } finally {
    // Restore original env variable
    if (originalCredentials) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalCredentials;
    }
  }
}


// 🌐 EXTRACT SOURCES FROM GROUNDING METADATA
function extractSources(groundingMetadata) {
  if (!groundingMetadata || !groundingMetadata.groundingSupports) {
    return [];
  }

  const sources = [];
  
  groundingMetadata.groundingSupports.forEach(support => {
    if (support.segment && support.segment.text) {
      // Extract web sources
      if (support.groundingChunkIndices) {
        support.groundingChunkIndices.forEach(chunkIndex => {
          const chunk = groundingMetadata.groundingChunks?.[chunkIndex];
          if (chunk && chunk.web) {
            sources.push({
              title: chunk.web.title || 'Web Source',
              url: chunk.web.uri || '#',
              snippet: support.segment.text.substring(0, 200) + '...'
            });
          }
        });
      }
    }
  });

  // Remove duplicates
  const uniqueSources = sources.filter((source, index, self) => 
    index === self.findIndex(s => s.url === source.url)
  );

  return uniqueSources.slice(0, 5); // Limit to 5 sources
}