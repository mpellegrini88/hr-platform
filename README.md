# MOVE HR 2.0

Piattaforma gestionale HR interna per **MOVE / Silicon**, costruita con Vue 3, Pinia e Tailwind CSS.

## Stack tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Vue 3.4 (Composition API, `<script setup>`) |
| State management | Pinia 2 |
| Routing | Vue Router 4 (hash mode) |
| Styling | Tailwind CSS 3.4 |
| Build | Vite 5 |
| Linguaggio | TypeScript (migrazione graduale, `allowJs: true`) |
| **Persistenza** | **IndexedDB (offline) + Express backend (server locale)** |
| Sincronizzazione | Auto-sync backend ogni 30 secondi |
| Auto-backup | Server (ogni 5 minuti, max 20 backup) |
| Export | xlsx (Excel/JSON/CSV) |
| Grafici | Chart.js + vue-chartjs |
| Date | date-fns |

## Funzionalità principali

### 0. Persistenza & Sincronizzazione Automatica ⭐ **NEW**
- 📱 **Three-layer persistence**: localStorage (istantaneo) → backend server (ogni 30s) → auto-backup (ogni 5min)
- 🔄 **Auto-sync** di TUTTI i dati: dipendenti, contratti, uscite, ferie, colloqui, valutazioni, kanban
- 📊 **Pannello sincronizzazione** nel Topbar: clicca per vedere stato server, ultimo sync, riepilogo dati
- 💾 **Export manuale**: Excel/JSON/CSV con un click
- 🏢 **Backend Express** locale: `/server/data/store.json` + auto-backup in `/server/data/backups/`
- 🔌 **Offline-friendly**: app funziona offline, sincronizza quando torna online
- ✅ **Nessuna perdita di dati**: riapri app → tutti i dati rimangono (contratti, uscite, nuovi ingressi, ferie)

### 1. Dashboard (`/dashboard`)
- KPI onboarding: periodi di prova in corso, FU1/FU2 scaduti, urgenze entro 7gg
- KPI contratti: rinnovi scaduti, dossier, determinati in scadenza
- Kanban board per monitoraggio azioni
- Contratti in scadenza con reminder per CEO
- Follow-up pre-2026 auto-smarcati come completati

### 2. Anagrafica (`/anagrafica`, `/anagrafica/:id`)
- Elenco completo 91 dipendenti con ricerca e filtri
- Dettaglio dipendente con tutti i dati anagrafici, contrattuali e follow-up

### 3. Onboarding (`/onboarding`)
- Gestione follow-up FU1 (30gg), FU2 Manager (45gg), FU2 Dipendente (pre-fine prova)
- Timeline visuale scadenze con stati (Da Fare → In Corso → Fatto)

### 4. Valutazione Periodo di Prova (`/valutazione-prova`)
- Flusso a 3 step: Manager → HR → CEO
- Scala dettagliata 1–5 su 7 competenze + raccomandazione
- Include contratti a termine in scadenza entro 30gg
- Banner contestuali per contratti e P&C colloqui mancanti

### 5. People & Culture (`/people-culture`)
- Colloqui individuali con 6 scale scientifiche (1–5):
  - 😓 Esaurimento emotivo (MBI-GS, Maslach)
  - ⚡ Carico di lavoro (CBI, Copenhagen)
  - 💪 Motivazione & Autonomia (JD-R, Bakker)
  - 🤝 Supporto & Chiarezza (JD-R, Bakker)
  - ⚖️ Equilibrio vita-lavoro (WHO-5)
  - 🏠 Intenzione di restare (Mobley)
- Storico colloqui: archiviazione automatica del precedente + CRUD
- Score engagement calcolato: burnout × 0.4 + (6 − wellbeing) × 0.6
- Bottone "Aggiungi colloquio" con picker dipendente

### 6. People & Culture Analytics (`/people-culture-analytics`)
- Dashboard analitica basata su dati dei colloqui P&C
- Quadranti burnout/retention

### 7. Contratti a Termine (`/contratti-termine`)
- Gestione rinnovi con dossier e checklist
- Decisione rinnovo con modale dedicata

### 8. Ferie, Malattie & Assenze (`/ferie`)
- Tutti i 91 dipendenti con auto-popolazione
- **Logica contrattuale**:
  - Contratto proprio: 21.96 gg ferie (7.5h/giorno), default per tutti
  - CCNL Commercio: 26 gg ferie + ROL 56h + Ex-festività 32h (88h ≈ 11gg permessi)
- Switch contratto per dipendente dalla modale
- CRUD registri (ferie, malattia, permesso, assenza N.G.)
- Riepilogo automatico: godute, residue, malattia, episodi, ultimi 3 mesi
- Colonne permessi (spettanti/goduti/residui) visibili solo per CCNL
- Filtri per società (Silicon / Move Solutions), team, tipo contratto

