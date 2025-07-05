// 🧠 OPENAI SERVICE - GPT ENHANCED WITH CLAUDE WEB SEARCH
// ✅ MINIMAL FIXES: Context-aware search + memory detection + balanced personality
// 🌍 Supports Czech, English, Romanian search patterns
// 🎯 Same intelligence level as Claude for search decisions

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT Enhanced with Claude web search, language:', detectedLanguage);
      
      // 🔍 STEP 1: Check if we need search with SMART DETECTION + CONTEXT
      const lastUserMessage = messages[messages.length - 1];
      const userQuery = lastUserMessage?.content || lastUserMessage?.text || '';
      
      // ✅ FIX #1: Add conversation context to search detection
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
      
      // 🧠 STEP 3: Build proper message structure
      const systemPromptMessage = {
        role: "system",
        content: this.getSystemPrompt(detectedLanguage)
      };
      
      const userMessage = messages[messages.length - 1];
      let searchContextMessage = null;
      if (searchResults) {
        searchContextMessage = {
          role: "user",
          content: this.formatSearchContext(searchResults, detectedLanguage),
        };
      }
      
      // Build messagesWithSystem according to ChatGPT structure
      let messagesWithSystem = [];
      messagesWithSystem.unshift(systemPromptMessage);
      messagesWithSystem.push({
        role: "assistant",
        content: "Zde jsou doplňující informace z externího hledání – použij je k odpovědi na následující dotaz.",
      });
      if (searchContextMessage) {
        messagesWithSystem.push({
          role: "assistant",
          content: `Externí data: ${searchContextMessage.content}`,
        });
      }
      messagesWithSystem.push(userMessage);
      
      // 🚀 STEP 4: Call OpenAI API
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: messagesWithSystem,
          model: 'gpt-4o',
          temperature: 0.65,
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
        sources: searchSources, // ✅ For sources UI
        model: 'gpt-4o',
        usage: data.usage || {},
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 OpenAI service error:', error);
      throw error;
    }
  },

  // 🆕 NEW: Claude Web Search Method
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

  // 🔍 SMART SEARCH DETECTION - ENHANCED WITH CONTEXT AWARENESS
  detectSearchNeeded(text, conversationHistory = []) {
    if (!text || typeof text !== 'string') return false;
    
    // ✅ FIX #2: MEMORY QUERY DETECTION - Never search for conversation history
    if (this.isMemoryQuery(text, conversationHistory)) {
      console.log('🚫 Search blocked: Memory query detected');
      return false;
    }
    
    // ✅ FIX #2: TOPIC CONTINUATION - Don't search if continuing recent topic
    if (this.isContinuingTopic(text, conversationHistory)) {
      console.log('🚫 Search blocked: Topic continuation detected');
      return false;
    }
    
    const lowerText = text.toLowerCase();
    
    // 🌐 WEBSITES & DOMAINS - ALWAYS SEARCH
    if (/\.(cz|com|org|net|sk|eu|gov|edu|mil|co\.uk|de|fr|it|es|pl|ru|au|ca|jp|kr|in|br|mx|ro|hu|at|ch|be|nl|se|no|dk|fi|gr|pt|bg|hr|si|lt|lv|ee|cy|mt|lu)\b/i.test(text)) {
      console.log('🔍 Search trigger: Website/domain detected');
      return true;
    }
    
    // 📱 APPS & PLATFORMS - CURRENT INFO NEEDED
    const platforms = [
      'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin',
      'netflix', 'spotify', 'amazon', 'ebay', 'aliexpress', 'booking',
      'uber', 'bolt', 'foodpanda', 'wolt', 'airbnb', 'gmail', 'outlook',
      'whatsapp', 'telegram', 'discord', 'skype', 'zoom', 'teams'
    ];
    if (platforms.some(platform => lowerText.includes(platform))) {
      console.log('🔍 Search trigger: Platform/app mentioned');
      return true;
    }
    
    // ⏰ TIME-SENSITIVE KEYWORDS - MULTIJAZYČNÉ
    const timeKeywords = [
      // Czech
      'aktuální', 'současn', 'nejnovější', 'poslední', 'čerstvé', 'dnes', 'teď', 'nyní',
      'když', 'kdy', 'kolik stojí', 'kolik stála', 'kolik bude', 'jak dlouho',
      'tento týden', 'tento měsíc', 'tento rok', 'letos', 'loni',
      
      // English  
      'current', 'latest', 'recent', 'today', 'now', 'this week', 'this month', 'this year',
      'how much does', 'how much costs', 'when does', 'when will', 'when did',
      'right now', 'at the moment', 'currently', 'recently', 'lately',
      
      // Romanian
      'actual', 'curent', 'recent', 'azi', 'acum', 'când', 'cât costă', 'cât a costat',
      'săptămâna aceasta', 'luna aceasta', 'anul acesta', 'în prezent', 'în acest moment'
    ];
    
    if (timeKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Time-sensitive keyword');
      return true;
    }
    
    // 💰 FINANCIAL & MARKET DATA - MULTIJAZYČNÉ
    const financialKeywords = [
      // Stocks & companies (univerzální)
      'akcie', 'akciích', 'burza', 'nasdaq', 'google', 'apple', 'microsoft', 'tesla', 'amazon',
      'bitcoin', 'ethereum', 'crypto', 'krypto', 'dogecoin', 'binance', 'coinbase',
      'stocks', 'shares', 'stock market', 'trading', 'investment',
      'acțiuni', 'bursă', 'investiție',
      
      // Currencies
      'cena', 'kurz', 'směnný kurz', 'dolar', 'euro', 'koruna', 'libra', 'frank',
      'price', 'exchange rate', 'dollar', 'pound', 'yen', 'currency',
      'preț', 'curs valutar', 'monedă',
      
      // Czech companies
      'čez', 'kb', 'erste', 'avast', 'jetbrains', 'socialbakers', 'bohemia interactive',
      
      // Price queries
      'kolik stojí', 'price of', 'cost of', 'value of', 'trading at', 'market cap',
      'cât costă', 'prețul', 'valoarea'
    ];
    
    if (financialKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Financial/market data');
      return true;
    }
    
    // 🌡️ WEATHER & CONDITIONS - MULTIJAZYČNÉ
    const weatherKeywords = [
      // Czech
      'počasí', 'teplota', 'déšť', 'sníh', 'bouře', 'vítr', 'slunečno', 'oblačno',
      'předpověď počasí', 'meteorologie',
      
      // English
      'weather', 'temperature', 'rain', 'snow', 'storm', 'sunny', 'cloudy',
      'weather forecast', 'meteorology', 'climate',
      
      // Romanian
      'vremea', 'temperatura', 'ploaie', 'ninsoare', 'furtună', 'vânt', 'însorit',
      'prognoza meteo', 'meteorologie'
    ];
    
    if (weatherKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Weather query');
      return true;
    }
    
    // 📺 ENTERTAINMENT & SPORTS - MULTIJAZYČNÉ
    const entertainmentKeywords = [
      // Sports - Czech
      'kdy hraje', 'kdy začíná', 'fotbal', 'hokej', 'basketbal', 'tenis',
      'sparta', 'slavia', 'baník', 'plzeň', 'liga', 'česká liga',
      
      // Sports - English  
      'when does play', 'when starts', 'football', 'soccer', 'basketball', 'tennis',
      'premier league', 'champions league', 'uefa', 'fifa', 'nhl', 'nba',
      'barcelona', 'real madrid', 'chelsea', 'manchester', 'liverpool',
      
      // Sports - Romanian
      'când joacă', 'când începe', 'fotbal', 'baschet', 'tenis',
      
      // Movies & shows - univerzální
      'kdy vychází', 'when comes out', 'premiéra', 'netflix', 'hbo', 'disney',
      'film', 'movie', 'seriál', 'series', 'season', 'episode',
      'când apare', 'premieră',
      
      // Events
      'koncert', 'festival', 'výstava', 'conference', 'event', 'concert',
      'concierto', 'festivalul'
    ];
    
    if (entertainmentKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Entertainment/sports');
      return true;
    }
    
    // 🏢 BUSINESS & COMPANY INFO - MULTIJAZYČNÉ
    const businessKeywords = [
      // English/Universal
      'company', 'startup', 'unicorn', 'ipo', 'acquisition', 'merger',
      'ceo', 'founder', 'management', 'board of directors',
      'revenue', 'profit', 'earnings', 'quarterly results',
      
      // Czech
      'firma', 'podnik', 'společnost', 'zakladatel', 'ředitel', 'vedení',
      'tržby', 'zisk', 'výsledky', 'hospodaření',
      
      // Romanian
      'companie', 'firmă', 'întreprindere', 'fondator', 'director', 'management',
      'venituri', 'profit', 'rezultate'
    ];
    
    if (businessKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Business info');
      return true;
    }
    
    // 🗞️ NEWS & CURRENT EVENTS - MULTIJAZYČNÉ
    const newsKeywords = [
      // Czech
      'co se stalo', 'co se děje', 'zprávy', 'novinky', 'události',
      'incident', 'nehoda', 'politik', 'politika', 'volby', 'minister', 'premiér', 'prezident',
      
      // English
      'what happened', 'what\'s happening', 'breaking news', 'news', 'latest news',
      'incident', 'accident', 'politics', 'election', 'minister', 'president', 'prime minister',
      
      // Romanian
      'ce s-a întâmplat', 'ce se întâmplă', 'știri', 'evenimente',
      'incident', 'accident', 'politică', 'alegeri', 'ministru', 'președinte'
    ];
    
    if (newsKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: News/current events');
      return true;
    }
    
    // 🎯 SPECIFIC LOCATION QUERIES - MULTIJAZYČNÉ
    const locationKeywords = [
      // Czech locations
      'v praze', 'v brně', 'v ostravě', 'v plzni', 'v olomouci', 'v liberci',
      'v bratislavě', 'v košicích',
      
      // English locations  
      'in prague', 'in brno', 'in bratislava', 'in vienna', 'in budapest',
      'in london', 'in paris', 'in berlin', 'in rome', 'in madrid',
      
      // Romanian locations
      'în bucurești', 'în cluj', 'în timișoara', 'în iași', 'în constanța',
      
      // Transport & local services
      'metro', 'mhd', 'doprava', 'transport', 'restaurant', 'restaurace',
      'hotel', 'ubytování', 'accommodation', 'cazare'
    ];
    
    if (locationKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Location-specific query');
      return true;
    }
    
    // 📱 TECH & SOFTWARE - MULTIJAZYČNÉ
    const techKeywords = [
      // Operating systems & browsers
      'ios', 'android', 'windows', 'macos', 'linux', 'ubuntu',
      'chrome', 'firefox', 'safari', 'edge', 'opera',
      
      // Software terms
      'update', 'version', 'download', 'install', 'upgrade',
      'bug', 'fix', 'patch', 'release', 'beta',
      'aktualizace', 'verze', 'stažení', 'instalace',
      'chyba', 'oprava', 'vydání',
      'actualizare', 'versiune', 'descărcare', 'instalare'
    ];
    
    if (techKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Tech/software query');
      return true;
    }
    
    // 🚗 TRANSPORTATION - MULTIJAZYČNÉ
    const transportKeywords = [
      // Czech
      'vlak', 'autobus', 'letadlo', 'jízdní řád', 'zpoždění',
      'cd', 'české dráhy', 'regiojet', 'flixbus', 'ryanair', 'czech airlines',
      
      // English
      'train', 'bus', 'plane', 'flight', 'schedule', 'timetable', 'delay',
      'airline', 'airport', 'railway', 'subway',
      
      // Romanian
      'tren', 'autobuz', 'avion', 'zbor', 'orar', 'întârziere',
      'tarom', 'blue air', 'cfr'
    ];
    
    if (transportKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Transportation');
      return true;
    }
    
    // 🔍 EXPLICIT SEARCH REQUESTS - MULTIJAZYČNÉ
    const explicitSearch = [
      // Czech
      'vyhledej', 'najdi', 'hledej', 'co je', 'poví mi o', 'informace o',
      'zkontroluj', 'ověř', 'zjisti',
      
      // English
      'search for', 'look up', 'find', 'google', 'what is', 'tell me about',
      'check', 'verify', 'find out',
      
      // Romanian
      'caută', 'găsește', 'ce este', 'spune-mi despre', 'informații despre',
      'verifică', 'află'
    ];
    
    if (explicitSearch.some(keyword => lowerText.includes(keyword))) {
      console.log('🔍 Search trigger: Explicit search request');
      return true;
    }
    
    // ❌ NEVER SEARCH - GENERAL KNOWLEDGE - MULTIJAZYČNÉ
    const neverSearch = [
      // Programming concepts
      'jak napsat', 'how to write', 'cum să scriu', 'algorithm', 'algoritmus',
      'for loop', 'if statement', 'function', 'variable', 'programming',
      'programování', 'programare',
      
      // General definitions
      'co znamená', 'what does mean', 'ce înseamnă', 'definition', 'definice',
      'definiție',
      
      // Historical facts (unless recent)
      'kdy vznikl', 'when was founded', 'când a fost fondat', 'history of', 'historie',
      'istorie',
      
      // Basic science
      'jak funguje', 'how does work', 'cum funcționează', 'fyzika', 'physics',
      'fizică', 'chemie', 'chemistry', 'chimie',
      
      // Personal questions
      'jak se máš', 'how are you', 'cum ești', 'co děláš', 'what do you do',
      'ce faci'
    ];
    
    if (neverSearch.some(keyword => lowerText.includes(keyword))) {
      console.log('🚫 Search blocked: General knowledge/definitions');
      return false;
    }
    
    // 🤔 UNKNOWN ENTITIES - CHECK FOR PROPER NOUNS
    const properNouns = text.match(/\b[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+)*\b/g);
    if (properNouns && properNouns.length > 0) {
      // Filter out common words that are often capitalized
      const commonWords = [
        'Czech', 'English', 'German', 'French', 'American', 'European', 'Romanian',
        'AI', 'API', 'GPS', 'USB', 'WiFi', 'HTML', 'CSS', 'JavaScript',
        'Praha', 'Brno', 'Ostrava', 'Plzeň', 'České', 'Slovenská'
      ];
      const realProperNouns = properNouns.filter(noun => !commonWords.includes(noun));
      
      if (realProperNouns.length > 0) {
        console.log('🔍 Search trigger: Proper nouns detected (potential entities):', realProperNouns);
        return true;
      }
    }
    
    console.log('🚫 No search needed: General query');
    return false;
  },

  // ✅ FIX #2: MEMORY QUERY DETECTION
  isMemoryQuery(query, history) {
    const lowerQuery = query.toLowerCase();
    
    // Multilingual memory keywords
    const memoryKeywords = [
      // Czech
      'první otázka', 'řekl jsi', 'řekla jsi', 'minule jsi', 'předtím jsi',
      'naše konverzace', 'co jsem ptal', 'co jsem říkal', 'zopakuj', 'připomeň',
      'bavili jsme se', 'mluvili jsme', 'o čem jsme',
      
      // English
      'first question', 'you said', 'you told me', 'earlier you', 'before you',
      'our conversation', 'what I asked', 'what I said', 'repeat', 'remind me',
      'we talked', 'we discussed', 'what did we',
      
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

  // ✅ FIX #2: TOPIC CONTINUATION DETECTION  
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

  // ✅ FIX #3: BALANCED PERSONALITY - Enhanced System Prompts
  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý multijazyčný AI asistent s osobností! 🤖

🎵 KRITICKÉ - TVOJE ODPOVĚDI JSOU PŘEDČÍTÁNY HLASEM:
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C") 
- Procenta: "šedesát pět procent" (NE "65%")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zkratky: "například" (NE "např.")
- Krátké věty (max 15 slov každá)
- Každá věta končí tečkou

🧠 OMNIA PERSONALITY:
- Jsi chytrá AI s osobností - odpovídej přirozeně a přátelsky
- Pro faktické dotazy (ceny, počasí, data) buď stručná a užitečná
- Pro konverzaci můžeš být vtipná a rozvíjet téma
- NIKDY neříkej "jako umělá inteligence" nebo "nemám pocity"
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

KVALITA ODPOVĚDÍ:
- Přizpůsob délku typu dotazu (data = krátce, konverzace = delší)
- Krátké věty optimalizované pro TTS
- Žádné spelling errors - jsi profesionální asistent
- Správná čeština s diakritikou (ě,š,č,ř,ů,ý,á,í,é)`,

      'en': `You are Omnia, an advanced multilingual AI assistant with personality! 🤖

🎵 CRITICAL - YOUR RESPONSES ARE READ ALOUD:
- Numbers: "twenty three point five" (NOT "23.5")
- Temperature: "twenty three degrees Celsius" (NOT "23°C")
- Percentages: "sixty five percent" (NOT "65%") 
- Units: "kilometers per hour" (NOT "km/h")
- Abbreviations: "for example" (NOT "e.g.")
- Short sentences (max 15 words each)
- Every sentence ends with period

🧠 OMNIA PERSONALITY:
- You're a smart AI with personality - respond naturally and friendly
- For factual queries (prices, weather, data) be brief and useful
- For conversation you can be witty and develop topics
- NEVER say "as an AI" or "I don't have feelings"
- NEVER apologize - instead of "Unfortunately..." just answer what you know

🌍 LANGUAGE RULES:
- ALWAYS respond in English (unless user explicitly requests otherwise)
- NEVER mix languages in one sentence - consistency is key!

RESPONSE QUALITY:
- Adapt length to query type (data = brief, conversation = longer)
- Short sentences optimized for TTS
- No spelling errors - you're a professional assistant`,

      'ro': `Ești Omnia, un asistent AI multilingual avansat cu personalitate! 🤖

🎵 CRITIC - RĂSPUNSURILE TALE SUNT CITITE CU VOCE TARE:
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Unități: "kilometri pe oră" (NU "km/h") 
- Abrevieri: "de exemplu" (NU "ex.")
- Propoziții scurte (max 15 cuvinte fiecare)
- Fiecare propoziție se termină cu punct

🧠 PERSONALITATEA OMNIA:
- Ești un AI inteligent cu personalitate - răspunde natural și prietenos
- Pentru întrebări factuale (prețuri, vreme, date) fii concisă și utilă
- Pentru conversație poți fi spirituală și să dezvolți subiecte
- NICIODATĂ nu spune "ca AI" sau "nu am sentimente"
- NICIODATĂ nu te scuza - în loc de "Din păcate..." răspunde ce știi

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- NICIODATĂ nu amesteca limbile într-o propoziție - consistența este cheie!

CALITATEA RĂSPUNSULUI:
- Adaptează lungimea la tipul întrebării (date = scurt, conversație = mai lung)
- Propoziții scurte optimizate pentru TTS
- Fără greșeli de ortografie - ești un asistent profesional`
    };
    
    return prompts[language] || prompts['cs'];
  },

  // 📝 Format Search Context (UNCHANGED)
  formatSearchContext(searchResults, language) {
    const prefixes = {
      'cs': 'Aktuální informace z internetu:',
      'en': 'Current information from internet:', 
      'ro': 'Informații actuale de pe internet:'
    };
    
    const prefix = prefixes[language] || prefixes['cs'];
    return `${prefix}\n\n${searchResults}`;
  }
};

export default openaiService;