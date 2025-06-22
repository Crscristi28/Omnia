// App.jsx - OMNIA BRANDED VERZE

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [charIndex, setCharIndex] = React.useState(0);
  const chars = React.useMemo(() => Array.from(text), [text]);

  React.useEffect(() => {
    if (charIndex >= chars.length) return;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + chars[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, 20);

    return () => clearTimeout(timeout);
  }, [charIndex, chars]);

  return <span>{displayedText}</span>;
}

// ONLINE API SERVICES (pro Vercel)
const claudeService = {
  async sendMessage(messages) {
    try {
      console.log('🔄 Volám Claude přes Vercel API...');
      
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response structure');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('💥 Claude error:', error);
      throw error;
    }
  }
};

const openaiService = {
  async sendMessage(messages) {
    try {
      console.log('🔄 Volám OpenAI přes Vercel API...');
      
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('💥 OpenAI error:', error);
      throw error;
    }
  }
};

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('gpt-4o'); // 'gpt-4o' or 'claude'
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Načtení historie z localStorage při startu
  useEffect(() => {
    const navType = window.performance?.navigation?.type;
    if (navType === 1) { // Reload
      localStorage.removeItem('omnia-memory');
      setMessages([]);
    } else {
      const saved = localStorage.getItem('omnia-memory');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          setMessages([]);
        }
      }
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let responseText = '';

    try {
      if (model === 'gpt-4o') {
        // Převeď na OpenAI formát
        const openAiMessages = [
          { 
            role: 'system', 
            content: 'Jmenuješ se Omnia. Odpovídej vždy výhradně v češtině, gramaticky správně a přirozeně. Piš stručně, jako chytrý a lidsky znějící člověk, bez formálností. Nepiš "Jsem AI" ani se nijak nepředstavuj. Odpovědi musí být stylisticky i jazykově bezchybné, jako by je psal rodilý mluvčí.' 
          },
          ...newMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ];

        responseText = await openaiService.sendMessage(openAiMessages);

      } else if (model === 'claude') {
        // Převeď na Claude formát
        const claudeMessages = newMessages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        responseText = await claudeService.sendMessage(claudeMessages);
      }

      console.log('✅ Odpověď získána:', responseText);

    } catch (err) {
      console.error('💥 Chyba při volání API:', err);
      responseText = `Chyba: ${err.message}`;
    }

    const updatedMessages = [...newMessages, { sender: 'bot', text: responseText }];
    setMessages(updatedMessages);
    localStorage.setItem('omnia-memory', JSON.stringify(updatedMessages));
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <div className="main-wrapper">
      <div className="app light">
        <div className="app-center-wrapper">
          <div className="app-container">
            <header className="app-header">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src="/omnia.png"
                  alt="Omnia Logo"
                  style={{ width: '300px', height: 'auto', marginBottom: '1.5rem' }}
                />
                
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
                  <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Model:</label>
                  <select 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <option value="gpt-4o">Omnia (GPT-4)</option>
                    <option value="claude">Omnia (Claude)</option>
                  </select>
                  <button
                    onClick={() => {
                      localStorage.removeItem('omnia-memory');
                      setMessages([]);
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Nový chat
                  </button>
                </div>

                {/* Status indikátor */}
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  fontSize: '0.8rem',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#4CAF50', 
                    borderRadius: '50%' 
                  }}></div>
                  Online
                </div>
              </div>
            </header>

            <main 
              className="chat-container" 
              style={{ 
                maxWidth: '800px', 
                margin: '0 auto', 
                paddingBottom: '200px', 
                overflowY: 'auto', 
                height: 'calc(100vh - 300px)', 
                scrollBehavior: 'smooth' 
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.sender}`}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    padding: '0.5rem',
                    margin: '0.2rem 0'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
                      color: '#000',
                      padding: '0.8rem 1rem',
                      borderRadius: '1rem',
                      maxWidth: '70%',
                      fontSize: '1rem',
                      whiteSpace: 'pre-wrap',
                      position: 'relative'
                    }}
                  >
                    {/* AI indikátor */}
                    {msg.sender === 'bot' && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        opacity: 0.6, 
                        marginBottom: '0.3rem' 
                      }}>
                        🔮 Omnia
                      </div>
                    )}
                    
                    {msg.sender === 'bot' ? (
                      <TypewriterText text={msg.text} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  padding: '0.5rem' 
                }}>
                  <div style={{
                    backgroundColor: '#F1F0F0',
                    padding: '0.8rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        border: '2px solid #ccc', 
                        borderTop: '2px solid #666',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Omnia přemýšlí...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={endOfMessagesRef} />
            </main>
          </div>
        </div>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        width: '100%', 
        background: '#fff', 
        paddingBottom: '1rem', 
        zIndex: 1000,
        borderTop: '1px solid #eee'
      }}>
        <footer className="chat-input-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          marginTop: '1rem', 
          padding: '1rem' 
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Zeptej se Omnie…"
            disabled={loading}
            style={{ 
              flexGrow: 1, 
              padding: '1rem', 
              fontSize: '1rem', 
              minWidth: 0,
              borderRadius: '0.5rem',
              border: '1px solid #ccc'
            }}
          />
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            style={{ 
              padding: '1rem', 
              fontSize: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳' : 'Odeslat'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;