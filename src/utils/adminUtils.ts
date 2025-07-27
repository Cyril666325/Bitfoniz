import { supabase } from "@/lib/supabase";

// Utility function to mark all existing messages as read
// This can be run once to clean up existing unread messages
export const markAllExistingMessagesAsRead = async () => {
  try {
    console.log("Starting cleanup of all existing unread messages...");

    // Mark all user messages as read (one-time cleanup)
    const { error, count } = await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("sender_type", "user")
      .eq("is_read", false);

    if (error) {
      console.error("Error marking messages as read:", error);
      return { success: false, error };
    }

    console.log(`Successfully marked ${count || 0} messages as read`);
    return { success: true, count };
  } catch (error) {
    console.error("Error in cleanup function:", error);
    return { success: false, error };
  }
};

// Function to get unread message statistics
export const getUnreadMessageStats = async () => {
  try {
    const { count, error } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_type", "user")
      .eq("is_read", false);

    if (error) {
      console.error("Error getting unread stats:", error);
      return null;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting unread stats:", error);
    return null;
  }
};
