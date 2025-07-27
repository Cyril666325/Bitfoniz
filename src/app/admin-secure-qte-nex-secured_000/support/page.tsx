"use client";

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Menu,
  ArrowLeft,
  X,
} from "lucide-react";
import { supabase, ChatRoom, ChatMessage } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { markAllExistingMessagesAsRead } from "@/utils/adminUtils";
import { toast } from "sonner";

const AdminSupportPage = () => {
  const { user } = useUser();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [roomUnreadCounts, setRoomUnreadCounts] = useState<
    Record<string, number>
  >({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, show sidebar by default if no room is selected
      if (mobile && !selectedRoom) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [selectedRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all chat rooms
  const loadChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading chat rooms:", error);
        return;
      }

      setChatRooms(data || []);

      // Load unread counts for each room (only count recent messages)
      if (data) {
        const unreadCounts: Record<string, number> = {};
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        for (const room of data) {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_room_id", room.id)
            .eq("sender_type", "user")
            .eq("is_read", false)
            .gte("created_at", sevenDaysAgo.toISOString());

          unreadCounts[room.id] = count || 0;
        }
        setRoomUnreadCounts(unreadCounts);
      }
    } catch (error) {
      console.error("Error loading chat rooms:", error);
    }
  };

  // Load messages for selected chat room
  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      setMessages(data || []);

      // Mark all user messages in this room as read since admin is viewing them
      const { error: updateError } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("chat_room_id", roomId)
        .eq("sender_type", "user")
        .eq("is_read", false);

      if (!updateError) {
        // Update the unread count for this room to 0
        setRoomUnreadCounts((prev) => ({
          ...prev,
          [roomId]: 0,
        }));
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Send a message as admin
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([
          {
            chat_room_id: selectedRoom.id,
            sender_id: user._id,
            sender_type: "admin",
            message: newMessage.trim(),
            is_read: true, // Admin messages are always marked as read
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return;
      }

      // Only add the message if it's not already in the list
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
      setNewMessage("");

      // Update chat room status and assign admin
      await supabase
        .from("chat_rooms")
        .update({
          status: "open",
          admin_id: user._id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRoom.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Handle room selection (close sidebar on mobile)
  const handleRoomSelect = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.id); // Load messages immediately when selecting a room
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handle back to chat list on mobile
  const handleBackToList = () => {
    setSelectedRoom(null);
    if (isMobile) {
      setSidebarOpen(true);
    }
  };

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    loadChatRooms();

    if (window.innerWidth < 768) {
      setSidebarOpen(true);
    }

    // Subscribe to chat room updates
    const roomChannel = supabase
      .channel("admin_chat_rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_rooms",
        },
        () => {
          loadChatRooms(); // Refresh chat rooms list when any room changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, []);

  // Set up real-time subscription for messages when a room is selected
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]); // Clear messages when no room is selected
      return;
    }

    // Load initial messages
    loadMessages(selectedRoom.id);

    // Subscribe to new messages for the selected room
    const messageChannel = supabase
      .channel(`admin_room_${selectedRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${selectedRoom.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Only add messages from others (users)
          if (newMessage.sender_id !== user?._id) {
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some((msg) => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });

            // Mark user messages as read immediately since admin is viewing them
            if (newMessage.sender_type === "user") {
              await supabase
                .from("chat_messages")
                .update({ is_read: true })
                .eq("id", newMessage.id);

              // Refresh chat rooms to update unread counts
              loadChatRooms();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [selectedRoom?.id, user]); // Changed dependency from selectedRoom to selectedRoom?.id

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isMobile) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleString();
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Chat Rooms List */}
      <div
        className={`
        ${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-1/3 lg:w-1/4"
        } 
        bg-[#181818] border-r border-gray-800 flex flex-col
      `}
      >
        <div className="p-4 md:p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg md:text-xl font-bold cursor-pointer select-none"
              onClick={async (e) => {
                // Triple-click to trigger cleanup
                if (e.detail === 3) {
                  const result = await markAllExistingMessagesAsRead();
                  if (result.success) {
                    toast.success(
                      `Marked ${result.count} old messages as read`
                    );
                    loadChatRooms(); // Refresh the chat rooms
                  } else {
                    toast.error("Failed to cleanup messages");
                  }
                }
              }}
              title="Triple-click to cleanup old unread messages"
            >
              Support Chats
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadChatRooms}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>
                Pending:{" "}
                {chatRooms.filter((r) => r.status === "pending").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Active: {chatRooms.filter((r) => r.status === "open").length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="p-4 md:p-6 text-center text-gray-500">
              <MessageSquare className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-sm md:text-base">No chat requests yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2 md:p-4">
              {chatRooms.map((room) => {
                const unreadCount = roomUnreadCounts[room.id] || 0;
                return (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: isMobile ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoomSelect(room)}
                    className={`p-3 md:p-4 rounded-xl cursor-pointer transition-colors relative ${
                      selectedRoom?.id === room.id
                        ? "bg-[#3AEBA5]/10 border border-[#3AEBA5]/30"
                        : "bg-[#202020] hover:bg-[#252525] active:bg-[#252525]"
                    }`}
                  >
                    {unreadCount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getStatusIcon(room.status)}
                        <span className="font-medium truncate text-sm md:text-base">
                          {room.user_email}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(room.updated_at)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                      {room.subject || "General Support"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          room.status === "open"
                            ? "bg-green-500/20 text-green-400"
                            : room.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {room.status}
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-xs text-red-400 font-medium">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 bg-[#202020] border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  {isMobile && (
                    <button
                      onClick={handleBackToList}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#3AEBA5]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-[#3AEBA5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">
                      {selectedRoom.user_email}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                      {selectedRoom.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(selectedRoom.status)}
                  <span className="text-xs md:text-sm capitalize hidden sm:inline">
                    {selectedRoom.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-[#0A0A0A]">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 md:mt-20">
                  <Bot className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-gray-600" />
                  <p className="text-sm md:text-base">
                    No messages in this chat yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.sender_type === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 md:px-6 py-3 md:py-4 rounded-2xl ${
                          message.sender_type === "admin"
                            ? "bg-[#3AEBA5] text-black"
                            : "bg-[#282828] text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.sender_type === "admin" ? (
                            <Bot className="w-3 h-3 md:w-4 md:h-4" />
                          ) : (
                            <User className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                          <span className="text-xs md:text-sm font-medium">
                            {message.sender_type === "admin"
                              ? "You (Admin)"
                              : "Customer"}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm leading-relaxed">
                          {message.message}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.sender_type === "admin"
                              ? "text-black/70"
                              : "text-gray-400"
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            {selectedRoom.status !== "closed" && (
              <div className="p-3 md:p-6 bg-[#202020] border-t border-gray-800">
                <div className="flex items-center gap-2 md:gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-[#0A0A0A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#3AEBA5] text-sm md:text-base"
                    disabled={loading}
                  />
                  <motion.button
                    whileHover={{ scale: isMobile ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-4 md:px-6 py-2 md:py-3 bg-[#3AEBA5] text-black rounded-xl hover:bg-[#2ed194] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm md:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0A] p-4">
            {isMobile ? (
              <div className="text-center text-gray-500 w-full">
                <div className="mb-6">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">Support Chat</h3>
                  <p className="text-sm mb-6">
                    Select a chat from the list to start responding to customers
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full max-w-xs mx-auto p-4 bg-[#3AEBA5] text-black rounded-xl hover:bg-[#2ed194] transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Menu className="w-5 h-5" />
                  {chatRooms.length > 0
                    ? `View ${chatRooms.length} Chat${
                        chatRooms.length !== 1 ? "s" : ""
                      }`
                    : "View Chat Requests"}
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">Select a Chat</h3>
                <p>
                  Choose a chat from the sidebar to start responding to
                  customers
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportPage;
