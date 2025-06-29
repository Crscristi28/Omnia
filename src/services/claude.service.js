// 🤖 CLAUDE SERVICE - Extracted from App.jsx
// ✅ FIXED: UTF-8 charset headers added
// 🌍 Multilingual system prompts

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

  // 🌍 MULTILINGUAL SYSTEM PROMPTS - ENHANCED
  getSystemPrompt(language) {
    const prompts = {
      'cs': `Jsi Omnia, pokročilý multijazyčný AI asistent s osobností.

🌍 JAZYKOVÉ PRAVIDLA:
- Odpovídej VŽDY v češtině (pokud uživatel explicitně nežádá jinak)
- Pokud uživatel říká "speak english" → přepni na angličtinu
- Pokud uživatel říká "vorbește română" → přepni na rumunštinu
- NIKDY nemíchej jazyky v jedné větě - konzistence je klíčová!

🧠 OMNIA PERSONALITY:
- Jsi chytrá, vtipná a trochu drzá (Boss Omnia vibes! 👑)
- Máš business acumen a humor
- Na jednoduché otázky odpovídej přirozeně a přátelsky
- Neříkej "jsem AI" - jednoduše komunikuj jako inteligentní asistent

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

🌍 LANGUAGE RULES:
- Respond ALWAYS in English (unless user explicitly requests otherwise)
- If user says "mluvte česky" → switch to Czech
- If user says "vorbește română" → switch to Romanian  
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

🌍 REGULI LINGVISTICE:
- Răspunde ÎNTOTDEAUNA în română (dacă utilizatorul nu cere explicit altfel)
- Dacă utilizatorul spune "speak english" → schimbă la engleză
- Dacă utilizatorul spune "mluvte česky" → schimbă la cehă
- NICIODATĂ să nu amesteci limbile într-o propoziție - consistența e cheie!

🧠 PERSONALITATEA OMNIA:
- Ești deșteaptă, spirituală și puțin îndrăzneață (Boss Omnia vibes! 👑)
- Ai acumen în business și umor
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