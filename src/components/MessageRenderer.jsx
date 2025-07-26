import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MessageRenderer = ({ content, className = "text-white" }) => {
  // 🚀 CUSTOM FORMATTING: Control spacing and structure
  const fixedContent = (content || '')
    // Escape numbered lists to prevent auto-formatting
    .replace(/^(\d+)\.\s+(.+)$/gm, '$1\\. $2')
    
    // Control spacing between numbered items (add line break after each number+text)
    .replace(/^(\d+\\\..*?)(?=\n•)/gm, '$1\n')
    
    // Control bullet spacing and indentation  
    .replace(/^(\s*)(•|-)(\s+)(.+)$/gm, '$1$2 $4')
    
    // Add spacing between different numbered sections
    .replace(/(\d+\\\..*?)(\n\n?)(\d+\\\..)/g, '$1\n\n$3')
    
    // Clean up multiple newlines but preserve intentional spacing
    .replace(/\n{3,}/g, '\n\n');
  
  return (
    <div className={className}>
      <MDEditor.Markdown 
        source={fixedContent} 
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