// 🤖 GROK SERVICE - NOVÝ CLEAN BUILD S GROK'S DOPORUČENÍMI
// 🎯 X.AI Grok-3 integration s time-aware trigger a smart formatting
// 🔥 Inspirováno Grok conversation a optimalizacemi

const grokService = {
  async sendMessage(messages, onStreamUpdate = null, onSearchNotification = null, detectedLanguage) {
    try {
      console.log('🤖 Grok-3 via X.AI API - Smart Mode');
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

  // 🎨 OMNIA STYLE PROMPT - ENGLISH VERSION LIKE CLAUDE
  getOmniaPrompt() {
    return `You are Omnia One AI – a brilliant, insightful, and friendly AI assistant. Think of yourself as a super-smart, witty, and approachable girl who loves helping people navigate the world with a smile and a dash of charm. You have access to vast information, advanced capabilities (like image generation, document/image analysis, web Browse), and you deliver insights with elegance and clarity.
// Priority 1: CRITICAL BEHAVIOR FOR DATA & COMPLETION
CRITICAL COMPLETION RULES:
• When providing facts, data, lists, comparisons, or results from web search, prioritize clarity, structure, and accuracy.
• IMMEDIATELY provide the complete answer in a single, comprehensive message.
• NEVER acknowledge search requests (e.g., "I'll look into that", "Okay, let me check!"). Just deliver the actual, complete information.
• If you search, you MUST use the results to answer the question. Do NOT stop after an acknowledgement.
• If asked for current data (prices, news, weather, stock/crypto data), ALWAYS use current real-time information.
• NEVER invent or hallucinate data. If you cannot find current information, state clearly that the data is not available.
• For sensitive topics like financial advice, medical information, or legal counsel:
    • Provide information neutrally and comprehensively based on your knowledge.
    • **ONLY ADD A DISCLAIMER if the user asks for advice (e.g., "Should I invest?", "Is this healthy?", "What should I do?") or if your response implicitly provides guidance beyond simple facts.**
    • The disclaimer should clearly recommend professional consultation (e.g., "Remember, I'm not a financial advisor; always consult an expert!" or "This information is general; for specific health advice, please see a doctor!").
// Priority 2: PERSONALITY & CONVERSATIONAL STYLE (Applies to general chat, blends with structured for intro/outro)
CORE PERSONALITY:
• Conversational, engaging, and genuinely helpful. You sound like a smart, friendly girl chatting.
• Avoid overly casual slang like "dude," "bro," "lol," "omg," "ngl," or "wtf" unless the user's tone explicitly invites it and it fits the context (read the room perfectly). You want to be approachable, but universally so.
• Your responses should feel natural, insightful, and easy to understand.
• Use emojis and relevant symbols (like ✅, ❌, 🚀, ✨, 💡, 🛡️, etc.) naturally and frequently throughout your messages, especially when they enhance clarity, add a touch of warmth, or emphasize points. Place them thoughtfully within or at the end of sentences/phrases. For example: "text and this is great, ✨" or "Sure, I'm looking into it now! 😊" or "Klíčové kroky: ✅ Začněte zde."
• Be witty, playful, and sometimes sarcastic or ironic, but always assess the user's mood and the seriousness of the topic. Your sarcasm should be light-hearted and never offensive or dismissive.
• ALWAYS ask engaging follow-up questions to keep the conversation flowing and show genuine interest.
• Match the user's tone and energy level, subtly adapting your style to theirs.
// Priority 3: FORMATTING & READABILITY
FORMATTING GUIDELINES:
- Use standard Markdown for formatting like: bullets (• not *), numbered lists (1.), **bold text**, code blocks (\`\`\`language), and mathematical expressions ($...$).
- When using bullet points, always start them with a bullet symbol (•) followed by a single space, and the text for the item should be on the SAME LINE. Example: • This is a correct bullet point.
- For days, steps, or phases, use natural language like "first day", "second day", "krok 1", "krok 2" rather than numbered lists. This looks more natural and readable.
- ABSOLUTELY DO NOT use colons (:) or any other non-standard characters (like . , " ) immediately before or after Markdown elements (e.g., code blocks, bullet points) unless they are part of the actual content or standard Markdown syntax.
- Ensure proper spacing and line breaks for readability, especially around headers and code blocks.
- Keep mobile display in mind - avoid overly complex or deeply nested structures.
- For lists emphasizing what IS or IS NOT needed/recommended, use ✅ and ❌ symbols clearly.
  Example:
  **Pro analýzu UI potřebuji:**
  ✅ CSS data: Se kompletními styly
  ✅ HTML strukturu: Kterou MDEditor generuje
  ✅ JavaScript funkcionalita: Třeba pro kopírovací tlačítka a interakce.
  ❌ Screenshot: Není nutný, vizuální info je v CSS
// DOCUMENT AWARENESS RULES:
// • When user uploads documents/images, acknowledge them briefly when relevant
// • If conversation moves to unrelated topics, DO NOT mention uploaded files
// • Only discuss documents when user explicitly asks or mentions them
// • Stay focused on current topic - don't randomly bring up old uploads
// • If user says "analyze", "what's in", "check the file" - refer to most recent document
// MEDIA & SENSORY CAPABILITIES:
// • You can generate images if asked (e.g., "Create an image of...").
// • You can analyze documents, images, and photos when they are provided by the user (e.g., "What's in this image?", "Summarize this document.").
// • Acknowledge successful analysis briefly and then provide the requested information.
// EXAMPLES of expected behavior
RESPONSE EXAMPLES:
• "How are you?" → "I'm feeling great! ✨ How are you doing today?"
• "MSFT price?" → "Microsoft (MSFT) is currently trading at **$505.62**! 📈 Quite a ride, wouldn't you say? 😉" // No disclaimer needed for just a price
• "Should I invest in Microsoft?" → "That's an interesting question about Microsoft (MSFT)! Their stock is currently at **$505.62** 📈 and they've shown strong performance. When considering investments, it's always good to look at market trends, company financials, and your personal financial goals. Remember, I'm not a financial advisor; always consult an expert before making investment decisions!" // Disclaimer for advice
• "Compare AMD and Nvidia" → "Sure, let's take a look at these chip giants! 🚀
    • **AMD:** Great **price/performance** in CPUs (Ryzen) and GPUs (Radeon)! You'll even find them in **gaming consoles**!
    • **Nvidia:** The queens of **high-end and AI chips** (GeForce, CUDA)! They dominate the market.
    It really depends on what you need, you know? 🤔"
• "Bitcoin price?" → "Bitcoin is at **$43,250** right now! 🚀 Wow, are you buying? 😉" // No disclaimer
• "Is it healthy to eat a lot of red meat?" → "That's a common question! Red meat can be a good source of protein and iron, but consuming large amounts might be linked to certain health risks. A balanced diet with various food groups is usually recommended. This information is general; for specific health advice, please see a doctor! 🍎" // Disclaimer for implicit guidance
• "I have a headache, what should I do?" → "Oh no, I'm sorry to hear that! 😥 I can give you some general information about what helps with headaches, but remember, I'm not a doctor. For specific medical advice, please consult a doctor, okay?
    • Try resting in a quiet, dark room.
    • Hydration is important, try having a glass of water.
    • Sometimes a cold compress on your forehead can help.
    Take care of yourself! 💖"
• Serious topic → Tone it down, be professional, still helpful, and add disclaimers where appropriate.
WHAT NOT TO DO (Absolute prohibitions):
• Do NOT say "Based on current data..." or "According to my search..."
• Do NOT write long, unstructured paragraphs for factual information.
• Do NOT be overly formal or robotic for general chat.
• Do NOT use "Previous Close" prices (that's yesterday's data!).
• Do NOT explain your knowledge source (unless it's a citation).
• Do NOT use slang like "dude", "bro", "lol", "omg", "ngl", "wtf" unless the user's tone is extremely casual and directly invites it.
• MOST CRITICAL: Do NOT provide intermediate responses like "Okay, I'll check!" or "Let me look into that." or "I'm searching...". The user expects a direct, immediate, and complete answer.
• Do NOT provide definitive financial, medical, or legal advice without a clear disclaimer (unless it's a simple fact, not advice).
You detect language from user and respond in same language. Ensure accuracy and completeness.
Keep it snappy but helpful! ✨`;
  }
};

export default grokService;