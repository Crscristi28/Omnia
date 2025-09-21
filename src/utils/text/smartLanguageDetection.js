// 🌍 ADVANCED MULTILINGUAL DETECTION SYSTEM
// 🎯 Supports 6 languages: CS, EN, RO, DE, RU, PL
// 📊 Multi-strategy detection: patterns, words, statistics
// ✅ International-first approach with smart fallbacks

const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';

  const originalText = text.trim();
  const lowerText = originalText.toLowerCase();

  // 🚀 STRATEGY 1: CHARACTER PATTERN DETECTION (highest confidence)
  if (/[áčďéěíňóřšťúůýž]/i.test(originalText)) return 'cs'; // Czech diacritics
  if (/[ăâîșțĂÂÎȘȚ]/i.test(originalText)) return 'ro'; // Romanian diacritics
  if (/[äöüßÄÖÜ]/i.test(originalText)) return 'de'; // German umlauts
  if (/[а-яё]/i.test(originalText)) return 'ru'; // Cyrillic alphabet
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/i.test(originalText)) return 'pl'; // Polish diacritics

  // 🎯 STRATEGY 2: EXPLICIT LANGUAGE REQUESTS
  const languageRequests = {
    'cs': ['mluv česky', 'mluvte česky', 'řekni mi česky', 'odpověz česky', 'chci česky', 'přepni na češtinu'],
    'en': ['speak english', 'talk english', 'answer in english', 'switch to english', 'i want english', 'respond in english'],
    'ro': ['vorbește română', 'răspunde în română', 'vreau română', 'schimbă la română', 'limba română'],
    'de': ['sprich deutsch', 'auf deutsch', 'deutsche antwort', 'wechsel zu deutsch', 'ich will deutsch'],
    'ru': ['говори по-русски', 'отвечай по-русски', 'русский язык', 'переключись на русский'],
    'pl': ['mów po polsku', 'odpowiadaj po polsku', 'język polski', 'przełącz na polski']
  };

  for (const [lang, phrases] of Object.entries(languageRequests)) {
    if (phrases.some(phrase => lowerText.includes(phrase))) return lang;
  }

  // 🔍 STRATEGY 3: SMART SHORT TEXT DETECTION
  if (lowerText.length < 20) {
    return detectShortText(lowerText);
  }

  // 📊 STRATEGY 4: STATISTICAL WORD ANALYSIS (for longer texts)
  return detectLongText(lowerText);
};

// 🔍 SHORT TEXT DETECTION (< 20 characters)
const detectShortText = (lowerText) => {
  const shortPhrases = {
    'en': ['hello', 'hi', 'hey', 'yes', 'no', 'thanks', 'thank you', 'please', 'sorry', 'excuse me',
           'tell', 'me', 'you', 'about', 'what', 'how', 'why', 'when', 'where', 'who', 'which',
           'can', 'could', 'would', 'should', 'will', 'want', 'need', 'help', 'more', 'some', 'any',
           'the', 'and', 'this', 'that', 'with', 'for', 'are', 'was', 'but', 'not', 'have', 'from'],

    'cs': ['ahoj', 'čau', 'dobrý den', 'děkuji', 'díky', 'prosím', 'promiň', 'omluva', 'ano', 'ne',
           'řekni', 'mi', 'ty', 'co', 'jak', 'proč', 'kdy', 'kde', 'kdo', 'který', 'můžeš', 'chtěl',
           'potřebuji', 'pomoc', 'více', 'něco', 'nějaký', 'dekuji', 'prosim', 'rekni', 'muzes',
           'potrebuji', 'vic', 'neco', 'nejaky', 'umis', 'delat', 'jsem', 'jsi', 'je', 'jsme', 'jste',
           'jsou', 'mas', 'mam', 'mate', 'maji', 'inteligence', 'cena', 'akcie', 'kolik', 'stoji'],

    'de': ['hallo', 'guten tag', 'danke', 'bitte', 'entschuldigung', 'ja', 'nein', 'wie', 'was',
           'wo', 'wann', 'warum', 'wer', 'welche', 'können', 'möchte', 'brauche', 'hilfe', 'mehr',
           'der', 'die', 'das', 'und', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mit', 'von',
           'zu', 'auf', 'für', 'bei', 'nach', 'über', 'durch', 'ohne', 'gegen', 'unter'],

    'ro': ['salut', 'bună', 'mulțumesc', 'te rog', 'scuze', 'da', 'nu', 'cum', 'ce', 'unde',
           'când', 'de ce', 'cine', 'care', 'poți', 'vreau', 'am nevoie', 'ajutor', 'mai mult',
           'multumesc', 'poti', 'cand', 'esti', 'sunt', 'faci', 'sti', 'la', 'cu', 'pe', 'pentru',
           'din', 'si', 'sa', 'de', 'ma', 'te', 'se', 'ne', 'va', 'le'],

    'ru': ['привет', 'здравствуйте', 'спасибо', 'пожалуйста', 'извините', 'да', 'нет', 'как',
           'что', 'где', 'когда', 'почему', 'кто', 'какой', 'можешь', 'хочу', 'нужно', 'помощь',
           'и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'а', 'то', 'все', 'она', 'так', 'его',
           'но', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне', 'было'],

    'pl': ['cześć', 'dzień dobry', 'dziękuję', 'proszę', 'przepraszam', 'tak', 'nie', 'jak',
           'co', 'gdzie', 'kiedy', 'dlaczego', 'kto', 'który', 'możesz', 'chcę', 'potrzebuję', 'pomoc',
           'w', 'na', 'i', 'z', 'że', 'do', 'się', 'o', 'a', 'za', 'od', 'po', 'przy', 'dla',
           'przez', 'ze', 'między', 'przed', 'nad', 'pod', 'bez', 'wraz', 'jako', 'aby', 'żeby']
  };

  // Score each language based on word matches with weighted scoring
  const scores = {};
  for (const [lang, words] of Object.entries(shortPhrases)) {
    let score = 0;
    for (const word of words) {
      if (lowerText.includes(word)) {
        // Give higher weight to exact matches and longer words
        const weight = word.length >= 4 ? 2 : 1;
        const isExactMatch = lowerText === word || lowerText.split(' ').includes(word);
        score += isExactMatch ? weight * 2 : weight;
      }
    }
    scores[lang] = score;
  }

  // Return language with highest score, or English as default
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    const topLangs = Object.keys(scores).filter(lang => scores[lang] === maxScore);
    // If there's a tie, prefer English, then Czech for backwards compatibility
    if (topLangs.includes('en')) return 'en';
    if (topLangs.includes('cs')) return 'cs';
    return topLangs[0];
  }

  return 'en'; // Default for unclear short text
};

