import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 MINIMAL REGEX: Only fix numbered lists, let markdown handle the rest
  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting (but skip math expressions)
    .replace(/^(\d+)\.\s+(.+)$/gm, (match, num, text) => {
      // Skip if line contains $ (likely math expression)
      if (match.includes('$')) return match;
      return `${num}\\. ${text}`;
    })
    
    // Add spacing after numbered lines for better readability
    .replace(/^(\d+\\\..*?)(\n)/gm, '$1\n\n')
    
    // Remove leading spaces before asterisks to prevent code blocks
    .replace(/^\s+\*/gm, '*');
  
  return (
    <div className={className}>
      <div className="markdown-container">
        <MDEditor.Markdown 
          source={fixedContent} 
          style={{ 
            backgroundColor: 'transparent',
            color: 'inherit'
          }}
          data-color-mode="dark"
          // ✅ FULL MARKDOWN: MDEditor has all plugins built-in
        />
      </div>
      
      <style>{`
        .markdown-container strong {
          color: #facc15 !important;
          font-weight: bold !important;
        }
        .markdown-container .w-md-editor-text strong {
          color: #facc15 !important;
        }
        .markdown-container .w-md-editor-text b {
          color: #facc15 !important;
        }
        .w-md-editor-text strong {
          color: #facc15 !important;
        }
        .w-md-editor-text b {
          color: #facc15 !important;
        }
        
        /* Code block styling */
        .markdown-container pre {
          background-color: #e5e7eb !important;
          border-radius: 8px;
          padding: 1rem;
        }
        .markdown-container code {
          background-color: #e5e7eb !important;
        }
        .markdown-container pre code {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default MessageRenderer;