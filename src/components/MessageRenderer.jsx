import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import '@uiw/react-md-editor/markdown-editor.css';
import 'katex/dist/katex.css';


// Aggressive preprocessing for better visual during streaming
const preprocessStreamingText = (text) => {
  if (!text) return '';
  
  // More comprehensive replacements
  let processed = text
    // Bullets
    .replace(/^[\s]*[•·∙‣⁃]\s*/gm, '• ')  // Normalize all bullet types
    .replace(/\n[\s]*[•·∙‣⁃]\s*/g, '\n• ') 
    .replace(/^[\s]*[*-]\s+/gm, '• ')     // Convert * and - to bullets
    .replace(/\n[\s]*[*-]\s+/g, '\n• ')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '$1')      // Remove bold markers
    // Headers (temporary removal)
    .replace(/^#{1,6}\s+/gm, '')          // Remove header markers
    // Code blocks (temporary simplification)
    .replace(/```[\s\S]*?```/g, '[Code block]')
    .replace(/`([^`]+)`/g, '$1');         // Remove inline code markers
    
  return processed;
};

const MessageRenderer = ({ content, className = "text-white", isStreaming = false }) => {
  // TEMPORARILY DISABLED: Transition causes scroll jumping with Virtuoso
  // const [isTransitioning, setIsTransitioning] = React.useState(false);
  // const prevStreamingRef = React.useRef(isStreaming);
  
  // // Detect transition from streaming to final
  // React.useEffect(() => {
  //   if (prevStreamingRef.current && !isStreaming) {
  //     setIsTransitioning(true);
  //     const timer = setTimeout(() => setIsTransitioning(false), 300);
  //     return () => clearTimeout(timer);
  //   }
  //   prevStreamingRef.current = isStreaming;
  // }, [isStreaming]);
  
  
  if (isStreaming) {
    return (
      <div className={className}>
        <div className="streaming-text" style={{ 
          whiteSpace: 'normal',
          lineHeight: '1.6',
          color: 'inherit',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif',
          fontSize: 'inherit',
          opacity: 0.9
        }}>
          {content}
        </div>
        
        <style>{`
          .streaming-text {
            animation: subtlePulse 2s ease-in-out infinite;
          }
          
          @keyframes subtlePulse {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 1; }
          }
          
          /* Smooth text appearance */
          .streaming-text {
            position: relative;
          }
        `}</style>
      </div>
    );
  }
  
  // Final render with full markdown parsing
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
        
        /* List styling - CONSISTENT and STABLE formatting */
        .markdown-container .w-md-editor-text ul,
        .markdown-container .w-md-editor-text ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
          list-style-position: inside;
        }
        .markdown-container .w-md-editor-text li {
          margin-bottom: 0.5rem;
          padding-left: 0.25rem;
          line-height: 1.6;
        }
        .markdown-container .w-md-editor-text ul li {
          list-style-type: disc; /* Level 1: plný kruh ● */
        }
        .markdown-container .w-md-editor-text ul ul li {
          list-style-type: circle; /* Level 2: prázdný kruh ○ */
        }
        .markdown-container .w-md-editor-text ul ul ul li {
          list-style-type: square; /* Level 3: čtvereček ■ */
        }
        .markdown-container .w-md-editor-text ol li {
          list-style-type: decimal;
        }
        /* Ensure bullets are properly sized and positioned */
        .markdown-container .w-md-editor-text ul li::marker {
          font-size: 1em;
          color: inherit;
        }
        .markdown-container .w-md-editor-text ol li::marker {
          font-size: 1em;
          color: inherit;
          font-weight: normal;
        }
        /* Nested lists */
        .markdown-container .w-md-editor-text ul ul,
        .markdown-container .w-md-editor-text ol ol,
        .markdown-container .w-md-editor-text ul ol,
        .markdown-container .w-md-editor-text ol ul {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }
        
        /* Paragraph styling - STABLE formatting */
        .markdown-container .w-md-editor-text p {
          line-height: 1.5;
          margin: 0.5rem 0;
        }
        .markdown-container .w-md-editor-text p:first-child {
          margin-top: 0;
        }
        .markdown-container .w-md-editor-text p:last-child {
          margin-bottom: 0;
        }
        
        /* Container stability - prevent layout shifts */
        .markdown-container {
          min-height: 1.5em;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        
        /* List and paragraph spacing coordination */
        .markdown-container .w-md-editor-text p + ul,
        .markdown-container .w-md-editor-text p + ol {
          margin-top: 0.25rem;
        }
        .markdown-container .w-md-editor-text ul + p,
        .markdown-container .w-md-editor-text ol + p {
          margin-top: 0.5rem;
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


export default React.memo(MessageRenderer);