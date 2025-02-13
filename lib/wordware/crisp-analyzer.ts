import { CRISP_ANALYSIS_PROMPT } from './prompts'
import { parseWordwareResponse, normalizeSentiment } from './utils'
import { WordwareResponse } from './types'

const WORDWARE_APP_ID = '4039b7d2-cb3d-4916-bdc4-c078d040579b'

export async function analyzeWithWordware(message: string): Promise<WordwareResponse> {
  try {
    const wordwareUrl = process.env.NEXT_PUBLIC_WORDWARE_API_URL
    if (!wordwareUrl) throw new Error('NEXT_PUBLIC_WORDWARE_API_URL not set')

    const wordwareApiKey = process.env.NEXT_PUBLIC_WORDWARE_API_KEY
    if (!wordwareApiKey) throw new Error('NEXT_PUBLIC_WORDWARE_API_KEY not set')

    const response = await fetch(`${wordwareUrl}/${WORDWARE_APP_ID}/run`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wordwareApiKey}`
      },
      body: JSON.stringify({
        inputs: {
          Prompt: CRISP_ANALYSIS_PROMPT,
          Ticket: message
        },
        version: "^3.0"
      })
    })

    const responseText = await response.text()
    const analysis = parseWordwareResponse(responseText)
    return normalizeSentiment(analysis)
  } catch (error) {
    console.error('Error analyzing with Wordware:', error)
    throw error
  }
}
