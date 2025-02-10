import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {

    // Busca a última análise do Wordware
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('source', 'wordware')
      .eq('event_type', 'sentiment_analysis')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    if (data && data.length > 0) {
      const analysis = data[0].payload
      return NextResponse.json({
        sentiment_score: analysis.sentiment_score,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        timestamp: data[0].created_at
      })
    }

    // Retorna valores default se não houver análise
    return NextResponse.json({
      sentiment_score: 0.5,
      sentiment: 'Medium',
      summary: '',
      timestamp: null
    })
  } catch (error) {
    console.error('Error fetching latest sentiment:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
