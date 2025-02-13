import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { startOfDay, subDays } from 'date-fns'

interface WordwareResponse {
  summary: string
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  urgent_matters: string[]
  key_topics: string[]
  action_items: string[]
}

interface TicketSummary {
  timestamp: string
  message_content: string
  payload: WordwareResponse
}

export function useTicketSummaries() {
  const [summaries, setSummaries] = useState<TicketSummary[]>([])

  useEffect(() => {
    const fetchSummaries = async () => {
      // Busca resumos dos últimos 7 dias
      const startDate = startOfDay(subDays(new Date(), 7))

      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('source', 'wordware')
        .eq('event_type', 'ticket_summary')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching summaries:', error)
        return
      }

      // Agrupa os resumos por dia e pega o mais recente de cada dia
      const latestByDay = new Map<string, TicketSummary>()
      data?.forEach((summary) => {
        const day = startOfDay(new Date(summary.timestamp)).toISOString()
        if (!latestByDay.has(day)) {
          latestByDay.set(day, summary)
        }
      })

      // Converte o Map para array e ordena por data (mais recente primeiro)
      const dailySummaries = Array.from(latestByDay.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setSummaries(dailySummaries)
    }

    fetchSummaries()

    // Subscribe to new summaries
    const channel = supabase
      .channel('ticket_summaries')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `source=eq.wordware AND event_type=eq.ticket_summary`
        },
        (payload) => {
          // Quando receber um novo resumo, adiciona ele mantendo apenas um por dia
          setSummaries(current => {
            const newSummary = payload.new as TicketSummary
            const newSummaryDay = startOfDay(new Date(newSummary.timestamp)).toISOString()
            
            // Remove qualquer resumo existente do mesmo dia
            const otherDays = current.filter(summary => {
              const summaryDay = startOfDay(new Date(summary.timestamp)).toISOString()
              return summaryDay !== newSummaryDay
            })
            
            // Adiciona o novo resumo e ordena por data
            return [newSummary, ...otherDays].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return summaries
}
