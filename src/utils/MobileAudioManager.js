/**
 * 🎵 Mobile Audio Manager
 * 
 * Handles mobile-specific audio playback issues:
 * - iOS/Android audio context unlocking
 * - Audio queue management for smooth playback
 * - Mobile browser audio restrictions
 */

class MobileAudioManager {
  constructor() {
    this.currentAudio = null;
    this.isUnlocked = false;
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
  }
  
  async initialize() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      console.log('📱 AudioContext initialized:', this.audioContext.state);
    } catch (e) {
      console.warn('⚠️ Could not create AudioContext early:', e);
    }
  }
  
  async unlockAudioContext() {
    if (this.isUnlocked) return true;
    
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.001;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
      
      const silentAudio = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmY1OC4yOS4xMAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xAAIAAIAGAAAAABJbmZvAAAADwAAAAMAABqyAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAA5TEFNRTMuOTlyAc0AAAAAAAAAABUgJAUHQQAB4AAAAbIqPqsqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//M4xDsAAAGkAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      silentAudio.volume = 0.01;
      
      try {
        await silentAudio.play();
        silentAudio.pause();
      } catch (e) {
        console.warn('⚠️ Silent audio play failed:', e);
      }
      
      this.isUnlocked = true;
      console.log('🔓 Mobile audio unlocked!');
      this.processQueue();
      return true;
    } catch (error) {
      console.error('❌ Failed to unlock audio:', error);
      return false;
    }
  }
  
  async queueAudio(audioBlob) {
    console.log('🎵 Adding audio to queue. Queue length:', this.audioQueue.length);
    this.audioQueue.push(audioBlob);
    
    if (!this.isPlaying) {
      await this.processQueue();
    }
  }
  
  async processQueue() {
    if (this.audioQueue.length === 0 || this.isPlaying) return;
    
    this.isPlaying = true;
    console.log('🎵 Starting audio queue processing...');
    
    while (this.audioQueue.length > 0) {
      const audioBlob = this.audioQueue.shift();
      console.log('🎵 Playing audio. Remaining in queue:', this.audioQueue.length);
      
      try {
        await this.playAudio(audioBlob);
        console.log('✅ Audio finished, continuing to next...');
        await new Promise(resolve => setTimeout(resolve, 0));
      } catch (error) {
        console.error('❌ Error playing queued audio:', error);
      }
    }
    
    this.isPlaying = false;
    console.log('🏁 Audio queue processing complete');
  }
  
  async playAudio(audioBlob) {
    this.stop();
    
    if (!this.isUnlocked) {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        throw new Error('Audio context locked');
      }
    }
    
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        console.log('🎵 Audio ended naturally');
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        resolve();
      };
      
      this.currentAudio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        reject(e);
      };
      
      this.currentAudio.play()
        .then(() => {
          console.log('▶️ Audio started playing');
        })
        .catch(reject);
    });
  }
  
  stop() {
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    console.log('🛑 Audio stopped and queue cleared');
  }
}

// Create and export global instance
const mobileAudioManager = new MobileAudioManager();

export default mobileAudioManager;