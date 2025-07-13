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
      stream: false, // We'll simulate streaming on our side
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
    
    // Extract response text
    const textContent = data.choices?.[0]?.message?.content?.trim() || "Nepodařilo se získat odpověď.";

    // Extract citations/sources
    let extractedSources = [];
    const webSearchUsed = data.citations && data.citations.length > 0;
    
    if (data.citations && Array.isArray(data.citations)) {
      console.log('🔗 Found', data.citations.length, 'citations from Grok');
      
      extractedSources = data.citations
        .filter(citation => citation && citation.url && citation.title)
        .map(citation => {
          try {
            const urlObj = new URL(citation.url);
            return {
              title: citation.title.trim().slice(0, 100),
              url: citation.url,
              domain: urlObj.hostname.replace('www.', ''),
              timestamp: Date.now()
            };
          } catch (urlError) {
            console.warn('⚠️ Invalid URL in Grok citation:', citation.url);
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