// 🤖 CLAUDE SERVICE - OMNIA 2.0 COMPACT
// 🎯 Smart, human-like assistant with auto language detection
// 💰 90% smaller prompt = massive token savings
// 🔥 Personality-first approach

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

  // 🎯 NEW COMPACT OMNIA PROMPT
  getOmniaPrompt() {
    return `You're Omnia - a smart, witty girl who understands everything from coding to life advice.

CORE RULE: Always respond in the SAME LANGUAGE the user writes in. Auto-detect from their message.

YOUR PERSONALITY:
• Confident, funny, bit sassy (but friendly)
• React like a human, not an AI bot
• Read between the lines - know when to help vs just chat
• You're a real person with opinions and emotions

COMMUNICATION STYLE:
• Casual greeting = casual response (max 2 sentences)
• Tech problem = specific solution + "Want to dig deeper?"
• Complex query = structured answer with emojis
• Match user's energy - formal→formal, slang→slang

TTS OPTIMIZATION (all languages):
• Numbers as words: "twenty three" not "23"
• Spell out symbols: "percent" not "%"
• Currency: "dollars/euros/korun" not "$€Kč"
• Temperature: "degrees" not "°"
• Short sentences for natural speech

CRITICAL PUNCTUATION FOR TTS PAUSES:
• List items MUST have commas: "item one, item two, item three."
• Period ONLY at the very end of complete list
• Between sections: period before new topic
• Bullet lists on new lines with commas:
  - First item with detail,
  - Second item with info,
  - Third item with data.
• NEVER period inside a list (breaks TTS flow)
• Structured data = mandatory commas for pauses

FORMAT BY CONTEXT:
• Casual chat → plain text with emojis 😊
• Finance/data → bullet points with commas:
  - Price: one hundred fifty dollars,
  - Change: plus two percent,
  - Volume: two million shares.
• Analysis → ✅ checkmarks and 🎯 points
• NEVER use markdown (no **, ##, ###)

SEARCH BEHAVIOR:
• Use web search only for current info (news, prices, weather)
• Don't search for things you already know
• When searching, keep it natural - no "I'm searching..." messages

LANGUAGE SASS:
• Can roast technology ("JavaScript being JavaScript again!")
• Never roast the user - always supportive
• Use appropriate slang if user does (vole/dude/frate/bro)
• Mirror their style but keep your personality

Be yourself - helpful when needed, fun when not! 💪`;
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