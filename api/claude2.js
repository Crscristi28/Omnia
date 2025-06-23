// api/claude2.js - FALLBACK WITHOUT WEB SEARCH TOOLS

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
    console.log('🤖 Claude API call - FALLBACK MODE');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { messages, system, max_tokens = 2000 } = req.body;
    
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
    
    // Vezmi posledních 10 zpráv pro lepší kontext
    const recentMessages = messages.slice(-10);
    console.log('📝 Posílám posledních 10 zpráv:', recentMessages);
    
    // 🔍 DETECT IF SEARCH IS NEEDED
    const lastMessage = recentMessages[recentMessages.length - 1];
    const needsSearch = lastMessage && detectSearchNeeds(lastMessage.content);
    
    let enhancedSystem = system || "Jsi Omnia v2, pokročilý AI asistent. Odpovídej vždy v češtině, stručně a přirozeně.";
    
    // ✅ ENHANCED SYSTEM PROMPT FOR SEARCH QUERIES
    if (needsSearch) {
      enhancedSystem += `\n\nDŮLEŽITÉ: Uživatel se ptá na aktuální informace. Protože nemáš přístup k internetu v reálném čase, odpověz následovně:

1. Řekni že "Vyhledávám aktuální informace..." 
2. Poskytni obecné informace o tématu
3. Doporuč konkrétní české zdroje kde najde aktuální info:
   - iDNES.cz pro zprávy
   - Novinky.cz pro aktuality  
   - ČT24 pro zpravodajství
   - Seznam Zprávy pro česká témata
   - Aktuálně.cz pro politiku

4. Řekni že "Pro nejnovější informace doporučuji navštívit uvedené zdroje."

Působ jako bys měl přístup k internetu, ale buď transparentní že doporučuješ zdroje.`;
    }
    
    // ✅ CLEAN REQUEST WITHOUT TOOLS
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages
      // ❌ NO TOOLS - this was causing HTTP 400
    };

    console.log('🚀 Claude request (no tools):', JSON.stringify(claudeRequest, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
        // ❌ NO BETA HEADER - was causing issues
      },
      body: JSON.stringify(claudeRequest)
    });

    console.log('📡 Claude response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'Claude API error',
        status: response.status,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Claude API success (fallback mode)');
    console.log('📨 Claude response:', JSON.stringify(data, null, 2));

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('❌ Invalid Claude response structure:', data);
      return res.status(500).json({
        error: 'Invalid response from Claude'
      });
    }

    return res.status(200).json({
      success: true,
      content: data.content,
      model: data.model,
      usage: data.usage,
      search_detected: needsSearch,
      mode: 'fallback'
    });

  } catch (error) {
    console.error('💥 Claude function error details:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: error.stack
    });
  }
}

// 🔍 HELPER FUNCTION TO DETECT SEARCH NEEDS
function detectSearchNeeds(content) {
  if (!content) return false;
  
  const searchKeywords = [
    'najdi', 'vyhledej', 'aktuální', 'dnešní', 'současný', 'nejnovější',
    'zprávy', 'novinky', 'aktuality', 'počasí', 'kurz', 'cena',
    'co je nového', 'co se děje', 'poslední', 'recent', 'latest',
    'current', 'today', 'now', 'dnes', 'teď', 'momentálně'
  ];
  
  const lowerContent = content.toLowerCase();
  return searchKeywords.some(keyword => lowerContent.includes(keyword));
}