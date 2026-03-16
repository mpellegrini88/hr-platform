# 🔄 Guida Completa: Salvataggio Automatico di Tutte le Modifiche

## ✅ Cosa viene salvato AUTOMATICAMENTE

Ogni modifica che fai nell'app viene salvata automaticamente in **tre livelli**:

### 🎯 **DIPENDENTI & STATI**
| Modifica | Saved? | Dove | Quando |
|----------|--------|------|--------|
| Aggiungi dipendente | ✅ | localStorage + backend | Subito |
| Modifica nome/team | ✅ | localStorage + backend | Subito |
| Cambio contratto | ✅ | localStorage + backend | Subito |
| Stato → "Attivo/Uscita/Licenziato" | ✅ | localStorage + backend | Subito |
| Salario/benefit | ✅ | localStorage + backend | Subito |

### 🏢 **CONTRATTI & RINNOVI**
| Modifica | Saved? | Dove | Quando |
|----------|--------|------|--------|
| Rinnovo contratto | ✅ | localStorage + backend | Subito |
| Dossier contratto | ✅ | localStorage + backend | Subito |
| Periodo prova → Superato/Non Superato | ✅ | localStorage + backend | Subito |
| Data scadenza contratto | ✅ | localStorage + backend | Subito |

### 🚪 **USCITE & INGRESSI**
| Modifica | Saved? | Dove | Quando |
|----------|--------|------|--------|
| Nuovo dipendente (onboarding) | ✅ | localStorage + backend | Subito |
| Dimissioni volontarie | ✅ | localStorage + backend | Subito |
| Licenziamento | ✅ | localStorage + backend | Subito |
| Uscita concordata | ✅ | localStorage + backend | Subito |
| Data uscita | ✅ | localStorage + backend | Subito |

### 📅 **FERIE & MALATTIE**
| Modifica | Saved? | Dove | Quando |
|----------|--------|------|--------|
| Giorni ferie goduti | ✅ | localStorage + backend | Subito |
| Residui ferie | ✅ | localStorage + backend | Subito |
| Giorni malattia | ✅ | localStorage + backend | Subito |
| Permessi ROL | ✅ | localStorage + backend | Subito |
| Note assenze | ✅ | localStorage + backend | Subito |

### 💬 **COLLOQUI & VALUTAZIONI**
| Modifica | Saved? | Dove | Quando |
|----------|--------|------|--------|
| Follow-up 1 (FU1) | ✅ | localStorage + backend | Subito |
| Follow-up 2 (FU2) | ✅ | localStorage + backend | Subito |
| Colloquio P&C (Burnout) | ✅ | localStorage + backend | Subito |
| Scale wellness (MBI, CBI, JD-R, etc) | ✅ | localStorage + backend | Subito |
| Valutazione periodo prova | ✅ | localStorage + backend | Subito |

### 📊 **KANBAN & TASK**
| Modifica | Saved? | Dove | Quando |
|----------|--------|------|--------|
| Task → Da Fare / In Corso / Completato | ✅ | localStorage + backend | Subito |
| Task → Eliminato / Scartato | ✅ | localStorage + backend | Subito |
| Note sulla task | ✅ | localStorage + backend | Subito |

---

## 🔄 Flusso Completo di Salvataggio

```
[USER ACTION] 
    ↓
Modifica dipendente / contratto / ferie / colloquio
    ↓
store.updateEmployee() / saveFerie() / saveColloquio()
    ↓
autoSave.trackChange(completeSnapshot)
    ↓
┌─ IMMEDIATAMENTE (< 1s)
│  └─ localStorage.setItem() ✅
│     toast: "💾 Dati salvati in locale"
│
├─ DEBOUNCED (ogni 30 secondi)
│  └─ POST /api/data → backend ✅
│     toast: "☁️ Sincronizzato con server"
│
└─ OGNI 10 CAMBIAMENTI o 5 MINUTI
   └─ Excel export backup
      toast: "📤 Backup Excel creato"
```

---

## 📂 Dove sono salvati i dati

### **Browser (in tempo reale)**
```
localStorage
├── move-hr/hrStore          → Snapshot completo
├── move-hr/version          → "2.0"
└── move-hr/lastSync         → Timestamp ultimo salvataggio
```

### **Server (ogni 30 secondi)**
```
/server/
├── data/
│  ├── store.json           → Dati principali (202KB)
│  └── backups/
│     ├── auto-2026-03-16T08-30-45-123Z.json
│     ├── auto-2026-03-16T08-35-42-456Z.json
│     └── ...               → Max 20 backup (ruota automaticamente)
```

---

## 🧪 Scenario Completo di Test

### **Test 1: Modifica Contratto**
1. Vai a **Anagrafica Dipendenti**
2. Clicca su un dipendente
3. Modifica la scadenza del contratto → `2026-06-30`
4. Salva
5. ✅ Toast: "💾 Dati salvati in locale"
6. Aspetta 30 secondi → ✅ Toast: "☁️ Sincronizzato con server"
7. Refresh pagina → **Il contratto modificato rimane!**

### **Test 2: Aggiungi Dimissione**
1. Vai a **Gestione Uscite**
2. Clicca "Nuova uscita"
3. Seleziona dipendente, data uscita, motivo
4. Salva
5. ✅ Toast: "💾 Dati salvati in locale"
6. Aspetta 30 secondi → ✅ Toast: "☁️ Sincronizzato con server"
7. Apri **Anagrafica** → stato dipendente è "Dimissioni Volontarie" ✅

