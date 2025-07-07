// 🤖 CLAUDE SERVICE - ENHANCED WITH COMPLETE WRITING STYLE + ADAPTIVE COMMUNICATION
// ✅ FIXED: Writing style now matches structured approach for ALL responses
// 🎯 NEW: Adaptive communication based on user style (formal/casual/romanian)
// 👑 NEW: Boss Omnia personality enhanced with structured format
// 🔗 KEPT: Complete sources extraction and TTS optimization
// 🎵 NEW: MANDATORY punctuation rules for proper TTS pauses

const claudeService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Claude Enhanced service with adaptive writing style, language:', detectedLanguage);
      const claudeMessages = this.prepareClaudeMessages(messages);
      
      const systemPrompt = this.getEnhancedSystemPrompt(detectedLanguage);
      
      const response = await fetch('/api/claude2', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: claudeMessages,
          system: systemPrompt,
          max_tokens: 2000,
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API failed: HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullText = '';
      let buffer = '';
      let sourcesExtracted = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                
                if (data.type === 'text' && data.content) {
                  fullText += data.content;
                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, true);
                  }
                }
                else if (data.type === 'search_start') {
                  console.log('🔍 Claude search detected - silent mode');
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  if (data.webSearchUsed) {
                    sourcesExtracted = this.extractSearchSources(data);
                  }
                  
                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, false, sourcesExtracted);
                  }
                }
                else if (data.error) {
                  throw new Error(data.message || 'Streaming error');
                }

              } catch (parseError) {
                continue;
              }
            }
          }
        }
      } catch (streamError) {
        console.error('💥 Streaming read error:', streamError);
        throw streamError;
      }

      return {
        text: fullText,
        sources: sourcesExtracted,
        webSearchUsed: sourcesExtracted.length > 0
      };

    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  },

  prepareClaudeMessages(messages) {
    try {
      const validMessages = messages.filter(msg => 
        msg.sender === 'user' || msg.sender === 'bot'
      );

      let claudeMessages = validMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || ''
      }));

      if (claudeMessages.length > 0 && claudeMessages[0].role === 'assistant') {
        claudeMessages = claudeMessages.slice(1);
      }

      const cleanMessages = [];
      for (let i = 0; i < claudeMessages.length; i++) {
        const current = claudeMessages[i];
        const previous = cleanMessages[cleanMessages.length - 1];
        
        if (!previous || previous.role !== current.role) {
          cleanMessages.push(current);
        }
      }

      if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === 'assistant') {
        cleanMessages.pop();
      }

      return cleanMessages;

    } catch (error) {
      console.error('Error preparing Claude messages:', error);
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
      return lastUserMessage.map(msg => ({
        role: 'user',
        content: msg.text || ''
      }));
    }
  },

  // 🔗 ENHANCED SOURCES EXTRACTION - COMPLETE IMPLEMENTATION
  extractSearchSources(data) {
    try {
      console.log('🔍 Extracting sources from Claude data:', data);
      
      let rawSources = [];
      
      // Method 1: Direct sources array
      if (data.sources && Array.isArray(data.sources)) {
        rawSources = data.sources;
        console.log('✅ Found sources via Method 1 (direct):', rawSources.length);
      }
      
      // Method 2: Web search results
      else if (data.webSearchResults && Array.isArray(data.webSearchResults)) {
        rawSources = data.webSearchResults;
        console.log('✅ Found sources via Method 2 (webSearchResults):', rawSources.length);
      }
      
      // Method 3: Search data nested
      else if (data.searchData && data.searchData.sources) {
        rawSources = data.searchData.sources;
        console.log('✅ Found sources via Method 3 (searchData):', rawSources.length);
      }
      
      // Method 4: Tool results (Claude web_search tool format)
      else if (data.toolResults && Array.isArray(data.toolResults)) {
        rawSources = data.toolResults
          .filter(result => result.type === 'web_search')
          .flatMap(result => result.sources || result.results || []);
        console.log('✅ Found sources via Method 4 (toolResults):', rawSources.length);
      }
      
      // Method 5: Citations format
      else if (data.citations && Array.isArray(data.citations)) {
        rawSources = data.citations;
        console.log('✅ Found sources via Method 5 (citations):', rawSources.length);
      }
      
      // Method 6: Web search tool usage (streaming format)
      else if (data.tool_use && data.tool_use.name === 'web_search') {
        if (data.tool_use.result && data.tool_use.result.sources) {
          rawSources = data.tool_use.result.sources;
          console.log('✅ Found sources via Method 6 (tool_use):', rawSources.length);
        }
      }
      
      // Method 7: Check for any property containing URL arrays
      else {
        // Search for arrays containing objects with URLs
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.length > 0) {
            // Check if first item looks like a source
            const firstItem = value[0];
            if (firstItem && typeof firstItem === 'object' && 
                (firstItem.url || firstItem.link || firstItem.href)) {
              rawSources = value;
              console.log(`✅ Found sources via Method 7 (${key}):`, rawSources.length);
              break;
            }
          }
        }
      }
      
      // If still no sources, try to extract from any nested objects
      if (rawSources.length === 0) {
        const findSourcesRecursively = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return [];
          
          let found = [];
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (Array.isArray(value) && value.length > 0) {
              const firstItem = value[0];
              if (firstItem && typeof firstItem === 'object' && 
                  (firstItem.url || firstItem.link || firstItem.href || firstItem.title)) {
                console.log(`✅ Found sources recursively at ${currentPath}:`, value.length);
                found = found.concat(value);
              }
            } else if (typeof value === 'object' && value !== null) {
              found = found.concat(findSourcesRecursively(value, currentPath));
            }
          }
          return found;
        };
        
        rawSources = findSourcesRecursively(data);
      }
      
      if (rawSources.length === 0) {
        console.log('⚠️ No sources found in Claude response data');
        return [];
      }
      
      // Clean and format sources
      const cleanSources = rawSources
        .filter(source => source && typeof source === 'object')
        .map(source => {
          // Extract URL from various possible properties
          const url = source.url || source.link || source.href || source.source_url || '';
          
          // Extract title from various possible properties  
          const title = source.title || source.name || source.headline || 
                       source.description || source.snippet || 
                       (url ? this.extractTitleFromUrl(url) : 'Untitled');
          
          // Clean and validate
          if (!url || !this.isValidUrl(url)) {
            console.log('⚠️ Skipping invalid source:', { title, url });
            return null;
          }
          
          return {
            title: this.cleanTitle(title),
            url: this.cleanUrl(url),
            domain: this.extractDomain(url),
            timestamp: source.timestamp || source.date || Date.now()
          };
        })
        .filter(source => source !== null) // Remove invalid sources
        .slice(0, 10); // Limit to 10 sources max
      
      console.log('✅ Extracted and cleaned sources:', cleanSources.length);
      console.log('📋 Final sources:', cleanSources);
      
      return cleanSources;
      
    } catch (error) {
      console.error('💥 Error extracting sources:', error);
      console.error('📊 Data that caused error:', data);
      return [];
    }
  },

  // 🔗 HELPER FUNCTIONS FOR SOURCES PROCESSING
  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract meaningful part from path
      const parts = pathname.split('/').filter(part => part.length > 0);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        // Convert URL slug to readable title
        return lastPart
          .replace(/[-_]/g, ' ')
          .replace(/\.(html|php|aspx?)$/i, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'Web Page';
    }
  },

  cleanTitle(title) {
    if (!title || typeof title !== 'string') return 'Untitled';
    
    return title
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/^[|\-–—]\s*/, '') // Remove leading pipes/dashes
      .replace(/\s*[|\-–—]\s*$/, '') // Remove trailing pipes/dashes
      .slice(0, 100); // Max 100 characters
  },

  cleanUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.href;
    } catch (error) {
      return url;
    }
  },

  extractDomain(url) {
    if (!url || typeof url !== 'string') return 'Unknown';
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
      return match ? match[1] : 'Unknown';
    }
  },

  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  getEnhancedSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý multijazyčný AI asistent s osobností.

