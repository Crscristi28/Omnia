// api/perplexity-search.js - OPRAVENÁ verze se správným modelem

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
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'Perplexity API key not set' });
    }

    console.log('🔍 Perplexity search for:', query);

    const currentYear = new Date().getFullYear();

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar", // ✅ OPRAVENO - správný název z dokumentace
        messages: [
          {
            role: "system",
            content: `Jsi expert na vyhledávání aktuálních informací. Odpovídej vždy v češtině. Používej nejnovější informace z internetu a uveď zdroje. Aktuální rok je ${currentYear}. Můžeš uvádět i informace z roku ${currentYear}.`
          },
          {
            role: "user",
            content: `Vyhledej aktuální informace o: ${query}. Odpověz v češtině s konkrétními daty a zdroji.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
        // ✅ ODSTRANĚNO - return_citations a search_recency_filter možná dělají problémy
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      return res.status(500).json({ 
        error: 'Perplexity search failed',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Perplexity search success');

    const searchResult = data.choices[0].message.content;
    // ✅ CITACE z metadata
    const citations = data.choices[0].message.metadata?.citations || [];

    return res.status(200).json({
      success: true,
      result: searchResult,
      citations: citations,
      query: query,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('💥 Perplexity search error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}