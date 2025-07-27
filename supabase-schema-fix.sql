-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can view all chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can update all chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can create messages in any chat room" ON chat_messages;

-- Temporarily disable RLS to create more permissive policies
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Alternative approach: Create permissive policies that allow operations
-- Enable RLS again
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for chat_rooms
CREATE POLICY "Allow all operations on chat_rooms" ON chat_rooms
    FOR ALL USING (true) WITH CHECK (true);

-- Create more permissive policies for chat_messages  
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages
    FOR ALL USING (true) WITH CHECK (true);

-- If you want to keep some security, use these instead:
-- CREATE POLICY "Users can manage their chat rooms" ON chat_rooms
--     FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- CREATE POLICY "Users can manage messages in their rooms" ON chat_messages
--     FOR ALL USING (
--         chat_room_id IN (
--             SELECT id FROM chat_rooms 
--             WHERE user_id = current_setting('app.current_user_id', true)
--         )
--         OR sender_type = 'admin'
--     ); 