import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const runtime = 'edge'

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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
            
            // Enviar o log como evento SSE
            controller.enqueue(`data: ${JSON.stringify(newLog)}\n\n`)
          }
        )
        .subscribe()

      // Manter a conexão viva
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(': keepalive\n\n')
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
