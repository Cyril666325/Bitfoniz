"use client";

import { useUser } from "@/context/UserContext";
import { ChatMessage, ChatRoom, supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Minimize2, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const LiveChat = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
      // Check if user has an existing open chat room (use array query instead of single)
      const { data: existingRooms, error: roomError } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("user_id", user._id)
        .eq("status", "open")
        .limit(1);

      if (roomError) {
        console.error("Error fetching chat room:", roomError);
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

      setMessages((prev) => [...prev, data]);
      setNewMessage("");

      // Update chat room status to open if it was pending
      if (chatRoom.status === "pending") {
        await supabase
          .from("chat_rooms")
          .update({ status: "open" })
          .eq("id", chatRoom.id);

        setChatRoom((prev) => (prev ? { ...prev, status: "open" } : null));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!chatRoom) return;

    const channel = supabase
      .channel(`chat_room_${chatRoom.id}`)
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
          // Only add messages from other users (admins), not from current user
          if (newMessage.sender_id !== user?._id) {
            setMessages((prev) => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(
                (msg) => msg.id === newMessage.id
              );
              if (messageExists) {
                return prev;
              }
              return [...prev, newMessage];
            });

            // Show typing indicator for admin messages
            if (newMessage.sender_type === "admin") {
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 1000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoom, user]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !chatRoom && user) {
      initializeChatRoom();
    }
  }, [isOpen, user]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-28 right-6 z-50 w-16 h-16 bg-[#3AEBA5] text-black rounded-full shadow-lg flex items-center justify-center ${
          isOpen ? "hidden" : "flex"
        }`}
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 60 : 500,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-80 mx-auto w-full bg-[#181818] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#202020] border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3AEBA5]/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#3AEBA5]" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Support Chat</h3>
                  <p className="text-xs text-gray-400">
                    {chatRoom?.status === "pending"
                      ? "Connecting..."
                      : chatRoom?.status === "open"
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Minimize2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 h-80 overflow-y-auto bg-[#0A0A0A]">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p>Start a conversation with our support team</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              message.sender_type === "user"
                                ? "bg-[#3AEBA5] text-black"
                                : "bg-[#282828] text-white"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_type === "user"
                                  ? "text-black/70"
                                  : "text-gray-400"
                              }`}
                            >
                              {new Date(
                                message.created_at
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-[#282828] text-white px-4 py-2 rounded-2xl">
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
                <div className="p-4 bg-[#202020] border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3AEBA5]"
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="p-2 bg-[#3AEBA5] text-black rounded-lg hover:bg-[#2ed194] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;
