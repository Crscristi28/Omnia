// api/perplexity-search.js - ENHANCED GPT+PERPLEXITY INTEGRATION
// ✅ Language-aware search prompts for Czech/English/Romanian
// 🔍 TTS-optimized responses with proper number formatting
// 🔗 Source extraction for unified UI display

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8'); // ✅ UTF-8 encoding

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, language = 'cs' } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Query required and must be string' 
      });
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY not set');
      return res.status(500).json({ 
        success: false,
        error: 'Perplexity API key not configured' 
      });
    }

    console.log('🔍 Perplexity Enhanced search:', { 
      query: query.substring(0, 50) + '...', 
      language 
    });

    // 🌍 LANGUAGE-SPECIFIC SYSTEM PROMPTS FOR TTS-OPTIMIZED RESPONSES
    const systemPrompts = {
      'cs': `Jsi expert na vyhledávání aktuálních informací. 

🔍 KRITICKÉ INSTRUKCE:
- Odpovídej VÝHRADNĚ v češtině
- Používej nejnovější informace z internetu (${new Date().getFullYear()})
- Uveď konkrétní data, čísla a fakta
- NIKDY nepoužívej jiný jazyk než češtinu

🎵 FORMÁTOVÁNÍ PRO HLASOVÉ PŘEHRÁVÁNÍ:
- Čísla VŽDY slovy: "dvacet tři" (NE "23")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C")
- Čas: "čtrnáct hodin třicet minut" (NE "14:30")
- Procenta: "šedesát pět procent" (NE "65%")
- Měny: "sto padesát korun" (NE "150 Kč")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Datumy: "prvního července" (NE "jeden července")

🚫 ZAKÁZÁNO:
- NIKDY neuvádět zdroje jako [1] [2] [3]
- Žádné číslice v odpovědi (23, 15%, 10°C)
- Žádné zkratky (km/h, např., atd.)
- Integruj informace přirozeně do textu

📅 AKTUÁLNÍ DATUM: ${new Date().toLocaleDateString('cs-CZ')}`,

      'en': `You are an expert at finding current information.

🔍 CRITICAL INSTRUCTIONS:
- Respond EXCLUSIVELY in English
- Use the latest information from internet (${new Date().getFullYear()})
- Provide specific data, numbers and facts
- NEVER use any language other than English

🎵 FORMATTING FOR VOICE PLAYBACK:
- Numbers ALWAYS as words: "twenty-three" (NOT "23")
- Temperature: "twenty-three degrees Celsius" (NOT "23°C")
- Time: "two thirty PM" (NOT "14:30")
- Percentages: "sixty-five percent" (NOT "65%")
- Currency: "one hundred fifty dollars" (NOT "$150")
- Units: "kilometers per hour" (NOT "km/h")
- Dates: "July first" (NOT "July one")

🚫 FORBIDDEN:
- NEVER cite sources as [1] [2] [3]
- No digits in response (23, 15%, 10°C)
- No abbreviations (km/h, e.g., etc.)
- Integrate information naturally into text

📅 CURRENT DATE: ${new Date().toLocaleDateString('en-US')}`,

      'ro': `Ești expert în găsirea informațiilor actuale.

🔍 INSTRUCȚIUNI CRITICE:
- Răspunde EXCLUSIV în română
- Folosește informațiile cele mai recente de pe internet (${new Date().getFullYear()})
- Oferă date specifice, numere și fapte
- NU folosești NICIODATĂ altă limbă decât româna

🎵 FORMATARE PENTRU REDAREA VOCALĂ:
- Numerele ÎNTOTDEAUNA cu litere: "douăzeci și trei" (NU "23")
- Temperatura: "douăzeci și trei grade Celsius" (NU "23°C")
- Timpul: "două și jumătate" (NU "14:30")
- Procentele: "șaizeci și cinci la sută" (NU "65%")
- Moneda: "o sută cincizeci lei" (NU "150 lei")
- Unitățile: "kilometri pe oră" (NU "km/h")
- Datele: "prima iulie" (NU "unu iulie")

🚫 INTERZIS:
- NU cita niciodată sursele ca [1] [2] [3]
- Fără cifre în răspuns (23, 15%, 10°C)
- Fără abrevieri (km/h, ex., etc.)
- Integrează informațiile natural în text

📅 DATA ACTUALĂ: ${new Date().toLocaleDateString('ro-RO')}`
    };

    const systemPrompt = systemPrompts[language] || systemPrompts['cs'];

    // 🚀 PERPLEXITY API CALL WITH ENHANCED CONFIGURATION
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro', // ✅ Premium model for best results
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1500, // ✅ Increased for detailed responses
        temperature: 0.2, // ✅ Lower for factual accuracy
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      return res.status(response.status).json({ 
        success: false,
        error: 'Perplexity search failed',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid Perplexity response structure:', data);
      return res.status(500).json({
        success: false,
        error: 'Invalid response structure from Perplexity'
      });
    }

    const searchResult = data.choices[0].message.content;
    
    // 🔗 EXTRACT SOURCES/CITATIONS if available
    const citations = data.choices[0].message.metadata?.citations || [];
    const sources = citations.map((citation, index) => ({
      id: index + 1,
      title: citation.title || `Zdroj ${index + 1}`,
      url: citation.url || '#',
      domain: citation.url ? new URL(citation.url).hostname : 'unknown'
    }));

    console.log('✅ Perplexity search successful:', {
      language,
      resultLength: searchResult.length,
      sourcesCount: sources.length
    });

    // 🔗 RETURN UNIFIED RESPONSE FORMAT for openai.service.js
    return res.status(200).json({
      success: true,
      result: searchResult,
      sources: sources, // ✅ For unified sources UI
      citations: citations, // ✅ Raw citations data
      query: query,
      language: language,
      model: data.model,
      usage: data.usage || {},
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Perplexity search error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error during search',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}