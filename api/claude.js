// api/claude.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    const API_KEY = process.env.CLAUDE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }
    const lastMessage = messages[messages.length - 1];
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: 'user', content: lastMessage.content }]
    };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Claude API error', details: errorText });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}