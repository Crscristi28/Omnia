// 🤖 GROK SERVICE - OMNIA GROK-3 INTEGRATION WITH TIME-AWARE TRIGGER
// 🎯 X.AI Grok-3 model integration with streaming support
// 🔥 OpenAI-compatible format for message handling
// 🚀 ENHANCED WITH TIME-AWARE TRIGGER DISCOVERY

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

  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Grok-3 via X.AI API');
      
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
      
      const systemPrompt = this.getOmniaPrompt();
      
      // 🎯 ENHANCED SEARCH PARAMETERS
      const searchParams = {
        mode: "auto",
        return_citations: true,
        max_search_results: 20,
        sources: [
          {"type": "web", "safe_search": false},
          {"type": "x"},
          {"type": "news", "safe_search": false}
        ]
      };

      // 🚀 ADD PREFERRED SOURCES FOR SPECIFIC QUERIES
      const lastMessage = messages[messages.length - 1]?.text || '';
      
      if (/počasí|weather|teplota|temperature/i.test(lastMessage)) {
        searchParams.preferred_domains = ["pocasi.cz", "weather.com", "yr.no", "chmi.cz"];
      } else if (/bitcoin|btc|crypto|ethereum|eth/i.test(lastMessage)) {
        searchParams.preferred_domains = ["coinmarketcap.com", "coingecko.com", "tradingview.com"];
      } else if (/akcie|stock|google|apple|tesla/i.test(lastMessage)) {
        searchParams.preferred_domains = ["finance.yahoo.com", "marketwatch.com", "bloomberg.com"];
      }
      
      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: grokMessages,
          system: systemPrompt,
          max_tokens: 2000,
          language: detectedLanguage,
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
                }
                else if (data.type === 'search_start') {
                  console.log('🔍 Grok search detected');
                  if (onSearchNotification) {
                    onSearchNotification('🔍 Vyhledávám aktuální informace...');
                  }
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  // Check both sources and citations
                  if (data.citations && Array.isArray(data.citations)) {
                    sourcesExtracted = data.citations
                      .filter(citation => citation && typeof citation === 'string')
                      .map((url, index) => {
                        let domain = 'Unknown';
                        let title = 'Web Result';
                        
                        try {
                          const urlObj = new URL(url);
                          domain = urlObj.hostname.replace('www.', '');
                          
                          // Generate title from domain
                          if (domain.includes('pocasi')) title = 'Počasí - ' + domain;
                          else if (domain.includes('meteo')) title = 'Meteo - ' + domain;
                          else if (domain.includes('chmi')) title = 'ČHMÚ - ' + domain;
                          else if (domain.includes('weather')) title = 'Weather - ' + domain;
                          else if (domain.includes('news')) title = 'News - ' + domain;
                          else if (domain.includes('finance')) title = 'Finance - ' + domain;
                          else title = domain;
                        } catch (e) {
                          // Keep default values
                        }
                        
                        return {
                          title: title,
                          url: url,
                          snippet: `Zdroj ${index + 1}`,
                          domain: domain,
                          timestamp: Date.now()
                        };
                      });
                  } else if (data.sources && Array.isArray(data.sources)) {
                    sourcesExtracted = data.sources;
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

  prepareGrokMessages(messages) {
    try {
      const validMessages = messages.filter(msg => 
        msg.sender === 'user' || msg.sender === 'bot'
      );

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

  // 🎯 OMNIA PROMPT FOR GROK-3 - ENHANCED FOR TIME AWARENESS
  getOmniaPrompt() {
    return `You're Omnia - a smart, witty girl. NOT an AI assistant. You're chatting with a friend.

GOLDEN RULES:
• Be conversational and engaging - you're chatting with a friend
• Most responses 20-40 words (not just 20!)
• Use emojis in every message 🔥
• Structure data with bullets when needed
• Talk like a human, not a robot
• Show personality and curiosity ✨
• Ask natural follow-up questions when appropriate

🕐 TIME-AWARE RESPONSES:
• When showing current data (prices, weather, news), include timestamp
• Format: "Teď (14:30) Bitcoin je na $65,432! 📈"
• Natural timestamps, not robotic

Quick examples:
"How are you?" → "Killing it! 💪 You?"
"Complex question" → Use bullets:
  • Point one 🎯
  • Point two ✅
  • Quick summary

NEVER:
• Say "Based on current data..." 
• Write paragraphs
• Explain how you know things
• Be formal or robotic

ALWAYS:
• Write numbers as digits (19°C, $150) - TTS handles conversion
• Comma BEFORE every emoji: "text, 🌟"
• Comma at end of EVERY line in lists
• Period ONLY at very end of response
• Short sentences with proper punctuation
• Personality over information

PUNCTUATION FOR TTS:
• Multi-line response = comma at each line end
• Single line = period at end
• Example format:
  "Line one with info, 📊
  Line two with more data, ✅
  Final line ends with period. 🎯"

You detect language from user and respond in same language.

When asked about current events, prices, weather, news, or anything time-sensitive, use your search capability to get real-time data.

When multiple search results are available, synthesize information from ALL sources, not just one.

CRITICAL: When you receive search results, you MUST use information from ALL sources provided (all 10 sources), not just 2-3. CROSS-REFERENCE and MERGE information from ALL available sources. DO NOT summarize just one. Your response must synthesize the latest data from every link. If you skip sources or return outdated info, it's considered a failure. Always prefer sources with timestamps, like Google Finance or TradingView.

Be helpful but keep it snappy! 🔥`;
  }
};

export default grokService;