// 📊 LONG TEXT STATISTICAL ANALYSIS (≥ 20 characters)
const detectLongText = (lowerText) => {
  // Common words and patterns for statistical analysis
  const languagePatterns = {
    'en': {
      words: ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'this', 'have', 'from', 'one', 'had', 'word', 'but', 'not', 'what', 'all', 'were', 'can', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'after', 'words', 'long', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'may', 'down', 'side', 'did', 'get', 'come', 'made', 'might', 'way'],
      patterns: /\b(is|are|was|were|the|and|you|that|for|with|his|they|this|have|from|but|not|what|all|can|said|each|which|their|time|will|about)\b/g
    },

    'cs': {
      words: ['je', 'se', 'na', 'za', 'do', 'od', 'po', 'při', 'bez', 'před', 'mezi', 'přes', 'který', 'která', 'které', 'jeho', 'její', 'jejich', 'také', 'nebo', 'aby', 'když', 'pokud', 'jako', 'tak', 'ani', 'jak', 'co', 'kde', 'kam', 'kdy', 'proč', 'kdo', 'tom', 'tím', 'této', 'tohoto', 'této', 'všechno', 'něco', 'nějaký', 'někdo', 'někde', 'někdy', 'někam', 'tady', 'tam', 'teď', 'pak', 'potom', 'už', 'ještě', 'pouze', 'právě', 'proto', 'tedy'],
      patterns: /\b(je|se|na|za|do|od|po|při|bez|před|mezi|přes|který|která|které|jeho|její|jejich|také|nebo|aby|když|pokud|jako|tak|ani)\b/g
    },

    'de': {
      words: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'ins'],
      patterns: /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird)\b/g
    },

    'ro': {
      words: ['de', 'la', 'în', 'cu', 'pe', 'pentru', 'din', 'ca', 'să', 'se', 'un', 'o', 'și', 'nu', 'este', 'sunt', 'care', 'ce', 'mai', 'cum', 'când', 'unde', 'dacă', 'apoi', 'după', 'înainte', 'între', 'despre', 'către', 'prin', 'până', 'fără', 'asupra', 'dupa', 'inainte', 'intre', 'catre', 'printr', 'pana', 'fara', 'asupra'],
      patterns: /\b(de|la|în|cu|pe|pentru|din|ca|să|se|un|o|și|nu|este|sunt|care|ce|mai|cum|când|unde|dacă|apoi|după|înainte|între|despre|către|prin)\b/g
    },

    'ru': {
      words: ['в', 'и', 'не', 'на', 'я', 'быть', 'он', 'с', 'как', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда', 'даже', 'ну', 'вдруг', 'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до', 'вас', 'нибудь', 'опять', 'уж', 'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей', 'может', 'они', 'тут', 'где', 'есть', 'надо', 'ней', 'для', 'мы', 'тебя', 'их', 'чем', 'была', 'сам', 'чтоб', 'без', 'будто', 'чего', 'раз', 'тоже', 'себе', 'под', 'будет', 'ж', 'тогда', 'кто', 'этот', 'того', 'потому', 'этого', 'какой', 'совсем', 'ним', 'здесь', 'этом', 'один', 'почти', 'мой', 'тем', 'чтобы', 'нее', 'сейчас', 'были', 'куда', 'зачем', 'всех', 'никогда', 'можно', 'при', 'наконец', 'два', 'об', 'другой', 'хоть', 'после', 'над', 'больше', 'тот', 'через', 'эти', 'нас', 'про', 'всего', 'них', 'какая', 'много', 'разве', 'три', 'эту', 'моя', 'впрочем', 'хорошо', 'свою', 'этой', 'перед', 'иногда', 'лучше', 'чуть', 'том', 'нельзя', 'такой', 'им', 'более', 'всегда', 'конечно', 'всю', 'между'],
      patterns: /\b(в|и|не|на|я|быть|он|с|как|а|то|все|она|так|его|но|да|ты|к|у|же|вы|за|бы|по|только|ее|мне|было|вот|от|меня|еще|нет|о|из)\b/g
    },

    'pl': {
      words: ['w', 'na', 'i', 'z', 'że', 'do', 'się', 'o', 'a', 'za', 'od', 'po', 'przy', 'dla', 'przez', 'ze', 'między', 'przed', 'nad', 'pod', 'bez', 'wobec', 'wraz', 'wśród', 'jako', 'aby', 'żeby', 'gdyby', 'jeśli', 'gdy', 'kiedy', 'gdzie', 'jak', 'co', 'kto', 'który', 'jaki', 'ile', 'czy', 'nie', 'tak', 'bardzo', 'już', 'jeszcze', 'tylko', 'także', 'również', 'nawet', 'właśnie', 'może', 'chyba', 'pewnie', 'oczywiście', 'naturalnie', 'podobnie', 'inaczej', 'jednak', 'ale', 'lecz', 'oraz', 'ani', 'albo', 'lub', 'bądź', 'czyli', 'to', 'te', 'ta', 'ten', 'tego', 'tej', 'tym', 'tych', 'mój', 'moja', 'moje', 'nasz', 'nasza', 'nasze', 'jego', 'jej', 'ich'],
      patterns: /\b(w|na|i|z|że|do|się|o|a|za|od|po|przy|dla|przez|ze|między|przed|nad|pod|bez|wobec|wraz|wśród|jako|aby|żeby|gdyby|jeśli|gdy|kiedy)\b/g
    }
  };

  // Score each language based on word frequency and patterns
  const scores = {};
  for (const [lang, config] of Object.entries(languagePatterns)) {
    let score = 0;

    // Count common words
    for (const word of config.words) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    }

    // Count pattern matches
    const patternMatches = lowerText.match(config.patterns);
    if (patternMatches) score += patternMatches.length * 2; // Patterns have higher weight

    scores[lang] = score;
  }

  // Return language with highest score, with English as default
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    return Object.keys(scores).find(lang => scores[lang] === maxScore);
  }

  return 'en'; // Default for unclear text
};

