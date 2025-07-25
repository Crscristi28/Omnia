// 🚀 OMNIA PARSER - Advanced Markdown Parser with highlight.js
// Replaces @uiw/react-md-editor with BETTER functionality and styling
// Date: 2025-07-25

import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';

// Import only languages we need
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';

// Register languages
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);

/**
 * Main parser function - converts markdown text to HTML
 * Uses simple approach to match MDEditor behavior exactly
 * @param {string} text - Raw markdown text
 * @returns {string} - HTML string with omnia-markdown classes
 */
export const parseOmniaText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Simple line-by-line processing to match MDEditor behavior
  const lines = text.split('\n');
  const processedLines = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent = [];
  let inList = false;
  let listItems = [];
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeContent = codeBlockContent.join('\n');
        const copyId = 'copy-' + Math.random().toString(36).substr(2, 9);
        
        // Highlight.js syntax highlighting
        const language = getLanguage(codeBlockLanguage);
        let highlightedCode;
        
        try {
          if (language && hljs.getLanguage(language)) {
            highlightedCode = hljs.highlight(codeContent, { language }).value;
          } else {
            highlightedCode = hljs.highlightAuto(codeContent).value;
          }
        } catch (error) {
          console.warn('Highlight.js failed:', error);
          highlightedCode = escapeHtml(codeContent);
        }
        
        processedLines.push(`
          <div class="omnia-code-block">
            <button 
              class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors duration-200 z-10"
              onclick="copyCodeToClipboard('${copyId}', this)"
              title="Copy code"
            >
              📋
            </button>
            <pre><code>${highlightedCode}</code></pre>
            <script type="text/plain" id="${copyId}">${codeContent}</script>
          </div>
        `);
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLanguage = '';
      } else {
        // Start code block
        codeBlockLanguage = trimmedLine.replace('```', '') || 'text';
        inCodeBlock = true;
        // Finish any pending list
        if (inList) {
          processedLines.push(finishList(listItems, listType));
          inList = false;
          listItems = [];
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle lists
    const orderedMatch = trimmedLine.match(/^(\d+)\. (.+)$/);
    const unorderedMatch = trimmedLine.match(/^[-*+] (.+)$/);
    
    if (orderedMatch || unorderedMatch) {
      const currentListType = orderedMatch ? 'ol' : 'ul';
      const itemContent = orderedMatch ? orderedMatch[2] : unorderedMatch[1];
      
      if (!inList || listType !== currentListType) {
        // Finish previous list if different type
        if (inList) {
          processedLines.push(finishList(listItems, listType));
        }
        // Start new list
        inList = true;
        listType = currentListType;
        listItems = [];
      }
      
      listItems.push(processInlineMarkdown(itemContent));
      continue;
    } else {
      // Not a list item, finish any pending list
      if (inList) {
        processedLines.push(finishList(listItems, listType));
        inList = false;
        listItems = [];
      }
    }

    // Handle regular text
    if (trimmedLine) {
      processedLines.push(`<p>${processInlineMarkdown(trimmedLine)}</p>`);
    } else {
      processedLines.push('');
    }
  }

  // Finish any pending list at end
  if (inList) {
    processedLines.push(finishList(listItems, listType));
  }

  return processedLines.join('\n');
};

// Language mapping for highlight.js
const getLanguage = (lang) => {
  if (!lang) return null;
  
  const languageMap = {
    'py': 'python',
    'js': 'javascript', 
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'sh': 'bash',
    'shell': 'bash',
    'cmd': 'bash',
    'powershell': 'bash',
    'ps1': 'bash'
  };
  
  const normalized = lang.toLowerCase();
  return languageMap[normalized] || normalized;
};


// Helper to finish a list
const finishList = (items, type) => {
  const listItems = items.map(item => `<li>${item}</li>`).join('');
  return `<${type}>${listItems}</${type}>`;
};

// Process inline markdown (bold, italic, code, links)
const processInlineMarkdown = (text) => {
  let processed = text;
  
  // Bold **text** or __text__
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic *text* or _text_ (but not in bold)
  processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  processed = processed.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
  
  // Inline code `code`
  processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links [text](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  return processed;
};


/**
 * Escape HTML characters
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Copy code to clipboard function for code blocks
 * This function will be available globally for the copy buttons
 */
export const copyCodeToClipboard = (elementId, buttonElement) => {
  try {
    const codeElement = document.getElementById(elementId);
    if (!codeElement) {
      console.error('Code element not found:', elementId);
      return;
    }

    const code = codeElement.textContent;
    
    // Use modern clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(() => {
        showCopyFeedback(buttonElement, true);
      }).catch(() => {
        fallbackCopyToClipboard(code, buttonElement);
      });
    } else {
      fallbackCopyToClipboard(code, buttonElement);
    }
  } catch (error) {
    console.error('Failed to copy code:', error);
    showCopyFeedback(buttonElement, false);
  }
};

/**
 * Fallback copy method for older browsers
 */
const fallbackCopyToClipboard = (text, buttonElement) => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    showCopyFeedback(buttonElement, successful);
  } catch (error) {
    console.error('Fallback copy failed:', error);
    showCopyFeedback(buttonElement, false);
  }
};

/**
 * Show visual feedback for copy operation
 */
const showCopyFeedback = (buttonElement, success) => {
  const originalText = buttonElement.innerHTML;
  buttonElement.innerHTML = success ? '✅' : '❌';
  buttonElement.style.opacity = '1';
  
  setTimeout(() => {
    buttonElement.innerHTML = originalText;
  }, 1500);
};

// Make copyCodeToClipboard available globally for onclick handlers
if (typeof window !== 'undefined') {
  window.copyCodeToClipboard = copyCodeToClipboard;
}