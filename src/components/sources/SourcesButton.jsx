// 📁 src/components/sources/SourcesButton.jsx
// 🔗 Sources button component - matches CopyButton styling

import React from 'react';

const SourcesButton = ({ sources = [], onClick, language = 'cs' }) => {
  // Don't render if no sources
  if (!sources || sources.length === 0) {
    return null;
  }

  const getButtonTitle = () => {
    const titles = {
      'cs': `Zobrazit ${sources.length} zdrojů`,
      'en': `Show ${sources.length} sources`,
      'ro': `Arată ${sources.length} surse`
    };
    return titles[language] || titles['cs'];
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.85rem',
        color: 'white',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 0.8
      }}
      title={getButtonTitle()}
      onMouseEnter={(e) => {
        e.target.style.opacity = '1';
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.opacity = '0.8';
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {/* Chain link SVG icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
      </svg>
      
      {/* Sources count */}
      <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
        ({sources.length})
      </span>
    </button>
  );
};

export default SourcesButton;