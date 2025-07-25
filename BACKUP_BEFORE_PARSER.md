# 🔒 OMNIA BACKUP - Před vlastním parserem
# Datum: 2025-07-25

## 📦 Package.json - MDEditor dependency:
```json
"@uiw/react-md-editor": "^4.0.8",
```

## 📱 App.jsx - Import statements:
```javascript
import MDEditor from '@uiw/react-md-editor';
import './App.css';
```

## 📱 App.jsx - JSX usage:
```jsx
<MDEditor.Markdown 
  source={msg.text || ''}
  style={{
    backgroundColor: 'transparent',
    color: '#ffffff'
  }}
/>
```

## 🎨 Všechny CSS třídy co začínají .wmde-:
```css
/* FORCE LIST NUMBERS TO STAY BESIDE TEXT */
.wmde-markdown ol,
.wmde-markdown ul {
  margin: 8px 0 !important;
  padding: 0 !important; /* Changed: Zero padding */
  margin-left: 35px !important; /* Increased for better desktop alignment */
  list-style-position: outside !important;
}

.wmde-markdown ol li,
.wmde-markdown ul li {
  display: list-item !important;
  list-style-position: outside !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.6 !important;
  vertical-align: top !important;
}

/* Reset any inline code that might break list formatting */
.wmde-markdown ol li code {
  display: inline !important;
  vertical-align: baseline !important;
  margin: 0 !important;
  padding: 2px 4px !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 3px !important;
  font-size: 0.9em !important;
}

/* CRITICAL FIX: Prevent paragraph tags from breaking list formatting */
.wmde-markdown li p {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Bold text styling with yellow color */
.wmde-markdown strong,
.wmde-markdown b {
  color: #fbbf24 !important; /* Tailwind amber-400 - bright yellow */
  font-weight: 700 !important;
}

/* Hide bullets from list items that contain only bold text (section headers) */
.wmde-markdown li:has(> strong:first-child:last-child) {
  list-style: none !important;
  margin-left: -25px !important; /* Compensate for removed bullet spacing */
}

/* For mobile */
@media (max-width: 768px) {
  .wmde-markdown li:has(> strong:first-child:last-child) {
    margin-left: -25px !important;
  }
}

/* Mobile responsive adjustments for lists */
@media (max-width: 768px) {
  .wmde-markdown ul,
  .wmde-markdown ol {
    /* Override desktop styles for mobile */
    margin-left: 25px !important; /* Increased for better mobile alignment */
    padding-left: 0 !important; /* Ensure no padding */
  }
  
  .wmde-markdown ul li,
  .wmde-markdown ol li {
    list-style-position: outside !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
```

## 📄 Gemini prompt - současné formátovací instrukce:
```javascript
// Priority 3: FORMATTING & READABILITY
FORMATTING GUIDELINES:
- Use varied formatting: bullets (•), numbers (1.), arrows (→), dashes (—) as appropriate
- CRITICAL: For section headers like "Rok 1:", "Krok 2:", "Část A:" use ONLY **bold text** - NO BULLETS
  Correct: "**Rok 1:**" then "• Detail 1" then "• Detail 2"
  WRONG: "• Rok 1:" then sub-bullets
  Headers should be standalone bold text, then separate bullet points underneath
- CRITICAL: When showing code, explanation goes ON SAME LINE after colon
  Example: "• data = response.json(): This converts the response to Python dictionary"
- Keep mobile display in mind - avoid deep nesting when possible
- Use **bold** for emphasis, important terms, and section headers
- Mix formatting styles naturally - don't force bullets everywhere
- Add spacing between sections for better readability
```

## 🔍 HTML struktura analýza:
MDEditor generuje tyto HTML struktury:
- Code blocks: `<pre><code class="language-python">...</code></pre>`
- Bold text: `<strong>...</strong>`
- Lists: `<ul><li>...</li></ul>` nebo `<ol><li>...</li></ol>`
- Inline code: `<code>...</code>`
- Tables: `<table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table>`
- Links: `<a href="...">...</a>`
- Paragraphs: `<p>...</p>`