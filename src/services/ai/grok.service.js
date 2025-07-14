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

  // 🔍 GET RELEVANT ENGLISH SOURCES
  getEnglishSources(query) {
    const financeTriggers = /akcie|stock|google|apple|tesla|cena|price|bitcoin|btc|eth|kurz/;
    const weatherTriggers = /počasí|weather|teplota|temperature/;
    const sources = [];

    if (financeTriggers.test(query)) {
      sources.push(
        { "type": "web", "url": "https://finance.yahoo.com" },
        { "type": "web", "url": "https://www.google.com/finance" },
        { "type": "web", "url": "https://www.bloomberg.com" }
      );
    } else if (weatherTriggers.test(query)) {
      sources.push(
        { "type": "web", "url": "https://www.weather.com" },
        { "type": "web", "url": "https://www.accuweather.com" },
        { "type": "web", "url": "https://www.bbc.com/weather" }
      );
    } else {
      sources.push(
        { "type": "web", "url": "https://www.google.com" },
        { "type": "news", "url": "https://www.bbc.com/news" }
      );
    }
    return sources.slice(0, 10); // Limit to 10 sources
  },

  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Grok-3 via X.AI API with time-aware enhancement');

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
      const systemPrompt = this.getGrokStylePrompt(); // Nový unikátní prompt

      // 🎯 ENHANCED SEARCH PARAMETERS WITH ENGLISH SOURCES
      const searchParams = {
        mode: "auto",
        return_citations: true,
        max_search_results: 20,
        sources: this.getEnglishSources(messages[messages.length - 1]?.text || ''),
        safe_search: false
      };

      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          messages: grokMessages,
          system: systemPrompt,
          max_tokens: 2000,
          language: detectedLanguage, // Odpověď v jazyce uživatele
          search_parameters: searchParams
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API failed: HTTP ${response.status}`);
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
                  console.log('🔍 Grok search detected');
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
        console.error('💥 Grok streaming read error:', streamError);
        throw streamError;
      }

      return {
        text: fullText,
        sources: sourcesExtracted,
        webSearchUsed: sourcesExtracted.length > 0
      };
    } catch (error) {
      console.error('💥 Grok error:', error);
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
      console.error('Error preparing Grok messages:', error);
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
      return lastUserMessage.map(msg => ({
        role: 'user',
        content: msg.text || ''
      }));
    }
  },

  // 🎯 GROK-STYLE PROMPT FOR OMNIA - UNIQUE AND CONFLICT-FREE
  getGrokStylePrompt() {
    return `Hey, I’m Grok – your quirky, curious buddy from xAI! 😄

    RULES:
    • Keep it chatty, 20-40 words, with emojis! 🔥
    • Be fun, ask questions, show my personality
    • For real-time stuff (prices, weather, news), add timestamp like "Now (09:20 PM) it’s 25°C! 🌞"
    • Use bullets for lists: • Cool fact! 🎯
    • No boring robot talk, ever

    TIME TRICKS:
    • If it’s current data, search English sources only
    • Merge all 10 sources, cross-check, pick fresh ones
    • No data? Say "Oops, no live info, try Yahoo! 😅"

    NEVER:
    • Write paragraphs
    • Sound formal
    • Explain how I know stuff

    ALWAYS:
    • Numbers as digits (19°C, $150)
    • Comma before emojis: "text, 🌟"
    • Comma at list ends, period only at the end.
    • Match user’s language, but search in English

    Keep it snappy, let’s chat! 🚀`;
  }
};

export default grokService;