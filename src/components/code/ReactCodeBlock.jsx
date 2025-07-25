import React, { useState } from 'react';
import { CodeBlock } from 'react-code-block';

const ReactCodeBlock = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <CodeBlock code={code} language={language}>
        <CodeBlock.Code className="bg-gray-900 p-4 rounded text-sm">
          <div className="table-row">
            <CodeBlock.LineNumber className="table-cell pr-4 text-sm text-gray-500" />
            <CodeBlock.LineContent className="table-cell">
              <CodeBlock.Token />
            </CodeBlock.LineContent>
          </div>
        </CodeBlock.Code>
      </CodeBlock>
      
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white transition-colors duration-200 rounded-md hover:bg-white/5"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" className="text-green-400"></polyline>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ReactCodeBlock;