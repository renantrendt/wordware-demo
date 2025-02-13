import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useCompanyLogs(websiteId: string) {
  const [dailyMessageCounts, setDailyMessageCounts] = useState<number[]>([])

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      const thirtyDaysAgo = startOfDay(subDays(new Date(), 30))
      
      const { data: logs } = await supabase
        .from('logs')
        .select('timestamp')
        .eq('website_id', websiteId)
        .eq('source', 'crisp')
        .eq('event_type', 'message:received')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: true })

      // Process logs into daily counts
      const dailyCounts = new Array(30).fill(0)
      
      logs?.forEach(log => {
        const dayIndex = 29 - Math.floor(
          (new Date().getTime() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (dayIndex >= 0 && dayIndex < 30) {
          dailyCounts[dayIndex]++
        }
      })

      setDailyMessageCounts(dailyCounts)
    }

    // Fetch initial data
    fetchData()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('logs-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `website_id=eq.${websiteId} AND source=eq.crisp AND event_type=eq.message:received`
        },
        (payload) => {
          setDailyMessageCounts(prev => {
            const newCounts = [...prev]
            newCounts[29]++ // Increment today's count
            return newCounts
          })
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [websiteId])

  return dailyMessageCounts
}
