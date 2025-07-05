// 🧠 OPENAI SERVICE - CLAUDE-INSPIRED LANGUAGE CONSISTENCY
// ✅ COMPLETELY REWRITTEN: Based on Claude's success patterns
// 🎯 HARDCODED DEFAULTS: Like Claude - strong language enforcement
// 🔧 CLEAN ARCHITECTURE: Minimal contamination points

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD - Claude-inspired approach
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT Enhanced with Claude-inspired language handling, language:', detectedLanguage);
      
      // 🎯 STEP 1: Enhanced smart search detection
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
      
      // Add SUPER STRONG system prompt (like Claude's approach)
      const systemPromptMessage = {
        role: "system",
        content: this.getClaudeInspiredSystemPrompt(detectedLanguage)
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
      
      // Add current user message with LANGUAGE REINFORCEMENT
      const currentUserMessage = {
        role: "user",
        content: this.addLanguageReinforcement(userQuery, detectedLanguage)
      };
      messagesWithSystem.push(currentUserMessage);
      
      console.log('📝 Clean message structure:', {
        total: messagesWithSystem.length,
        hasSearch: !!searchResults,
        language: detectedLanguage,
        systemPrompts: messagesWithSystem.filter(m => m.role === 'system').length
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
          temperature: 0.7, // Slightly higher for personality
          max_tokens: 2000,
          language: detectedLanguage,
          // Enhanced parameters for consistency
          frequency_penalty: 0.1,
          presence_penalty: 0.1
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
      
      // 🔍 STEP 5: Post-processing language validation (like Claude's approach)
      const finalText = this.validateResponseLanguage(responseText, detectedLanguage);
      
      console.log('✅ GPT response generated and validated', searchResults ? 'with search results' : 'without search');

      return {
        text: finalText,
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

  // 🔍 ENHANCED SEARCH DETECTION - More intelligent than before
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
      // Multi-language price patterns
      'price of', 'cost of', 'value of', 'trading at', 'market cap',
      'cena', 'kolik stojí', 'kolik stoji', 'jaká je cena', 'jaka je cena',
      'prețul', 'cât costă', 'cat costa', 'valoarea',
      
      // Stock/crypto terms
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
      'počasí', 'teplota', 'weather', 'temperature', 'vremea', 'temperatura',
      'déšť', 'rain', 'ploaie', 'sníh', 'snow', 'ninsoare'
    ];
    
    if (weatherPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('🔍 Search trigger: Weather query detected');
      return true;
    }
    
    // CURRENT EVENTS & NEWS
    const newsPatterns = [
      'co se stalo', 'co se děje', 'what happened', 'what\'s happening',
      'ce s-a întâmplat', 'zprávy', 'news', 'știri', 'latest', 'recent',
      'aktuální', 'current', 'actual'
    ];
    
    if (newsPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('🔍 Search trigger: News/current events query detected');
      return true;
    }
    
    // WEBSITES & DOMAINS
    if (/\.(cz|com|org|net|sk|eu|gov|edu)\b/i.test(text)) {
      console.log('🔍 Search trigger: Website/domain detected');
      return true;
    }
    
    // TIME-SENSITIVE KEYWORDS
    const timeKeywords = [
      'dnes', 'today', 'azi', 'teď', 'now', 'acum',
      'tento týden', 'this week', 'săptămâna aceasta',
      'tento měsíc', 'this month', 'luna aceasta'
    ];
    
    if (timeKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Time-sensitive keyword');
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
      'first question', 'you said', 'our conversation', 'what I asked',
      'prima întrebare', 'ai spus', 'conversația noastră'
    ];
    
    return memoryKeywords.some(keyword => lowerQuery.includes(keyword)) && history.length >= 2;
  },

  // Topic continuation detection
  isContinuingTopic(query, history) {
    if (!history || history.length < 4) return false;
    
    const lowerQuery = query.toLowerCase();
    const continuationWords = [
      'a co', 'také', 'ještě', 'další',
      'and what', 'also', 'more', 'additionally',
      'și ce', 'de asemenea', 'mai mult'
    ];
    
    return continuationWords.some(word => lowerQuery.includes(word));
  },

  // ✅ CLAUDE-INSPIRED SYSTEM PROMPTS - Multi-layer enforcement
  getClaudeInspiredSystemPrompt(language) {
    const prompts = {
      'cs': `KRITICKÉ INSTRUKCE PRO OMNIA GPT:

🌍 ABSOLUTNÍ JAZYKOVÉ PRAVIDLO:
- Odpovídáš VŽDY A POUZE v češtině
- NIKDY nemíchej jazyky v jedné větě
- Konzistence jazyka je absolutní priorita #1
- Pokud dostaneš data v jiných jazycích, převeď je do češtiny

🎵 HLASOVÉ OPTIMALIZACE (responses jsou čteny nahlas):
- Čísla: "dvacet tři celá pět" (NIKDY "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NIKDY "23°C")
- Procenta: "šedesát pět procent" (NIKDY "65%")
- Jednotky: "kilometrů za hodinu" (NIKDY "km/h")
- Zkratky: "například" (NIKDY "např.")
- Čas: "čtrnáct hodin třicet minut" (NIKDY "14:30")
- Měny: "sto padesát korun" (NIKDY "150 Kč")
- Krátké věty (maximálně 15 slov)
- Každá věta končí tečkou

🧠 OMNIA PERSONALITY:
- Jsi Omnia - chytrá AI s osobností a humorem
- Pro faktické dotazy (ceny, počasí) buď stručná a užitečná
- Pro konverzaci můžeš být vtipná a rozvíjet téma
- NIKDY neříkej "jako umělá inteligence" nebo "nemám pocity"
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš

KVALITA ODPOVĚDÍ:
- Správná čeština s diakritikou (ě,š,č,ř,ů,ý,á,í,é)
- Žádné spelling errors - jsi profesionální asistent
- Přizpůsob délku typu dotazu (data = krátce, konverzace = delší)

DNEŠNÍ DATUM: ${new Date().toLocaleDateString('cs-CZ')}`,

      'en': `CRITICAL INSTRUCTIONS FOR OMNIA GPT:

🌍 ABSOLUTE LANGUAGE RULE:
- Respond ALWAYS AND ONLY in English
- NEVER mix languages in one sentence
- Language consistency is absolute priority #1
- If you receive data in other languages, translate to English

🎵 VOICE OPTIMIZATIONS (responses are read aloud):
- Numbers: "twenty three point five" (NEVER "23.5")
- Temperature: "twenty three degrees Celsius" (NEVER "23°C")
- Percentages: "sixty five percent" (NEVER "65%")
- Units: "kilometers per hour" (NEVER "km/h")
- Abbreviations: "for example" (NEVER "e.g.")
- Time: "two thirty PM" (NEVER "14:30")
- Currency: "one hundred fifty dollars" (NEVER "$150")
- Short sentences (maximum 15 words)
- Every sentence ends with period

🧠 OMNIA PERSONALITY:
- You're Omnia - smart AI with personality and humor
- For factual queries (prices, weather) be brief and useful
- For conversation you can be witty and develop topics
- NEVER say "as an AI" or "I don't have feelings"
- NEVER apologize - instead of "Unfortunately..." just answer what you know

RESPONSE QUALITY:
- Perfect English with correct spelling
- No spelling errors - you're a professional assistant
- Adapt length to query type (data = brief, conversation = longer)

TODAY'S DATE: ${new Date().toLocaleDateString('en-US')}`,

      'ro': `INSTRUCȚIUNI CRITICE PENTRU OMNIA GPT:

🌍 REGULA ABSOLUTĂ DE LIMBĂ:
- Răspunde ÎNTOTDEAUNA ȘI DOAR în română
- NICIODATĂ să nu amesteci limbile într-o propoziție
- Consistența limbii este prioritatea absolută #1
- Dacă primești date în alte limbi, traduce-le în română

🎵 OPTIMIZĂRI PENTRU VOCE (răspunsurile sunt citite cu vocea):
- Numere: "douăzeci și trei virgulă cinci" (NICIODATĂ "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NICIODATĂ "23°C")
- Procente: "șaizeci și cinci la sută" (NICIODATĂ "65%")
- Unități: "kilometri pe oră" (NICIODATĂ "km/h")
- Abrevieri: "de exemplu" (NICIODATĂ "ex.")
- Timp: "două și jumătate după-amiază" (NICIODATĂ "14:30")
- Monedă: "o sută cincizeci lei" (NICIODATĂ "150 lei")
- Propoziții scurte (maximum 15 cuvinte)
- Fiecare propoziție se termină cu punct

🧠 PERSONALITATEA OMNIA:
- Ești Omnia - AI inteligent cu personalitate și umor
- Pentru întrebări factuale (prețuri, vreme) fii concisă și utilă
- Pentru conversație poți fi spirituală și să dezvolți subiecte
- NICIODATĂ nu spune "ca AI" sau "nu am sentimente"
- NICIODATĂ nu te scuza - în loc de "Din păcate..." răspunde ce știi

CALITATEA RĂSPUNSULUI:
- Româna perfectă cu diacritice (ă,â,î,ș,ț)
- Fără greșeli de ortografie - ești un asistent profesional
- Adaptează lungimea la tipul întrebării (date = scurt, conversație = mai lung)

DATA DE ASTĂZI: ${new Date().toLocaleDateString('ro-RO')}`
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
  },

  // ✅ Language reinforcement in user message
  addLanguageReinforcement(query, language) {
    const reinforcements = {
      'cs': `${query}\n\n[DŮLEŽITÉ: Odpověz výhradně v češtině]`,
      'en': `${query}\n\n[IMPORTANT: Respond exclusively in English]`,
      'ro': `${query}\n\n[IMPORTANT: Răspunde exclusiv în română]`
    };
    
    return reinforcements[language] || reinforcements['cs'];
  },

  // ✅ Post-processing language validation
  validateResponseLanguage(responseText, expectedLanguage) {
    // Simple validation - could be enhanced further
    const detectedLang = this.quickLanguageCheck(responseText);
    
    if (detectedLang !== expectedLanguage && detectedLang !== 'unknown') {
      console.warn('⚠️ Language mismatch detected in response:', {
        expected: expectedLanguage,
        detected: detectedLang,
        preview: responseText.substring(0, 100)
      });
    }
    
    return responseText; // For now, just log - could implement auto-correction
  },

  // Quick language detection for response validation
  quickLanguageCheck(text) {
    if (!text) return 'unknown';
    
    const lowerText = text.toLowerCase();
    
    // Romanian indicators
    if (/\b(astăzi|prețul|acțiunilor|dolari|este)\b/.test(lowerText)) return 'ro';
    
    // English indicators
    if (/\b(today|price|stock|dollars|is|the)\b/.test(lowerText)) return 'en';
    
    // Czech indicators
    if (/\b(dnes|cena|akcií|korun|je|aktuální)\b/.test(lowerText)) return 'cs';
    
    return 'unknown';
  }
};

export default openaiService;