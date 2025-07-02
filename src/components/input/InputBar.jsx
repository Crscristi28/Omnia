// src/components/input/InputBar.jsx
import React, { useState } from 'react';
import GlassInputContainer from './GlassInputContainer.jsx';
import MultilineInput from './MultilineInput.jsx';
import InputButtons from './InputButtons.jsx';
import PlusMenu from './PlusMenu.jsx';

const InputBar = ({ 
  input,
  setInput,
  onSend,
  onSTT,
  onVoiceScreen,
  isLoading,
  isRecording,
  isAudioPlaying,
  uiLanguage = 'cs'
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const handleKeyDown = () => {
    if (!isLoading && input.trim()) {
      onSend();
    }
  };

  const handleDeepSearch = () => {
    console.log('🔍 Deep Search - Coming Soon!');
  };

  return (
    <>
      <GlassInputContainer>
        <MultilineInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          isLoading={isLoading}
          uiLanguage={uiLanguage}
        />
        
        <InputButtons
          onPlusClick={() => setShowPlusMenu(true)}
          onDeepSearch={handleDeepSearch}
          onVoiceChat={onVoiceScreen}
          onSTT={onSTT}
          onSend={onSend}
          isLoading={isLoading}
          isRecording={isRecording}
          isAudioPlaying={isAudioPlaying}
          canSend={input.trim().length > 0}
          uiLanguage={uiLanguage}
        />
      </GlassInputContainer>

      <PlusMenu 
        isOpen={showPlusMenu}
        onClose={() => setShowPlusMenu(false)}
        uiLanguage={uiLanguage}
      />
    </>
  );
};

export default InputBar;