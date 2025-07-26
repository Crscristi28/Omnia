import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 CUSTOM FORMATTING: Control spacing and structure
  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting
    .replace(/^(\d+)\.\s+(.+)$/gm, '$1\\. $2')
    
    // Add space between numbered items and following bullets
    .replace(/^(\d+\\\..*?)(\n)(•)/gm, '$1\n\n$3')
    
    // Preserve bullet symbols and fix spacing
    .replace(/^(\s*)(•)(\s+)(.+)$/gm, '$1$2 $4')
    
    // Convert single asterisks to bullets (but preserve double asterisks for bold)
    .replace(/^(\s*)(?<!\*)\*(?!\*)(\s+)(.+)$/gm, '$1• $3')
    
    // Add spacing between different numbered sections
    .replace(/(\d+\\\..*?)(\n\n?)(\d+\\\..)/g, '$1\n\n$3')
    
    // Clean up multiple newlines but preserve intentional spacing
    .replace(/\n{3,}/g, '\n\n');
  
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
          // ✅ ENABLE FULL MARKDOWN: Regex already fixed problematic parts
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