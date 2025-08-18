# 🚀 PWA FÁZE 5: ADVANCED FEATURES - PLÁN NA ZÍTŘEK

## ✅ **DOKONČENÉ FÁZE (31.7.2025)**
- **FÁZE 1:** ✅ Vite PWA plugin + Service Worker setup
- **FÁZE 2:** ✅ Update notifications (automatické + UI)  
- **FÁZE 3:** ✅ Offline support + enhanced caching (OTESTOVÁNO!)
- **FÁZE 4:** ⏸️ ChatSidebar Safari fixes (odloženo)

---

## 🎯 **FÁZE 5: ADVANCED PWA FEATURES**

### **📲 A. CUSTOM INSTALL PROMPT**
**Priorita:** 🔥 VYSOKÁ - Zlepší UX pro nové uživatele

**Co implementovat:**
- Detekce installability (`beforeinstallprompt` event)
- Custom install button místo browser defaultu
- Install prompt komponenta (3 jazyky: cs/en/ro)
- Analytics pro install rate
- Smooth onboarding flow

**Odhad času:** 2-3 hodiny

---

### **🔄 B. BACKGROUND SYNC**
**Priorita:** 🔥 VYSOKÁ - Kritické pro reliability

**Co implementovat:**
- Service Worker background sync registrace
- Offline message queue (IndexedDB)
- Auto-retry když se vrátí internet
- Sync status indikátor v UI
- Error handling pro failed syncs

**🎯 BONUS: CHAT SAVE ON APP CLOSE FIX!**
**PŘESNĚ TAK!** 🎯 Teď je perfektní čas to vyřešit!

## 💡 **Proč to teď bude fungovat:**

### **Předtím:**
- ❌ Žádný Service Worker
- ❌ beforeunload = nespolehlivé pro async
- ❌ IndexedDB save se nestihla

### **Teď máš:**
- ✅ **Service Worker** - může dokončit operace
- ✅ **Background Sync** (zítra) - perfektní pro toto
- ✅ **Offline support** - cache první, sync později

## 🔧 **Řešení HNED:**

```javascript
// V Service Worker (sw.js):
self.addEventListener('sync', async (event) => {
  if (event.tag === 'save-chat') {
    event.waitUntil(
      // IndexedDB save se DOKONČÍ i po zavření!
      saveToIndexedDB()
    );
  }
});

// V App.jsx:
window.addEventListener('beforeunload', () => {
  if ('serviceWorker' in navigator && 'sync' in self.registration) {
    // Zaregistruj sync event
    navigator.serviceWorker.ready.then(reg => {
      reg.sync.register('save-chat');
    });
  }
});
```

## 🚀 **Nebo ještě jednodušší:**

Díky PWA improvements můžeš použít **Page Visibility API** spolehlivěji:

```javascript
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    // Uložit když user přepne pryč
    await chatDB.saveChat(); // Teď se to stihne!
  }
});
```

**Odhad času:** 3-4 hodiny

---

### **⚡ C. PERFORMANCE BOOSTS**
**Priorita:** 🟡 STŘEDNÍ - Nice-to-have optimalizace

**Co implementovat:**
- Preload critical resources
- Smart prefetching next page
- Memory usage optimization
- Faster cold start strategies
- Bundle size analysis

**Odhad času:** 2-3 hodiny

---

### **🎨 D. ENHANCED OFFLINE UI**
**Priorita:** 🟡 STŘEDNÍ - UX vylepšení

**Co implementovat:**
- Offline mode chat banner
- "Zpráva se pošle offline" toast
- Cached conversations viewer
- Better loading states
- Retry failed messages UI

**Odhad času:** 2-3 hodiny

---

### **🔔 E. PUSH NOTIFICATIONS** 
**Priorita:** 🔴 NÍZKÁ - Vyžaduje server setup

**Co implementovat:**
- Service Worker push handler
- Notification permission management
- Server-side push endpoint (Node.js)
- Notification customization
- Deep linking from notifications

**Odhad času:** 4-5 hodin (komplexní)

---

## 📋 **DOPORUČENÝ POSTUP NA ZÍTŘEK**

### **🌅 RÁNO (2-3 hodiny)**
1. **Custom Install Prompt** - vysoká priorita, rychlá implementace
2. **Performance Boosts** - optimalizace které jsou vždy užitečné

### **🌞 POLEDNE (3-4 hodiny)**  
3. **Background Sync** - nejkomplexnější ale nejvíc užitečná feature

### **🌆 VEČER (2-3 hodiny)**
4. **Enhanced Offline UI** - nice-to-have vylepšení
5. **Push Notifications** - pouze pokud zbyde čas a energie

---

## 🎯 **MINIMÁLNÍ CÍLE PRO ZÍTŘEK**
- ✅ Custom Install Prompt (MUST HAVE)
- ✅ Background Sync (SHOULD HAVE)  
- ✅ Basic Performance optimizations (NICE TO HAVE)

## 🚀 **MAXIMÁLNÍ CÍLE PRO ZÍTŘEK**
- ✅ Všechny Advanced PWA features implementované
- ✅ Production-ready enterprise PWA
- ✅ Best-in-class offline experience

---

## 📝 **POZNÁMKY**
- Každá fáze = samostatný commit + test
- Priorita: **Install Prompt** → **Background Sync** → zbytek
- **ChatSidebar Safari fix** můžeme udělat kdykoliv později
- Všechno testovat na mobilu (Chrome PWA)

---

**📅 Datum vytvoření:** 31.7.2025  
**🎯 Plánované datum realizace:** 1.8.2025  
**👨‍💻 Status:** Ready to implement

---

*🤖 Generated with [Claude Code](https://claude.ai/code)*