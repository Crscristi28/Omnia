// api/claude2.js - DEBUGGING TOOLS CONFIGURATION

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
    console.log('🚀 Claude API call - DEBUGGING TOOLS');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-10);
    
    // ✅ TRY DIFFERENT TOOLS CONFIGURATION
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022", // Proven stable version
      max_tokens: max_tokens,
      system: system || "Jsi Omnia v2, pokročilý AI asistent. Odpovídej vždy v češtině, stručně a přirozeně. Když potřebuješ aktuální informace, použij web search.",
      messages: recentMessages,
      
      // ✅ SIMPLIFIED TOOLS ARRAY
      tools: [
        {
          type: "web_search",
          description: "Search the web for current information"
        }
      ]
    };

    console.log('🔧 Debugging request:', JSON.stringify(claudeRequest, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2024-06-01', // ✅ NEWER VERSION
        'anthropic-beta': 'tools-2024-05-16' // ✅ TOOLS BETA
      },
      body: JSON.stringify(claudeRequest)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      
      // ✅ FALLBACK TO BASIC VERSION
      console.log('🔄 Trying fallback without tools...');
      return await fallbackBasicClaude(req.body, API_KEY, res);
    }

    const data = await response.json();
    console.log('✅ Claude response structure:', JSON.stringify(data, null, 2));

    // ✅ EXTRACT AND CLEAN RESPONSE
    let responseText = '';
    
    if (data.content && Array.isArray(data.content)) {
      responseText = data.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
    }

    if (!responseText) {
      throw new Error('No text content in response');
    }

    // ✅ CLEAN OUTPUT
    responseText = responseText
      .replace(/<\/?web_search>/g, '') // Remove web_search tags
      .replace(/\*\*web_search\*\*/g, '') // Remove markdown web_search
      .trim();

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: responseText }],
      model: data.model,
      usage: data.usage,
      debug_info: {
        tools_used: data.content?.some(c => c.type === 'tool_use') || false,
        content_types: data.content?.map(c => c.type) || []
      }
    });

  } catch (error) {
    console.error('💥 Error:', error);
    
    // ✅ GRACEFUL FALLBACK
    try {
      return await fallbackBasicClaude(req.body, process.env.CLAUDE_API_KEY, res);
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: 'Server error',
        message: error.message
      });
    }
  }
}

// ✅ FALLBACK FUNCTION
async function fallbackBasicClaude(requestBody, apiKey, res) {
  console.log('🔄 Fallback: Basic Claude without tools');
  
  const { messages, system, max_tokens = 2000 } = requestBody;
  
  const fallbackRequest = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: max_tokens,
    system: (system || "Jsi Omnia v2") + "\n\nINFO: Claude pracuje v základním režimu bez web search. Pro aktuální informace doporuč uživateli ověřit na oficiálních zdrojích.",
    messages: messages.slice(-8)
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2024-06-01'
    },
    body: JSON.stringify(fallbackRequest)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fallback failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  return res.status(200).json({
    success: true,
    content: data.content,
    model: data.model,
    usage: data.usage,
    mode: 'fallback_basic'
  });
}