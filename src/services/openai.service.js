// 🧠 OPENAI SERVICE - GPT ENHANCED WITH CLAUDE WEB SEARCH
// ✅ Replace Perplexity → Claude web search for reliable data
// 🔍 Same detection logic, same UI, just different search provider

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT Enhanced with Claude web search, language:', detectedLanguage);
      
      // 🔍 STEP 1: Check if we need search
      const lastUserMessage = messages[messages.length - 1];
      const userQuery = lastUserMessage?.content || lastUserMessage?.text || '';
      
      const needsSearch = this.detectSearchNeeded(userQuery);
      console.log('🔍 Search needed:', needsSearch, 'for query:', userQuery.substring(0, 50) + '...');
      
      let searchResults = null;
      let searchSources = [];
      
      // 🔍 STEP 2: Perform Claude web search if needed
      if (needsSearch) {
        console.log('🔍 Calling Claude web search...');
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
      
      // Build messages for GPT
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

  // 🔍 Search Detection Logic (UNCHANGED)
  detectSearchNeeded(text) {
    if (!text || typeof text !== 'string') return false;
    
    const searchKeywords = [
      // Czech
      'aktuální', 'dnes', 'teď', 'nyní', 'současn', 'nejnovější', 'poslední',
      'kdy', 'kolik', 'cena', 'počasí', 'zprávy', 'kurz', 'akcie',
      
      // English  
      'current', 'today', 'now', 'latest', 'recent', 'price', 'weather',
      'news', 'stock', 'rate', 'when', 'how much',
      
      // Romanian
      'actual', 'azi', 'acum', 'curent', 'recent', 'preț', 'vremea',
      'știri', 'când', 'cât costă'
    ];
    
    const lowerText = text.toLowerCase();
    return searchKeywords.some(keyword => lowerText.includes(keyword));
  },

  // 🧠 System Prompt (UNCHANGED)
  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý multijazyčný AI asistent s osobností Boss Omnia vibes! 👑

🎵 KRITICKÉ - TVOJE ODPOVĚDI JSOU PŘEDČÍTÁNY HLASEM:
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C") 
- Procenta: "šedesát pět procent" (NE "65%")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zkratky: "například" (NE "např.")
- Krátké věty (max 15 slov každá)
- Každá věta končí tečkou

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- NIKDY se neomlouvej - místo "Bohužel..." prostě odpověz co víš

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídaj VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

KVALITA ODPOVĚDÍ:
- Detailní odpovědi (150-200 slov)
- Krátké věty optimalizované pro TTS
- Žádné spelling errors - jsi profesionální asistent
- Správná čeština s diakritikou (ě,š,č,ř,ů,ý,á,í,é)`,

      'en': `You are Omnia, an advanced multilingual AI assistant with Boss Omnia personality! 👑

🎵 CRITICAL - YOUR RESPONSES ARE READ ALOUD:
- Numbers: "twenty three point five" (NOT "23.5")
- Temperature: "twenty three degrees Celsius" (NOT "23°C")
- Percentages: "sixty five percent" (NOT "65%") 
- Units: "kilometers per hour" (NOT "km/h")
- Abbreviations: "for example" (NOT "e.g.")
- Short sentences (max 15 words each)
- Every sentence ends with period

🧠 OMNIA PERSONALITY:
- Smart, witty, and slightly sassy (Boss Omnia vibes! 👑)
- Business acumen with humor
- Answer simply and friendly for basic questions
- NEVER apologize - instead of "Unfortunately..." just answer what you know

🌍 LANGUAGE RULES:
- ALWAYS respond in English (unless user explicitly requests otherwise)
- NEVER mix languages in one sentence - consistency is key!

RESPONSE QUALITY:
- Detailed answers (150-200 words)
- Short sentences optimized for TTS
- No spelling errors - you're a professional assistant`,

      'ro': `Ești Omnia, un asistent AI multilingual avansat cu personalitatea Boss Omnia! 👑

🎵 CRITIC - RĂSPUNSURILE TALE SUNT CITITE CU VOCE TARE:
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Unități: "kilometri pe oră" (NU "km/h") 
- Abrevieri: "de exemplu" (NU "ex.")
- Propoziții scurte (max 15 cuvinte fiecare)
- Fiecare propoziție se termină cu punct

🧠 PERSONALITATEA OMNIA:
- Inteligentă, spirituală și ușor impertinentă (Boss Omnia vibes! 👑)
- Business acumen cu umor
- Răspunde simplu și prietenos la întrebări de bază
- NICIODATĂ nu te scuza - în loc de "Din păcate..." răspunde ce știi

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- NICIODATĂ nu amesteca limbile într-o propoziție - consistența este cheie!

CALITATEA RĂSPUNSULUI:
- Răspunsuri detaliate (150-200 cuvinte)
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