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
    const { requestId, messages, system, max_tokens = 8000, documents = [], imageMode = false, pdfMode = false, language } = req.body;

    // Log request ID for debugging concurrent requests
    console.log('🔄 [GEMINI] Processing request ID:', requestId || 'NO_ID');

    // 🔍 DEBUG: What backend received from frontend
    console.log('📥 [BACKEND-DEBUG] Gemini API received:', {
      requestId,
      messagesCount: messages?.length || 0,
      lastUserMessage: messages?.[messages.length - 1]?.content?.substring(0, 100) || messages?.[messages.length - 1]?.text?.substring(0, 100),
      systemPromptLength: system?.length || 0,
      detectedLanguage: language,
      imageMode,
      pdfMode,
      timestamp: new Date().toISOString()
    });
    
    
    // Check for required environment variables
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      res.write(JSON.stringify({ requestId, error: true, message: 'Google Cloud credentials are incomplete' }) + '\n');
      return res.end();
    }

    // Parse JSON credentials
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

    // Initialize Vertex AI with explicit credentials (no delete needed)
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      }
    });
    console.log('✅ Vertex AI initialized without workaround [ID:', requestId, ']');

    // Prepare messages for Gemini (without system instruction in contents)
    // Note: Frontend already provides isolated chat messages, so use all messages from current chat
    const geminiMessages = messages
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

      // Add all documents (both files and text content)
      if (documents && documents.length > 0) {
        documents.forEach(doc => {
          if (doc.geminiFileUri) {
            // Gemini files (images, PDFs)
            const mimeType = getMimeTypeFromName(doc.name);
            
            lastMessage.parts.unshift({
              file_data: {
                mime_type: mimeType,
                file_uri: doc.geminiFileUri
              }
            });
            console.log('Added Vertex AI file to request:', doc.geminiFileUri, 'MIME:', mimeType);
          } else if (doc.extractedText) {
            // Text files with direct content
            lastMessage.parts.unshift({
              text: `📄 Content of ${doc.name}:\n\n${doc.extractedText}`
            });
            console.log('Added text file content to request:', doc.name, `(${doc.extractedText.length} chars)`);
          }
        });
      }
    }

    // Use the complete system prompt sent from frontend (required)
    const systemInstruction = system;

    if (!systemInstruction) {
      console.error('❌ [GEMINI] No system prompt received from frontend');
      res.write(JSON.stringify({ requestId, error: true, message: 'System prompt required' }) + '\n');
      return res.end();
    }

    // Add language instruction to ensure Omnia responds in user's language
    let finalSystemInstruction = systemInstruction + '\n\n🌍 **CRITICAL:** Always respond in the EXACT same language the user writes in. Match their language perfectly.';

    // 🚨 GOOGLE API LIMITATION: Can't mix tool types (search + function calls)
    // Solution: Use system prompt to guide Omnia's choice, then provide only one tool type

    // Analyze FULL CONTEXT to determine intent (not just last message)
    const fullContext = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text || msg.content || '')
      .join(' ')
      .toLowerCase();
    const imageKeywords = [
      // Action words - all languages
      'generate', 'create', 'make', 'draw', 'paint', 'design', 'render', 'sketch', 'visualize',
      'vytvoř', 'vytvořit', 'nakresli', 'namaluj', 'udělej', 'navrhni', 'ilustruj',
      'generează', 'creează', 'desenează', 'pictează', 'fă', 'realizează',
      'erstelle', 'zeichne', 'male', 'entwirf', 'mache', 'gestalte',
      'создай', 'нарисуй', 'сделай', 'изобрази', 'нарисуй', 'создать',
      'stwórz', 'narysuj', 'namaluj', 'zrób', 'zaprojektuj',


      // Request variations - all languages
      'similar', 'another', 'one more', 'more', 'next', 'show it', 'show me',
      'podobný', 'další', 'ještě jeden', 'víc', 'ukaž', 'ukaž mi',
      'similar', 'alt', 'încă unul', 'mai mult', 'arată-mi',
      'ähnlich', 'noch ein', 'mehr', 'zeig mir',
      'похожий', 'еще один', 'покажи', 'покажи мне',
      'podobny', 'jeszcze jeden', 'więcej', 'pokaż mi',

      // Image content words - all languages
      'image', 'picture', 'illustration', 'photo', 'artwork', 'drawing', 'painting',
      'obrázek', 'obrázky', 'ilustrace', 'fotka', 'kresba', 'malba',
      'imagine', 'poză', 'ilustrație', 'desen', 'pictură', 'grafică',
      'bild', 'foto', 'illustration', 'zeichnung', 'gemälde', 'grafik',
      'изображение', 'картинка', 'фото', 'рисунок', 'иллюстрация',
      'obraz', 'zdjęcie', 'ilustracja', 'rysunek', 'malarstwo',

      // Visual objects
      'logo', 'icon', 'banner', 'poster', 'wallpaper', 'character', 'scene', 'concept',
      'car', 'auto', 'house', 'dům', 'landscape', 'krajina', 'portrait', 'portrét',
      'animal', 'zvíře', 'cat', 'kočka', 'dog', 'pes', 'tree', 'strom',
      'vánoční', 'christmas'
    ];
    const wantsImage = imageKeywords.some(keyword => fullContext.includes(keyword));

    // Check for PDF generation intent
    const pdfKeywords = [
      'pdf', 'document', 'report', 'generate pdf', 'create pdf', 'make pdf',
      'vytvoř pdf', 'vygeneruj pdf', 'dokument', 'zpráva', 'report',
      'generează pdf', 'creează document', 'raport',
      'erstelle pdf', 'generiere pdf', 'dokument', 'bericht',
      'создай pdf', 'сгенерируй pdf', 'документ', 'отчет',
      'stwórz pdf', 'wygeneruj pdf', 'dokument', 'raport',
      'export', 'download', 'file', 'soubor', 'fișier', 'datei', 'файл', 'plik'
    ];
    const wantsPDF = pdfKeywords.some(keyword => fullContext.includes(keyword));

    let tools = [];

    if (imageMode) {
      // Explicit image mode (🎨 button) - only provide image tool
      tools.push({
        functionDeclarations: [{
          name: "generate_image",
          description: "Generate a new image from text description",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "Detailed description of the image to generate"
              },
              imageCount: {
                type: "integer",
                description: "Number of images to generate (1-4)",
                default: 1
              }
            },
            required: ["prompt"]
          }
        }]
      });
      console.log('🎨 [GEMINI] Explicit image mode - providing image generation tool');
    } else if (pdfMode) {
      // Explicit PDF mode - only provide PDF generation tool
      tools.push({
        functionDeclarations: [{
          name: "generate_pdf",
          description: "Generate a PDF document from markdown content. Use this when user asks for documents, reports, or PDF files.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the PDF document"
              },
              content: {
                type: "string",
                description: "Full markdown content for the document with proper formatting (headers, lists, tables, etc.)"
              },
              documentType: {
                type: "string",
                description: "Type of document for styling",
                enum: ["report", "invoice", "cv", "document"],
                default: "document"
              }
            },
            required: ["title", "content"]
          }
        }]
      });
      console.log('📄 [GEMINI] Explicit PDF mode - providing PDF generation tool');
    } else if (wantsImage) {
      // Auto-detected image request in normal chat - provide image tool
      tools.push({
        functionDeclarations: [{
          name: "generate_image",
          description: "Generate a new image from text description. Use this when user explicitly asks for image generation.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "Detailed description of the image to generate"
              },
              imageCount: {
                type: "integer",
                description: "Number of images to generate (1-4)",
                default: 1
              }
            },
            required: ["prompt"]
          }
        }]
      });
      console.log('🎨 [GEMINI] Auto-detected image request - providing image generation tool');
    } else if (wantsPDF) {
      // Auto-detected PDF request - provide PDF generation tool
      tools.push({
        functionDeclarations: [{
          name: "generate_pdf",
          description: "Generate a PDF document from markdown content. Use this when user asks for documents, reports, or PDF files.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the PDF document"
              },
              content: {
                type: "string",
                description: "Full markdown content for the document with proper formatting (headers, lists, tables, etc.)"
              },
              documentType: {
                type: "string",
                description: "Type of document for styling",
                enum: ["report", "invoice", "cv", "document"],
                default: "document"
              }
            },
            required: ["title", "content"]
          }
        }]
      });
      console.log('📄 [GEMINI] Auto-detected PDF request - providing PDF generation tool');
    } else {
      // Default mode - provide Google Search for current data
      tools.push({
        google_search: {}
      });
      console.log('🔍 [GEMINI] Default mode - providing Google Search tool');
    }

    console.log('🔧 [DEBUG] Single tool type provided:', tools.length);
    
    // Initialize model with proper system instruction and tools
    console.log('🤖 [GEMINI] Initializing model with tools:', tools.length);
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: finalSystemInstruction,
      tools: tools
    });

    const modeText = imageMode ? 'with IMAGE GENERATION tools' :
                    pdfMode ? 'with PDF GENERATION tools' :
                    'with Google Search grounding';
    console.log(`🚀 Sending to Gemini 2.5 Flash ${modeText}...`);

    // Generate response with streaming
    // 🔍 DEBUG: What we're sending to actual Gemini model
    console.log('🚀 [BACKEND-DEBUG] Calling Gemini with:', {
      messagesCount: geminiMessages.length,
      systemInstructionLength: finalSystemInstruction?.length || 0,
      toolsCount: tools.length,
      maxTokens: max_tokens,
      timestamp: new Date().toISOString()
    });

    const result = await generativeModel.generateContentStream({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: max_tokens,
        temperature: 0.5,  // Sníženo pro rychlejší odpovědi
        topP: 0.7,         // Sníženo pro méně exploration
        topK: 20           // Sníženo pro rychlejší sampling
      }
    });
    
    let fullText = '';
    let sources = [];
    let searchNotified = false;
    let hasError = false;

    // Process stream in real-time with robust error handling
    try {
      for await (const item of result.stream) {
        // Process grounding metadata (sources) as soon as they arrive
        if (item.candidates && item.candidates[0].groundingMetadata) {
          const extractedSources = extractSources(item.candidates[0].groundingMetadata);
          if (extractedSources.length > 0 && !searchNotified) {
            res.write(JSON.stringify({ requestId, type: 'search_start', message: '🔍 Searching for current data via Google...' }) + '\n');
            if (typeof res.flush === 'function') { res.flush(); }
            sources = extractedSources;
            searchNotified = true;
          }
        }
        
        // Process text parts
        if (item.candidates && item.candidates[0].content.parts) {
          for (const part of item.candidates[0].content.parts) {
            // Handle text
            if (part.text) {
              const textChunk = part.text;
              fullText += textChunk; // Build complete text

              // 🔍 DEBUG: First response chunk from Gemini
              if (fullText.length < 100) { // Only log first chunk
                console.log('📤 [BACKEND-DEBUG] First Gemini response chunk:', {
                  requestId,
                  firstChunk: textChunk.substring(0, 100),
                  chunkLanguage: textChunk.length > 5 ? 'detected_soon' : 'too_short',
                  timestamp: new Date().toISOString()
                });
              }
              
              // 🚀 ROBUST STREAMING: Send raw chunks with immediate flush
              res.write(JSON.stringify({ 
                requestId,
                type: 'text', 
                content: textChunk
              }) + '\n');
              if (typeof res.flush === 'function') { res.flush(); }
            }
            
            // Handle function calls (tool use)
            if (part.functionCall) {
              console.log('🎨 [GEMINI] Function call detected:', part.functionCall.name);
              console.log('🔍 [DEBUG] Function call args:', part.functionCall.args);
              
              if (part.functionCall.name === 'generate_image') {
                try {
                  console.log('🔍 [DEBUG] Calling Imagen API directly...');
                  
                  // Call Imagen API directly (same logic as /api/imagen.js)
                  const { prompt, imageCount = 1 } = part.functionCall.args;
                  
                  // Parse JSON credentials - same setup as current Gemini API
                  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
                  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
                  const location = 'us-central1';
                  const model = 'imagen-4.0-generate-preview-06-06';
                  
                  const requestBody = {
                    instances: [{ prompt: prompt.trim() }],
                    parameters: {
                      sampleCount: Math.min(Math.max(1, imageCount), 4),
                      aspectRatio: "1:1",
                      outputMimeType: "image/png"
                    }
                  };

                  const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

                  // Get access token using same auth as Gemini
                  const { GoogleAuth } = await import('google-auth-library');
                  const auth = new GoogleAuth({
                    credentials: credentials,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                  });
                  
                  const authClient = await auth.getClient();
                  const accessToken = await authClient.getAccessToken();

                  // Call Imagen API directly
                  const imagenResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken.token}`,
                      'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify(requestBody)
                  });

                  if (imagenResponse.ok) {
                    const imagenResult = await imagenResponse.json();
                    
                    // Process images same way as /api/imagen.js
                    const images = [];
                    for (const prediction of imagenResult.predictions || []) {
                      if (prediction.bytesBase64Encoded) {
                        images.push({
                          base64: prediction.bytesBase64Encoded,
                          mimeType: 'image/png'
                        });
                      }
                    }
                    
                    // Send images to client
                    res.write(JSON.stringify({
                      requestId,
                      type: 'image_generated',
                      images: images
                    }) + '\n');
                    if (typeof res.flush === 'function') { res.flush(); }
                    
                    console.log('✅ [GEMINI] Images generated successfully:', images.length);
                    
                    // After successful image generation, end the stream
                    // AI has "responded" with functionCall, no more text chunks expected
                    return;
                  } else {
                    const errorText = await imagenResponse.text();
                    console.error('❌ [GEMINI] Imagen API failed:', imagenResponse.status, errorText);
                    
                    // Send error chunk to client
                    res.write(JSON.stringify({
                      requestId,
                      type: 'error',
                      message: `Imagen API failed: ${imagenResponse.status} - ${errorText}`
                    }) + '\n');
                    if (typeof res.flush === 'function') { res.flush(); }
                    return; // End stream after error
                  }
                } catch (imagenError) {
                  console.error('💥 [GEMINI] Imagen call error:', imagenError);
                  
                  // Send error chunk to client
                  res.write(JSON.stringify({
                    requestId,
                    type: 'error',
                    message: `Image generation failed: ${imagenError.message}`
                  }) + '\n');
                  if (typeof res.flush === 'function') { res.flush(); }
                  return; // End stream after error
                }
              } else if (part.functionCall.name === 'generate_pdf') {
                try {
                  console.log('📄 [DEBUG] Calling PDF generation API...');

                  const { title, content, documentType = 'document' } = part.functionCall.args;

                  // Call PDF generation API
                  const baseUrl = process.env.NODE_ENV === 'production' ?
                    `https://${process.env.VERCEL_URL || 'omnia-one.com'}` :
                    'http://localhost:3001';
                  const pdfResponse = await fetch(`${baseUrl}/api/generate-pdf`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      title,
                      content,
                      documentType
                    })
                  });

                  if (pdfResponse.ok) {
                    const contentType = pdfResponse.headers.get('content-type');
                    console.log('📄 [DEBUG] PDF response content-type:', contentType);
                    console.log('📄 [DEBUG] PDF response status:', pdfResponse.status);
                    console.log('📄 [DEBUG] PDF response headers:', Object.fromEntries(pdfResponse.headers.entries()));

                    // Check if it's actually a PDF or JSON fallback
                    if (contentType && contentType.includes('application/pdf')) {
                      // PDF generated successfully
                      const pdfBuffer = await pdfResponse.arrayBuffer();

                      // Fix for Vercel: Convert ArrayBuffer to base64 without Buffer
                      const uint8Array = new Uint8Array(pdfBuffer);
                      console.log('📄 [DEBUG] PDF buffer size:', pdfBuffer.byteLength);
                      console.log('📄 [DEBUG] First 10 bytes:', Array.from(uint8Array.slice(0, 10)));

                      // Fix for Vercel: Convert ArrayBuffer to base64 without Buffer
                      let binaryString = '';
                      for (let i = 0; i < uint8Array.length; i++) {
                        binaryString += String.fromCharCode(uint8Array[i]);
                      }
                      const base64PDF = btoa(binaryString);

                      console.log('📄 [DEBUG] Binary string length:', binaryString.length);
                      console.log('📄 [DEBUG] First 20 chars of binary:', binaryString.substring(0, 20));

                      console.log('📄 [DEBUG] PDF base64 first 100 chars:', base64PDF.substring(0, 100));
                      console.log('📄 [DEBUG] PDF base64 should start with "JVBERi" for %PDF header');

                      // Send PDF to client
                      res.write(JSON.stringify({
                        requestId,
                        type: 'pdf_generated',
                        title,
                        base64: base64PDF,
                        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                      }) + '\n');
                      if (typeof res.flush === 'function') { res.flush(); }

                      console.log('✅ [GEMINI] PDF generated successfully:', title);
                      return; // End stream after PDF generation

                    } else {
                      // HTML fallback received
                      const fallbackData = await pdfResponse.json();

                      res.write(JSON.stringify({
                        requestId,
                        type: 'pdf_fallback',
                        title,
                        html: fallbackData.html,
                        message: 'PDF content ready (HTML format)'
                      }) + '\n');
                      if (typeof res.flush === 'function') { res.flush(); }

                      console.log('📄 [GEMINI] PDF fallback (HTML) sent:', title);
                      return;
                    }
                  } else {
                    const errorText = await pdfResponse.text();
                    console.error('❌ [GEMINI] PDF API failed:', pdfResponse.status, errorText);

                    res.write(JSON.stringify({
                      requestId,
                      type: 'error',
                      message: `PDF generation failed: ${pdfResponse.status} - ${errorText}`
                    }) + '\n');
                    if (typeof res.flush === 'function') { res.flush(); }
                    return;
                  }
                } catch (pdfError) {
                  console.error('💥 [GEMINI] PDF call error:', pdfError);

                  res.write(JSON.stringify({
                    requestId,
                    type: 'error',
                    message: `PDF generation failed: ${pdfError.message}`
                  }) + '\n');
                  if (typeof res.flush === 'function') { res.flush(); }
                  return;
                }
              }
            }
          }
        }
      }
    } catch (streamError) {
      console.error('💥 Stream processing error [ID:', requestId || 'NO_ID', ']:', streamError);
      hasError = true;
      
      // Send error chunk to client
      res.write(JSON.stringify({
        requestId,
        type: 'error',
        message: 'Stream processing failed: ' + streamError.message
      }) + '\n');
      if (typeof res.flush === 'function') { res.flush(); }
    } finally {
      // Always send final message and close connection
      if (!hasError) {
        res.write(JSON.stringify({
          requestId,
          type: 'completed',
          sources: sources,
          webSearchUsed: sources.length > 0
        }) + '\n');
        console.log('✅ Gemini streaming completed');
      } else {
        res.write(JSON.stringify({
          requestId,
          type: 'end',
          error: true,
          message: 'Stream ended with errors'
        }) + '\n');
        console.log('❌ Gemini streaming ended with errors');
      }
      
      if (typeof res.flush === 'function') { res.flush(); }
      res.end();
    }

  } catch (error) {
    console.error('💥 Gemini API error [ID:', req.body?.requestId || 'NO_ID', ']:', error);
    
    // Specific message for service agents provisioning
    if (error.message && error.message.includes('Service agents are being provisioned')) {
      res.write(JSON.stringify({
        requestId: req.body?.requestId,
        error: true,
        rollback: true,
        message: '⏳ Service temporarily unavailable. Try again in a moment.'
      }) + '\n');
    } else if (error.cause?.code === 429 || error.message.includes('429') || error.message.includes('Too Many Requests')) {
      // Handle 429 rate limiting with rollback
      res.write(JSON.stringify({
        requestId: req.body?.requestId,
        error: true,
        rollback: true,
        message: '⏳ Too many requests. Please try again in a moment.'
      }) + '\n');
    } else {
      res.write(JSON.stringify({
        requestId: req.body?.requestId,
        error: true,
        rollback: true,
        message: 'Server error: ' + error.message
      }) + '\n');
    }
    res.end();
  }
}


// 🔍 ENHANCE SEARCH WITH TIMESTAMP
function enhanceForSearch(query) {
  if (needsCurrentData(query)) {
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${query}\n\nCurrent time: ${currentTime}`;
  }
  return query;
}

// 🎯 CURRENT DATA DETECTION
function needsCurrentData(query) {
  const keywords = [
    'current', 'latest', 'now', 'today',
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

// 📄 GET MIME TYPE FROM FILE NAME
function getMimeTypeFromName(fileName) {
  if (!fileName) return 'application/pdf';
  
  const extension = fileName.toLowerCase().split('.').pop();
  
  const mimeTypes = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'txt': 'text/plain',  // Only supported text format
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  
  return mimeTypes[extension] || 'application/pdf';
}