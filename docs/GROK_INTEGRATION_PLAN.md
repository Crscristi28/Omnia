# Grok Integration Plan for OMNIA

## Multi-File Coordination Workflow

This document demonstrates how Claude coordinates changes across multiple files for complex features.

### Files to Modify for Grok Integration

#### 1. Service Layer
**File**: `src/services/ai/grok.service.js` (NEW)
- Follow claude.service.js pattern
- Implement xAI API communication
- Handle streaming responses (if supported)
- Standard error handling

#### 2. API Endpoint
**File**: `api/grok.js` (NEW)
- Serverless function for Vercel deployment
- Environment variable: `GROK_API_KEY`
- Standard CORS headers
- Request/response transformation

#### 3. Proxy Server (Development)
**File**: `omnia-proxy-clean/server.js` (MODIFY)
- Add `/grok` route for local development
- Mirror API endpoint functionality

#### 4. Frontend Integration
**File**: `src/App.jsx` (MODIFY)
- Add grok to model selection logic
- Update handleSendMessage function
- Add Grok-specific response handling

#### 5. UI Components
**File**: `src/components/input/InputBar.jsx` (MODIFY)
- Add Grok to model dropdown
- Update model selection state

#### 6. Service Exports
**File**: `src/services/ai/index.js` (MODIFY)
- Export grokService for clean imports

#### 7. Environment Configuration
**File**: `.env.example` (MODIFY)
- Add GROK_API_KEY template

### Implementation Order

#### Phase 1: Core Service (High Priority)
1. Create `grok.service.js` with basic functionality
2. Create `api/grok.js` endpoint
3. Test API communication independently

#### Phase 2: Integration (High Priority)
4. Update proxy server for local development
5. Add service export to index.js
6. Test end-to-end API flow

#### Phase 3: UI Integration (Medium Priority)
7. Update App.jsx for Grok handling
8. Add Grok to InputBar model selection
9. Test complete user flow

#### Phase 4: Polish (Low Priority)
10. Add comprehensive error handling
11. Optimize streaming (if applicable)
12. Update documentation

### Coordination Strategy

**Parallel Development Approach**:
```bash
# Claude can execute these simultaneously:
1. Create service file
2. Create API endpoint  
3. Analyze existing patterns
4. Update environment template
```

**Sequential Dependencies**:
```bash
# These must be done in order:
1. Service created → Export added
2. API endpoint → Proxy server updated
3. Service exported → App.jsx integration
4. All backend ready → UI integration
```

### Testing Strategy

#### Unit Testing
- Test service independently with mock responses
- Verify API endpoint with Postman/curl
- Test error handling scenarios

#### Integration Testing
- Test complete message flow
- Verify streaming functionality
- Test with different languages

#### User Testing
- Test model switching
- Verify response quality
- Test error scenarios

### Rollback Plan

If issues arise:
1. Disable Grok in UI (comment out from dropdown)
2. Keep service files for future fixes
3. Maintain other models' functionality
4. Document specific issues for later resolution

### Expected Code Changes

#### Service Pattern
```javascript
// src/services/ai/grok.service.js
const grokService = {
  async sendMessage(messages, detectedLanguage = 'cs') {
    try {
      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, detectedLanguage })
      });
      
      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        text: result.text,
        sources: result.sources || [],
        model: 'grok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🚀 Grok service error:', error);
      throw error;
    }
  }
};

export default grokService;
```

#### API Endpoint Pattern
```javascript
// api/grok.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      throw new Error('Grok API key not configured');
    }
    
    // Implementation here
    
  } catch (error) {
    console.error('Grok API error:', error);
    return res.status(500).json({ error: 'Grok service error' });
  }
}
```

#### UI Integration Pattern
```javascript
// In App.jsx - handleSendMessage function
case 'grok':
  response = await grokService.sendMessage(
    filteredMessages, 
    detectedLanguage
  );
  break;
```

This plan demonstrates Claude's ability to:
1. **Analyze complex dependencies** between multiple files
2. **Coordinate parallel and sequential tasks** efficiently
3. **Follow established patterns** while adding new functionality
4. **Plan for testing and rollback** scenarios
5. **Maintain code quality** throughout the integration

Ready to execute this plan when you provide the Grok API documentation!