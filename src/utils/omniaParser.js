// 🚀 OMNIA PARSER - Custom Markdown to HTML Parser
// Replaces @uiw/react-md-editor with identical functionality and styling
// Date: 2025-07-25

/**
 * Main parser function - converts markdown text to HTML
 * Generates IDENTICAL HTML structure as MDEditor
 * @param {string} text - Raw markdown text
 * @returns {string} - HTML string with omnia-markdown classes
 */
export const parseOmniaText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let html = text;

  // 1. CODE BLOCKS (must be processed first)
  html = parseCodeBlocks(html);

  // 2. TABLES
  html = parseTables(html);

  // 3. BOLD TEXT (**text** and __text__)
  html = parseBoldText(html);

  // 4. ITALIC TEXT (*text* and _text_)
  html = parseItalicText(html);

  // 5. INLINE CODE (`code`)
  html = parseInlineCode(html);

  // 6. LINKS ([text](url))
  html = parseLinks(html);

  // 7. ORDERED LISTS (1. item)
  html = parseOrderedLists(html);

  // 8. UNORDERED LISTS (- item, * item, + item)
  html = parseUnorderedLists(html);

  // 9. PARAGRAPHS (wrap remaining text)
  html = parseParagraphs(html);

  return html;
};

/**
 * Parse code blocks (```language\ncode\n```)
 */
const parseCodeBlocks = (text) => {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  
  return text.replace(codeBlockRegex, (match, language, code) => {
    const cleanCode = code.trim();
    const lang = language || 'text';
    const copyButtonId = `copy-${Math.random().toString(36).substr(2, 9)}`;
    
    return `<div class="omnia-code-block" style="position: relative;">
      <pre><code class="language-${lang}">${escapeHtml(cleanCode)}</code></pre>
      <button 
        class="omnia-copy-button" 
        onclick="copyCodeToClipboard('${copyButtonId}', this)"
        title="Copy code"
        style="position: absolute; top: 8px; right: 8px; background: rgba(0, 0, 0, 0.7); color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.2s;"
      >
        📋
      </button>
      <script type="text/plain" id="${copyButtonId}">${cleanCode}</script>
    </div>`;
  });
};

/**
 * Parse tables (| header | header |\n|-------|-------|\n| cell | cell |)
 */
const parseTables = (text) => {
  const lines = text.split('\n');
  let result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if line looks like table header
    if (line.startsWith('|') && line.endsWith('|') && line.includes('|')) {
      const nextLine = lines[i + 1]?.trim();
      
      // Check if next line is separator (|---|---|)
      if (nextLine && nextLine.match(/^\|[\s\-\|]+\|$/)) {
        // Found table start
        const tableLines = [line];
        i += 2; // Skip separator line
        
        // Collect table rows
        while (i < lines.length) {
          const tableLine = lines[i].trim();
          if (tableLine.startsWith('|') && tableLine.endsWith('|')) {
            tableLines.push(tableLine);
            i++;
          } else {
            break;
          }
        }
        
        // Convert to HTML table
        result.push(convertToTable(tableLines));
        continue;
      }
    }
    
    result.push(lines[i]);
    i++;
  }

  return result.join('\n');
};

/**
 * Convert table lines to HTML table
 */
const convertToTable = (tableLines) => {
  if (tableLines.length < 2) return tableLines.join('\n');
  
  const headerLine = tableLines[0];
  const dataLines = tableLines.slice(1);
  
  // Parse header
  const headers = headerLine.split('|').slice(1, -1).map(h => h.trim());
  
  let html = '<table>';
  
  // Add header
  html += '<thead><tr>';
  headers.forEach(header => {
    html += `<th>${escapeHtml(header)}</th>`;
  });
  html += '</tr></thead>';
  
  // Add body
  html += '<tbody>';
  dataLines.forEach(line => {
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    html += '<tr>';
    cells.forEach(cell => {
      html += `<td>${escapeHtml(cell)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  
  html += '</table>';
  return html;
};

/**
 * Parse bold text (**text** or __text__)
 */
const parseBoldText = (text) => {
  // Handle **text**
  text = text.replace(/\*\*((?!\*)[^*]+(?:\*(?!\*)[^*]*)*)\*\*/g, '<strong>$1</strong>');
  
  // Handle __text__
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  return text;
};

/**
 * Parse italic text (*text* or _text_)
 */
const parseItalicText = (text) => {
  // Handle *text* (but not **text**)
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Handle _text_ (but not __text__)
  text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
  
  return text;
};

/**
 * Parse inline code (`code`)
 */
const parseInlineCode = (text) => {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
};

/**
 * Parse links ([text](url))
 */
const parseLinks = (text) => {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
};

/**
 * Parse ordered lists (1. item, 2. item)
 */
const parseOrderedLists = (text) => {
  const lines = text.split('\n');
  let result = [];
  let inList = false;
  let currentList = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if line is ordered list item (1. text, 2. text, etc.)
    const listMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    
    if (listMatch) {
      if (!inList) {
        inList = true;
        currentList = [];
      }
      currentList.push(`<li>${listMatch[2]}</li>`);
    } else {
      // End of list or not a list item
      if (inList) {
        result.push(`<ol>${currentList.join('')}</ol>`);
        currentList = [];
        inList = false;
      }
      
      if (trimmedLine) { // Only add non-empty lines
        result.push(line);
      }
    }
  }
  
  // Handle case where list is at end of text
  if (inList && currentList.length > 0) {
    result.push(`<ol>${currentList.join('')}</ol>`);
  }
  
  return result.join('\n');
};

/**
 * Parse unordered lists (- item, * item, + item)
 */
const parseUnorderedLists = (text) => {
  const lines = text.split('\n');
  let result = [];
  let inList = false;
  let currentList = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if line is unordered list item (- text, * text, + text)
    const listMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
    
    if (listMatch) {
      if (!inList) {
        inList = true;
        currentList = [];
      }
      currentList.push(`<li>${listMatch[1]}</li>`);
    } else {
      // End of list or not a list item
      if (inList) {
        result.push(`<ul>${currentList.join('')}</ul>`);
        currentList = [];
        inList = false;
      }
      
      if (trimmedLine) { // Only add non-empty lines
        result.push(line);
      }
    }
  }
  
  // Handle case where list is at end of text
  if (inList && currentList.length > 0) {
    result.push(`<ul>${currentList.join('')}</ul>`);
  }
  
  return result.join('\n');
};

/**
 * Parse paragraphs (wrap remaining text in <p> tags)
 */
const parseParagraphs = (text) => {
  const lines = text.split('\n');
  let result = [];
  let currentParagraph = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip if line is already HTML (starts with <)
    if (trimmedLine.startsWith('<')) {
      // Finish current paragraph if any
      if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      result.push(line);
    } else if (trimmedLine === '') {
      // Empty line - finish current paragraph
      if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
    } else {
      // Regular text line
      currentParagraph.push(trimmedLine);
    }
  }
  
  // Handle remaining paragraph
  if (currentParagraph.length > 0) {
    result.push(`<p>${currentParagraph.join(' ')}</p>`);
  }
  
  return result.join('\n');
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