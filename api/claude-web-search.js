// 🔍 /api/claude-web-search.js - Claude Web Search API for GPT
// ✅ Simple non-streaming endpoint for reliable search results
// 🎯 Used by openai.service.js when GPT needs current information

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, language = 'cs' } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Claude API key není nastaven'
      });
    }

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query je povinný'
      });
    }

    console.log('🔍 Claude web search request:', query.substring(0, 50) + '...', 'language:', language);

    // 🧠 Create search-optimized system prompt
    const systemPrompts = {
      'cs': `Jsi vyhledávací asistent. Vyhledej aktuální informace na internetu a odpověz v češtině.

PRAVIDLA:
- Používej web_search pro aktuální informace
- Odpovídej POUZE v češtině
- Krátké, jasné věty (max 15 slov)
- Čísla slovy: "dvacet tři" místo "23"
- Teplota: "dvacet stupňů Celsia" místo "20°C"
- Procenta: "padesát procent" místo "50%"
- Žádné symboly nebo zkratky
- Integruj nalezené informace přirozeně
- NEŘÍKEJ "našel jsem" nebo "vyhledal jsem" - prostě odpověz

Dnešní datum: ${new Date().toLocaleDateString('cs-CZ')}`,

      'en': `You are a search assistant. Search for current information on the internet and respond in English.

RULES:
- Use web_search for current information
- Respond ONLY in English
- Short, clear sentences (max 15 words)
- Numbers in words: "twenty three" instead of "23"
- Temperature: "twenty degrees Celsius" instead of "20°C"
- Percentages: "fifty percent" instead of "50%"
- No symbols or abbreviations
- Integrate found information naturally
- DON'T say "I found" or "I searched" - just answer

Today's date: ${new Date().toLocaleDateString('en-US')}`,

      'ro': `Ești un asistent de căutare. Caută informații actuale pe internet și răspunde în română.

REGULI:
- Folosește web_search pentru informații actuale
- Răspunde DOAR în română
- Propoziții scurte, clare (max 15 cuvinte)
- Numerele în cuvinte: "douăzeci și trei" în loc de "23"
- Temperatura: "douăzeci grade Celsius" în loc de "20°C"
- Procente: "cincizeci la sută" în loc de "50%"
- Fără simboluri sau abrevieri
- Integrează informațiile găsite natural
- NU spune "am găsit" sau "am căutat" - doar răspunde

Data de astăzi: ${new Date().toLocaleDateString('ro-RO')}`
    };

    const systemPrompt = systemPrompts[language] || systemPrompts['cs'];

    // 🚀 Claude API call with web_search
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: query
        }
      ],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3
        }
      ]
    };

    console.log('🚀 Sending Claude web search request...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: `Claude API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Claude web search response received');
    
    // 📝 Extract text response
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat výsledky vyhledávání.";

    // 🔗 Extract sources from web_search tool usage
    const toolUses = data.content?.filter(item => item.type === 'tool_use') || [];
    const webSearchUsed = toolUses.some(t => t.name === 'web_search');
    
    let sources = [];
    if (webSearchUsed) {
      console.log('🔍 Claude used web_search tool');
      
      // Try to extract sources from tool results if available
      // Note: Claude's web_search tool doesn't always return structured sources
      // but we can create basic source info
      sources = [
        {
          id: 1,
          title: "Web Search Results",
          url: "#",
          domain: "claude-search"
        }
      ];
    }

    console.log('💬 Search result length:', textContent.length, 'characters');
    console.log('🔍 Web search executed:', webSearchUsed);

    // 🎯 Return response in format expected by openai.service.js
    return res.status(200).json({
      success: true,
      result: textContent,
      sources: sources,
      query: query,
      language: language,
      webSearchUsed: webSearchUsed,
      model: data.model,
      usage: data.usage || {},
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Claude web search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during Claude web search',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}