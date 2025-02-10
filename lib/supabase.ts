import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Ticket = {
    id: string
    email: string
    created_at: string
    updated_at: string
    sentiment: number | null
}

export type Message = {
    id: string
    ticket_id: string
    content: string
    sentiment: number | null
    created_at: string
}
