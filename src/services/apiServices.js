const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export const claudeService = {
  async sendMessage(messages) {
    const response = await fetch(`${API_BASE}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.content[0].text;
  }
};

export const openaiService = {
  async sendMessage(messages) {
    const response = await fetch(`${API_BASE}/api/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
};