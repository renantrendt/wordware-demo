"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { SendIcon } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  visualizations?: any
}

export default function AnalyticsChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const analytics = AnalyticsService.getInstance();
      const response = await analytics.analyzeQuestion(input);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        visualizations: response.visualizations
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h2 className="text-lg font-semibold">Analytics Assistant</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 mb-4",
                  msg.role === "assistant" ? "justify-start" : "justify-end"
                )}
              >
                {msg.role === "assistant" && (
                  <Avatar>
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "rounded-lg p-4 max-w-[80%]",
                    msg.role === "assistant"
                      ? "bg-secondary"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {msg.content}

                  {msg.role === "assistant" && msg.visualizations && (
                    <div className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{msg.visualizations.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre>{JSON.stringify(msg.visualizations.data, null, 2)}</pre>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-3">
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <Card className="w-[300px]">
                  <CardContent className="p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            placeholder="Pergunte algo sobre seus clientes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="border-t bottom-0 w-full bg-background">
        <div className="flex h-16 items-center px-4">
        </div>
      </div>
    </div>
  )
}
