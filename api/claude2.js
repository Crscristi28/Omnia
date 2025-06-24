// api/claude2.js - CLAUDE SONNET 4 WITH NATIVE TOOLS

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
    console.log('🚀 Claude Sonnet 4 API call with native tools');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { messages, system, max_tokens = 2000, model } = req.body;
    
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
    
    // Vezmi posledních 15 zpráv pro lepší kontext (Sonnet 4 zvládne více)
    const recentMessages = messages.slice(-15);
    console.log('📝 Posílám posledních 15 zpráv');
    
    // ✅ CLAUDE SONNET 4 REQUEST WITH NATIVE TOOLS
    const claudeRequest = {
      model: model || "claude-sonnet-4-20250514", // ✅ CLAUDE SONNET 4
      max_tokens: max_tokens,
      system: system || "Jsi Omnia v2, pokročilý AI asistent. Odpovídej vždy v češtině, stručně a přirozeně.",
      messages: recentMessages,
      
      // ✅ NATIVE TOOLS - web_search capability
      tools: [
        {
          type: "computer_use",
          name: "web_search",
          description: "Search the web for current information. Use this when users ask for recent/current data."
        }
      ],
      
      // ✅ TOOL CHOICE - let Claude decide when to use tools
      tool_choice: { type: "auto" }
    };

    console.log('🚀 Claude Sonnet 4 request with tools:', JSON.stringify(claudeRequest, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'computer-use-2024-10-22' // ✅ BETA HEADER FOR TOOLS
      },
      body: JSON.stringify(claudeRequest)
    });

    console.log('📡 Claude Sonnet 4 response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      
      // ✅ FALLBACK to basic model if tools fail
      if (response.status === 400 && errorText.includes('tools')) {
        console.log('🔄 Retrying without tools...');
        return await fallbackWithoutTools(req.body, API_KEY, res);
      }
      
      return res.status(response.status).json({ 
        error: 'Claude API error',
        status: response.status,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Claude Sonnet 4 success');
    console.log('📨 Response type:', data.content?.[0]?.type);
    
    // ✅ HANDLE TOOL USAGE
    if (data.content && data.content.some(c => c.type === 'tool_use')) {
      console.log('🔍 Claude used web_search tool');
    }

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('❌ Invalid Claude response structure:', data);
      return res.status(500).json({
        error: 'Invalid response from Claude'
      });
    }

    // ✅ EXTRACT TEXT CONTENT (handle tool responses)
    const textContent = data.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    if (!textContent) {
      console.error('❌ No text content in response');
      return res.status(500).json({
        error: 'No text content in Claude response'
      });
    }

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: textContent }],
      model: data.model || 'claude-sonnet-4-20250514',
      usage: data.usage,
      tool_use_detected: data.content.some(c => c.type === 'tool_use'),
      mode: 'sonnet4_with_tools'
    });

  } catch (error) {
    console.error('💥 Claude Sonnet 4 error:', error);
    console.error('💥 Error stack:', error.stack);
    
    // ✅ GRACEFUL FALLBACK
    try {
      console.log('🔄 Attempting fallback...');
      return await fallbackWithoutTools(req.body, process.env.CLAUDE_API_KEY, res);
    } catch (fallbackError) {
      console.error('💥 Fallback also failed:', fallbackError);
      return res.status(500).json({ 
        error: 'Server error',
        message: error.message,
        fallback_attempted: true
      });
    }
  }
}

// 🔄 FALLBACK FUNCTION - Claude Sonnet 4 without tools
async function fallbackWithoutTools(requestBody, apiKey, res) {
  console.log('🔄 Fallback: Claude Sonnet 4 without tools');
  
  const { messages, system, max_tokens = 2000 } = requestBody;
  const recentMessages = messages.slice(-10);
  
  const fallbackRequest = {
    model: "claude-sonnet-4-20250514", // ✅ STILL SONNET 4
    max_tokens: max_tokens,
    system: system + "\n\nHINT: Pokud uživatel potřebuje aktuální informace, řekni mu že Claude Sonnet 4 normálně má přístup k internetu, ale momentálně pracuje v omezeném režimu.",
    messages: recentMessages
    // ❌ NO TOOLS in fallback
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
      // ❌ NO BETA HEADER in fallback
    },
    body: JSON.stringify(fallbackRequest)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fallback failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Fallback successful');

  return res.status(200).json({
    success: true,
    content: data.content,
    model: data.model,
    usage: data.usage,
    mode: 'sonnet4_fallback'
  });
}