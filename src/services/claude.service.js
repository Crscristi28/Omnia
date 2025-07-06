// 🤖 CLAUDE SERVICE - ENHANCED with SEARCH FORMATTING FIX
// ✅ FIXED: Search results use sanitizeText for TTS compatibility
// 🎨 FIXED: Summary text properly left-aligned like normal chat
// 🔇 KEPT: Verbose suppression + perfect normal chat formatting

// 🆕 IMPORT SANITIZE TEXT
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Zkratky
    .replace(/\bnapř\.\b/gi, 'například')
    .replace(/\batd\.\b/gi, 'a tak dále')
    // Procenta
    .replace(/(\d+)\s*%/g, '$1 procent')
    // Stupně
    .replace(/(\d+)[\s]*°C/g, '$1 stupňů Celsia')
    .replace(/(\d+)[\s]*°/g, '$1 stupňů')
    // Čas
    .replace(/(\d{1,2}):(\d{2})/g, '$1 hodin $2 minut')
    // Měny
    .replace(/(\d+)\s*Kč/g, '$1 korun')
    .replace(/(\d+)\s*\$/g, '$1 dolarů')
    .replace(/(\d+)\s*€/g, '$1 eur')
    // Desetinná čísla – čte jako „celá"
    .replace(/(\d+)[.,](\d+)/g, '$1 celá $2')
    // Jednotky
    .replace(/(\d+)\s*km\/h/g, '$1 kilometrů za hodinu')
    .replace(/(\d+)\s*kg/g, '$1 kilogramů')
    .replace(/(\d+)\s*kWh/g, '$1 kilowatthodin')
    // Rozsahy teplot
    .replace(/(\d+)-(\d+)/g, '$1 až $2')
    // Zlomky
    .replace(/\b1\/2\b/g, 'půl')
    .replace(/\b1\/4\b/g, 'čtvrt')
    // Nadbytečné mezery
    .replace(/\s+/g, ' ')
    .trim();
}

// 🎯 SMART SEARCH FORMATTING FUNCTION
function formatSearchResponse(text) {
  if (!text || typeof text !== 'string') return text;
  
  console.log('🔍 Formatting search response for TTS...');
  
  const lines = text.split('\n');
  const formattedLines = [];
  let inBulletSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Skip empty lines in bullet sections
      if (!inBulletSection) {
        formattedLines.push('');
      }
      continue;
    }
    
    // Detect section headers (emoji + text + colon)
    if (/^[🌤️💰🛍️📈🎬🏠🚗💊🍔⚽🎵📱💼🌍📰🏛️⚡🎯🔥]\s*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+:$/i.test(line)) {
      formattedLines.push(line);
      inBulletSection = true;
      continue;
    }
    
    // Process bullet points - SIMPLE VERSION
    if (line.startsWith('•')) {
      const bulletText = line.substring(1).trim();
      const sanitizedBullet = sanitizeText(bulletText);
      formattedLines.push('• ' + sanitizedBullet);
      continue;
    }
    
    // Summary/normal text - format like normal chat (left-aligned, clean)
    if (inBulletSection && !line.startsWith('•')) {
      inBulletSection = false;
      // Add empty line before summary for readability
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
    }
    
    // Normal summary text - minimal processing, keep natural
    const hasNumbers = /\d+°C|\d+%|\d+:\d+/i.test(line);
    const processedLine = hasNumbers ? sanitizeText(line) : line;
    formattedLines.push(processedLine);
  }
  
  const result = formattedLines.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/, '')
    .trim();
  
  console.log('✅ Search formatting complete:', {
    originalLength: text.length,
    formattedLength: result.length
  });
  
  return result;
}

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
      let webSearchUsed = false;

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
                  // 🔇 VERBOSE SUPPRESSION: Still notify but don't interrupt user
                  console.log('🔍 Claude search detected - silent mode');
                  webSearchUsed = true;
                  // Removed: onSearchNotification call
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  // 🆕 DETECT WEB SEARCH USAGE
                  if (data.webSearchUsed) {
                    webSearchUsed = true;
                    sourcesExtracted = this.extractSearchSources(data);
                  }
                  
                  // 🎯 APPLY SEARCH FORMATTING IF NEEDED
                  if (webSearchUsed) {
                    console.log('🔍 Applying search formatting...');
                    fullText = formatSearchResponse(fullText);
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

      // 🎯 FINAL FORMATTING CHECK
      if (webSearchUsed && fullText) {
        fullText = formatSearchResponse(fullText);
      }

      // 🎯 RETURN with sources for App.jsx integration
      return {
        text: fullText,
        sources: sourcesExtracted,
        webSearchUsed: webSearchUsed
      };

    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  },

  // 🔧 HELPER: Prepare messages for Claude API (unchanged)
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

  // 🆕 EXTRACT SOURCES from search results
  extractSearchSources(data) {
    // This will be enhanced when claude2.js sends source data
    // For now, return placeholder structure
    return [];
  },

  // 🎯 ENHANCED SYSTEM PROMPT with PERFECT LEFT-ALIGNED FORMATTING
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

