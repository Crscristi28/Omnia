// api/claude2.js - DEBUG VERSION

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

    // ✅ SIMPLE APPROACH - Let Claude use native web_search
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      messages: messages.slice(-8),
      system: `Jsi Omnia v2, pokročilý český AI asistent. Máš přístup k internetu přes web_search funkci. 
Pro dotazy na aktuální ceny akcií, počasí, zprávy nebo cokoliv časově citlivého VŽDY použij web_search.
Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.
Odpovídej výhradně v češtině.`
    };

    console.log('📤 Sending to Claude...');
    console.log('Request:', JSON.stringify(claudeRequest, null, 2));

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
    console.log('✅ Claude response:', JSON.stringify(data, null, 2));

    // Extract text
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat odpověď.";

    // Check if Claude mentions web_search
    const mentionsWebSearch = textContent.includes('web_search') || 
                             textContent.includes('<web_search>') ||
                             data.content?.some(item => item.type === 'tool_use');

    console.log('🔍 Claude mentions web_search:', mentionsWebSearch);
    console.log('📝 Final response:', textContent);

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      debug: {
        mentions_web_search: mentionsWebSearch,
        raw_content: data.content
      }
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}