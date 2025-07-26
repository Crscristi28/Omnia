import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 MINIMAL REGEX: Only fix numbered lists, let markdown handle the rest
  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting
    .replace(/^(\d+)\.\s+(.+)$/gm, '$1\\. $2')
    
    // Add spacing between any content and following bullets for proper markdown
    .replace(/^(.+?)(\n)(\* )/gm, '$1\n\n$3');
  
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
      `}</style>
    </div>
  );
};

export default MessageRenderer;