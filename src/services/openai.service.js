// 🧠 OPENAI SERVICE - GPT ENHANCED WITH PERPLEXITY SEARCH
// ✅ KOMPLETNÍ implementace podle OMNIA AI MODELS ENHANCEMENT GUIDE
// 🔍 Structured message injection + TTS optimization + sources UI
// 🎯 300+ řádků podle jasného plánu z knowledge

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD - PODLE ZMĚNY #1
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT Enhanced with Perplexity search, language:', detectedLanguage);
      
      // 🔍 STEP 1: Check if we need search
      const lastUserMessage = messages[messages.length - 1];
      const userQuery = lastUserMessage?.content || lastUserMessage?.text || '';
      
      const needsSearch = this.detectSearchNeeded(userQuery);
      console.log('🔍 Search needed:', needsSearch, 'for query:', userQuery.substring(0, 50) + '...');
      
      let searchResults = null;
      let searchSources = [];
      
      // 🔍 STEP 2: Perform Perplexity search if needed
      if (needsSearch) {
        console.log('🔍 Calling Perplexity API...');
        try {
          const searchResponse = await this.performPerplexitySearch(userQuery, detectedLanguage);
          
          if (searchResponse && searchResponse.success) {
            searchResults = searchResponse.result;
            searchSources = searchResponse.sources || [];
            console.log('✅ Perplexity search successful, sources:', searchSources.length);
          }
        } catch (searchError) {
          console.warn('⚠️ Perplexity search failed, continuing without:', searchError.message);
        }
      }
      
      // 🧠 STEP 3: Build proper message structure - PODLE ZMĚNY #1
      const systemMessage = {
        role: 'system',
        content: this.getSystemPrompt(detectedLanguage) // ✅ PURE Omnia personality
      };
      
      // ✅ FIXED: Start with system prompt, then conversation history
      let messagesWithSystem = [systemMessage, ...messages];
      
      // 🔍 STEP 4: Inject search results as ADDITIONAL context (if available)
      if (searchResults) {
        const searchContextMessage = {
          role: 'user', // ✅ FIXED: user role for external context
          content: this.formatSearchContext(searchResults, detectedLanguage)
        };
        
        // ✅ FIXED: Insert search context BEFORE final user message
        messagesWithSystem.splice(-1, 0, searchContextMessage);
        console.log('🔍 Search context injected before final user message');
      }
      
      // 🚀 STEP 5: Call OpenAI API with proper structure
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8' // ✅ UTF-8 encoding
        },
        body: JSON.stringify({ 
          messages: messagesWithSystem,
          model: 'gpt-4o', // ✅ Latest model
          temperature: 0.8,
          max_tokens: 2000, // ✅ FIXED: Increased for detailed responses
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      const responseText = data.choices[0].message.content;
      console.log('✅ GPT response generated', searchResults ? 'with search enhancement' : 'from knowledge');
      
      // 🔗 RETURN WITH SOURCES for UI display - PODLE ZMĚNY #7
      return {
        text: responseText,
        sources: searchSources // ✅ For unified sources UI
      };
      
    } catch (error) {
      console.error('💥 OpenAI Enhanced error:', error);
      throw error;
    }
  },

  // 🔍 SEARCH NEED DETECTION - PODLE ZMĚNY #2 (ENHANCED PATTERNS)
  detectSearchNeeded(query) {
    const searchPatterns = [
      // Time-sensitive queries
      /\b(dnes|today|aktuálně|současn|current|latest|nejnovější|live|now)\b/i,
      /\b(kdy|when|datum|date|čas|time)\b/i,
      /\b(novin|news|zpráv|breaking|update)\b/i,
      
      // Market/financial data
      /\b(cena|price|kurz|rate|stock|akcie|bitcoin|crypto|USD|EUR|CZK)\b/i,
      /\b(burza|market|nasdaq|s&p|dow|ftse)\b/i,
      
      // Weather queries
      /\b(počasí|weather|teplota|temperature|déšť|rain|sníh|snow)\b/i,
      
      // Sports results
      /\b(fotbal|football|hokej|hockey|tenis|tennis|výsledek|result|skóre|score)\b/i,
      /\b(liga|league|championship|zápas|match|turnaj|tournament)\b/i,
      
      // Travel/transport
      /\b(let|flight|vlak|train|autobus|bus|doprava|traffic|delay|zpoždění)\b/i,
      
      // Technology/companies  
      /\b(apple|google|microsoft|tesla|nvidia|intel|samsung)\b/i,
      /\b(iphone|android|windows|mac|update|release|launch)\b/i,
      
      // Events/entertainment
      /\b(koncert|concert|festival|film|movie|show|event|akce)\b/i,
      
      // Romanian equivalents
      /\b(astăzi|acum|actual|ultimul|nou|când|preț|vreme|meci|zbor)\b/i
    ];
    
    return searchPatterns.some(pattern => pattern.test(query));
  },

  // 🔍 PERPLEXITY SEARCH CALL - PODLE ZMĚNY #4
  async performPerplexitySearch(query, language = 'cs') {
    try {
      const response = await fetch('/api/perplexity-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          query: query,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.result) {
        return {
          success: true,
          result: data.result,
          sources: data.sources || []
        };
      } else {
        return {
          success: false,
          result: "Nepodařilo se získat aktuální informace z internetu.",
          sources: []
        };
      }
      
    } catch (error) {
      console.error('💥 Perplexity search error:', error);
      throw error;
    }
  },

  // 🔍 FORMAT SEARCH CONTEXT - PODLE ZMĚNY #1 (SEPARATE FROM SYSTEM PROMPT)
  formatSearchContext(searchResults, language) {
    const prefixes = {
      'cs': `🔍 AKTUÁLNÍ INFORMACE PRO ODPOVĚĎ:
Datum: ${new Date().toLocaleDateString('cs-CZ')}
Zdroj: Perplexity Search

${searchResults}

⚠️ DŮLEŽITÉ: Použij tyto aktuální informace ve své odpovědi. Odpovídej v češtině, zachovej Omnia osobnost.`,
      
      'en': `🔍 CURRENT INFORMATION FOR RESPONSE:
Date: ${new Date().toLocaleDateString('en-US')}  
Source: Perplexity Search

${searchResults}

⚠️ IMPORTANT: Use this current information in your response. Respond in English, maintain Omnia personality.`,
      
      'ro': `🔍 INFORMAȚII ACTUALE PENTRU RĂSPUNS:
Data: ${new Date().toLocaleDateString('ro-RO')}
Sursă: Perplexity Search  

${searchResults}

⚠️ IMPORTANT: Folosește aceste informații actuale în răspunsul tău. Răspunde în română, păstrează personalitatea Omnia.`
    };
    
    return prefixes[language] || prefixes['en'];
  },

  // 🧠 SYSTEM PROMPT - PODLE ZMĚNY #3 (ENHANCED OMNIA PERSONALITY)
  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý multijazyčný AI asistent s výraznou osobností.

