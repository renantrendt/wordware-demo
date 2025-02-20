import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { analyzeWithWordware } from '@/lib/wordware/crisp-analyzer'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    console.log('Receiving webhook from Twilio...')
    const formData = await req.formData()
    
    // Extrair dados do form-data do Twilio
    const messageData = {
      messageId: formData.get('MessageSid'),
      from: formData.get('From'),
      to: formData.get('To'),
      body: formData.get('Body'),
      numMedia: formData.get('NumMedia'),
    }

    console.log('Parsed Twilio message:', messageData)

    console.log('Received request:', { body: messageData });

    // Criar entrada de log
    const logEntry = {
      source: 'twilio',
      event_type: 'message:received',
      session_id: messageData.messageId,
      user_id: messageData.from,
      message_type: 'text',
      message_content: messageData.body,
      payload: messageData
    }

    // Inserir o log na tabela
    console.log('Inserting into logs table...')
    const { data, error } = await supabase.from('logs').insert(logEntry).select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Successfully inserted log:', data)

    // Analisar mensagem com Wordware
    if (messageData.body) {
      console.log('Analyzing message with Wordware...')
      const wordwareResponse = await analyzeWithWordware(messageData.body)

      // Salvar análise no log
      const wordwareLogEntry = {
        source: 'wordware',
        event_type: 'sentiment_analysis',
        session_id: messageData.messageId,
        user_id: messageData.from,
        message_type: 'analysis',
        message_content: wordwareResponse.sentiment,
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

    // Retornar uma resposta TwiML vazia
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: {
        'Content-Type': 'text/xml',
      },
    })

  } catch (error) {
    console.error('Error processing Twilio webhook:', error)
    return new NextResponse(error instanceof Error ? error.message : 'Internal Server Error', { status: 500 })
  }
}
