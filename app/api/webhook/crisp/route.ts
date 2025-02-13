import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { analyzeWithWordware } from '@/lib/wordware/crisp-analyzer'
import { CrispWebhookPayload } from '@/lib/wordware/types'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    console.log('Receiving webhook from Crisp...')
    const payload = await req.json() as CrispWebhookPayload
    console.log('Parsed payload:', payload)
    
    console.log('Creating Supabase client...')
    
    // Extrair o tipo de evento do payload do Crisp
    const eventType = payload.event
    console.log('Event type:', eventType)

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
    console.log('Inserting into logs table...')
    const { data, error } = await supabase.from('logs').insert(logEntry).select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Successfully inserted log:', data)

    // Se for uma mensagem, analisar com Wordware
    if (eventType === 'message:send' && messageData.content) {
      console.log('Analyzing message with Wordware...')
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
