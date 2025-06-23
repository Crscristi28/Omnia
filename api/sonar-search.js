// 🔎 OPRAVENÉ NÁZVY MODELŮ v sonar-search.js
// Podle Perplexity dokumentace:

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

    // ✅ SPRÁVNÝ NÁZEV MODELU z dokumentace
    const payload = {
      model: 'sonar',  // ✅ NEBO zkus 'sonar-pro' pro lepší výsledky
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

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure');
    }

    const result = data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      result: result,
      citations: data.choices[0].message.metadata?.citations || [],
      metadata: {
        model: 'sonar',
        query: query,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Sonar error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ✅ DOSTUPNÉ MODELY z dokumentace:
// - sonar              (128k context) - základní
// - sonar-pro          (200k context) - lepší, ale dražší  
// - sonar-reasoning    (128k context)
// - sonar-reasoning-pro (128k context)  
// - sonar-deep-research (128k context)
// - r1-1776            (128k context) - offline model