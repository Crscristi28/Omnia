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
                else if (data.type === 'completed') {
                  if (data.fullText) {
                    fullText = data.fullText;
                  }
                  
                  if (onStreamUpdate) {
                    onStreamUpdate(fullText, false, []);
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
        sources: [],
        webSearchUsed: false
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

  // 🎯 OMNIA PROMPT FOR GROK-3
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
Be helpful but keep it snappy! 🔥`;
  }
};

export default grokService;