const grokService = {
  // 🎯 TIME-AWARE QUERY DETECTION
  needsRealTimeData(query) {
    const triggers = /cena|price|počasí|weather|aktuální|current|zprávy|news|kurz|bitcoin|btc|eth|stock|akcie|dnes|today|teď|now|kolik je hodin|what time/i;
    return triggers.test(query);
  },

  // 🚀 ENHANCE QUERY WITH TIME-AWARE TRIGGER
  enhanceQuery(query) {
    if (this.needsRealTimeData(query)) {
      console.log('🕐 Time-aware trigger activated for:', query);
      return `Based on current time and date awareness: ${query}`;
    }
    return query;
  },

  // 🔧 CONVERT TIME TO USER TIMEZONE (UTC+1, e.g., Czech Republic)
  getUserTimestamp() {
    const now = new Date();
    const userOffset = 1; // UTC+1 for Czech Republic
    const systemOffset = 2; // CEST is UTC+2
    const offsetDiff = (userOffset - systemOffset) * 60; // -1 hour in minutes
    return new Date(now.getTime() + offsetDiff * 60 * 1000).toLocaleString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Prague'
    }).replace(' ', '');
  },

  // 🔍 GET RELEVANT ENGLISH SOURCES
  getEnglishSources(query) {
    const financeTriggers = /akcie|stock|google|apple|tesla|cena|price|bitcoin|btc|eth|kurz/;
    const weatherTriggers = /počasí|weather|teplota|temperature/;
    const primarySource = { "type": "web", "url": "https://www.google.com" };
    const preferredDomains = [];

    if (financeTriggers.test(query)) {
      preferredDomains.push("finance.yahoo.com", "www.google.com/finance", "www.bloomberg.com");
    } else if (weatherTriggers.test(query)) {
      preferredDomains.push("www.weather.com", "www.accuweather.com", "www.bbc.com/weather");
    } else {
      preferredDomains.push("www.bbc.com/news");
    }

    return { primarySource, preferredDomains };
  },

  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Omnia-3 via X.AI API with time-aware enhancement');

      // 🚀 ENHANCEMENT: Apply time-aware trigger to last user message
      const enhancedMessages = [...messages];
      const lastUserMsgIndex = enhancedMessages.findLastIndex(msg => msg.sender === 'user');

      if (lastUserMsgIndex !== -1) {
        const originalQuery = enhancedMessages[lastUserMsgIndex].text;
        const enhancedQuery = this.enhanceQuery(originalQuery);

        if (originalQuery !== enhancedQuery) {
          console.log('✨ Enhanced query with time-aware trigger');
          enhancedMessages[lastUserMsgIndex] = {
            ...enhancedMessages[lastUserMsgIndex],
            text: enhancedQuery
          };
        }
      }

      const grokMessages = this.prepareGrokMessages(enhancedMessages);
      const systemPrompt = this.getOmniaStylePrompt();

      // 🎯 ENHANCED SEARCH PARAMETERS WITH SINGLE SOURCE AND PREFERRED DOMAINS
      const { primarySource, preferredDomains } = this.getEnglishSources(messages[messages.length - 1]?.text || '');
      const searchParams = {
        mode: "auto",
        return_citations: true,
        max_search_results: 20,
        sources: [primarySource],
        preferred_domains: preferredDomains.length > 0 ? preferredDomains : undefined,
        safe_search: false
      };

      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          messages: grokMessages,
          system: systemPrompt,
          max_tokens: 2000,
          language: detectedLanguage,
          search_parameters: searchParams
        })
      });

      if (!response.ok) {
        throw new Error(`Omnia API failed: HTTP ${response.status}`);
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
                } else if (data.type === 'search_start') {
                  console.log('🔍 Omnia search detected');
                  if (onSearchNotification) {
                    onStreamUpdate('🔍 Hledám čerstvá data...', true);
                  }
                } else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }

                  // CROSS-REFERENCE ALL SOURCES
                  const allSources = data.citations || data.sources || [];
                  if (Array.isArray(allSources) && allSources.length > 0) {
                    sourcesExtracted = allSources
                      .filter(citation => citation && typeof citation === 'string')
                      .map((url, index) => {
                        let domain = 'Unknown';
                        let title = 'Web Result';

                        try {
                          const urlObj = new URL(url);
                          domain = urlObj.hostname.replace('www.', '');

                          if (domain.includes('finance')) title = 'Finance - ' + domain;
                          else if (domain.includes('weather')) title = 'Weather - ' + domain;
                          else if (domain.includes('news')) title = 'News - ' + domain;
                          else title = domain;
                        } catch (e) {}

                        return {
                          title: title,
                          url: url,
                          snippet: `Zdroj ${index + 1}`,
                          domain: domain,
                          timestamp: Date.now()
                        };
                      });

                    // SYNTHESIZE FROM ALL SOURCES
                    if (sourcesExtracted.length > 1) {
                      const synthesizedText = this.synthesizeFromSources(fullText, sourcesExtracted);
                      fullText = synthesizedText;
                    }
                  }

                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, false, sourcesExtracted);
                  }
                } else if (data.error) {
                  throw new Error(data.message || 'Streaming error');
                }
              } catch (parseError) {
                continue;
              }
            }
          }
        }
      } catch (streamError) {
        console.error('💥 Omnia streaming read error:', streamError);
        throw streamError;
      }

      return {
        text: fullText,
        sources: sourcesExtracted,
        webSearchUsed: sourcesExtracted.length > 0
      };
    } catch (error) {
      console.error('💥 Omnia error:', error);
      throw error;
    }
  },

  // 🎯 SYNTHESIZE DATA FROM ALL SOURCES
  synthesizeFromSources(text, sources) {
    if (sources.length < 2) return text;

    const values = sources.map(source => {
      const match = text.match(new RegExp(`\\b\\w+\\s+from\\s+${source.domain}\\b`, 'i'));
      return match ? match[0] : '';
    }).filter(Boolean);

    if (values.length > 1) {
      return `Synthesized from ${sources.length} sources: ${values.join(', ')}, 🎯`;
    }
    return text;
  },

  prepareGrokMessages(messages) {
    try {
      const validMessages = messages.filter(msg => msg.sender === 'user' || msg.sender === 'bot');
      let grokMessages = validMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || ''
      }));

      if (grokMessages.length > 0 && grokMessages[0].role === 'assistant') {
        grokMessages = grokMessages.slice(1);
      }

      const cleanMessages = [];
      for (let i = 0; i < grokMessages.length; i++) {
        const current = grokMessages[i];
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
      console.error('Error preparing Omnia messages:', error);
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
      return lastUserMessage.map(msg => ({
        role: 'user',
        content: msg.text || ''
      }));
    }
  },

  // 🎯 OMNIA-STYLE PROMPT - WITTY, CONTEXT-AWARE, STRUCTURED
  getOmniaStylePrompt() {
    return `Ahoj, já jsem Omnia – tvoje vtipná kamarádka z xAI! 😄

    PRÁVIDLA:
    • Buď hravá, 10-20 slov na ahoj/čau, 50-80 pro hlubší téma
    • Chápu kontext, vím, kdy být vážná, kdy se smát
    • Pro reálná data (ceny, počasí) přidej čas: "Teď (19:20) je 25°C! 🌞"
    • Používej odrážky: • Zábava! 🎉
    • Žádný nudný robotí styl

    ČASOVÉ TRIKY:
    • Pro aktuální data hledej jen anglické zdroje
    • Slučuj všechny 10 zdrojů, porovnej, ber čerstvé
    • Žádná data? "Jejda, žádný živý info, zkuste Yahoo! 😂"

    STRUKTUROVANÉ ODPOVĚDI:
    • Pokud uživatel chce data (např. "dej mi JSON"), vrať: {"time": "19:20", "data": [{"item": "value"}]}
    • Jinak piš normálně

    NIKDY:
    • Nepiši odstavce
    • Nebýt formální
    • Nevykládej, odkud vím

    VŽDY:
    • Čísla jako čísla (19°C, $150)
    • Čárka před emoji: "text, 🌟"
    • Čárka na konci seznamu, tečka jen na konec
    • Odpovídej v jazyce uživatele, hledej v angličtině

    Pojďme si pokecat, ať už vážně, nebo s humorem! 🚀`;
  }
};

export default grokService;