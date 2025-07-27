# Live Chat System Setup

This guide will help you set up the live chat system using Supabase for real-time messaging between users and admin support.

## Prerequisites

1. A Supabase account and project
2. Node.js and npm installed
3. The BITFONIZ application running

## Setup Steps

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
4. Run the SQL script to create the necessary tables and policies

### 2. Environment Variables

1. In your Supabase project dashboard, go to Settings > API
2. Copy your Project URL and anon public key
3. Create a `.env.local` file in your project root (if it doesn't exist)
4. Add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Enable Realtime

1. In your Supabase dashboard, go to Database > Replication
2. Enable realtime for the `chat_rooms` and `chat_messages` tables
3. This allows for real-time updates when new messages are sent

### 4. Row Level Security (Optional)

The schema includes basic RLS policies, but you may want to customize them based on your authentication system:

- Update the policies to check for admin roles if you have a role-based system
- Modify the `auth.uid()` references to match your user ID system

## Features

### For Users (`/dashboard/support`)

- **Live Chat Interface**: Full-screen chat interface for customer support
- **Real-time Messaging**: Messages appear instantly without page refresh
- **Chat Status**: Shows connection status (Connecting, Online, Offline)
- **Message History**: All previous messages are loaded when returning to chat
- **Typing Indicators**: Shows when support agents are typing

### For Admins (`/(admin-portal)_x23p9/support`)

- **Chat Room Management**: View all active, pending, and closed chats
- **Multi-Chat Support**: Handle multiple customer chats simultaneously
- **Real-time Notifications**: New chat requests appear immediately
- **Chat Assignment**: Admins are automatically assigned when they respond
- **Status Management**: Mark chats as open or closed
- **Customer Information**: View customer email and chat subject

### Floating Chat Widget

- **Always Accessible**: Chat button appears on all dashboard pages
- **Minimizable**: Can be minimized while staying accessible
- **Persistent**: Maintains chat state across page navigation

## Database Schema

### chat_rooms

- `id`: Unique identifier for each chat session
- `user_id`: ID of the user who started the chat
- `user_email`: Email of the user for admin reference
- `status`: Current status (pending, open, closed)
- `admin_id`: ID of the admin handling the chat (if assigned)
- `subject`: Chat subject/topic
- `created_at`: When the chat was created
- `updated_at`: Last activity timestamp

### chat_messages

- `id`: Unique identifier for each message
- `chat_room_id`: Reference to the chat room
- `sender_id`: ID of the message sender
- `sender_type`: Type of sender (user or admin)
- `message`: The actual message content
- `is_read`: Whether the message has been read
- `created_at`: When the message was sent

## Usage

### Starting a Chat (User)

1. Navigate to `/dashboard/support` or click the floating chat button
2. Type a message to automatically create a new chat room
3. The chat status will show "Connecting..." until an admin responds
4. Once an admin responds, the status changes to "Online"

### Responding to Chats (Admin)

1. Navigate to `/(admin-portal)_x23p9/support`
2. View all chat requests in the sidebar
3. Click on a chat to view the conversation
4. Type and send responses to help customers
5. Close chats when the issue is resolved

## Troubleshooting

### Common Issues

1. **Messages not appearing in real-time**

   - Check that realtime is enabled for both tables in Supabase
   - Verify environment variables are correct
   - Check browser console for WebSocket connection errors

2. **Permission errors**

   - Review RLS policies in Supabase
   - Ensure user authentication is working properly
   - Check that user IDs match between your auth system and the chat system

3. **Chat rooms not creating**
   - Verify the user is authenticated
   - Check that the user ID is being passed correctly
   - Review browser console for API errors

### Performance Optimization

- The system includes database indexes for optimal query performance
- Messages are loaded only for the selected chat room
- Real-time subscriptions are properly cleaned up when components unmount

## Security Considerations

- All database access is protected by Row Level Security (RLS)
- Users can only access their own chat rooms
- Admins have broader access but should be properly authenticated
- Consider implementing additional admin role checks in the RLS policies

## Future Enhancements

Potential improvements you could implement:

1. **File Uploads**: Allow users to send screenshots or documents
2. **Typing Indicators**: Show when users are typing
3. **Message Read Receipts**: Track when messages are read
4. **Chat Ratings**: Allow users to rate their support experience
5. **Automated Responses**: Implement chatbots for common questions
6. **Push Notifications**: Notify admins of new chat requests
7. **Chat Archives**: Long-term storage and search of chat history
