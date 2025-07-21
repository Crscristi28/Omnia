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
    const { messages, system, max_tokens = 2000, language, documents = [], geminiFileUri } = req.body;
    
    
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
    
    // Enhance last user message with timestamp if needed
    if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role === 'user') {
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      const originalText = lastMessage.parts[0].text;
      const enhancedText = enhanceForSearch(originalText);
      lastMessage.parts[0].text = enhancedText;

      // Add Vertex AI file if provided
      if (geminiFileUri) {
        lastMessage.parts.unshift({
          file_data: {
            mime_type: 'application/pdf',
            file_uri: geminiFileUri
          }
        });
        console.log('Added Vertex AI file to request:', geminiFileUri);
      }
    }

    // Use the complete system prompt sent from frontend
    const systemInstruction = system || "Jsi Omnia, pokročilý AI asistent. Odpovídej přesně a informativně.";
    
    // Always add language instruction when language is detected
    const languageInstruction = language ? `\n\nVŽDY odpovídaj v jazyce: ${language === 'cs' ? 'češtině' : language === 'en' ? 'English' : language === 'ro' ? 'română' : 'kterém se tě uživatel ptá'}` : '\n\nVŽDY odpovídaj v jazyce, ve kterém se tě uživatel ptá';
    
    // Add document context if provided
    let documentContext = '';
    if (documents && documents.length > 0) {
      documentContext = '\n\nKONTEXT - Nahraný dokument:\n';
      documents.forEach(doc => {
        documentContext += `\nNázev dokumentu: ${doc.name}\n`;
        documentContext += `Obsah dokumentu:\n${doc.text}\n`;
        documentContext += '---\n';
      });
      documentContext += '\nPouží informace z tohoto dokumentu při odpovídání na otázky uživatele.';
    }
    
    const finalSystemInstruction = systemInstruction + languageInstruction + documentContext;

    // Initialize model with proper system instruction and Google Search grounding
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: finalSystemInstruction,
      tools: [{
        google_search: {}
      }]
    });

    console.log('🚀 Sending to Gemini 2.5 Flash with streaming and Google Search grounding...');

    // Generate response with streaming
    const result = await generativeModel.generateContentStream({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: max_tokens,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });
    
    let fullText = '';
    let sources = [];
    let searchNotified = false;

    // Process stream in real-time
    for await (const item of result.stream) {
      // Process grounding metadata (sources) as soon as they arrive
      if (item.candidates && item.candidates[0].groundingMetadata) {
        const extractedSources = extractSources(item.candidates[0].groundingMetadata);
        if (extractedSources.length > 0 && !searchNotified) {
          res.write(JSON.stringify({ type: 'search_start', message: '🔍 Vyhledávám aktuální data přes Google...' }) + '\n');
          await new Promise(resolve => setTimeout(resolve, 50)); // Short pause for UI
          sources = extractedSources;
          searchNotified = true;
        }
      }
      
      // Process text parts
      if (item.candidates && item.candidates[0].content.parts[0].text) {
        const textChunk = item.candidates[0].content.parts[0].text;
        fullText += textChunk; // Build complete text
        res.write(JSON.stringify({ type: 'text', content: textChunk }) + '\n');
      }
    }

    // After stream completion, send final message with sources
    res.write(JSON.stringify({
      type: 'completed',
      fullText: fullText,
      sources: sources,
      webSearchUsed: sources.length > 0
    }) + '\n');

    console.log('✅ Gemini streaming completed');
    res.end();

  } catch (error) {
    console.error('💥 Gemini API error:', error);
    
    // Specific message for service agents provisioning
    if (error.message && error.message.includes('Service agents are being provisioned')) {
      res.write(JSON.stringify({ 
        error: true, 
        message: '⏳ Google Cloud nastavuje servisní agenty pro dokumenty. Zkus to znovu za 5 minut nebo piš bez dokumentu.' 
      }) + '\n');
    } else {
      res.write(JSON.stringify({ error: true, message: 'Server error: ' + error.message }) + '\n');
    }
    res.end();
  } finally {
    // Restore original env variable
    if (originalCredentials) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalCredentials;
    }
  }
}


// 🔍 ENHANCE SEARCH WITH TIMESTAMP
function enhanceForSearch(query) {
  if (needsCurrentData(query)) {
    const currentTime = new Date().toLocaleString('cs-CZ', { 
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${query}\n\nAktuální čas: ${currentTime}`;
  }
  return query;
}

// 🎯 CURRENT DATA DETECTION
function needsCurrentData(query) {
  const keywords = [
    'aktuální', 'current', 'nejnovější', 'latest', 'teď', 'now', 'dnes', 'today',
    'cena', 'price', 'kurz', 'stock', 'akcie', 'shares', 'bitcoin', 'crypto',
    'počasí', 'weather', 'zprávy', 'news', 'breaking', 'exchange', 'rate',
    'dollar', 'euro', 'koruna', 'ethereum', 'btc', 'eth', 'teplota'
  ];
  
  return keywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
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