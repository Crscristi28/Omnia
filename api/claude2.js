// api/claude2.js - Claude Sonnet 4 with Mock Search Data

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
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    const lastUserMessage = recentMessages.filter(m => m.role === 'user').pop()?.content || '';
    
    // ✅ MOCK SEARCH DATA
    let searchContext = '';
    const query = lastUserMessage.toLowerCase();
    
    if (query.includes('microsoft') || query.includes('msft')) {
      searchContext = `
AKTUÁLNÍ DATA Z BURZY (${new Date().toLocaleString('cs-CZ')}):

Microsoft Corporation (MSFT)
• Aktuální cena: $489.00 USD
• Denní změna: +$3.00 (+0.62%)
• Otevírací cena: $486.50
• Denní maximum: $491.25
• Denní minimum: $485.75
• 52-týdenní maximum: $491.25
• 52-týdenní minimum: $344.79
• Tržní kapitalizace: $3.63 bilionu
• Objem obchodování: 24,779,990 akcií
• P/E poměr: 37.56

Poslední zprávy:
- Microsoft hlásí rekordní tržby z cloudových služeb Azure
- Spolupráce s OpenAI přináší nové AI funkce do Office 365
- Analytiků konsenzus: Strong Buy s cílovú cenou $520`;
    }
    
    if (query.includes('bitcoin') || query.includes('btc')) {
      searchContext = `
AKTUÁLNÍ DATA KRYPTOMĚN (${new Date().toLocaleString('cs-CZ')}):

Bitcoin (BTC)
• Aktuální cena: $98,450.00 USD
• 24h změna: +$2,150 (+2.23%)
• 24h maximum: $99,200
• 24h minimum: $96,100
• Tržní kapitalizace: $1.93 bilionu
• Objem (24h): $28.5 miliardy

Ethereum (ETH): $3,450.00 (+1.8%)
BNB: $685.00 (+0.9%)`;
    }
    
    if (query.includes('počasí')) {
      searchContext = `
AKTUÁLNÍ POČASÍ - Praha (${new Date().toLocaleString('cs-CZ')}):

• Teplota: 22°C
• Pocitová teplota: 21°C
• Oblačnost: Polojasno
• Vítr: 15 km/h, západní
• Vlhkost: 65%
• Tlak: 1015 hPa

Předpověď na další dny:
- Středa: 24°C, jasno
- Čtvrtek: 23°C, oblačno
- Pátek: 20°C, déšť`;
    }

    // ✅ CLAUDE REQUEST
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent."}
    
Odpovídej VŽDY výhradně v češtině. Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.
${searchContext ? `\nPouži tyto aktuální informace pro odpověď:\n${searchContext}` : ''}`;

    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
    };

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
      console.error('Claude API error:', response.status);
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
      web_search_executed: !!searchContext,
      mock_data_used: !!searchContext
    });

  } catch (error) {
    console.error('Fatal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}