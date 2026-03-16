# 💾 Sistema di Persistenza e Sincronizzazione Dati

## ✅ Cosa è stato aggiunto

Hai ora un sistema **completo di persistenza** che salva i tuoi dati in tre luoghi:

### 1️⃣ **LocalStorage** (immediato - in-browser)
- Ognuna volta che elimini un item dal kanban, i dati si salvano immediatamente in cache locale
- È disponibile anche se il server è offline
- Visualizzi i dati anche chiudendo e riaprendo la pagina

### 2️⃣ **Backend Server** (ogni 30 secondi - automatico)
- Ogni 30 secondi, le modifiche si sincronizzano con il server Express (`localhost:3001`)
- I dati sono salvati in `/server/data/store.json`
- Il server crea auto-backup ogni 5 minuti in `/server/data/backups/`

### 3️⃣ **Export Manuale** (Excel/JSON - quando vuoi)
- Clicca i pulsanti nel Dashboard o Kanban:
  - 📊 **Excel** → Esporta anagrafica + onboarding + kanban in file Excel
  - 📋 **JSON** → Esporta backup completo in JSON (per restore)
  - 📄 **CSV** → Esporta solo kanban in CSV

---

## 🧪 Come testare

### Test 1: Elimina un item dal Kanban
1. Vai al **Dashboard**
2. Sezione **Kanban Board**
3. Clicca su un item COMPLETATO → 🗑 **Elimina**
4. Conferma l'eliminazione
5. ✅ Vedrai un toast **"☁️ Sincronizzato con server"**

### Test 2: Riapri l'app
1. Refresha la pagina (`Cmd+R`)
2. ✅ L'item eliminato **NON è più visibile**
3. I dati rimangono salvati (dal backend o localStorage)

### Test 3: Scarica i dati
1. Nel **Dashboard** sopra il Kanban Board
2. Clicca **📊 Excel** o **📋 JSON**
3. Ricevi il file con timestamp: `MOVE_HR_backup_2026-03-16.xlsx`

### Test 4: Fallback offline
1. Ferma il backend (kill il server)
2. Riapri l'app
3. I dati caricano comunque da **IndexedDB**
4. Le modifiche si salvano ancora in cache locale

---

## 🔄 Flusso di sincronizzazione

```
Eliminazione item
    ↓
store.updateEmployee() 
    ↓
autoSave.trackChange(storeSnapshot)
    ↓
┌─ Immediato: syncToLocalStorage()  (toast: "💾 Dati salvati in locale")
├─ Debounced (30s): syncToBackend()   (toast: "☁️ Sincronizzato con server")
└─ Ogni 10 cambiamenti: Excel export  (toast: "📤 Backup Excel creato")
```

---

## 📂 File di controllo

### Backend
```
/server/data/store.json          — Dati principali (202KB)
/server/data/backups/auto-*.json — Auto-backup ogni 5 minuti (max 20)
```

### Browser
```
LocalStorage:  "move-hr/*"    — Dati in cache
IndexedDB:     "move-hr-db"   — DB offline (fallback)
```

---

## 🎯 Cosa ho fatto

### 1. Aggiornamento di `useAutoSave.js`
- ✅ Aggiunto `syncToBackend()` che POST i dati a `/api/data`
- ✅ Sincronizzazione ogni 30 secondi (configurable)
- ✅ Non blocca l'interfaccia (asincrono)
- ✅ Health check prima di sincronizzare

### 2. Nuovo composable `useExport.js`
- ✅ `exportToExcel()` → File Excel multi-sheet
- ✅ `exportToJSON()` → Backup completo JSON
- ✅ `exportKanbanCSV()` → CSV rapido

### 3. Pulsanti nel Dashboard e Kanban
- ✅ Dashboard: sopra Kanban Board
- ✅ KanbanBoard: nei filtri (a destra)
- ✅ Styling: colori diversi per tipo (verde, blu, giallo)

### 4. App.vue (già c'era)
- ✅ Carica dal backend all'avvio
- ✅ Fallback su IndexedDB se offline
- ✅ Fallback su seed data se niente

---

## ⚡ API Backend

```bash
# Verifica server
curl http://localhost:3001/api/health

# Carica tutti i dati
curl http://localhost:3001/api/data

# Salva dati (POST)
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -d '{"employees":[],...}'

# Elenca backup
curl http://localhost:3001/api/backups

# Crea backup manuale
curl -X POST http://localhost:3001/api/backup
```

---

## 🚀 Per l'utente finale

**Adesso puoi:**
1. ✅ Eliminare item dal kanban senza perderli
2. ✅ Chiudere e riaprire l'app → dati rimangono
3. ✅ Scaricare Excel/JSON per analisi esterna
4. ✅ Lavorare offline (i dati si sincronizzano quando online)
5. ✅ Avere auto-backup del server ogni 5 minuti

**Come usarlo:**
- Modifica normalmente l'app
- Ogni 30 secondi: salvataggio automatico sul server
- Quando vuoi un backup: clicca 📊 Excel o 📋 JSON
- I dati rimangono perfino dopo aver chiuso il browser

---

## 📝 Note di sviluppo

- **BACKEND_SYNC_INTERVAL_MS**: 30 secondi (modifica in `useAutoSave.js` linea 11)
- **CHANGE_THRESHOLD**: 10 cambiamenti per Excel export (linea 12)
- **Toast visibility**: 1500ms per localStorage, 2000ms per export (modificabile)
- **Health check**: Prima di ogni sincronizzazione al backend

---

## 🐛 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| Dati non si salvano | Verifica toast: "💾 Dati salvati in locale" deve apparire |
| Backend non disponibile | Controlla `npm start` in `/server/` |
| Excel non scarica | Verifica che XLSX sia installato: `npm list xlsx` |
| Offline non funziona | Controlla IndexedDB nel DevTools |
| Sincronizzazione lenta | Aumenta `BACKEND_SYNC_INTERVAL_MS` per meno sincronizzazioni |

Buon lavoro! 🎉
