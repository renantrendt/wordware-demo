export function parseWordwareResponse(responseText: string) {
  for (const line of responseText.split('\n')) {
    try {
      const chunk = JSON.parse(line)
      if (chunk.type === 'chunk' && 
          chunk.value?.type === 'outputs' && 
          chunk.value?.values?.gen_Pn6h2m62tQOJZ3Af) {
        const jsonStr = chunk.value.values.gen_Pn6h2m62tQOJZ3Af
          .replace('```json', '')
          .replace('```', '')
          .trim()
        return JSON.parse(jsonStr)
      }
    } catch {}
  }
  throw new Error('Failed to extract analysis from response')
}

export function normalizeSentiment(analysis: any) {
  if ('sentiment_score' in analysis) {
    const score = analysis.sentiment_score
    analysis.sentiment_score = Math.max(0, Math.min(1, score))
    analysis.sentiment = score >= 0.7 ? 'High' : score >= 0.4 ? 'Medium' : 'Low'
  }
  return analysis
}
