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

import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { claudeService, openaiService } from './services/apiService';

const API_BASE_URL = 'https://omnia-project-nyb3.vercel.app'; // vlož sem URL z Vercelu

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  // Načtení historie z localStorage při startu, nebo vymazání při reloadu
  useEffect(() => {
    const navType = window.performance?.navigation?.type;
    if (navType === 1) { // Reload
      localStorage.removeItem('openai-memory');
      setMessages([]);
    } else {
      const saved = localStorage.getItem('openai-memory');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          setMessages([]);
        }
      }
    }
  }, []);
  const [model, setModel] = useState('gpt-4o'); // 'gpt-4o' or 'claude'
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let responseText = '';

    try {
      if (model === 'gpt-4o') {
        const openAiMessages = [
          { role: 'system', content: 'Jmenuješ se Omnia. Odpovídej vždy výhradně v češtině, gramaticky správně a přirozeně. Piš stručně, jako chytrý a lidsky znějící člověk, bez formálností. Nepiš "Jsem AI" ani se nijak nepředstavuj. Odpovědi musí být stylisticky i jazykově bezchybné, jako by je psal rodilý mluvčí.' },
          ...newMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ];

        responseText = await openaiService.sendMessage(openAiMessages);
      } else if (model === 'claude') {
        responseText = await claudeService.sendMessage(newMessages);
      }
    } catch (err) {
      responseText = 'Chyba při načítání odpovědi (zkontroluj klíč nebo model).';
    }

    const updatedMessages = [...newMessages, { sender: 'bot', text: responseText }];
    setMessages(updatedMessages);
    localStorage.setItem('openai-memory', JSON.stringify(updatedMessages));
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length > 0 && endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // short delay to ensure DOM is updated

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
                  <select value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="gpt-4o">OpenAI</option>
                    <option value="claude">Anthropic</option>
                  </select>
                  <button
                    onClick={() => {
                      localStorage.removeItem('openai-memory');
                      setMessages([]);
                    }}
                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Nový chat
                  </button>
                </div>
              </div>
            </header>

            <main className="chat-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '200px', overflowY: 'auto', height: 'calc(100vh - 300px)', scrollBehavior: 'smooth' }}>
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
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.sender === 'bot' ? (
                      <TypewriterText text={msg.text} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {loading && <p className="loading">Načítání odpovědi…</p>}
              <div ref={endOfMessagesRef} />
            </main>
          </div> {/* konec app-container */}
        </div> {/* konec app-center-wrapper */}
      </div>
      <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#fff', paddingBottom: '1rem', zIndex: 1000 }}>
        <footer className="chat-input-container" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Zeptej se Omnie…"
            style={{ flexGrow: 1, padding: '1rem', fontSize: '1rem', minWidth: 0 }}
          />
          <button onClick={handleSend} style={{ padding: '1rem', fontSize: '1rem' }}>Odeslat</button>
        </footer>
      </div>
    </div>
  );
}

export default App;