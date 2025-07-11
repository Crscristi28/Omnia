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
    
    // 🎯 SEARCH QUERY ENHANCEMENT - Force preferred sources
    const lastUserMessage = recentMessages[recentMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const query = lastUserMessage.content.toLowerCase();
      let enhanced = false;
      
      // 💰 ANY FINANCIAL INSTRUMENTS - stocks, ETFs, bonds, forex, commodities
      if (query.match(/cena|price|kurz|akcie|stock|etf|bond|dluhopis|forex|komodity|commodity|nasdaq|dow|s&p|dax|trading|quote|kotace/i)) {
        lastUserMessage.content += " (search real-time data on tradingview.com or finance.yahoo.com first)";
        enhanced = true;
      }
      
      // 🪙 CRYPTO - any cryptocurrency
      else if (query.match(/bitcoin|btc|ethereum|eth|crypto|krypto|binance|coinbase|defi|altcoin|token/i)) {
        lastUserMessage.content += " (search current prices on coinmarketcap.com or coingecko.com)";
        enhanced = true;
      }
      
      // 🌤️ WEATHER - any location
      else if (query.match(/počasí|weather|teplota|temperature|předpověď|forecast|prší|rain|sníh|snow/i)) {
        lastUserMessage.content += " (search current conditions on accuweather.com or weather.com)";
        enhanced = true;
      }
      
      // 📰 NEWS & CURRENT EVENTS
      else if (query.match(/zprávy|news|aktuality|novinky|dnes|today|včera|yesterday|breaking|aktuální|current/i)) {
        // Czech news
        if (query.match(/česk|czech|praha|čr/i)) {
          lastUserMessage.content += " (search latest on idnes.cz or ct24.cz)";
        } else {
          lastUserMessage.content += " (search latest on news.google.com or reuters.com)";
        }
        enhanced = true;
      }
      
      // 🛍️ PRODUCTS & PRICES (e-commerce)
      else if (query.match(/koupit|buy|nakoupit|objednat|eshop|e-shop|amazon|ebay|alza|mall/i)) {
        lastUserMessage.content += " (search on relevant shopping sites for current prices)";
        enhanced = true;
      }
      
      // 📊 GENERAL CURRENT DATA - anything that needs fresh info
      else if (query.match(/kolik|how much|how many|současn|current|aktuáln|latest|teď|now|live|real-time/i)) {
        lastUserMessage.content += " (search for most current information available)";
        enhanced = true;
      }
      
      if (enhanced) {
        console.log('🎯 Query enhanced for better search targeting');
      }
    }
    
    // 🔧 FIXED: Use system prompt from claude.service.js DIRECTLY
    const finalSystem = system || "Jsi Omnia, pokročilý AI asistent.";

    // 🚀 OPTIMIZED: Increased search limit for better real-time data
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: finalSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5  // ⚡ INCREASED from 2 to 3 for better accuracy
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
    
    // 🎯 UPDATED SOURCE LIMITS FOR BETTER REAL-TIME DATA
    const query = recentMessages[recentMessages.length - 1]?.content?.toLowerCase() || '';
    
    let MAX_SOURCES = 10; // Default
    
    // Weather = 4 sources (increased from 2)
    if (query.match(/počasí|weather|vremea|météo|wetter|pogoda|teplota|temperature|prší|rain|sníh|snow/i)) {
      MAX_SOURCES = 4;
      console.log('🌤️ Weather query detected - MAX 4 sources');
    }
    // Products/Websites/Shops = 3 sources (unchanged)
    else if (query.match(/\.com|\.cz|\.sk|\.ro|website|stránka|web|eshop|e-shop|obchod|shop|store|magazin|product|produkt|výrobek|iphone|samsung|macbook|laptop|telefon|boty|shoes|oblečení|clothes/i)) {
      MAX_SOURCES = 3;
      console.log('🛍️ Product/Website/Shop query detected - MAX 3 sources');
    }
    // Finance/Stocks/Crypto = 8 sources (increased from 5)
    else if (query.match(/cena|price|kolik stojí|combien|precio|стоимость|курс|kurz|akcie|stock|crypto|bitcoin|eth|nasdaq|dow|s&p|trading|finance|$|€|kč/i)) {
      MAX_SOURCES = 8;
      console.log('💰 Finance/Stock/Crypto query detected - MAX 8 sources');
    }
    // News/Current Events = 6 sources
    else if (query.match(/news|zprávy|noviny|aktuality|current|aktuální|dnes|today|včera|yesterday/i)) {
      MAX_SOURCES = 6;
      console.log('📰 News/Current events detected - MAX 6 sources');
    }
    // Deep Research = 10 sources
    else if (query.match(/deep research|kompletní analýza|complete analysis|detailed|podrobný|hloubková|in-depth|comprehensive/i)) {
      MAX_SOURCES = 10;
      console.log('🔬 Deep research detected - MAX 10 sources');
    }
    // Everything else = 6 sources
    else {
      MAX_SOURCES = 6;
      console.log('📊 General query - MAX 6 sources');
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