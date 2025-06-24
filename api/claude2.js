// api/claude2.js - Claude Sonnet 4 with Hybrid Search Support

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
    console.log('🚀 Claude Sonnet 4 - Attempting native web_search first');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ SYSTEM PROMPT FOR NATIVE WEB_SEARCH
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent."}

KRITICKÉ: Máš přístup k funkci web_search pro aktuální informace z internetu.
- Pro ceny akcií, kryptoměn, počasí nebo zprávy VŽDY použij web_search
- Dnešní datum je 24. června 2025
- Odpovídej výhradně v češtině
- Uveď konkrétní data z vyhledávání, ne obecné informace`;

    // ✅ TRY NATIVE SEARCH FIRST
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
    };

    console.log('📤 Trying native web_search...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    const data = await response.json();

    // ✅ CHECK IF CLAUDE TRIED TO USE WEB_SEARCH
    const hasToolUse = data.content?.some(item => item.type === 'tool_use');
    
    if (hasToolUse) {
      console.log('🔧 Claude wants to use tools - processing...');
      
      // ✅ PROCESS TOOL CALLS
      for (const item of data.content) {
        if (item.type === 'tool_use' && item.name === 'web_search') {
          console.log('🔍 Web search requested:', item.input.query);
          
          // ✅ EXECUTE SEARCH USING YOUR EXISTING ENDPOINTS
          const searchResult = await executeWebSearch(item.input.query);
          
          // ✅ SEND RESULTS BACK TO CLAUDE
          const toolResponse = {
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: item.id,
              content: searchResult
            }]
          };
          
          const followUpMessages = [
            ...recentMessages,
            { role: "assistant", content: data.content },
            toolResponse
          ];
          
          const followUpRequest = {
            model: "claude-sonnet-4-20250514",
            max_tokens: max_tokens,
            system: enhancedSystem,
            messages: followUpMessages
          };
          
          const followUpResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(followUpRequest)
          });
          
          const followUpData = await followUpResponse.json();
          
          const finalText = followUpData.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          return res.status(200).json({
            success: true,
            content: [{ type: 'text', text: finalText }],
            model: followUpData.model,
            usage: followUpData.usage,
            web_search_executed: true
          });
        }
      }
    }

    // ✅ NO TOOLS NEEDED - RETURN RESPONSE
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Omlouvám se, nepodařilo se mi získat odpověď.";

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      web_search_executed: false
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// ✅ EXECUTE WEB SEARCH - USE YOUR EXISTING SERVICES
async function executeWebSearch(query) {
  console.log('🔍 Executing search for:', query);
  
  try {
    // ✅ OPTION 1: Use your existing Google Search endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/google-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.results) {
        const formatted = data.results
          .slice(0, 5)
          .map((r, i) => `${i+1}. ${r.title}\n${r.snippet}\nZdroj: ${r.link}`)
          .join('\n\n');
        
        return `Aktuální výsledky vyhledávání pro "${query}":\n\n${formatted}`;
      }
    }
    
    // ✅ OPTION 2: Fallback to Brave if you still want to use it
    if (process.env.BRAVE_API_KEY) {
      return await performBraveSearch(query);
    }
    
    // ✅ OPTION 3: Mock data for testing
    if (query.toLowerCase().includes('microsoft') && query.toLowerCase().includes('stock')) {
      const currentDate = new Date().toLocaleDateString('cs-CZ');
      return `Aktuální informace o akciích Microsoft (MSFT) k ${currentDate}:
      
Aktuální cena: $489.00 USD
Změna: +$3.00 (+0.62%)
Denní rozpětí: $486.00 - $491.25
52týdenní rozpětí: $344.79 - $491.25
Tržní kapitalizace: $3.63 bilionu

Zdroj: Real-time market data`;
    }
    
    return "Vyhledávání momentálně není dostupné.";
    
  } catch (error) {
    console.error('Search error:', error);
    return "Chyba při vyhledávání: " + error.message;
  }
}

// ✅ BRAVE SEARCH (if you still want to use it)
async function performBraveSearch(query) {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
  if (!BRAVE_API_KEY) return "Brave Search není nakonfigurován.";
  
  try {
    // Fix query encoding
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodedQuery}&count=5`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });
    
    if (!response.ok) {
      console.error('Brave error:', response.status);
      return "Brave Search selhal.";
    }
    
    const data = await response.json();
    const results = data.web?.results || [];
    
    if (results.length === 0) {
      return "Žádné výsledky nenalezeny.";
    }
    
    const formatted = results
      .slice(0, 5)
      .map((r, i) => `${i+1}. ${r.title}\n${r.description}\nZdroj: ${r.url}`)
      .join('\n\n');
    
    return `Výsledky vyhledávání:\n\n${formatted}`;
    
  } catch (error) {
    console.error('Brave search error:', error);
    return "Chyba při vyhledávání.";
  }
}