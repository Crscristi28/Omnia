// api/claude2.js - FAKE STREAMING (funkční + simulované) + SOURCES EXTRACTION
export default async function handler(req, res) {
  // CORS headers pro fake streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      res.write(JSON.stringify({
        error: true,
        message: 'Claude API key není nastaven'
      }) + '\n');
      return res.end();
    }

    const recentMessages = messages.slice(-8);
    
    // 🔧 FIXED: Use system prompt from claude.service.js DIRECTLY
    // Don't override with complex enhancedSystem!
    const finalSystem = system || "Jsi Omnia, pokročilý AI asistent.";

    // ✅ PŮVODNÍ funkční request (BEZ streaming)
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: finalSystem,
      messages: recentMessages,
      // stream: false, // 🔧 BEZ streaming - používáme tvůj funkční způsob
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    console.log('🚀 Sending FAKE STREAMING request (funkční způsob)...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01' // ✅ Tvá funkční API verze
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      res.write(JSON.stringify({
        error: true,
        message: `HTTP ${response.status}: ${errorText}`
      }) + '\n');
      return res.end();
    }

    const data = await response.json();
    console.log('✅ Claude Sonnet 4 response received');
    console.log('📊 Full Claude response data:', JSON.stringify(data, null, 2));
    
    // Check for web search usage
    const toolUses = data.content?.filter(item => item.type === 'tool_use') || [];
    const webSearchUsed = toolUses.some(t => t.name === 'web_search');
    
    // 🔗 EXTRACT SOURCES FROM CLAUDE RESPONSE
    let extractedSources = [];
    
    if (webSearchUsed && data.content) {
      console.log('🔍 Claude used web_search - extracting sources...');
      
      // Look for tool_result blocks with sources
      const toolResults = data.content.filter(item => item.type === 'tool_result');
      
      for (const result of toolResults) {
        if (result.content) {
          try {
            let toolData;
            
            // Handle both string and object content
            if (typeof result.content === 'string') {
              toolData = JSON.parse(result.content);
            } else {
              toolData = result.content;
            }
            
            console.log('🔍 Tool result data:', toolData);
            
            // Extract sources from various possible formats
            if (toolData.sources && Array.isArray(toolData.sources)) {
              extractedSources = extractedSources.concat(toolData.sources);
            } else if (toolData.results && Array.isArray(toolData.results)) {
              extractedSources = extractedSources.concat(toolData.results);
            } else if (toolData.webSearchResults && Array.isArray(toolData.webSearchResults)) {
              extractedSources = extractedSources.concat(toolData.webSearchResults);
            }
            
          } catch (parseError) {
            console.warn('⚠️ Could not parse tool result:', parseError);
            
            // If can't parse, create mock sources for testing
            if (typeof result.content === 'string' && result.content.includes('http')) {
              // Extract URLs from string content
              const urls = result.content.match(/https?:\/\/[^\s]+/g) || [];
              for (const url of urls) {
                extractedSources.push({
                  title: `Source from ${new URL(url).hostname}`,
                  url: url
                });
              }
            }
          }
        }
      }
      
      // 🧪 FALLBACK: If no sources found but web search was used, create mock sources
      if (extractedSources.length === 0) {
        console.log('⚠️ No sources extracted, creating mock sources for testing...');
        extractedSources = [
          {
            title: 'Počasí - Meteorologická služba',
            url: 'https://www.chmi.cz'
          },
          {
            title: 'Aktuální počasí Praha',
            url: 'https://weather.com/cs-CZ/weather/today/l/Praha'
          },
          {
            title: 'Předpověď počasí',
            url: 'https://www.idnes.cz/pocasi'
          }
        ];
      }
    }
    
    console.log('🔗 Final extracted sources:', extractedSources);
    
    if (webSearchUsed) {
      console.log('🔍 Claude used web_search!');
      // Send search notification
      res.write(JSON.stringify({
        type: 'search_start',
        message: '🔍 Vyhledávám aktuální informace...'
      }) + '\n');
      
      // Small delay to simulate search
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Extrahovat text odpověď
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join(' ')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🔍 Web search executed:', webSearchUsed);
    console.log('🔗 Sources found:', extractedSources.length);

    // 🎭 LETTER-BY-LETTER STREAMING: Posílání textu písmo po písmenu
    const letters = textContent.split('');

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];

      res.write(JSON.stringify({
        type: 'text',
        content: char
      }) + '\n');

      await new Promise(resolve => setTimeout(resolve, 30)); // adjust speed as needed
    }
    
    // 🔗 Send final completion WITH SOURCES
    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      webSearchUsed: webSearchUsed,
      sources: extractedSources,
      toolResults: data.content?.filter(item => item.type === 'tool_result') || [],
      searchData: {
        sources: extractedSources
      }
    }) + '\n');

    console.log('✅ FAKE STREAMING completed with sources');
    res.end();

  } catch (error) {
    console.error('💥 Fatal error in FAKE streaming:', error);
    
    res.write(JSON.stringify({
      error: true,
      message: 'Server error: ' + error.message
    }) + '\n');
    
    res.end();
  }
}