// api/claude2.js - ENHANCED WITH WEB SEARCH TOOLS

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
    console.log('🤖 Claude API call with WEB SEARCH');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { messages, system, max_tokens = 2000 } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      console.log('❌ Invalid messages:', messages);
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Messages musí být array' 
      });
    }

    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ CLAUDE_API_KEY not set');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    console.log('📝 Celkem zpráv:', messages.length);
    
    // Vezmi posledních 10 zpráv pro lepší kontext
    const recentMessages = messages.slice(-10);
    console.log('📝 Posílám posledních 10 zpráv:', recentMessages);
    
    // ✅ ENHANCED REQUEST WITH WEB SEARCH TOOLS
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: max_tokens,
      system: system || "Jsi Omnia v2, pokročilý AI asistent s přístupem k internetu. Odpovídej vždy v češtině. Když potřebuješ aktuální informace, použij web search.",
      messages: recentMessages,
      // ✅ KEY ADDITION: WEB SEARCH TOOLS
      tools: [
        {
          type: "web_search",
          web_search: {
            max_results: 5
          }
        }
      ]
    };

    console.log('🚀 Claude request with tools:', JSON.stringify(claudeRequest, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2024-09-25' // ✅ BETA HEADER FOR WEB SEARCH
      },
      body: JSON.stringify(claudeRequest)
    });

    console.log('📡 Claude response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'Claude API error',
        status: response.status,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Claude API success with tools');
    console.log('📨 Claude response:', JSON.stringify(data, null, 2));

    // ✅ ENHANCED RESPONSE HANDLING
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('❌ Invalid Claude response structure:', data);
      return res.status(500).json({
        error: 'Invalid response from Claude'
      });
    }

    // Check if Claude used web search
    const hasToolUse = data.content.some(item => item.type === 'tool_use');
    if (hasToolUse) {
      console.log('🔍 Claude used web search tools!');
    }

    return res.status(200).json({
      success: true,
      content: data.content,
      model: data.model,
      usage: data.usage,
      tools_used: hasToolUse
    });

  } catch (error) {
    console.error('💥 Claude function error details:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: error.stack
    });
  }
}