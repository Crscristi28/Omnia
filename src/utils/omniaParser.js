// 🚀 OMNIA PARSER - Advanced Markdown Parser with simple syntax highlighting
// Replaces @uiw/react-md-editor with BETTER functionality and styling
// Date: 2025-07-25

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
        
        // Simple syntax highlighting
        const language = getLanguage(codeBlockLanguage);
        const highlightedCode = highlightCode(codeContent, language);
        
        // Add line numbers to highlighted code
        const lines = highlightedCode.split('\n');
        const numberedLines = lines.map((line, index) => 
          `<span class="line-number">${index + 1}</span><span class="line-content">${line}</span>`
        ).join('\n');
        
        processedLines.push(`
          <div class="omnia-code-block">
            <div class="code-header">
              <span class="language-label">${codeBlockLanguage || 'text'}</span>
              <button 
                class="omnia-copy-button enhanced" 
                onclick="copyCodeToClipboard('${copyId}', this)"
                title="Copy code"
              >
                <span class="copy-icon">📋</span>
                <span class="copy-text">Copy</span>
              </button>
            </div>
            <pre class="language-${language}"><code class="language-${language} numbered-code">${numberedLines}</code></pre>
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

// Simple language detection
const getLanguage = (lang) => {
  if (!lang) return 'text';
  
  const languageMap = {
    'py': 'python',
    'js': 'javascript', 
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'sh': 'bash',
    'shell': 'bash',
    'cmd': 'bash',
    'c++': 'cpp',
    'c#': 'csharp',
    'cs': 'csharp',
    'rb': 'ruby',
    'rs': 'rust',
    'kt': 'kotlin'
  };
  
  const normalized = lang.toLowerCase();
  return languageMap[normalized] || normalized;
};

// Simple syntax highlighter
const highlightCode = (code, language) => {
  const escaped = escapeHtml(code);
  
  if (language === 'python') {
    return escaped
      .replace(/\b(def|class|import|from|if|elif|else|for|while|try|except|finally|with|as|return|yield|lambda|pass|break|continue|and|or|not|in|is|True|False|None)\b/g, '<span class="keyword">$1</span>')
      .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
      .replace(/(['"])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
  }
  
  if (language === 'javascript' || language === 'typescript') {
    return escaped
      .replace(/\b(function|const|let|var|if|else|for|while|do|switch|case|default|return|break|continue|try|catch|finally|throw|class|extends|import|export|from|async|await|typeof|instanceof|new|this|super|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>')
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
      .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
  }
  
  if (language === 'bash') {
    return escaped
      .replace(/\b(cd|ls|mkdir|rm|cp|mv|grep|find|sed|awk|cat|echo|export|sudo|chmod|chown|ps|kill|top|wget|curl|git|npm|pip|docker)\b/g, '<span class="keyword">$1</span>')
      .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
      .replace(/(['"])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
  }
  
  // Fallback - just return escaped code for other languages
  return escaped;
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