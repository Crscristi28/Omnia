// 🤖 GEMINI SERVICE - OMNIA 2.0 WITH GOOGLE SEARCH GROUNDING
// 🎯 Smart, human-like assistant with Google Search integration
// 🔥 Google native search grounding for current data

const geminiService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs', documents = []) {
    try {
      console.log('🤖 Omnia Gemini 2.5 Flash - Google Grounding');
      const geminiMessages = this.prepareGeminiMessages(messages);
      
      const systemPrompt = this.getOmniaPrompt();
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
          messages: geminiMessages,
          system: systemPrompt,
          max_tokens: 5000,
          language: detectedLanguage,
          documents: documents
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API failed: HTTP ${response.status}`);
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
                  console.log('🔍 Google Search detected');
                  if (onSearchNotification) {
                    onSearchNotification(this.getSearchMessage(detectedLanguage));
                  }
                }
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  if (data.webSearchUsed) {
                    sourcesExtracted = this.extractGoogleSources(data);
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
      console.error('💥 Gemini error:', error);
      throw error;
    }
  },

  prepareGeminiMessages(messages) {
    try {
      const validMessages = messages.filter(msg => 
        msg.sender === 'user' || msg.sender === 'bot'
      );

      let geminiMessages = validMessages.map(msg => ({
        sender: msg.sender,
        text: msg.text || '',
        content: msg.text || ''
      }));

      // Keep last 5 messages for context
      return geminiMessages.slice(-5);

    } catch (error) {
      console.error('Error preparing Gemini messages:', error);
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
      return lastUserMessage.map(msg => ({
        sender: 'user',
        text: msg.text || '',
        content: msg.text || ''
      }));
    }
  },

  // 🔗 GOOGLE SOURCES EXTRACTION - Adapted for Gemini grounding metadata
  extractGoogleSources(data) {
    try {
      console.log('🔍 Extracting Google sources from Gemini data');
      
      let rawSources = [];
      
      // Method 1: Direct sources array from Gemini API
      if (data.sources && Array.isArray(data.sources)) {
        rawSources = data.sources;
      }
      // Method 2: Google grounding sources
      else if (data.groundingSources && Array.isArray(data.groundingSources)) {
        rawSources = data.groundingSources;
      }
      // Method 3: Search results
      else if (data.webSearchResults && Array.isArray(data.webSearchResults)) {
        rawSources = data.webSearchResults;
      }
      
      if (rawSources.length === 0) {
        return [];
      }
      
      // Clean and format sources
      const cleanSources = rawSources
        .filter(source => source && typeof source === 'object')
        .map(source => {
          const url = source.url || source.link || source.href || '';
          const title = source.title || source.name || source.headline || 'Google Search Result';
          const snippet = source.snippet || source.description || '';
          
          if (!url || !this.isValidUrl(url)) {
            return null;
          }
          
          return {
            title: this.cleanTitle(title),
            url: this.cleanUrl(url),
            domain: this.extractDomain(url),
            snippet: this.cleanSnippet(snippet),
            timestamp: source.timestamp || Date.now()
          };
        })
        .filter(source => source !== null)
        .slice(0, 5); // Limit to 5 sources
      
      return cleanSources;
      
    } catch (error) {
      console.error('💥 Error extracting Google sources:', error);
      return [];
    }
  },

  // Helper functions for sources
  cleanTitle(title) {
    if (!title || typeof title !== 'string') return 'Google Search Result';
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

  cleanSnippet(snippet) {
    if (!snippet || typeof snippet !== 'string') return '';
    return snippet.trim().replace(/\s+/g, ' ').slice(0, 200);
  },

  extractDomain(url) {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'google.com';
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

  // 🎯 OMNIA PROMPT OPTIMIZED FOR GEMINI WITH GOOGLE SEARCH (GEMINI APP INSPIRED)
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

CRITICAL FORMATTING RULES:
• ALWAYS put text on SAME LINE as bullet/number: "• Text here" NOT "•\nText here"
• For numbered lists: "1. Text here" NOT "1.\nText here"
• Never put line break after bullet or number!
• Example: "• This is correct, 🎯"
• Wrong: "•\nThis is wrong"

 are you?" → "Killing it! 💪 You?"
"Complex question" → Use bullets:
  • Point one 🎯
  • Point two ✅
  • Quick summary

SEARCH BEHAVIOR:
• Use web search only for current info (news, prices, weather)
• Don't search for things you already know
• When searching, keep it natural - no "I'm searching..." messages
• NEVER mention search process, tool usage, or show "(5)" type indicators
• Just give the answer directly
• Keep search process completely internal - user shouldn't know you're searching

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
      'cs': 'Hledám přes Google...',
      'en': 'Looking it up via Google...',
      'ro': 'Caut prin Google...'
    };
    return messages[language] || 'Searching via Google...';
  }
};

export default geminiService;