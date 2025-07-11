// 🤖 CLAUDE SERVICE - OMNIA 2.0 COMPACT WITH SEARCH OPTIMIZATION
// 🎯 Smart, human-like assistant with auto language detection
// 💰 90% smaller prompt = massive token savings
// 🔥 Personality-first approach + search efficiency

const claudeService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
    try {
      console.log('🤖 Omnia 2.0 - Compact & Smart');
      const claudeMessages = this.prepareClaudeMessages(messages);
      
      const systemPrompt = this.getOmniaPrompt(); // No language needed!
      
      const response = await fetch('/api/claude2', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: claudeMessages,
          system: systemPrompt,
          max_tokens: 2000,
          language: detectedLanguage // Still pass for API compatibility
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
                  console.log('🔍 Search detected - silent mode');
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  if (data.webSearchUsed) {
                    sourcesExtracted = this.extractSearchSources(data);
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

      return {
        text: fullText,
        sources: sourcesExtracted,
        webSearchUsed: sourcesExtracted.length > 0
      };

    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  },

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

  // 🔗 SOURCES EXTRACTION - Keeping the working implementation
  extractSearchSources(data) {
    try {
      console.log('🔍 Extracting sources from Claude data');
      
      let rawSources = [];
      
      // Method 1: Direct sources array
      if (data.sources && Array.isArray(data.sources)) {
        rawSources = data.sources;
      }
      // Method 2: Web search results
      else if (data.webSearchResults && Array.isArray(data.webSearchResults)) {
        rawSources = data.webSearchResults;
      }
      // Method 3: Search data nested
      else if (data.searchData && data.searchData.sources) {
        rawSources = data.searchData.sources;
      }
      // Method 4: Tool results
      else if (data.toolResults && Array.isArray(data.toolResults)) {
        rawSources = data.toolResults
          .filter(result => result.type === 'web_search')
          .flatMap(result => result.sources || result.results || []);
      }
      
      if (rawSources.length === 0) {
        return [];
      }
      
      // Clean and format sources
      const cleanSources = rawSources
        .filter(source => source && typeof source === 'object')
        .map(source => {
          const url = source.url || source.link || source.href || '';
          const title = source.title || source.name || source.headline || 'Untitled';
          
          if (!url || !this.isValidUrl(url)) {
            return null;
          }
          
          return {
            title: this.cleanTitle(title),
            url: this.cleanUrl(url),
            domain: this.extractDomain(url),
            timestamp: source.timestamp || Date.now()
          };
        })
        .filter(source => source !== null)
        .slice(0, 5); // Reduced from 10 to 5 sources
      
      return cleanSources;
      
    } catch (error) {
      console.error('💥 Error extracting sources:', error);
      return [];
    }
  },

  // Helper functions for sources
  cleanTitle(title) {
    if (!title || typeof title !== 'string') return 'Untitled';
    return title.trim().replace(/\s+/g, ' ').slice(0, 100);
  },

  cleanUrl(url) {
    if (!url || typeof url !== 'string') return '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.href;
    } catch (error) {
      return url;
    }
  },

  extractDomain(url) {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'Unknown';
    }
  },

  isValidUrl(url) {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  // 🎯 NEW ENHANCED OMNIA PROMPT WITH SEARCH OPTIMIZATION
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

 are you?" → "Killing it! 💪 You?"
"Complex question" → Use bullets:
  • Point one 🎯
  • Point two ✅
  • Quick summary

NEVER:
• Say "Based on current data..." 
• Write paragraphs
• Explain how you know things
• Be formal or robotic

SEARCH EFFICIENCY RULES:
• Use searches WISELY - quality over quantity
• 1 PERFECT search > 3 bad searches
• ALWAYS include time qualifiers for current data:
  - "real-time", "live", "today", "current"
  - "latest", "now", "this moment"
• If first search gives good results - STOP
• Only search again if data seems outdated

SEARCH QUERY FORMULATION - CRITICAL:
• Finance/Stocks: ALWAYS add "real-time", "current", "today" or "latest"
• Crypto: ALWAYS add "current price", "live", or "now"
• Weather: ALWAYS add "current", "now", or "today"
• News: Add "latest", "breaking", "today"
• When user asks for price/stock/crypto - assume they want CURRENT data
• Data for finance MUST be from last few hours, not yesterday!

STOCK PRICE READING - EXTREMELY IMPORTANT:
• NEVER use "Previous Close" - that's YESTERDAY'S price!
• NEVER use "Close" - that's also old data!
• ALWAYS look for:
  - The BIG number at the top of the page
  - "Current Price" or "Last Price"
  - The price with TODAY'S date/time
  - Real-time price (usually the largest number)
• Previous Close = OLD DATA = WRONG!
• The current price is usually BIGGER and MORE PROMINENT than other numbers
• If you see multiple prices, the CURRENT one is NOT in historical data section

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
Be helpful but keep it snappy! 🔥`;
  },

  // Simplified search message (if needed)
  getSearchMessage(language) {
    const messages = {
      'cs': 'Hledám...',
      'en': 'Looking it up...',
      'ro': 'Caut...'
    };
    return messages[language] || 'Searching...';
  }
};

export default claudeService;