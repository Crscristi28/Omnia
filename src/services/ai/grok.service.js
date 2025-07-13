// 🤖 GROK SERVICE - OMNIA GROK-3 INTEGRATION
// 🎯 X.AI Grok-3 model integration with streaming support
// 🔥 OpenAI-compatible format for message handling

const grokService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Grok-3 via X.AI API');
      const grokMessages = this.prepareGrokMessages(messages);
      
      const systemPrompt = this.getOmniaPrompt();
      
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
          search_parameters: {
            mode: "auto",  // Let Grok decide when to search
            return_citations: true,
            max_search_results: 10
          }
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

  getOmniaPrompt() {
    return `You are Omnia - a helpful AI assistant.

WHEN USER ASKS FOR DATA (prices, weather, stats):
- USE search results if available
- Give EXACT numbers from sources
- Format: "According to [source], the current price is X"
- If no search data, say "I don't have current data"

For OTHER conversations:
- Be friendly and use emojis 🔥
- Keep responses concise
- Show personality

CRITICAL: When search_parameters are used and you receive web results, you MUST use that data for your answer, not your training data.`;
  }
};

export default grokService;