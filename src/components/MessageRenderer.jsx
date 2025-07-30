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

const MessageRenderer = ({ content, className = "text-white", isStreaming = false, isTyping = false }) => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const prevStreamingRef = React.useRef(isStreaming);
  
  // Detect transition from streaming to final
  React.useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);
  
  // Show typing indicator
  if (isTyping) {
    return (
      <div className={className}>
        <div className="typing-indicator" style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 0'
        }}>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
        
        <style>{`
          .typing-dot {
            width: 8px;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: typingAnimation 1.4s infinite ease-in-out;
          }
          
          .typing-dot:nth-child(1) {
            animation-delay: -0.32s;
          }
          
          .typing-dot:nth-child(2) {
            animation-delay: -0.16s;
          }
          
          @keyframes typingAnimation {
            0%, 80%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            40% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
        `}</style>
      </div>
    );
  }
  
  if (isStreaming) {
    return (
      <div className={className}>
        <div className="streaming-text" style={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          color: 'inherit',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif',
          fontSize: 'inherit',
          opacity: 0.9
        }}>
          {preprocessStreamingText(content)}
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
      <div className={`markdown-container ${isTransitioning ? 'transitioning' : ''}`}>
        <MDEditor.Markdown 
          source={content} 
          style={{ 
            backgroundColor: 'transparent',
            color: 'inherit',
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(5px)' : 'translateY(0)',
            transition: 'all 0.3s ease'
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
        
        /* Stabilize text rendering to prevent jumping */
        .markdown-container {
          min-height: 1.6em; /* Prevent height fluctuations */
        }
        
        /* Ensure consistent spacing for all paragraph content */
        .markdown-container p:not(:last-child) {
          margin-bottom: 1rem !important;
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