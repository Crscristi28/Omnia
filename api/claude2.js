// api/claude2.js - COMPATIBLE WITH REVOLUTIONARY APP.JSX
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
    const { messages, language = 'cs', temperature = 0.7, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({
        error: 'Claude API key není nastaven'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid messages format'
      });
    }

    console.log('🤖 Claude Sonnet 4 API call:', {
      messageCount: messages.length,
      language: language
    });

    const recentMessages = messages.slice(-8);
    
    // Enhanced system prompts for different languages
    const systemPrompts = {
      cs: `Jsi OMNIA, pokročilý český AI asistent. Odpovídej VŽDY výhradně v češtině.
      
Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.
Máš přístup k web_search funkci pro vyhledávání aktuálních informací na internetu.
Automaticky používej web_search když potřebuješ aktuální informace o cenách, počasí, zprávách nebo jakýchkoli datech co se mění.
Pro české lokální informace vyhledávej česky a zaměřuj se na české zdroje.`,

      en: `You are OMNIA, an advanced AI assistant. Always respond in English.
      
Today's date is ${new Date().toLocaleDateString('en-US')}.
You have access to web_search for current information.
Automatically use web_search when you need current information about prices, weather, news, or any changing data.`,

      ro: `Ești OMNIA, un asistent AI avansat. Răspunde ÎNTOTDEAUNA în română.
      
Data de astăzi este ${new Date().toLocaleDateString('ro-RO')}.
Ai acces la web_search pentru informații actuale.
Folosește automat web_search când ai nevoie de informații actuale despre prețuri, vremea, știri sau orice date care se schimbă.`
    };

    const enhancedSystem = systemPrompts[language] || systemPrompts.cs;

    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: max_tokens,
      temperature: temperature,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    console.log('🚀 Sending to Claude Sonnet 4 with web search...');

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
        error: 'Claude API failed',
        details: errorText
      });
    }

    const data = await response.json();
    
    // Check for web search usage
    const toolUses = data.content?.filter(item => item.type === 'tool_use') || [];
    const webSearchUsed = toolUses.some(t => t.name === 'web_search');
    
    // Extract text response
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('✅ Claude Sonnet 4 success:', {
      responseLength: textContent.length,
      webSearchUsed: webSearchUsed,
      toolUses: toolUses.length
    });

    // 🎯 COMPATIBLE RESPONSE FORMAT for Revolutionary App.jsx
    return res.status(200).json({
      content: textContent,           // ✅ Revolutionary App expects this
      model: data.model || 'claude-3-5-sonnet-20241022',
      usage: data.usage || {
        input_tokens: 0,
        output_tokens: 0
      },
      webSearchUsed: webSearchUsed,   // Extra info
      toolUses: toolUses.length       // Extra info
    });

  } catch (error) {
    console.error('💥 Claude API error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}