import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 MINIMAL REGEX: Fix numbered lists and day patterns
  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting (but skip math expressions)
    .replace(/^(\d+)\.\s+(.+)$/gm, (match, num, text) => {
      // Skip if line contains $ (likely math expression)
      if (match.includes('$')) return match;
      return `${num}\\. ${text}`;
    })
    
    // Fix "Den X:" patterns that get auto-formatted wrong
    .replace(/^(Den\s+\d+):\s*$/gm, '**$1:**\n')
    
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