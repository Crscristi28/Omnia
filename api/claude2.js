// api/claude2.js - OPTIMIZED SEARCH & SOURCES LIMITS
export default async function handler(req, res) {
  // CORS headers pro fake streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const recentMessages = messages.slice(-2);  // Ultra minimal for testing phase (maximum cost savings)
    
    // 🔧 FIXED: Use system prompt from claude.service.js DIRECTLY
    const finalSystem = system || "Jsi Omnia, pokročilý AI asistent.";

    // 🚀 OPTIMIZED: Sweet spot for search flexibility
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: finalSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 4  // ⚡ Sweet spot - enough flexibility without waste
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
    
    // 🔗 EXTRACT SOURCES WITH SMART LIMITS
    let extractedSources = [];
    
    // 🎯 Simple approach - let Claude decide how many sources she needs
    const MAX_SOURCES = 8; // Reasonable limit - not too few, not too many
    
    if (data.content) {
      console.log('🔍 Extracting sources from Claude response...');
      
      // Method 1: Extract from citations in text blocks
      for (const item of data.content) {
        if (item.type === 'text' && item.citations && Array.isArray(item.citations)) {
          console.log('✅ Found citations in text block:', item.citations.length);
          
          for (const citation of item.citations) {
            if (citation.url && citation.title && extractedSources.length < MAX_SOURCES) {
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
      
      // Method 2: Extract from web_search_tool_result blocks
      const toolResults = data.content.filter(item => item.type === 'web_search_tool_result');
      
      for (const result of toolResults) {
        if (result.content && Array.isArray(result.content)) {
          for (const searchResult of result.content) {
            if (searchResult.type === 'web_search_result' && 
                searchResult.url && 
                searchResult.title && 
                extractedSources.length < MAX_SOURCES) {
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
      
      // Remove duplicates based on URL
      const uniqueSources = [];
      const seenUrls = new Set();
      
      for (const source of extractedSources) {
        if (!seenUrls.has(source.url) && uniqueSources.length < MAX_SOURCES) {
          seenUrls.add(source.url);
          uniqueSources.push(source);
        }
      }
      
      extractedSources = uniqueSources.slice(0, MAX_SOURCES); // ⚡ ENFORCE HARD LIMIT
      
      console.log('🔗 Total unique sources extracted:', extractedSources.length);
      console.log('📋 Sources:', extractedSources.map(s => ({ title: s.title, domain: s.domain })));
    }
    
    if (webSearchUsed) {
      console.log('🔍 Claude used web_search!');
      // Send search notification
      res.write(JSON.stringify({
        type: 'search_start',
        message: '🔍 Vyhledávám aktuální informace...'
      }) + '\n');
      
      // Small delay to simulate search
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Extrahovat text odpověď
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🔍 Web search executed:', webSearchUsed);
    console.log('🔗 Sources found:', extractedSources.length);

    // 🚀 FAST STREAMING: Send by words instead of letters
    const words = textContent.split(' ');
    
    for (const word of words) {
      res.write(JSON.stringify({
        type: 'text',
        content: word + ' '
      }) + '\n');
      
      // Minimal delay for streaming effect
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    
    // 🔗 Send final completion WITH SOURCES
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
}