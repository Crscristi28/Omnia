// api/claude2.js - FIXED TOOLS CONFIGURATION

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
    console.log('🚀 Claude Sonnet 4 with fixed tools config');
    
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Claude API key není nastaven'
      });
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ SIMPLIFIED SYSTEM PROMPT
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý AI asistent."} 

Odpovídej vždy v češtině, stručně a přirozeně. Když potřebuješ aktuální informace, automaticky je vyhledej. Nikdy nepiš technické tagy do finální odpovědi.`;

    // ✅ FIRST TRY: WITHOUT TOOLS (safer approach)
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
      // ❌ NO TOOLS - avoid API errors
    };

    console.log('🔧 Trying Sonnet 4 without tools first');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01' // ✅ STABLE VERSION
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sonnet 4 error:', response.status, errorText);
      
      // ✅ FALLBACK TO PROVEN STABLE VERSION
      return await fallbackStableVersion(req.body, API_KEY, res);
    }

    const data = await response.json();
    console.log('✅ Sonnet 4 response received');

    // ✅ EXTRACT RESPONSE
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
      .replace(/<[^>]*>/g, '') // Remove all XML tags
      .replace(/\*\*web_search\*\*/gi, '')
      .trim();

    return res.status(200).json({
      success: true,
      content: [{ type: 'text', text: responseText }],
      model: data.model,
      usage: data.usage,
      mode: 'sonnet4_basic'
    });

  } catch (error) {
    console.error('💥 Error:', error);
    return await fallbackStableVersion(req.body, process.env.CLAUDE_API_KEY, res);
  }
}

// ✅ FALLBACK TO PROVEN STABLE VERSION
async function fallbackStableVersion(requestBody, apiKey, res) {
  console.log('🔄 Fallback: Stable Claude 3.5 Sonnet');
  
  const { messages, system, max_tokens = 2000 } = requestBody;
  
  const fallbackRequest = {
    model: "claude-3-5-sonnet-20241022", // ✅ PROVEN STABLE
    max_tokens: max_tokens,
    system: `${system || "Jsi Omnia v2"}\n\nOdpovídej v češtině, stručně a přirozeně. Pro aktuální finanční data doporučuji zkontrolovat Yahoo Finance nebo Bloomberg.`,
    messages: messages.slice(-6)
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
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
    mode: 'stable_fallback'
  });
}