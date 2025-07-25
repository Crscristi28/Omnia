import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import CopyButton from '../ui/CopyButton';

const ReactCodeBlock = ({ code, language = 'javascript' }) => {
  const getLanguageExtension = (lang) => {
    switch (lang?.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'jsx':
        return [javascript()];
      case 'python':
      case 'py':
        return [python()];
      default:
        return [];
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      margin: '4px 0',
      backgroundColor: '#1e1e1e',
      borderRadius: '4px'
    }}>
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10
      }}>
        <CopyButton text={code} />
      </div>
      <CodeMirror
        value={code}
        height="auto"
        theme={oneDark}
        extensions={getLanguageExtension(language)}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          highlightSelectionMatches: false,
          searchKeymap: false
        }}
        style={{
          fontSize: '14px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
        }}
      />
    </div>
  );
};

export default ReactCodeBlock;