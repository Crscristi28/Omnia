// api/grok.js - GROK-3 API ENDPOINT
import grokService from '../services/grok.service.js';

export default async function handler(req, res) {
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
    const { messages, system, max_tokens = 2000, search_parameters, language = 'cs' } = req.body;
    const API_KEY = process.env.GROK_API_KEY;

    if (!API_KEY) {
      res.write(JSON.stringify({ error: true, message: 'Grok API key není nastaven' }) + '\n');
      return res.end();
    }

    const { textContent, webSearchUsed, extractedSources, metadata } = await grokService.processQuery({
      messages,
      system,
      max_tokens,
      search_parameters,
      language,
      apiKey: API_KEY
    });

    if (webSearchUsed) {
      res.write(JSON.stringify({
        type: 'search_start',
        message: metadata.isDeepSearchQuery ? '🔍 DeepSearch: Analyzuji trhy + X sentiment...' : '🔍 Vyhledávám aktuální informace...'
      }) + '\n');
      await new Promise(resolve => setTimeout(resolve, metadata.isDeepSearchQuery ? 2000 : 1000));
    }

    const words = textContent.split(' ');
    for (const word of words) {
      res.write(JSON.stringify({ type: 'text', content: word + ' ' }) + '\n');
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      webSearchUsed,
      sources: extractedSources,
      citations: extractedSources,
      ...metadata
    }) + '\n');

    console.log('✅ Grok streaming completed with sources:', extractedSources.length);
    console.log('✅ Metadata:', metadata);
    res.end();

  } catch (error) {
    console.error('💥 Fatal error in Grok streaming:', error);
    res.write(JSON.stringify({ error: true, message: 'Server error: ' + error.message }) + '\n');
    res.end();
  }
}