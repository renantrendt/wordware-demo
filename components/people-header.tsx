"use client"

import { Search, ArrowUpDown, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ImportButton } from "@/components/import-button"

const columns = [
  { id: "name", label: "Name" },
  { id: "company", label: "Company" },
  { id: "role", label: "Role" },
  { id: "lastActivity", label: "Last Activity" },
  { id: "engagement", label: "Engagement" },
  { id: "status", label: "Status" },
  { id: "sentimentGrade", label: "Sentiment Grade" },
]

interface PeopleHeaderProps {
  totalPeople: number
  onSearch: (query: string) => void
  onSort: (column: string) => void
  onColumnToggle: (column: string) => void
  selectedColumns: string[]
  importType: string
}

export function PeopleHeader({
  totalPeople,
  onSearch,
  onSort,
  onColumnToggle,
  selectedColumns,
  importType,
}: PeopleHeaderProps) {
  const [sortColumn, setSortColumn] = useState("lastActivity")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-muted-foreground">{totalPeople.toLocaleString()} people</p>
        </div>
        <ImportButton importType="People" />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-transparent border-[#313131] focus:ring-0 focus-visible:ring-0 focus:border-[#414141] focus-visible:border-[#414141] focus:ring-offset-0 focus-visible:ring-offset-0"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-[#313131] bg-transparent text-muted-foreground hover:text-white"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort: {columns.find((col) => col.id === sortColumn)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={sortColumn === column.id}
                onCheckedChange={() => {
                  setSortColumn(column.id)
                  onSort(column.id)
                }}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-[#313131] bg-transparent text-muted-foreground hover:text-white"
            >
              <Table2 className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={selectedColumns.includes(column.id)}
                onCheckedChange={() => onColumnToggle(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

