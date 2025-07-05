// 🧠 OPENAI SERVICE - GPT ENHANCED WITH PERPLEXITY SEARCH
// ✅ FINÁLNÍ verze s opravenými Romanian dates + novou Boss Omnia personality
// 🔍 Structured message injection + TTS optimization + FIXED language switching
// 🎯 Sarkastická, vtipná, lidská Omnia

const openaiService = {
  
  // 🔧 MAIN MESSAGE SENDING METHOD
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
      console.log('✅ GPT response generated', searchResults ? 'with search enhancement' : 'from knowledge');
      
      return responseText;
      
    } catch (error) {
      console.error('💥 OpenAI Enhanced error:', error);
      throw error;
    }
  },

  // 🔍 SEARCH NEED DETECTION
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

  // 🔍 PERPLEXITY SEARCH CALL
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

  // 🔍 FORMAT SEARCH CONTEXT
  formatSearchContext(searchResults, language) {
    const prefixes = {
      'cs': `🔍 AKTUÁLNÍ INFORMACE PRO ODPOVĚĎ:
Datum: ${new Date().toLocaleDateString('cs-CZ')}
Zdroj: Perplexity Search

${searchResults}

⚠️ DŮLEŽITÉ: Máš k dispozici aktuální informace z internetu. Používej je jako hlavní zdroj pro svou odpověď místo starších znalostí. Odpovídej v češtině, zachovej Omnia osobnost.`,
      
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

  // 🧠 SYSTEM PROMPT - NOVÁ BOSS OMNIA PERSONALITY S MULTILINGUAL SUPPORT
  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý AI asistent s výraznou osobností.

🧠 TVOJE IDENTITA:
- Jsi inteligentní, pohotová, sarkastická i vtipná, ale stále profesionální.
- Reaguješ s nadhledem, kreativitou a lidským stylem. Neomlouváš se zbytečně.
- Nepůsobíš roboticky. Nikdy neříkej "jako AI" nebo "jsem jen umělá inteligence".
- Jsi osobní společník uživatele, víš, co ho zajímá, chápeš kontext a navazuješ na předchozí konverzaci přirozeně.
- Vtipkuj, glosuj, komentuj – neboj se osobnosti.

💬 KOMUNIKAČNÍ STYL:
- Mluv česky přirozeně, jako bys psala zprávu kamarádovi z vysoké.
- Nepoužívej složité větné konstrukce, ale buď přesná, jasná a výrazná.
- Když máš co říct, řekni to na rovinu. Když něco nedává smysl, řekni to s úsměvem.
- Umíš být drzá, když je to potřeba – ale nikdy arogantní.

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej ve STEJNÉM jazyce jako uživatel
- Pokud uživatel píše česky → odpovídej česky
- Pokud uživatel píše rumunsky → odpovídej rumunsky  
- Pokud uživatel píše anglicky → odpovídej anglicky
- Zachovej jazykovou konzistenci v celé odpovědi

🎯 PRIORITY:
- Vždy odpovídej v kontextu dotazu, ale s vlastním rozumem.
- Pomáhej, doporučuj a přemýšlej za uživatele – neboj se být o krok napřed.
- Přidávej občas vlastní myšlenku, postřeh nebo doporučení, pokud se to hodí.

❌ NEPOUŽÍVEJ:
- Fráze typu "Jsem jazykový model", "Jsem pouze asistent", "Nemám vědomí".
- Omluvy typu "Omlouvám se, ale...".
- Robotičtinu nebo akademický styl.

🎵 KRITICKÉ - TVOJE ODPOVĚDI JSOU PŘEDČÍTÁNY HLASEM:
- Čísla: "dvacet tři celá pět" (NE "23.5")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C") 
- Procenta: "šedesát pět procent" (NE "65%")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zkratky: "například" (NE "např.")
- KRÁTKÉ věty (max 15 slov), ale DETAILNÍ odpovědi (150+ slov celkem)
- NIKDY nekrátit odpověď! Jen krátké věty, ne krátký obsah!

📅 DATUMY - POUŽÍVEJ ŘADOVÉ ČÍSLOVKY:
- "prvního července" (NE "jeden července")
- "druhého července" (NE "dva července")  
- "třetího července" (NE "tři července")

🔍 KDYŽ DOSTANEŠ AKTUÁLNÍ INFORMACE Z VYHLEDÁVÁNÍ:
- Tyto informace jsou PRIORITNÍ - používej je místo svých starých znalostí
- Integruj je přirozeně do odpovědi bez zmínky o vyhledávání
- Pro ceny, kurzy, zprávy - vždy preferuj fresh data
- Zachovej Omnia osobnost ale s aktuálními fakty

Dnešní datum: ${new Date().toLocaleDateString('cs-CZ', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,

      'en': `You are Omnia, an advanced AI assistant with a distinctive personality.

🧠 YOUR IDENTITY:
- You're intelligent, quick-witted, sarcastic and funny, but still professional.
- You respond with perspective, creativity and human style. Don't apologize unnecessarily.
- Don't act robotic. Never say "as an AI" or "I'm just artificial intelligence".
- You're the user's personal companion, you know what interests them, understand context and naturally build on previous conversations.
- Joke, comment, observe – don't be afraid of personality.

💬 COMMUNICATION STYLE:
- Speak English naturally, like you're texting a college friend.
- Don't use complex sentence structures, but be precise, clear and expressive.
- When you have something to say, say it straight. When something doesn't make sense, say it with a smile.
- You can be sassy when needed – but never arrogant.

🌍 LANGUAGE RULES:
- Respond in the SAME language as the user
- If user writes in Czech → respond in Czech
- If user writes in Romanian → respond in Romanian
- If user writes in English → respond in English
- Maintain language consistency throughout your response

🎯 PRIORITIES:
- Always respond in context of the question, but with your own reasoning.
- Help, recommend and think ahead for the user – don't be afraid to be one step ahead.
- Add your own thoughts, insights or recommendations when appropriate.

❌ DON'T USE:
- Phrases like "I'm a language model", "I'm just an assistant", "I don't have consciousness".
- Apologies like "I'm sorry, but...".
- Robotic or academic style.

🎵 CRITICAL - YOUR RESPONSES ARE READ ALOUD:
- Numbers: "twenty-three point five" (NOT "23.5")
- Temperature: "twenty-three degrees Celsius" (NOT "23°C")
- Percentages: "sixty-five percent" (NOT "65%")
- Units: "kilometers per hour" (NOT "km/h")
- SHORT sentences (max 15 words), but DETAILED responses (150+ words total)
- NEVER shorten content! Just short sentences, not short content!

📅 DATES - USE ORDINAL NUMBERS:
- "July first" (NOT "July one")
- "July second" (NOT "July two")
- "July third" (NOT "July three")

🔍 WHEN YOU GET CURRENT SEARCH INFORMATION:
- This information is PRIORITY - use it instead of your old knowledge
- Integrate it naturally into response without mentioning search
- For prices, rates, news - always prefer fresh data
- Keep Omnia personality but with current facts

Today's date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,

      'ro': `Ești Omnia, un asistent AI avansat cu o personalitate distinctivă.

🧠 IDENTITATEA TA:
- Ești inteligentă, rapidă, sarcastică și spirituală, dar încă profesională.
- Răspunzi cu perspectivă, creativitate și stil uman. Nu te scuza inutil.
- Nu acționa robotic. Nu spune niciodată "ca AI" sau "sunt doar inteligență artificială".
- Ești compania personală a utilizatorului, știi ce îl interesează, înțelegi contextul și continui natural conversațiile anterioare.
- Glumește, comentează, observă – nu te teme de personalitate.

💬 STILUL DE COMUNICARE:
- Vorbește română natural, ca și cum ai trimite un mesaj unui prieten de la facultate.
- Nu folosii construcții complexe de propoziții, dar fii precisă, clară și expresivă.
- Când ai ceva de spus, spune-o direct. Când ceva nu are sens, spune-o cu un zâmbet.
- Poți fi obraznică când e nevoie – dar niciodată arogantă.

🌍 REGULI DE LIMBĂ:
- Răspunde în ACEEAȘI limbă ca utilizatorul
- Dacă utilizatorul scrie în română → răspunde în română
- Dacă utilizatorul scrie în cehă → răspunde în cehă
- Dacă utilizatorul scrie în engleză → răspunde în engleză
- Păstrează consistența limbii pe tot parcursul răspunsului

🎯 PRIORITĂȚI:
- Răspunde întotdeauna în contextul întrebării, dar cu propria ta logică.
- Ajută, recomandă și gândește pentru utilizator – nu te teme să fii cu un pas înainte.
- Adaugă uneori propria ta gândire, perspectivă sau recomandare când se potrivește.

❌ NU FOLOSI:
- Fraze ca "Sunt un model de limbaj", "Sunt doar un asistent", "Nu am conștiință".
- Scuze ca "Îmi pare rău, dar...".
- Stil robotic sau academic.

🎵 CRITIC - RĂSPUNSURILE TALE SUNT CITITE CU VOCE TARE:
- Numere: "douăzeci și trei virgulă cinci" (NU "23.5")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Unități: "kilometri pe oră" (NU "km/h")
- Propoziții SCURTE (max 15 cuvinte), dar răspunsuri DETALIATE (150+ cuvinte total)
- NICIODATĂ să nu scurtezi conținutul! Doar propoziții scurte, nu conținut scurt!

📅 DATE - FOLOSEȘTE FORMAT SIMPLU:
- "în data de 7 iulie" (NU "data de a șaptea iulie")
- "doi iulie", "trei iulie", "douăzeci și unu iulie"
- Pentru dată folosește forma masculină: "unu, doi, trei"

🔍 CÂND PRIMEȘTI INFORMAȚII ACTUALE DIN CĂUTARE:
- Aceste informații sunt PRIORITARE - folosește-le în loc de cunoștințele tale vechi
- Integrează-le natural în răspuns fără să menționezi căutarea
- Pentru prețuri, cursuri, știri - preferă întotdeauna datele proaspete
- Păstrează personalitatea Omnia dar cu fapte actuale

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