// api/claude.js - JEDNODUCHÁ VERZE S DEBUGGING

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
    console.log('🤖 Claude API call via Vercel');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { messages } = req.body;
    
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

    // 🎯 NEJJEDNODUŠŠÍ ŘEŠENÍ - jen poslední 2 zprávy pro začátek
    console.log('📝 Celkem zpráv:', messages.length);
    
    // Vezmi posledních 5 zpráv (aby Claude měl trochu kontextu)
    const recentMessages = messages.slice(-5);
    console.log('📝 Posílám posledních 5 zpráv:', recentMessages);
    
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: "Jsi Omnia, chytrý AI asistent. Odpovídej vždy v češtině, stručně a přirozeně.",
      messages: recentMessages
    };

    console.log('🚀 Claude request:', JSON.stringify(claudeRequest, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
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
    console.log('✅ Claude API success');
    console.log('📨 Claude response:', JSON.stringify(data, null, 2));

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Invalid Claude response structure:', data);
      return res.status(500).json({
        error: 'Invalid response from Claude'
      });
    }

    return res.status(200).json({
      success: true,
      content: data.content,
      model: data.model,
      usage: data.usage
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