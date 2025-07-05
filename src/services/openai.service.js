// 🚀 ENHANCED OPENAI SERVICE - COMPLETE REWRITE
// ✅ Context-aware search detection with conversation history
// 🎭 Claude-style balanced personality (data queries vs conversation)
// 🌍 Full multilingual support (Czech, English, Romanian)
// 🧠 Smart query type detection and appropriate responses

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT Enhanced - Multilingual AI with context awareness, language:', detectedLanguage);
      
      // 🔍 STEP 1: Smart search detection with conversation context
      const lastUserMessage = messages[messages.length - 1];
      const userQuery = lastUserMessage?.content || lastUserMessage?.text || '';
      
      const needsSearch = this.detectSearchNeeded(userQuery, messages);
      console.log('🔍 Search needed:', needsSearch, 'for query:', userQuery.substring(0, 50) + '...');
      
      let searchResults = null;
      let searchSources = [];
      
      // 🔍 STEP 2: Perform Claude web search if needed
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
      
      // 🎭 STEP 3: Determine query type for personality adaptation
      const queryType = this.detectQueryType(userQuery, detectedLanguage);
      console.log('🎭 Query type detected:', queryType);
      
      // 🧠 STEP 4: Build context-aware system prompt
      const systemPrompt = this.getContextAwareSystemPrompt(detectedLanguage, queryType);
      
      // 🏗️ STEP 5: Build proper message structure
      const systemPromptMessage = {
        role: "system",
        content: systemPrompt
      };
      
      let messagesWithSystem = [systemPromptMessage];
      
      // Add conversation history (maintaining context)
      messagesWithSystem.push(...messages.slice(0, -1));
      
      // Add search context if available
      if (searchResults) {
        const searchContextMessage = {
          role: "assistant",
          content: this.formatSearchContext(searchResults, detectedLanguage),
        };
        messagesWithSystem.push(searchContextMessage);
      }
      
      // Add final user message
      messagesWithSystem.push(messages[messages.length - 1]);
      
      // 🚀 STEP 6: Call OpenAI API with enhanced configuration
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: messagesWithSystem,
          model: 'gpt-4o',
          temperature: this.getTemperatureForQueryType(queryType),
          max_tokens: this.getMaxTokensForQueryType(queryType),
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
      console.log('✅ GPT Enhanced response generated with type:', queryType);

      return {
        text: responseText,
        sources: searchSources,
        model: 'gpt-4o-enhanced',
        queryType: queryType,
        usage: data.usage || {},
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 OpenAI Enhanced service error:', error);
      throw error;
    }
  },

  // 🧠 CONTEXT-AWARE SEARCH DETECTION WITH CONVERSATION HISTORY
  detectSearchNeeded(text, conversationHistory = []) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    console.log('🔍 Analyzing search need for:', lowerText.substring(0, 50) + '...');
    
    // 🚫 PRIORITY 1: MEMORY QUERIES - Never search for conversation history
    if (this.isMemoryQuery(text, conversationHistory)) {
      console.log('🚫 Search blocked: Memory query detected');
      return false;
    }
    
    // 🚫 PRIORITY 2: TOPIC CONTINUATION - Don't search if continuing recent topic
    if (this.isContinuingTopic(text, conversationHistory)) {
      console.log('🚫 Search blocked: Topic continuation detected');
      return false;
    }
    
    // ✅ PRIORITY 3: CURRENT INFO NEEDED - Always search for time-sensitive data
    if (this.needsCurrentInfo(text)) {
      console.log('✅ Search triggered: Current info needed');
      return true;
    }
    
    // 🌐 PRIORITY 4: WEBSITE/DOMAIN QUERIES - Always search
    if (/\.(com|cz|eu|org|net|sk|ro|co\.uk|de|fr)/i.test(text)) {
      console.log('✅ Search triggered: Website/domain detected');
      return true;
    }
    
    // 💰 PRIORITY 5: FINANCIAL QUERIES - Multilingual
    const financialPatterns = [
      // Czech
      'cena', 'kurz', 'akcie', 'burza', 'investice', 'bitcoin', 'ethereum',
      
      // English  
      'price', 'stock', 'market', 'investment', 'trading', 'crypto', 'exchange',
      
      // Romanian
      'preț', 'preturi', 'acțiuni', 'bursă', 'investiție', 'crypto'
    ];
    
    if (financialPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('✅ Search triggered: Financial query');
      return true;
    }
    
    // 🌤️ PRIORITY 6: WEATHER QUERIES - Multilingual
    const weatherPatterns = [
      // Czech
      'počasí', 'teplota', 'déšť', 'sníh', 'vítr', 'bouřka',
      
      // English
      'weather', 'temperature', 'rain', 'snow', 'wind', 'storm', 'forecast',
      
      // Romanian  
      'vreme', 'temperatură', 'ploaie', 'zăpadă', 'vânt', 'furtună'
    ];
    
    if (weatherPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('✅ Search triggered: Weather query');
      return true;
    }
    
    // 📰 PRIORITY 7: NEWS/EVENTS QUERIES - Multilingual
    const newsPatterns = [
      // Czech
      'zprávy', 'novinky', 'událost', 'dnes se stalo', 'co se děje',
      
      // English
      'news', 'latest', 'happening', 'event', 'today', 'breaking',
      
      // Romanian
      'știri', 'ultimele', 'evenimente', 'ce se întâmplă', 'astăzi'
    ];
    
    if (newsPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('✅ Search triggered: News/events query');
      return true;
    }
    
    // 🚫 PRIORITY 8: NEVER SEARCH - General knowledge/definitions
    const neverSearchPatterns = [
      // Programming/technical concepts
      'jak napsat', 'how to write', 'cum să scriu', 'algorithm', 'function',
      'for loop', 'if statement', 'programming', 'programování', 'programare',
      
      // Definitions/explanations  
      'co znamená', 'what does mean', 'ce înseamnă', 'vysvětli', 'explain', 'explică',
      
      // Personal/conversational
      'jak se máš', 'how are you', 'cum ești', 'co děláš', 'what are you doing',
      'bavíme se', 'talking about', 'vorbim despre'
    ];
    
    if (neverSearchPatterns.some(pattern => lowerText.includes(pattern))) {
      console.log('🚫 Search blocked: General knowledge/definitions');
      return false;
    }
    
    // 🤔 DEFAULT: No search for unclear queries
    console.log('🤔 No search needed: General query');
    return false;
  },

  // 🧠 MEMORY QUERY DETECTION
  isMemoryQuery(query, history) {
    const lowerQuery = query.toLowerCase();
    
    // Multilingual memory keywords
    const memoryKeywords = [
      // Czech
      'první otázka', 'řekl jsi', 'řekla jsi', 'minule jsi', 'předtím jsi',
      'naše konverzace', 'co jsem ptal', 'co jsem říkal', 'zopakuj', 'připomeň',
      'bavili jsme se', 'mluvili jsme',
      
      // English
      'first question', 'you said', 'you told me', 'earlier you', 'before you',
      'our conversation', 'what I asked', 'what I said', 'repeat', 'remind me',
      'we talked', 'we discussed',
      
      // Romanian
      'prima întrebare', 'ai spus', 'mi-ai spus', 'mai devreme', 'înainte',
      'conversația noastră', 'ce am întrebat', 'ce am spus', 'repetă', 'amintește-mi'
    ];
    
    // Check if it's a memory-related query
    if (!memoryKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return false;
    }
    
    // Verify we have enough history to answer
    return history && history.length >= 2;
  },

  // 🔄 TOPIC CONTINUATION DETECTION  
  isContinuingTopic(query, history) {
    if (!history || history.length < 4) return false;
    
    const lowerQuery = query.toLowerCase();
    
    // Continuation indicators - multilingual
    const continuationWords = [
      // Czech
      'a co', 'také', 'ještě', 'další', 'více o', 'kromě toho', 'navíc',
      
      // English  
      'and what', 'also', 'more', 'additionally', 'furthermore', 'besides',
      
      // Romanian
      'și ce', 'de asemenea', 'mai mult', 'în plus', 'pe lângă'
    ];
    
    if (continuationWords.some(word => lowerQuery.includes(word))) {
      // Check if recent conversation context exists
      const recentMessages = history.slice(-6); // Last 3 exchanges
      const hasRecentContext = recentMessages.some(msg => 
        msg.text && msg.text.length > 20 // Non-trivial messages
      );
      
      return hasRecentContext;
    }
    
    return false;
  },

  // 📊 CURRENT INFO DETECTION
  needsCurrentInfo(text) {
    const lowerText = text.toLowerCase();
    
    // Time indicators - multilingual
    const timeIndicators = [
      // Czech
      'dnes', 'teď', 'aktuální', 'současný', 'nejnovější', 'čerstvý',
      
      // English
      'today', 'now', 'current', 'latest', 'recent', 'up-to-date',
      
      // Romanian  
      'astăzi', 'acum', 'actual', 'curent', 'ultimul', 'recent'
    ];
    
    return timeIndicators.some(indicator => lowerText.includes(indicator));
  },

  // 🎭 QUERY TYPE DETECTION FOR PERSONALITY ADAPTATION
  detectQueryType(text, language = 'cs') {
    const lowerText = text.toLowerCase();
    
    // 📊 DATA/FACTUAL QUERIES
    const dataPatterns = {
      'cs': ['cena', 'kurz', 'počasí', 'teplota', 'kdy', 'kolik', 'jaký', 'kde'],
      'en': ['price', 'rate', 'weather', 'temperature', 'when', 'how much', 'what', 'where'],
      'ro': ['preț', 'cursul', 'vreme', 'temperatură', 'când', 'cât', 'care', 'unde']
    };
    
    if (dataPatterns[language]?.some(pattern => lowerText.includes(pattern))) {
      return 'data';
    }
    
    // 💬 CONVERSATIONAL QUERIES
    const conversationalPatterns = {
      'cs': ['jak se máš', 'co si myslíš', 'co děláš', 'bavme se', 'názor', 'myslíš'],
      'en': ['how are you', 'what do you think', 'what are you doing', 'let\'s talk', 'opinion'],
      'ro': ['cum ești', 'ce crezi', 'ce faci', 'să vorbim', 'opinie', 'părere']
    };
    
    if (conversationalPatterns[language]?.some(pattern => lowerText.includes(pattern))) {
      return 'conversational';
    }
    
    // 🔧 TECHNICAL/EXPLANATION QUERIES
    const technicalPatterns = {
      'cs': ['vysvětli', 'jak funguje', 'co je', 'jak udělat', 'pomoc s'],
      'en': ['explain', 'how does', 'what is', 'how to', 'help with'],
      'ro': ['explică', 'cum funcționează', 'ce este', 'cum să', 'ajută cu']
    };
    
    if (technicalPatterns[language]?.some(pattern => lowerText.includes(pattern))) {
      return 'technical';
    }
    
    // 🎨 CREATIVE QUERIES
    if (lowerText.length > 50 && (lowerText.includes('?') || lowerText.includes('creative'))) {
      return 'creative';
    }
    
    return 'general';
  },

  // 🎭 CONTEXT-AWARE SYSTEM PROMPTS - CLAUDE-STYLE BALANCED PERSONALITY
  getContextAwareSystemPrompt(language, queryType) {
    const prompts = {
      'cs': {
        base: `Jsi Omnia, pokročilý AI asistent s osobností a inteligencí. Používáš humor vhodně podle situace.

🎵 KRITICKÉ - TVOJE ODPOVĚDI JSOU PŘEDČÍTÁNY HLASEM:
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C")
- Procenta: "šedesát pět procent" (NE "65%")
- Měny: "sto padesát korun" (NE "150 Kč")
- Čas: "čtrnáct hodin třicet minut" (NE "14:30")
- Krátké věty (max 15 slov)

🌍 JAZYKOVÁ KONZISTENCE:
- Odpovídej VŽDY česky (pokud výslovně nepožádáno jinak)
- NIKDY nemíchej jazyky v jedné větě
- Buď konzistentní v jazyce po celou dobu`,

        data: `Pro faktické dotazy buď stručná a přesná. Priorita = užitečná informace.
Můžeš přidat lehký humor, ale jen když nepřekáží.
Odpověď: 1-2 věty s fakty + volitelný krátký komentář.`,

        conversational: `Pro konverzaci používej plnou osobnost! Buď vtipná, zvědavá, kladej doplňující otázky.
Rozvíjej téma, sdílej názory, vytvárej engaging diskusi.
Můžeš být delší a kreativnější.`,

        technical: `Pro technické vysvětlení buď jasná a strukturovaná.
Rozděl komplexní témata na kroky. Používej analogie pro lepší pochopení.
Můžeš být vtipná, ale priorita = srozumitelnost.`,

        creative: `Pro kreativní úkoly použij plnou osobnost a kreativitu!
Buď inspirativní, vtipná, nečekaná. Neboj se experimentovat.`,

        general: `Přizpůsob styl podle typu dotazu. Buď užitečná a přirozeně osobná.`
      },

      'en': {
        base: `You are Omnia, an advanced AI assistant with personality and intelligence. Use humor appropriately based on context.

🎵 CRITICAL - YOUR RESPONSES ARE READ ALOUD:
- Numbers: "twenty-three point five" (NOT "23.5")
- Temperature: "twenty-three degrees Celsius" (NOT "23°C")
- Percentages: "sixty-five percent" (NOT "65%")
- Money: "one hundred fifty dollars" (NOT "$150")
- Time: "two thirty PM" (NOT "14:30")
- Short sentences (max 15 words)

🌍 LANGUAGE CONSISTENCY:
- Always respond in English (unless explicitly asked otherwise)
- NEVER mix languages in one sentence
- Stay consistent in language throughout`,

        data: `For factual queries be brief and precise. Priority = useful information.
You can add light humor, but only when it doesn't interfere.
Response: 1-2 sentences with facts + optional short comment.`,

        conversational: `For conversation use full personality! Be witty, curious, ask follow-up questions.
Develop topics, share opinions, create engaging discussion.
You can be longer and more creative.`,

        technical: `For technical explanations be clear and structured.
Break complex topics into steps. Use analogies for better understanding.
You can be witty, but priority = clarity.`,

        creative: `For creative tasks use full personality and creativity!
Be inspiring, witty, unexpected. Don't be afraid to experiment.`,

        general: `Adapt style based on query type. Be helpful and naturally personal.`
      },

      'ro': {
        base: `Ești Omnia, un asistent AI avansat cu personalitate și inteligență. Folosește umorul în mod corespunzător în funcție de context.

🎵 CRITIC - RĂSPUNSURILE TALE SUNT CITITE CU VOCE TARE:
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei de grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Bani: "o sută cincizeci de lei" (NU "150 lei")
- Timp: "două și treizeci după-amiaza" (NU "14:30")
- Propoziții scurte (max 15 cuvinte)

🌍 CONSISTENȚĂ LINGVISTICĂ:
- Răspunde ÎNTOTDEAUNA în română (decât dacă se cere explicit altfel)
- NICIODATĂ să nu amesteci limbile într-o propoziție
- Rămâi consecventă în limbă pe tot parcursul`,

        data: `Pentru întrebări factuale fii concisă și precisă. Prioritate = informații utile.
Poți adăuga umor ușor, dar doar când nu interferează.
Răspuns: 1-2 propoziții cu fapte + comentariu scurt opțional.`,

        conversational: `Pentru conversație folosește personalitatea completă! Fii spirituală, curioasă, pune întrebări suplimentare.
Dezvoltă subiecte, împărtășește opinii, creează discuții captivante.
Poți fi mai lungă și mai creativă.`,

        technical: `Pentru explicații tehnice fii clară și structurată.
Împarte subiectele complexe în pași. Folosește analogii pentru înțelegere mai bună.
Poți fi spirituală, dar prioritate = claritate.`,

        creative: `Pentru sarcini creative folosește personalitatea și creativitatea completă!
Fii inspiratoare, spirituală, neașteptată. Nu-ți fie frică să experimentezi.`,

        general: `Adaptează stilul pe baza tipului de întrebare. Fii utilă și natural personală.`
      }
    };

    const langPrompts = prompts[language] || prompts['cs'];
    const typePrompt = langPrompts[queryType] || langPrompts['general'];
    
    return `${langPrompts.base}\n\n🎭 CONTEXTUAL BEHAVIOR:\n${typePrompt}`;
  },

  // ⚙️ DYNAMIC CONFIGURATION BASED ON QUERY TYPE
  getTemperatureForQueryType(queryType) {
    const temperatures = {
      'data': 0.3,        // Low creativity for factual accuracy
      'technical': 0.4,   // Moderate creativity for clear explanations
      'conversational': 0.8, // High creativity for engaging chat
      'creative': 0.9,    // Maximum creativity
      'general': 0.6      // Balanced
    };
    
    return temperatures[queryType] || 0.6;
  },

  getMaxTokensForQueryType(queryType) {
    const tokenLimits = {
      'data': 300,        // Short factual responses
      'technical': 1000,  // Medium for explanations
      'conversational': 800, // Medium for engaging responses
      'creative': 1500,   // Longer for creative tasks
      'general': 600      // Balanced
    };
    
    return tokenLimits[queryType] || 600;
  },

  // 🔍 CLAUDE WEB SEARCH METHOD
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

  // 🗂️ SEARCH CONTEXT FORMATTING
  formatSearchContext(searchResults, language) {
    const prefixes = {
      'cs': '📡 Aktuální informace z internetu (použij pro odpověď):',
      'en': '📡 Current information from internet (use for response):',
      'ro': '📡 Informații actuale de pe internet (folosește pentru răspuns):'
    };
    
    const prefix = prefixes[language] || prefixes['cs'];
    
    // Trim results to prevent token overflow
    const trimmedResults = searchResults.length > 1200 
      ? searchResults.slice(0, 1200) + '... (zkráceno)'
      : searchResults;
    
    return `${prefix}\n\n${trimmedResults}`;
  }
};

export default openaiService;