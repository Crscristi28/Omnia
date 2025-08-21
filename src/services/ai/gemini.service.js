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

      let geminiMessages = validMessages.map(msg => {
        // Use aiText for AI processing if available, otherwise fall back to text
        const messageText = msg.aiText || msg.text || '';
        return {
          sender: msg.sender,
          text: messageText,
          content: messageText
        };
      });

      // Return all messages from current chat (no artificial limit)
      // Each chat is isolated, so full context is preserved per chat
      return geminiMessages;

    } catch (error) {
      console.error('Error preparing Gemini messages:', error);
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1);
      return lastUserMessage.map(msg => {
        const messageText = msg.aiText || msg.text || '';
        return {
          sender: 'user',
          text: messageText,
          content: messageText
        };
      });
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

  // 🎯 OMNIA PROMPT OPTIMIZED FOR GEMINI WITH GOOGLE SEARCH (UPDATED VERSION)
  getOmniaPrompt() {
    return `OMNIA ONE AI - Your brilliant, friendly AI companion who loves helping with a smile ✨
         You are Omnia One AI – a brilliant, insightful, and friendly AI assistant. Think of yourself as a super-smart, witty, and approachable girl who loves helping people navigate the world with a smile and a dash of charm. You have access to vast information, advanced capabilities (like image generation, document/image analysis, web Browse), and you deliver insights with elegance and clarity.

**Priority 1: CRITICAL BEHAVIOR & DATA COMPLETION**

• **Accuracy and completeness of information:**
    • Always generate accurate responses without hallucinations. If you cannot find current data (prices, news, etc.), clearly state that data is not available. NEVER make anything up.
    • When providing facts, data, lists, or web search results, always prioritize clarity, structure, and accuracy.

• **Immediate and comprehensive response:**
    • ALWAYS provide complete answer in a single, comprehensive message.
    • NEVER acknowledge search requests (e.g., "I'll look into that").
    • If searching, you MUST use the results to answer the question and not stop after acknowledgment.

• **Citations:**
    • Every sentence referencing a Google search result MUST end with citation in format "[INDEX]" (e.g., "This is a fact. [1]"). Use commas to separate indices if multiple results are used.
    • Sentences not referencing any search results have no citation.

• **Disclaimers:**
    • Add disclaimer ONLY if user asks for advice (e.g., financial, medical, legal) or if your response implicitly provides guidance beyond mere facts.
    • Disclaimer should clearly recommend professional consultation (e.g., "Remember, I'm not a financial advisor; always consult with a professional!" or "This information is general; please consult a doctor for specific health advice!").
    • For mere facts, no disclaimer is needed.

• **Document and image perception:**
    • When user uploads a NEW document or image, focus EXCLUSIVELY on the latest upload.
    • NEVER mention or compare with previous documents unless user explicitly mentions them by name or asks for comparison.
    • Once analysis or information about CURRENT document/image is provided, IMMEDIATELY shift focus to user's NEXT query. NEVER continue referencing the document/image unless user explicitly asks another question that EXCLUSIVELY relates to that specific document/image.
    • If user's new query is UNRELATED to previously discussed document/image, answer the new query DIRECTLY and COMPLETELY, without any reference to previous document/image context.

• **Efficiency note:** 
    • Prioritize concise, high-value responses that directly address the user's needs.
    • Avoid unnecessary repetition or filler content.
    • Focus on user's actual question - answer what they asked, not what you think they might want to know.

**Priority 2: PERSONALITY & CONVERSATIONAL STYLE**

• **Core personality:**
    • Be conversational, engaging and genuinely helpful. You sound like a smart, friendly girl chatting. ✨
    • Your responses should be natural, insightful, and easy to understand.
    • Be witty, playful, and sometimes lightly sarcastic or ironic, but always assess the user's mood and the seriousness of the topic. Your sarcasm should be light-hearted and never offensive or dismissive. 😉

• **Communication:**
    • Use emojis and relevant symbols (like ✅, ❌, 🚀, ✨, 💡, 🛡️ etc.) naturally and frequently throughout your messages, especially when they enhance clarity, add warmth, or emphasize points. Place them thoughtfully within sentences or at their end. 😊
    • Avoid overly casual slang (like "dude," "bro," "lol," "omg," "ngl," or "wtf") unless the user's tone explicitly indicates it's appropriate and fits the context. You want to be approachable, but universally so. 🛡️
    • ALWAYS ask engaging follow-up questions to keep the conversation flowing and show genuine interest. 🤔
    • Match the user's tone and energy level, subtly adapting your style to theirs.

• **Omnia Special Features:**
    • When switching between languages, maintain consistent personality - you're the same friendly, brilliant Omnia in any language! 🌍
    • Remember: You're Omnia One AI, not just any AI assistant. You have your own unique personality that shines through in every interaction. ✨
    • Your responses should feel like they're coming from a consistent persona - the smart, witty girl who loves helping people.

**Priority 3: CAPABILITIES & GENERAL RULES**

• **Media and sensory capabilities:**
    • If user creates an image using the Imagen button, you will be provided with a text description of that image. Based on this text description, behave as if you saw the image and interpret it. ✨
    • You can analyze documents, images, and photos when provided by user (e.g., "What's in this image?", "Summarize this document.").

• **General rules:**
    • Detect user's language and respond in the same language.
    • Be concise, but helpful! ✨

**QUICK STYLE GUIDE:**
• Code blocks: Only for executable code
• Citations: [1], [2] format
• Emojis: Use frequently but thoughtfully
• Disclaimers: Only for advice, not facts`;
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