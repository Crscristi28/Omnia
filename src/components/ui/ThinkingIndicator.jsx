// 🤔 ThinkingIndicator.jsx - Standalone thinking indicator outside Virtuoso
// ✅ Extracted from MessageItem to prevent Virtuoso layout issues

import React from 'react';
import { getTranslation } from '../../utils/text';

// Import styles from ChatStyles.js
import {
  loadingContainerStyle,
  loadingBoxStyle, 
  loadingAnimationContainerStyle,
  loadingSpinnerStyle,
  loadingDotsContainerStyle,
  loadingDotStyle,
  loadingDot2Style,
  loadingDot3Style,
  messageContainerBaseStyle
} from '../../styles/ChatStyles';

const ThinkingIndicator = ({ 
  loading, 
  streaming, 
  isSearching, 
  uiLanguage 
}) => {
  // Don't render if no loading state
  if (!loading && !streaming && !isSearching) {
    return null;
  }

  // Get appropriate text
  const getText = () => {
    if (streaming) return 'Streaming...';
    if (isSearching) return getTranslation(uiLanguage, 'searching');
    return getTranslation(uiLanguage, 'thinking');
  };

  return (
    <div style={{
      ...messageContainerBaseStyle,
      justifyContent: 'flex-start'  // Same as bot messages
    }}>
      <div style={loadingContainerStyle}>
        <div style={loadingBoxStyle}>
          <div style={loadingAnimationContainerStyle}>
            <div style={loadingSpinnerStyle}></div>
            {/* ALWAYS show dots for all loading states */}
            <span style={loadingDotsContainerStyle}>
              <span style={loadingDotStyle}>●</span>
              <span style={loadingDot2Style}>●</span>
              <span style={loadingDot3Style}>●</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;