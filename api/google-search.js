// google-search.js
// Modul pro vyhledávání přes Google Custom Search JSON API

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

async function googleSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    throw new Error('Google API key nebo CSE ID není nastaveno v env proměnných');
  }

  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5&hl=cs`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Google Search API chyba: ${response.status}`);
    }
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        message: 'Nenalezeny žádné výsledky',
        results: []
      };
    }

    // Zpracování výsledků: titulek, snippet a odkaz
    const results = data.items.map(item => ({
      title: item.title || 'Bez názvu',
      snippet: item.snippet || 'Bez popisu',
      link: item.link || '#'
    }));

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Chyba Google Search API:', error);
    return {
      success: false,
      message: error.message,
      results: []
    };
  }
}

export default googleSearch;