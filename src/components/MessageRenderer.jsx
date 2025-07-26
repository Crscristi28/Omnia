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
    
    // Convert asterisks back to bullet symbols (in case something converted them)
    .replace(/^(\s*)\*(\s+)(.+)$/gm, '$1• $3')
    
    // Add spacing between different numbered sections
    .replace(/(\d+\\\..*?)(\n\n?)(\d+\\\..)/g, '$1\n\n$3')
    
    // Clean up multiple newlines but preserve intentional spacing
    .replace(/\n{3,}/g, '\n\n');
  
  return (
    <div className={className}>
      <MDEditor.Markdown 
        source={fixedContent} 
        style={{ 
          backgroundColor: 'transparent',
          color: 'inherit'
        }}
        data-color-mode="dark"
        // ✅ ENABLE FULL MARKDOWN: Regex already fixed problematic parts
      />
      
      {/* 🎨 CUSTOM STYLES: Yellow bold text */}
      <style jsx>{`
        .markdown-body strong {
          color: #facc15 !important; /* Tailwind yellow-400 */
          font-weight: bold;
        }
        
        .w-md-editor-text strong {
          color: #facc15 !important; /* Tailwind yellow-400 */
          font-weight: bold;
        }
        
        div[data-color-mode="dark"] strong {
          color: #facc15 !important; /* Tailwind yellow-400 */
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default MessageRenderer;