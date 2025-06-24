// api/claude2.js - Enhanced s EU lokalizací a prompt caching

export default async function handler(req, res) {
  // CORS headers
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
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent."}
    
Odpovídej VŽDY výhradně v češtině. Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.
Máš přístup k web_search funkci pro vyhledávání aktuálních informací na internetu.
Automaticky používej web_search když potřebuješ aktuální informace o cenách, počasí, zprávách nebo jakýchkoli datech co se mění.
Zaměřuj se na české a evropské zdroje kde je to relevantní. Pro místní informace o ČR prioritizuj české weby.`;

    // ✅ Enhanced tools s EU lokalizací (nejbližší k ČR)
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
          // ✅ Použít Vídeň (nejbližší podporované město k Praze)
          user_location: {
            type: "approximate",
            city: "Vienna",
            region: "Vienna",
            country: "AT", // Rakousko - nejbližší podporovaná země
            timezone: "Europe/Vienna"
          },
          // ✅ Domain filtering pro české a evropské zdroje
          allowed_domains: [
            "idnes.cz",
            "novinky.cz", 
            "aktualne.cz",
            "irozhlas.cz",
            "ct24.ceskatelevize.cz",
            "patria.cz",
            "finance.cz",
            "coindesk.com",
            "binance.com",
            "coingecko.com",
            "bloomberg.com",
            "reuters.com",
            "bbc.com",
            "europen.eu"
          ]
        }
      ]
    };

    console.log('🚀 Sending enhanced request to Claude Sonnet 4...');
    console.log('🌍 Using Vienna location (closest to Prague)');

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
        message: `HTTP ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    console.log('✅ Enhanced Claude Sonnet 4 response received');
    
    // Check for web search usage
    const toolUses = data.content?.filter(item => item.type === 'tool_use') || [];
    const webSearchUsed = toolUses.some(t => t.name === 'web_search');
    
    if (webSearchUsed) {
      console.log('🔍 Claude used web_search with Vienna location!');
    }
    
    // Check for caching
    const cacheReadTokens = data.usage?.cache_read_input_tokens || 0;
    if (cacheReadTokens > 0) {
      console.log('💾 Used cached tokens:', cacheReadTokens);
    }
    
    // Extrahovat text odpověď
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🔍 Web search executed:', webSearchUsed);

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      tools_used: toolUses.length > 0,
      web_search_executed: webSearchUsed,
      cache_read_tokens: cacheReadTokens,
      location_used: "Vienna, AT (closest to Prague)",
      debug_info: {
        tools_available: ['web_search_20250305'],
        tools_used: toolUses.map(t => t.name),
        allowed_domains: ["Czech and European sources prioritized"],
        message_count: recentMessages.length
      }
    });

  } catch (error) {
    console.error('💥 Fatal error in Claude API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}