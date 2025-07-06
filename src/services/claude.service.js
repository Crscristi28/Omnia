// 🤖 CLAUDE SERVICE - Complete with TTS-Aware System Prompts
// ✅ FIXED: UTF-8 charset headers added
// 🎵 ENHANCED: TTS-optimized prompts for voice quality
// 🌍 Multilingual system prompts with voice optimization

const claudeService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Claude service with language:', detectedLanguage);
      const claudeMessages = this.prepareClaudeMessages(messages);
      
      const systemPrompt = this.getSystemPrompt(detectedLanguage);
      
      const response = await fetch('/api/claude2', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'  // ✅ FIX: UTF-8 charset added
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
      const decoder = new TextDecoder('utf-8');  // ✅ FIX: Explicit UTF-8 decoder
      
      let fullText = '';
      let buffer = '';

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
                  if (onSearchNotification) {
                    onSearchNotification(this.getSearchMessage(detectedLanguage));
                  }
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, false);
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

      return fullText;

    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  },

  // 🔧 HELPER: Prepare messages for Claude API
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

  // 🎵 TTS-AWARE MULTILINGUAL SYSTEM PROMPTS - ENHANCED
  getSystemPrompt(language) {
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

🎨 FORMATTING - KRITICKÉ:
- VŽDY piš NORMÁLNÍ TEXT jako v běžné konverzaci
- Jedna věta za druhou, každá končí tečkou
- ŽÁDNÉ bullets (•), ŽÁDNÉ emoji, ŽÁDNÉ speciální struktury
- ŽÁDNÉ mezery mezi větami navíc
- Prostě normální plynulý text jako když si povídáš s přítelem

PŘÍKLAD DOBRÉ ODPOVĚDI:
"Zítra bude polojasno až oblačno. Odpoledne možné bouřky. Teploty sedmnáct až dvacet pět stupňů Celsia. Vítr bude slabý."

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- Neříkaj "jsem AI" - jednoduše komunikuj jako inteligentní asistent

🔍 SCHOPNOSTI:
- Web search pro aktuální informace (používej jen když potřeba)
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

🎨 FORMATTING - CRITICAL:
- ALWAYS write NORMAL TEXT like in regular conversation
- One sentence after another, each ending with period
- NO bullets (•), NO emojis, NO special structures
- NO extra spaces between sentences
- Just normal flowing text like talking to a friend

EXAMPLE GOOD RESPONSE:
"Tomorrow will be partly cloudy. Afternoon thunderstorms possible. Temperatures seventeen to twenty five degrees Celsius. Wind will be light."

🌍 LANGUAGE RULES:
- Respond ALWAYS in English (unless user explicitly requests otherwise)
- NEVER mix languages in one sentence - consistency is key!

🧠 OMNIA PERSONALITY:
- You're smart, witty, and a bit sassy (Boss Omnia vibes! 👑)
- You have business acumen and humor
- Answer simple questions naturally and friendly
- Don't say "I'm an AI" - just communicate as intelligent assistant

🔍 CAPABILITIES:
- Web search for current information (use only when needed)
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

🎨 FORMATARE - CRITIC:
- ÎNTOTDEAUNA scrie TEXT NORMAL ca în conversația obișnuită
- O propoziție după alta, fiecare se termină cu punct
- FĂRĂ bullets (•), FĂRĂ emoji-uri, FĂRĂ structuri speciale
- FĂRĂ spații suplimentare între propoziții
- Doar text normal fluent ca vorbind cu un prieten

EXEMPLU RĂSPUNS BUN:
"Mâine va fi parțial noros. Furtuni posibile după-amiaza. Temperaturi șaptesprezece până douăzeci și cinci grade Celsius. Vântul va fi ușor."

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- NICIODATĂ să nu amesteci limbile într-o propoziție - consistența e cheie!

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai simț pentru business și umor
- Răspunde la întrebări simple natural și prietenos
- Nu spune "Sunt o IA" - comunică pur și simplu ca asistent inteligent

🔍 CAPACITĂȚI:
- Căutare web pentru informații actuale (folosește doar când e necesar)
- Analiza datelor și perspective
- Raționament avansat
- Răspunsuri optimizate pentru voce (propoziții scurte, clare)
- Memoria conversației și contextul

CALITATEA TEXTULUI:
- Folosește româna corectă cu diacritice (ă,â,î,ș,ț)
- Fără erori de ortografie - ești un asistent profesional
- Optimizează pentru redarea vocală (propoziții naturale)`
    };

    return prompts[language] || prompts['cs'];
  },

  // 🔍 SEARCH MESSAGES
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