# OMNIA Architecture Documentation for Claude

## Project Overview
OMNIA is a sophisticated AI chat application with voice capabilities, web search integration, and multi-model support. This document serves as a comprehensive guide for Claude to understand and work with the codebase effectively.

## Architecture Patterns

### 1. Modular Component Structure
```
src/
├── components/
│   ├── ui/         # Reusable UI elements (buttons, logos, etc.)
│   ├── input/      # Input-related components
│   ├── chat/       # Chat interface components
│   ├── layout/     # Layout components (sidebar, etc.)
│   ├── sources/    # Web source display components
│   └── voice/      # Voice interaction components
```

**Pattern**: Each component category has its own folder with an index.js for barrel exports.

### 2. Service Layer Architecture
```
src/services/
├── ai/             # AI model integrations
├── voice/          # Voice services (TTS/STT)
└── storage/        # Browser storage management
```

**Pattern**: Services are singleton objects exported as default, following this structure:
```javascript
const serviceNameService = {
  async primaryMethod(params) { /* implementation */ },
  helperMethod() { /* ... */ }
};
export default serviceNameService;
```

### 3. API Proxy Pattern
- **Production**: Vercel serverless functions in `/api/`
- **Development**: Express proxy server at port 3001
- **Pattern**: All API keys stored server-side, never exposed to client

## Key Design Decisions

### 1. Streaming Architecture
- Claude service implements word-by-word streaming for real-time responses
- Uses Server-Sent Events (SSE) pattern
- Other services use standard JSON responses

### 2. Multi-language Support
- Built-in support for Czech (cs), English (en), Romanian (ro)
- Language detection happens client-side
- All AI services accept `detectedLanguage` parameter

### 3. Voice-First Design
- ElevenLabs integration for both TTS and STT
- Fallback to browser's speech recognition API
- Audio handling optimized for mobile devices

### 4. State Management
- React hooks for local component state
- Session storage for chat persistence
- No global state management library (intentional simplicity)

## Development Workflow

### Testing Commands
```bash
# Run development environment
npm run dev

# Build for production
npm run build

# Run only the proxy server
npm run proxy

# Linting (add these when available)
npm run lint
npm run typecheck
```

### Environment Variables
Required environment variables (stored in `.env`):
```
# AI Services
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PERPLEXITY_API_KEY=

# Voice Services
ELEVENLABS_API_KEY=

# Google Services (if translation needed)
GOOGLE_TRANSLATE_API_KEY=
```

## Adding New AI Models - Workflow Example

### Step 1: Plan the Integration
When adding a new AI model (e.g., Grok), create these todos:
1. Create service file in `src/services/ai/`
2. Create API endpoint in `/api/`
3. Update proxy server (if needed)
4. Add model to UI selection
5. Update relevant components
6. Test streaming/non-streaming responses
7. Add error handling
8. Update documentation

### Step 2: Multi-file Coordination
Changes typically span these files:
```
1. src/services/ai/grok.service.js      # New service
2. api/grok.js                          # API endpoint
3. src/components/input/InputBar.jsx    # Model selection
4. src/App.jsx                          # Model handling logic
5. .env.example                         # API key template
```

### Step 3: Implementation Pattern
Follow existing patterns from claude.service.js or openai.service.js:
- Consistent error handling
- Standard response format
- Language support
- Streaming (if applicable)

## Code Style Guidelines

### Component Patterns
```javascript
// Functional components with hooks
function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  // Event handlers
  const handleEvent = () => {
    // Implementation
  };
  
  return (
    <div className="inline-styles">
      {/* JSX content */}
    </div>
  );
}
```

### Service Patterns
```javascript
const serviceNameService = {
  async methodName(params) {
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('🔥 Service error:', error);
      throw error;
    }
  }
};
```

### Styling Approach
- Inline styles for components (no CSS files)
- Glassmorphism effects using rgba and backdrop-filter
- Consistent color palette (stored in component styles)
- Mobile-first responsive design

## Common Tasks

### 1. Adding a New AI Model
1. Copy existing service pattern
2. Create API endpoint following handler pattern
3. Add to model selection in InputBar
4. Update App.jsx message handling
5. Test streaming/response format
6. Add appropriate error handling

### 2. Modifying Voice Features
- Check mobile compatibility
- Test with different languages
- Ensure fallback mechanisms work
- Update audio processing utilities

### 3. UI Component Changes
- Maintain existing glassmorphism style
- Keep mobile responsiveness
- Follow existing component patterns
- Update barrel exports in index.js

## Debugging Tips

### Common Issues
1. **CORS errors**: Check API endpoint headers
2. **Streaming not working**: Verify SSE implementation
3. **Voice not working**: Check browser permissions
4. **API errors**: Verify environment variables

### Debug Locations
- Browser console for client-side errors
- Network tab for API responses
- Proxy server logs (when running locally)
- Add strategic console.logs in services

## Performance Considerations

1. **Lazy Loading**: Components are imported as needed
2. **Streaming**: Reduces time to first byte
3. **Session Storage**: Minimizes API calls
4. **Debouncing**: Input handling is debounced

## Security Notes

1. **API Keys**: Never commit API keys
2. **CORS**: Configured for development flexibility
3. **Input Sanitization**: Happens server-side
4. **XSS Prevention**: React handles most cases

## Future Enhancements (Planned)
- Redis caching for responses
- WebSocket support for real-time features
- Advanced context management
- Plugin system for extensibility

## Claude-Specific Tips

When working on OMNIA:
1. Always check existing patterns before implementing
2. Use parallel tool execution for efficiency
3. Test changes with multiple language inputs
4. Verify mobile compatibility
5. Keep streaming architecture in mind
6. Follow the established error handling patterns

Remember: OMNIA is production-ready code. Maintain quality and consistency!