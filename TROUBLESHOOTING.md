# Chat System Troubleshooting

## Error: PGRST116 - "JSON object requested, multiple (or no) rows returned"

**Cause:** This error occurs when using `.single()` on a query that returns 0 rows.

**Solution:** ✅ **FIXED** - Updated queries to use array queries instead of `.single()`:

```typescript
// OLD (causes PGRST116 error):
const { data: existingRoom, error } = await supabase
  .from("chat_rooms")
  .select("*")
  .eq("user_id", user._id)
  .single(); // This fails if no rows found

// NEW (fixed):
const { data: existingRooms, error } = await supabase
  .from("chat_rooms")
  .select("*")
  .eq("user_id", user._id)
  .limit(1); // Returns array, even if empty

if (existingRooms && existingRooms.length > 0) {
  const existingRoom = existingRooms[0];
  // Use the room
}
```

## Error: 42501 - "new row violates row-level security policy"

**Cause:** Row Level Security (RLS) policies are blocking database operations.

**Solutions:**

### Option 1: Disable RLS (Quick Fix for Testing)

Run this in your Supabase SQL Editor:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
```

### Option 2: Use Permissive Policies (Recommended)

Run the `supabase-schema-fix.sql` file in your Supabase SQL Editor:

```sql
-- This creates policies that allow all operations
CREATE POLICY "Allow all operations on chat_rooms" ON chat_rooms
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_messages" ON chat_messages
    FOR ALL USING (true) WITH CHECK (true);
```

### Option 3: Implement Proper Authentication-Based Policies

If you have a proper authentication system, update the policies to use your auth system:

```sql
-- Example with custom auth
CREATE POLICY "Users can manage their chat rooms" ON chat_rooms
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));
```

## Quick Setup Steps

1. **Create Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Run Database Schema**

   - Copy contents of `supabase-schema.sql`
   - Paste in Supabase SQL Editor
   - Execute the script

3. **Fix RLS Issues**

   - Copy contents of `supabase-schema-fix.sql`
   - Paste in Supabase SQL Editor
   - Execute the script

4. **Set Environment Variables**

   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key

5. **Enable Realtime**
   - Go to Database > Replication in Supabase
   - Enable realtime for `chat_rooms` and `chat_messages` tables

## Testing the Chat System

1. **User Side:**

   - Navigate to `/dashboard/support`
   - Type a message to create a chat room
   - Check browser console for errors

2. **Admin Side:**
   - Navigate to `/(admin-portal)_x23p9/support`
   - You should see the chat request in the sidebar
   - Click on it and respond

## Common Issues

### Chat Room Not Creating

- Check browser console for errors
- Verify environment variables are set
- Ensure RLS policies allow INSERT operations

### Messages Not Appearing

- Check if realtime is enabled in Supabase
- Verify WebSocket connection in browser dev tools
- Check for JavaScript errors in console

### Permission Errors

- Review RLS policies
- Consider temporarily disabling RLS for testing
- Ensure user authentication is working

## Database Structure Check

Run this query in Supabase to verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('chat_rooms', 'chat_messages');
```

Should return:

```
chat_rooms
chat_messages
```

## Environment Variables Check

Create a simple test page to verify your environment variables:

```typescript
// Test page to verify Supabase connection
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "Supabase Key:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set"
);
```

## Success Indicators

✅ No console errors when opening `/dashboard/support`
✅ Chat room creates when sending first message
✅ Messages appear in real-time
✅ Admin can see chat requests in admin portal
✅ Admin can respond to messages

If you're still having issues, check:

1. Supabase project is active and not paused
2. Environment variables are correctly set
3. Database tables exist
4. RLS policies are permissive enough for your use case
