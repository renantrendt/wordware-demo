export interface Database {
  public: {
    Tables: {
      logs: {
        Row: {
          id: string
          timestamp: string
          source: string
          event_type: string
          session_id?: string
          user_id?: string
          user_nickname?: string
          message_type?: string
          message_content?: string
          website_id?: string
          payload: any
        }
        Insert: {
          id?: string
          timestamp?: string
          source: string
          event_type: string
          session_id?: string
          user_id?: string
          user_nickname?: string
          message_type?: string
          message_content?: string
          website_id?: string
          payload: any
        }
        Update: {
          id?: string
          timestamp?: string
          source?: string
          event_type?: string
          session_id?: string
          user_id?: string
          user_nickname?: string
          message_type?: string
          message_content?: string
          website_id?: string
          payload?: any
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
