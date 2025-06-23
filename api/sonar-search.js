// 🚨 DRASTICKÁ OPRAVA - sonar-search.js
// Úplně jiný model a přístup

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    console.log('🔎 Sonar API call:', { query });

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

    // 🔧 ZKUS JINÝ MODEL - možná problém je v sonar-large
    const sonarPayload = {
      model: 'llama-3.1-sonar-small-128k-online', // ✅ ZMĚNA NA SMALL
      messages: [
        {
          role: 'user',
          content: `Search for: ${query}. Answer in Czech language briefly.` // ✅ ANGLICKÝ PROMPT
        }
      ],
      max_tokens: 500, // ✅ JEŠTĚ MÉNĚ
      temperature: 0.7, // ✅ VYŠŠÍ TEMPERATURA
      top_p: 0.95,
      search_recency_filter: "month",
      stream: false,
      presence_penalty: 0.5, // ✅ VYSOKÁ PENALIZACE OPAKOVÁNÍ
      frequency_penalty: 0.8  // ✅ VELMI VYSOKÁ PENALIZACE
    };

    console.log('🚀 Sending request to Perplexity...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sonarPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      
      // ✅ FALLBACK ODPOVĚĎ MÍSTO CHYBY
      return res.status(200).json({
        success: true,
        result: `Promiňte, momentálně nemohu vyhledat informace o "${query}". Zkuste prosím Omnia v2 (Claude) pro spolehlivé vyhledávání.`,
        metadata: {
          model: 'fallback',
          query: query,
          timestamp: new Date().toISOString()
        }
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure');
    }

    let result = data.choices[0].message.content;

    // ✅ AGRESIVNÍ DETEKCE OPAKOVÁNÍ
    if (hasRepeatingPattern(result)) {
      console.warn('⚠️ Detected repetition, using fallback');
      result = `Omlouváme se, ale došlo k chybě při zpracování dotazu "${query}". Doporučujeme použít Omnia v2 pro spolehlivé vyhledávání aktuálních informací.`;
    }

    // ✅ ZKRÁCENÍ ODPOVĚDI
    if (result.length > 800) {
      result = result.substring(0, 800) + '...';
    }

    console.log('✅ Sonar response processed');

    return res.status(200).json({
      success: true,
      result: result,
      metadata: {
        model: 'llama-3.1-sonar-small-128k-online',
        query: query,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Sonar error:', error);
    
    // ✅ VŽDY VRAŤ ÚSPĚŠNOU ODPOVĚĎ S FALLBACK
    return res.status(200).json({
      success: true,
      result: `Nastala chyba při vyhledávání. Pro spolehlivé vyhledávání aktuálních informací doporučujeme Omnia v2.`,
      metadata: {
        model: 'error_fallback',
        query: req.body.query || 'unknown',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
}

// 🔍 AGRESIVNÍ DETEKCE OPAKOVÁNÍ
function hasRepeatingPattern(text) {
  if (!text || text.length < 20) return false;
  
  // Kontrola opakujících se slov
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = {};
  
  for (const word of words) {
    if (word.length > 2) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] > 3) { // Už po 3 opakováních
        return true;
      }
    }
  }
  
  // Kontrola opakujících se částí
  for (let i = 0; i < text.length - 10; i++) {
    const substring = text.substring(i, i + 10);
    const restOfText = text.substring(i + 10);
    if (restOfText.includes(substring)) {
      return true;
    }
  }
  
  return false;
}