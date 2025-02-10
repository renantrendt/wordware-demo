"use client"

import { useState, useEffect } from "react"
import { LogsTable } from "@/components/logs-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

interface LogEntry {
  id: string
  timestamp: string
  source: "crisp" | "wordware"
  event_type: string
  payload: any
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Inicializar cliente do Supabase

  // Carregar logs iniciais
  useEffect(() => {
    const loadInitialLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)

        if (error) throw error
        setLogs(data || [])
      } catch (error) {
        console.error('Error loading logs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialLogs()
  }, [])

  // Configurar SSE para atualizações em tempo real
  useEffect(() => {
    const eventSource = new EventSource("/api/logs/stream")

    eventSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data)
      setLogs((prevLogs) => [newLog, ...prevLogs])
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      log.source.toLowerCase().includes(searchLower) ||
      log.event_type.toLowerCase().includes(searchLower) ||
      (log.user_nickname || '').toLowerCase().includes(searchLower) ||
      (log.message_content || '').toLowerCase().includes(searchLower) ||
      (log.session_id || '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Logs</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of Crisp and Wordware events
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by source, event type, or payload content..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <LogsTable logs={filteredLogs} />
      </div>
    </div>
  )
}
