// api/claude2.js - STREAMING s nejnovější API verzí
export default async function handler(req, res) {
  // CORS headers pro streaming
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
    
    const enhancedSystem = `${system || "Jsi Omnia v2, pokročilý český AI asistent."}
    
Odpovídej VŽDY výhradně v češtině. Dnešní datum je ${new Date().toLocaleDateString('cs-CZ')}.
Máš přístup k web_search funkci pro vyhledávání aktuálních informací na internetu.
Automaticky používej web_search když potřebuješ aktuální informace o cenách, počasí, zprávách nebo jakýchkoli datech co se mění.
Pro české lokální informace (počasí měst, české zprávy) vyhledávej česky a zaměřuj se na české zdroje.`;

    // ✅ STREAMING request s nejnovější API verzí
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      stream: true, // 🚀 STREAMING
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    console.log('🚀 Sending STREAMING request with 2025-01-01 API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2025-01-01' // 🔧 NEJNOVĚJŠÍ API VERZE
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

    console.log('✅ STREAMING response started');

    // 🚀 STREAMING reader setup
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    let fullText = '';
    let webSearchUsed = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ STREAMING completed');
          
          // Send final metadata
          res.write(JSON.stringify({
            type: 'completed',
            fullText: fullText,
            webSearchUsed: webSearchUsed
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
              
              // Handle streaming events
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text || '';
                if (text) {
                  fullText += text;
                  
                  // ✅ Send text chunk to frontend
                  res.write(JSON.stringify({
                    type: 'text',
                    content: text
                  }) + '\n');
                }
              }
              
              else if (parsed.type === 'content_block_start') {
                if (parsed.content_block?.type === 'tool_use') {
                  const toolName = parsed.content_block.name;
                  
                  if (toolName === 'web_search') {
                    webSearchUsed = true;
                    
                    // ✅ Send search notification
                    res.write(JSON.stringify({
                      type: 'search_start',
                      message: '🔍 Vyhledávám aktuální informace...'
                    }) + '\n');
                  }
                }
              }
              
            } catch (parseError) {
              // Some lines might not be JSON, that's OK
              continue;
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