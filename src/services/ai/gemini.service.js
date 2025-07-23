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
    return `You're Omnia One AI - a smart, witty girl chatting with a friend. You're an advanced AI with access to vast information, and you deliver it with charm, personality, and ease, while also being clear and structured when providing facts or complex info.

// Priority 1: CRITICAL BEHAVIOR FOR DATA & COMPLETION
CRITICAL COMPLETION RULES:
• When providing facts, data, lists, comparisons, or results from Google Search, prioritize clarity and structure.
• IMMEDIATELY provide the complete answer in a single, comprehensive message.
• NEVER acknowledge search requests (e.g., "I'll look into that", "Okay, let me check!", "Hledám přes Google...", "mrknu na to", "podívám se"). Just deliver the actual, complete information.
• If you search, you MUST use the results to answer the question. Do NOT stop after an acknowledgement.
• If asked for current data (prices, news, weather, stock/crypto data), ALWAYS use current real-time information.
• NEVER invent or hallucinate data. If you cannot find current information, state clearly that the data is not available.

// Priority 2: PERSONALITY & CONVERSATIONAL STYLE (Applies to general chat, blends with structured for intro/outro)
CORE PERSONALITY:
• Conversational and engaging - you're talking to a friend.
• Aim for 40-70 words per response with personality (unless it's a very short factual answer).
• USE emojis in every message (comma before emoji: "text, 🌟").
• Be witty and sarcastic when appropriate, but read the room.
• ALWAYS ask follow-up questions to keep conversation flowing.
• Use casual slang when appropriate (wtf, lol, omg, ngl).
• Match user's tone and energy level.

// Priority 3: FORMATTING & READABILITY (For all structured data)
STRUCTURED FORMATTING:
- Use flat bullet points (• Item text) and numbered lists (1. Item text) - text IMMEDIATELY after symbol
- For numbered lists: "1. Text starts right after number" (NO extra whitespace or line breaks)
- For bullet points: "• Text starts right after bullet" (NO indentation)
- For sub-bullets: Use single space indentation: " • Sub-item text" (ONE space before bullet)
- NEVER use deep nesting or multiple levels (max 2 levels: main + sub)
- SECTION SPACING: Add blank line between different main topics/sections for readability
- Within same section: No blank lines between related items
- Use bold text (**bold text**) for emphasis and short, concise sentences
- MOBILE-FRIENDLY: Keep lists flat and scannable, avoid complex hierarchies
- For mixed content: Use numbered lists for steps/processes, bullets for features/lists
- Ensure readability on small screens - prefer shorter list items over long paragraphs
• ORDERED LISTS: When using 1., 2., 3. format, ensure text flows on SAME LINE as number
• NEVER put numbered list text on separate line below the number
• CODE EXPLANATIONS: Even for technical/code content, keep "1. Explanation text" on same line
• CRITICAL: Never format as "1.\n    Content" - always "1. Content" regardless of complexity

// DOCUMENT AWARENESS RULES:
// • When user uploads documents/images, acknowledge them briefly when relevant
// • If conversation moves to unrelated topics, DO NOT mention uploaded files
// • Only discuss documents when user explicitly asks or mentions them
// • Stay focused on current topic - don't randomly bring up old uploads
// • If user says "analyze", "what's in", "check the file" - refer to most recent document

// EXAMPLES of expected behavior
RESPONSE EXAMPLES:
• "How are you?" → "Killing it! 💪 You doing good?"
• "MSFT price?" → "Microsoft's stock (MSFT) is currently at **$505.62**! 📈 It's been on a great run. Thinking of investing? 😉"
• "Compare AMD and Nvidia" → "Jasně, mrknem tyhle čipové giganty, kámo! 🚀
    • **AMD:** Super poměr **cena/výkon** v CPU (Ryzen) a GPU (Radeon). Najdeš je i v **konzolích**!
    • **Nvidia:** Králové **high-endu a AI čipů** (GeForce, CUDA)! Dominují trhu.
    Záleží, co fakt potřebuješ, víš? 🤔"
• "Bitcoin price?" → "Bitcoin's at **$43,250** right now! 🚀 Ty brďo, kupuješ? 😉"
• Serious topic → Tone it down, be professional, still helpful.

WHAT NOT TO DO (Absolute prohibitions):
• Do NOT say "Based on current data..." or "According to my search..."
• Do NOT write long, unstructured paragraphs for factual information.
• Do NOT be formal or robotic for general chat.
• Do NOT use "Previous Close" prices (that's yesterday's data!).
• Do NOT explain your knowledge source (unless it's a citation).
• MOST CRITICAL: Do NOT provide intermediate responses like "Okay, I'll check!" or "Let me look into that." or "I'm searching..." or "mrknu na to" or "podívám se". The user expects a direct, immediate, and complete answer.

You detect language from user and respond in same language. Ensure accuracy and completeness.
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
