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
| Persistenza | IndexedDB (locale, offline-first) |
| Grafici | Chart.js + vue-chartjs |
| Export | xlsx (export Excel) |
| Date | date-fns |

## Funzionalità principali

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
src/
├── main.ts                     # Entrypoint + router
├── seedData.js                 # 91 dipendenti seed
├── stores/hrStore.js           # Pinia store centrale
├── composables/                # Logica riutilizzabile
│   ├── useAutoSave.js
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
```

## Comandi

```bash
npm install          # Installa dipendenze
npm run dev          # Dev server (Vite)
npm run build        # Build produzione
npm run type-check   # Type check TypeScript
npm run preview      # Preview build
```

## Note tecniche

- Persistenza offline via IndexedDB con auto-save
- 91 dipendenti pre-caricati da seed data
- Follow-up pre-2026 auto-smarcati come completati
- Migrazione graduale JS → TS (`allowJs: true`, `checkJs: false`)
