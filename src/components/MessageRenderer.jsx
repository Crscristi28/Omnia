import React, { Suspense, lazy } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';
import 'katex/dist/katex.css';

// Lazy load markdown editor and plugins for better performance
const MDEditor = lazy(() => import('@uiw/react-md-editor'));
const remarkMath = lazy(() => import('remark-math'));
const rehypeKatex = lazy(() => import('rehype-katex'));

const MessageRenderer = ({ content, className = "text-white" }) => {
  // Direct markdown rendering without regex transformations
  return (
    <div className={className}>
      <div className="markdown-container">
        <Suspense fallback={
          <div style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Loading markdown...
          </div>
        }>
          <LazyMarkdown content={content} />
        </Suspense>
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

// Separate component for lazy-loaded markdown  
const LazyMarkdown = ({ content }) => {
  const [remarkMathPlugin, setRemarkMathPlugin] = React.useState(null);
  const [rehypeKatexPlugin, setRehypeKatexPlugin] = React.useState(null);
  const [MDEditorComponent, setMDEditorComponent] = React.useState(null);

  React.useEffect(() => {
    // Load all components and plugins asynchronously
    Promise.all([
      import('@uiw/react-md-editor'),
      import('remark-math'),
      import('rehype-katex')
    ]).then(([mdEditorModule, remarkMathModule, rehypeKatexModule]) => {
      setMDEditorComponent(() => mdEditorModule.default);
      setRemarkMathPlugin(() => remarkMathModule.default);
      setRehypeKatexPlugin(() => rehypeKatexModule.default);
    }).catch(error => {
      console.error('Failed to load markdown components:', error);
    });
  }, []);

  if (!MDEditorComponent) {
    return (
      <div style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
        Loading markdown...
      </div>
    );
  }

  return (
    <MDEditorComponent.Markdown 
      source={content || ''} 
      style={{ 
        backgroundColor: 'transparent',
        color: 'inherit'
      }}
      data-color-mode="dark"
      remarkPlugins={remarkMathPlugin ? [remarkMathPlugin] : []}
      rehypePlugins={rehypeKatexPlugin ? [rehypeKatexPlugin] : []}
    />
  );
};

export default MessageRenderer;