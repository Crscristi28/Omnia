// api/claude2.js - Claude Sonnet 4 with Brave Search Integration

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
    console.log('🚀 Claude Sonnet 4 with Brave web search');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ ENHANCED SYSTEM PROMPT WITH WEB SEARCH
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

Máš přístup k funkci web_search pro vyhledávání aktuálních informací na internetu. 
Automaticky ji používej když:
- Uživatel potřebuje aktuální informace (ceny, kurzy, počasí, zprávy)
- Ptá se na něco, co se mohlo změnit po tvém knowledge cutoff
- Chce informace z roku 2024-2025
- Použije slova jako "aktuální", "dnešní", "současný", "nejnovější"

DŮLEŽITÉ: Vždy poskytni konkrétní odpověď na základě nalezených informací. Neříkej "zkontroluj jinde".`;

    // ✅ CLAUDE REQUEST WITH CUSTOM WEB_SEARCH TOOL
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          name: "web_search",
          description: "Search the web for current information. Use this for news, prices, weather, or any time-sensitive data.",
          input_schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query in Czech or English for current information"
              }
            },
            required: ["query"]
          }
        }
      ],
      tool_choice: "auto" // Let Claude decide when to use tools
    };

    console.log('🔧 Sending request to Claude with web_search tool');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'tools-2024-05-16'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', errorText);
      return res.status(response.status).json({
        error: 'Claude API error',
        message: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Claude response received');

    // ✅ CHECK FOR TOOL USAGE
    let needsToolExecution = false;
    let toolCalls = [];
    let textContent = '';

    for (const item of data.content) {
      if (item.type === 'text') {
        textContent += item.text;
      } else if (item.type === 'tool_use') {
        needsToolExecution = true;
        toolCalls.push(item);
        console.log('🔍 Tool call detected:', item.name, item.input);
      }
    }

    // ✅ EXECUTE WEB SEARCH IF NEEDED
    if (needsToolExecution && toolCalls.length > 0) {
      console.log('🌐 Executing web searches...');
      
      const toolResults = [];
      
      for (const toolCall of toolCalls) {
        if (toolCall.name === 'web_search') {
          try {
            const searchResult = await performBraveSearch(toolCall.input.query);
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
              content: "Vyhledávání dočasně nedostupné. Zkuste to prosím později."
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

      console.log('📤 Sending tool results back to Claude...');

      const followUpResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'tools-2024-05-16'
        },
        body: JSON.stringify(followUpRequest)
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalText = followUpData.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('');

        console.log('✅ Web search completed successfully');

        return res.status(200).json({
          success: true,
          content: [{ type: 'text', text: finalText }],
          model: followUpData.model,
          usage: followUpData.usage,
          web_search_executed: true,
          mode: 'sonnet4_with_brave_search'
        });
      }
    }

    // ✅ NO TOOLS NEEDED - RETURN DIRECT RESPONSE
    const cleanText = textContent.trim();

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: cleanText || "Omlouvám se, ale nemohu odpovědět." }],
      model: data.model,
      usage: data.usage,
      web_search_executed: false,
      mode: 'sonnet4_direct_response'
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// ✅ BRAVE SEARCH IMPLEMENTATION
async function performBraveSearch(query) {
  console.log('🔍 Brave Search for:', query);
  
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
  
  if (!BRAVE_API_KEY) {
    console.error('❌ Brave API key not configured');
    return "Vyhledávání není nakonfigurováno. Kontaktujte administrátora.";
  }
  
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&search_lang=cs&ui_lang=cs`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });

    if (!response.ok) {
      console.error('Brave API error:', response.status, response.statusText);
      return "Vyhledávání selhalo. Zkuste to prosím později.";
    }

    const data = await response.json();
    
    // Process web results
    const webResults = data.web?.results?.slice(0, 5) || [];
    
    if (webResults.length === 0) {
      return "Nenalezeny žádné relevantní výsledky.";
    }
    
    // Format results for Claude
    let formattedResults = `Nalezeno ${webResults.length} aktuálních výsledků:\n\n`;
    
    webResults.forEach((result, index) => {
      formattedResults += `${index + 1}. ${result.title}\n`;
      formattedResults += `${result.description}\n`;
      formattedResults += `Zdroj: ${result.url}\n`;
      if (result.age) {
        formattedResults += `Publikováno: ${result.age}\n`;
      }
      formattedResults += '\n';
    });
    
    // Add news if available
    if (data.news?.results?.length > 0) {
      formattedResults += '\nAktuální zprávy:\n';
      data.news.results.slice(0, 3).forEach((news, index) => {
        formattedResults += `${index + 1}. ${news.title}\n`;
        if (news.description) {
          formattedResults += `${news.description}\n`;
        }
        formattedResults += '\n';
      });
    }
    
    // Add AI snippet if available
    if (data.summarizer?.summary) {
      formattedResults += `\nShrnutí: ${data.summarizer.summary}\n`;
    }
    
    console.log('✅ Brave search successful, found', webResults.length, 'results');
    
    return formattedResults;
    
  } catch (error) {
    console.error('💥 Brave search error:', error);
    return "Chyba při vyhledávání. Zkuste to prosím později.";
  }
}