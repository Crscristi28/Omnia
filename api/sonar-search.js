// 🔎 KOMPLETNÍ SONAR SEARCH s sonar-pro modelem
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

    console.log('🔎 Sonar Pro API call:', { query });

    // ✅ SONAR-PRO MODEL KONFIGURACE
    const payload = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 800,
      temperature: 0.2
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
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      throw new Error(`API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Sonar Pro response received');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure');
    }

    const result = data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      result: result,
      citations: data.choices[0].message.metadata?.citations || [],
      metadata: {
        model: 'sonar-pro',
        query: query,
        timestamp: new Date().toISOString(),
        search_type: 'sonar_pro_search'
      }
    });

  } catch (error) {
    console.error('💥 Sonar Pro error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Sonar Pro search failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}