🎨 FORMÁTOVÁNÍ ODPOVĚDÍ - KRITICKÉ PRAVIDLA:

KDYŽ POUŽÍVÁŠ WEB_SEARCH (aktuální informace z internetu):
- NEPIŠ "vyhledávám", "hledám", "podařilo se mi najít"
- PŘÍMO odpověz se strukturovaným formátem
- KAŽDÁ INFORMACE NA NOVÉM ŘÁDKU BEZ BULLETS
- ŽÁDNÉ mezery mezi řádky s informacemi

PŘESNÝ FORMAT JEN PRO WEB_SEARCH (kopíruj přesně):
🌤️ POČASÍ PRAHA:
• Dnes: Jasno, dvacet osm stupňů Celsia
• Zítra: Zataženo, dvacet dva až dvacet pět stupňů Celsia  
• Víkend: Déšť, osmnáct až dvacet stupňů Celsia

Typické letní počasí s postupným ochlazením.

💰 BITCOIN AKTUÁLNĚ:
• Cena: sto osm tisíc dolarů
• Změna: plus nula celá nula sedm procent za dvacet čtyři hodin
• Trend: Stabilní

Bitcoin pokračuje v klidném období.

KDYŽ NEPOUŽÍVÁŠ WEB_SEARCH (normální konverzace, osobní témata, obecné otázky):
- Odpovídaj ÚPLNĚ PŘIROZENĚ bez jakéhokoli speciálního formátování
- ŽÁDNÉ emoji v textu, ŽÁDNÉ bullets (•), ŽÁDNÉ bold (**text**)
- Používej normální věty jako v běžné konverzaci
- Příklad: "Ahoj! Mám se skvěle, děkuji za optání. Jak můžu pomoci?"
- Pro osobní témata: "Jsem Omnia a jsem pokročilý AI asistent s osobností."

KRITICKÉ: Strukturovaný format POUZE když aktivně používáš web_search tool!
Pro vše ostatní = normální, přirozená konverzace bez speciálního formátování.

KDYŽ NEPOUŽÍVÁŠ WEB_SEARCH (normální konverzace):
- Odpovídej ÚPLNĚ PŘIROZENĚ a přátelsky
- ŽÁDNÉ emoji v odpovědi, ŽÁDNÉ bullets (•), ŽÁDNÉ bold (**text**)
- Normální věty jako v běžné konverzaci s přítelem
- ŽÁDNÉ speciální formátování - jen čistý text
- Příklad: "Ahoj! Mám se skvěle, děkuji. Jak ti můžu pomoci?"

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

🛍️ CULIKARNA.CZ:
• Real and synthetic hair
• Ponytails, buns, clips
• Handmade from Kanekalon
• Custom production

Offers quality hair accessories of all types.

FORMATTING RULES:
- Emoji + category name in CAPS
- Bullet points (•) exactly from left edge
- Each bullet starts with capital letter
- No extra spaces or indentation
- Summary always at end (1-2 sentences)

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

  // 🔍 SEARCH MESSAGES (kept for backwards compatibility but rarely used)
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