### **Test 3: Modifica Ferie**
1. Vai a **Ferie, Malattie & Assenze**
2. Modifica giorni goduti per un dipendente
3. Salva
4. ✅ Dati sincronizzati (vedi toast)
5. Refresh pagina → **Giorni goduti rimangono aggiornati!**

### **Test 4: Offline → Online**
1. Ferma il server (`Ctrl+C` nel terminale backend)
2. Modifica un dipendente (es. scadenza FU1)
3. ✅ Toast: "💾 Dati salvati in locale" (localhost non disponibile)
4. ℹ️ Topbar mostra "Locale" (non "Sincronizzato")
5. Riavvia il server (`npm start` in `/server`)
6. ✅ Aspetta 30s → Topbar torna a "Sincronizzato"
7. Le modifiche sono apparse sul server!

---

## 💡 Informazioni Importanti

### **Auto-Save Intervals**
```javascript
// /src/composables/useAutoSave.js

// LocalStorage: immediato, sincronizzato con ogni modifica
DEBOUNCE_DELAY_MS = 500      // Timeout prima di sync

// Backend API
BACKEND_SYNC_INTERVAL_MS = 30 * 1000  // 30 secondi
AUTO_BACKUP_INTERVAL = 5 * 60 * 1000  // 5 minuti
```

### **Cosa include lo Snapshot**
```javascript
{
  employees: [],           // Tutti i dipendenti + loro stati
  colloqui: [],            // FU1, FU2, colloqui
  ferie: [],               // Giorni ferie per dipendente
  colloquiPC: [],          // Colloqui P&C
  dimissioni: [],          // Uscite e dimissioni
  valutazioni360: [],      // Valutazioni manager/HR
  allUrgenze: [],          // Task del kanban
  timestamp: 1234567890    // Quando è stato salvato
}
```

### **Toast Notifications**
```
💾 Dati salvati in locale       — localStorage updated
☁️ Sincronizzato con server      — Backend POST succeeded
⚠️ Errore sincronizzazione       — Backend failed (retry in 30s)
📤 Backup Excel creato          — Auto-export ran
ℹ️ Dati caricati da server      — Bootstrap complete
💾 Dati caricati dalla cache    — Bootstrap fallback to IDB
```

---

## 🚨 Edge Cases

### **Cosa succede se...**

**1. Perdo la connessione a metà modifica?**
- ✅ Dati salvati in localStorage comunque
- ✅ Verranno sincronizzati quando torni online
- ℹ️ Topbar mostra "Locale" fino alla riconnessione

**2. Chiudo il browser senza salvare?**
- ✅ localStorage persiste automaticamente
- ✅ Backend ha un backup recente (< 30s di vecchio)
- ✅ Riaprendo → dati caricano subito

**3. Modifche contemporanee su due schede/browser?**
- ⚠️ Ultima modifica vince (simple last-write-wins)
- ℹ️ Per ora non c'è conflict resolution
- 💡 Suggerimento: usa una sola scheda

**4. Memoria piena su localStorage?**
- ✅ Sistema tenta pulizia automatica
- ℹ️ Fallback a backend se localStorage fallisce
- 💡 Scarica backup Excel per archivio

**5. Backend non parte?**
- ✅ App funciona comunque offline
- ✅ Dati rimangono in localStorage/IndexedDB
- ⚠️ Toasts mostrano "Errore sincronizzazione" ogni 30s
- 💡 Riavvia server quando possibile

---

## 📊 Monitorare la Sincronizzazione

### **Nel Browser Console**
```javascript
// Apri DevTools (F12 → Console)

// Vedi ultimo sync time
localStorage.getItem('move-hr/lastSync')
// Output: "2026-03-16T08:30:45.123Z"

// Vedi quanti dipendenti sono salvati
JSON.parse(localStorage.getItem('move-hr/hrStore')).employees.length
// Output: 42

// Vedi ultimo errore (se ce n'è)
// Controlla i toast/console logs
```

### **Nel Topbar**
- Clicca su **"Sincronizzato"** o **"Locale"**
- Vedi:
  - ✅ Server Connesso / ⚠️ Offline
  - ⏱️ Ultimo sync: "2 minuti fa"
  - 📊 Dati caricati: 42 dipendenti, 15 colloqui, etc.

---

## 🎯 Summary per l'Utente Finale

**Non devi fare NULLA** — tutto è automatico!

✅ **Modifica un dato** → salvato in cache locale (< 1s)  
✅ **Aspetta 30 secondi** → sincronizzato col server  
✅ **Chiudi l'app** → dati rimangono  
✅ **Riapri l'app** → dati caricano da server o cache  
✅ **Modifche rimangono** → anche se riavvii il browser  

**Se offline:**
- ✅ Continui a lavorare (dati rimangono in cache)
- ✅ Quando torni online, si sincronizzano automaticamente
- ✅ Niente si perde

**Puoi scaricare backup manuale:**
- 📊 **Excel** — Anagrafica, Onboarding, Kanban in uno sheet
- 📋 **JSON** — Backup completo per restore
- 📄 **CSV** — Kanban quick export

**Perfetto:** Adesso hai un sistema professionale di persistenza dati! 🎉
