import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      // Count unread messages from users (not admin messages) created in the last 7 days
      // This helps avoid counting very old messages that might not have been properly marked as read
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count, error } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("sender_type", "user")
        .gte("created_at", sevenDaysAgo.toISOString());

      if (error) {
        console.error("Error fetching unread messages:", error);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to mark all old messages as read (cleanup function)
  const markAllOldMessagesAsRead = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("sender_type", "user")
        .eq("is_read", false)
        .lt("created_at", sevenDaysAgo.toISOString());

      if (error) {
        console.error("Error marking old messages as read:", error);
        return false;
      }

      // Refresh count after cleanup
      await fetchUnreadCount();
      return true;
    } catch (error) {
      console.error("Error marking old messages as read:", error);
      return false;
    }
  };

  useEffect(() => {
    // Initial cleanup of old messages and fetch
    const initializeUnreadMessages = async () => {
      await markAllOldMessagesAsRead();
      await fetchUnreadCount();
    };

    initializeUnreadMessages();

    // Set up real-time subscription for chat messages
    const channel = supabase
      .channel("unread_messages")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          // Refresh count when messages change
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount,
    markAllOldMessagesAsRead,
  };
};
