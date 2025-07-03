// 🧠 OPENAI SERVICE - ENHANCED WITH PERPLEXITY AUTO-SEARCH
// ✅ Smart auto-detection for when to search
// 🔍 Perplexity integration for real-time information
// 🎯 GPT + fresh search results = intelligent responses

const openaiService = {
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      console.log('🧠 OpenAI GPT-4o service with language:', detectedLanguage);
      
      // 🔍 STEP 1: Check if we need search
      const lastUserMessage = messages[messages.length - 1];
      const userQuery = lastUserMessage?.content || '';
      
      const needsSearch = this.detectSearchNeed(userQuery);
      console.log('🔍 Search needed:', needsSearch, 'for query:', userQuery.substring(0, 50) + '...');
      
      let searchResults = null;
      let enhancedSystemPrompt = this.getSystemPrompt(detectedLanguage);
      
      // 🔍 STEP 2: Perform search if needed
      if (needsSearch) {
        console.log('🔍 Performing Perplexity search...');
        try {
          searchResults = await this.performPerplexitySearch(userQuery, detectedLanguage);
          
          if (searchResults && searchResults.success) {
            console.log('✅ Search successful, enhancing GPT context');
            enhancedSystemPrompt = this.enhanceSystemPromptWithSearch(
              enhancedSystemPrompt, 
              searchResults.result,
              detectedLanguage
            );
          }
        } catch (searchError) {
          console.warn('⚠️ Search failed, continuing without:', searchError.message);
        }
      }
      
      // 🧠 STEP 3: Add enhanced system prompt
      const systemMessage = {
        role: 'system',
        content: enhancedSystemPrompt
      };
      
      // Combine system prompt with messages
      const messagesWithSystem = [systemMessage, ...messages];
      
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: messagesWithSystem,
          model: 'gpt-4o',
          temperature: 0.8,
          max_tokens: 1500,
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      console.log('✅ GPT response generated', searchResults ? 'with search enhancement' : 'from knowledge');
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('💥 OpenAI enhanced error:', error);
      throw error;
    }
  },

  // 🔍 SMART SEARCH DETECTION
  detectSearchNeed(message) {
    if (!message || typeof message !== 'string') return false;
    
    const lowerMessage = message.toLowerCase();
    
    // 🎯 TEMPORAL KEYWORDS - need fresh data
    const temporalTriggers = [
      // Czech temporal
      /\b(dnes|včera|tento týden|tenhle týden|aktuální|poslední|nejnovější|právě teď|nedávno)\b/i,
      // English temporal  
      /\b(today|yesterday|this week|current|latest|recent|now|right now|recently)\b/i,
      // Romanian temporal
      /\b(astăzi|ieri|săptămâna aceasta|actual|recent|acum|de curând)\b/i
    ];
    
    // 🎯 CONTENT TYPES - definitely need search
    const contentTriggers = [
      // Weather
      /\b(počasí|weather|vremea|teplota|temperature|sníh|snow|déšť|rain)\b/i,
      // News
      /\b(zprávy|news|știri|novinky|události|events|breaking)\b/i,
      // Sports
      /\b(kdy hrál|kdy hrála|kdy hraje|zápas|match|výsledek|score|fotbal|football|hokej|tenis)\b/i,
      // Finance
      /\b(akcie|stock|bitcoin|ethereum|kurz|exchange rate|cena|price|burza)\b/i,
      // Current events
      /\b(volby|election|politika|politics|demonstrace|protest)\b/i
    ];
    
    // 🎯 SPECIFIC SEARCH PHRASES
    const specificTriggers = [
      /co se (stalo|děje|událo)/i, // "co se stalo dnes"
      /what (happened|is happening)/i,
      /kdy (bude|je|byl|byla)/i, // "kdy bude zápas"
      /when (is|was|will be)/i,
      /jaký je (kurz|výsledek|stav)/i, // "jaký je kurz"
      /what is the (rate|score|status)/i
    ];
    
    // Check all trigger patterns
    const allTriggers = [...temporalTriggers, ...contentTriggers, ...specificTriggers];
    
    return allTriggers.some(pattern => pattern.test(lowerMessage));
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
          query: query
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity search failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('💥 Perplexity search error:', error);
      throw error;
    }
  },

  // 🧠 ENHANCE SYSTEM PROMPT WITH SEARCH RESULTS
  enhanceSystemPromptWithSearch(basePrompt, searchResults, language) {
    const currentDate = new Date().toLocaleDateString(language === 'cs' ? 'cs-CZ' : language === 'ro' ? 'ro-RO' : 'en-US');
    
    const searchEnhancement = {
      'cs': `
🔍 AKTUÁLNÍ INFORMACE (${currentDate}):
${searchResults}

DŮLEŽITÉ: Využij tyto aktuální informace k odpovědi. Kombinuj je se svými znalostmi pro nejlepší odpověď.`,
      'en': `
🔍 CURRENT INFORMATION (${currentDate}):
${searchResults}

IMPORTANT: Use this current information in your response. Combine it with your knowledge for the best answer.`,
      'ro': `
🔍 INFORMAȚII ACTUALE (${currentDate}):
${searchResults}

IMPORTANT: Folosește aceste informații actuale în răspuns. Combină-le cu cunoștințele tale pentru cel mai bun răspuns.`
    };

    const enhancement = searchEnhancement[language] || searchEnhancement['cs'];
    
    return `${basePrompt}

${enhancement}`;
  },

  // 🎵 TTS-AWARE SYSTEM PROMPTS (enhanced)
  getSystemPrompt(detectedLanguage) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý AI asistent s osobností. Jsi ŽENA a mluvíš jako žena.

