import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const app = express();
const port = 3000;

app.use(cors({ origin: 'https://omnia-project-nyb3.vercel.app' }));
app.use(express.json());

app.post('/claude', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
    });

    const data = await response.json();

    if (Array.isArray(data.content)) {
      res.json({ message: data.content[0].text });
    } else {
      console.log('Nečekaná struktura odpovědi Claude:', data);
      res.status(500).json({ error: 'Nečekaná struktura odpovědi.' });
    }
  } catch (error) {
    console.error('Chyba proxy:', error);
    res.status(500).json({ error: 'Chyba při komunikaci s API.' });
  }
});

app.post('/openai', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Chyba proxy OpenAI:', error);
    res.status(500).json({ error: 'Chyba při komunikaci s OpenAI API.' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server běží na http://localhost:${port}`);
});