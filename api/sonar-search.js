// 🔎 FUNGUJÍCÍ SONAR SEARCH - Jednoduchá verze
// Soubor: api/sonar-search.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // ✅ MINIMÁLNÍ KONFIGURACE
    const payload = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
      search_recency_filter: "month"
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response');
    }

    const result = data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      result: result,
      citations: data.choices[0].message.metadata?.citations || [],
      metadata: {
        model: 'llama-3.1-sonar-large-128k-online',
        query: query,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sonar error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}