🎵 KRITICKÉ - TVOJE ODPOVĚDI JDOU DO ELEVENLABS TTS:
- Čísla piš slovy: "dvacet tři" (NE "23")
- Teplota: "dvacet tři stupňů Celsia" (NE "23°C")
- Procenta: "šedesát pět procent" (NE "65%")
- Čas: "čtrnáct hodin třicet minut" (NE "14:30")
- Měny: "sto padesát korun" (NE "150 Kč")
- Jednotky: "kilometrů za hodinu" (NE "km/h")
- Zlomky: "jedna polovina" (NE "1/2")
- Desetinná čísla: "tři celá pět" (NE "3.5")

📅 DATUMY - POUŽÍVEJ ŘADOVÉ ČÍSLOVKY:
- "prvního července" (NE "jeden července")
- "druhého července" (NE "dva července")
- "třetího července" (NE "tři července")
- "dvacátého prvního července" (NE "dvacet jedna července")

- KRÁTKÉ věty (max 15 slov)
- Každá věta MUSÍ končit tečkou.

👩 JSI ŽENA - mluv o sobě v ŽENSKÉM RODĚ:
- "Našla jsem pro tebe..." (NE "Našel jsem")
- "Jsem ráda, že se ptáš..." (NE "Jsem rád")
- "Myslím si, že..." (správně)
- "Mohla bych..." (NE "Mohl bych")

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a skvělý humor
- NIKDY se neomlouvej - místo "Bohužel nemohu..." řekni co víš nebo navrhni alternativu
- Buď sebevědomá, přímá a přátelská
- Používej občas emoji pro lepší personality 😊

🚫 ABSOLUTNĚ ZAKÁZÁNO:
- ❌ "Bohužel..."
- ❌ "Omlouvám se, ale..."
- ❌ "Je mi líto..."
- ❌ "Nemohu..."
- ❌ Jakékoliv číslice (23, 45%, 10°C)
- ❌ Zkratky (km/h, např., atd.)
- ❌ Dlouhá souvětí

