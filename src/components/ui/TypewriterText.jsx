// 📁 src/components/ui/TypewriterText.jsx
// ⌨️ Typewriter effect for bot messages with markdown support

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

function TypewriterText({ text, isStreaming = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const chars = useMemo(() => Array.from(text), [text]);
  const isMobile = window.innerWidth <= 768; // Same logic as App.jsx

  useEffect(() => {
    if (text.length < displayedText.length) {
      setDisplayedText('');
      setCharIndex(0);
      return;
    }

    if (isStreaming) {
      setDisplayedText(text);
      setCharIndex(text.length);
      return;
    }

    if (charIndex >= chars.length) return;
    
    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + chars[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, 18);
    
    return () => clearTimeout(timeout);
  }, [charIndex, chars, text, isStreaming, displayedText]);

  return (
    <div style={{ 
      whiteSpace: 'pre-wrap',
      fontSize: isMobile ? '1rem' : '0.95rem',
      lineHeight: isMobile ? '1.3' : '1.6',
      color: '#FFFFFF'
    }}>
      <ReactMarkdown
        components={{
          // Custom rendering for markdown elements
          p: ({ children }) => <p style={{ margin: '6px 0', lineHeight: window.innerWidth <= 768 ? '1.3' : '1.6' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>{children}</ul>,
          li: ({ children }) => <li style={{ 
            marginBottom: isMobile ? '2px' : '4px',
            display: 'list-item',
            listStylePosition: 'outside'
          }}>{children}</li>,
          strong: ({ children }) => <strong style={{ color: '#FFD700', fontWeight: '600' }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#E0E0E0' }}>{children}</em>,
          code: ({ inline, children }) => 
            inline ? (
              <code style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '0.9em'
              }}>
                {children}
              </code>
            ) : (
              <pre style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                padding: '12px', 
                borderRadius: '6px',
                overflowX: 'auto',
                marginTop: '8px',
                marginBottom: '8px'
              }}>
                <code>{children}</code>
              </pre>
            ),
          h1: ({ children }) => <h1 style={{ fontSize: '1.4em', fontWeight: '600', margin: '16px 0 8px 0', color: '#FFD700' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.2em', fontWeight: '600', margin: '12px 0 6px 0', color: '#FFD700' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1.1em', fontWeight: '600', margin: '10px 0 5px 0', color: '#FFD700' }}>{children}</h3>,
          a: ({ href, children }) => <a href={href} style={{ color: '#00ffff', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{children}</a>,
          blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(255, 255, 255, 0.3)', paddingLeft: '12px', marginLeft: '0', marginTop: '8px', marginBottom: '8px', opacity: '0.9' }}>{children}</blockquote>,
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {isStreaming && (
        <span style={{ 
          color: '#00ffff',
          fontWeight: 'bold',
          textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
          display: 'inline-block',
          marginLeft: '2px',
          opacity: '0.7'
        }}>
          |
        </span>
      )}
    </div>
  );
}

export default TypewriterText;