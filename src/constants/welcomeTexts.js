/**
 * 🌍 Welcome Text Constants
 * 
 * Multilingual welcome messages for different languages
 */

// 🌍 MULTILINGUAL WELCOME TEXTS WITH TIME-BASED GREETINGS
export const welcomeTexts = {
  cs: { 
    morning: "Dobré ráno!",
    afternoon: "Dobrý den!",
    evening: "Dobrý večer!",
    subtitle: "Jak vám dnes mohu pomoci?"
  },
  en: { 
    morning: "Good morning!",
    afternoon: "Good afternoon!",
    evening: "Good evening!",
    subtitle: "How can I help you today?"
  },
  ro: { 
    morning: "Bună dimineața!",
    afternoon: "Bună ziua!",
    evening: "Bună seara!",
    subtitle: "Cu ce vă pot ajuta astăzi?"
  }
};

// 🕐 Helper function to get time-based greeting
export const getTimeBasedGreeting = (language = 'cs') => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return welcomeTexts[language].morning;
  } else if (hour >= 12 && hour < 17) {
    return welcomeTexts[language].afternoon;
  } else {
    // Pro večer a noc použijeme jen "Dobrý večer!" - neposíláme lidi spát! 😄
    return welcomeTexts[language].evening;
  }
};