// api/gemini-ws.js - WEBSOCKET VERSION of Gemini 2.5 Flash with Google Search Grounding
import { VertexAI } from '@google-cloud/vertexai';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

// 🎯 MARKDOWN-AWARE CHUNKING FUNCTION (copied from gemini.js)
function createMarkdownChunks(text) {
  if (!text) return [];
  
  const chunks = [];
  let currentPos = 0;
  
  while (currentPos < text.length) {
    let chunk = '';
    let nextPos = currentPos;
    
    // Check for different markdown patterns
    const remainingText = text.slice(currentPos);
    
    // 1. Code blocks (```) - complete block
    if (remainingText.startsWith('```')) {
      const endPos = remainingText.indexOf('```', 3);
      if (endPos > -1) {
        chunk = remainingText.slice(0, endPos + 3);
        nextPos = currentPos + chunk.length;
      } else {
        chunk = remainingText;
        nextPos = text.length;
      }
    }
    // 2. Headers (complete line)
    else if (remainingText.match(/^#{1,6}\s/)) {
      const lineEnd = remainingText.indexOf('\n');
      chunk = lineEnd > -1 ? remainingText.slice(0, lineEnd + 1) : remainingText;
      nextPos = currentPos + chunk.length;
    }
    // 3. Blockquotes (>) - complete line
    else if (remainingText.match(/^>\s/)) {
      const lineEnd = remainingText.indexOf('\n');
      chunk = lineEnd > -1 ? remainingText.slice(0, lineEnd + 1) : remainingText;
      nextPos = currentPos + chunk.length;
    }
    // 4. Bullet point lines (complete with newline)
    else if (remainingText.match(/^[\s]*[•·∙‣⁃\*\-]\s+/)) {
      const lineEnd = remainingText.indexOf('\n');
      chunk = lineEnd > -1 ? remainingText.slice(0, lineEnd + 1) : remainingText;
      nextPos = currentPos + chunk.length;
    }
    // 5. Default: Take word(s)
    else {
      const words = remainingText.split(/(\s+)/);
      chunk = words[0] + (words[1] || '');
      nextPos = currentPos + chunk.length;
    }
    
    if (chunk) {
      chunks.push(chunk);
    }
    
    currentPos = nextPos;
    
    if (currentPos >= text.length) break;
  }
  
  return chunks;
}

// 🔗 EXTRACT SOURCES FROM GROUNDING METADATA
function extractSources(groundingMetadata) {
  if (!groundingMetadata || !groundingMetadata.webSearchQueries) {
    return [];
  }

  const sources = [];
  
  // Extract from grounding chunks if available
  if (groundingMetadata.groundingChunks) {
    groundingMetadata.groundingChunks.forEach((chunk, index) => {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || `Google Search Result ${index + 1}`,
          url: chunk.web.uri,
          domain: new URL(chunk.web.uri).hostname.replace('www.', ''),
          snippet: '', // Gemini doesn't provide snippets in metadata
          timestamp: Date.now()
        });
      }
    });
  }

  return sources.slice(0, 5); // Limit to 5 sources
}

// 🌐 WEBSOCKET SERVER INSTANCE (singleton)
let wss = null;

function getWebSocketServer() {
  if (!wss) {
    // Create HTTP server for WebSocket upgrade
    const server = createServer();
    wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws, request) => {
      console.log('🔌 New WebSocket connection established');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📨 Received WebSocket message:', message.type || 'unknown');
          
          if (message.type === 'gemini_request') {
            await handleGeminiRequest(ws, message);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            }));
          }
          
        } catch (error) {
          console.error('💥 WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
      });
      
      ws.on('error', (error) => {
        console.error('💥 WebSocket error:', error);
      });
    });
    
    // Start server on a port
    const port = process.env.WS_PORT || 8080;
    server.listen(port, () => {
      console.log(`🌐 WebSocket server running on port ${port}`);
    });
  }
  
  return wss;
}

