# MOVE HR Platform v2.0 - People & Culture Module

Vue 3 + Vite + Tailwind HR Platform con modulo People & Culture per MOVE Solutions / Move-X.

Piattaforma completa per HR Analytics con behavioral wellness assessment, clustering burnout/retention, e tracking dimissioni.

## Setup

```bash
npm install
npm run dev
```

**Dev Server**: http://localhost:5173/

## Build

```bash
npm run build
```

## Struttura

- `src/seedData.js` → Dati reali 91 dipendenti (dal tuo Excel)
- `src/stores/hrStore.js` → Pinia store con CCNL Art.121 calc
- `src/composables/useCCNL.js` → Calcolo periodo di prova CCNL Commercio
- `src/views/` → Dashboard, Anagrafica, Onboarding, PeopleCulture, Ferie, Analytics
- `src/components/ui/` → Tutti i componenti UI

## Calcolo Periodo di Prova (CCNL Commercio Art.121)

| Livello | Durata | Metodo |
|---------|--------|--------|
| Q/I Quadro | 6 mesi | Giorni calendario (EDATE) |
| II–V livello | 60 gg | Lavoro effettivo (WORKDAY) |
| VI–VII livello | 45 gg | Lavoro effettivo (WORKDAY) |
| Determinato | proporzionale 1gg/15gg (min 2gg) | D.Lgs 104/2022 |

FU1 = assunzione + 30gg
FU2 = fine prova - 30gg

## Scale P&C validate

- MBI-GS (Maslach): Esaurimento Emotivo ↑=peggio
- CBI (Copenhagen): Carico Lavoro ↑=peggio
- JD-R (Bakker): Motivazione & Autonomia ↑=meglio
- JD-R (Bakker): Supporto & Chiarezza ↑=meglio
- WHO-5: Equilibrio Vita-Lavoro ↑=meglio
- Mobley: Intenzione di Restare ↑=meglio
