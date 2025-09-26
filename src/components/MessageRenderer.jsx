import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import '@uiw/react-md-editor/markdown-editor.css';
import 'katex/dist/katex.css';

// Import YouTube utilities and component
import { findYouTubeUrls } from '../utils/youtube';
import { YouTubeEmbed } from './ui';


// Escape dollar signs in prices to prevent LaTeX parsing
const escapePricesInText = (text) => {
  if (!text) return '';

  // Regex to match price patterns: $number with optional cents
  // Look for $ followed by digits, optionally followed by .digits
  // Use word boundaries to avoid matching variables
  return text.replace(/\$(\d+(?:\.\d{1,2})?)\b/g, '\\$$$1');
};

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

/**
 * Parse content into segments - text and YouTube embeds
 * @param {string} content - Message content
 * @returns {Array} - Array of {type: 'text'|'youtube', content: string, videoId?: string}
 */
const parseContentSegments = (content) => {
  if (!content) return [{ type: 'text', content: '' }];
  
  const youtubeUrls = findYouTubeUrls(content);
  if (youtubeUrls.length === 0) {
    return [{ type: 'text', content }];
  }
  
  const segments = [];
  let lastIndex = 0;
  
  youtubeUrls.forEach((match) => {
    // Add text before YouTube URL
    if (match.startIndex > lastIndex) {
      const textContent = content.slice(lastIndex, match.startIndex);
      if (textContent.trim()) {
        segments.push({ type: 'text', content: textContent });
      }
    }
    
    // Add YouTube embed
    segments.push({ 
      type: 'youtube', 
      content: match.url,
      videoId: match.videoId 
    });
    
    lastIndex = match.endIndex;
  });
  
  // Add remaining text after last YouTube URL
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      segments.push({ type: 'text', content: textContent });
    }
  }
  
  return segments;
};

