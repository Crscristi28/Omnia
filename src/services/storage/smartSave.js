import { chatDB } from './chatDB.js';

/**
 * Smart incremental save - saves only NEW messages to prevent duplicates
 * @param {string} chatId - The chat ID to save to
 * @param {Array} messages - Current messages array from state
 * @returns {Promise<boolean>} - Returns true if messages were saved, false if no new messages
 */
export const smartIncrementalSave = async (chatId, messages) => {
  if (!chatId || !messages || messages.length === 0) {
    console.log('⚠️ [SMART-SAVE] No chatId or messages provided');
    return false;
  }

  console.log('💾 [SMART-SAVE] Checking for unsaved messages:', chatId);
  
  // Get existing message count from database
  const existingData = await chatDB.getLatestMessages(chatId, 1);
  const lastSavedCount = existingData.totalCount || 0;
  const currentCount = messages.length;
  
  // Save only NEW messages since last save
  if (currentCount > lastSavedCount) {
    const unsavedMessages = messages.slice(lastSavedCount);
    console.log(`💾 [SMART-SAVE] Saving ${unsavedMessages.length} new messages (${lastSavedCount} already saved)`);
    await chatDB.saveChatV2(chatId, unsavedMessages);
    console.log('✅ [SMART-SAVE] New messages saved successfully');
    return true;
  } else {
    console.log('✅ [SMART-SAVE] All messages already saved - no duplicates');
    return false;
  }
};