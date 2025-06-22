// App.jsx - MOBILE OPTIMIZED VERZE

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

  // Detekce mobile zařízení
  const isMobile = window.innerWidth <= 768;

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
    <div className="main-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="app light" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* KOMPAKTNÍ HEADER PRO MOBILE */}
        <header style={{ 
          padding: isMobile ? '1rem 0.5rem 0.5rem' : '2rem 1rem 1rem',
          background: '#fff',
          borderBottom: '1px solid #eee',
          position: 'relative'
        }}>
          {/* Logo - menší na mobile */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '0.5rem' : '1rem' }}>
            <img
              src="/omnia.png"
              alt="Omnia Logo"
              style={{ 
                width: isMobile ? '200px' : '300px', 
                height: 'auto' 
              }}
            />
          </div>

          {/* Controls - větší na mobile */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {/* Model selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 'bold' 
              }}>
                Model:
              </label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ 
                  padding: isMobile ? '0.6rem' : '0.4rem',
                  fontSize: isMobile ? '1rem' : '0.9rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ccc',
                  minWidth: isMobile ? '140px' : 'auto'
                }}
              >
                <option value="gpt-4o">Omnia (GPT-4)</option>
                <option value="claude">Omnia (Claude)</option>
              </select>
            </div>

            {/* Online status */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: isMobile ? '0.8rem' : '0.8rem',
              color: '#666'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#4CAF50', 
                borderRadius: '50%' 
              }}></div>
              Online
            </div>

            {/* Nový chat button */}
            <button
              onClick={() => {
                localStorage.removeItem('omnia-memory');
                setMessages([]);
              }}
              style={{ 
                padding: isMobile ? '0.6rem 1rem' : '0.5rem 1rem',
                fontSize: isMobile ? '0.9rem' : '0.8rem',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              Nový chat
            </button>
          </div>
        </header>

        {/* CHAT CONTAINER */}
        <main style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          paddingBottom: isMobile ? '100px' : '120px' // prostor pro input
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
                    color: '#000',
                    padding: isMobile ? '1rem' : '0.8rem 1rem',
                    borderRadius: '1rem',
                    maxWidth: isMobile ? '85%' : '70%',
                    fontSize: isMobile ? '1.1rem' : '1rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* AI indikátor */}
                  {msg.sender === 'bot' && (
                    <div style={{ 
                      fontSize: isMobile ? '0.8rem' : '0.7rem',
                      opacity: 0.6, 
                      marginBottom: '0.5rem'
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
                marginBottom: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#F1F0F0',
                  padding: isMobile ? '1rem' : '0.8rem 1rem',
                  borderRadius: '1rem',
                  fontSize: isMobile ? '1.1rem' : '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
          </div>
        </main>

        {/* FIXED INPUT AREA */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0,
          right: 0,
          background: '#fff', 
          padding: isMobile ? '1rem' : '1rem',
          borderTop: '1px solid #eee',
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 1rem)' : '1rem'
        }}>
          <div style={{ 
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex', 
            gap: isMobile ? '0.5rem' : '1rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Zeptej se Omnie…"
              disabled={loading}
              style={{ 
                flex: 1,
                padding: isMobile ? '1.2rem' : '1rem',
                fontSize: isMobile ? '1.1rem' : '1rem',
                borderRadius: '1rem',
                border: '1px solid #ccc',
                outline: 'none',
                backgroundColor: loading ? '#f5f5f5' : '#fff'
              }}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              style={{ 
                padding: isMobile ? '1.2rem 1.5rem' : '1rem',
                fontSize: isMobile ? '1.1rem' : '1rem',
                borderRadius: '1rem',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                minWidth: isMobile ? '80px' : '100px'
              }}
            >
              {loading ? '⏳' : 'Odeslat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;