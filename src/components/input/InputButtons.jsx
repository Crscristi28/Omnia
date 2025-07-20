// src/components/input/InputButtons.jsx
import React from 'react';
import { MiniOmniaLogo } from '../ui/OmniaLogos.jsx';
import OmniaArrowButton from '../ui/OmniaArrowButton.jsx';
import { getTranslation } from '../../utils/text';

const InputButtons = ({
  onPlusClick,
  onDeepSearch,
  onVoiceChat,
  onSTT,
  onSend,
  isLoading,
  isRecording,
  isAudioPlaying,
  canSend,
  uiLanguage = 'cs'
}) => {
  const isMobile = window.innerWidth <= 768;
  const buttonSize = isMobile ? 54 : 60;
  const t = getTranslation(uiLanguage);

  return (
    <>
      {/* PLUS BUTTON - placeholder */}
      <button
        onClick={onPlusClick}
        disabled={isLoading}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(45deg, #6b73ff, #9b59b6)',
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease',
          opacity: isLoading ? 0.5 : 1,
          boxShadow: '0 4px 12px rgba(107, 115, 255, 0.4)'
        }}
        title={t('plusMenu')}
      >
        +
      </button>

      {/* DEEP SEARCH BUTTON */}
      <button
        onClick={onDeepSearch}
        disabled={isLoading}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(45deg, #00ff88, #00cc66)',
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          transition: 'all 0.3s ease',
          opacity: isLoading ? 0.5 : 1,
          boxShadow: '0 4px 12px rgba(0, 255, 136, 0.4)'
        }}
        title={t('deepSearch')}
      >
        🔍
      </button>

      {/* STT BUTTON - same as current */}
      <button
        onClick={onSTT}
        disabled={isLoading || isAudioPlaying}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          border: 'none',
          background: isRecording 
            ? 'linear-gradient(45deg, #ff4444, #cc0000)' 
            : 'linear-gradient(45deg, #00ff88, #00cc66)',
          color: 'white',
          cursor: (isLoading || isAudioPlaying) ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          transition: 'all 0.3s ease',
          opacity: (isLoading || isAudioPlaying) ? 0.5 : 1,
          boxShadow: isRecording 
            ? '0 0 20px rgba(255, 68, 68, 0.6)' 
            : '0 4px 12px rgba(0, 255, 136, 0.4)'
        }}
        title={isRecording ? 'Zastavit STT nahrávání' : 'ElevenLabs Speech-to-Text'}
      >
        {isRecording ? '⏹️' : '🎤'}
      </button>

      {/* VOICE SCREEN LOGO */}
      <MiniOmniaLogo 
        size={buttonSize} 
        onClick={onVoiceChat}
        isAudioPlaying={isAudioPlaying}
        isListening={false}
        loading={isLoading} 
        streaming={false}
      />

      {/* SEND BUTTON */}
      <OmniaArrowButton
        onClick={onSend}
        disabled={isLoading || !canSend}
        loading={isLoading}
        isListening={isRecording}
        size={buttonSize}
      />
    </>
  );
};

export default InputButtons;