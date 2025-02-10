"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendLine } from "./trend-line"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimelineCard } from "./timeline-card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Company {
  name: string
  lastActivity: string
  usageTrend: number[]
  tickets: number[]
  sentiment: "High" | "Medium" | "Low"
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

interface DetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
  onNavigate: (direction: "up" | "down") => void
  hasPrevious: boolean
  hasNext: boolean
}

export function DetailsSidebar({ isOpen, onClose, company, onNavigate, hasPrevious, hasNext }: DetailsSidebarProps) {
  const [isGraphLoaded, setIsGraphLoaded] = useState(false)
  const [isIntentTrendExpanded, setIsIntentTrendExpanded] = useState(true)
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true)

  useEffect(() => {
    if (isOpen && company) {
      const timer = setTimeout(() => {
        setIsGraphLoaded(true)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setIsGraphLoaded(false)
    }
  }, [isOpen, company])

  if (!company) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] md:w-[700px] lg:w-[900px] h-full p-0 bg-[#121212] border-l border-[#1F1F1F] rounded-l-[12px]"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#1F1F1F]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold text-white">{company.name}</SheetTitle>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("up")}
                disabled={!hasPrevious}
                className="text-white h-5 w-5 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("down")}
                disabled={!hasNext}
                className="text-white h-5 w-5 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] px-6 py-6">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <p className="text-base text-white">{company.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Employees</h3>
                <p className="text-base text-white">{company.employees || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Activity</h3>
                <p className="text-base text-white">{company.lastActivity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Record Owner</h3>
                <p className="text-base text-white">{company.recordOwner || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Sentiment</h3>
                <p
                  className={`text-base ${
                    company.sentiment === "High"
                      ? "text-green-500"
                      : company.sentiment === "Medium"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {company.sentiment}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Usage Trend (L30D)</h2>
                <ChevronDown
                  className={`h-5 w-5 cursor-pointer transition-transform ${isIntentTrendExpanded ? "rotate-180" : ""}`}
                  onClick={() => setIsIntentTrendExpanded(!isIntentTrendExpanded)}
                />
              </div>
              {isIntentTrendExpanded && (
                <>
                  <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
                    {isGraphLoaded ? (
                      <div className="h-[200px]">
                        <TrendLine
                          data={company.usageTrend}
                          color={
                            company.sentiment === "High"
                              ? "#FFA066"
                              : company.sentiment === "Medium"
                                ? "#7B93FF"
                                : "#909090"
                          }
                          height={160}
                          width="100%"
                        />
                      </div>
                    ) : (
                      <Skeleton className="w-full h-[200px] bg-gray-800/50" />
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last 30 days</span>
                      <span className="text-sm font-medium text-white">{company.sentiment} Usage</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-4">Project Metrics</h3>
                  <div className="space-y-4">
                    {company.projects && company.projects.length > 0 ? (
                      company.projects.map((project) => (
                        <Card key={project.id} className="bg-[#1A1A1A] border-[#2F2F2F]">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium text-white">{project.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Usage</span>
                              <span className="text-sm font-medium text-white">{project.usage}%</span>
                            </div>
                            <div className="h-[60px]">
                              <TrendLine data={project.usageTrend} color="#6E56CF" height={60} width="100%" />
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                Last active: {project.lastActiveDate}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="bg-[#1A1A1A] border-[#2F2F2F]">
                        <CardContent className="py-6">
                          <p className="text-center text-muted-foreground">No projects available</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Timeline</h2>
                <ChevronDown
                  className={`h-5 w-5 cursor-pointer transition-transform ${isTimelineExpanded ? "rotate-180" : ""}`}
                  onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                />
              </div>
              {isTimelineExpanded && (
                <>
                  <Card className="bg-[#1A1A1A] border-[#2F2F2F] mb-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-white">Support Tickets Opened</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[60px]">
                        <TrendLine data={company.tickets} color="#FF5D0A" height={60} width="100%" />
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-4">
                    {company.timeline && company.timeline.length > 0 ? (
                      company.timeline.map((item) => <TimelineCard key={item.id} item={item} />)
                    ) : (
                      <Card className="bg-[#1A1A1A] border-[#2F2F2F]">
                        <CardContent className="py-6">
                          <p className="text-center text-muted-foreground">No timeline entries available</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

