// 🤖 api/claude2.js - UTF-8 FIXED VERSION
// ✅ FIX: Přidány UTF-8 headers pro opravu diakritiky

export default async function handler(req, res) {
  // ✅ KRITICKÝ FIX: UTF-8 headers MUSÍ být na začátku!
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system, max_tokens = 2000, language = 'cs' } = req.body;

    // ✅ DEBUGGING UTF-8:
    console.log('📝 Claude2 Request Language:', language);
    console.log('🔤 Request Content-Type:', req.headers['content-type']);
    console.log('📤 Response Content-Type:', res.getHeader('Content-Type'));
    
    // Test Czech characters
    if (language === 'cs') {
      console.log('🧪 Czech test: můžete říct více informací?');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',  // ✅ FIX: UTF-8 pro Claude API
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: max_tokens,
        system: system,
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Claude API Error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: `Claude API Error: ${response.status}`,
        details: errorData 
      });
    }

    // ✅ STREAMING s UTF-8 support
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');  // ✅ FIX: Explicit UTF-8
    
    let buffer = '';
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // ✅ FINAL MESSAGE s UTF-8:
          const finalData = JSON.stringify({ 
            type: 'completed', 
            fullText: fullText 
          });
          res.write(`data: ${finalData}\n\n`);
          res.end();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta' && 
                  parsed.delta && 
                  parsed.delta.text) {
                
                const chunk = parsed.delta.text;
                fullText += chunk;
                
                // ✅ STREAM CHUNK s UTF-8:
                const responseData = JSON.stringify({ 
                  type: 'text', 
                  content: chunk 
                });
                res.write(`data: ${responseData}\n\n`);
              }
            } catch (parseError) {
              console.warn('⚠️ Parse error:', parseError.message);
              continue;
            }
          }
        }
      }
    } catch (streamError) {
      console.error('💥 Streaming error:', streamError);
      
      // ✅ ERROR RESPONSE s UTF-8:
      const errorData = JSON.stringify({ 
        error: 'Streaming error', 
        message: streamError.message 
      });
      res.write(`data: ${errorData}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('💥 Claude2 API Error:', error);
    
    // ✅ ENSURE UTF-8 for error responses:
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}