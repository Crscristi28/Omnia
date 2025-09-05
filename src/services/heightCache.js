// 📏 Height Cache Service - Step 1: Basic in-memory cache only
// 🎯 SAFE IMPLEMENTATION: No Virtuoso changes, just testing cache logic

// Simple hash function for message fingerprinting
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Create message fingerprint based on content that affects height
function createMessageFingerprint(msg) {
  if (!msg) return 'empty';
  
  const factors = {
    textLength: msg.text?.length || 0,
    textHash: simpleHash(msg.text || ''),
    sender: msg.sender || 'unknown',
    hasAttachments: !!msg.attachments?.length,
    attachmentCount: msg.attachments?.length || 0,
    attachmentTypes: msg.attachments?.map(a => a.type).sort().join(',') || '',
    hasImage: !!msg.image,
    isLoading: msg.isLoading || false,
    isStreaming: msg.isStreaming || false
  };
  
  const fingerprint = `msg_${simpleHash(JSON.stringify(factors))}`;
  console.log('🔍 [HEIGHT-CACHE] Created fingerprint:', fingerprint, 'for message:', {
    textPreview: msg.text?.slice(0, 50) + '...',
    sender: msg.sender,
    hasAttachments: !!msg.attachments?.length
  });
  
  return fingerprint;
}

// Basic in-memory height cache
class HeightCache {
  constructor() {
    this.cache = new Map(); // fingerprint -> { height: number, timestamp: Date }
    console.log('🚀 [HEIGHT-CACHE] Initialized in-memory cache');
  }
  
  // Get cached height (synchronous)
  get(fingerprint) {
    const cached = this.cache.get(fingerprint);
    if (cached) {
      console.log('✅ [HEIGHT-CACHE] Cache HIT for:', fingerprint, '-> height:', cached.height);
      return cached.height;
    }
    console.log('❌ [HEIGHT-CACHE] Cache MISS for:', fingerprint);
    return null;
  }
  
  // Set height in cache
  set(fingerprint, height) {
    if (!fingerprint || typeof height !== 'number' || height <= 0) {
      console.warn('⚠️ [HEIGHT-CACHE] Invalid cache entry:', { fingerprint, height });
      return;
    }
    
    this.cache.set(fingerprint, {
      height: height,
      timestamp: new Date()
    });
    
    console.log('💾 [HEIGHT-CACHE] Cached height:', height, 'for fingerprint:', fingerprint);
    console.log('📊 [HEIGHT-CACHE] Cache size:', this.cache.size);
  }
  
  // Test function to verify cache works
  test() {
    console.log('🧪 [HEIGHT-CACHE] Running basic test...');
    
    // Test message
    const testMsg = {
      id: 'test-1',
      text: 'This is a test message',
      sender: 'user'
    };
    
    const fingerprint = createMessageFingerprint(testMsg);
    
    // Test cache miss
    const miss = this.get(fingerprint);
    console.log('Test cache miss result:', miss);
    
    // Test cache set
    this.set(fingerprint, 150);
    
    // Test cache hit
    const hit = this.get(fingerprint);
    console.log('Test cache hit result:', hit);
    
    console.log('✅ [HEIGHT-CACHE] Basic test completed');
    return hit === 150;
  }
  
  // Get cache stats
  getStats() {
    const stats = {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        fingerprint: key,
        height: value.height,
        age: Date.now() - value.timestamp.getTime()
      }))
    };
    console.log('📈 [HEIGHT-CACHE] Stats:', stats);
    return stats;
  }
  
  // Clear cache (for testing)
  clear() {
    this.cache.clear();
    console.log('🗑️ [HEIGHT-CACHE] Cache cleared');
  }
}

// Create singleton instance
const heightCache = new HeightCache();

// Export for use in other components
export { heightCache, createMessageFingerprint };
export default heightCache;