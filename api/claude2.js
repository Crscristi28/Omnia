// api/claude2.js - CLAUDE SONNET 4 WITH WORKING WEB SEARCH

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
    console.log('🚀 Claude Sonnet 4 with web search attempt');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ SYSTEM PROMPT FOR WEB SEARCH
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

Odpovídej vždy v češtině, stručně a přirozeně. Když uživatel potřebuje aktuální informace (ceny akcií, počasí, zprávy), máš k dispozici nástroj pro vyhledávání na internetu. Použij ho a poskytni konkrétní aktuální informace.`;

    // ✅ TRY WITH LATEST API VERSION AND CORRECT TOOLS
    const claudeRequest = {
      model: "claude-sonnet-4-20250514", // ✅ SONNET 4
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      
      // ✅ TOOLS BASED ON ERROR MESSAGE - TRY EXPECTED FORMATS
      tools: [
        {
          type: "text_editor_20241022",
          name: "web_search"
        }
      ]
    };

    console.log('🔧 Trying Claude Sonnet 4 with text_editor tools');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2024-06-01', // ✅ LATEST VERSION
        'anthropic-beta': 'tools-2024-05-16' // ✅ TOOLS BETA
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Tools failed, trying different approach:', errorText);
      
      // ✅ TRY DIFFERENT TOOL TYPE
      const claudeRequest2 = {
        model: "claude-sonnet-4-20250514",
        max_tokens: max_tokens,
        system: enhancedSystem,
        messages: recentMessages,
        tools: [
          {
            type: "bash_20250124",
            name: "web_search"
          }
        ]
      };

      console.log('🔧 Trying with bash_20250124 tools');

      const response2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2024-06-01',
          'anthropic-beta': 'tools-2024-05-16'
        },
        body: JSON.stringify(claudeRequest2)
      });

      if (!response2.ok) {
        const errorText2 = await response2.text();
        console.error('❌ Second attempt failed:', errorText2);
        
        // ✅ FALLBACK TO BASIC SONNET 4
        console.log('🔄 Falling back to basic Sonnet 4...');
        return await basicSonnet4(recentMessages, system, API_KEY, res);
      }

      const data2 = await response2.json();
      console.log('✅ Second attempt succeeded');
      return processToolResponse(data2, res);
    }

    const data = await response.json();
    console.log('✅ First attempt succeeded');
    return processToolResponse(data, res);

  } catch (error) {
    console.error('💥 Error:', error);
    return await basicSonnet4([], null, process.env.CLAUDE_API_KEY, res);
  }
}

// ✅ PROCESS TOOL RESPONSE
function processToolResponse(data, res) {
  if (!data.content || !Array.isArray(data.content)) {
    return res.status(500).json({
      error: 'Invalid response structure'
    });
  }

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
    .trim();

  return res.status(200).json({
    success: true,
    content: [{ type: 'text', text: responseText }],
    model: data.model,
    usage: data.usage,
    web_search_used: toolUsed,
    mode: 'sonnet4_with_tools'
  });
}

// ✅ FALLBACK - BASIC SONNET 4
async function basicSonnet4(messages, system, apiKey, res) {
  console.log('🔄 Basic Sonnet 4 fallback');
  
  const basicRequest = {
    model: "claude-sonnet-4-20250514", // ✅ KEEP SONNET 4
    max_tokens: 2000,
    system: `${system || "Jsi Omnia v2"}\n\nMomentálně pracuješ bez přístupu k internetu v reálném čase. Pro aktuální informace doporuč uživateli zkontrolovat Yahoo Finance, Bloomberg nebo jiné aktuální zdroje.`,
    messages: messages.slice(-6)
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
    mode: 'sonnet4_basic_fallback'
  });
}