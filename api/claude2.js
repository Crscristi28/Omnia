// api/claude2.js - CORRECT TOOLS FORMAT

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
    console.log('🚀 Claude API call with CORRECT tools format');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    // ✅ CLEAN MESSAGES
    const validMessages = messages
      .filter(msg => msg && (msg.sender === 'user' || msg.sender === 'bot'))
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: (msg.text || msg.content || '').toString().trim()
      }))
      .filter(msg => msg.content.length > 0);

    const cleanMessages = [];
    let lastRole = null;
    
    for (const msg of validMessages) {
      if (msg.role !== lastRole) {
        cleanMessages.push(msg);
        lastRole = msg.role;
      }
    }

    if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === 'assistant') {
      cleanMessages.pop();
    }

    const recentMessages = cleanMessages.slice(-6);
    
    // ✅ SYSTEM PROMPT FOR WEB SEARCH
    const systemPrompt = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

Odpovídej vždy v češtině, stručně a přirozeně. Máš přístup k nástroji pro vyhledávání na internetu. Když uživatel potřebuje aktuální informace (ceny akcií, počasí, zprávy), použij tento nástroj a poskytni konkrétní aktuální informace.`;

    // ✅ CORRECT TOOLS FORMAT - COMPUTER USE
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: max_tokens,
      system: systemPrompt,
      messages: recentMessages,
      tools: [
        {
          type: "computer_use",
          name: "web_search",
          display_width_px: 1024,
          display_height_px: 768,
          display_number: 1
        }
      ]
    };

    console.log('🔧 Using COMPUTER USE tools format');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2024-06-01', // ✅ NEWER VERSION FOR COMPUTER USE
        'anthropic-beta': 'computer-use-2024-10-22' // ✅ REQUIRED BETA HEADER
      },
      body: JSON.stringify(claudeRequest)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Computer use error:', response.status, errorText);
      
      // ✅ FALLBACK TO BASIC VERSION WITHOUT TOOLS
      console.log('🔄 Falling back to basic version...');
      return await basicClaudeCall(recentMessages, system, API_KEY, res);
    }

    const data = await response.json();
    console.log('✅ Computer use response received');

    if (!data.content || !Array.isArray(data.content)) {
      return res.status(500).json({
        error: 'Invalid response structure'
      });
    }

    // ✅ EXTRACT TEXT CONTENT
    let responseText = '';
    let toolUsed = false;
    
    for (const item of data.content) {
      if (item.type === 'text') {
        responseText += item.text + '\n';
      } else if (item.type === 'tool_use') {
        toolUsed = true;
        console.log('🔍 Tool used:', item.name);
      }
    }

    responseText = responseText.trim();

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: responseText }],
      model: data.model,
      usage: data.usage,
      tool_used: toolUsed,
      mode: 'computer_use'
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return await basicClaudeCall([], null, process.env.CLAUDE_API_KEY, res);
  }
}

// ✅ FALLBACK FUNCTION - BASIC CLAUDE WITHOUT TOOLS
async function basicClaudeCall(messages, system, apiKey, res) {
  console.log('🔄 Basic Claude fallback');
  
  const basicRequest = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    system: `${system || "Jsi Omnia v2"}\n\nMomentálně pracuješ bez přístupu k internetu. Pro aktuální informace doporuč uživateli zkontrolovat Yahoo Finance, iDNES.cz nebo jiné aktuální zdroje.`,
    messages: messages.slice(-4)
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(basicRequest)
  });

  if (!response.ok) {
    const errorText = await response.text();
    return res.status(response.status).json({
      error: 'All methods failed',
      details: errorText
    });
  }

  const data = await response.json();
  const textContent = data.content
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('\n');

  return res.status(200).json({
    success: true,
    content: [{ type: 'text', text: textContent }],
    model: data.model,
    usage: data.usage,
    mode: 'basic_fallback'
  });
}