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
          color: 'inherit'
        }}
        data-color-mode="dark"
      />
    </div>
  );
};

export default MessageRenderer;