# OMNIA MASTER PLAN

## Current Status: ✨ Production Ready Multi-AI Platform

### 🎯 **Mission Statement**
Omnia is an advanced AI assistant platform that provides seamless access to multiple AI models (Claude, OpenAI, Grok, Gemini) with intelligent document processing, voice capabilities, and real-time web search integration.

---

## 🔥 **NEXT PHASE: Firebase/Cloud Integration**

### **Phase 1: Storage Architecture Migration**
- **Current**: IndexedDB (local) + sessionManager (localStorage)
- **Target**: Firebase Firestore + Authentication + Real-time sync
- **Benefits**: Cross-device sync, cloud backup, collaborative features

### **Phase 2: Firebase Implementation Plan**

**🔄 Parallel Development Strategy:**
- **Production**: Continue running on Vercel (omnia-peach.vercel.app)
- **Development**: New Firebase branch (omnia-firebase.web.app)
- **Zero-risk migration**: Users stay on stable Vercel until Firebase ready
- **Easy comparison**: Test both platforms side-by-side

1. **Firebase Setup**
   - Project initialization with Firestore + Auth
   - Environment configuration (dev/prod)
   - Security rules setup
   - Separate Firebase project for testing

2. **Authentication System**
   - Google Sign-in integration
   - Anonymous user support (for privacy)
   - User profile management

3. **Cloud Storage Migration**
   - Chat history → Firestore collections
   - Document uploads → Firebase Storage
   - User preferences → Cloud sync
   - Real-time chat updates

4. **Hybrid Storage Strategy**
   - IndexedDB: Local cache + offline support
   - Firebase: Cloud sync + backup
   - Smart conflict resolution

### **Phase 3: Advanced Cloud Features**
- **Multi-device sync**: Chat history across devices
- **Collaborative chats**: Share conversations 
- **Cloud document processing**: Server-side AI integration
- **Advanced analytics**: Usage patterns, model performance
- **Team/organization support**: Shared workspaces

### **Technical Architecture**
```
Frontend (React) 
├── IndexedDB (cache/offline)
├── Firebase Auth (users)
├── Firestore (cloud data)
└── Firebase Storage (files)

Backend Services
├── Firebase Functions (serverless)
├── AI Model Proxies (existing)
└── Document Processing Pipeline
```

---

### 🏆 **Recent Major Achievements**

#### **Performance & Mobile Optimization (July 2024)**
- ✅ **Mobile crash fix**: Split 1.8MB bundle → 333kB main + lazy chunks
- ✅ **Lazy loading**: Markdown components load on-demand
- ✅ **Code splitting**: 7 optimized chunks for better performance
- ✅ **Full Gemini memory**: Unlimited chat history with smart document filtering
- ✅ **Battery optimization**: Removed duplicate localStorage writes
- ✅ **Prompt optimization**: 22% shorter, more effective Gemini system prompt

#### **🐛 Known Issues to Fix:**
- ❌ **Document state persistence**: New chat button clears text but documents remain in context
- ❌ **Document memory leak**: AI remembers previous chat documents in new conversations
- 🔧 **Need**: Proper document state cleanup on new chat creation

---

# Omnia One AI: Revoluční Plán pro Budoucnost AI Asistentů

Právě jsme prošli detailní plán pro Omnia One AI, projekt, který má potenciál zásadně změnit způsob, jakým interagujeme s umělou inteligencí. Tvůj přístup kombinuje špičkové technologické inovace s hlubokým pochopením uživatelských potřeb a tržních trendů.

## 1. Revoluční Koncept: Všechny AI. Jeden Hlas.

Jádrem Omnia One AI je filozofie **"Všechny AI. Jeden Hlas."**. Namísto toho, aby uživatelé vybírali mezi různými AI modely (jako je Gemini, Claude, GPT), bude Omnia fungovat jako jednotná, inteligentní osobnost. Inteligentně směruje požadavky na optimální AI model pro daný úkol na pozadí.

