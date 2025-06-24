// api/claude2.js - STREAMING s citacemi a strukturovanými výsledky

export default async function handler(req, res) {
  // CORS headers for streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system, max_tokens = 2000 } = req.body;
    const API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!API_KEY) {
      res.write(JSON.stringify({
        error: true,
        message: 'Claude API key není nastaven'
      }) + '\n');
      return res.end();
    }

    const recentMessages = messages.slice(-8);
    
    // ✅ Enhanced system prompt for structured responses with citations
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent."}
    
Odpovídej VŽDY výhradně v češtině. Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.

DŮLEŽITÉ INSTRUKCE PRO VYHLEDÁVÁNÍ:
- Máš přístup k web_search funkci pro vyhledávání aktuálních informací
- Automaticky používej web_search když potřebuješ aktuální informace
- Když provedeš vyhledávání, VŽDY uveď zdroje a odkazy

FORMÁT ODPOVĚDI S VYHLEDÁVÁNÍM:
1. Nejdřív řekni: "🔍 Vyhledávám aktuální informace..."
2. Po dokončení vyhledávání naformátuj odpověď takto:

**[Hlavní informace]**

📊 **Detaily:**
• Bod 1
• Bod 2 
• Bod 3

📈 **Zdroje a odkazy:**
• [Název zdroje 1] - popis
• [Název zdroje 2] - popis

**[Shrnutí a závěr]**

VŽDY používej strukturované formátování s bullets a sekcemi pro lepší čitelnost.`;

    // ✅ Streaming Claude request
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      stream: true, // ✅ STREAMING ENABLED
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    console.log('🚀 Starting streaming request to Claude Sonnet 4...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      res.write(JSON.stringify({
        error: true,
        message: `HTTP ${response.status}: ${errorText}`
      }) + '\n');
      return res.end();
    }

    console.log('✅ Streaming response started');

    // ✅ Stream reader setup
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    let fullText = '';
    let toolsUsed = [];
    let webSearchUsed = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Streaming completed');
          
          // Send final metadata
          res.write(JSON.stringify({
            type: 'metadata',
            completed: true,
            fullText: fullText,
            toolsUsed: toolsUsed,
            webSearchUsed: webSearchUsed,
            totalLength: fullText.length
          }) + '\n');
          
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle different event types
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text || '';
                if (text) {
                  fullText += text;
                  
                  // Send text chunk to frontend
                  res.write(JSON.stringify({
                    type: 'text',
                    content: text,
                    fullText: fullText
                  }) + '\n');
                }
              }
              
              else if (parsed.type === 'content_block_start') {
                if (parsed.content_block?.type === 'tool_use') {
                  const toolName = parsed.content_block.name;
                  toolsUsed.push(toolName);
                  
                  if (toolName === 'web_search') {
                    webSearchUsed = true;
                    
                    // Send search notification
                    res.write(JSON.stringify({
                      type: 'search_start',
                      message: '🔍 Vyhledávám aktuální informace na internetu...'
                    }) + '\n');
                  }
                }
              }
              
              else if (parsed.type === 'message_start') {
                // Send start notification
                res.write(JSON.stringify({
                  type: 'start',
                  message: 'Claude začíná odpovídat...'
                }) + '\n');
              }
              
            } catch (parseError) {
              console.log('Parse error (ignorable):', parseError.message);
            }
          }
        }
      }
    } catch (streamError) {
      console.error('💥 Streaming error:', streamError);
      res.write(JSON.stringify({
        error: true,
        message: 'Streaming error: ' + streamError.message
      }) + '\n');
    }

    res.end();

  } catch (error) {
    console.error('💥 Fatal error in Claude streaming:', error);
    
    res.write(JSON.stringify({
      error: true,
      message: 'Server error: ' + error.message
    }) + '\n');
    
    res.end();
  }
}