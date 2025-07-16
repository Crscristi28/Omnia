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

  try {
    const { messages, system, max_tokens = 2000, language } = req.body;
    
    // Check for required environment variables
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CREDENTIALS_BASE64) {
      res.write(JSON.stringify({ error: true, message: 'Google Cloud credentials nejsou kompletní' }) + '\n');
      return res.end();
    }

    // Decode Base64 credentials
    console.log('🔍 Decoding Base64 credentials...');
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8'));
    console.log('✅ Credentials decoded, client_email:', credentials.client_email);

    // Create explicit GoogleAuth client
    console.log('🔑 Creating GoogleAuth client...');
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    console.log('🔐 Getting auth client...');
    const authClient = await auth.getClient();
    console.log('✅ Auth client created successfully');

    // Initialize Vertex AI with explicit auth client
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1',
      authClient: authClient
    });

    // Get last user message and enhance it for search
    const lastMessage = messages[messages.length - 1];
    const enhancedQuery = enhanceForSearch(lastMessage.text || lastMessage.content);
    
    // Prepare messages for Gemini (without system instruction in contents)
    const geminiMessages = messages.slice(-5)
      .filter(msg => msg.text || msg.content) // Filter out empty messages
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || msg.content || '' }]
      }));
    
    // Replace last user message with enhanced version
    if (geminiMessages[geminiMessages.length - 1].role === 'user') {
      geminiMessages[geminiMessages.length - 1].parts[0].text = enhancedQuery;
    }

    // Initialize model with proper system instruction and Google Search grounding
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: system || "Jsi Omnia, pokročilý AI asistent. Odpovídej přesně a informativně.",
      tools: [{
        google_search: {}
      }]
    });

    console.log('🚀 Sending to Gemini 2.5 Flash with Google Search grounding...');
    console.log('📝 Messages being sent:', JSON.stringify(geminiMessages, null, 2));

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
    
    const textContent = response.candidates[0].content.parts[0].text || '';
    
    // Extract grounding metadata (sources)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = extractSources(groundingMetadata);

    console.log('✅ Gemini response received, sources:', sources.length);

    // Simple word-by-word streaming
    const words = textContent.split(' ');
    
    if (sources.length > 0) {
      res.write(JSON.stringify({ type: 'search_start', message: '🔍 Vyhledávám aktuální data přes Google...' }) + '\n');
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
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

    console.log('✅ Gemini streaming completed');
    res.end();

  } catch (error) {
    console.error('💥 Gemini API error:', error);
    res.write(JSON.stringify({ error: true, message: 'Server error: ' + error.message }) + '\n');
    res.end();
  }
}

// 🔍 SEARCH ENHANCEMENT
function enhanceForSearch(query) {
  if (needsCurrentData(query)) {
    const currentTime = new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
    return `Uživatelský dotaz: ${query}. Aktuální čas: ${currentTime}. Použij nejnovější informace z Google Search a odpověz v jazyce uživatele.`;
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