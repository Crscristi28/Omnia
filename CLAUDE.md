# 🚨 KRITICKÁ PRAVIDLA PRO CLAUDE - OMNIA PROJECT

## ⛔ ABSOLUTNÍ ZÁKAZY

1. **NIKDY nedělej `git reset --hard` na starý commit** bez explicitního povolení
2. **NIKDY neměň věci co fungují** jen proto, že "by to mohlo být lepší"  
3. **NIKDY force push** bez explicitního souhlasu
4. **NIKDY neměň git historii** bez diskuze
5. **NIKDY nepřidávaj nové funkce přímo do App.jsx** (už má 2300+ řádků!)

## 🏗️ MODULARITA - NEJVYŠŠÍ PRIORITA

### Pravidlo #1: "Pokud je to víc než 20 řádků → VYEXTRAKTUJ!"

**KAM CO PATŘÍ:**
- `/src/services/` - Business logika, API volání, data processing
- `/src/components/` - UI komponenty, vizuální prvky
- `/src/utils/` - Pomocné funkce, validace, konverze
- `/src/hooks/` - Custom React hooks
- `App.jsx` - JEN orchestrace a propojení! NE implementace!

### Při přidávání nové funkce:
1. NEJDŘÍV vytvoř service/component/util
2. PAK integruj do App.jsx
3. NIKDY nepsat logiku přímo do App.jsx

## 📝 GIT WORKFLOW PRAVIDLA

### Před každou změnou:
1. Zkontroluj `git status`
2. Ulož aktuální práci
3. NIKDY neztrácej uncommitted změny

### Při problémech:
1. Diagnostikuj PŘESNÝ problém
2. Oprav JEN to co je rozbité
3. Nezasahuj do fungujících částí

### Commitování:
- Commituj často s jasným popisem
- Push pravidelně na remote
- Vždy před větší změnou vytvoř backup commit

## 🎯 AKTUÁLNÍ STAV PROJEKTU

### Co FUNGUJE (neměnit!):
- ✅ Voice chat s Gemini modelem
- ✅ TTS/STT integrace (ElevenLabs + fallback)
- ✅ IndexedDB chat storage (bez pagination - záměrně!)
- ✅ Virtuoso rendering (zvládá 1000+ zpráv)
- ✅ Limit 1000 zpráv/1M tokenů na chat
- ✅ **NOVÝ: Direct upload systém do GCS (až 100MB soubory!)**
- ✅ **NOVÝ: Automatické rozhodování upload metody (<3MB=Vercel, ≥3MB=GCS)**
- ✅ **NOVÝ: Dual URL format support (gs:// + https://)**

### Známé quirks (neopravovat pokud není kritické):
- TTS na mobilu potřebuje 0ms delay (iOS gesture chain)
- DOM warnings z Virtuoso (ignorovat)
- Voice chat občas nefunguje na iOS PWA

## 🔧 DEVELOPMENT

```bash
npm run dev      # Local development
npm run build    # Production build  
npm run proxy    # Proxy server (port 3001)
```

### Deployment:
- Automatický deploy na Vercel z `main` branch
- Environment variables jsou na Vercel

## ⚠️ DŮLEŽITÉ POZNÁMKY

1. **NEPOUŽÍVAT PAGINATION** - Virtuoso zvládá 1000+ zpráv bez problémů
2. **Voice chat VŽDY přepíná na Gemini** (cost optimization)
3. **V RAM je VŽDY jen 1 aktivní chat** (ostatní v IndexedDB)
4. **Lazy loading** - metadata chatů se načítají bez zpráv

## 🛑 PŘED VELKÝMI ZMĚNAMI

**VŽDY SE ZEPTEJ:**
- "Opravdu to potřebujeme změnit?"
- "Funguje současné řešení?"
- "Kam to patří podle modularity?"
- "Nezničím tím něco jiného?"

## 📊 ARCHITEKTURA

```
/src/App.jsx           → POUZE orchestrace (cíl: < 1000 řádků!)
/src/services/         → Business logika
/src/components/       → UI komponenty  
/src/utils/           → Pomocné funkce
/api/                 → Vercel serverless funkce
```

## 🎯 HLAVNÍ CÍL

**Udržet kód:**
1. MODULÁRNÍ - každá funkce na svém místě
2. JEDNODUCHÝ - nepřidávat zbytečnou komplexitu
3. FUNKČNÍ - neopravovat co není rozbité

---
*"Premature optimization is the root of all evil" - Donald Knuth*  
*"If it works, don't touch it" - Every developer ever*