// 📁 src/components/ui/TypewriterText.jsx
// ⌨️ Typewriter effect for bot messages with markdown support

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// 🔧 MARKDOWN CLEANUP - Same as App.jsx
function cleanMarkdownLists(text) {
  if (!text) return text;
  
  const isMobile = window.innerWidth <= 768;
  
  // BRUTALLY aggressive cleanup - remove ALL extra newlines between bullets
  let cleaned = text
    // Remove backslashes that might appear in text
    .replace(/\\/g, '')
    // ULTRA AGGRESSIVE: Remove ALL multiple newlines between bullets
    .replace(/([\*•○▪◦\-]\s+[^\n]+)\n{2,}(?=\s*[\*•○▪◦\-])/g, '$1\n')
    .replace(/(\d+[\.)]\s+[^\n]+)\n{2,}(?=\s*\d+[\).])/g, '$1\n')
    // Even remove single extra newlines if there are spaces
    .replace(/([\*•○▪◦\-]\s+[^\n]+)\n\s*\n+(?=\s*[\*•○▪◦\-])/g, '$1\n')
    // Remove any whitespace-only lines between bullets
    .replace(/([\*•○▪◦\-][^\n]+)\n\s*\n(?=[\*•○▪◦\-])/g, '$1\n')
    // Clean up any 3+ newlines anywhere
    .replace(/\n{3,}/g, '\n\n')
    // Keep space after headers
    .replace(/(#{1,6}[^\n]+|[^\n]+:)\n+(?=[\*•○▪◦\-])/g, '$1\n\n');
  
  // Final cleanup
  cleaned = cleaned
    .replace(/\n+(\s+[\*•○▪◦\-])/g, '\n$1')
    .replace(/ +$/gm, '');
    
  return cleaned;
}

function TypewriterText({ text, isStreaming = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const chars = useMemo(() => Array.from(text), [text]);
  const isMobile = window.innerWidth <= 768;

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
    <div style={{ whiteSpace: 'pre-wrap' }}>
      <ReactMarkdown
        components={{
          // Custom rendering for markdown elements - SAME AS APP.JSX
          strong: ({children}) => <strong style={{color: '#FFD700', fontWeight: '600'}}>{children}</strong>,
          ul: ({children}) => <ul style={{
            marginLeft: isMobile ? '10px' : '20px', 
            marginTop: isMobile ? '4px' : '8px', 
            marginBottom: isMobile ? '4px' : '8px',
            paddingLeft: '5px'
          }}>{children}</ul>,
          li: ({children}) => <li style={{
            marginBottom: isMobile ? '0px' : '4px',
            paddingLeft: '3px',
            lineHeight: isMobile ? '1.4' : '1.6'
          }}>{children}</li>,
          p: ({ children }) => <p style={{ margin: '8px 0', lineHeight: '1.6' }}>{children}</p>,
          em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          code: ({ inline, children }) => 
            inline ? (
              <code style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                padding: '0.2em 0.4em', 
                borderRadius: '3px',
                fontSize: '0.9em'
              }}>
                {children}
              </code>
            ) : (
              <pre style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                padding: '1em', 
                borderRadius: '6px',
                overflowX: 'auto',
                marginTop: '0.5em',
                marginBottom: '0.5em'
              }}>
                <code>{children}</code>
              </pre>
            ),
          h1: ({ children }) => <h1 style={{ fontSize: '1.5em', fontWeight: '600', marginTop: '0.8em', marginBottom: '0.4em' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.3em', fontWeight: '600', marginTop: '0.7em', marginBottom: '0.35em' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1.1em', fontWeight: '600', marginTop: '0.6em', marginBottom: '0.3em' }}>{children}</h3>,
          a: ({ href, children }) => <a href={href} style={{ color: '#00ffff', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{children}</a>,
          blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(255, 255, 255, 0.3)', paddingLeft: '1em', marginLeft: '0', marginTop: '0.5em', marginBottom: '0.5em', opacity: '0.8' }}>{children}</blockquote>,
        }}
      >
        {cleanMarkdownLists(displayedText)}
      </ReactMarkdown>
      {isStreaming && (
        <span style={{ 
          animation: 'blink 1s infinite',
          color: '#00ffff',
          fontWeight: 'bold',
          textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
          display: 'inline-block',
          marginLeft: '2px'
        }}>
          |
        </span>
      )}
    </div>
  );
}

export default TypewriterText;