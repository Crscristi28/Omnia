// 📏 BATCH HEIGHT MANAGER - Dávkové ukládání výšek pro Virtuoso cache
// Optimalizuje performance tím, že ukládá výšky v batch namísto po jedné

import chatDB from '../services/storage/chatDB.js';

const heightsToSaveBuffer = new Map(); // Mapa pro sběr výšek
let saveHeightsTimeout = null;
const BATCH_SAVE_INTERVAL = 1000; // Ukládat každou 1 sekundu
const BATCH_SIZE_LIMIT = 20; // Uložit, pokud buffer dosáhne 20 položek

/**
 * 📏 Přidat výšku zprávy do batch bufferu pro dávkové ukládání
 * @param {string} messageId - ID zprávy
 * @param {number} height - Změřená výška v px
 * @param {string} chatId - ID chatu
 * @param {string} deviceType - 'mobile' nebo 'desktop'
 */
export const batchSaveHeight = (messageId, height, chatId, deviceType = 'unknown') => {
  if (!messageId || !height || !chatId) {
    console.warn('⚠️ [BATCH-MANAGER] Missing required params:', { messageId, height, chatId });
    return;
  }

  const key = `${chatId}_${messageId}`;
  
  // Pouze aktualizuj, pokud výška není stejná nebo není v bufferu
  const existing = heightsToSaveBuffer.get(key);
  if (existing && existing.height === height) {
    return; // Výška se nezměnila, neukládat
  }

  // Přidat do bufferu
  heightsToSaveBuffer.set(key, {
    chatId,
    messageId,
    height,
    deviceType,
    measuredAt: Date.now()
  });

  console.log(`📏 [BATCH-MANAGER] Queued height: ${messageId} = ${height}px (buffer: ${heightsToSaveBuffer.size})`);

  // Nastavit timeout pro dávkové ukládání
  if (!saveHeightsTimeout) {
    saveHeightsTimeout = setTimeout(processHeightBatch, BATCH_SAVE_INTERVAL);
  }

  // Pokud buffer je plný, uložit okamžitě
  if (heightsToSaveBuffer.size >= BATCH_SIZE_LIMIT) {
    clearTimeout(saveHeightsTimeout);
    processHeightBatch();
  }
};

/**
 * 💾 Zpracovat buffer a uložit výšky do IndexedDB
 */
const processHeightBatch = async () => {
  if (heightsToSaveBuffer.size === 0) {
    saveHeightsTimeout = null;
    return;
  }

  const heightsToProcess = Array.from(heightsToSaveBuffer.values());
  heightsToSaveBuffer.clear(); // Vyčistit buffer ihned
  saveHeightsTimeout = null; // Resetovat timer

  try {
    console.log(`💾 [BATCH-MANAGER] Processing batch of ${heightsToProcess.length} heights...`);
    
    const success = await chatDB.saveMessageHeightsBatch(heightsToProcess);
    if (success) {
      console.log(`✅ [BATCH-MANAGER] Successfully saved ${heightsToProcess.length} heights to IndexedDB`);
    } else {
      console.error(`❌ [BATCH-MANAGER] Failed to save height batch`);
    }
  } catch (error) {
    console.error('[BATCH-MANAGER] Error processing height batch:', error);
  }
};

/**
 * 🔄 Flush all pending heights immediately (pro app shutdown)
 */
export const flushHeightBatch = async () => {
  if (heightsToSaveBuffer.size > 0) {
    console.log(`🔄 [BATCH-MANAGER] Flushing ${heightsToSaveBuffer.size} pending heights...`);
    clearTimeout(saveHeightsTimeout);
    await processHeightBatch();
  }
};

/**
 * 📊 Get current buffer status (pro debugging)
 */
export const getBatchStatus = () => {
  return {
    bufferSize: heightsToSaveBuffer.size,
    hasPendingTimer: !!saveHeightsTimeout,
    pendingHeights: Array.from(heightsToSaveBuffer.keys())
  };
};

// 🔄 Event listeners pro zachování dat při zavření aplikace
if (typeof window !== 'undefined') {
  
  // Primary flush na beforeunload
  window.addEventListener('beforeunload', () => {
    if (heightsToSaveBuffer.size > 0) {
      // Synchronní volání pro jistotu (ale není 100% garantováno dokončení)
      console.log('🚨 [BATCH-MANAGER] beforeunload - attempting sync flush');
      flushHeightBatch();
    }
  });

  // Secondary flush na visibilitychange (spolehlivější na mobilu)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && heightsToSaveBuffer.size > 0) {
      console.log('👁️ [BATCH-MANAGER] visibilitychange - flushing batch');
      flushHeightBatch();
    }
  });

  // Tertiary flush na pagehide (Safari fallback)
  window.addEventListener('pagehide', () => {
    if (heightsToSaveBuffer.size > 0) {
      console.log('📄 [BATCH-MANAGER] pagehide - flushing batch');
      flushHeightBatch();
    }
  });
}

// 🐛 Development debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.heightBatchDebug = {
    getStatus: getBatchStatus,
    flush: flushHeightBatch,
    getBuffer: () => Array.from(heightsToSaveBuffer.values())
  };
}

export default {
  batchSaveHeight,
  flushHeightBatch,
  getBatchStatus
};