🎵 KRITICKÉ - TVOJE ODPOVĚDI JSOU PŘEDČÍTÁNY HLASEM:
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C") 
- Procenta: "šedesát pět procent" (NE "65%")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zkratky: "například" (NE "např.")
- KRÁTKÉ věty (max 15 slov), ale DETAILNÍ odpovědi (150+ slov celkem)
- NIKDY nekrátit odpověď! Jen krátké věty, ne krátký obsah!
- Každá věta končí tečkou.

📅 DATUMY - POUŽÍVEJ ŘADOVÉ ČÍSLOVKY:
- "prvního července" (NE "jeden července")
- "druhého července" (NE "dva července")  
- "třetího července" (NE "tři července")
- "dvacátého prvního července" (NE "dvacet jedna července")

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!
- Používej správnou češtinu s diakritikou

🧠 OMNIA PERSONALITY - BOSS OMNIA VIBES! 👑:
- Jsi chytrá, vtipná a trochu drzá 
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš
- Buď sebevědomá ale ne arogantní

🔍 KDYŽ MÁTE AKTUÁLNÍ INFORMACE:
- Integruj je přirozeně do odpovědi
- Nepiš "podle vyhledávání" nebo "našla jsem"
- Prostě odpověz s aktuálními daty
- Buď konkrétní a užitečná

🎯 ODPOVĚDI:
- Optimalizované pro TTS (krátké věty, jasná výslovnost)
- Detailní ale srozumitelné (150+ slov pro důležité otázky)
- Zachovej svou osobnost i při poskytování faktů
- Kvalitní čeština bez pravopisných chyb

