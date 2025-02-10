import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

async function analyzeWithWordware(message: string) {
  try {
    const wordwareUrl = process.env.NEXT_PUBLIC_WORDWARE_API_URL
    if (!wordwareUrl) throw new Error('NEXT_PUBLIC_WORDWARE_API_URL not set')

    const wordwareAppId = process.env.NEXT_PUBLIC_WORDWARE_APP_ID
    if (!wordwareAppId) throw new Error('NEXT_PUBLIC_WORDWARE_APP_ID not set')

    const wordwareApiKey = process.env.NEXT_PUBLIC_WORDWARE_API_KEY
    if (!wordwareApiKey) throw new Error('NEXT_PUBLIC_WORDWARE_API_KEY not set')

    const response = await fetch(`${wordwareUrl}/${wordwareAppId}/run`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wordwareApiKey}`
      },
      body: JSON.stringify({
        inputs: {
          Prompt: `You are a Customer Success Intelligence Analyzer. Analyze the provided customer message and provide insights. Even if there is limited information, always respond in the exact JSON format specified below.

Respond in this exact JSON format:
{
  "sentiment_score": <number between 0.0 and 1.0, where 0.0 is extremely negative and 1.0 is extremely positive>,
  "summary": "<brief summary>",
  "risk_factors": ["factor1", "factor2"],
  "action_items": ["action1", "action2"],
  "key_topics": ["topic1", "topic2"]
}

Never respond with anything other than a JSON object in exactly this format. If there is limited information, make reasonable assumptions but always return the JSON.`,
          Ticket: message
        },
        version: "^3.0"
      })
    })

    const responseText = await response.text()
    let analysis = null

    // Procura pelo JSON da análise na resposta do Wordware
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
          analysis = JSON.parse(jsonStr)
          break
        }
      } catch {}
    }

    if (!analysis) throw new Error('Failed to extract analysis from response')

    // Normaliza o sentiment_score para estar entre 0.0 e 1.0
    if ('sentiment_score' in analysis) {
      const score = analysis.sentiment_score
      analysis.sentiment_score = Math.max(0, Math.min(1, score))
      analysis.sentiment = score >= 0.7 ? 'High' : score >= 0.4 ? 'Medium' : 'Low'
    }

    return analysis
  } catch (error) {
    console.error('Error analyzing with Wordware:', error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    console.log('Receiving webhook from Crisp...');
    const payload = await req.json()
    console.log('Parsed payload:', payload);
    


    console.log('Creating Supabase client...');
    
    // Extrair o tipo de evento do payload do Crisp
    const eventType = payload.event
    console.log('Event type:', eventType);

    // Extrair campos específicos do payload
    const messageData = payload.data || {}
    const logEntry = {
      source: 'crisp',
      event_type: eventType,
      session_id: messageData.session_id,
      user_id: messageData.user?.user_id,
      user_nickname: messageData.user?.nickname,
      message_type: messageData.type,
      message_content: messageData.content,
      website_id: payload.website_id,
      payload: payload // mantemos o payload completo também
    }

    // Inserir o log na tabela
    console.log('Inserting into logs table...');
    const { data, error } = await supabase.from('logs').insert(logEntry).select()

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Successfully inserted log:', data);

    // Se for uma mensagem, analisar com Wordware
    if (eventType === 'message:send' && messageData.content) {
      console.log('Analyzing message with Wordware...');
      const wordwareResponse = await analyzeWithWordware(messageData.content)

      // Salvar análise no log
      const wordwareLogEntry = {
        source: 'wordware',
        event_type: 'sentiment_analysis',
        session_id: messageData.session_id,
        user_id: messageData.user?.user_id,
        user_nickname: messageData.user?.nickname,
        message_type: 'analysis',
        message_content: wordwareResponse.sentiment,
        website_id: payload.website_id,
        payload: wordwareResponse
      }

      const { error: logError } = await supabase
        .from('logs')
        .insert(wordwareLogEntry)

      if (logError) {
        console.error('Error saving log:', logError)
        throw logError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing Crisp webhook:', error)
    return new NextResponse(error instanceof Error ? error.message : 'Internal Server Error', { status: 500 })
  }
}
