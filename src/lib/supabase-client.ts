import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

class SupabaseManager {
  private static instance: SupabaseClient | null = null;

  static getClient(): SupabaseClient {
    if (!this.instance) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are not configured');
      }

      this.instance = createClient(supabaseUrl, supabaseAnonKey);
    }

    return this.instance;
  }

  static isAvailable(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
}

// Export the manager and a convenience function
export const getSupabaseClient = () => SupabaseManager.getClient();
export const isSupabaseAvailable = () => SupabaseManager.isAvailable();

// For backward compatibility - only create when actually needed
export const supabase = (() => {
  try {
    return SupabaseManager.isAvailable() ? SupabaseManager.getClient() : null;
  } catch (error) {
    console.warn('Supabase not available during build:', error);
    return null;
  }
})(); 