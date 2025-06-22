// /api/news.js - Vercel API endpoint pro aktuální zprávy

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { query, category = 'general' } = req.method === 'GET' ? req.query : req.body;
    
    // 🔑 SERPAPI CONFIGURATION
    const SERP_API_KEY = process.env.SERP_API_KEY; // Přidejte do Vercel Environment Variables
    
    if (!SERP_API_KEY) {
      throw new Error('SERP API key not configured');
    }

    let searchQuery;
    
    // 📰 ČESKÝ NEWS QUERIES
    if (query) {
      // Custom search query
      searchQuery = `${query} zprávy Česko`;
    } else {
      // Category-based searches
      const categoryQueries = {
        general: 'nejnovější zprávy Česko dnes',
        politics: 'politika Česko zprávy dnes',
        economy: 'ekonomika hospodářství Česko zprávy',
        world: 'svět zahraniční zprávy dnes',
        sport: 'sport Česko zprávy dnes',
        technology: 'technologie IT zprávy Česko',
        health: 'zdravotnictví medicína zprávy Česko'
      };
      searchQuery = categoryQueries[category] || categoryQueries.general;
    }

    // 🔍 SERPAPI NEWS SEARCH
    const serpParams = {
      engine: 'google_news',
      q: searchQuery,
      gl: 'cz', // Czech geo-location
      hl: 'cs', // Czech language
      api_key: SERP_API_KEY,
      num: 10 // Number of results
    };

    const serpUrl = 'https://serpapi.com/search?' + new URLSearchParams(serpParams);
    
    console.log('🔍 Fetching news from SerpAPI:', searchQuery);
    
    const response = await fetch(serpUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 📰 PROCESS NEWS RESULTS
    const articles = [];
    
    if (data.news_results) {
      for (const item of data.news_results) {
        articles.push({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          source: {
            name: item.source || 'Neznámý zdroj'
          },
          date: item.date,
          thumbnail: item.thumbnail,
          position: item.position
        });
      }
    }

    // 🎯 FALLBACK - Regular search results if no news_results
    if (articles.length === 0 && data.organic_results) {
      for (const item of data.organic_results.slice(0, 5)) {
        articles.push({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          source: {
            name: extractDomain(item.link)
          },
          date: 'Dnes',
          position: item.position
        });
      }
    }

    // 📊 RESPONSE
    const newsResponse = {
      success: true,
      query: searchQuery,
      total_results: articles.length,
      articles: articles,
      timestamp: new Date().toISOString(),
      source: 'SerpAPI'
    };

    console.log(`✅ Found ${articles.length} news articles`);
    
    res.status(200).json(newsResponse);

  } catch (error) {
    console.error('💥 News API error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      articles: [],
      timestamp: new Date().toISOString()
    });
  }
}

// 🔧 HELPER FUNCTION
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Neznámý zdroj';
  }
}