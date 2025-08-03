# CLAUDE CODING RULES & PROJECT CONTEXT

## MEMORY OPTIMIZATION - CRITICAL ⚠️

### Tool Usage Rules:
- **ALWAYS use Grep instead of Read** for searching patterns/functions
- **Read only specific parts** with offset/limit when possible
- **Use Glob** with .clcodeignore patterns for file discovery
- **Keep sessions SHORT** - restart frequently to prevent cache bloat
- **Never read entire large files** unless absolutely necessary

### Examples:
```
❌ Read("/path/to/App.jsx") // 50K tokens
✅ Grep("handleSend", path: "src/App.jsx") // 500 tokens
✅ Read("src/App.jsx", offset: 1000, limit: 50) // 5K tokens
```

## PROJECT STATUS - OMNIA CLEAN3

### Current State:
- **IndexedDB V2**: Normalized schema with pagination
- **Sliding Window**: 50 messages max in RAM (not 30)
- **Auto-save**: Every 10 messages to IndexedDB
- **Memory Management**: Removed old RAM trim (45→30), using scroll-based sliding window

### Active Issues:
- **Memory optimization**: Need solution for long sessions (200+ messages)
- **Gemini formatting**: Improved prompts, testing needed

### Next Decisions:
1. **Memory Management**: Choose between:
   - Smart Progressive Limit (100→80 messages)
   - Virtual Scrolling (render only visible)
   - Hybrid Approach (different strategies by chat length)

## CODING PATTERNS

### File Operations:
- **Edit existing files**, don't create new ones unless necessary
- **Check .clcodeignore** before file operations
- **Use MultiEdit** for multiple changes in same file
- **Prefer small, focused changes**

### Debugging:
- Use Grep to find issues, not full file reads
- Use Browser dev tools for runtime debugging
- Check console logs first

### Testing:
- Test changes incrementally
- Use browser refresh to verify changes
- Check for TypeScript/build errors

## MEMORY COST TRACKING

### Daily Target: <$20 (vs current $80+)
### Key Metrics:
- Cache reads should be <5M tokens/day
- File reads should use Grep when possible
- Sessions should restart every 2-3 hours

---
*Last updated: 2025-08-03*
*Next session: Review memory management solutions*