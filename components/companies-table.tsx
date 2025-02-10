"use client"

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useState } from "react"
// import { SourceIcon } from "./source-icon"
import { TrendLine } from "./trend-line"
import Image from "next/image"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { CustomDragLayer } from "./custom-drag-layer"

interface Company {
  name: string
  lastActivity: string
  usageTrend: number[]
  tickets: number[]
  sentiment: number
  activeProjects: number
  status: string
  source: "salesforce" | "csv" | "hubspot" | "zendesk"
}

interface CompaniesTableProps {
  companies: Company[]
  selectedColumns: string[]
  onRowClick: (company: Company) => void
  onColumnReorder: (draggedColumnId: string, targetColumnId: string) => void
}

const columnLabels = {
  name: "Name",
  lastActivity: "Last Activity",
  usageTrend: "Usage (L30D)",
  tickets: "Tickets",
  sentiment: "Sentiment (L30D)",
  activeProjects: "Active Projects",
  status: "Status",
}

const columnWidths = {
  name: "w-[200px] shrink-0 pr-4",
  sentiment: "w-[120px] shrink-0 pr-0",
  tickets: "w-[120px] shrink-0 pr-0",
  usageTrend: "w-[120px] shrink-0 pr-0",
  lastActivity: "w-[120px] shrink-0 pr-0",
  activeProjects: "w-[120px] shrink-0 pr-0",
  status: "w-[120px] shrink-0",
}

const DraggableTableHead = ({ columnId, onColumnReorder, className = "" }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "COLUMN",
    item: { id: columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "COLUMN",
    drop: (draggedItem: { id: string }) => {
      if (draggedItem.id !== columnId) {
        onColumnReorder(draggedItem.id, columnId)
      }
    },
  })

  return (
    <th
      ref={(node) => drag(drop(node))}
      className={`h-10 pl-6 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap ${
        columnWidths[columnId]
      } ${isDragging ? "opacity-50" : ""} ${className}`}
    >
      <span className="cursor-move">{columnLabels[columnId]}</span>
    </th>
  )
}

export function CompaniesTable({ companies, selectedColumns, onRowClick, onColumnReorder }: CompaniesTableProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-x-auto -mx-6 whitespace-nowrap">
        <Table>
          <thead>
            <tr>
              {selectedColumns.map((columnId, index) => (
                <DraggableTableHead
                  key={columnId}
                  columnId={columnId}
                  onColumnReorder={onColumnReorder}
                  className={index === 0 ? "pl-6" : ""}
                />
              ))}
            </tr>
          </thead>
          <TableBody>
            {companies.map((company) => (
              <TableRow
                key={company.name}
                className="cursor-pointer hover:bg-[#1a1a1a] border-b border-[#1f1f1f]"
                onClick={() => onRowClick(company)}
                data-company={company.name}
              >
                {selectedColumns.map((columnId, index) => (
                  <TableCell
                    key={columnId}
                    className={`pl-6 py-3.5 whitespace-nowrap ${columnWidths[columnId]} ${index === 0 ? "pl-6" : ""}`}
                    data-column={columnId}
                  >
                    {columnId === "name" && (
                      <div className="flex items-center space-x-2">
                        <Image
                          src={`https://avatar.vercel.sh/${company.name}.png`}
                          alt={`${company.name} logo`}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>{company.name}</span>
                      </div>
                    )}
                    {columnId === "lastActivity" && company.lastActivity}
                    {columnId === "usageTrend" && (
                      <div className="flex justify-start w-full">
                        <div className="h-[30px] w-[120px]">
                          <TrendLine
                          data={company.usageTrend}
                          height={30}
                          width={120}
                          color={
                            company.sentiment >= 0.7
                              ? "#FFA066"
                              : company.sentiment >= 0.4
                                ? "#7B93FF"
                                : "#909090"
                          }
                        />
                        </div>
                      </div>
                    )}
                    {columnId === "tickets" && (
                      <div className="flex justify-start w-full">
                        <div className="h-[30px] w-[120px]">
                          <TrendLine data={company.tickets} height={30} width={120} color="#FF5D0A" />
                        </div>
                      </div>
                    )}
                    {columnId === "sentiment" && (
                      <div className="flex items-center gap-1 w-full">
                        <span
                          className={`px-2.5 py-1 rounded-full text-sm ${
                            typeof company.sentiment === 'number'
                              ? company.sentiment >= 0.7
                                ? "bg-[#2B1D13] text-[#FFA066]"
                                : company.sentiment >= 0.4
                                  ? "bg-[#1A1D2B] text-[#7B93FF]"
                                  : "bg-[#1A1A1A] text-[#909090]"
                              : "bg-[#1A1A1A] text-[#909090]"
                          }`}
                        >
                          {typeof company.sentiment === 'number' ? `${(company.sentiment * 100).toFixed(0)}%` : '-'}
                        </span>
                        {company.name === "QuantumLeap AI" && (
                          <div className="ml-1">
                            <div className="relative flex items-center justify-center">
                              {/* Outer ring with animation */}
                              <div className="absolute w-4 h-4 bg-white rounded-full opacity-20 animate-ping" />
                              {/* Inner dot */}
                              <div className="relative w-3 h-3 bg-white rounded-full opacity-60" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {columnId === "activeProjects" && <span className="text-sm">{company.activeProjects}</span>}
                    {columnId === "status" && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-sm ${
                          company.status === "Active"
                            ? "bg-[#132B1B] text-[#66D19E]"
                            : company.status === "At Risk"
                              ? "bg-[#2B1A1A] text-[#FF7676]"
                              : "bg-[#1A1A1A] text-[#909090]"
                        }`}
                      >
                        {company.status}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CustomDragLayer columnLabels={columnLabels} />
    </DndProvider>
  )
}

