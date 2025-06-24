// api/claude2.js - KOMPLETNÍ FAKE STREAMING kompatibilní s App.jsx
export default async function handler(req, res) {
  // CORS headers pro fake streaming
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

    // ✅ PŮVODNÍ funkční request (BEZ streaming)
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: enhancedSystem,
      messages: recentMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    console.log('🎭 Starting FAKE STREAMING (funkční backend + streaming frontend)...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01' // ✅ Tvá funkční API verze
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

    const data = await response.json();
    console.log('✅ Claude Sonnet 4 response received - starting FAKE STREAMING...');
    
    // Check for web search usage
    const toolUses = data.content?.filter(item => item.type === 'tool_use') || [];
    const webSearchUsed = toolUses.some(t => t.name === 'web_search');
    
    if (webSearchUsed) {
      console.log('🔍 Claude used web_search - sending notification...');
      // Send search notification (kompatibilní s App.jsx)
      res.write(JSON.stringify({
        type: 'search_start',
        message: '🔍 Vyhledávám aktuální informace...'
      }) + '\n');
      
      // Small delay to simulate search
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Extrahovat text odpověď
    const textContent = data.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('\n')
      ?.trim() || "Nepodařilo se získat odpověď.";

    console.log('💬 Response length:', textContent.length, 'characters');
    console.log('🎭 Starting FAKE STREAMING simulation...');

    // 🎭 FAKE STREAMING: Postupné posílání textu po částech
    const words = textContent.split(' ');
    const chunkSize = 2; // Posíláme po 2 slovech pro realističnost
    let sentText = '';
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      sentText += chunk;
      
      // Pošli chunk textu (formát kompatibilní s App.jsx)
      res.write(JSON.stringify({
        type: 'text',
        content: chunk + (i + chunkSize < words.length ? ' ' : '')
      }) + '\n');
      
      console.log(`📺 Sent chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(words.length/chunkSize)}: "${chunk}"`);
      
      // Realistická pauza pro streaming efekt
      if (i + chunkSize < words.length) {
        await new Promise(resolve => setTimeout(resolve, 120)); // 120ms mezi chunky
      }
    }
    
    // Send final completion (kompatibilní s App.jsx)
    res.write(JSON.stringify({
      type: 'completed',
      fullText: textContent,
      webSearchUsed: webSearchUsed
    }) + '\n');

    console.log('✅ FAKE STREAMING completed successfully!');
    console.log('🎭 Total chunks sent:', Math.ceil(words.length/chunkSize));
    console.log('📺 App.jsx should see real-time streaming effect!');
    
    res.end();

  } catch (error) {
    console.error('💥 Fatal error in FAKE streaming:', error);
    
    res.write(JSON.stringify({
      error: true,
      message: 'Server error: ' + error.message
    }) + '\n');
    
    res.end();
  }
}