// 🤖 HANDLE GEMINI REQUEST via WebSocket
async function handleGeminiRequest(ws, message) {
  const { requestId, messages, system, max_tokens, language, documents } = message.payload;
  
  console.log('🤖 Processing Gemini WebSocket request:', requestId);
  
  try {
    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1',
    });

    // Process documents if provided (same logic as HTTP version)
    const geminiMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add documents to the last user message if provided
    if (documents && documents.length > 0 && geminiMessages.length > 0) {
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      if (lastMessage.role === 'user') {
        documents.forEach(doc => {
          if (doc.geminiFileUri) {
            const mimeType = doc.mimeType || 'application/pdf';
            lastMessage.parts.unshift({
              file_data: {
                mime_type: mimeType,
                file_uri: doc.geminiFileUri
              }
            });
            console.log('Added Vertex AI file to WebSocket request:', doc.geminiFileUri, 'MIME:', mimeType);
          }
        });
      }
    }

    // Use the complete system prompt
    const systemInstruction = system || "Jsi Omnia, pokročilý AI asistent. Odpovídej přesně a informativně.";
    const languageInstruction = language ? 
      `\\n\\nVŽDY odpovídaj v jazyce: ${language === 'cs' ? 'češtině' : language === 'en' ? 'English' : language === 'ro' ? 'română' : 'kterém se tě uživatel ptá'}` : 
      '\\n\\nVŽDY odpovídaj v jazyce, ve kterém se tě uživatel ptá';
    
    const finalSystemInstruction = systemInstruction + languageInstruction;

    // Initialize model with Google Search grounding
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: finalSystemInstruction,
      tools: [{
        google_search: {}
      }]
    });

    console.log('🚀 Starting WebSocket Gemini streaming...');

    // Generate response with streaming
    const result = await generativeModel.generateContentStream({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: max_tokens || 5000,
        temperature: 0.5,
        topP: 0.7,
        topK: 20
      }
    });
    
    let fullText = '';
    let sources = [];
    let searchNotified = false;

    // Process stream in real-time via WebSocket
    for await (const item of result.stream) {
      // Process grounding metadata (sources)
      if (item.candidates && item.candidates[0].groundingMetadata) {
        const extractedSources = extractSources(item.candidates[0].groundingMetadata);
        if (extractedSources.length > 0 && !searchNotified) {
          ws.send(JSON.stringify({ 
            requestId, 
            type: 'search_start', 
            message: '🔍 Vyhledávám aktuální data přes Google...' 
          }));
          sources = extractedSources;
          searchNotified = true;
        }
      }
      
      // Process text parts
      if (item.candidates && item.candidates[0].content.parts[0].text) {
        const textChunk = item.candidates[0].content.parts[0].text;
        fullText += textChunk;
        
        // Smart chunking for better streaming experience
        if (textChunk.includes('**') || textChunk.includes('`') || textChunk.includes('•') || 
            textChunk.includes('#') || textChunk.includes('>') || textChunk.includes('[')) {
          // Has markdown → use smart chunking
          const markdownChunks = createMarkdownChunks(textChunk);
          
          for (const chunk of markdownChunks) {
            if (chunk.trim()) {
              ws.send(JSON.stringify({ 
                requestId,
                type: 'text', 
                content: chunk
              }));
            }
          }
        } else {
          // Plain text → word-by-word streaming
          const words = textChunk.split(/(\s+)/);
          for (const word of words) {
            if (word.trim()) {
              ws.send(JSON.stringify({ 
                requestId,
                type: 'text', 
                content: word + ' '
              }));
              // Small delay for natural typing effect
              await new Promise(resolve => setTimeout(resolve, 5));
            }
          }
        }
      }
    }

    // Send completion message
    ws.send(JSON.stringify({
      requestId,
      type: 'completed',
      fullText: fullText,
      sources: sources,
      webSearchUsed: sources.length > 0
    }));

    console.log('✅ WebSocket Gemini streaming completed');

  } catch (error) {
    console.error('💥 WebSocket Gemini error:', error);
    ws.send(JSON.stringify({
      requestId,
      type: 'error',
      message: error.message
    }));
  }
}

// 🌐 VERCEL SERVERLESS HANDLER for WebSocket upgrade
export default function handler(req, res) {
  if (req.method === 'GET' && req.headers.upgrade === 'websocket') {
    console.log('🔄 WebSocket upgrade request received');
    
    // Initialize WebSocket server
    const server = getWebSocketServer();
    
    // Handle the upgrade
    server.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      server.emit('connection', ws, req);
    });
    
  } else {
    // Regular HTTP request - return info
    res.status(200).json({
      message: 'Gemini WebSocket endpoint ready',
      endpoint: 'wss://your-app.vercel.app/api/gemini-ws',
      status: 'active'
    });
  }
}