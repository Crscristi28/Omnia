// api/claude2.js - EMERGENCY FIX - BACK TO WORKING VERSION

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
    console.log('🚀 Claude API call - emergency working version');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Messages musí být array' 
      });
    }

    // ✅ SIMPLE MESSAGE PROCESSING
    const recentMessages = messages
      .filter(msg => msg && msg.text && (msg.sender === 'user' || msg.sender === 'bot'))
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text.toString()
      }))
      .slice(-6);

    if (recentMessages.length === 0) {
      return res.status(400).json({
        error: 'No valid messages found'
      });
    }

    // ✅ ENSURE LAST MESSAGE IS USER
    if (recentMessages[recentMessages.length - 1].role === 'assistant') {
      recentMessages.pop();
    }

    console.log('📝 Processing', recentMessages.length, 'messages');
    
    // ✅ SIMPLE SYSTEM PROMPT
    const systemPrompt = system || "Jsi Omnia v2, pokročilý AI asistent. Odpovídej vždy v češtině, stručně a přirozeně.";

    // ✅ BASIC REQUEST - NO TOOLS AT ALL
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: max_tokens,
      system: systemPrompt,
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

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'Claude API error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Claude response OK');

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      return res.status(500).json({
        error: 'Invalid response from Claude'
      });
    }

    const textContent = data.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    if (!textContent) {
      return res.status(500).json({
        error: 'No text content in response'
      });
    }

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model,
      usage: data.usage,
      mode: 'basic_working'
    });

  } catch (error) {
    console.error('💥 Server error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}