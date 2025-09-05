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

// 🔄 UPGRADED: Persistent IndexedDB height cache for multi-chat performance
class HeightCache {
  constructor() {
    this.cache = new Map(); // In-memory cache for fast sync access
    this.dbName = 'OmniaHeightCache';
    this.dbVersion = 1;
    this.storeName = 'messageHeights';
    this.db = null;
    this.initPromise = this.initDB();
    console.log('🚀 [HEIGHT-CACHE] Initializing persistent IndexedDB cache');
  }
  
  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('❌ [HEIGHT-CACHE] IndexedDB init failed:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ [HEIGHT-CACHE] IndexedDB initialized');
        this.loadIntoMemory(); // Pre-load recent entries
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'fingerprint' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('🔧 [HEIGHT-CACHE] Created IndexedDB object store');
        }
      };
    });
  }
  
  // Load recent cache entries into memory for fast access
  async loadIntoMemory() {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        entries.forEach(entry => {
          this.cache.set(entry.fingerprint, {
            height: entry.height,
            timestamp: new Date(entry.timestamp)
          });
        });
        console.log('📦 [HEIGHT-CACHE] Loaded', entries.length, 'entries from IndexedDB to memory');
      };
    } catch (error) {
      console.warn('⚠️ [HEIGHT-CACHE] Failed to load from IndexedDB:', error);
    }
  }
  
  // Get cached height (synchronous from memory, async fallback to IndexedDB)
  get(fingerprint) {
    // Try memory first (fast)
    const cached = this.cache.get(fingerprint);
    if (cached) {
      console.log('⚡ [HEIGHT-CACHE] Memory HIT for:', fingerprint, '-> height:', cached.height);
      return cached.height;
    }
    
    console.log('❌ [HEIGHT-CACHE] Cache MISS for:', fingerprint);
    return null;
  }
  
  // Set height in cache (both memory and IndexedDB)
  async set(fingerprint, height) {
    if (!fingerprint || typeof height !== 'number' || height <= 0) {
      console.warn('⚠️ [HEIGHT-CACHE] Invalid cache entry:', { fingerprint, height });
      return;
    }
    
    const entry = {
      fingerprint,
      height,
      timestamp: Date.now()
    };
    
    // Set in memory immediately (sync)
    this.cache.set(fingerprint, {
      height: height,
      timestamp: new Date(entry.timestamp)
    });
    
    // Set in IndexedDB (async, non-blocking)
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put(entry);
        console.log('💾 [HEIGHT-CACHE] Cached height:', height, 'for fingerprint:', fingerprint, '(persistent)');
      } catch (error) {
        console.warn('⚠️ [HEIGHT-CACHE] IndexedDB write failed:', error);
      }
    }
    
    console.log('📊 [HEIGHT-CACHE] Memory cache size:', this.cache.size);
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
  
  // Get cache statistics with defaultItemHeight calculation
  getStats() {
    const heights = Array.from(this.cache.values()).map(entry => entry.height);
    const stats = {
      size: this.cache.size,
      memoryEntries: heights.length,
      averageHeight: heights.length ? Math.round(heights.reduce((a, b) => a + b, 0) / heights.length) : 150,
      minHeight: heights.length ? Math.min(...heights) : 50,
      maxHeight: heights.length ? Math.max(...heights) : 300,
      entries: Array.from(this.cache.entries()).slice(0, 10).map(([key, value]) => ({
        fingerprint: key.slice(-8), // Last 8 chars
        height: Math.round(value.height),
        age: Math.round((Date.now() - value.timestamp.getTime()) / 1000) + 's'
      }))
    };
    console.log('📈 [HEIGHT-CACHE] Stats:', stats);
    return stats;
  }
  
  // Get recommended defaultItemHeight from cache statistics
  getDefaultItemHeight() {
    const heights = Array.from(this.cache.values()).map(entry => entry.height);
    if (heights.length === 0) return 150; // Fallback
    
    // Use median for more stable default (less affected by outliers)
    const sorted = heights.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const recommended = Math.round(median);
    
    console.log('📊 [HEIGHT-CACHE] Recommended defaultItemHeight:', recommended, 'from', heights.length, 'samples');
    return recommended;
  }
  
  // Clean up old cache entries (keep last 1000 most recent)
  async cleanup() {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      // Get all entries sorted by timestamp (oldest first)
      const request = index.getAll();
      request.onsuccess = () => {
        const entries = request.result;
        if (entries.length > 1000) {
          const toDelete = entries.slice(0, entries.length - 1000);
          toDelete.forEach(entry => {
            store.delete(entry.fingerprint);
            this.cache.delete(entry.fingerprint);
          });
          console.log('🧹 [HEIGHT-CACHE] Cleaned up', toDelete.length, 'old entries');
        }
      };
    } catch (error) {
      console.warn('⚠️ [HEIGHT-CACHE] Cleanup failed:', error);
    }
  }
  
  // Clear cache (both memory and IndexedDB)
  async clear() {
    this.cache.clear();
    
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.clear();
        console.log('🗑️ [HEIGHT-CACHE] Cache cleared (memory + IndexedDB)');
      } catch (error) {
        console.warn('⚠️ [HEIGHT-CACHE] IndexedDB clear failed:', error);
      }
    }
  }
}

// Create singleton instance
const heightCache = new HeightCache();

// Export for use in other components
export { heightCache, createMessageFingerprint };
export default heightCache;