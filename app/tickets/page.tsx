"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DetailsSidebar } from "@/components/details-sidebar"
import { supabase, type Ticket, type Message } from "@/lib/supabase"

function getSentimentFromScore(score: number | null): "High" | "Medium" | "Low" {
    if (!score) return "Medium"
    if (score >= 0.7) return "High"
    if (score >= 0.4) return "Medium"
    return "Low"
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Initial fetch of tickets
        const fetchTickets = async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) {
                console.error('Error fetching tickets:', error)
                return
            }

            setTickets(data || [])
            setIsLoading(false)
        }

        fetchTickets()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('tickets-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tickets'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTickets(prev => [payload.new as Ticket, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setTickets(prev =>
                            prev.map(ticket =>
                                ticket.id === payload.new.id
                                    ? { ...ticket, ...payload.new }
                                    : ticket
                            )
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setTickets(prev =>
                            prev.filter(ticket => ticket.id !== payload.old.id)
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [])

    useEffect(() => {
        let messagesChannel: ReturnType<typeof supabase.channel> | null = null

        if (selectedTicket) {
            const fetchMessages = async () => {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('ticket_id', selectedTicket.id)
                    .order('created_at', { ascending: true })

                if (error) {
                    console.error('Error fetching messages:', error)
                    return
                }

                setMessages(data || [])
            }

            fetchMessages()

            // Subscribe to real-time message changes for the selected ticket
            messagesChannel = supabase
                .channel(`messages-${selectedTicket.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'messages',
                        filter: `ticket_id=eq.${selectedTicket.id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setMessages(prev => [...prev, payload.new as Message])
                        } else if (payload.eventType === 'UPDATE') {
                            setMessages(prev =>
                                prev.map(message =>
                                    message.id === payload.new.id
                                        ? { ...message, ...payload.new }
                                        : message
                                )
                            )
                        } else if (payload.eventType === 'DELETE') {
                            setMessages(prev =>
                                prev.filter(message => message.id !== payload.old.id)
                            )
                        }
                    }
                )
                .subscribe()
        }

        return () => {
            if (messagesChannel) {
                messagesChannel.unsubscribe()
            }
        }
    }, [selectedTicket])

    const handleRowClick = (ticket: Ticket) => {
        setSelectedTicket(ticket)
    }

    return (
        <div className="flex h-screen">
            <div className="flex-1 p-6">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Email</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead>Sentiment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow
                                    key={ticket.id}
                                    className="cursor-pointer hover:bg-[#1a1a1a]"
                                    onClick={() => handleRowClick(ticket)}
                                >
                                    <TableCell>{ticket.email}</TableCell>
                                    <TableCell>
                                        {new Date(ticket.updated_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                            getSentimentFromScore(ticket.sentiment) === 'High'
                                                ? 'bg-green-500/10 text-green-500'
                                                : getSentimentFromScore(ticket.sentiment) === 'Medium'
                                                ? 'bg-yellow-500/10 text-yellow-500'
                                                : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {getSentimentFromScore(ticket.sentiment)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedTicket && (
                <DetailsSidebar
                    title={`Messages from ${selectedTicket.email}`}
                    onClose={() => setSelectedTicket(null)}
                >
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className="rounded-lg border border-[#1f1f1f] p-4"
                            >
                                <div className="mb-2 text-sm text-gray-400">
                                    {new Date(message.created_at).toLocaleString()}
                                </div>
                                <div className="mb-2">{message.content}</div>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    getSentimentFromScore(message.sentiment) === 'High'
                                        ? 'bg-green-500/10 text-green-500'
                                        : getSentimentFromScore(message.sentiment) === 'Medium'
                                        ? 'bg-yellow-500/10 text-yellow-500'
                                        : 'bg-red-500/10 text-red-500'
                                }`}>
                                    {getSentimentFromScore(message.sentiment)}
                                </span>
                            </div>
                        ))}
                    </div>
                </DetailsSidebar>
            )}
        </div>
    )
}
