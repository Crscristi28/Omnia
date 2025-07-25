import React from 'react';
import CodePreview from '@uiw/react-code-preview';

const ReactCodeBlock = ({ code, language = 'javascript' }) => {
  return (
    <CodePreview
      code={code}
      language={language}
      style={{
        margin: '8px 0',
        backgroundColor: '#1e1e1e',
        borderRadius: '4px',
      }}
      codePenOption={{
        title: 'Code Block',
      }}
    />
  );
};

export default ReactCodeBlock;