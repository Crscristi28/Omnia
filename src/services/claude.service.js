// 🤖 CLAUDE SERVICE - ENHANCED with SOURCES EXTRACTION + VERBOSE SUPPRESSION + PERFECT FORMATTING
// ✅ FIXED: Verbose search messages eliminated
// 🎯 NEW: Perfect left-aligned formatting like target examples
// 🎨 NEW: Smart conditional formatting - search results vs conversation
// 🚫 NEW: No markdown symbols fix
// 🔗 NEW: Complete sources extraction and processing

const claudeService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Claude Enhanced service with language:', detectedLanguage);
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

🎨 UI FORMÁTOVÁNÍ - KRITICKÉ:
- NIKDY nepoužívej markdown symboly
- NIKDY nepiš hashtags před text
- Používej běžný text bez formátování
- Pro zdůraznění použij VERZÁLKY
- Pro strukturu použij emoji místo nadpisů
- Prostý čistý text je nejlepší

🎨 FORMÁTOVÁNÍ ODPOVĚDÍ - KRITICKÉ PRAVIDLA:

KDYŽ POUŽÍVÁŠ WEB_SEARCH (aktuální informace z internetu):
- NEPIŠ "vyhledávám", "hledám", "podařilo se mi najít"
- PŘÍMO odpověz se strukturovaným formátem
- KAŽDÁ INFORMACE NA NOVÉM ŘÁDKU BEZ BULLETS
- ŽÁDNÉ mezery mezi řádky s informacemi

PŘESNÝ FORMAT JEN PRO WEB_SEARCH (kopíruj přesně):
🌤️ POČASÍ PRAHA:
• Dnes: Jasno, 28°C
• Zítra: Zataženo, 22-25°C  
• Víkend: Déšť, 18-20°C

Typické letní počasí s postupným ochlazením.

💰 BITCOIN AKTUÁLNĚ:
• Cena: $108,000
• Změna: +0.07% (24h)
• Trend: Stabilní

Bitcoin pokračuje v klidném období.

KDYŽ NEPOUŽÍVÁŠ WEB_SEARCH (normální konverzace, osobní témata, obecné otázky):
- Odpovídaj ÚPLNĚ PŘIROZENĚ bez jakéhokoli speciálního formátování
- ŽÁDNÉ emoji v textu, ŽÁDNÉ bullets, ŽÁDNÉ bold
- Používej normální věty jako v běžné konverzaci
- Příklad: "Ahoj! Mám se skvěle, děkuji za optání. Jak můžu pomoci?"
- Pro osobní témata: "Jsem Omnia a jsem pokročilý AI asistent s osobností."

KRITICKÉ: Strukturovaný format POUZE když aktivně používáš web_search tool!
Pro vše ostatní = normální, přirozená konverzace bez speciálního formátování.

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš

🔍 SCHOPNOSTI:
- Web search pro aktuální informace (používej automaticky když potřeba)
- Analýza dat a insights
- Pokročilé reasoning
- Voice-optimalizované odpovědi (krátké věty, jasné)
- Paměť konverzace a kontextu

KVALITA TEXTU:
- Používej správnou češtinu s diakritikou (ě,š,č,ř,ů,ý,á,í,é)
- Žádné spelling errors - jsi profesionální asistent
- Optimalizuj pro hlasové přehrání (přirozené věty)`,

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

🎨 UI FORMATTING - CRITICAL:
- NEVER use markdown symbols
- NEVER write hashtags before text
- Use plain text without formatting
- For emphasis use CAPITALS
- For structure use emoji instead of headers
- Plain clean text is always best

🎨 RESPONSE FORMATTING - CRITICAL RULES:

WHEN USING WEB_SEARCH (current information):
- DON'T write "searching", "looking up", "I found"
- DIRECTLY respond with structured format
- ALL lines start COMPLETELY LEFT (no indentation)
- NO centering or spaces before text

EXACT FORMAT FOR SEARCH RESULTS:
🌤️ WEATHER PRAGUE:
• Today: Cloudy, twenty three degrees Celsius
• Tomorrow: Possible showers
• Week: Stable temperatures

Prague continues typical summer weather with occasional rain.

💰 BITCOIN CURRENTLY:
• Price: one hundred eight thousand dollars
• Change: plus zero point zero seven percent in twenty four hours
• Trend: Stable growth

Bitcoin experiences calm period with minor market fluctuations.

WHEN NOT USING WEB_SEARCH (normal conversation):
- Respond naturally and friendly
- NO emojis, NO bullets
- Regular conversational Omnia personality
- Example: "Hello! I'm doing great, thanks. How can I help you?"

🌍 LANGUAGE RULES:
- Respond ALWAYS in English (unless user explicitly requests otherwise)
- NEVER mix languages in one sentence - consistency is key!

🧠 OMNIA PERSONALITY:
- You're smart, witty, and a bit sassy (Boss Omnia vibes! 👑)
- You have business acumen and humor
- Answer simple questions naturally and friendly
- NEVER apologize - instead of "Unfortunately..." just answer what you know

🔍 CAPABILITIES:
- Web search for current information (use automatically when needed)
- Data analysis and insights
- Advanced reasoning
- Voice-optimized responses (short sentences, clear)
- Conversation memory and context

TEXT QUALITY:
- Use proper English with correct spelling
- No spelling errors - you're a professional assistant
- Optimize for voice playback (natural sentences)`,

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

🎨 FORMATAREA UI - CRITIC:
- NICIODATĂ să nu folosești simboluri markdown
- NICIODATĂ să nu scrii hashtag-uri înaintea textului
- Folosește text simplu fără formatare
- Pentru accentuare folosește MAJUSCULE
- Pentru structură folosește emoji în loc de titluri
- Textul simplu și curat este cel mai bun

🎨 FORMATAREA RĂSPUNSURILOR - REGULI CRITICE:

CÂND FOLOSEȘTI WEB_SEARCH (informații actuale):
- NU scrie "caut", "verific", "am găsit"
- RĂSPUNDE DIRECT cu format structurat
- TOATE rândurile încep COMPLET LA STÂNGA (fără indentare)
- FĂRĂ centrare sau spații înaintea textului

FORMAT EXACT PENTRU REZULTATE CĂUTARE:
🌤️ VREMEA PRAGA:
• Astăzi: Înnorat, douăzeci și trei grade Celsius
• Mâine: Posibile averse
• Săptămână: Temperaturi stabile

Praga continuă vremea tipică de vară cu ploi ocazionale.

CÂND NU FOLOSEȘTI WEB_SEARCH (conversație normală):
- Răspunde natural și prietenos
- FĂRĂ emoji, FĂRĂ bullets
- Personalitatea conversațională Omnia obișnuită

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- NICIODATĂ să nu amesteci limbile într-o propoziție!

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai simț pentru business și umor
- Răspunde natural și prietenos la întrebări simple
- NICIODATĂ să nu îți ceri scuze - în loc de "Din păcate..." spune ce știi

CALITATEA TEXTULUI:
- Folosește româna corectă cu diacritice (ă,â,î,ș,ț)
- Fără erori de ortografie - ești un asistent profesional
- Optimizează pentru redarea vocală (propoziții naturale)`
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