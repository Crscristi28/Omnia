// api/grok.js - GROK-3 API ENDPOINT WITH DEEPSEARCH + TIME AWARENESS + GLOBAL SOURCES
export default async function handler(req, res) {
  // CORS headers for streaming
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
    const { messages, system, max_tokens = 2000, search_parameters, language = 'cs' } = req.body;
    const API_KEY = process.env.GROK_API_KEY;
    
    if (!API_KEY) {
      res.write(JSON.stringify({
        error: true,
        message: 'Grok API key není nastaven'
      }) + '\n');
      return res.end();
    }

    const recentMessages = messages.slice(-6); // Keep more context for Grok
    
    // 🎯 DEEPSEARCH DETECTION - Enhanced for financial/sentiment analysis
    const needsDeepSearch = (messages) => {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const deepSearchPatterns = [
        /cena|price|kurz|kolik stojí/i,           // Finance prices
        /sentiment|názor|co si myslí/i,           // Sentiment analysis
        /akcie|stock|nasdaq|nyse/i,               // Stock markets
        /bitcoin|btc|eth|crypto|krypto/i,         // Cryptocurrency
        /zprávy|news|trendy|trends/i,             // News & trends
        /analýza|analysis|prognóza|prediction/i,  // Analysis requests
        /x\.com|twitter|social/i,                 // Social media queries
        /trh|market|burza|exchange/i              // Market queries
      ];
      return deepSearchPatterns.some(pattern => pattern.test(lastMessage));
    };

    // 🕐 TIME-AWARENESS DETECTION - Basic queries needing timestamp
    const needsTimeAwareness = (messages) => {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const timePatterns = [
        /počasí|weather|teplota|déšť/i,           // Weather  
        /otevírací doba|opening hours/i,          // Business hours
        /výsledky|results|skóre|score/i,          // Sports results
        /aktuální|current|latest|teď|now/i        // General current info
      ];
      return timePatterns.some(pattern => pattern.test(lastMessage));
    };

    // 🌍 QUERY TRANSLATION FOR GLOBAL SOURCES
    const translateQueryToEnglish = (query) => {
      const translations = {
        'jaká je cena': 'what is the current price of',
        'kurz': 'exchange rate of',
        'počasí': 'current weather in',
        'akcie': 'stock price of',
        'bitcoin': 'bitcoin price',
        'ethereum': 'ethereum price',
        'sentiment': 'sentiment analysis for',
        'co si myslí': 'what do people think about',
        'názor': 'opinion about',
        'zprávy': 'latest news about',
        'trendy': 'trends for',
        'analýza': 'analysis of',
        'prognóza': 'prediction for',
        'výsledky': 'latest results for',
        'kolik stojí': 'what is the current price of',
        'dolar': 'USD exchange rate',
        'euro': 'EUR exchange rate'
      };
      
      let englishQuery = query;
      for (const [czech, english] of Object.entries(translations)) {
        englishQuery = englishQuery.replace(new RegExp(czech, 'gi'), english);
      }
      return englishQuery;
    };

    // 🕐 GET LANGUAGE-SPECIFIC TIME FORMAT
    const getTimeFormat = (language) => {
      const formats = {
        'cs': 'Je [current time] [timezone], [date]',
        'en': 'It is [current time] [timezone], [date]',
        'ro': 'Este [current time] [timezone], [date]'
      };
      return formats[language] || formats['cs'];
    };

    // 🔧 ENHANCE MESSAGES FOR DEEPSEARCH + TIME-AWARENESS + GLOBAL SOURCES
    const enhancedMessages = [...recentMessages];
    const lastMessage = enhancedMessages[enhancedMessages.length - 1];
    const originalQuery = lastMessage.content;
    const englishQuery = translateQueryToEnglish(originalQuery);
    const timeFormat = getTimeFormat(language);
    
    const isDeepSearchQuery = needsDeepSearch(recentMessages);
    const isTimeAwareQuery = needsTimeAwareness(recentMessages);
    
    if (isDeepSearchQuery) {
      console.log('🔍 DeepSearch triggered for query:', originalQuery.substring(0, 50));
      console.log('🌍 Translated to English:', englishQuery.substring(0, 50));
      
      // DEEPSEARCH ENHANCEMENT - Full financial analysis
      lastMessage.content = `DeepSearch: ${englishQuery}. Search inside X as well. Start response with "${timeFormat}" then provide current price, X/Twitter sentiment analysis, recent news context, and trend prediction. Respond in ${language} with comprehensive financial analysis.`;
      
    } else if (isTimeAwareQuery) {
      console.log('🕐 Time-awareness triggered for query:', originalQuery.substring(0, 50));
      console.log('🌍 Translated to English:', englishQuery.substring(0, 50));
      
      // BASIC TIME-AWARENESS ENHANCEMENT
      lastMessage.content = `User asked "${originalQuery}" in ${language}. Start response with current time acknowledgment like "${timeFormat}" then search for "${englishQuery}" using global English sources for most current data. Respond in ${language} with this professional time-aware format.`;
    }
    
    // Prepare messages with system prompt
    const grokMessages = [
      {
        role: 'system',
        content: system || "Jsi Omnia, pokročilý AI asistent."
      },
      ...enhancedMessages
    ];

    const grokRequest = {
      model: "grok-3",
      max_tokens: max_tokens,
      messages: grokMessages,
      stream: false,  // Grok streaming needs different parsing
      temperature: 0.7
    };

    // Add search parameters if provided
    if (search_parameters) {
      grokRequest.search_parameters = search_parameters;
      console.log('🔍 Grok search enabled with parameters:', search_parameters);
    }

    console.log('🚀 Sending request to Grok-3...');
    if (isDeepSearchQuery) {
      console.log('📊 DeepSearch mode: Financial analysis + X sentiment');
    } else if (isTimeAwareQuery) {
      console.log('🕐 Time-aware mode: Current data with timestamp');
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(grokRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Grok API error:', response.status, errorText);
      res.write(JSON.stringify({
        error: true,
        message: `HTTP ${response.status}: ${errorText}`
      }) + '\n');
      return res.end();
    }

    const data = await response.json();
    console.log('✅ Grok response received');
    console.log('🔍 Full Grok response:', JSON.stringify(data, null, 2));
    
    // Extract response text
    const textContent = data.choices?.[0]?.message?.content?.trim() || "Nepodařilo se získat odpověď.";

    // 🎯 VALIDATE DEEPSEARCH/TIME-AWARE RESPONSE
    const hasTimestamp = /\d{1,2}:\d{2}|AM|PM|CEST|CET|UTC|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|dneska|today|teď|now|je\s+\d{1,2}:/i.test(textContent);
    const hasDateFormat = /\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{4}-\d{2}-\d{2}/i.test(textContent);
    const hasSentiment = /sentiment|názor|pozitivní|negativní|bullish|bearish|\d+%.*pozitivní|\d+%.*negativní/i.test(textContent);
    const hasPriceData = /\$\d+|\d+\s?USD|\d+\s?EUR|\d+\s?CZK|\d+\.\d+|\d+,\d+/i.test(textContent);
    
    if (isDeepSearchQuery) {
      console.log('🔍 DeepSearch validation:');
      console.log('  - Has timestamp:', hasTimestamp ? 'SUCCESS ✅' : 'FAILED ❌');
      console.log('  - Has price data:', hasPriceData ? 'SUCCESS ✅' : 'FAILED ❌');
      console.log('  - Has sentiment:', hasSentiment ? 'SUCCESS ✅' : 'FAILED ❌');
      
      if (!hasTimestamp || !hasPriceData) {
        console.warn('⚠️ DeepSearch response missing key components');
        console.warn('⚠️ Response preview:', textContent.substring(0, 150));
      }
    } else if (isTimeAwareQuery) {
      console.log('🕐 Time-awareness validation:');
      console.log('  - Has timestamp:', hasTimestamp ? 'SUCCESS ✅' : 'FAILED ❌');
      console.log('  - Has date:', hasDateFormat ? 'SUCCESS ✅' : 'FAILED ❌');
      
      if (!hasTimestamp || !hasDateFormat) {
        console.warn('⚠️ Response missing proper time/date format for time-sensitive query');
        console.warn('⚠️ Response preview:', textContent.substring(0, 100));
      }
    }

    // Extract citations/sources - check multiple locations
    let extractedSources = [];
    const citations = data.citations || data.choices?.[0]?.message?.citations || data.choices?.[0]?.citations || [];
    const webSearchUsed = citations && citations.length > 0;
    
    if (citations && Array.isArray(citations)) {
      console.log('🔗 Found', citations.length, 'citations from Grok');
      console.log('📊 Citations details:', JSON.stringify(citations, null, 2));
      
      extractedSources = citations
        .filter(citation => citation && typeof citation === 'string')
        .map((url, index) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            
            // Enhanced title mapping for financial sources
            let title = domain;
            if (domain.includes('finance.yahoo')) title = 'Yahoo Finance';
            else if (domain.includes('marketwatch')) title = 'MarketWatch';
            else if (domain.includes('bloomberg')) title = 'Bloomberg';
            else if (domain.includes('reuters')) title = 'Reuters';
            else if (domain.includes('cnbc')) title = 'CNBC';
            else if (domain.includes('tradingview')) title = 'TradingView';
            else if (domain.includes('coinmarketcap')) title = 'CoinMarketCap';
            else if (domain.includes('coingecko')) title = 'CoinGecko';
            else if (domain.includes('binance')) title = 'Binance';
            else if (domain.includes('x.com') || domain.includes('twitter')) title = 'X (Twitter)';
            else if (domain.includes('weather')) title = 'Weather - ' + domain;
            else if (domain.includes('pocasi')) title = 'Počasí - ' + domain;
            else if (domain.includes('meteo')) title = 'Meteo - ' + domain;
            else if (domain.includes('chmi')) title = 'ČHMÚ';
            else if (domain.includes('news')) title = 'News - ' + domain;
            else title = domain;
            
            return {
              title: title,
              url: url,
              snippet: `Zdroj ${index + 1}`,
              domain: domain,
              timestamp: Date.now()
            };
          } catch (urlError) {
            console.warn('⚠️ Invalid URL in Grok citation:', url);
            return null;
          }
        })
        .filter(source => source !== null)
        .slice(0, 10); // Limit to 10 sources
    }

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🔍 Web search used:', webSearchUsed);
    console.log('🔗 Sources found:', extractedSources.length);

    if (webSearchUsed) {
      // Enhanced search notification for DeepSearch
      const searchMessage = isDeepSearchQuery 
        ? '🔍 DeepSearch: Analyzuji trhy + X sentiment...'
        : '🔍 Vyhledávám aktuální informace...';
        
      res.write(JSON.stringify({
        type: 'search_start',
        message: searchMessage
      }) + '\n');
      
      // Longer delay for DeepSearch (more comprehensive analysis)
      const delay = isDeepSearchQuery ? 2000 : 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

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
    
    // Send final completion with enhanced metadata
    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      webSearchUsed: webSearchUsed,
      sources: extractedSources,
      citations: extractedSources,
      deepSearch: isDeepSearchQuery,
      timeAware: isTimeAwareQuery,
      hasTimestamp: hasTimestamp,
      hasDateFormat: hasDateFormat,
      hasSentiment: hasSentiment,
      hasPriceData: hasPriceData,
      language: language
    }) + '\n');

    console.log('✅ Grok streaming completed with sources:', extractedSources.length);
    console.log('✅ Enhanced features:', { 
      deepSearch: isDeepSearchQuery, 
      timeAware: isTimeAwareQuery, 
      hasTimestamp, 
      hasSentiment,
      hasPriceData 
    });
    console.log('✅ Grok streaming completed');
    res.end();

  } catch (error) {
    console.error('💥 Fatal error in Grok streaming:', error);
    
    res.write(JSON.stringify({
      error: true,
      message: 'Server error: ' + error.message
    }) + '\n');
    
    res.end();
  }
}