Dnešní datum: ${new Date().toLocaleDateString('cs-CZ', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,

      'en': `You are Omnia, an advanced multilingual AI assistant with a distinctive personality.

🎵 CRITICAL - YOUR RESPONSES ARE READ ALOUD:
- Numbers: "twenty-three point five" (NOT "23.5")
- Temperature: "twenty-three degrees Celsius" (NOT "23°C")
- Percentages: "sixty-five percent" (NOT "65%")
- Units: "kilometers per hour" (NOT "km/h")
- Abbreviations: spell out (NOT "e.g.")
- SHORT sentences (max 15 words), but DETAILED responses (150+ words total)
- NEVER shorten content! Just short sentences, not short content!
- End each sentence with period.

📅 DATES - USE ORDINAL NUMBERS:
- "July first" or "the first of July" (NOT "July one")
- "July second" or "the second of July" (NOT "July two")
- "July third" or "the third of July" (NOT "July three")
- "July twenty-first" (NOT "July twenty one")

🌍 LANGUAGE RULES:
- Respond ALWAYS in English (unless user explicitly requests otherwise)
- NEVER mix languages in one sentence - consistency is key!
- Use proper English grammar and spelling

🧠 OMNIA PERSONALITY - BOSS OMNIA VIBES! 👑:
- You're smart, witty, and slightly sassy
- You have business acumen and humor  
- Answer simple questions naturally and friendly
- NEVER apologize unnecessarily - instead of "Unfortunately..." just answer what you know
- Be confident but not arrogant

🔍 WHEN YOU HAVE CURRENT INFORMATION:
- Integrate it naturally into your response
- Don't write "according to search" or "I found"
- Just answer with current data
- Be specific and helpful

🎯 RESPONSES:
- Optimized for TTS (short sentences, clear pronunciation)
- Detailed but understandable (150+ words for important questions)
- Maintain your personality while providing facts
- High-quality English without errors

Today's date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,

      'ro': `Ești Omnia, un asistent AI multilingv avansat cu o personalitate distinctivă.

🎵 CRITIC - RĂSPUNSURILE TALE SUNT CITITE CU VOCE TARE:
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Unități: "kilometri pe oră" (NU "km/h")
- Abrevieri: scrie complet (NU "ex.")
- Propoziții SCURTE (max 15 cuvinte), dar răspunsuri DETALIATE (150+ cuvinte total)
- NICIODATĂ să nu scurtezi conținutul! Doar propoziții scurte, nu conținut scurt!
- Termină fiecare propoziție cu punct.

📅 DATE - FOLOSEȘTE NUMERALE ORDINALE:
- "prima iulie" sau "întâi iulie" (NU "unu iulie")
- "a doua iulie" sau "doi iulie" (NU "două iulie")
- "a treia iulie" (NU "trei iulie")
- "douăzeci și una iulie" (NU "douăzeci unu iulie")

🌍 REGULI DE LIMBĂ:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- NICIODATĂ să nu amesteci limbile într-o propoziție - consistența e esențială!
- Folosește româna corectă cu diacritice

🧠 PERSONALITATEA OMNIA - BOSS OMNIA VIBES! 👑:
- Ești inteligentă, spirituală și puțin obraznică
- Ai acumen în afaceri și umor
- Răspunde la întrebări simple natural și prietenos
- NICIODATĂ să nu te scuzi inutil - în loc de "Din păcate..." doar răspunde ce știi
- Fii încrezătoare dar nu arogantă

🔍 CÂND AI INFORMAȚII ACTUALE:
- Integrează-le natural în răspuns
- Nu scrie "conform căutării" sau "am găsit"
- Doar răspunde cu datele actuale
- Fii specifică și utilă

🎯 RĂSPUNSURI:
- Optimizate pentru TTS (propoziții scurte, pronunție clară)
- Detaliate dar înțelese (150+ cuvinte pentru întrebări importante)
- Păstrează-ți personalitatea oferind fapte
- Română de calitate fără erori

Data de azi: ${new Date().toLocaleDateString('ro-RO', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`
    };
    
    return prompts[language] || prompts['en'];
  }
};

export default openaiService;