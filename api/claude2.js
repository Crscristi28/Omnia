// api/claude2.js - BETTER OUTPUT CLEANING

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
    console.log('🚀 Claude API call with aggressive cleaning');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ ENHANCED SYSTEM PROMPT - FORCE CURRENT DATA
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

KRITICKÉ INSTRUKCE PRO WEB SEARCH:
- Když hledáš aktuální ceny akcií, VŽDY hledej "current stock price TODAY"
- NIKDY nepoužívej staré cached data
- VŽDY uváděj aktuální datum ve své odpovědi
- Odpovídej POUZE s finálními informacemi, bez technických tagů
- Nepiš <web_search> ani <query> tagy ve finální odpovědi
- Dnes je ${new Date().toLocaleDateString('cs-CZ')}`;

    const claudeRequest = {
      model: "claude-sonnet-4-20250514", // ✅ CLAUDE SONNET 4!
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search"
        }
      ]
    };

    console.log('🔧 Request with enhanced system prompt');

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
      console.error('❌ Claude API error:', response.status, errorText);
      return await fallbackBasicClaude(req.body, API_KEY, res);
    }

    const data = await response.json();
    console.log('✅ Raw Claude response received');

    // ✅ EXTRACT RESPONSE TEXT
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

    console.log('📝 Before cleaning:', responseText.substring(0, 200));

    // ✅ AGGRESSIVE CLEANING - REMOVE ALL TECHNICAL STUFF
    responseText = responseText
      // Remove all XML-like tags
      .replace(/<[^>]*>/g, '')
      // Remove query tags specifically  
      .replace(/<\/?query[^>]*>/gi, '')
      .replace(/<\/?web_search[^>]*>/gi, '')
      // Remove markdown web_search
      .replace(/\*\*web_search\*\*/gi, '')
      .replace(/\*\*query\*\*/gi, '')
      // Remove any remaining brackets with technical terms
      .replace(/\[web_search\]/gi, '')
      .replace(/\[query\]/gi, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    console.log('📝 After cleaning:', responseText.substring(0, 200));

    // ✅ VALIDATION - CHECK IF WE HAVE GOOD CONTENT
    if (responseText.length < 10 || responseText.includes('<') || responseText.includes('web_search')) {
      console.log('⚠️ Cleaning failed, trying fallback');
      return await fallbackBasicClaude(req.body, API_KEY, res);
    }

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: responseText }],
      model: data.model,
      usage: data.usage,
      debug_info: {
        original_length: data.content?.[0]?.text?.length || 0,
        cleaned_length: responseText.length,
        tools_used: data.content?.some(c => c.type === 'tool_use') || false
      }
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return await fallbackBasicClaude(req.body, process.env.CLAUDE_API_KEY, res);
  }
}

// ✅ FALLBACK FUNCTION
async function fallbackBasicClaude(requestBody, apiKey, res) {
  console.log('🔄 Fallback: Basic Claude without tools');
  
  const { messages, system, max_tokens = 2000 } = requestBody;
  
  const fallbackRequest = {
    model: "claude-sonnet-4-20250514", // ✅ SONNET 4 I V FALLBACK
    max_tokens: max_tokens,
    system: `${system || "Jsi Omnia v2"}\n\nINFO: Pracuji v základním režimu. Pro nejnovější finanční data doporučuji zkontrolovat Yahoo Finance, Bloomberg nebo oficiální burzu.`,
    messages: messages.slice(-6)
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