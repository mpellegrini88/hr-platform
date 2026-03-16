/**
 * AI Analysis Engine using Ollama
 * Analyzes manager/HR evaluations and suggests scoring values
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const MODEL = 'mistral' // Lightweight model for local inference

/**
 * Check if Ollama is running
 */
async function checkOllamaHealth() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`)
    return response.ok
  } catch (err) {
    console.warn('⚠️  Ollama non disponibile:', err.message)
    return false
  }
}

/**
 * Analyze manager evaluation text and suggest scores
 * @param {string} evaluationText - Manager's written evaluation
 * @returns {Promise<Object>} - Suggested scores {competenze, qualita, problemSolving, velocita, collaborazione, comunicazione, attitudine}
 */
async function analyzeManagerEvaluation(evaluationText) {
  try {
    const isHealthy = await checkOllamaHealth()
    if (!isHealthy) {
      return { error: 'Ollama non disponibile. Installa Ollama da ollama.ai' }
    }

    const prompt = `Analizza questa valutazione manager e suggerisci valutazioni numeriche (scala 1-5) per ciascuna competenza.

VALUTAZIONE DEL MANAGER:
"${evaluationText}"

PER OGNI ASPETTO, RISPONDI CON:
1. Competenze tecniche (da 1=insufficiente a 5=eccellente)
2. Qualità del lavoro (1=scarsa, 5=sempre eccellente)
3. Problem Solving (1=non riesce, 5=ottimo)
4. Velocità di esecuzione (1=lento, 5=molto veloce)
5. Capacità di collaborazione (1=difficile, 5=eccellente)
6. Comunicazione (1=scarsa, 5=eccellente)
7. Attitudine per il ruolo (1=non adatto, 5=molto adatto)

Rispondi SOLO con un JSON valido, senza markdown backticks:
{
  "competenze": X,
  "qualita": X,
  "problemSolving": X,
  "velocita": X,
  "collaborazione": X,
  "comunicazione": X,
  "attitudine": X,
  "spiegazione": "Breve motivazione sintetica"
}`

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.response || ''

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        success: true,
        scores: {
          competenze: Math.max(1, Math.min(5, parseInt(parsed.competenze) || 3)),
          qualita: Math.max(1, Math.min(5, parseInt(parsed.qualita) || 3)),
          problemSolving: Math.max(1, Math.min(5, parseInt(parsed.problemSolving) || 3)),
          velocita: Math.max(1, Math.min(5, parseInt(parsed.velocita) || 3)),
          collaborazione: Math.max(1, Math.min(5, parseInt(parsed.collaborazione) || 3)),
          comunicazione: Math.max(1, Math.min(5, parseInt(parsed.comunicazione) || 3)),
          attitudine: Math.max(1, Math.min(5, parseInt(parsed.attitudine) || 3))
        },
        explanation: parsed.spiegazione || ''
      }
    }

    return { error: 'Impossibile parsare la risposta di Ollama' }
  } catch (err) {
    console.error('❌ Errore AI analysis:', err.message)
    return { error: err.message }
  }
}

/**
 * Analyze HR evaluation and suggest overall score
 * @param {string} evaluationText - HR's written evaluation
 * @returns {Promise<Object>} - Suggested score and comments
 */
async function analyzeHREvaluation(evaluationText) {
  try {
    const isHealthy = await checkOllamaHealth()
    if (!isHealthy) {
      return { error: 'Ollama non disponibile' }
    }

    const prompt = `Analizza questa valutazione HR finale sulla prova e suggerisci un voto complessivo (1-10).

VALUTAZIONE HR:
"${evaluationText}"

Considera:
- Performance tecnica
- Atteggiamento e cultura aziendale
- Relazioni con il team
- Potenziale di crescita

Rispondi SOLO con JSON:
{
  "voto": X,
  "commento": "Breve sintesi della valutazione",
  "raccomandazione": "Confermare" o "Proroga" o "Non confermare"
}`

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    })

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`)

    const data = await response.json()
    const jsonMatch = data.response.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        success: true,
        voto: Math.max(1, Math.min(10, parseInt(parsed.voto) || 5)),
        commento: parsed.commento || '',
        raccomandazione: parsed.raccomandazione || 'Confermare'
      }
    }

    return { error: 'Impossibile parsare la risposta' }
  } catch (err) {
    console.error('❌ Errore HR AI analysis:', err.message)
    return { error: err.message }
  }
}

module.exports = {
  checkOllamaHealth,
  analyzeManagerEvaluation,
  analyzeHREvaluation
}
