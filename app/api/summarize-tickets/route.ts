import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface TicketPayload {
  content: string
  from: string
  user?: { nickname: string }
}

interface Ticket {
  timestamp: string
  payload: TicketPayload | { data: TicketPayload }
}

interface WordwareResponse {
  summary: string
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  urgent_matters: string[]
  key_topics: string[]
  action_items: string[]
}

const WORDWARE_APP_ID = 'a690a754-b3cb-4c9a-a98c-d3ac441346e6'
const WORDWARE_PROMPT = `You are a Customer Support Conversation Analyzer. Analyze the provided tickets and provide a summary. Even if there is limited information, always respond in the exact JSON format specified below.

Respond in this exact JSON format:
{
  "summary": "<brief summary of main topics and issues discussed>",
  "overall_sentiment": "<positive|neutral|negative>",
  "urgent_matters": ["urgent1", "urgent2"],
  "key_topics": ["topic1", "topic2"],
  "action_items": ["action1", "action2"]
}

Never respond with anything other than a JSON object in exactly this format. If there is limited information, make reasonable assumptions but always return the JSON.`

function formatTickets(tickets: Ticket[]) {
  return tickets
    .map(ticket => {
      const payload = 'data' in ticket.payload ? ticket.payload.data : ticket.payload
      return {
        message: payload.content,
        from: payload.from,
        timestamp: new Date(ticket.timestamp).toLocaleString(),
        user: payload.user?.nickname || 'Anonymous'
      }
    })
    .filter(ticket => ticket.message)
}

async function parseWordwareResponse(responseText: string): Promise<WordwareResponse> {
  for (const line of responseText.split('\n')) {
    try {
      const chunk = JSON.parse(line)
      if (chunk.type === 'chunk' && 
          chunk.value?.type === 'outputs' && 
          chunk.value?.values?.gen_Pn6h2m62tQOJZ3Af) {
        const jsonStr = chunk.value.values.gen_Pn6h2m62tQOJZ3Af
          .replace(/```(json)?/g, '')
          .trim()
        return JSON.parse(jsonStr)
      }
    } catch {}
  }
  throw new Error('Failed to extract data from Wordware response')
}

export async function POST(request: Request) {
  try {
    // 1. Parse and format tickets
    const { tickets } = await request.json()
    const formattedTickets = formatTickets(tickets)

    if (formattedTickets.length === 0) {
      return NextResponse.json({
        summary: "No support inquiries today.",
        type: "chat"
      })
    }

    // 2. Validate environment variables
    const wordwareUrl = process.env.NEXT_PUBLIC_WORDWARE_API_URL
    const wordwareApiKey = process.env.NEXT_PUBLIC_WORDWARE_API_KEY
    if (!wordwareUrl || !wordwareApiKey) {
      throw new Error('Missing Wordware configuration')
    }

    // 3. Get summary from Wordware
    const response = await fetch(`${wordwareUrl}/${WORDWARE_APP_ID}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wordwareApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          Prompt: WORDWARE_PROMPT,
          Tickets: JSON.stringify(formattedTickets, null, 2)
        },
        version: "^1.0"
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get summary from Wordware')
    }

    // 4. Parse response
    const responseText = await response.text()
    console.log('Wordware raw response:', responseText)
    const data = await parseWordwareResponse(responseText)
    console.log('Parsed Wordware data:', data)

    // 5. Log to Supabase
    const logEntry = {
      source: 'wordware',
      event_type: 'ticket_summary',
      message_type: 'analysis',
      message_content: data.summary,
      payload: data
    }

    const { error: logError } = await supabase
      .from('logs')
      .insert(logEntry)

    if (logError) {
      console.error('Error saving summary log:', logError)
    }

    return NextResponse.json({
      summary: typeof data === 'string' ? data : data.summary || "No summary available",
      type: "chat"
    })
  } catch (error) {
    console.error('Error in summarize-tickets:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
