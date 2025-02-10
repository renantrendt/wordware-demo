"use client"

import { useState, useMemo, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

// Converte o sentiment score do Wordware em High/Medium/Low
function getSentimentFromScore(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.7) return "High"
  if (score >= 0.4) return "Medium"
  return "Low"
}
import { CompaniesTable } from "@/components/companies-table"
import { CompaniesHeader } from "@/components/companies-header"
import { DetailsSidebar } from "@/components/details-sidebar"

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
  projects?: {
    id: string
    name: string
    usage: number
    lastActiveDate: string
    usageTrend: number[]
  }[]
  timeline?: {
    id: string
    type: "chat" | "videocall"
    title: string
    timestamp: string
    summary: string
  }[]
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
    sentiment: 0.9,
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
  console.log("Rendering CompaniesPage")
  
  useEffect(() => {
    console.log("CompaniesPage mounted")
    console.log("Environment variables:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
    
    return () => {
      console.log("CompaniesPage unmounted")
    }
  }, [])
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState("lastActivity")

  // Busca o último sentiment_score a cada 5 segundos
  useEffect(() => {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchSentiment = async () => {
      try {
        // Busca o último log do Wordware
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .eq('source', 'wordware')
          .eq('event_type', 'sentiment_analysis')
          .order('timestamp', { ascending: false })
          .limit(1)

        if (error) throw error

        if (data && data.length > 0) {
          const analysis = data[0].payload
          
          // Atualiza o sentiment e o timeline do QuantumLeap AI
          setCompanies(prevCompanies => 
            prevCompanies.map(company => 
              company.name === "QuantumLeap AI" 
                ? {
                    ...company,
                    sentiment: analysis.sentiment_score,
                    timeline: [{
                      id: "1",
                      type: "chat",
                      title: "Support Inquiry",
                      timestamp: data[0].timestamp ? new Date(data[0].timestamp).toLocaleString() : "Just now",
                      summary: analysis.summary || "Waiting for customer message..."
                    }]
                  }
                : company
            )
          )
        }
      } catch (error) {
        console.error('Erro ao buscar sentiment:', error)
      }
    }

    // Busca imediatamente e depois a cada 5 segundos
    fetchSentiment()
    const interval = setInterval(fetchSentiment, 5000)

    return () => clearInterval(interval)
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

