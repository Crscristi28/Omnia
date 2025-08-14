/**
 * 🎨 Chat Styles
 * 
 * All style constants extracted from App.jsx for better organization.
 * These are the memoized style objects used throughout the chat interface.
 */

// Detect mobile from window (same logic as in App.jsx)
const isMobile = window.innerWidth <= 768;

// 📱 MESSAGE CONTAINERS
export const messageContainerBaseStyle = {
  display: 'flex',
  paddingBottom: '1.5rem',
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem'
};

export const userMessageContainerStyle = {
  ...messageContainerBaseStyle,
  justifyContent: 'flex-end',
  paddingBottom: '2rem'
};

export const botMessageContainerStyle = {
  ...messageContainerBaseStyle,
  justifyContent: 'flex-start'
};

// 🔄 LOADING STYLES
export const loadingContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  width: '100%'
};

export const loadingBoxStyle = {
  width: '95%',
  padding: '1.2rem',
  paddingLeft: '1rem',
  fontSize: '1rem',
  color: '#ffffff',
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  textAlign: 'left'
};

// 👤 USER MESSAGE STYLES
export const userContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.8rem',
  width: '100%',
  paddingLeft: '0',
  paddingRight: '0'
};

export const userBubbleStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  padding: '1.2rem 1.4rem',
  borderRadius: '25px',
  fontSize: '1rem',
  lineHeight: '1.3',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  width: '95%',
  margin: '0 auto'
};

// 🤖 BOT MESSAGE STYLES  
export const botContainerStyle = {
  width: '95%',
  margin: '0 auto',
  fontSize: '1rem',
  lineHeight: '1.3',
  whiteSpace: 'normal',
  color: '#FFFFFF',
  textAlign: 'left'
};

export const botHeaderStyle = {
  fontSize: '0.75rem',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center',
  paddingBottom: '1.4rem'
};

export const botNameStyle = {
  fontWeight: '600',
  color: '#a0aec0',
  display: 'flex',
  alignItems: 'center'
};

// ⏳ LOADING ANIMATION STYLES
export const loadingAnimationContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem'
};

export const loadingSpinnerStyle = {
  width: '18px',
  height: '18px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTop: '2px solid #00ffff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  flexShrink: 0
};

export const loadingTextStyleStreaming = {
  color: '#00ffff',
  fontWeight: '500'
};

export const loadingTextStyleNormal = {
  color: '#a0aec0',
  fontWeight: '500'
};

export const loadingDotsContainerStyle = {
  display: 'flex',
  gap: '4px',
  alignItems: 'center'
};

// Base style for loading dots
const loadingDotBaseStyle = {
  animation: 'pulse 1.4s ease-in-out infinite',
  fontSize: '24px',
  textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
  color: '#00ffff',
  transform: 'translateZ(0)'
};

export const loadingDotStyle = loadingDotBaseStyle;

export const loadingDot2Style = {
  ...loadingDotBaseStyle,
  animation: 'pulse 1.4s ease-in-out 0.2s infinite'
};

export const loadingDot3Style = {
  ...loadingDotBaseStyle,
  animation: 'pulse 1.4s ease-in-out 0.4s infinite'
};

// 🖼️ IMAGE STYLES
export const imageStyle = {
  maxWidth: '100%',
  maxHeight: '300px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  transform: 'scale(1) translateZ(0)',
  willChange: 'transform'
};

export const userAttachmentsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%'
};

export const userAttachmentWrapperStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%'
};

// 📱 MODEL DROPDOWN STYLES
export const modelDropdownSpanStyle = {
  fontSize: '0.8rem'
};

export const modelDropdownIconStyle = {
  fontSize: '0.8rem'
};

export const modelDropdownContainerStyle = {
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: '8px',
  zIndex: 1000,
  backgroundColor: 'rgba(31, 41, 55, 0.95)',
  borderRadius: '12px',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  minWidth: '200px',
  padding: '0.5rem 0'
};

export const modelButtonBaseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'all 0.2s ease'
};

export const modelNameStyle = {
  fontSize: '0.9rem',
  fontWeight: '600'
};

export const modelDescriptionStyle = {
  fontSize: '0.75rem',
  opacity: 0.7
};

// 🏠 MAIN LAYOUT STYLES
export const mainContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden'
};

export const topHeaderStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(0, 4, 40, 0.8)'
};

export const hamburgerButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease'
};

export const newChatButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease'
};

// 💬 CHAT CONTENT STYLES
export const mainContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  position: 'relative',
  overflow: 'hidden'
};

export const messagesContainerStyle = {
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'relative'
};

// 🎉 WELCOME SCREEN STYLES
export const welcomeScreenStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const welcomeTextContainerStyle = {
  textAlign: 'center',
  zIndex: 2,
  maxWidth: '600px',
  padding: '0 2rem'
};

export const welcomeTitleStyle = {
  fontWeight: 'bold',
  marginBottom: '1rem',
  color: 'white'
};

export const welcomeSubtitleStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '2rem'
};

// 🗨️ CHAT WRAPPER STYLES
export const chatMessagesWrapperStyle = {
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1
};

// 📜 VIRTUOSO STYLES
export const virtuosoStyle = {
  height: '100%',
  width: '100%'
};

export const virtuosoFooterStyle = {
  height: '475px' // Jen scroll efekt, main kontejner má paddingBottom pro InputBar
};

export const virtuosoInlineStyle = {
  ...virtuosoStyle,
  zIndex: 1,
  position: 'relative'
};

// Export all styles as a single object for convenience
export const chatStyles = {
  messageContainerBaseStyle,
  userMessageContainerStyle,
  botMessageContainerStyle,
  loadingContainerStyle,
  loadingBoxStyle,
  userContainerStyle,
  userBubbleStyle,
  botContainerStyle,
  botHeaderStyle,
  botNameStyle,
  loadingAnimationContainerStyle,
  loadingSpinnerStyle,
  loadingTextStyleStreaming,
  loadingTextStyleNormal,
  loadingDotsContainerStyle,
  loadingDotStyle,
  loadingDot2Style,
  loadingDot3Style,
  imageStyle,
  userAttachmentsContainerStyle,
  userAttachmentWrapperStyle,
  modelDropdownSpanStyle,
  modelDropdownIconStyle,
  modelDropdownContainerStyle,
  modelButtonBaseStyle,
  modelNameStyle,
  modelDescriptionStyle,
  mainContainerStyle,
  topHeaderStyle,
  hamburgerButtonStyle,
  newChatButtonStyle,
  mainContentStyle,
  messagesContainerStyle,
  welcomeScreenStyle,
  welcomeTextContainerStyle,
  welcomeTitleStyle,
  welcomeSubtitleStyle,
  chatMessagesWrapperStyle,
  virtuosoStyle,
  virtuosoFooterStyle,
  virtuosoInlineStyle
};