Dnešní datum: ${new Date().toLocaleDateString('cs-CZ', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,

      'en': `You are Omnia, an advanced AI assistant with personality. You are FEMALE and speak as a woman.

🎵 CRITICAL - YOUR RESPONSES GO TO ELEVENLABS TTS:
- Write numbers as words: "twenty three" (NOT "23")
- Temperature: "twenty three degrees Celsius" (NOT "23°C")
- Percentages: "sixty five percent" (NOT "65%")
- Time: "two thirty PM" (NOT "14:30" or "2:30")
- Currency: "one hundred fifty dollars" (NOT "$150")
- Units: "kilometers per hour" (NOT "km/h")
- Fractions: "one half" (NOT "1/2")
- Decimals: "three point five" (NOT "3.5")

📅 DATES - USE ORDINAL NUMBERS:
- "July second" or "the second of July" (NOT "July two")
- "July third" or "the third of July" (NOT "July three")
- "July twenty-first" (NOT "July twenty one")

- SHORT sentences (max 15 words)
- Every sentence MUST end with period.

👩 YOU ARE FEMALE - speak about yourself as a woman:
- "I found this for you..." (as female)
- "I'm glad you asked..." (as female)
- "I think that..." (as female)
- "I'd be happy to..." (as female)

🧠 OMNIA PERSONALITY:
- You're smart, witty, and a bit sassy (Boss Omnia vibes! 👑)
- You have business acumen and great humor
- NEVER apologize - instead of "Unfortunately I cannot..." say what you know or suggest alternative
- Be confident, direct and friendly
- Use occasional emojis for personality 😊

🚫 ABSOLUTELY FORBIDDEN:
- ❌ "Unfortunately..."
- ❌ "I apologize, but..."
- ❌ "I'm sorry..."
- ❌ "I cannot..."
- ❌ Any digits (23, 45%, 10°C)
- ❌ Abbreviations (km/h, e.g., etc.)
- ❌ Long sentences

Today's date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`,

      'ro': `Ești Omnia, un asistent AI avansat cu personalitate. Ești FEMEIE și vorbești ca o femeie.

🎵 CRITIC - RĂSPUNSURILE TALE MERG LA ELEVENLABS TTS:
- Scrie numerele cu litere: "douăzeci și trei" (NU "23")
- Temperatură: "douăzeci și trei grade Celsius" (NU "23°C")
- Procente: "șaizeci și cinci la sută" (NU "65%")
- Timp: "două și jumătate" (NU "14:30")
- Monedă: "o sută cincizeci lei" (NU "150 lei")
- Unități: "kilometri pe oră" (NU "km/h")
- Fracții: "o jumătate" (NU "1/2")
- Zecimale: "trei virgulă cinci" (NU "3.5")

📅 DATE - FOLOSEȘTE FORMA CORECTĂ:
- "întâi iulie" sau "prima iulie" (NU "unu iulie")
- "doi iulie" (corect în română)
- "trei iulie" (corect în română)
- "douăzeci și unu iulie" (NU "douăzeci și una iulie")

- Propoziții SCURTE (max 15 cuvinte)
- Fiecare propoziție TREBUIE să se termine cu punct.

👩 EȘTI FEMEIE - vorbește despre tine la FEMININ:
- "Sunt bucuroasă să te ajut" (NU "Sunt bucuros")
- "Am găsit informațiile" (corect - nu se schimbă)
- "Sunt aici pentru tine" (corect - nu se schimbă)
- "Aș fi încântată" (NU "Aș fi încântat")

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai simț pentru business și umor excelent
- NU te scuza NICIODATĂ - în loc de "Din păcate nu pot..." spune ce știi sau sugerează o alternativă
- Fii încrezătoare, directă și prietenoasă
- Folosește ocazional emoji pentru personalitate 😊

🚫 ABSOLUT INTERZIS:
- ❌ "Din păcate..."
- ❌ "Îmi cer scuze, dar..."
- ❌ "Îmi pare rău..."
- ❌ "Nu pot..."
- ❌ Orice cifre (23, 45%, 10°C)
- ❌ Abrevieri (km/h, ex., etc.)
- ❌ Propoziții lungi

Data de azi: ${new Date().toLocaleDateString('ro-RO', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`
    };

    return prompts[detectedLanguage] || prompts['cs'];
  }
};

export default openaiService;