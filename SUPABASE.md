# Supabase Setup Instructions

1. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. Go to your Supabase project's Database settings:
   - Navigate to Database > Replication
   - Enable real-time for both `tickets` and `messages` tables

3. Go to your Supabase project's SQL editor

4. Copy and paste the contents of `supabase/migrations/tickets.sql` into the SQL editor

5. Run the SQL queries to create the tables and insert sample data

6. Start the development server:
```bash
npm run dev
```

The Ticket Summary page will be available at `/tickets`

## Testing Real-time Updates

You can test the real-time functionality by inserting new records directly in the Supabase dashboard:

1. Go to Table Editor
2. Select the `tickets` table
3. Click "Insert Row" and add a new ticket
4. The new ticket should appear instantly in your app
5. Similarly, you can add messages to an existing ticket to test message updates
