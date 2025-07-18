// api/grok.js - CLEAN GROK API WITH TIME-AWARE TRIGGER (FIXED VERSION)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system, max_tokens = 2000, language } = req.body;
    const API_KEY = process.env.GROK_API_KEY;
    
    if (!API_KEY) {
      res.write(JSON.stringify({ error: true, message: 'Grok API key není nastaven' }) + '\n');
      return res.end();
    }

    // Get last user message and enhance it
    const lastMessage = messages[messages.length - 1];
    const enhancedQuery = enhanceForTimeAware(lastMessage.text || lastMessage.content);
    
    // Prepare messages
    const grokMessages = [
      { role: 'system', content: system || "Jsi Omnia, pokročilý AI asistent." },
      ...messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || msg.content || ''
      }))
    ];
    
    // Replace last user message with enhanced version
    if (grokMessages[grokMessages.length - 1].role === 'user') {
      grokMessages[grokMessages.length - 1].content = enhancedQuery;
    }

    const grokRequest = {
      model: "grok-3",
      max_tokens: 2500,  // Zvýšeno podle Grok's doporučení
      messages: grokMessages,
      stream: false,
      temperature: 0.5,
      search_parameters: {
        mode: "auto",
        return_citations: true,
        max_search_results: 20,  // Zvýšeno pro více dat
        safe_search: false,      // Všechny výsledky
        language_override: "en"  // 🔥 FORCE anglické zdroje - Grok's fix!
      }
    };

    console.log('🚀 Sending to Grok-3 with time-aware enhancement...');

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
      res.write(JSON.stringify({ error: true, message: `HTTP ${response.status}: ${errorText}` }) + '\n');
      return res.end();
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content?.trim() || "Nepodařilo se získat odpověď.";
    const citations = data.citations || data.choices?.[0]?.message?.citations || [];

    console.log('✅ Grok response received, citations:', citations.length);

    // Simple word-by-word streaming
    const words = textContent.split(' ');
    
    if (citations.length > 0) {
      res.write(JSON.stringify({ type: 'search_start', message: '🔍 Vyhledávám nejnovější data...' }) + '\n');
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    for (const word of words) {
      res.write(JSON.stringify({ type: 'text', content: word + ' ' }) + '\n');
      await new Promise(resolve => setTimeout(resolve, 8));
    }
    
    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      citations: citations,
      webSearchUsed: citations.length > 0
    }) + '\n');

    console.log('✅ Grok streaming completed');
    res.end();

  } catch (error) {
    console.error('💥 Grok API error:', error);
    res.write(JSON.stringify({ error: true, message: 'Server error: ' + error.message }) + '\n');
    res.end();
  }
}

// 🔥 TIME-AWARE ENHANCEMENT - FIXED TIMESTAMP + CURRENT PRICE
function enhanceForTimeAware(query) {
  if (needsRealTimeData(query)) {
    const pragueTime = getPragueTimestamp();
    console.log('Debug: Forced Prague time for search:', pragueTime); // Debug
    return `User query: ${query}. Start your response with exact Prague time ${pragueTime} (ignore other timestamps). For stock prices, use CURRENT PRICE (the large number), NOT previous close or historical data. Provide freshest data from global English sources. Answer in user's language.`;
  }
  return query;
}

// 🕐 PRAGUE TIMESTAMP GENERATOR - MANUAL UTC+2 APPROACH
function getPragueTimestamp() {
  const now = new Date();
  
  // Manual UTC+2 calculation for summer time
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pragueTime = new Date(utc + (2 * 3600000)); // UTC+2
  
  const year = pragueTime.getFullYear();
  const month = String(pragueTime.getMonth() + 1).padStart(2, '0');
  const day = String(pragueTime.getDate()).padStart(2, '0');
  const hours = String(pragueTime.getHours()).padStart(2, '0');
  const minutes = String(pragueTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 🎯 REAL-TIME DATA DETECTION
function needsRealTimeData(query) {
  const keywords = [
    'stock', 'price', 'cena', 'kurz', 'akcie', 'shares',
    'weather', 'počasí', 'teplota', 'temperatura', 
    'news', 'zprávy', 'breaking', 'latest',
    'bitcoin', 'crypto', 'ethereum', 'btc', 'eth',
    'current', 'aktuální', 'teď', 'now', 'dnes', 'today',
    'exchange', 'rate', 'měna', 'dollar', 'euro'
  ];
  
  return keywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
}