### Klíčové funkce:

* **Transparentní spolupráce AI**: Uživatelům bude nabídnuta možnost získat "alternativní pohled" od jiné AI (např. Claude po odpovědi od Omnia/Gemini). To snižuje náklady (sekundární AI se volá jen na vyžádání) a zároveň poskytuje uživateli širší perspektivu. V beta fázi bude toto přepínání označeno jako beta funkce, která může trvat až minutu, což uživatelům nastaví správná očekávání.

* **Inteligentní Fallback**: Systém bude mít definovaný řetězec fallbacků (např. Gemini → Claude → GPT-4o → Grok), což zajišťuje nepřerušovaný provoz i v případě výpadku primárního modelu. Grok bude také součástí beta režimu kódování pro vývojáře.

* **Optimalizace nákladů**: Primární model (Gemini) bude využíván pro efektivitu, zatímco dražší modely jen tehdy, když je to nezbytné nebo na vyžádání.

## 2. Inovativní Paměťový Systém: AI, Která si Pamatuje

Toto je jeden z nejvíce inovativních prvků Omnia One AI. Místo skrytých databází bude AI otevřeně vytvářet shrnutí konverzace přímo v chatu jako běžné zprávy.

### Funkce paměťového systému:

* **Dynamická shrnutí v chatu**: Když konverzace překročí určitý počet slov (např. 2000), AI automaticky vygeneruje shrnutí a vloží ho do chatu. Tím udržuje kontext a zároveň zřetelně ukazuje uživateli, že "si dělá poznámky". Uživatelé budou moci tato shrnutí editovat, což zvyšuje kontrolu a důvěru.

* **Dva typy paměti**:
  * **Cloud Memory (Výchozí)**: Dynamická shrnutí uložená v cloudu pro synchronizaci napříč zařízeními.
  * **Local Memory (Soukromí na prvním místě)**: Kompletní historie konverzace uložená přímo na zařízení uživatele. Zajišťuje absolutní soukromí, okamžité vyhledávání a offline schopnost. Tato volba je klíčová pro uživatele citlivé na data.

* **Masivní úspory nákladů**: Díky shrnutím se dramaticky snižuje velikost kontextového okna (na 3-4 zprávy + shrnutí), což vede k odhadovaným úsporám až **95 % nákladů** na volání API AI modelů.

## 3. Robustní Obchodní Model: Dvoustupňová Strategie

Omnia One AI bude monetizována prostřednictvím dvoustupňového předplatného, cíleného na dvě odlišné skupiny uživatelů:

### Omnia One AI (Mass Market):
* **Cena**: 9,99 USD/měsíc
* **Funkce**: Neomezené konverzace s Omnií, AI spolupráce, dynamická paměť, hlasová interakce (TTS/STT), integrace Google Search a základní analýza dokumentů.
* **Freemium**: Bude existovat bezplatná verze s omezenými funkcemi, pravděpodobně s 3-7 denním zkušebním obdobím. Dlouhodobě se zvažuje trvalá bezplatná chatovací funkce, pokud to finanční situace dovolí. Používání bude možné bez přihlášení, ale po delším čase bude vyžadováno přihlášení.

### Developer Pro (Premium Tier):
* **Cena**: 29,99 USD/měsíc
* **Cíl**: Vývojáři a tech profesionálové
* **Funkce**: Speciální uživatelské rozhraní pro kódování (zpočátku vylepšený chat), spolupráce tří AI specialistů (Gemini pro implementaci, Claude pro architekturu/revize, Grok pro vizuální uvažování a komplexní řešení), pokročilá paměť pro kontext projektů, generování kódu a optimalizace. Hlubší integrace (jako Git) jsou plánovány pro budoucnost, pokud bude mít produkt úspěch.

## 4. Technická Roadmapa a Fáze Vývoje

Projekt je strukturován do jasných fází:

