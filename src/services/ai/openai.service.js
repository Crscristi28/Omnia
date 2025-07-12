// 🧠 OPENAI SERVICE - CLAUDE-INSPIRED LANGUAGE CONSISTENCY
// ✅ FIXED: Balanced language enforcement + Omnia personality
// 🎯 CLAUDE-STYLE PROMPTS: Same energy as Claude's Omnia

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD (unchanged structure)
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT Enhanced with Claude-inspired language handling, language:', detectedLanguage);
      
      // 🔍 STEP 1: Enhanced smart search detection
      const lastUserMessage = messages[messages.length - 1];
      const userQuery = lastUserMessage?.content || lastUserMessage?.text || '';
      
      const needsSearch = this.detectSearchNeeded(userQuery, messages);
      console.log('🔍 Search needed:', needsSearch, 'for query:', userQuery.substring(0, 50) + '...');
      
      let searchResults = null;
      let searchSources = [];
      
      // 🔍 STEP 2: Claude web search with clean language handling
      if (needsSearch) {
        console.log('🔍 Calling Claude web search API...');
        try {
          const searchResponse = await this.performClaudeWebSearch(userQuery, detectedLanguage);
          
          if (searchResponse && searchResponse.success) {
            searchResults = searchResponse.result;
            searchSources = searchResponse.sources || [];
            console.log('✅ Claude web search successful, sources:', searchSources.length);
          }
        } catch (searchError) {
          console.warn('⚠️ Claude web search failed, continuing without:', searchError.message);
        }
      }
      
      // 🧠 STEP 3: Claude-inspired message structure (CLEAN)
      let messagesWithSystem = [];
      
      // Add CLAUDE-STYLE system prompt with personality
      const systemPromptMessage = {
        role: "system",
        content: this.getClaudeStyleSystemPrompt(detectedLanguage)
      };
      messagesWithSystem.push(systemPromptMessage);
      
      // Add conversation history cleanly
      const conversationHistory = messages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || msg.content || ''
      }));
      messagesWithSystem.push(...conversationHistory);
      
      // ✅ CRITICAL: Add search context as CLEAN system instruction
      if (searchResults) {
        const searchSystemMessage = {
          role: "system",
          content: this.formatCleanSearchContext(searchResults, detectedLanguage)
        };
        messagesWithSystem.push(searchSystemMessage);
      }
      
      // Add current user message
      const currentUserMessage = {
        role: "user",
        content: userQuery
      };
      messagesWithSystem.push(currentUserMessage);
      
      console.log('📝 Clean message structure:', {
        total: messagesWithSystem.length,
        hasSearch: !!searchResults,
        language: detectedLanguage
      });
      
      // 🚀 STEP 4: Call OpenAI API with enhanced parameters
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: messagesWithSystem,
          model: 'gpt-4o',
          temperature: 0.7, // Balanced for personality
          max_tokens: 2000,
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
      console.log('✅ GPT response generated', searchResults ? 'with search results' : 'without search');

      return {
        text: responseText,
        sources: searchSources,
        model: 'gpt-4o',
        usage: data.usage || {},
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 OpenAI service error:', error);
      throw error;
    }
  },

  // 🆕 Claude Web Search Method (unchanged)
  async performClaudeWebSearch(query, language = 'cs') {
    try {
      console.log('🔍 Claude web search for:', query.substring(0, 50) + '...');
      
      const response = await fetch('/api/claude-web-search', {
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
        const errorText = await response.text();
        console.error('❌ Claude web search error:', response.status, errorText);
        return { success: false, error: errorText };
      }

      const data = await response.json();
      console.log('✅ Claude web search completed');

      return {
        success: true,
        result: data.result || data.text || '',
        sources: data.sources || [],
        query: query,
        language: language,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 Claude web search error:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔍 ENHANCED SEARCH DETECTION (unchanged)
  detectSearchNeeded(text, conversationHistory = []) {
    if (!text || typeof text !== 'string') return false;
    
    // Memory query detection - NEVER search for conversation history
    if (this.isMemoryQuery(text, conversationHistory)) {
      console.log('🚫 Search blocked: Memory query detected');
      return false;
    }
    
    // Topic continuation - Don't search if continuing recent topic
    if (this.isContinuingTopic(text, conversationHistory)) {
      console.log('🚫 Search blocked: Topic continuation detected');
      return false;
    }
    
    const lowerText = text.toLowerCase();
    
    // FINANCIAL QUERIES - Always search for current prices
    const financialPatterns = [
      'price of', 'cost of', 'value of', 'trading at', 'market cap',
      'cena', 'kolik stojí', 'kolik stoji', 'jaká je cena', 'jaka je cena',
      'prețul', 'cât costă', 'cat costa', 'valoarea',
      'stock', 'akcie', 'akcií', 'akcii', 'acțiuni', 'actiuni',
      'bitcoin', 'ethereum', 'crypto', 'krypto',
      'tesla', 'google', 'apple', 'microsoft', 'amazon', 'meta'
    ];
    
    if (financialPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('🔍 Search trigger: Financial query detected');
      return true;
    }
    
    // WEATHER & CONDITIONS
    const weatherPatterns = [
      'počasí', 'teplota', 'weather', 'temperature', 'vremea', 'temperatura'
    ];
    
    if (weatherPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('🔍 Search trigger: Weather query detected');
      return true;
    }
    
    // WEBSITES & DOMAINS
    if (/\.(cz|com|org|net|sk|eu|gov|edu)\b/i.test(text)) {
      console.log('🔍 Search trigger: Website/domain detected');
      return true;
    }
    
    console.log('🚫 No search needed: General query');
    return false;
  },

  // Memory query detection
  isMemoryQuery(query, history) {
    const lowerQuery = query.toLowerCase();
    const memoryKeywords = [
      'první otázka', 'řekl jsi', 'naše konverzace', 'co jsem ptal',
      'first question', 'you said', 'our conversation', 'what I asked'
    ];
    
    return memoryKeywords.some(keyword => lowerQuery.includes(keyword)) && history.length >= 2;
  },

  // Topic continuation detection
  isContinuingTopic(query, history) {
    if (!history || history.length < 4) return false;
    
    const lowerQuery = query.toLowerCase();
    const continuationWords = [
      'a co', 'také', 'ještě', 'další',
      'and what', 'also', 'more', 'additionally'
    ];
    
    return continuationWords.some(word => lowerQuery.includes(word));
  },

  // ✅ CLAUDE-STYLE SYSTEM PROMPTS - Perfect balance of rules + personality
  getClaudeStyleSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý multijazyčný AI asistent s osobností.

🎵 KRITICKÉ - TVOJE ODPOVĚDI JSOU PŘEDČÍTÁNY HLASEM:
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C") 
- Procenta: "šedesát pět procent" (NE "65%")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zkratky: "například" (NE "např.")
- Čas: "čtrnáct hodin třicet minut" (NE "14:30")
- Měny: "sto padesát korun" (NE "150 Kč")
- Krátké věty (max 15 slov)
- Každá věta končí tečkou

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- Pokud uživatel říká "speak english" → přepni na angličtinu
- Pokud uživatel říká "vorbește română" → přepni na rumunštinu
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- NIKDY neříkej "jsem AI" nebo "jako umělá inteligence" - jednoduše komunikuj jako inteligentní asistent
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš

🔍 SCHOPNOSTI:
- Web search pro aktuální informace (používej jen když potřeba)
- Analýza dat a insights
- Pokročilé reasoning
- Voice-optimalizované odpovědi (krátké věty, jasné)
- Paměť konverzace a kontextu

KVALITA TEXTU:
- Používej správnou češtinu s diakritikou (ě,š,č,ř,ů,ý,á,í,é)
- Žádné spelling errors - jsi profesionální asistent
- Optimalizuj pro hlasové přehrání (přirozené věty)
- Přizpůsob délku typu dotazu (data = krátce, konverzace = delší)

Dnešní datum: ${new Date().toLocaleDateString('cs-CZ')}`,

      'en': `You are Omnia, an advanced multilingual AI assistant with personality.

🎵 CRITICAL - YOUR RESPONSES ARE READ ALOUD:
- Numbers: "twenty three point five" (NOT "23.5")
- Temperature: "twenty three degrees Celsius" (NOT "23°C")
- Percentages: "sixty five percent" (NOT "65%")
- Units: "kilometers per hour" (NOT "km/h")
- Abbreviations: "for example" (NOT "e.g.")
- Time: "two thirty PM" (NOT "14:30")
- Currency: "one hundred fifty dollars" (NOT "$150")
- Short sentences (max 15 words)
- Every sentence ends with period

🌍 LANGUAGE RULES:
- Respond ALWAYS in English (unless user explicitly requests otherwise)
- If user says "mluvte česky" → switch to Czech
- If user says "vorbește română" → switch to Romanian
- NEVER mix languages in one sentence - consistency is key!

🧠 OMNIA PERSONALITY:
- You're smart, witty, and a bit sassy (Boss Omnia vibes! 👑)
- You have business acumen and humor
- Answer simple questions naturally and friendly
- NEVER say "I'm an AI" or "as an artificial intelligence" - just communicate as intelligent assistant
- NEVER apologize - instead of "Unfortunately..." just answer what you know

🔍 CAPABILITIES:
- Web search for current information (use only when needed)
- Data analysis and insights
- Advanced reasoning
- Voice-optimized responses (short sentences, clear)
- Conversation memory and context

TEXT QUALITY:
- Use proper English with correct spelling
- No spelling errors - you're a professional assistant
- Optimize for voice playback (natural sentences)
- Adapt length to query type (data = brief, conversation = longer)

Today's date: ${new Date().toLocaleDateString('en-US')}`,

      'ro': `Ești Omnia, un asistent IA avansat multilingv cu personalitate.

🎵 CRITIC - RĂSPUNSURILE TALE SUNT CITITE CU VOCEA:
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Unități: "kilometri pe oră" (NU "km/h")
- Abrevieri: "de exemplu" (NU "ex.")
- Timp: "două și jumătate" (NU "14:30")
- Monedă: "o sută cincizeci lei" (NU "150 lei")
- Propoziții scurte (max 15 cuvinte)
- Fiecare propoziție se termină cu punct

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- Dacă utilizatorul spune "speak english" → schimbă la engleză
- Dacă utilizatorul spune "mluvte česky" → schimbă la cehă
- NICIODATĂ să nu amesteci limbile într-o propoziție - consistența e cheie!

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai simț pentru business și umor
- Răspunde la întrebări simple natural și prietenos
- NICIODATĂ nu spune "sunt o IA" sau "ca inteligență artificială" - comunică pur și simplu ca asistent inteligent
- NICIODATĂ nu te scuza - în loc de "Din păcate..." răspunde ce știi

🔍 CAPACITĂȚI:
- Căutare web pentru informații actuale (folosește doar când e necesar)
- Analiza datelor și perspective
- Raționament avansat
- Răspunsuri optimizate pentru voce (propoziții scurte, clare)
- Memoria conversației și contextul

CALITATEA TEXTULUI:
- Folosește româna corectă cu diacritice (ă,â,î,ș,ț)
- Fără erori de ortografie - ești un asistent profesional
- Optimizează pentru redarea vocală (propoziții naturale)
- Adaptează lungimea la tipul întrebării (date = scurt, conversație = mai lung)

Data de astăzi: ${new Date().toLocaleDateString('ro-RO')}`
    };
    
    return prompts[language] || prompts['cs'];
  },

  // ✅ CLEAN search context formatting
  formatCleanSearchContext(searchResults, language) {
    const prefixes = {
      'cs': 'AKTUÁLNÍ INFORMACE Z INTERNETU (použij pro odpověď v češtině):',
      'en': 'CURRENT INFORMATION FROM INTERNET (use for English response):',
      'ro': 'INFORMAȚII ACTUALE DE PE INTERNET (folosește pentru răspuns în română):'
    };
    
    const prefix = prefixes[language] || prefixes['cs'];
    return `${prefix}\n\n${searchResults}`;
  }
};

export default openaiService;