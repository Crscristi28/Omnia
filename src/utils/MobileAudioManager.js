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
    this.silentAudioPlayed = false; // Track iOS silent mode hack
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
        console.log('🔄 AudioContext suspended, attempting resume...');
        try {
          await this.audioContext.resume();
          console.log('✅ AudioContext resume successful, new state:', this.audioContext.state);
        } catch (resumeError) {
          console.error('❌ AudioContext resume failed:', resumeError);
          throw resumeError;
        }
      } else {
        console.log('ℹ️ AudioContext already in state:', this.audioContext.state);
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.001;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
      
      // iOS Silent Mode hack - přehrát tichý zvuk pro přepnutí do playback mode
      if (this.isIOS() && !this.silentAudioPlayed) {
        try {
          const silentAudio = new Audio();
          silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAACA';
          silentAudio.volume = 0; // Nastavit hlasitost na nulu
          await silentAudio.play();
          this.silentAudioPlayed = true;
          console.log('🎵 iOS Silent Mode hack: Silent audio played successfully');
        } catch (e) {
          console.warn('⚠️ iOS Silent Mode hack failed:', e);
        }
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
  
  // Pomocná funkce pro detekci iOS
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
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
    
    // Ujistit se že máme unlocked AudioContext
    if (!this.isUnlocked || this.audioContext?.state === 'suspended') {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        throw new Error('Audio context locked');
      }
    }
    
    try {
      console.log('🎵 Playing audio via Web Audio API...');
      
      // Dekódovat audio blob pomocí Web Audio API
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Vytvořit a připojit source node
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      console.log('▶️ Web Audio API source started');
      
      // Spustit přehrávání
      source.start(0);
      
      // Vrátit Promise která se resolvne až audio skončí
      return new Promise((resolve, reject) => {
        source.onended = () => {
          console.log('🎵 Web Audio API source ended');
          resolve();
        };
        
        // Web Audio API nemá onerror, ale můžeme catch errors z decodeAudioData
        source.onerror = (e) => {
          console.error('❌ Web Audio API source error:', e);
          reject(e);
        };
      });
      
    } catch (error) {
      console.error('❌ Web Audio API playback failed:', error);
      throw error;
    }
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