### 9. Dimissioni (`/dimissioni`)
- Tracking uscite con motivazione e note

### 10. Visite Mediche (`/visite-mediche`)
- Gestione scadenze visite mediche aziendali

### 11. Analytics (`/analytics`)
- Analytics contratti + ferie per team
- Top 5 malattia / ferie residue

## Calcolo Periodo di Prova (CCNL Commercio Art.121)

| Livello | Durata | Metodo |
|---------|--------|--------|
| Q/I Quadro | 6 mesi | Giorni calendario (EDATE) |
| II–V livello | 60 gg | Lavoro effettivo (WORKDAY) |
| VI–VII livello | 45 gg | Lavoro effettivo (WORKDAY) |
| Determinato | proporzionale 1gg/15gg (min 2gg) | D.Lgs 104/2022 |

FU1 = assunzione + 30gg · FU2 = fine prova − 30gg

## Categorizzazione team

| Società | Team |
|---------|------|
| **Silicon** | Silicon Milano, Silicon Lucca, Business Development Milano |
| **Move Solutions** | Solutions > *, Freelance |

## Struttura progetto

```
.
├── server/                     # Backend Express (persistenza)
│   ├── server.js               # Server + API routes
│   ├── data/
│   │   ├── store.json          # Dati principali
│   │   └── backups/            # Auto-backup ogni 5min
│   └── package.json
│
├── src/
├── main.ts                     # Entrypoint + router
├── seedData.js                 # 91 dipendenti seed
├── stores/hrStore.js           # Pinia store centrale
├── composables/                # Logica riutilizzabile
│   ├── useAutoSave.js          # Sincronizzazione backend + export Excel
│   ├── useSyncStatus.js        # **NEW**: tracking timestamp sync
│   ├── useExport.js            # **NEW**: export Excel/JSON/CSV
│   ├── useCCNL.js              # Calcolo periodo di prova
│   ├── useDataMigration.js
│   ├── useHelpers.js
│   ├── useIndexedDB.js
│   ├── usePersistence.js
│   └── useToastNotification.js
├── components/
│   ├── ui/                     # Componenti base (Modal, KpiCard, ScaleInput, etc.)
│   ├── dashboard/              # Kanban, modali azioni
│   ├── forms/                  # Form colloqui, valutazioni, contratti
│   └── charts/                 # Grafici
└── views/                      # 12 pagine

DOCS:
├── README.md                   # Questo file
├── PERSISTENCE_GUIDE.md        # Guida salvataggio base
└── AUTOSAVE_COMPLETE_GUIDE.md  # **NEW**: Guida completa + test
```

## Comandi

### Frontend
```bash
npm install          # Installa dipendenze (frontend)
npm run dev          # Dev server (Vite) - http://localhost:5173
npm run build        # Build produzione
npm run type-check   # Type check TypeScript
npm run preview      # Preview build
```

### Backend (Persistenza)
```bash
cd server
npm install          # Installa dipendenze (backend)
npm start            # Backend server - http://localhost:3001
npm run dev          # Dev mode (node --watch)
```

**Importante**: Il backend deve essere in esecuzione per la sincronizzazione dati. Se non disponibile, l'app funziona comunque in offline con fallback a localStorage/IndexedDB.

### API Backend
```bash
GET  /api/health     # Health check
GET  /api/data       # Carica tutti i dati
POST /api/data       # Salva dati (bulk)
POST /api/backup     # Crea backup manuale
GET  /api/backups    # Lista backup disponibili
POST /api/restore/:filename  # Ripristina da backup
```

## Note tecniche

### Persistenza & Sincronizzazione ⭐ **NEW**
- **Three-layer persistence**:
  1. **localStorage**: immediato (< 1s) - cache browser
  2. **Backend API**: ogni 30s - server JSON file
  3. **Auto-backup**: ogni 5 minuti - archivio server (max 20 file)
  
- **Cosa viene salvato**: TUTTI i dati (employees, contratti, uscite, ferie, colloqui, valutazioni, kanban)
- **Boot sequence**: Backend → IndexedDB → seed data
- **Offline**: app funziona normalmente, sincronizza quando server torna online
- **Export**: Excel (3 sheet: Anagrafica, Onboarding, Kanban), JSON (backup completo), CSV (kanban quick)
- **Monitoraggio**: Topbar mostra "Sincronizzato" o "Locale" - clicca per dettagli sincronizzazione

### Altre note
- 91 dipendenti pre-caricati da seed data
- Follow-up pre-2026 auto-smarcati come completati
- Migrazione graduale JS → TS (`allowJs: true`, `checkJs: false`)
- **Documentazione**: leggi [PERSISTENCE_GUIDE.md](PERSISTENCE_GUIDE.md) o [AUTOSAVE_COMPLETE_GUIDE.md](AUTOSAVE_COMPLETE_GUIDE.md)
