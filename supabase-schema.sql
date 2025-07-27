-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'open', 'closed')) DEFAULT 'pending',
    admin_id TEXT,
    subject TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_type TEXT CHECK (sender_type IN ('user', 'admin')) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated_at ON chat_rooms(updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own chat rooms" ON chat_rooms
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all chat rooms" ON chat_rooms
    FOR SELECT USING (true); -- You might want to add admin role check here

CREATE POLICY "Admins can update all chat rooms" ON chat_rooms
    FOR UPDATE USING (true); -- You might want to add admin role check here

-- Create policies for chat_messages
CREATE POLICY "Users can view messages in their chat rooms" ON chat_messages
    FOR SELECT USING (
        chat_room_id IN (
            SELECT id FROM chat_rooms WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create messages in their chat rooms" ON chat_messages
    FOR INSERT WITH CHECK (
        chat_room_id IN (
            SELECT id FROM chat_rooms WHERE user_id = auth.uid()::text
        )
        AND sender_id = auth.uid()::text
    );

CREATE POLICY "Admins can view all messages" ON chat_messages
    FOR SELECT USING (true); -- You might want to add admin role check here

CREATE POLICY "Admins can create messages in any chat room" ON chat_messages
    FOR INSERT WITH CHECK (sender_type = 'admin'); -- You might want to add admin role check here

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages; 