import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 CUSTOM FORMATTING: Control spacing and structure (from deploy 3cc2168)
  // Skip processing if content already contains processed HTML
  if ((content || '').includes('bullet-item')) {
    return (
      <div className={className}>
        <div className="markdown-container">
          <MDEditor.Markdown 
            source={content} 
            style={{ 
              backgroundColor: 'transparent',
              color: 'inherit'
            }}
            data-color-mode="dark"
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          />
        </div>
      </div>
    );
  }

  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting
    .replace(/^(\d+)\.\s+(.+)$/gm, '$1\\. $2')
    
    // Add spacing after main sections (Krok 1:, Den 7:, etc.) before numbered lists
    .replace(/^((?:Krok|Den|Step|Day)\s+\d+:.*?)(\n)(\d+\\\.)(.+)$/gm, '$1\n\n$3$4')
    
    // Add space between numbered items and following bullets
    .replace(/^(\d+\\\..*?)(\n)(•)/gm, '$1\n\n$3')
    
    // Convert bullet points to HTML with proper spacing for consistent rendering
    .replace(/^(\s*)(•)(\s+)(.+)$/gm, (match, indent, bullet, space, text) => {
      // Skip if already processed (contains HTML tags)
      if (match.includes('<div') || match.includes('</div>')) {
        return match;
      }
      // Only process complete-looking bullet points (avoid streaming artifacts)
      if (text.trim().length >= 2 && !text.endsWith('...') && text.length > 3) {
        return `${indent}<div class="bullet-item">• ${text}</div>`;
      }
      return match; // Keep original for incomplete bullets
    })
    
    // Convert single asterisks to markdown list items (but preserve double asterisks for bold)
    .replace(/^(\s*)(?<!\*)\*(?!\*)(\s+)(.+)$/gm, (match, indent, space, text) => {
      // Skip if line contains HTML or already processed bullets
      if (match.includes('<div') || match.includes('</div>') || match.includes('bullet-item')) {
        return match;
      }
      return `${indent}- ${text}`;
    })

    // Add spacing around dash bullets to prevent code block interference
    .replace(/(\n)(\s*-\s+.+)(\n)/g, '$1\n$2\n$3')
    
    // Add spacing between different numbered sections
    .replace(/(\d+\\\..*?)(\n\n?)(\d+\\\..)/g, '$1\n\n$3')
    
    // Ensure spacing after numbered items that have content following them
    .replace(/^(\d+\\\. .+)(\n)(?=[^\n])/gm, '$1\n\n')
    
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
        
        /* List styling for proper indentation */
        .markdown-container ul {
          margin-left: 1.5rem !important;
          padding-left: 0 !important;
          list-style-position: outside !important;
        }
        .markdown-container ol {
          margin-left: 0 !important;
          padding-left: 1.5rem !important;
          list-style-position: outside !important;
        }
        .markdown-container li {
          margin-bottom: 0.5rem !important;
          padding-left: 0.5rem !important;
        }
        .markdown-container ul li {
          list-style-type: disc !important;
        }
        .markdown-container ol li {
          list-style-type: decimal !important;
        }
        
        /* Styling for bullet points (•) that aren't converted to markdown lists */
        .markdown-container p {
          line-height: 1.6 !important;
          margin-bottom: 0.5rem !important;
        }
        
        /* Bullet item styling for consistent rendering */
        .markdown-container .bullet-item {
          margin-left: 1.5rem !important;
          text-indent: -1.5rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.6 !important;
          display: block !important;
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