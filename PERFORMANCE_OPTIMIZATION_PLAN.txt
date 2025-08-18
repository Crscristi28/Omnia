# 🚀 OMNIA PERFORMANCE OPTIMIZATION PLAN - CELKOVÝ PŘEHLED

## AKTUÁLNÍ STAV (2.8.2025)
- ✅ **KROK 1 DOKONČEN**: Smart batch loading implementován (celý chat pro <200 zpráv, batch pro 200+)
- ⚠️ **NOVÝ PROBLÉM**: AI znovu dostává všechny zprávy → pomalé odpovědi + drahé API calls

## PRIORITY PLÁN

### 🔥 **URGENT: AI Message Optimization**
**Problém**: AI dostává všech 100-200 zpráv místo optimalizovaného počtu

**Řešení**: 
- Uživatel vidí celý chat (všechny zprávy)
- AI dostane jen **posledních 15-20 zpráv** + **systémový souhrn** starších zpráv
- Implementovat funkci na vytváření souhrnů starších konverzací
- Upravit všechny AI služby (Gemini, Claude, OpenAI)

**Systémový souhrn obsahuje**:
• Klíčové body z celé konverzace
• Důležité rozhodnutí/závěry  
• Kontext potřebný pro pochopení
• Komprimovaný přehled starších zpráv

**Implementace**:
```javascript
// Pseudokód
if (messages.length > 20) {
  const recentMessages = messages.slice(-20);
  const oldMessages = messages.slice(0, -20);
  const summary = createSummary(oldMessages);
  
  sendToAI([summary, ...recentMessages]);
} else {
  sendToAI(messages);
}
```

---

## PŮVODNÍ KROKY - POKRAČOVÁNÍ

### **KROK 1: Batch Loading zpráv** ✅ **HOTOVO**
- ✅ Načítat po 15 zprávách místo celého chatu najednou
- ✅ Smart loading: celý chat pro <200 zpráv, batch pro 200+ zpráv
- ✅ Scroll detection pro načítání starších zpráv
- ✅ Loading indikátor "Načítám starší zprávy..."

**Soubory upraveny**:
- `src/services/storage/chatDB.js` - `getChatMessages(chatId, offset, limit)`
- `src/App.jsx` - smart batch loading logic
- `src/App.css` - spin animation

### **KROK 2: Virtualizování dlouhých chatů** (PRIORITY 2)  
**Co**: Renderovat jen viditelné zprávy v DOM
- Implementovat virtual scrolling
- Renderovat jen ~20 zpráv současně  
- Smooth scrolling experience

**Soubory k úpravě**:
- Nový `src/components/messages/VirtualizedMessageList.jsx`
- Upravit message rendering v App.jsx

### **KROK 3: Debounce při přepínání chatů** (PRIORITY 3)
**Co**: Zabránit zbytečným načítáním při rychlém klikání
- 200ms debounce na `handleSelectChat`
- Loading state při přepínání

**Soubory k úpravě**:
- `src/App.jsx` - přidat debounce do `handleSelectChat`

### **KROK 4: Memory Management** (PRIORITY 4)
**Co**: Omezit počet chatů v paměti  
- Max 5 chatů v paměti současně
- LRU (Least Recently Used) eviction

**Soubory k úpravě**:
- `src/App.jsx` - chat cache management
- Nový `src/utils/chatCache.js`

### **KROK 5: Compression** (PRIORITY 5 - VOLITELNÉ)
**Co**: Komprimovat dlouhé chaty před uložením
- Použít compression pro chaty >100 zpráv
- Transparent pro uživatele

**Soubory k úpravě**:
- `src/services/storage/chatDB.js` - compression layer

---

## SOUČASNÝ STATUS

### ✅ **DOKONČENO**
- **Smart Batch Loading**: Funguje pro chaty <200 zpráv (celý chat), >200 zpráv (batch)
- **PWA Auto-update**: Kontrola pouze při spuštění aplikace
- **Gemini Formatting**: Aktualizované formatting instrukce

### ❌ **POTŘEBA OPRAVIT URGENT**
- **AI Message Optimization**: AI dostává příliš mnoho zpráv → pomalé + drahé

### ⏳ **ČEKÁ NA IMPLEMENTACI**
- Kroky 2-5 podle původního plánu
- Testování batch loading oprav

---

## NEXT SESSION TODO

1. **Otestovat batch loading**: Ověřit že chaty z historie fungují správně
2. **Implementovat AI optimization**: Souhrny + posledních 15-20 zpráv  
3. **Pokračovat s kroky 2-5**: Podle potřeby a výsledků testování

---

## TECHNICKÉ POZNÁMKY

**Batch Loading Size**:
- Normální chaty: celý chat (rychlé načítání)
- Dlouhé chaty (200+): 50 zpráv po batch
- Scroll threshold: 100px pro mobilní dotyk

**AI Services Affected**:
- `src/services/ai/gemini.service.js`
- `src/services/ai/claude.service.js` 
- `src/services/ai/openai.service.js`

**Performance Metriky**:
- Cíl: ~80% rychlejší načítání dlouhých chatů
- Cíl: ~60% snížení AI API costs
- Cíl: Plynulé scrollování i u 500+ zpráv

---

*Poslední aktualizace: 2.8.2025*
*Status: AI Optimization URGENT potřeba*