# Unused API Files Documentation

This document describes the unused API files in the OMNIA project before removal. Created on 2025-07-12.

## 🗑️ Files to be Removed

### 1. **voice.js**
- **Purpose**: Generic voice handler endpoint
- **Why unused**: Replaced by specific ElevenLabs endpoints (elevenlabs-tts.js, elevenlabs-stt.js)
- **Features**: Basic voice processing
- **Dependencies**: Unknown voice service

### 2. **news.js**
- **Purpose**: News fetching API endpoint
- **Why unused**: News functionality not implemented in current UI
- **Features**: Would fetch latest news articles
- **Dependencies**: Likely news API service

### 3. **google-search.js**
- **Purpose**: Google Custom Search API integration
- **Why unused**: Search functionality handled by Claude's built-in web search
- **Features**: Direct Google search queries
- **Dependencies**: Google API key, Custom Search Engine ID
- **Note**: Requires GOOGLE_API_KEY and GOOGLE_CSE_ID env vars

### 4. **claude.js**
- **Purpose**: Original Claude API endpoint
- **Why unused**: Replaced by enhanced claude2.js with streaming support
- **Features**: Basic Claude conversation
- **Dependencies**: CLAUDE_API_KEY
- **Migration**: All functionality moved to claude2.js

### 5. **whisper.js**
- **Purpose**: OpenAI Whisper API for speech recognition
- **Why unused**: Using ElevenLabs STT instead
- **Features**: Speech-to-text using Whisper model
- **Dependencies**: OpenAI API key
- **Alternative**: elevenlabs-stt.js provides same functionality

### 6. **elevenlabs-tts-stream.js**
- **Purpose**: Streaming version of ElevenLabs TTS
- **Why unused**: Regular TTS endpoint sufficient for current needs
- **Features**: Real-time audio streaming
- **Dependencies**: ElevenLabs API
- **Note**: Could be useful for future real-time voice features

### 7. **elevenlabs-voice-pipeline.js**
- **Purpose**: Complete voice processing pipeline
- **Why unused**: Functionality split into separate TTS/STT endpoints
- **Features**: Combined voice input/output processing
- **Dependencies**: ElevenLabs API
- **Complexity**: Over-engineered for current needs

### 8. **voice-to-voice.js**
- **Purpose**: Voice transformation/conversion
- **Why unused**: Feature not implemented in UI
- **Features**: Convert between different voices
- **Dependencies**: Advanced ElevenLabs features
- **Use case**: Voice cloning or style transfer

### 9. **perplexity-search.js**
- **Purpose**: Perplexity AI search integration
- **Why unused**: Using Sonar search instead
- **Features**: AI-powered search results
- **Dependencies**: PERPLEXITY_API_KEY
- **Alternative**: sonar-search.js provides similar functionality

## 📊 Summary Statistics

- **Total unused files**: 9
- **Replaced files**: 4 (claude.js, whisper.js, google-search.js, perplexity-search.js)
- **Unimplemented features**: 5 (news.js, voice-to-voice.js, streaming endpoints)
- **Potential future use**: elevenlabs-tts-stream.js, elevenlabs-voice-pipeline.js

## 🔄 Migration Notes

If you need to restore any functionality:

1. **News Feature**: Restore news.js and add UI components
2. **Streaming Voice**: Use elevenlabs-tts-stream.js for real-time TTS
3. **Voice Conversion**: Implement voice-to-voice.js with UI controls
4. **Alternative Search**: Switch between sonar-search.js and perplexity-search.js

## 🔑 Environment Variables No Longer Needed

After removing these files, these env vars become optional:
- `GOOGLE_API_KEY` (unless using other Google services)
- `GOOGLE_CSE_ID` 
- `PERPLEXITY_API_KEY`
- `OPENAI_API_KEY` (if only used for Whisper)

## ✅ Active API Endpoints (Keeping)

For reference, these are the active endpoints that must be preserved:
- `/api/claude2` - Main Claude AI
- `/api/openai` - GPT-4o 
- `/api/claude-web-search` - Web search
- `/api/sonar-search` - Real-time search
- `/api/elevenlabs-tts` - Text to speech
- `/api/elevenlabs-stt` - Speech to text
- `/api/google-tts` - Fallback TTS

---

Generated on: 2025-07-12
Project: OMNIA
Purpose: Documentation before API cleanup