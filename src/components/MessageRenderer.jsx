import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import '@uiw/react-md-editor/markdown-editor.css';
import 'katex/dist/katex.css';

// Pre-process content to fix bullet points and formatting
const preprocessMarkdown = (text) => {
  if (!text) return '';
  
  let processed = text;
  
  // Fix bullet points - add newline before bullets if missing
  processed = processed.replace(/([^\n])\n•/g, '$1\n\n•');
  processed = processed.replace(/([^\n])\n\*/g, '$1\n\n*');
  processed = processed.replace(/([^\n])\n-/g, '$1\n\n-');
  
  // Convert bullet symbols to markdown dashes for better compatibility
  processed = processed.replace(/^\s*•\s+/gm, '- ');
  
  // Fix numbered lists spacing
  processed = processed.replace(/([^\n])\n(\d+\.)/g, '$1\n\n$2');
  
  return processed;
};

const MessageRenderer = ({ content, className = "text-white", isStreaming = false }) => {
  // During streaming: render as plain text to prevent markdown re-parsing
  // After completion: render as markdown for proper formatting
  
  if (isStreaming) {
    return (
      <div className={className}>
        <div className="streaming-text" style={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          color: 'inherit'
        }}>
          {content || ''}
        </div>
      </div>
    );
  }
  
  // Pre-process content for better markdown parsing
  const processedContent = preprocessMarkdown(content);
  
  // Final render with full markdown parsing
  return (
    <div className={className}>
      <div className="markdown-container">
        <MDEditor.Markdown 
          source={processedContent} 
          style={{ 
            backgroundColor: 'transparent',
            color: 'inherit'
          }}
          data-color-mode="dark"
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
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