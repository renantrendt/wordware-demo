"use client"

import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBeacons } from '@/contexts/beacon-context'

export function Header() {
  const { resetBeacons } = useBeacons()
  return (
    <header className="bg-background border-b border-border py-4 px-6">
      <div className="flex justify-between items-center">
        <div></div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => {
            resetBeacons()
            window.location.reload()
          }}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

