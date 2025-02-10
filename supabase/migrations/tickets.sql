-- Create tickets table
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sentiment FLOAT
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sentiment FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update ticket updated_at
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tickets 
    SET updated_at = NEW.created_at
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ticket updated_at when new message is added
CREATE TRIGGER update_ticket_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();

-- Insert sample data
INSERT INTO tickets (email, sentiment) VALUES
    ('john.doe@example.com', 0.8),
    ('alice.smith@example.com', 0.4),
    ('bob.wilson@example.com', 0.2);

INSERT INTO messages (ticket_id, content, sentiment) VALUES
    ((SELECT id FROM tickets WHERE email = 'john.doe@example.com' LIMIT 1), 'Thank you for the quick response!', 0.9),
    ((SELECT id FROM tickets WHERE email = 'john.doe@example.com' LIMIT 1), 'The issue has been resolved.', 0.8),
    ((SELECT id FROM tickets WHERE email = 'alice.smith@example.com' LIMIT 1), 'I am having trouble with the integration.', 0.3),
    ((SELECT id FROM tickets WHERE email = 'bob.wilson@example.com' LIMIT 1), 'This is not working as expected.', 0.2);
