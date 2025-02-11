"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BeaconProps {
  position: 'logs' | 'crisp' | 'restart'
  onClick?: () => void
  className?: string
}

const beaconPositions = {
  logs: 'fixed left-[100px] bottom-[20px] z-50', // Next to Logs in sidebar
  crisp: 'fixed left-[80px] bottom-[130px] z-50', // Next to Crisp chat widget
  restart: 'fixed right-[20px] top-[20px] z-50' // Top right corner for restart tour
}

const beaconTooltips = {
  logs: 'View detailed logs and activity of the endpoint.',
  crisp: 'Send a message expressing happiness or sadness to visualize the company sentiment decline.',
  restart: 'Click here to restart the product tour'
}

function Beacon({ position, onClick, className }: BeaconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'group cursor-pointer',
              beaconPositions[position],
              className
            )}
            onClick={onClick}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer ring with animation */}
              <div className="absolute w-4 h-4 bg-white rounded-full opacity-40 animate-ping" />
              {/* Inner dot */}
              <div className="relative w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right"
          className="bg-[#1A1A1A] text-white border-[#2F2F2F] text-sm max-w-[200px]"
        >
          {beaconTooltips[position]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30" style={{ backdropFilter: 'blur(3px)' }}>
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4">
        <Card className="border-neutral-800 bg-neutral-900/80 backdrop-blur-md text-white max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>Read me first</CardTitle>
            <CardDescription className="text-neutral-400">
            This is a working prototype of a platform that could help identify the ideal customer profile, spot potential customers at risk of churn and more... 
            </CardDescription>
          </CardHeader>
          <CardContent>
          <p className="mb-4 text-sm text-neutral-400">
          Currently, the only operational feature is the sentiment analysis you can find it at the cell sentiment inside Companies page, along with its corresponding log on the logs page.
            </p>
            <p className="mb-4 text-sm text-neutral-400">
            Tip: The flashing beacons are the parts of the software that are working, you can hover over them to understand their functionality.
            </p>
            <p className="mb-4 text-sm">
            In this demo, you will impersonate two different users simultaneously:
            </p>
            <p className="mb-4 text-sm text-neutral-400">
              <strong className="text-white">Wordware Customer:</strong> You work at QuantumLeap AI and use Wordware as part of your stack. You have decided to go to their customer support chat – by clicking at the Crisp chat bubble – to express your feelings, challenges, and/or ask for support.
            </p>
            <p className="mb-4 text-sm text-neutral-400">
              <strong className="text-white">Wordware Teammate:</strong> You work at Wordware and today you are focused on determining if some customers are at risk of churning. You begin by analyzing the sentiment and summary of the previous ticket from the company QuantumLeap.
            </p>
            <div className="mb-4 text-xs text-neutral-300">
              <p className="mb-2">Built in 31 hours using:</p>
              <ul className="list-none space-y-1">
                <li>• Framework: Next.js, React, TypeScript</li>
                <li>• UI: Tailwind, shadcn/ui, React DND, Tremor</li>
                <li>• Database: Supabase</li>
                <li>• Infrastructure: Vercel (Hosting & API Routes)</li>
                <li>• Connected Services: Crispchat</li>
                <li>• AI Stack: Wordware.ai</li>
                <li>• Development: Windsurf IDE</li>

              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={onClose}
                variant="default"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ProductTour() {
  const router = useRouter()
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [visibleBeacons, setVisibleBeacons] = useState<BeaconProps['position'][]>(['logs', 'crisp', 'restart'])

  const handleBeaconClick = (position: BeaconProps['position']) => {
    // Remove o beacon clicado da lista de beacons visíveis
    setVisibleBeacons(prev => prev.filter(p => p !== position))

    // Executa a ação específica do beacon
    if (position === 'crisp') {
      // @ts-ignore - Crisp is added via script
      if (window.$crisp) {
        // @ts-ignore
        window.$crisp.push(['do', 'chat:open'])
      }
    } else if (position === 'logs') {
      router.push('/logs')
    } else if (position === 'restart') {
      // Apenas remove o beacon quando clicado
      setVisibleBeacons(prev => prev.filter(p => p !== position))
    }
  }

  return (
    <>
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      {visibleBeacons.map(position => (
        <Beacon
          key={position}
          position={position}
          onClick={() => handleBeaconClick(position)}
          className="cursor-pointer"
        />
      ))}
    </>
  )
}
