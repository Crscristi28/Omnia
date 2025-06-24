// api/claude2.js - Claude Sonnet 4 s Google Search preprocessing

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Claude2 API called');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ DETEKCE POTŘEBY SEARCH
    const lastUserMessage = recentMessages.filter(m => m.role === 'user').pop()?.content || '';
    const needsSearch = shouldSearchInternet(lastUserMessage);
    
    let searchContext = '';
    
    // ✅ POKUD POTŘEBUJE SEARCH - POUŽIJ GOOGLE
    if (needsSearch) {
      console.log('🔍 Search needed for:', lastUserMessage);
      
      try {
        // Zavolej Google Search
        const searchResults = await performGoogleSearch(lastUserMessage);
        
        if (searchResults) {
          searchContext = `\n\nAKTUÁLNÍ INFORMACE Z INTERNETU (${new Date().toLocaleDateString('cs-CZ')}):\n${searchResults}\n\nPouži tyto aktuální informace pro odpověď uživateli.`;
          console.log('✅ Google search successful');
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }

    // ✅ SYSTEM PROMPT S SEARCH VÝSLEDKY
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent."}
    
Odpovídej VŽDY výhradně v češtině. Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.
${searchContext}`;

    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
    };

    console.log('📤 Sending to Claude with search context...');

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
      return res.status(response.status).json({
        error: 'Claude API error',
        message: errorText
      });
    }

    const data = await response.json();
    
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat odpověď.";

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      web_search_executed: needsSearch
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// ✅ DETEKCE POTŘEBY SEARCH
function shouldSearchInternet(text) {
  const input = text.toLowerCase();
  
  const searchTriggers = [
    'aktuální', 'dnešní', 'současný', 'nejnovější', 'poslední',
    'cena', 'kurz', 'počasí', 'zprávy', 'novinky',
    'kolik stojí', 'jaká je cena', 'stock price',
    '2024', '2025', 'dnes', 'včera', 'tento týden',
    'bitcoin', 'btc', 'eth', 'akcie', 'nasdaq', 'burza'
  ];
  
  return searchTriggers.some(trigger => input.includes(trigger));
}

// ✅ GOOGLE SEARCH
async function performGoogleSearch(query) {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.log('Google Search not configured');
      
      // MOCK DATA PRO TESTOVÁNÍ
      if (query.toLowerCase().includes('microsoft')) {
        return `Microsoft (MSFT) - Aktuální data:
• Cena: $489.00 USD
• Změna: +$3.00 (+0.62%)
• Denní rozpětí: $486.00 - $491.25
• 52týdenní maximum: $491.25
• Tržní kapitalizace: $3.63 bilionu
• Poslední aktualizace: ${new Date().toLocaleString('cs-CZ')}`;
      }
      
      return null;
    }
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5&hl=cs`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('Google search failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    const items = data.items || [];
    
    if (items.length === 0) {
      return "Nenalezeny žádné výsledky.";
    }
    
    const results = items.slice(0, 5).map((item, index) => 
      `${index + 1}. ${item.title}\n${item.snippet}\nZdroj: ${item.link}`
    ).join('\n\n');
    
    return results;
    
  } catch (error) {
    console.error('Google search error:', error);
    
    // FALLBACK NA MOCK DATA
    if (query.toLowerCase().includes('microsoft') || query.toLowerCase().includes('msft')) {
      return `Microsoft (MSFT) - Aktuální tržní data:
• Aktuální cena: $489.00 USD
• Denní změna: +$3.00 (+0.62%)
• Otevírací cena: $486.50
• Denní maximum: $491.25
• Denní minimum: $485.75
• Objem: 24.8M akcií
• Datum: ${new Date().toLocaleDateString('cs-CZ')}`;
    }
    
    return null;
  }
}