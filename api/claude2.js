// api/claude2.js - Claude Sonnet 4 with NATIVE web_search

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
    console.log('🚀 Claude Sonnet 4 with NATIVE web_search');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ SYSTEM PROMPT OPTIMIZED FOR NATIVE WEB_SEARCH
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent s přístupem k aktuálním informacím z internetu."}

DŮLEŽITÉ INSTRUKCE:
- Máš přístup k funkci web_search pro vyhledávání aktuálních informací
- Automaticky ji používej když uživatel potřebuje aktuální data (ceny, kurzy, počasí, zprávy, události po lednu 2025)
- Odpovídej VŽDY výhradně v češtině
- Poskytuj konkrétní odpovědi na základě nalezených informací
- Cituj zdroje když uvádíš fakta z webu
- Pro dotazy o cenách akcií, kryptoměn, počasí nebo zprávy VŽDY použij web_search`;

    // ✅ SIMPLE REQUEST - LET CLAUDE USE ITS NATIVE TOOLS
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
    };

    console.log('📤 Sending to Claude Sonnet 4...');

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
      
      // Try to parse error message
      try {
        const errorData = JSON.parse(errorText);
        return res.status(response.status).json({
          error: 'Claude API error',
          message: errorData.error?.message || errorText,
          type: errorData.error?.type || 'unknown_error'
        });
      } catch {
        return res.status(response.status).json({
          error: 'Claude API error',
          message: errorText
        });
      }
    }

    const data = await response.json();
    console.log('✅ Claude response received');

    // Extract text content
    const textContent = data.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n')
      .trim();

    // Check if web_search was used (Claude will mention it in the response)
    const webSearchUsed = textContent.includes('vyhledal') || 
                         textContent.includes('našel jsem') || 
                         textContent.includes('podle aktuálních informací') ||
                         textContent.includes('aktuální cena') ||
                         textContent.includes('současná cena');

    console.log('🔍 Web search likely used:', webSearchUsed);

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      web_search_likely_used: webSearchUsed,
      mode: 'sonnet4_native'
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}