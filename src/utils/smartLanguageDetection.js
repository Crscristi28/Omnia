// 🌍 SMART LANGUAGE DETECTION - Weighted Algorithm
// ✅ FIXES: "Ce sti sa faci a cine esti tu?" → correctly detects Romanian
// 🎯 REAL-WORLD: Supports no-diacritics typing (70-80% of users)

const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'cs';
  
  const lowerText = text.toLowerCase().trim();
  
  // 🔧 SHORT TEXT HANDLING - Less aggressive detection
  if (lowerText.length < 10) {
    if (['hello', 'hi', 'yes', 'no', 'thanks'].some(word => lowerText.includes(word))) return 'en';
    if (['salut', 'bună', 'mulțumesc'].some(word => lowerText.includes(word))) return 'ro';
    return 'cs'; // Default for short unclear text
  }

  // 1. DIACRITICS DETECTION (highest confidence)
  if (/[áčďéěíňóřšťúůýž]/i.test(text)) return 'cs';
  if (/[ăâîșțĂÂÎȘȚ]/i.test(text)) return 'ro';

  // 2. EXPLICIT LANGUAGE REQUESTS (highest priority)
  const explicitCzech = [
    'mluv česky', 'mluvte česky', 'řekni mi česky', 'odpověz česky', 'chci česky',
    'přepni na češtinu', 'česká odpověď', 'v češtině'
  ];

  const explicitEnglish = [
    'speak english', 'talk english', 'answer in english', 'switch to english', 'i want english',
    'respond in english', 'english please', 'can you speak english'
  ];

  const explicitRomanian = [
    'vorbește română', 'răspunde în română', 'vreau română', 'schimbă la română',
    'poți vorbi română', 'limba română'
  ];

  for (const phrase of explicitCzech) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  
  for (const phrase of explicitEnglish) {
    if (lowerText.includes(phrase)) return 'en';
  }

  for (const phrase of explicitRomanian) {
    if (lowerText.includes(phrase)) return 'ro';
  }

  // 3. CONVERSATIONAL PHRASES (high confidence)
  const conversationalCzech = [
    'co děláš', 'jak se máš', 'co se děje', 'jak to jde', 'co je nového',
    'děláš si sranda', 'myslíš si', 'co si myslíš', 'máš čas', 'můžeš mi',
    'jak se mas', 'co delas', 'muzeme si', 'muzes mi'  // ✅ No-diacritics variants
  ];

  const conversationalEnglish = [
    'what are you doing', 'how are you', 'what\'s up', 'how\'s it going', 'what\'s new',
    'are you kidding', 'do you think', 'what do you think', 'can you help', 'tell me about'
  ];

  const conversationalRomanian = [
    'ce faci', 'cum ești', 'ce mai faci', 'cum merge', 'ce e nou',
    'îmi poți spune', 'mă poți ajuta', 'explică-mi', 'ce crezi',
    'ce esti', 'cum esti', 'ce sti'  // ✅ No-diacritics variants
  ];

  for (const phrase of conversationalCzech) {
    if (lowerText.includes(phrase)) return 'cs';
  }
  
  for (const phrase of conversationalEnglish) {
    if (lowerText.includes(phrase)) return 'en';
  }

  for (const phrase of conversationalRomanian) {
    if (lowerText.includes(phrase)) return 'ro';
  }

  // 4. WEIGHTED WORD SCORING - ✅ FIXED: Removed weak words that cause false positives
  const strongRomanianWords = {
    // STRONGEST indicators (3 points)
    'ce': 3, 'cum': 3, 'unde': 3, 'faci': 3, 'esti': 3,
    'sunt': 3, 'multumesc': 3, 'salut': 3, 'cine': 3,
    
    // MEDIUM indicators (2 points)  
    'sa': 2, 'si': 2, 'de': 2, 'la': 2, 'cu': 2,
    'sti': 2, 'fac': 2, 'merge': 2,
    
    // WEAK indicators (1 point)
    'nu': 1, 'da': 1, 'ma': 1
  };
  
  const strongCzechWords = {
    // STRONGEST indicators (3 points)
    'muzes': 3, 'muzeme': 3, 'dekuji': 3, 'prosim': 3, 'ahoj': 3,
    'jsem': 3, 'jsi': 3, 'mas': 3, 'jak': 3, 'mluv': 3,
    
    // MEDIUM indicators (2 points)
    'co': 2, 'kde': 2, 'kdy': 2, 'proc': 2, 'kdo': 2,
    'delas': 2, 'muzou': 2, 'chci': 2,
    
    // WEAK indicators (1 point) - ✅ REMOVED 'a' (was causing false positives!)
    'ne': 1, 'ano': 1, 'se': 1, 'si': 1
  };

  const strongEnglishWords = {
    // STRONGEST indicators (3 points)
    'what': 3, 'how': 3, 'where': 3, 'when': 3, 'why': 3,
    'doing': 3, 'think': 3, 'help': 3, 'please': 3,
    
    // MEDIUM indicators (2 points)
    'the': 2, 'and': 2, 'you': 2, 'are': 2, 'can': 2,
    'tell': 2, 'know': 2, 'want': 2,
    
    // WEAK indicators (1 point)
    'is': 1, 'it': 1, 'me': 1, 'my': 1
  };

  let czechScore = 0;
  let romanianScore = 0;
  let englishScore = 0;

  // Calculate scores
  Object.entries(strongCzechWords).forEach(([word, weight]) => {
    if (lowerText.includes(word)) czechScore += weight;
  });
  
  Object.entries(strongRomanianWords).forEach(([word, weight]) => {
    if (lowerText.includes(word)) romanianScore += weight;
  });

  Object.entries(strongEnglishWords).forEach(([word, weight]) => {
    if (lowerText.includes(word)) englishScore += weight;
  });

  // 5. DECISION WITH CLEAR THRESHOLDS
  const scores = { 'cs': czechScore, 'ro': romanianScore, 'en': englishScore };
  const maxScore = Math.max(...Object.values(scores));
  
  // Require minimum confidence threshold
  if (maxScore >= 3) {
    const detectedLang = Object.keys(scores).find(key => scores[key] === maxScore);
    console.log('🌍 Language detection:', { 
      text: lowerText.substring(0, 30), 
      scores, 
      detected: detectedLang 
    });
    return detectedLang || 'cs';
  }
  
  console.log('🌍 Language detection: insufficient confidence, defaulting to Czech');
  return 'cs'; // Default fallback
};

// ✅ TEST CASES - Validates the fixes
const testCases = [
  {
    input: "Ce sti sa faci a cine esti tu?",
    expected: 'ro',
    description: "CRITICAL TEST: Romanian with single 'a' should not confuse detector"
  },
  {
    input: "muzes mi rict jak se mas",
    expected: 'cs', 
    description: "Czech without diacritics"
  },
  {
    input: "hello how are you doing today",
    expected: 'en',
    description: "Clear English"
  },
  {
    input: "what are you doing",
    expected: 'en',
    description: "English phrase"
  },
  {
    input: "ce faci acum",
    expected: 'ro',
    description: "Romanian phrase"
  }
];

// Run tests (for development)
if (typeof window === 'undefined') { // Node.js environment
  testCases.forEach((test, idx) => {
    const result = detectLanguage(test.input);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`${status} Test ${idx + 1}: "${test.input}" → ${result} (expected: ${test.expected})`);
  });
}

export default detectLanguage;