const MessageRenderer = ({ content, className = "text-white", isStreaming = false, isSearching = false }) => {
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
  
  // Parse content into segments for YouTube embed support
  const segments = React.useMemo(() => {
    let processedContent = content;

    // Check if content contains shimmer HTML and update text based on isSearching flag
    if (processedContent.includes('shimmer-skeleton') && processedContent.includes('Thinking...')) {
      const shimmerText = isSearching ? 'Searching...' : 'Thinking...';
      processedContent = processedContent.replace(/>(Thinking\.\.\.)</, `>${shimmerText}<`);
    } else if (processedContent.includes('shimmer-skeleton') && processedContent.includes('Searching...') && !isSearching) {
      processedContent = processedContent.replace(/>(Searching\.\.\.)</, '>Thinking...<');
    }

    // First escape prices to prevent LaTeX conflicts
    const contentWithEscapedPrices = escapePricesInText(processedContent);
    return parseContentSegments(contentWithEscapedPrices);
  }, [content, isSearching]);

  // Unified rendering - same for streaming and final
  return (
    <div className={className}>
      <div className={`markdown-container ${isStreaming ? 'is-streaming' : ''}`}>
        {segments.map((segment, index) => (
          segment.type === 'youtube' ? (
            <YouTubeEmbed 
              key={`youtube-${index}-${segment.videoId}`}
              videoId={segment.videoId}
              title="YouTube video"
            />
          ) : (
            <MDEditor.Markdown 
              key={`text-${index}`}
              source={segment.content} 
              style={{ 
                backgroundColor: 'transparent',
                color: 'inherit'
              }}
              data-color-mode="dark"
              remarkPlugins={[
                [remarkMath, { singleDollarTextMath: true }], // Enable $...$ for math, prices are escaped
                remarkGfm
              ]}
              rehypePlugins={[rehypeKatex]}
            />
          )
        ))}
      </div>
      
      <style>{`
        /* Bold text styling with GPU acceleration to prevent rendering artifacts */
        .markdown-container strong,
        .markdown-container .w-md-editor-text strong,
        .markdown-container .w-md-editor-text b,
        .w-md-editor-text strong,
        .w-md-editor-text b {
          color: #facc15 !important;
          font-weight: bold !important;
          /* GPU acceleration for smooth bold text rendering */
          transform: translateZ(0);
          will-change: auto;
          backface-visibility: hidden;
          /* Prevent text measurement artifacts during streaming */
          contain: layout style;
          /* Force consistent rendering */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Enhanced GPU acceleration for bold text during streaming */
        .markdown-container.is-streaming strong,
        .markdown-container.is-streaming .w-md-editor-text strong,
        .markdown-container.is-streaming .w-md-editor-text b {
          will-change: transform, opacity !important;
        }
        
        /* List styling - CONSISTENT and STABLE formatting */
        .markdown-container .w-md-editor-text ul,
        .markdown-container .w-md-editor-text ol {
          padding: 0.75rem 0 0.75rem 1.5rem;
          list-style-position: inside;
        }
        .markdown-container .w-md-editor-text li {
          padding: 0 0.25rem 0.5rem 0.25rem;
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
          padding: 0.5rem 0 0.5rem 1.25rem;
        }
        
        /* Paragraph styling - STABLE formatting */
        .markdown-container .w-md-editor-text p {
          line-height: 1.5;
          padding: 0.5rem 0;
        }
        .markdown-container .w-md-editor-text p:first-child {
          padding-top: 0;
        }
        .markdown-container .w-md-editor-text p:last-child {
          padding-bottom: 0;
        }
        
        /* Container stability - prevent layout shifts + GPU acceleration */
        .markdown-container {
          min-height: 1.5em;
          overflow-wrap: break-word;
          word-wrap: break-word;
          /* GPU acceleration for smooth rendering */
          transform: translateZ(0);
          backface-visibility: hidden;
          /* Text rendering optimization */
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          /* Safari font synthesis fix - prevent fake bold rendering */
          font-synthesis: none;
        }

        /* GPU acceleration only during streaming - prevent memory leaks */
        .markdown-container.is-streaming {
          will-change: transform;
        }

        /* Hide HR elements during streaming to prevent flickering separators */
        .markdown-container.is-streaming .w-md-editor-text hr,
        .markdown-container.is-streaming .wmde-markdown hr {
          display: none !important;
        }

        /* Clean up GPU resources after streaming */
        .markdown-container:not(.is-streaming) {
          will-change: auto;
        }
        
        /* List and paragraph spacing coordination */
        .markdown-container .w-md-editor-text p + ul,
        .markdown-container .w-md-editor-text p + ol {
          padding-top: 0.25rem;
        }
        .markdown-container .w-md-editor-text ul + p,
        .markdown-container .w-md-editor-text ol + p {
          padding-top: 0.5rem;
        }
        
        /* Code block styling - FORCE dark theme always (looks best) */
        .markdown-container pre,
        .markdown-container .w-md-editor-text pre,
        .w-md-editor-text-pre .wmde-markdown pre,
        .wmde-markdown pre,
        [data-color-mode="light"] pre,
        [data-color-mode="dark"] pre {
          background-color: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          padding: 1rem !important;
          color: #f3f4f6 !important;
        }
        .markdown-container code,
        .markdown-container .w-md-editor-text code,
        .wmde-markdown code,
        [data-color-mode="light"] code,
        [data-color-mode="dark"] code {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        .markdown-container pre code,
        .markdown-container .w-md-editor-text pre code,
        .wmde-markdown pre code,
        [data-color-mode="light"] pre code,
        [data-color-mode="dark"] pre code {
          background-color: transparent !important;
          color: #f3f4f6 !important;
        }

        /* Force override MDEditor's light mode */
        [data-color-mode="light"] .markdown-container * {
          color-scheme: dark !important;
        }
        
        /* Syntax highlighting colors - optimized for dark background */
        .markdown-container .token.keyword,
        [data-color-mode="light"] .token.keyword {
          color: #f97316 !important; /* Orange for keywords */
        }
        .markdown-container .token.string,
        [data-color-mode="light"] .token.string {
          color: #84cc16 !important; /* Lime green for strings */
        }
        .markdown-container .token.number,
        [data-color-mode="light"] .token.number {
          color: #06b6d4 !important; /* Cyan for numbers */
        }
        .markdown-container .token.comment,
        [data-color-mode="light"] .token.comment {
          color: #94a3b8 !important; /* Light gray for comments */
        }
        .markdown-container .token.function,
        [data-color-mode="light"] .token.function {
          color: #fbbf24 !important; /* Yellow for functions */
        }
        .markdown-container .token.operator,
        [data-color-mode="light"] .token.operator {
          color: #e5e7eb !important; /* White for operators */
        }
        .markdown-container .token.punctuation,
        [data-color-mode="light"] .token.punctuation {
          color: #e5e7eb !important; /* White for punctuation */
        }

        /* Disable text selection during streaming to prevent blue line artifact */
        .markdown-container.is-streaming {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* Ensure selection is enabled after streaming completes */
        .markdown-container:not(.is-streaming) {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
      `}</style>
    </div>
  );
};


export default React.memo(MessageRenderer);