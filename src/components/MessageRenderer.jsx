import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  return (
    <div className={className}>
      <MDEditor.Markdown 
        source={content || ''} 
        style={{ 
          backgroundColor: 'transparent',
          color: 'inherit',
          whiteSpace: 'pre-wrap'  // Preserve exact spacing during streaming
        }}
        data-color-mode="dark"
        skipHtml={false}
        allowedElements={undefined}  // Don't restrict elements
        unwrapDisallowed={false}     // Don't unwrap/reformat content
        remarkPlugins={[]}           // Remove all remark plugins that auto-format
        rehypePlugins={[]}           // Remove all rehype plugins that auto-format
        transformLinkUri={null}      // Disable link transformations
        transformImageUri={null}     // Disable image transformations
      />
    </div>
  );
};

export default MessageRenderer;