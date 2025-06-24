// api/claude2.js - WORKING WEB SEARCH BASED ON CONSOLE

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
    console.log('🚀 Claude with web_search - based on console limits');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ SYSTEM PROMPT PRO WEB_SEARCH
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

Odpovídej vždy v češtině, stručně a přirozeně. Máš přístup k web_search nástroji pro vyhledávání aktuálních informací. Když uživatel potřebuje aktuální data (ceny akcií, počasí, zprávy), automaticky použij web_search a poskytni konkrétní aktuální informace.

DŮLEŽITÉ: Ve finální odpovědi nikdy neukazuj technické tagy nebo debugging informace.`;

    // ✅ REQUEST S WEB_SEARCH TOOLS (based on console info)
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022", // ✅ EXACTLY AS IN CONSOLE
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search", // ✅ SIMPLE TYPE AS SHOWN IN CONSOLE
          description: "Search the web for current information"
        }
      ]
    };

    console.log('🔧 Using web_search tools with console-verified model');

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
      console.error('❌ Web search API error:', response.status, errorText);
      
      // ✅ LOG THE EXACT ERROR FOR DEBUGGING
      console.error('Full error details:', errorText);
      
      return res.status(response.status).json({ 
        error: 'Claude API error',
        status: response.status,
        details: errorText,
        model_used: "claude-3-5-sonnet-20241022"
      });
    }

    const data = await response.json();
    console.log('✅ Web search response received');
    console.log('Response structure:', JSON.stringify(data, null, 2));

    if (!data.content || !Array.isArray(data.content)) {
      return res.status(500).json({
        error: 'Invalid response structure',
        data_received: data
      });
    }

    // ✅ PROCESS RESPONSE (handle tool usage)
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

    // ✅ CLEAN OUTPUT
    responseText = responseText
      .replace(/<[^>]*>/g, '') // Remove XML tags
      .replace(/\*\*web_search\*\*/gi, '')
      .trim();

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: responseText }],
      model: data.model,
      usage: data.usage,
      web_search_used: toolUsed,
      mode: 'web_search_enabled'
    });

  } catch (error) {
    console.error('💥 Server error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: error.stack
    });
  }
}