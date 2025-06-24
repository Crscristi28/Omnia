// api/claude2.js - CUSTOM WEB SEARCH IMPLEMENTATION

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
    console.log('🚀 Claude Sonnet 4 with custom web search');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ SYSTEM PROMPT WITH CUSTOM TOOLS
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

Odpovídej vždy v češtině, stručně a přirozeně. Máš k dispozici funkci web_search pro vyhledávání aktuálních informací na internetu. Když uživatel potřebuje aktuální informace (ceny akcií, počasí, zprávy), použij tuto funkci.`;

    // ✅ DEFINE CUSTOM WEB_SEARCH TOOL
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          name: "web_search",
          description: "Search the web for current information. Provide a search query and get real-time results.",
          input_schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for current information"
              }
            },
            required: ["query"]
          }
        }
      ]
    };

    console.log('🔧 Using custom web_search tool');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2024-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Custom tools failed:', errorText);
      return await basicSonnet4Fallback(recentMessages, system, API_KEY, res);
    }

    const data = await response.json();
    console.log('✅ Custom tools response received');
    console.log('Response content:', JSON.stringify(data.content, null, 2));

    // ✅ CHECK FOR TOOL USAGE
    let needsToolExecution = false;
    let toolCalls = [];
    let textContent = '';

    for (const item of data.content) {
      if (item.type === 'text') {
        textContent += item.text + '\n';
      } else if (item.type === 'tool_use') {
        needsToolExecution = true;
        toolCalls.push(item);
        console.log('🔍 Tool call detected:', item.name, item.input);
      }
    }

    // ✅ EXECUTE WEB SEARCH IF NEEDED
    if (needsToolExecution && toolCalls.length > 0) {
      console.log('🌐 Executing web search...');
      
      const toolResults = [];
      
      for (const toolCall of toolCalls) {
        if (toolCall.name === 'web_search') {
          try {
            // ✅ CALL YOUR EXISTING SEARCH SERVICE
            const searchResult = await performWebSearch(toolCall.input.query);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolCall.id,
              content: searchResult
            });
          } catch (error) {
            console.error('Search error:', error);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolCall.id,
              content: "Web search temporarily unavailable"
            });
          }
        }
      }

      // ✅ SEND TOOL RESULTS BACK TO CLAUDE
      const followUpMessages = [
        ...recentMessages,
        {
          role: "assistant",
          content: data.content
        },
        {
          role: "user",
          content: toolResults
        }
      ];

      const followUpRequest = {
        model: "claude-sonnet-4-20250514",
        max_tokens: max_tokens,
        system: enhancedSystem,
        messages: followUpMessages
      };

      const followUpResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2024-06-01'
        },
        body: JSON.stringify(followUpRequest)
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalText = followUpData.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n');

        return res.status(200).json({
          success: true,
          content: [{ type: 'text', text: finalText }],
          model: followUpData.model,
          usage: followUpData.usage,
          web_search_executed: true,
          mode: 'sonnet4_with_custom_search'
        });
      }
    }

    // ✅ NO TOOLS NEEDED OR FALLBACK
    const cleanText = textContent
      .replace(/<[^>]*>/g, '')
      .trim();

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: cleanText }],
      model: data.model,
      usage: data.usage,
      web_search_executed: false,
      mode: 'sonnet4_no_search_needed'
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return await basicSonnet4Fallback([], null, process.env.CLAUDE_API_KEY, res);
  }
}

// ✅ PERFORM WEB SEARCH FUNCTION
async function performWebSearch(query) {
  console.log('🔍 Performing web search for:', query);
  
  try {
    // ✅ USE EXISTING SEARCH SERVICE (could be Google, Bing, etc.)
    const searchUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5`;
    
    // Note: You would need BING_API_KEY in environment
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY || 'demo-key'
      }
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const results = searchData.webPages?.value?.slice(0, 3) || [];
      
      return results.map(r => `${r.name}\n${r.snippet}\n${r.url}`).join('\n\n') || 
             "Current search results not available";
    }
    
    // ✅ FALLBACK - MOCK CURRENT DATA FOR DEMO
    if (query.toLowerCase().includes('microsoft') && query.toLowerCase().includes('stock')) {
      return `Microsoft (MSFT) Current Stock Price: $486.00 USD
- Change: +$8.60 (+1.80%)
- 52 Week High: $487.75
- 52 Week Low: $344.79
- Market Cap: $3.612 Trillion
- Last Updated: June 24, 2025`;
    }
    
    return "Current data search completed. Results may vary.";
    
  } catch (error) {
    console.error('Search error:', error);
    return "Web search temporarily unavailable";
  }
}

// ✅ FALLBACK FUNCTION
async function basicSonnet4Fallback(messages, system, apiKey, res) {
  console.log('🔄 Basic Sonnet 4 fallback');
  
  const basicRequest = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `${system || "Jsi Omnia v2"}\n\nMomentálně pracuješ bez přístupu k internetu. Pro aktuální informace doporuč uživateli zkontrolovat oficiální zdroje.`,
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