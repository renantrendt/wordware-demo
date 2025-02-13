import { supabase } from './supabase'
import { startOfDay } from 'date-fns'

export async function getTodayTickets() {
  const today = startOfDay(new Date())
  console.log('Buscando tickets a partir de:', today.toISOString())
  
  // Primeiro busca o último resumo de hoje
  const { data: lastSummary } = await supabase
    .from('logs')
    .select('timestamp')
    .eq('source', 'wordware')
    .eq('event_type', 'ticket_summary')
    .gte('timestamp', today.toISOString())
    .order('timestamp', { ascending: false })
    .limit(1)

  // Define o ponto de início para buscar tickets (último resumo ou início do dia)
  const startTime = lastSummary?.[0]?.timestamp || today.toISOString()
  console.log('Buscando tickets a partir de:', startTime)

  // Busca apenas tickets novos desde o último resumo
  const { data: tickets, error } = await supabase
    .from('logs')
    .select('*')
    .eq('source', 'crisp')
    .in('event_type', ['message:send', 'message:received'])
    .gt('timestamp', startTime) // Usa gt em vez de gte para evitar duplicação
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }

  const ticketCount = tickets?.length || 0
  console.log(`Encontrados ${ticketCount} tickets novos desde ${startTime}`)
  return tickets || []
}

export async function summarizeTickets(tickets: any[]) {
  console.log('Iniciando summarizeTickets com', tickets.length, 'tickets')

  if (!tickets || tickets.length === 0) {
    console.log('Nenhum ticket para resumir')
    return {
      summary: "No support inquiries today.",
      type: "chat"
    }
  }

  try {
    console.log('Chamando API de summarização')
    const response = await fetch('/api/summarize-tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tickets })
    })

    if (!response.ok) {
      throw new Error('Failed to get summary from API')
    }

    const data = await response.json()
    console.log('Resumo gerado com sucesso:', data)
    
    return {
      summary: data.summary || "No summary available",
      type: "chat"
    }
  } catch (error) {
    console.error('Error getting summary:', error)
    return {
      summary: "Failed to generate summary",
      type: "chat"
    }
  }
}
