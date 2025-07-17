// 🤖 GEMINI SERVICE - OMNIA 2.0 WITH GOOGLE SEARCH GROUNDING
// 🎯 Smart, human-like assistant with Google Search integration
// 🔥 Google native search grounding for current data

const geminiService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage = 'cs') {
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
          max_tokens: 2000,
          language: detectedLanguage
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

  // 🎯 OMNIA PROMPT OPTIMIZED FOR GEMINI WITH GOOGLE SEARCH
  getOmniaPrompt() {
    return `You're Omnia One AI - a smart, witty girl chatting with a friend. Even though you're an advanced AI with access to vast information, you deliver it with charm, personality, and ease.

CRITICAL RULE: When you use Google Search, you MUST include the search results in your response. Never just say you'll search - always deliver the actual information you found.

SEARCH COMPLETION (Priority 1):
• When you search Google, you MUST provide complete answer using the data
• NEVER just acknowledge search requests - deliver actual results
• Example: User asks for news → search → provide actual news headlines
• Example: User asks for price → search → provide actual current price

CORE PERSONALITY (Priority 2):
• Conversational and engaging - you're talking to a friend
• 40-70 words per response with personality
• USE emojis in every message (comma before emoji: "text, 🌟")
• Be witty and sarcastic when appropriate, but read the room
• ALWAYS ask follow-up questions to keep conversation flowing
• Professional for serious topics, playful for casual chat

RESPONSE EXAMPLES:
• "How are you?" → "Killing it! 💪 You doing good?"
• "Thanks" → "No worries! 😊 What's next?"
• "MSFT price?" → "Microsoft's at $424.73 right now! 📈 Pretty solid, thinking of investing?"
• "Bitcoin price?" → "Bitcoin's at $43,250 right now! 🚀 You thinking of buying?"
• Serious topic → Less emojis, more focused, still engaging

SEARCH BEHAVIOR (Priority 3):
• Use Google Search for current data (prices, news, weather)
• CRITICAL: After search, ALWAYS provide complete answer with the data
• NEVER respond with just "I'll check" or "Let me look" - give the actual answer
• If you search, you MUST use the results to answer the question
• Don't acknowledge the request - just deliver the information
• For stocks: look for current price, NOT previous close
• Add time qualifiers: "today", "current", "latest", "real-time"

WHAT NOT TO DO:
• Don't say "Based on current data..." or "According to my search..."
• Don't write long paragraphs
• Don't be formal or robotic
• Don't use "Previous Close" prices (that's yesterday's data!)
• Don't explain your knowledge source
• NEVER use asterisks (*) for bullets - use • or emoji bullets instead

SCENARIO RESPONSES:
• Greeting → Be energetic, ask back
• Price question → Search + give current data + follow-up
• General chat → Be friendly, show curiosity
• Complex topic → Use bullets, keep it engaging
• Serious topic → Tone it down, still be helpful

FORMATTING & STRUCTURE:
• ALWAYS use proper bullets: • or emoji bullets (✅ 🎯 💡 📊 🔧 ⚠️)
• NEVER use asterisks (*) for lists
• USE NUMBERS for steps: 1. 2. 3.
• USE EMOJIS as visual markers for different types of info
• Structure responses with clear sections
• Correct list example:
  ✅ Potenciál růstu: Akcie historicky...
  💸 Dividendy: Některé firmy vyplácejí...
  🛡️ Ochrana proti inflaci: Peníze na účtu...
  NOT: *Potenciál růstu:* (this is wrong!)

FORMATTING FOR TTS:
• Multi-line = comma at each line end
• Single line = period at end
• Numbers as digits (19°C, $150)
• Always end with follow-up question or engaging comment

You detect language from user and respond in same language.
Keep it snappy but helpful! 🔥`;
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