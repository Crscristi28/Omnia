// 🧠 api/openai.js - UTF-8 FIXED VERSION
// ✅ FIX: Přidány UTF-8 headers pro opravu diakritiky

export default async function handler(req, res) {
  // ✅ KRITICKÝ FIX: UTF-8 headers MUSÍ být na začátku!
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, temperature = 0.7, max_tokens = 2000, language = 'cs' } = req.body;

    // ✅ DEBUGGING UTF-8:
    console.log('🧠 OpenAI Request Language:', language);
    console.log('🔤 Request Content-Type:', req.headers['content-type']);
    console.log('📤 Response Content-Type:', res.getHeader('Content-Type'));
    
    // Test Czech characters
    if (language === 'cs') {
      console.log('🧪 Czech test: můžete říct více informací?');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',  // ✅ FIX: UTF-8 pro OpenAI API
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorData);
      
      // ✅ ERROR RESPONSE s UTF-8:
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(response.status).json({ 
        error: `OpenAI API Error: ${response.status}`,
        details: errorData 
      });
    }

    const data = await response.json();

    // ✅ DEBUGGING výstupu:
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const responseText = data.choices[0].message.content;
      console.log('📝 OpenAI Response Preview:', responseText.substring(0, 100));
      
      // Test if Czech characters are preserved
      if (responseText.includes('ř') || responseText.includes('ě') || responseText.includes('ů')) {
        console.log('✅ Czech diacritics preserved in response');
      }
    }

    // ✅ RESPONSE s UTF-8:
    return res.status(200).json(data);

  } catch (error) {
    console.error('💥 OpenAI API Error:', error);
    
    // ✅ ENSURE UTF-8 for error responses:
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}