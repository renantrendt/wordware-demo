"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface LogEntry {
  id: string
  timestamp: string
  source: "crisp" | "wordware"
  event_type: string
  session_id: string
  user_id: string
  user_nickname: string
  message_type: string
  message_content: string
  website_id: string
  payload: any
}

interface LogsTableProps {
  logs: LogEntry[]
}

export function LogsTable({ logs }: LogsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  return (
    <div className="rounded-md border border-[#1f1f1f]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead className="w-[120px]">Source</TableHead>
            <TableHead className="w-[150px]">Event Type</TableHead>
            <TableHead className="w-[150px]">User</TableHead>
            <TableHead className="w-[150px]">Session</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <>
              <TableRow
                key={log.id}
                className="cursor-pointer hover:bg-[#1a1a1a]"
                onClick={() => toggleRow(log.id)}
              >
                <TableCell>
                  {expandedRows.has(log.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={log.source === "crisp" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {log.source}
                  </Badge>
                </TableCell>
                <TableCell>{log.event_type}</TableCell>
                <TableCell className="font-medium">
                  {log.user_nickname ? (
                    <div className="flex flex-col">
                      <span>{log.user_nickname}</span>
                      <span className="text-xs text-muted-foreground">{log.user_id}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.session_id ? log.session_id.split('_').pop() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{log.message_content || '-'}</span>
                    {log.message_type && (
                      <span className="text-xs text-muted-foreground">
                        Type: {log.message_type}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.has(log.id) && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-[#0f0f0f] p-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
