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

    const recentMessages = messages.slice(-8);
    
    // 🔧 FIXED: Use system prompt from claude.service.js DIRECTLY
    const finalSystem = system || "Jsi Omnia, pokročilý AI asistent.";

    // 🚀 OPTIMIZED: Reduced search limits
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: finalSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3  // ⚡ REDUCED from 5 to 2! 60% savings
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
    
    // 🎯 SMART SOURCE LIMITS BASED ON QUERY TYPE
    const query = recentMessages[recentMessages.length - 1]?.content?.toLowerCase() || '';
    
    let MAX_SOURCES = 10; // Default
    
    // Weather = 2 sources MAX (same everywhere)
    if (query.match(/počasí|weather|teplota|temperature|prší|rain|sníh|snow|vítr|wind|předpověď|forecast|météo|clima|vrijeme/i)) {
      MAX_SOURCES = 2;
      console.log('🌤️ Weather query detected - MAX 2 sources');
    }
    // Simple facts = 2 sources (clear answers)
    else if (query.match(/hlavní město|capital|prezident|president|kdy se narodil|when was.*born|výška|height|rozloha|area/i)) {
      MAX_SOURCES = 2;
      console.log('📌 Simple fact query - MAX 2 sources');
    }
    // Products/E-commerce = 3 sources (basic info)
    else if (query.match(/iphone|samsung|xbox|playstation|nike|adidas|zara|laptop|notebook|telefon|phone|boty|shoes|hodinky|watch/i) ||
             query.match(/\.com|\.cz|\.sk|website|eshop|e-shop|obchod|shop|store|amazon|alza|mall/i)) {
      MAX_SOURCES = 3;
      console.log('🛍️ Product/Shop query - MAX 3 sources');
    }
    // Local/Events = 3 sources
    else if (query.match(/restaurace|restaurant|hotel|kino|cinema|koncert|concert|festival|kde je|where is|otevírací doba|opening hours/i)) {
      MAX_SOURCES = 3;
      console.log('📍 Local/Event query - MAX 3 sources');
    }
    // Finance/Trading = 5 sources (need accuracy)
    else if (query.match(/cena|price|kolik stojí|akcie|stock|bitcoin|btc|ethereum|eth|crypto|kurz|exchange|nasdaq|dow|s&p 500|trading|forex|usd|eur|czk/i)) {
      MAX_SOURCES = 5;
      console.log('💰 Finance query - MAX 5 sources');
    }
    // News/Current Events = 6 sources (multiple perspectives)
    else if (query.match(/zprávy|news|aktuality|novinky|volby|election|výsledky|results|kdo vyhrál|who won|skandál|scandal/i)) {
      MAX_SOURCES = 6;
      console.log('📰 News query - MAX 6 sources');
    }
    // Technical/Programming = 6 sources
    else if (query.match(/javascript|python|react|vue|angular|api|bug|error|jak opravit|how to fix|programování|programming|code/i)) {
      MAX_SOURCES = 6;
      console.log('💻 Technical query - MAX 6 sources');
    }
    // Research/Analysis = 10 sources (comprehensive)
    else if (query.match(/analýza|analysis|research|výzkum|studie|study|srovnání|comparison|kompletní|complete|detailní|detailed|hloubková|in-depth/i)) {
      MAX_SOURCES = 10;
      console.log('🔬 Deep research - MAX 10 sources');
    }
    // Default = 5 sources (reasonable middle ground)
    else {
      MAX_SOURCES = 5;
      console.log('📊 General query - MAX 5 sources');
    }
    
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

    // 🎭 LETTER-BY-LETTER STREAMING: Posílání textu písmo po písmenu
    const letters = textContent.split('');

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];

      res.write(JSON.stringify({
        type: 'text',
        content: char
      }) + '\n');

      await new Promise(resolve => setTimeout(resolve, 30)); // adjust speed as needed
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