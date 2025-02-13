"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Video, ChevronDown, AlertCircle, ListChecks } from "lucide-react"

interface TimelineItem {
  id: string
  type: "chat" | "videocall"
  title: string
  timestamp: string
  summary: string
  payload?: {
    summary: string
    overall_sentiment: 'positive' | 'neutral' | 'negative'
    urgent_matters: string[]
    key_topics: string[]
    action_items: string[]
  }
}

interface TimelineCardProps {
  item: TimelineItem
  isExpanded?: boolean
  onToggleExpand?: (id: string) => void
}

export function TimelineCard({ item, isExpanded: controlledExpanded, onToggleExpand }: TimelineCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const isExpanded = controlledExpanded ?? localExpanded
  const [comment, setComment] = useState("")

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2F2F2F]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-white flex items-center">
            {item.type === "chat" ? (
              <MessageSquare className="w-5 h-5 mr-2 text-wordware-orange" />
            ) : (
              <Video className="w-5 h-5 mr-2 text-wordware-purple" />
            )}
            {item.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div
          onClick={() => {
            if (onToggleExpand) {
              onToggleExpand(item.id)
            } else {
              setLocalExpanded(!localExpanded)
            }
          }}
          className="flex items-center justify-between w-full cursor-pointer text-muted-foreground hover:text-white"
        >
          <span className="text-sm">{item.timestamp}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">AI Summary</h4>
              <p className="text-sm text-muted-foreground">{item.summary}</p>
            </div>

            {/* Key Topics */}
            {item.payload?.key_topics && item.payload.key_topics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Key Topics
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {item.payload.key_topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {item.payload?.action_items && item.payload.action_items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  Action Items
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {item.payload.action_items.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Urgent Matters */}
            {item.payload?.urgent_matters && item.payload.urgent_matters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Urgent Matters
                </h4>
                <ul className="list-disc list-inside text-sm text-red-400 space-y-1">
                  {item.payload.urgent_matters.map((matter, index) => (
                    <li key={index}>{matter}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Comments</h4>
              <Textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="bg-[#121212] border-[#2F2F2F] text-white"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

