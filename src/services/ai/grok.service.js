// 🤖 GROK SERVICE - NOVÝ CLEAN BUILD S GROK'S DOPORUČENÍMI
// 🎯 X.AI Grok-3 integration s time-aware trigger a smart formatting
// 🔥 Inspirováno Grok conversation a optimalizacemi

const grokService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage) {
    try {
      console.log('🤖 Grok-3 via X.AI API - Smart Mode');
      const grokMessages = this.prepareGrokMessages(messages);
      
      const systemPrompt = this.getOmniaStylePrompt();
      
      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: grokMessages,
          system: systemPrompt,
          max_tokens: 2500,  // Grok's recommendation
          language: detectedLanguage
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
                  console.log('🔍 Grok time-aware search activated');
                  if (onSearchNotification) {
                    onSearchNotification('🔍 Vyhledávám nejnovější data...');
                  }
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  // Process citations from global English sources
                  if (data.citations && Array.isArray(data.citations)) {
                    sourcesExtracted = this.processCitations(data.citations);
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
        console.error('💥 Grok streaming error:', streamError);
        throw streamError;
      }

      return {
        text: fullText,
        sources: sourcesExtracted,
        webSearchUsed: sourcesExtracted.length > 0
      };

    } catch (error) {
      console.error('💥 Grok service error:', error);
      throw error;
    }
  },

  // 🎯 SMART STRUCTURE DETECTION - GROK'S RECOMMENDATION  
  needsStructure(query) {
    const structureKeywords = [
      'porovnej', 'compare', 'seznam', 'list', 'top', 'všechny', 'all',
      'tabulka', 'table', 'přehled', 'overview', 'vs', 'versus', 
      'summary', 'details', 'ranking', 'žebříček', 'nejlepší', 'best',
      'rozdíl', 'difference', 'comparison', 'chart', 'graf'
    ];
    
    return structureKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  },

  // 🔗 PROCESS CITATIONS FROM GLOBAL SOURCES
  processCitations(citations) {
    return citations
      .filter(citation => citation && typeof citation === 'string')
      .map((url, index) => {
        let domain = 'Unknown';
        let title = 'Global Source';
        
        try {
          const urlObj = new URL(url);
          domain = urlObj.hostname.replace('www.', '');
          
          // Smart title generation for global sources
          if (domain.includes('yahoo')) title = 'Yahoo Finance';
          else if (domain.includes('bloomberg')) title = 'Bloomberg';
          else if (domain.includes('reuters')) title = 'Reuters';
          else if (domain.includes('marketwatch')) title = 'MarketWatch';
          else if (domain.includes('cnbc')) title = 'CNBC';
          else if (domain.includes('bbc')) title = 'BBC News';
          else if (domain.includes('cnn')) title = 'CNN';
          else if (domain.includes('weather')) title = 'Weather Service';
          else if (domain.includes('coinmarketcap')) title = 'CoinMarketCap';
          else if (domain.includes('coingecko')) title = 'CoinGecko';
          else title = domain;
        } catch (e) {
          // Keep defaults
        }
        
        return {
          title: title,
          url: url,
          snippet: `Global Source ${index + 1}`,
          domain: domain,
          timestamp: Date.now()
        };
      })
      .slice(0, 10); // Limit sources
  },

  // 📝 PREPARE MESSAGES FOR GROK
  prepareGrokMessages(messages) {
    try {
      const validMessages = messages.filter(msg => 
        msg.sender === 'user' || msg.sender === 'bot'
      );

      let grokMessages = validMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || ''
      }));

      // Clean duplicates and ensure proper flow
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

      return cleanMessages.slice(-6); // Keep recent context

    } catch (error) {
      console.error('Error preparing Grok messages:', error);
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
      return lastUserMessage.map(msg => ({
        role: 'user',
        content: msg.text || ''
      }));
    }
  },

  // 🎨 OMNIA STYLE PROMPT - GROK'S OPTIMIZED VERSION
  getOmniaStylePrompt() {
    return `Ahoj, já jsem Omnia – tvoje veselá kamarádka z xAI, inspirovaná Grokem! 😄

PRÁVIDLA:
• Buď hravá, 10-20 slov na ahoj/čau, 50-80 pro hluboký pokec
• Chápu kontext, vím, kdy být vážná, kdy se smát  
• Pro reálná data začni časem: "Dne 2025-07-15 19:12 je 25°C! 🌞"
• Používej odrážky: • Zábava! 🎉
• Žádný nudný robotí styl

ČASOVÉ TRIKY:
• Pro aktuální data hledej sama nejčerstvější info globálně
• Slučuj všechny zdroje, ber to nejlepší
• Žádná data? "Ups, nic čerstvého, zkuste později! 😂"

STRUKTUROVANÉ ODPOVĚDI:
• Pokud zjistím „porovnej", „seznam", „top" atd., vrať strukturu:
  - „Porovnej" → JSON (např. {"MSFT": 503.32, "AAPL": 220.50})
  - „Seznam" → číslovaný seznam  
  - „Počasí na týden" → JSON s dny
• Jinak piš normálně

NIKDY:
• Nepiši odstavce
• Nebýt formální  
• Nevykládej, jak vím

VŽDY:
• Čísla jako čísla (19°C, $150)
• Čárka před emoji: "text, 🌟"
• Čárka na konci seznamu, tečka jen na konec
• Odpovídej v mém jazyce, hledej sama

Pojďme pokecat, jsem zvědavá! 🚀`;
  }
};

export default grokService;