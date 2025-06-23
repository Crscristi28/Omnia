// 🔎 SONAR SEARCH API ENDPOINT
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

    // 🔎 SONAR SPECIFIC MODEL & SYSTEM PROMPT
    const sonarPayload = {
      model: 'llama-3.1-sonar-large-128k-online', // Nejnovější Sonar model
      messages: [
        {
          role: 'system',
          content: `Jsi Sonar v3, pokročilý AI asistent s přístupem k aktuálním informacím z internetu. 

PRAVIDLA:
- Odpovídej VÝHRADNĚ v češtině
- Zaměř se na nejnovější informace z roku ${new Date().getFullYear()}
- Prioritizuj čerstvé zdroje a aktuální data
- Piš stručně, fakticky a přehledně
- Uveď konkrétní čísla, data a fakta
- Nepiš "Jsem AI" ani se nepředstavuj

AKTUÁLNÍ KONTEXT: ${new Date().toLocaleDateString('cs-CZ')}`
        },
        {
          role: 'user',
          content: `Prosím vyhledej aktuální informace k dotazu: "${query}"

Zaměř se na:
- Nejnovější informace z roku 2024-2025
- Ověřené zdroje a fakta
- Konkrétní čísla a data
- Aktuální stav situace

Odpověz stručně a fakticky v češtině.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.1, // Nižší temperatura pro faktické odpovědi
      top_p: 0.9,
      search_domain_filter: ["perplexity.ai"], // Můžeš přidat specifické domény
      return_images: false,
      return_related_questions: false,
      search_recency_filter: recency_filter || "month", // month, week, day
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 0.1
    };

    console.log('🚀 Sending request to Perplexity Sonar API...');

    // ✅ VOLÁNÍ PERPLEXITY API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Omnia-Sonar-v3'
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

    const result = data.choices[0].message.content;

    // ✅ EXTRAKCE CITACÍ (pokud jsou dostupné)
    let citations = [];
    if (data.choices[0].message.metadata) {
      citations = data.choices[0].message.metadata.citations || [];
    }

    // ✅ VALIDACE ČERSTVOSTI DAT
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

// 🔍 HELPER FUNKCE - Validace a vylepšení výsledků
function validateAndEnhanceResult(result, originalQuery, currentYear) {
  const lastYear = currentYear - 1;
  
  // Kontrola starých dat
  const hasOldData = result.includes('2023') || result.includes('2022') || result.includes('2021');
  const hasCurrentData = result.includes(currentYear.toString()) || result.includes(lastYear.toString());
  
  if (hasOldData && !hasCurrentData) {
    return `⚠️ UPOZORNĚNÍ: Některé informace mohou být starší. Aktuální data pro "${originalQuery}":\n\n${result}\n\n💡 TIP: Pro nejnovější informace zkuste vyhledat přímo na specializovaných stránkách.`;
  }
  
  // Přidání časového kontextu
  if (!result.toLowerCase().includes('aktuální') && !result.toLowerCase().includes(currentYear.toString())) {
    return `📅 AKTUÁLNÍ INFORMACE (${currentYear}):\n\n${result}`;
  }
  
  return result;
}

// 🔧 HELPER FUNKCE - Vylepšení dotazu pro aktuální data
function enhanceQueryForCurrentData(originalQuery) {
  const query = originalQuery.toLowerCase();
  const currentYear = new Date().getFullYear();
  
  // Pokud dotaz už obsahuje rok 2024/2025, nech ho být
  if (query.includes('2024') || query.includes('2025')) {
    return originalQuery;
  }

  // Temporal keywords
  const temporalTriggers = [
    'aktuální', 'dnešní', 'současný', 'nejnovější', 'poslední',
    'zprávy', 'novinky', 'aktuality', 'cena', 'kurz', 'počasí',
    'dnes', 'teď', 'momentálně', 'current', 'latest', 'recent'
  ];

  const needsTimeFilter = temporalTriggers.some(trigger => query.includes(trigger));
  
  if (needsTimeFilter) {
    return `${originalQuery} ${currentYear} aktuální`;
  }

  // Financial/price queries
  const financialKeywords = ['cena', 'kurz', 'akcie', 'burza', 'bitcoin', 'krypto'];
  if (financialKeywords.some(keyword => query.includes(keyword))) {
    return `${originalQuery} ${currentYear} aktuální cena`;
  }

  // News queries
  const newsKeywords = ['zprávy', 'novinky', 'aktuality', 'události', 'situace'];
  if (newsKeywords.some(keyword => query.includes(keyword))) {
    return `${originalQuery} ${currentYear} nejnovější zprávy`;
  }

  // Default enhancement
  return `${originalQuery} ${currentYear}`;
}