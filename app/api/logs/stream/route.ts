import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export const runtime = 'edge'

export async function GET() {
  let keepAliveInterval: NodeJS.Timeout

  const stream = new ReadableStream({
    start: async (controller) => {
      const subscription = supabase
        .channel('logs-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logs',
          },
          async (payload) => {
            const { new: newLog } = payload
            try {
              // Enviar o log como evento SSE
              controller.enqueue(`data: ${JSON.stringify(newLog)}\n\n`)
            } catch (error) {
              // Se o controller estiver fechado, limpar recursos
              if (error instanceof TypeError && error.message.includes('Controller is closed')) {
                clearInterval(keepAliveInterval)
                subscription.unsubscribe()
              } else {
                console.error('Error enqueueing log:', error)
              }
            }
          }
        )
        .subscribe()

      // Manter a conexão viva
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(': keepalive\n\n')
        } catch (error) {
          // Se o controller estiver fechado, limpar recursos
          if (error instanceof TypeError && error.message.includes('Controller is closed')) {
            clearInterval(keepAliveInterval)
            subscription.unsubscribe()
          }
        }
      }, 30000)

      // Cleanup quando a conexão for fechada
      return () => {
        clearInterval(keepAliveInterval)
        subscription.unsubscribe()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}