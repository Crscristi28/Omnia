// 🔍 api/sonar-search.js - UTF-8 FIXED VERSION
// ✅ FIX: Přidány UTF-8 headers pro opravu diakritiky v search results

export default async function handler(req, res) {
  // ✅ KRITICKÝ FIX: UTF-8 headers MUSÍ být na začátku!
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, freshness = 'recent', count = 10, language = 'cs' } = req.body;

    // ✅ DEBUGGING UTF-8:
    console.log('🔍 Sonar Search Request Language:', language);
    console.log('📝 Search query:', query);
    console.log('🔤 Request Content-Type:', req.headers['content-type']);
    console.log('📤 Response Content-Type:', res.getHeader('Content-Type'));
    
    // Test Czech characters in query
    if (language === 'cs' && query) {
      const hasCzechChars = /[áčďéěíňóřšťúůýž]/i.test(query);
      console.log('🧪 Czech diacritics in query:', hasCzechChars);
    }

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Search query is required' 
      });
    }

    // ✅ PERPLEXITY/SONAR API CALL s UTF-8:
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',  // ✅ FIX: UTF-8 pro Sonar API
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: language === 'cs' 
              ? 'Jsi pokročilý vyhledávací asistent. Odpovídej v češtině s použitím aktuálních informací z internetu. Používej správnou diakritiku.'
              : language === 'en'
              ? 'You are an advanced search assistant. Respond in English using current information from the internet.'
              : language === 'ro'
              ? 'Ești un asistent de căutare avansat. Răspunde în română folosind informații actuale de pe internet. Folosește diacritice corecte.'
              : 'You are an advanced search assistant providing current information.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        top_p: 0.9,
        return_citations: true,
        search_domain_filter: ["perplexity.ai"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: freshness,
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Sonar API Error:', response.status, errorData);
      
      // ✅ ERROR s UTF-8:
      return res.status(response.status).json({ 
        success: false,
        error: `Sonar API Error: ${response.status}`,
        details: errorData 
      });
    }

    const data = await response.json();

    // ✅ DEBUGGING UTF-8 OUTPUT:
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const result = data.choices[0].message.content;
      console.log('📝 Sonar result preview:', result.substring(0, 100));
      
      // Test if Czech/Romanian characters are preserved
      const hasCzechChars = /[áčďéěíňóřšťúůýž]/i.test(result);
      const hasRomanianChars = /[ăâîșțĂÂÎȘȚ]/i.test(result);
      
      if (hasCzechChars) {
        console.log('✅ Czech diacritics preserved in search results');
      }
      
      if (hasRomanianChars) {
        console.log('✅ Romanian diacritics preserved in search results');
      }
    }

    // Extract result and citations
    const result = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];
    const sources = citations.map(citation => citation.url || citation.title).filter(Boolean);

    // ✅ SUCCESS RESPONSE s UTF-8:
    return res.status(200).json({
      success: true,
      result: result,
      citations: citations,
      sources: sources,
      query: query,
      language: language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Sonar Search Error:', error);
    
    // ✅ ENSURE UTF-8 for error responses:
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}