export interface WordwareResponse {
  sentiment_score: number
  sentiment: 'High' | 'Medium' | 'Low'
  summary: string
  risk_factors: string[]
  action_items: string[]
  key_topics: string[]
}

export interface CrispMessageData {
  session_id?: string
  user?: {
    user_id?: string
    nickname?: string
  }
  type?: string
  content?: string
}

export interface CrispWebhookPayload {
  event: string
  website_id: string
  data?: CrispMessageData
}
