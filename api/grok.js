// api/grok.js - GROK-3 API ENDPOINT WITH STREAMING
export default async function handler(req, res) {
  // CORS headers for streaming
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
    const { messages, system, max_tokens = 2000, search_parameters } = req.body;
    const API_KEY = process.env.GROK_API_KEY;
    
    if (!API_KEY) {
      res.write(JSON.stringify({
        error: true,
        message: 'Grok API key není nastaven'
      }) + '\n');
      return res.end();
    }

    const recentMessages = messages.slice(-6); // Keep more context for Grok
    
    // Prepare messages with system prompt
    const grokMessages = [
      {
        role: 'system',
        content: system || "Jsi Omnia, pokročilý AI asistent."
      },
      ...recentMessages
    ];

    const grokRequest = {
      model: "grok-3",
      max_tokens: max_tokens,
      messages: grokMessages,
      stream: false,  // Grok streaming needs different parsing
      temperature: 0.7
    };

    // Add search parameters if provided
    if (search_parameters) {
      grokRequest.search_parameters = search_parameters;
      console.log('🔍 Grok search enabled with parameters:', search_parameters);
    }

    console.log('🚀 Sending request to Grok-3...');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(grokRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Grok API error:', response.status, errorText);
      res.write(JSON.stringify({
        error: true,
        message: `HTTP ${response.status}: ${errorText}`
      }) + '\n');
      return res.end();
    }

    const data = await response.json();
    console.log('✅ Grok response received');
    console.log('🔍 Full Grok response:', JSON.stringify(data, null, 2));
    
    // Extract response text
    const textContent = data.choices?.[0]?.message?.content?.trim() || "Nepodařilo se získat odpověď.";

    // Extract citations/sources - check multiple locations
    let extractedSources = [];
    const citations = data.citations || data.choices?.[0]?.message?.citations || data.choices?.[0]?.citations || [];
    const webSearchUsed = citations && citations.length > 0;
    
    if (citations && Array.isArray(citations)) {
      console.log('🔗 Found', citations.length, 'citations from Grok');
      
      extractedSources = citations
        .filter(citation => citation && typeof citation === 'string')
        .map((url, index) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            
            // Extract title from URL/domain
            let title = domain;
            if (domain.includes('pocasi')) title = 'Počasí - ' + domain;
            else if (domain.includes('meteo')) title = 'Meteo - ' + domain;
            else if (domain.includes('chmi')) title = 'ČHMÚ - ' + domain;
            else if (domain.includes('weather')) title = 'Weather - ' + domain;
            else if (domain.includes('news')) title = 'News - ' + domain;
            else if (domain.includes('finance')) title = 'Finance - ' + domain;
            else if (domain.includes('yahoo')) title = 'Yahoo - ' + domain;
            else if (domain.includes('bloomberg')) title = 'Bloomberg - ' + domain;
            else if (domain.includes('reuters')) title = 'Reuters - ' + domain;
            
            return {
              title: title,
              url: url,
              snippet: `Zdroj ${index + 1}`,
              domain: domain,
              timestamp: Date.now()
            };
          } catch (urlError) {
            console.warn('⚠️ Invalid URL in Grok citation:', url);
            return null;
          }
        })
        .filter(source => source !== null)
        .slice(0, 10); // Limit to 10 sources
    }

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🔍 Web search used:', webSearchUsed);
    console.log('🔗 Sources found:', extractedSources.length);

    if (webSearchUsed) {
      // Send search notification
      res.write(JSON.stringify({
        type: 'search_start',
        message: '🔍 Vyhledávám aktuální informace...'
      }) + '\n');
      
      // Small delay to simulate search
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 🚀 FAST STREAMING: Send by words instead of letters
    const words = textContent.split(' ');
    
    for (const word of words) {
      res.write(JSON.stringify({
        type: 'text',
        content: word + ' '
      }) + '\n');
      
      // Minimal delay for streaming effect
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    
    // Send final completion with sources
    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      webSearchUsed: webSearchUsed,
      sources: extractedSources,
      citations: extractedSources
    }) + '\n');

    console.log('✅ Grok streaming completed with sources:', extractedSources.length);

    console.log('✅ Grok streaming completed');
    res.end();

  } catch (error) {
    console.error('💥 Fatal error in Grok streaming:', error);
    
    res.write(JSON.stringify({
      error: true,
      message: 'Server error: ' + error.message
    }) + '\n');
    
    res.end();
  }
}