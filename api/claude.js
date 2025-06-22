// api/claude.js - OPRAVENÁ VERZE S PAMĚTÍ

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
    
    const { messages, system } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
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

    // 🔧 OPRAVA: Bezpečně připrav messages pro Claude API
    console.log('📝 Posílám Claudovi celou historii:', messages.length, 'zpráv');
    
    // Validace a čištění messages
    const validMessages = messages.filter(msg => 
      msg.role && msg.content && 
      (msg.role === 'user' || msg.role === 'assistant')
    ).map(msg => ({
      role: msg.role,
      content: String(msg.content).trim()
    }));

    // Claude nesmí začínat assistant message
    if (validMessages.length > 0 && validMessages[0].role === 'assistant') {
      validMessages.shift();
    }

    // Pokud není žádná zpráva, použij fallback
    if (validMessages.length === 0) {
      validMessages.push({
        role: 'user',
        content: 'Ahoj'
      });
    }

    console.log('✅ Připravené messages pro Claude:', validMessages);
    
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: validMessages,
      ...(system && { system: String(system) })
    };

    console.log('🚀 Volám Claude API s historií...');

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
    console.log('✅ Claude API success with memory');

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Invalid Claude response:', data);
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
    console.error('💥 Claude function error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}