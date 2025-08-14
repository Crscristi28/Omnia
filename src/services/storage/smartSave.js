import chatDB from './chatDB.js';

/**
 * Smart incremental save - saves only NEW messages to prevent duplicates
 * @param {string} chatId - The chat ID to save to
 * @param {Array} messages - Current messages array from state
 * @returns {Promise<boolean>} - Returns true if messages were saved, false if no new messages
 */
export const smartIncrementalSave = async (chatId, messages) => {
  if (!chatId || !messages || messages.length === 0) {
    return false;
  }

  
  // Get existing message count from database
  const existingData = await chatDB.getLatestMessages(chatId, 1);
  const lastSavedCount = existingData.totalCount || 0;
  const currentCount = messages.length;
  
  // Save only NEW messages since last save
  if (currentCount > lastSavedCount) {
    const unsavedMessages = messages.slice(lastSavedCount);
    await chatDB.saveChatV2(chatId, unsavedMessages);
    return true;
  } else {
    return false;
  }
};