const express = require('express')
const { analyzeManagerEvaluation, analyzeHREvaluation, checkOllamaHealth } = require('../ai-engine')
const router = express.Router()

/**
 * POST /api/ai/health
 * Check if Ollama is available
 */
router.post('/health', async (req, res) => {
  try {
    const isHealthy = await checkOllamaHealth()
    res.json({
      available: isHealthy,
      message: isHealthy 
        ? 'Ollama disponibile' 
        : 'Ollama non disponibile. Esegui: ollama run mistral'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/ai/analyze/manager-evaluation
 * Analyze manager's written evaluation and suggest competency scores
 * Body: { evaluationText: string }
 * Response: { success: boolean, scores: {...}, explanation: string, error?: string }
 */
router.post('/analyze/manager-evaluation', async (req, res) => {
  try {
    const { evaluationText } = req.body

    if (!evaluationText || evaluationText.trim().length === 0) {
      return res.status(400).json({
        error: 'evaluationText è obbligatorio e non può essere vuoto'
      })
    }

    console.log('📊 Analyzing manager evaluation...')
    const result = await analyzeManagerEvaluation(evaluationText)

    res.json(result)
  } catch (err) {
    console.error('Errore in /analyze/manager-evaluation:', err)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/ai/analyze/hr-evaluation
 * Analyze HR's final evaluation and suggest overall score
 * Body: { evaluationText: string }
 * Response: { success: boolean, voto: number, commento, raccomandazione, error?: string }
 */
router.post('/analyze/hr-evaluation', async (req, res) => {
  try {
    const { evaluationText } = req.body

    if (!evaluationText || evaluationText.trim().length === 0) {
      return res.status(400).json({
        error: 'evaluationText è obbligatorio'
      })
    }

    console.log('📊 Analyzing HR evaluation...')
    const result = await analyzeHREvaluation(evaluationText)

    res.json(result)
  } catch (err) {
    console.error('Errore in /analyze/hr-evaluation:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
