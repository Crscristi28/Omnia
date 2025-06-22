// pages/api/news.js nebo api/news.js
// SerpAPI endpoint pro Internet Search

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // SerpAPI klíč z environment variables
    const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
    
    if (!SERPAPI_KEY) {
      console.error('❌ SERPAPI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        success: false,
        error: 'SerpAPI key not configured' 
      });
    }

    console.log('🔍 Searching for:', query);

    // SerpAPI search request
    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5&hl=cs&gl=cz`;
    
    const response = await fetch(serpApiUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('🔍 SerpAPI response:', data);

    // Zkontroluj jestli máme výsledky
    if (!data.organic_results || data.organic_results.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No search results found',
        results: []
      });
    }

    // Formátuj výsledky
    const results = data.organic_results.slice(0, 5).map(result => ({
      title: result.title || 'Bez názvu',
      snippet: result.snippet || 'Bez popisu',
      link: result.link || '#',
      source: result.source || 'Neznámý zdroj'
    }));

    console.log('✅ Processed results:', results.length);

    return res.status(200).json({
      success: true,
      results: results,
      query: query
    });

  } catch (error) {
    console.error('💥 Search API error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Search failed'
    });
  }
}