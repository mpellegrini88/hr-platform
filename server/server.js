const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 3001

// ── Directory e file di persistenza ──
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')
const BACKUP_DIR = path.join(DATA_DIR, 'backups')
const MAX_BACKUPS = 20

// Crea directory se non esistono
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// ── Funzioni di persistenza ──

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch (err) {
    console.error('❌ Errore lettura file dati:', err.message)
  }
  return null
}

function saveData(data) {
  try {
    createAutoBackup()
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('❌ Errore scrittura file dati:', err.message)
    return false
  }
}

let lastAutoBackupTime = 0
const AUTO_BACKUP_INTERVAL = 5 * 60 * 1000 // 5 minuti

function createAutoBackup() {
  try {
    if (!fs.existsSync(DATA_FILE)) return
    if (Date.now() - lastAutoBackupTime < AUTO_BACKUP_INTERVAL) return

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(BACKUP_DIR, `auto-${timestamp}.json`)
    fs.copyFileSync(DATA_FILE, backupFile)
    lastAutoBackupTime = Date.now()

    // Ruota backup vecchi
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('auto-'))
      .sort()
      .reverse()

    if (backups.length > MAX_BACKUPS) {
      backups.slice(MAX_BACKUPS).forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f))
      })
    }
  } catch (err) {
    console.warn('⚠ Auto-backup fallito:', err.message)
  }
}

// ── Routes API ──

// Health check
app.get('/api/health', (req, res) => {
  const stats = fs.existsSync(DATA_FILE)
    ? { size: fs.statSync(DATA_FILE).size, lastModified: fs.statSync(DATA_FILE).mtime }
    : null
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataFile: stats
      ? { exists: true, sizeKB: (stats.size / 1024).toFixed(1), lastModified: stats.lastModified }
      : { exists: false }
  })
})

// GET — Carica tutti i dati
app.get('/api/data', (req, res) => {
  const data = loadData()
  res.json(data || {})
})

// POST — Salva tutti i dati
app.post('/api/data', (req, res) => {
  const data = { ...req.body, _meta: { savedAt: new Date().toISOString(), version: '2.0' } }
  if (saveData(data)) {
    res.json({ ok: true, timestamp: data._meta.savedAt })
  } else {
    res.status(500).json({ ok: false, error: 'Errore salvataggio dati' })
  }
})

// POST — Crea backup manuale
app.post('/api/backup', (req, res) => {
  const data = loadData()
  if (!data) return res.status(404).json({ error: 'Nessun dato da backuppare' })
  const filename = `manual-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  fs.writeFileSync(path.join(BACKUP_DIR, filename), JSON.stringify(data, null, 2))
  res.json({ ok: true, filename })
})

// GET — Lista backup disponibili
app.get('/api/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        sizeKB: (fs.statSync(path.join(BACKUP_DIR, f)).size / 1024).toFixed(1),
        date: fs.statSync(path.join(BACKUP_DIR, f)).mtime
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json(files)
  } catch (err) {
    res.json([])
  }
})

// POST — Ripristina da backup
app.post('/api/restore/:filename', (req, res) => {
  const filepath = path.join(BACKUP_DIR, req.params.filename)
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Backup non trovato' })
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
    saveData(data)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore ripristino backup' })
  }
})

// ── AI Routes ──
app.use('/api/ai', aiRoutes)

// ── Avvio server ──

app.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║       🚀 MOVE HR Backend Server              ║')
  console.log(`║       http://localhost:${PORT}                 ║`)
  console.log('╠══════════════════════════════════════════════╣')
  console.log(`║  📁 Dati:    ${DATA_FILE}`)
  console.log(`║  💾 Backup:  ${BACKUP_DIR}`)
  console.log('║                                              ║')
  console.log('║  API:                                        ║')
  console.log('║  GET  /api/health              — Stato       ║')
  console.log('║  GET  /api/data                — Carica      ║')
  console.log('║  POST /api/data                — Salva       ║')
  console.log('║  POST /api/backup              — Backup      ║')
  console.log('║  GET  /api/backups             — Lista       ║')
  console.log('║  POST /api/restore/:filename   — Ripristina  ║')
  console.log('║  POST /api/ai/health           — Ollama OK?  ║')
  console.log('║  POST /api/ai/analyze/*        — AI Analyze  ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log('')
})