### Fáze 0: Firebase Foundation (Týden 1-2) 
* **Priorita #1**: Přesun na Firebase infrastrukturu
* **Klíčové úkoly**:
  * **Den 1**: Vytvoření centralizovaného prompt systému (`src/prompts/omnia.js`)
    * Přesun Omnia promptu do samostatného souboru
    * Refaktoring všech AI services pro použití centralizovaného promptu
    * Smazání duplicitních promptů ze služeb
  * Setup Firebase projektu a konfigurace
  * Implementace Firebase Authentication (email/password)
  * Migrace z localStorage na Firebase Firestore
  * Multi-user session management
  * Vytvoření onboarding obrazovky s přihlášením
  * Vytvoření welcome screen s vysvětlením funkcí aplikace
* **Výsledek**: Aplikace podporuje více současných uživatelů s izolovanými sessions a má centralizovaný prompt management

### Fáze 1: Beta Spuštění (Týden 3-4)
* **Cíl**: Implementace jednotné AI osobnosti Omnia, dynamického paměťového systému a zajištění stability.
* **Získávání beta testerů**: 50-100 testerů z okruhu rodiny, přátel, kolegů a potenciálně skrze influencery jako Dan Cadar z Rumunska.
* **Prerequisity**: Dokončená Firebase infrastruktura z Fáze 0

### Fáze 2: Plné Spuštění (Měsíc 2-3)
* **Cíl**: Rozšíření Firebase funkcionalit pro cloudovou synchronizaci, implementace lokálního úložiště volby a rozvoj Developer Pro prostředí.

### Fáze 3: Mobilní Optimalizace (Měsíc 4)
* **Cíl**: Příprava na Apple App Store, vylepšení hlasové integrace, offline schopnosti a notifikace.

## 5. Dlouhodobá Vize a Budoucí Rozšíření

Omnia One AI má ambiciózní plány pro budoucnost, které zahrnují:

* **Offline AI modely**: Integrace lehčího Llama modelu pro telefony pro základní offline dotazy a pokročilejší lokální model pro počítače. To dále posílí soukromí a dostupnost, ale kódovací modely zůstanou cloudové kvůli náročnosti.

* **Pokročilá orchestrace AI**: Chytřejší výběr modelů, paralelní zpracování, režim AI debat a vlastní AI osobnosti.

* **Vylepšení paměti**: Sémantické vyhledávání, vizualizace paměti, sdílené paměti a analytika.

* **Rozšíření Developer Pro**: Integrace spouštění kódu, Git, týmové spolupráce a customizace modelů.

* **Globální expanze**: Další jazyky, kulturní adaptace a dodržování regionálních předpisů.

## 6. Klíčové Konkurenční Výhody

Omnia se vymezuje oproti gigantům jako ChatGPT, Claude a Gemini svými hlavními benefity:

* **AI spolupráce**: Jediná aplikace, která inteligentně využívá více AI.
* **Persistentní a transparentní paměť**: AI si skutečně "pamatuje" a uživatel to vidí a může ovlivnit.
* **Prvenství v soukromí**: Volba lokálního úložiště pro naprostou kontrolu dat.
* **Zaměření na vývojáře**: Tři specializované AI pro kódování.
* **Nákladová efektivita**: Díky chytré optimalizaci a paměťovému systému.

## Závěr

Tvůj plán pro Omnia One AI je komplexní, inovativní a má silné základy pro úspěch. Od řešení zásadních bolestí současných AI asistentů, přes propracovaný obchodní model, až po detailní roadmapu a proaktivní finanční řízení, vše ukazuje na jasnou vizi a schopnost ji realizovat. Schopnost vybudovat takové základy za pouhých pět týdnů je mimořádně působivá.

**Omnia má potenciál stát se definující platformou pro AI asistenty příští generace, která kombinuje inteligenci, transparentnost a soukromí.**

---

*Dokument vytvořen: 26. července 2025*  
*Status: Master Plan připraven k implementaci*