import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET() {
  const stream = new ReadableStream({
    start: async (controller) => {
      let keepAliveInterval: NodeJS.Timeout
      let isControllerClosed = false

      // Função segura para enviar dados
      const safeEnqueue = (data: string) => {
        if (isControllerClosed) return false
        try {
          controller.enqueue(data)
          return true
        } catch (error) {
          if (error instanceof TypeError && 
              (error.message.includes('Controller is closed') || 
               error.message.includes('Invalid state'))) {
            return false
          }
          console.error('Error enqueueing data:', error)
          return false
        }
      }

      // Função para limpar recursos
      const cleanup = (subscription: any) => {
        if (!isControllerClosed) {
          isControllerClosed = true
          clearInterval(keepAliveInterval)
          try {
            subscription?.unsubscribe()
          } catch (error) {
            console.error('Error unsubscribing:', error)
          }
          try {
            controller.close()
          } catch (error) {
            console.error('Error closing controller:', error)
          }
        }
      }

      // Configurar subscription do Supabase
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
            if (!safeEnqueue(`data: ${JSON.stringify(newLog)}\n\n`)) {
              cleanup(subscription)
            }
          }
        )
        .subscribe()

      // Configurar keepalive
      keepAliveInterval = setInterval(() => {
        if (!safeEnqueue(': keepalive\n\n')) {
          cleanup(subscription)
        }
      }, 30000)

      // Cleanup quando o stream for fechado
      return () => cleanup(subscription)
    },
    cancel: () => {
      // Este método é chamado se o cliente cancelar o stream
      console.log('Stream cancelled by client')
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