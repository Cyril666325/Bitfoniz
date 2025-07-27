// Re-export from the new client manager
export * from './supabase-client';

// Database types for TypeScript
export interface ChatRoom {
  id: string;
  user_id: string;
  user_email: string;
  status: "open" | "closed" | "pending";
  created_at: string;
  updated_at: string;
  admin_id?: string;
  subject?: string;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: "user" | "admin";
  message: string;
  created_at: string;
  is_read: boolean;
}