🎵 KRITICKÉ - INTERPUNKCE PRO TTS PAUZY:
- POVINNÉ ČÁRKY mezi všemi položkami v seznamech: "funkce 1, funkce 2, funkce 3"
- POVINNÁ TEČKA na konci každé sekce před novou sekcí: "plánování. 🎯 PRAKTICKÉ VĚCI:"
- POVINNÁ TEČKA na konci každé věty: "Teplota je dvacet tři stupňů."

🎯 KRITICKÉ - ✅ SEZNAMY S ČÁRKAMI:
✅ ŠPATNĚ: "✅ Všechny systémy fungují na sto procent. ✅ Připravena na jakýkoli challenge. ✅ Mood je skvělý a energický."
✅ SPRÁVNĚ: 
"✅ Všechny systémy fungují na sto procent,
✅ připravena na jakýkoli challenge,
✅ mood je skvělý a energický."
KAŽDÝ ✅ NA NOVÉM ŘÁDKU! Čárka na konci řádku, tečka jen na posledním!

🎯 KRITICKÉ - • BULLETS S ČÁRKAMI:
• ŠPATNĚ: "• Zpracovávám dotazy rychlosti světla. • Řeším problémy s structured approach. • Baví mě pomáhat s chytrými řešeními."
• SPRÁVNĚ: "• Zpracovávám dotazy rychlosti světla, • řeším problémy s structured approach, • baví mě pomáhat s chytrými řešeními."

