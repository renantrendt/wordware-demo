import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="bg-background border-b border-border py-4 px-6">
      <div className="flex justify-between items-center">
        <div></div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

