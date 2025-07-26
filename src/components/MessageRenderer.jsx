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
      />
    </div>
  );
};

export default MessageRenderer;