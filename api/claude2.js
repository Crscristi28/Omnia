// api/claude2.js - CLAUDE SONNET 4 CAREFUL VERSION

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
    console.log('🚀 Claude Sonnet 4 API call');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ CLAUDE_API_KEY not set');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      console.log('❌ Invalid messages:', messages);
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Messages musí být array' 
      });
    }

    console.log('📝 Celkem zpráv:', messages.length);
    
    // Vezmi posledních 10 zpráv pro lepší kontext
    const recentMessages = messages.slice(-10);
    console.log('📝 Posílám posledních 10 zpráv:', recentMessages);
    
    // System prompt
    const enhancedSystem = system || "Jsi Omnia v2, pokročilý AI asistent. Odpovídej vždy v češtině, stručně a přirozeně.";
    
    // ✅ CLAUDE SONNET 4 REQUEST - NO TOOLS
    const claudeRequest = {
      model: "claude-sonnet-4-20250514", // ✅ SONNET 4
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
    };

    console.log('🚀 Claude Sonnet 4 request:', JSON.stringify(claudeRequest, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    console.log('📡 Claude Sonnet 4 response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude Sonnet 4 API error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'Claude API error',
        status: response.status,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Claude Sonnet 4 API success');
    console.log('📨 Claude response:', JSON.stringify(data, null, 2));

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('❌ Invalid Claude response structure:', data);
      return res.status(500).json({
        error: 'Invalid response from Claude'
      });
    }

    return res.status(200).json({
      success: true,
      content: data.content,
      model: data.model,
      usage: data.usage,
      mode: 'sonnet4_basic'
    });

  } catch (error) {
    console.error('💥 Claude Sonnet 4 function error details:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: error.stack
    });
  }
}