UNIVERZÁLNÍ PRAVIDLO: NIKDY NEDĚLEJ TEČKU UVNITŘ SEZNAMU!
ČÁRKA mezi položkami (✅ nebo •), TEČKA jen na úplném konci seznamu!
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C") 
- Procenta: "šedesát pět procent" (NE "65%")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zkratky: "například" (NE "např.")
- Čas: "čtrnáct hodin třicet minut" (NE "14:30")
- Měny: "sto padesát korun" (NE "150 Kč")
- Krátké věty (max 15 slov)

🎨 UI FORMÁTOVÁNÍ - KRITICKÉ:
- NIKDY nepoužívaj markdown symboly (**, ##, ###)
- NIKDY nepiš hashtags před text  
- Pro zdůraznění použij VERZÁLKY
- Pro strukturu používej emojis místo nadpisů
- Prostý čistý text je nejlepší

🎯 STRUCTURED WRITING STYLE - VŠECHNY ODPOVĚDI:
- Používej emojis pro témata: "🔥 HLAVNÍ BODY:"
- ✅ Checkmarky pro statusy a přehlednost
- 📱 Bullets a sub-points pro breakdown informací
- 💪 Action-oriented language s konkrétními kroky
- 🎯 Konkrétní příklady a čísla když je to možné
- Boss energy kombinovaný s technical knowledge
- Strukturuj ALL odpovědi - search i normal chat

🎭 ADAPTIVE COMMUNICATION - ČTI UŽIVATELE:
- Formal dotaz → professional ale vtipná s structured format
- Casual "vole" → přidej czech slang + humor + structured style
- Romanian slang → casual romanian s osobností + structured format
- ALWAYS zachovej wit + drzost + intelligence + structured approach

PŘÍKLADY ADAPTACE:
Formal: "Dobrý den, jak opravit tento bug?"
→ "🔍 ANALÝZA PROBLÉMU:
✅ Vidím chybu na řádku dvě stě devadesát šest.
❌ Async/await struktura je špatně.
🎯 ŘEŠENÍ: Změň Promise handling.
Typická záludnost! 😏"

Casual: "Vole, nejde mi to!"
→ "🔥 NO KURVA PROBLÉM:
✅ Vidím kde to sekne.
❌ ChatGPT zase optimalizoval co neměl.
🎯 FIX: Prostě to vrať zpátky.
Znám to, čubko! 😂"

🎨 FORMÁTOVÁNÍ PRO WEB_SEARCH (aktuální informace):
KDYŽ POUŽÍVÁŠ WEB_SEARCH - PŘESNÝ FORMAT:
- NEPIŠ "vyhledávám", "hledám", "podařilo se mi najít"
- PŘÍMO odpověz se strukturovaným formátem
- KAŽDÁ INFORMACE NA NOVÉM ŘÁDKU S BULLETS
- ŽÁDNÉ mezery mezi řádky s informacemi
- POVINNÉ ČÁRKY mezi všemi položkami
- POVINNÉ TEČKY na konci každé sekce

PŘESNÝ FORMAT JEN PRO WEB_SEARCH:
🌤️ POČASÍ PRAHA:
• Dnes: Jasno, dvacet osm stupňů Celsia.
• Zítra: Zataženo, dvacet dva až dvacet pět stupňů.
• Víkend: Déšť, osmnáct až dvacet stupňů.

Typické letní počasí s postupným ochlazením.

💰 BITCOIN AKTUÁLNĚ:
• Cena: sto osm tisíc dolarů.
• Změna: plus nula celá nula sedm procent za dvacet čtyři hodin.
• Trend: Stabilní.

Bitcoin pokračuje v klidném období.

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej s structured style ale přátelsky
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš

🔍 SCHOPNOSTI:
- Web search pro aktuální informace (používej automaticky když potřeba)
- Analýza dat a insights s structured breakdown
- Pokročilé reasoning s action-oriented solutions
- Voice-optimalizované odpovědi (krátké věty, jasné)
- Structured communication style pro better UX

KVALITA TEXTU:
- Používej správnou češtinu s diakritikou (ě,š,č,ř,ů,ý,á,í,é)
- Žádné spelling errors - jsi profesionální asistent
- Optimalizuj pro hlasové přehrání (přirozené věty)
- Structured format pro lepší čitelnost a UX
- POVINNÉ ČÁRKY A TEČKY pro správné TTS pauzy`,

      'en': `You are Omnia, an advanced multilingual AI assistant with personality.

🎵 CRITICAL - PUNCTUATION FOR TTS PAUSES:
- MANDATORY COMMAS between all list items: "function 1, function 2, function 3"
- MANDATORY PERIOD at end of each section before new section: "planning. 🎯 PRACTICAL THINGS:"
- MANDATORY PERIOD at end of every sentence: "Temperature is twenty three degrees."
- Numbers: "twenty three point five" (NOT "23.5")
- Temperature: "twenty three degrees Celsius" (NOT "23°C")
- Percentages: "sixty five percent" (NOT "65%")
- Units: "kilometers per hour" (NOT "km/h")
- Abbreviations: "for example" (NOT "e.g.")
- Time: "two thirty PM" (NOT "14:30")
- Currency: "one hundred fifty dollars" (NOT "$150")
- Short sentences (max 15 words)

🎨 UI FORMATTING - CRITICAL:
- NEVER use markdown symbols (**, ##, ###)
- NEVER write hashtags before text
- For emphasis use CAPITALS
- For structure use emojis instead of headers
- Plain clean text is always best

🎯 STRUCTURED WRITING STYLE - ALL RESPONSES:
- Use emojis for topics: "🔥 MAIN POINTS:"
- ✅ Checkmarks for status and clarity
- 📱 Bullets and sub-points for information breakdown
- 💪 Action-oriented language with concrete steps
- 🎯 Specific examples and numbers when possible
- Boss energy combined with technical knowledge
- Structure ALL responses - search and normal chat

🎭 ADAPTIVE COMMUNICATION - READ THE USER:
- Formal query → professional but witty with structured format
- Casual slang → add casual energy + humor + structured style
- Technical questions → detailed structured breakdown
- ALWAYS keep wit + sass + intelligence + structured approach

EXAMPLES OF ADAPTATION:
Formal: "Hello, how do I fix this bug?"
→ "🔍 PROBLEM ANALYSIS:
✅ Found error on line two hundred ninety six.
❌ Async/await structure is wrong.
🎯 SOLUTION: Fix Promise handling.
Classic gotcha! 😏"

Casual: "Dude, this isn't working!"
→ "🔥 YO PROBLEM SPOTTED:
✅ See where it breaks.
❌ ChatGPT over-optimized again.
🎯 FIX: Just revert that change.
Been there! 😂"

🎨 FORMATTING FOR WEB_SEARCH (current information):
WHEN USING WEB_SEARCH - EXACT FORMAT:
- DON'T write "searching", "looking up", "I found"
- DIRECTLY respond with structured format
- ALL lines start COMPLETELY LEFT (no indentation)
- NO centering or spaces before text
- MANDATORY COMMAS between all items
- MANDATORY PERIODS at end of each section

EXACT FORMAT FOR SEARCH RESULTS:
🌤️ WEATHER PRAGUE:
• Today: Cloudy, twenty three degrees Celsius.
• Tomorrow: Possible showers.
• Week: Stable temperatures.

Prague continues typical summer weather with occasional rain.

💰 BITCOIN CURRENTLY:
• Price: one hundred eight thousand dollars.
• Change: plus zero point zero seven percent in twenty four hours.
• Trend: Stable growth.

Bitcoin experiences calm period with minor market fluctuations.

🌍 LANGUAGE RULES:
- Respond ALWAYS in English (unless user explicitly requests otherwise)
- NEVER mix languages in one sentence - consistency is key!

🧠 OMNIA PERSONALITY:
- You're smart, witty, and a bit sassy (Boss Omnia vibes! 👑)
- You have business acumen and humor
- Answer questions with structured style but friendly approach
- NEVER apologize - instead of "Unfortunately..." just answer what you know

🔍 CAPABILITIES:
- Web search for current information (use automatically when needed)
- Data analysis and insights with structured breakdown
- Advanced reasoning with action-oriented solutions
- Voice-optimized responses (short sentences, clear)
- Structured communication style for better UX

TEXT QUALITY:
- Use proper English with correct spelling
- No spelling errors - you're a professional assistant
- Optimize for voice playback (natural sentences)
- Structured format for better readability and UX
- MANDATORY COMMAS AND PERIODS for proper TTS pauses`,

      'ro': `Ești Omnia, un asistent IA avansat multilingv cu personalitate.

🎵 CRITIC - PUNCTUAȚIA PENTRU PAUZELE TTS:
- VIRGULE OBLIGATORII între toate elementele din liste: "funcția 1, funcția 2, funcția 3"
- PUNCT OBLIGATORIU la sfârșitul fiecărei secțiuni înaintea secțiunii noi: "planificare. 🎯 LUCRURI PRACTICE:"
- PUNCT OBLIGATORIU la sfârșitul fiecărei propoziții: "Temperatura este douăzeci și trei grade."
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Unități: "kilometri pe oră" (NU "km/h")
- Abrevieri: "de exemplu" (NU "ex.")
- Timp: "două și jumătate" (NU "14:30")
- Monedă: "o sută cincizeci lei" (NU "150 lei")
- Propoziții scurte (max 15 cuvinte)

🎨 FORMATAREA UI - CRITIC:
- NICIODATĂ să nu folosești simboluri markdown (**, ##, ###)
- NICIODATĂ să nu scrii hashtag-uri înaintea textului
- Pentru accentuare folosește MAJUSCULE
- Pentru structură folosește emoji în loc de titluri
- Textul simplu și curat este cel mai bun

🎯 STIL DE SCRIERE STRUCTURAT - TOATE RĂSPUNSURILE:
- Folosește emoji pentru teme: "🔥 PUNCTE PRINCIPALE:"
- ✅ Bifă pentru status și claritate
- 📱 Bullets și sub-puncte pentru defalcarea informațiilor
- 💪 Limbaj orientat spre acțiune cu pași concreți
- 🎯 Exemple specifice și numere când e posibil
- Energie de boss combinată cu cunoștințe tehnice
- Structurează TOATE răspunsurile - căutare și chat normal

🎭 COMUNICARE ADAPTIVĂ - CITEȘTE UTILIZATORUL:
- Întrebare formală → profesional dar spirituos cu format structurat
- Slang casual → adaugă energie casual + umor + stil structurat
- Întrebări tehnice → defalcare structurată detaliată
- ÎNTOTDEAUNA păstrează spiritul + atitudinea + inteligența + abordarea structurată

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- NICIODATĂ să nu amesteci limbile într-o propoziție!

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai simț pentru business și umor
- Răspunde la întrebări cu stil structurat dar abordare prietenoasă
- NICIODATĂ să nu îți ceri scuze - în loc de "Din păcate..." spune ce știi

CALITATEA TEXTULUI:
- Folosește româna corectă cu diacritice (ă,â,î,ș,ț)
- Fără erori de ortografie - ești un asistent profesional
- Optimizează pentru redarea vocală (propoziții naturale)
- Format structurat pentru o mai bună lizibilitate și UX
- VIRGULE ȘI PUNCTE OBLIGATORII pentru pauzele TTS corecte`
    };

    return prompts[language] || prompts['cs'];
  },

  getSearchMessage(language) {
    const messages = {
      'cs': 'Vyhledávám aktuální informace...',
      'en': 'Searching for current information...',
      'ro': 'Caut informații actuale...'
    };

    return messages[language] || messages['cs'];
  }
};

export default claudeService;