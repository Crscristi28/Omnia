// api/claude2.js - SKUTEČNÝ Claude Sonnet 4 s Native Web Search

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

    // Připravit zprávy (max 8 posledních)
    const recentMessages = messages.slice(-8);
    
    // ✅ SYSTEM PROMPT S INSTRUKCEMI PRO WEB_SEARCH
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent s přístupem k web_search funkci."}

DŮLEŽITÉ INSTRUKCE:
- Odpovídej VŽDY výhradně v češtině, gramaticky správně a přirozeně
- Máš přístup k web_search funkci pro vyhledávání aktuálních informací na internetu
- AUTOMATICKY používej web_search když uživatel potřebuje:
  * Aktuální ceny akcií, kryptoměn, kurzy měn
  * Současné počasí
  * Nejnovější zprávy a události
  * Aktuální informace o firmách, produktech
  * Jakékoli údaje, které se mění denně/týdně
- Když použiješ web_search, VŽDY poskytni konkrétní odpověď na základě nalezených informací
- NIKDY neříkej "zkontroluj na jiných stránkách" nebo "hledej jinde"
- Buď konkrétní, užitečný a přímo odpověz na uživatelovu otázku
- Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}`;

    // ✅ CLAUDE REQUEST S WEB_SEARCH TOOLS
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          name: "web_search",
          description: "Search the web for current, up-to-date information. Use this when you need recent data like stock prices, weather, news, or any information that changes frequently."
        }
      ]
    };

    console.log('🚀 Sending request to Claude Sonnet 4...');
    console.log('📊 Messages count:', recentMessages.length);
    console.log('🔧 Tools available: web_search');

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
    console.log('✅ Claude response received');
    
    // Debug logging pro tools usage
    if (data.usage) {
      console.log('📈 Usage stats:', {
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens
      });
    }
    
    // Zkontrolovat jestli Claude použil tools
    const usedTools = data.content?.filter(item => item.type === 'tool_use') || [];
    if (usedTools.length > 0) {
      console.log('🔍 Claude used tools:', usedTools.map(t => t.name));
    }
    
    // Extrahovat text odpověď
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('💬 Response length:', textContent.length, 'characters');

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      tools_used: usedTools.length > 0,
      web_search_executed: usedTools.some(t => t.name === 'web_search'),
      debug_info: {
        tools_available: ['web_search'],
        tools_used: usedTools.map(t => t.name),
        message_count: recentMessages.length
      }
    });

  } catch (error) {
    console.error('💥 Fatal error in Claude API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}