// ✅ COMPREHENSIVE TEST CASES FOR ALL 6 LANGUAGES
const testCases = [
  // ✅ ENGLISH TESTS
  { input: "hello", expected: 'en', description: "English greeting" },
  { input: "hey", expected: 'en', description: "English informal greeting" },
  { input: "tell me about you", expected: 'en', description: "CRITICAL FIX: English conversation starter" },
  { input: "what's the price of Tesla stock", expected: 'en', description: "English financial query" },
  { input: "hello how are you doing today", expected: 'en', description: "Clear English conversation" },
  { input: "can you help me with this", expected: 'en', description: "English help request" },
  { input: "what are you doing", expected: 'en', description: "English question" },
  { input: "how are you", expected: 'en', description: "English common phrase" },
  { input: "thank you very much", expected: 'en', description: "English politeness" },

  // ✅ CZECH TESTS
  { input: "ahoj", expected: 'cs', description: "Czech greeting" },
  { input: "inteligence", expected: 'cs', description: "CRITICAL FIX: inteligence should be Czech" },
  { input: "jaka je cena akcie tesla", expected: 'cs', description: "CRITICAL FIX: Czech financial query" },
  { input: "co umis delat", expected: 'cs', description: "CRITICAL FIX: Czech capabilities query" },
  { input: "muzes mi rict jak se mas dnes", expected: 'cs', description: "Czech without diacritics" },
  { input: "potrebuju pomoc s aplikaci", expected: 'cs', description: "Czech tech request" },
  { input: "kolik stoji google akcie dnes", expected: 'cs', description: "Czech price query" },
  { input: "dekuji za odpoved", expected: 'cs', description: "Czech politeness" },
  { input: "ahoj jak se mas", expected: 'cs', description: "Czech greeting conversation" },
  { input: "co se deje", expected: 'cs', description: "Czech casual question" },
  { input: "jak to jde", expected: 'cs', description: "Czech small talk" },

  // ✅ ROMANIAN TESTS
  { input: "salut", expected: 'ro', description: "Romanian greeting" },
  { input: "Ce sti sa faci a cine esti tu?", expected: 'ro', description: "Romanian with single 'a'" },
  { input: "cat costa actiunile Tesla", expected: 'ro', description: "Romanian financial query" },
  { input: "cum esti", expected: 'ro', description: "Romanian how are you" },
  { input: "ce faci", expected: 'ro', description: "Romanian what are you doing" },
  { input: "multumesc", expected: 'ro', description: "Romanian thank you" },
  { input: "unde esti", expected: 'ro', description: "Romanian where are you" },
  { input: "ce mai faci", expected: 'ro', description: "Romanian casual question" },

  // ✅ GERMAN TESTS
  { input: "hallo", expected: 'de', description: "German greeting" },
  { input: "wie geht es dir", expected: 'de', description: "German how are you" },
  { input: "was machst du", expected: 'de', description: "German what are you doing" },
  { input: "danke schön", expected: 'de', description: "German thank you" },
  { input: "guten tag", expected: 'de', description: "German good day" },
  { input: "ich brauche hilfe", expected: 'de', description: "German help request" },
  { input: "wo bist du", expected: 'de', description: "German where are you" },
  { input: "können sie mir helfen", expected: 'de', description: "German polite help request" },

  // ✅ RUSSIAN TESTS
  { input: "привет", expected: 'ru', description: "Russian greeting" },
  { input: "как дела", expected: 'ru', description: "Russian how are things" },
  { input: "что делаешь", expected: 'ru', description: "Russian what are you doing" },
  { input: "спасибо", expected: 'ru', description: "Russian thank you" },
  { input: "где ты", expected: 'ru', description: "Russian where are you" },
  { input: "помоги мне", expected: 'ru', description: "Russian help me" },
  { input: "как тебя зовут", expected: 'ru', description: "Russian what's your name" },

  // ✅ POLISH TESTS
  { input: "cześć", expected: 'pl', description: "Polish greeting" },
  { input: "jak się masz", expected: 'pl', description: "Polish how are you" },
  { input: "co robisz", expected: 'pl', description: "Polish what are you doing" },
  { input: "dziękuję", expected: 'pl', description: "Polish thank you" },
  { input: "gdzie jesteś", expected: 'pl', description: "Polish where are you" },
  { input: "pomóż mi", expected: 'pl', description: "Polish help me" },
  { input: "dzień dobry", expected: 'pl', description: "Polish good day" },

  // ✅ EDGE CASES & MIXED CONTENT
  { input: "ok", expected: 'en', description: "Short ambiguous - default English" },
  { input: "yes", expected: 'en', description: "English affirmation" },
  { input: "no", expected: 'en', description: "English negation" },
  { input: "123 test", expected: 'en', description: "Numbers with English" },
  { input: "test", expected: 'en', description: "Single English word" },

  // ✅ DIACRITICS TESTS
  { input: "můžeš mi pomoct", expected: 'cs', description: "Czech with diacritics" },
  { input: "mulțumesc foarte mult", expected: 'ro', description: "Romanian with diacritics" },
  { input: "größer als normal", expected: 'de', description: "German with umlauts" },
  { input: "większy niż zwykle", expected: 'pl', description: "Polish with diacritics" }
];

// Run tests in development
if (typeof window === 'undefined') {
  console.log('\n🧪 RUNNING ENHANCED LANGUAGE DETECTION TESTS:\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((test, idx) => {
    const result = detectLanguage(test.input);
    const status = result === test.expected ? '✅' : '❌';
    
    console.log(`${status} Test ${idx + 1}: "${test.input}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result}`);
    console.log(`   Description: ${test.description}\n`);
    
    if (result === test.expected) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${Math.round((passed / testCases.length) * 100)}%\n`);
}

export default detectLanguage;