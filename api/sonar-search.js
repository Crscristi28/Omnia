// 🔎 OPRAVENÝ SONAR SEARCH API ENDPOINT
// Soubor: api/sonar-search.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, recency_filter, search_type, focus, date_range } = req.body;

    console.log('🔎 Sonar API call:', { query, recency_filter });

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // ✅ SONAR/PERPLEXITY API CONFIGURATION
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // 🔎 ZJEDNODUŠENÝ SONAR PROMPT - OPRAVA SMYČKY
    const sonarPayload = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: `Odpovídej stručně v češtině na základě aktuálních informací z internetu. Uveď konkrétní data a čísla.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 1000, // ✅ SNÍŽENO z 2000
      temperature: 0.3, // ✅ ZVÝŠENO z 0.1
      top_p: 0.9,
      search_domain_filter: [],
      return_images: false,
      return_related_questions: false,
      search_recency_filter: recency_filter || "month",
      top_k: 0,
      stream: false,
      presence_penalty: 0.1, // ✅ PŘIDÁNO pro zabránění opakování
      frequency_penalty: 0.2  // ✅ ZVÝŠENO pro zabránění opakování
    };

    console.log('🚀 Sending request to Perplexity Sonar API...');

    // ✅ VOLÁNÍ PERPLEXITY API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Omnia-Search-v1'
      },
      body: JSON.stringify(sonarPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Perplexity Sonar response received');

    // ✅ VALIDACE ODPOVĚDI
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid Perplexity response structure:', data);
      throw new Error('Invalid response from Perplexity API');
    }

    let result = data.choices[0].message.content;

    // ✅ OCHRANA PROTI OPAKOVÁNÍ - DETEKCE SMYČKY
    if (isRepeatingText(result)) {
      console.warn('⚠️ Detected repeating text, using fallback response');
      result = `Promiňte, nastala chyba při zpracování vašeho dotazu "${query}". Zkuste prosím jiný dotaz nebo přepněte na Omnia v2.`;
    }

    // ✅ EXTRAKCE CITACÍ (pokud jsou dostupné)
    let citations = [];
    if (data.choices[0].message.metadata) {
      citations = data.choices[0].message.metadata.citations || [];
    }

    // ✅ ZÁKLADNÍ VALIDACE VÝSLEDKU
    const currentYear = new Date().getFullYear();
    const enhancedResult = validateAndEnhanceResult(result, query, currentYear);

    console.log('🎯 Sonar search completed successfully');

    return res.status(200).json({
      success: true,
      result: enhancedResult,
      citations: citations,
      metadata: {
        model: 'llama-3.1-sonar-large-128k-online',
        query: query,
        timestamp: new Date().toISOString(),
        search_type: 'sonar_web_search'
      }
    });

  } catch (error) {
    console.error('💥 Sonar search error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Sonar search failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🔍 HELPER FUNKCE - Detekce opakujícího se textu
function isRepeatingText(text) {
  if (!text || text.length < 50) return false;
  
  // Rozdělí text na slova
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 10) return false;
  
  // Kontrola zda se nějaké slovo opakuje víc než 5x
  const wordCount = {};
  for (const word of words) {
    if (word.length > 3) { // Ignoruj krátká slova
      wordCount[word] = (wordCount[word] || 0) + 1;
      if (wordCount[word] > 5) {
        return true; // Našli jsme opakování
      }
    }
  }
  
  // Kontrola opakujících se frází
  const text_lower = text.toLowerCase();
  const phrases = text_lower.match(/(.{10,}?)\1+/g);
  if (phrases && phrases.length > 0) {
    return true; // Našli jsme opakující se fráze
  }
  
  return false;
}

// 🔍 HELPER FUNKCE - Validace a vylepšení výsledků
function validateAndEnhanceResult(result, originalQuery, currentYear) {
  // Kontrola na opakování
  if (isRepeatingText(result)) {
    return `Promiňte, nastala chyba při zpracování dotazu "${originalQuery}". Zkuste jiný dotaz nebo použijte Omnia v2.`;
  }
  
  const lastYear = currentYear - 1;
  
  // Kontrola starých dat
  const hasOldData = result.includes('2023') || result.includes('2022') || result.includes('2021');
  const hasCurrentData = result.includes(currentYear.toString()) || result.includes(lastYear.toString());
  
  if (hasOldData && !hasCurrentData) {
    return `⚠️ UPOZORNĚNÍ: Některé informace mohou být starší.\n\n${result}\n\n💡 TIP: Pro nejnovější informace zkuste konkrétnější dotaz.`;
  }
  
  // Zkrácení příliš dlouhých odpovědí
  if (result.length > 1500) {
    return result.substring(0, 1500) + '...';
  }
  
  return result;
}