"use client"

import { useState, useMemo, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { getTodayTickets, summarizeTickets } from '@/lib/wordware-tickets'

// Converte o sentiment score do Wordware em High/Medium/Low
function getSentimentFromScore(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.7) return "High"
  if (score >= 0.4) return "Medium"
  return "Low"
}
import { CompaniesTable } from "@/components/companies-table"
import { CompaniesHeader } from "@/components/companies-header"
import { DetailsSidebar } from "@/components/details-sidebar"

// Tipos base para reutilização
interface Project {
  id: string
  name: string
  usage: number
  lastActiveDate: string
  usageTrend: number[]
}

interface TimelineEvent {
  id: string
  type: "chat" | "videocall"
  title: string
  timestamp: string
  summary: string
}

interface Company {
  name: string
  lastActivity: string
  usageTrend: number[]
  tickets: number[]
  sentiment: number
  activeProjects: number
  status: string
  source: "salesforce" | "hubspot" | "csv" | "zendesk"
  employees?: string
  recordOwner?: string
  projects?: Project[]
  timeline?: TimelineEvent[]
}

const initialCompanies: Company[] = [
  {
    name: "TechNova Solutions",
    lastActivity: "2 days ago",
    usageTrend: [30, 32, 35, 38, 40, 42, 45, 48, 50],
    tickets: [5, 7, 6, 8, 10, 9, 11, 12, 10],
    sentiment: 0.95,
    activeProjects: 3,
    status: "Active",
    source: "salesforce",
    employees: "1,234",
    recordOwner: "Emma Thompson",
    projects: [
      {
        id: "1",
        name: "Project Alpha",
        usage: 75,
        lastActiveDate: "2 hours ago",
        usageTrend: [65, 68, 70, 72, 75, 73, 74, 75, 75],
      },
      {
        id: "2",
        name: "Project Beta",
        usage: 45,
        lastActiveDate: "1 day ago",
        usageTrend: [30, 35, 40, 42, 45, 44, 45, 45, 45],
      },
    ],
    timeline: [
      {
        id: "1",
        type: "chat",
        title: "Support Inquiry",
        timestamp: "2 hours ago",
        summary: "Customer reported issues with API integration. Provided step-by-step guidance.",
      },
      {
        id: "2",
        type: "videocall",
        title: "Quarterly Review",
        timestamp: "2 days ago",
        summary: "Discussed project progress and addressed concerns about scalability.",
      },
    ],
  },
  {
    name: "GreenEco Innovations",
    lastActivity: "5 days ago",
    usageTrend: [50, 48, 45, 40, 38, 35, 32, 30, 28],
    tickets: [2, 4, 3, 5, 7, 6, 8, 9, 7],
    sentiment: 0.5,
    activeProjects: 2,
    status: "At Risk",
    source: "hubspot",
    employees: "567",
    recordOwner: "Michael Chen",
  },
  {
    name: "QuantumLeap AI",
    lastActivity: "1 day ago",
    usageTrend: [20, 25, 30, 35, 40, 45, 50, 55, 60],
    tickets: [1, 2, 3, 1, 2, 3, 4, 5, 6],
    sentiment: null,
    activeProjects: 1,
    status: "Active",
    source: "csv",
    timeline: [{
      id: "1",
      type: "chat",
      title: "Support Inquiry",
      timestamp: "Just now",
      summary: "Waiting for customer message..."
    }],
  },
  {
    name: "CyberShield Security",
    lastActivity: "3 days ago",
    usageTrend: [40, 42, 41, 43, 45, 44, 46, 48, 47],
    tickets: [3, 5, 4, 6, 8, 7, 9, 10, 8],
    sentiment: "Medium",
    activeProjects: 1,
    status: "Stable",
    source: "zendesk",
  },
  {
    name: "BioGenetics Corp",
    lastActivity: "6 days ago",
    usageTrend: [60, 58, 55, 50, 45, 40, 35, 30, 25],
    tickets: [8, 6, 4, 2, 1, 3, 5, 7, 9],
    sentiment: "Low",
    activeProjects: 1,
    status: "Churned",
    source: "salesforce",
  },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState("lastActivity")

  // Constantes
  const WEBSITE_ID = '48dd6d16-b2eb-4c46-8cb6-4214e897d9c9'
  const UPDATE_INTERVAL = 5000
  const DAYS_TO_FETCH = 7

  // Busca sentiment, tickets e gera sumarização periodicamente
  useEffect(() => {
    let isSubscribed = true
    console.log('Iniciando intervalo de busca')

    const fetchData = async () => {
      if (!isSubscribed) return
      console.log('Executando busca de dados...')

      try {
        // Busca o último sentiment analysis
        const { data: sentimentData, error: sentimentError } = await supabase
          .from('logs')
          .select('*')
          .eq('source', 'wordware')
          .eq('event_type', 'sentiment_analysis')
          .order('timestamp', { ascending: false })
          .limit(1)

        if (sentimentError) throw sentimentError

        // Busca os tickets dos últimos dias para o gráfico
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - DAYS_TO_FETCH)
        
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('logs')
          .select('*')
          .eq('source', 'crisp')
          .in('event_type', ['message:send', 'message:received'])
          .eq('website_id', WEBSITE_ID)
          .gte('timestamp', sevenDaysAgo.toISOString())
          .order('timestamp', { ascending: true })

        if (ticketsError) throw ticketsError

        // Processa os tickets em contagens diárias para o gráfico
        const dailyCounts = new Array(DAYS_TO_FETCH).fill(0)
        ticketsData?.forEach(log => {
          const dayIndex = (DAYS_TO_FETCH - 1) - Math.floor(
            (new Date().getTime() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (dayIndex >= 0 && dayIndex < DAYS_TO_FETCH) {
            dailyCounts[dayIndex]++
          }
        })

        // Verifica se há novos tickets para resumir
        const todayTickets = await getTodayTickets()
        if (todayTickets.length > 0) {
          await summarizeTickets(todayTickets)
        }
        
        // Atualiza o estado das empresas apenas se ainda estivermos inscritos
        if (isSubscribed) {
          setCompanies(prevCompanies => 
            prevCompanies.map(company => 
              company.name === "QuantumLeap AI" 
                ? {
                    ...company,
                    sentiment: sentimentData?.[0]?.payload?.sentiment_score ?? company.sentiment,
                    tickets: dailyCounts
                  }
                : company
            )
          )
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      }
    }

    // Configura subscription para atualizações em tempo real
    console.log('Configurando subscription do Supabase')
    const subscription = supabase
      .channel('logs-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `source=eq.crisp AND (event_type=eq.message:send OR event_type=eq.message:received) AND website_id=eq.${WEBSITE_ID}`
        },
        fetchData // Reutiliza a mesma função
      )
      .subscribe()

    // Busca inicial e configura intervalo
    fetchData()
    const interval = setInterval(fetchData, UPDATE_INTERVAL)

    return () => {
      console.log('Limpando recursos...')
      isSubscribed = false
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "sentiment",
    "tickets",
    "usageTrend",
    "lastActivity",
    "activeProjects",
    "status",
  ])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.sentiment.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [companies, searchQuery])

  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return -1
      if (a[sortColumn] > b[sortColumn]) return 1
      return 0
    })
  }, [filteredCompanies, sortColumn])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (column: string) => {
    setSortColumn(column)
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }

  const handleColumnReorder = (draggedColumnId: string, targetColumnId: string) => {
    setSelectedColumns((prevColumns) => {
      const draggedIndex = prevColumns.indexOf(draggedColumnId)
      const targetIndex = prevColumns.indexOf(targetColumnId)
      const newColumns = [...prevColumns]
      newColumns.splice(draggedIndex, 1)
      newColumns.splice(targetIndex, 0, draggedColumnId)
      return newColumns
    })
  }

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleNavigateCompany = (direction: "up" | "down") => {
    if (selectedCompany) {
      const currentIndex = sortedCompanies.findIndex((company) => company.name === selectedCompany.name)
      if (direction === "up" && currentIndex > 0) {
        setSelectedCompany(sortedCompanies[currentIndex - 1])
      } else if (direction === "down" && currentIndex < sortedCompanies.length - 1) {
        setSelectedCompany(sortedCompanies[currentIndex + 1])
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <CompaniesHeader
        totalCompanies={companies.length}
        onSearch={handleSearch}
        onSort={handleSort}
        onColumnToggle={handleColumnToggle}
        selectedColumns={selectedColumns}
      />
      <CompaniesTable
        companies={sortedCompanies}
        selectedColumns={selectedColumns}
        onRowClick={handleRowClick}
        onColumnReorder={handleColumnReorder}
      />
      <DetailsSidebar
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        company={selectedCompany}
        onNavigate={handleNavigateCompany}
        hasPrevious={
          selectedCompany ? sortedCompanies.findIndex((company) => company.name === selectedCompany.name) > 0 : false
        }
        hasNext={
          selectedCompany
            ? sortedCompanies.findIndex((company) => company.name === selectedCompany.name) < sortedCompanies.length - 1
            : false
        }
      />
    </div>
  )
}

