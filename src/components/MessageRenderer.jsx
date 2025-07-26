import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 CUSTOM FORMATTING: Control spacing and structure (from deploy 3cc2168)
  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting
    .replace(/^(\d+)\.\s+(.+)$/gm, '$1\\. $2')
    
    // Add spacing after main sections (Krok 1:, Den 7:, etc.) before numbered lists
    .replace(/^((?:Krok|Den|Step|Day)\s+\d+:.*?)(\n)(\d+\\\.)(.+)$/gm, '$1\n\n$3$4')
    
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
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          // ✅ FULL MARKDOWN + MATH: With KaTeX for math rendering
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
          background-color: #374151 !important;
          border-radius: 8px;
          padding: 1rem;
        }
        .markdown-container code {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        .markdown-container pre code {
          background-color: transparent !important;
          color: #f3f4f6 !important;
        }
        
        /* Syntax highlighting colors for better visibility */
        .markdown-container .token.keyword {
          color: #f97316 !important; /* Orange for keywords */
        }
        .markdown-container .token.string {
          color: #84cc16 !important; /* Lime green for strings */
        }
        .markdown-container .token.number {
          color: #06b6d4 !important; /* Cyan for numbers */
        }
        .markdown-container .token.comment {
          color: #94a3b8 !important; /* Light gray for comments */
        }
        .markdown-container .token.function {
          color: #fbbf24 !important; /* Yellow for functions */
        }
        .markdown-container .token.operator {
          color: #e5e7eb !important; /* White for operators */
        }
        .markdown-container .token.punctuation {
          color: #e5e7eb !important; /* White for punctuation */
        }
      `}</style>
    </div>
  );
};

export default MessageRenderer;