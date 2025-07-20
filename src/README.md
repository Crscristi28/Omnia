# OMNIA Project Structure

This document describes the new modular architecture of the OMNIA project.

## 📁 Folder Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   ├── input/       # Input-related components
│   ├── chat/        # Chat-specific components
│   ├── layout/      # Layout components
│   ├── voice/       # Voice-specific components
│   └── sources/     # Sources modal components
├── services/
│   ├── ai/          # AI service providers (Claude, OpenAI, Sonar)
│   ├── voice/       # Voice/audio services (ElevenLabs)
│   └── storage/     # Data persistence services
├── utils/
│   ├── text/        # Text processing utilities
│   ├── audio/       # Audio processing utilities
│   └── ui/          # UI helper utilities
├── hooks/           # React custom hooks
├── contexts/        # React context providers
└── config/          # Configuration files
```

## 🔄 Import Patterns

### Clean Modular Imports
```javascript
// AI Services
import { claudeService, openaiService, sonarService } from './services/ai';

// Voice Services
import { elevenLabsService } from './services/voice';

// Text Utilities
import { sanitizeText, detectLanguage, getTranslation } from './utils/text';

// UI Components
import { VoiceButton, CopyButton } from './components/ui';
```

### Direct Imports (when needed)
```javascript
import { SessionManager } from './services/storage/sessionManager.js';
```

## 🧹 Cleanup Results

### ✅ Consolidated Files
- **ElevenLabs services**: Consolidated to single working implementation
- **Text utilities**: Organized in `utils/text/`
- **Storage**: Moved to `services/storage/`

### 🗑️ Removed Files
- `apiServices.js` (archived - outdated API handler)
- `openai.service 2.js` (duplicate file)

### 📋 Active Services
- **API Endpoints Used**: `/api/elevenlabs-tts`, `/api/elevenlabs-stt`
- **Current Voice Service**: `services/voice/elevenlabs.service.js`

## 🚀 Benefits

1. **Clean Architecture**: Logical separation of concerns
2. **Easy Navigation**: Clear folder structure
3. **Modular Imports**: Clean dependency management
4. **Scalability**: Easy to add new features
5. **Maintainability**: Reduced coupling between modules