// 🔍 SONAR SEARCH SERVICE - Extracted from App.jsx
// ✅ FIXED: UTF-8 charset headers added
// 🌍 Multilingual search messages

const sonarService = {
  async search(query, showNotification, detectedLanguage = 'cs') {
    try {
      console.log('🔍 Sonar detected language:', detectedLanguage);
      
      // showNotification(this.getSearchMessage(detectedLanguage), 'info');

      const enhancedQuery = this.enhanceQueryForCurrentData(query);

      const response = await fetch('/api/sonar-search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'  // ✅ FIX: UTF-8 charset added
        },
        body: JSON.stringify({
          query: enhancedQuery,
          freshness: 'recent',
          count: 10,
          language: detectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Sonar request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error('Invalid Sonar response');
      }

      // showNotification(this.getSuccessMessage(detectedLanguage), 'success');
      
      return {
        success: true,
        result: data.result,
        citations: data.citations || [],
        sources: data.sources || [],
        source: 'sonar_search'
      };
    } catch (error) {
      console.error('💥 Sonar error:', error);
      showNotification(this.getErrorMessage(detectedLanguage, error.message), 'error');
      return {
        success: false,
        message: this.getErrorMessage(detectedLanguage, error.message),
        source: 'sonar_search'
      };
    }
  },

  // 🔍 SEARCH MESSAGES - Multilingual
  getSearchMessage(language) {
    const messages = {
      'cs': 'Vyhledávám nejnovější informace...',
      'en': 'Searching for latest information...',
      'ro': 'Caut informații recente...'
    };
    return messages[language] || messages['cs'];
  },

  getSuccessMessage(language) {
    const messages = {
      'cs': 'Nalezeny aktuální informace!',
      'en': 'Found current information!',
      'ro': 'Informații actuale găsite!'
    };
    return messages[language] || messages['cs'];
  },

  getErrorMessage(language, error) {
    const messages = {
      'cs': `Chyba při vyhledávání: ${error}`,
      'en': `Search error: ${error}`,
      'ro': `Eroare de căutare: ${error}`
    };
    return messages[language] || messages['cs'];
  },

  // 🔧 QUERY ENHANCEMENT for current data
  enhanceQueryForCurrentData(originalQuery) {
    const query = originalQuery.toLowerCase();
    const currentYear = new Date().getFullYear();
    
    if (query.includes('2024') || query.includes('2025')) {
      return originalQuery;
    }

    const temporalTriggers = [
      'aktuální', 'dnešní', 'současný', 'nejnovější', 'poslední',
      'current', 'latest', 'recent', 'today', 'now',
      'actual', 'recent', 'astăzi', 'acum'
    ];

    const needsTimeFilter = temporalTriggers.some(trigger => query.includes(trigger));
    
    if (needsTimeFilter) {
      return `${originalQuery} ${currentYear} latest current`;
    }

    return originalQuery;
  }
};

export default sonarService;