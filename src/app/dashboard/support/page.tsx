"use client";

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, MessageSquare, AlertCircle } from "lucide-react";
import { supabase, ChatRoom, ChatMessage } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

const SupportPage = () => {
  const { user } = useUser();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get or create chat room
  const initializeChatRoom = async () => {
    if (!user) return;

    try {
      // Check if user has an existing chat room (use array query instead of single)
      const { data: existingRooms, error: roomError } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("user_id", user._id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (roomError) {
        console.error("Error fetching chat room:", roomError);
        toast.error("Failed to load chat room");
        return;
      }

      if (existingRooms && existingRooms.length > 0) {
        const existingRoom = existingRooms[0];
        setChatRoom(existingRoom);
        loadMessages(existingRoom.id);
      } else {
        // Create new chat room
        const { data: newRoom, error: createError } = await supabase
          .from("chat_rooms")
          .insert([
            {
              user_id: user._id,
              user_email: user.email,
              status: "pending",
              subject: "General Support",
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("Error creating chat room:", createError);
          toast.error("Failed to start chat");
          return;
        }

        setChatRoom(newRoom);
      }
    } catch (error) {
      console.error("Error initializing chat room:", error);
      toast.error("Failed to initialize chat");
    }
  };

  // Load messages for the chat room
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
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!chatRoom) return;

    // Subscribe to messages for this chat room
    const messageChannel = supabase
      .channel(`room_${chatRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${chatRoom.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add messages from others (admin)
          if (newMessage.sender_id !== user?._id) {
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some((msg) => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });

            // Mark admin messages as read immediately since user is viewing them
            if (newMessage.sender_type === "admin") {
              void (async () => {
                try {
                  await supabase
                    .from("chat_messages")
                    .update({ is_read: true })
                    .eq("id", newMessage.id);
                  console.log("Marked admin message as read");
                } catch (err: unknown) {
                  const error = err as Error;
                  console.error("Error marking message as read:", error);
                }
              })();

              // Show typing indicator
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 1000);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to chat room status changes
    const roomChannel = supabase
      .channel(`room_status_${chatRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_rooms",
          filter: `id=eq.${chatRoom.id}`,
        },
        (payload) => {
          const updatedRoom = payload.new as ChatRoom;
          setChatRoom(updatedRoom);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [chatRoom, user]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([
          {
            chat_room_id: chatRoom.id,
            sender_id: user._id,
            sender_type: "user",
            message: newMessage.trim(),
            is_read: false,
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

      // Update chat room status to open if it was pending
      if (chatRoom.status === "pending") {
        const { error: updateError } = await supabase
          .from("chat_rooms")
          .update({
            status: "open",
            updated_at: new Date().toISOString(),
          })
          .eq("id", chatRoom.id);

        if (!updateError) {
          setChatRoom((prev) => (prev ? { ...prev, status: "open" } : null));
        }
      } else {
        // Just update the timestamp
        await supabase
          .from("chat_rooms")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", chatRoom.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Initialize chat when component mounts
  useEffect(() => {
    if (user) {
      initializeChatRoom();
    }
  }, [user]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0A0A0A] mt-4 md:p-6">
      <div className="max-w-[1200px] mx-auto w-full h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#181818] rounded-2xl h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#3AEBA5]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Live Support Chat</h1>
                <p className="text-sm text-gray-400">
                  {chatRoom?.status === "pending"
                    ? "Waiting for support agent..."
                    : chatRoom?.status === "open"
                    ? "Connected with support"
                    : "Chat session ended"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  chatRoom?.status === "open"
                    ? "bg-green-500"
                    : chatRoom?.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              ></div>
              <span className="text-sm text-gray-400">
                {chatRoom?.status === "open"
                  ? "Online"
                  : chatRoom?.status === "pending"
                  ? "Connecting"
                  : "Offline"}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#0A0A0A] rounded-b-2xl">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <Bot className="w-16 h-16 mx-auto mb-6 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">
                  Welcome to Support
                </h3>
                <p className="text-gray-400 mb-6">
                  Our support team is here to help you with any questions or
                  issues.
                </p>
                <div className="bg-[#282828] rounded-xl p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-[#3AEBA5]" />
                    <span className="font-medium">Quick Tips</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1 text-left">
                    <li>• Be specific about your issue</li>
                    <li>• Include error messages if any</li>
                    <li>• Mention what you were trying to do</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.sender_type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-6 py-4 rounded-2xl ${
                        message.sender_type === "user"
                          ? "bg-[#3AEBA5] text-black"
                          : "bg-[#282828] text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.sender_type === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {message.sender_type === "user"
                            ? "You"
                            : "Support Agent"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {message.message}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender_type === "user"
                            ? "text-black/70"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#282828] text-white px-6 py-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Support Agent
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-6 bg-[#202020] border-t border-gray-800 rounded-b-2xl">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#3AEBA5]"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
                className="px-6 py-3 bg-[#3AEBA5] text-black rounded-xl hover:bg-[#2ed194] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportPage;
