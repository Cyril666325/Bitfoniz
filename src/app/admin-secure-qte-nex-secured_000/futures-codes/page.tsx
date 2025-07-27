"use client";

import { getFuturesOrders, submitFuturesOrder } from "@/services/admin";
import {
  Activity,
  CheckCircle,
  Code,
  Copy,
  DollarSign,
  Eye,
  Filter,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface FuturesOrder {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  symbol: string;
  orderId: string;
  side: number; // 0 for long/buy, 1 for short/sell
  type: string;
  leverage: string;
  open_type: string;
  size: number;
  limit_price: number;
  trigger_price: string;
  executive_price: string;
  price_way: number;
  price_type: number;
  mode: number;
  status: string;
  executed_quantity: number;
  executed_price?: string;
  executed_at?: string;
  fees: number;
  total_cost: number;
  owner: boolean;
  copyCode: string;
  isActive: boolean;
  followers: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  displayName: string;
  price: number;
  change24h: number;
  volume24h: number;
  maxLeverage: number;
}

const tradingPairs: TradingPair[] = [
  {
    symbol: "BTCUSDT",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    displayName: "BTC/USDT",
    price: 64000,
    change24h: 2.5,
    volume24h: 1234567,
    maxLeverage: 125,
  },
  {
    symbol: "ETHUSDT",
    baseAsset: "ETH",
    quoteAsset: "USDT",
    displayName: "ETH/USDT",
    price: 3450,
    change24h: -1.2,
    volume24h: 987654,
    maxLeverage: 100,
  },
  {
    symbol: "BNBUSDT",
    baseAsset: "BNB",
    quoteAsset: "USDT",
    displayName: "BNB/USDT",
    price: 595,
    change24h: 0.8,
    volume24h: 456789,
    maxLeverage: 50,
  },
  {
    symbol: "ADAUSDT",
    baseAsset: "ADA",
    quoteAsset: "USDT",
    displayName: "ADA/USDT",
    price: 0.45,
    change24h: 3.2,
    volume24h: 234567,
    maxLeverage: 50,
  },
  {
    symbol: "SOLUSDT",
    baseAsset: "SOL",
    quoteAsset: "USDT",
    displayName: "SOL/USDT",
    price: 145.5,
    change24h: -2.1,
    volume24h: 345678,
    maxLeverage: 50,
  },
  {
    symbol: "XRPUSDT",
    baseAsset: "XRP",
    quoteAsset: "USDT",
    displayName: "XRP/USDT",
    price: 0.52,
    change24h: 1.8,
    volume24h: 567890,
    maxLeverage: 50,
  },
  {
    symbol: "DOTUSDT",
    baseAsset: "DOT",
    quoteAsset: "USDT",
    displayName: "DOT/USDT",
    price: 7.25,
    change24h: -0.5,
    volume24h: 123456,
    maxLeverage: 50,
  },
  {
    symbol: "DOGEUSDT",
    baseAsset: "DOGE",
    quoteAsset: "USDT",
    displayName: "DOGE/USDT",
    price: 0.08,
    change24h: 4.2,
    volume24h: 678901,
    maxLeverage: 25,
  },
  {
    symbol: "AVAXUSDT",
    baseAsset: "AVAX",
    quoteAsset: "USDT",
    displayName: "AVAX/USDT",
    price: 35.8,
    change24h: 1.5,
    volume24h: 234567,
    maxLeverage: 50,
  },
  {
    symbol: "MATICUSDT",
    baseAsset: "MATIC",
    quoteAsset: "USDT",
    displayName: "MATIC/USDT",
    price: 0.92,
    change24h: -1.8,
    volume24h: 345678,
    maxLeverage: 50,
  },
  {
    symbol: "LINKUSDT",
    baseAsset: "LINK",
    quoteAsset: "USDT",
    displayName: "LINK/USDT",
    price: 14.5,
    change24h: 2.3,
    volume24h: 456789,
    maxLeverage: 50,
  },
  {
    symbol: "LTCUSDT",
    baseAsset: "LTC",
    quoteAsset: "USDT",
    displayName: "LTC/USDT",
    price: 85.2,
    change24h: -0.8,
    volume24h: 123456,
    maxLeverage: 50,
  },
  {
    symbol: "BCHUSDT",
    baseAsset: "BCH",
    quoteAsset: "USDT",
    displayName: "BCH/USDT",
    price: 425.0,
    change24h: 1.2,
    volume24h: 234567,
    maxLeverage: 50,
  },
  {
    symbol: "UNIUSDT",
    baseAsset: "UNI",
    quoteAsset: "USDT",
    displayName: "UNI/USDT",
    price: 8.75,
    change24h: -2.5,
    volume24h: 345678,
    maxLeverage: 25,
  },
  {
    symbol: "ATOMUSDT",
    baseAsset: "ATOM",
    quoteAsset: "USDT",
    displayName: "ATOM/USDT",
    price: 9.5,
    change24h: 3.1,
    volume24h: 456789,
    maxLeverage: 50,
  },
];

const FuturesCodesPage: React.FC = () => {
  const [orders, setOrders] = useState<FuturesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string>("BTCUSDT");
  const [orderType, setOrderType] = useState<"long" | "short">("long");
  const [price, setPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [leverage, setLeverage] = useState<string>("1");
  const [triggerPrice, setTriggerPrice] = useState<string>("");
  const [expiration, setExpiration] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FuturesOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<FuturesOrder | null>(null);

  const currentPair = tradingPairs.find((p) => p.symbol === selectedPair);

  // Generate uppercase trading code
  const generateTradingCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Calculate display expiration from expiration time
  const calculateDisplayExpiration = (expirationTime: string): string => {
    const now = new Date();
    const expirationDate = new Date();

    if (expirationTime.endsWith("m")) {
      // Handle minutes (e.g., "5m", "10m", "15m", "30m")
      const minutes = parseInt(expirationTime.replace("m", ""));
      expirationDate.setMinutes(now.getMinutes() + minutes);
    } else if (expirationTime === "1h") {
      expirationDate.setHours(now.getHours() + 1);
    } else if (expirationTime === "2h") {
      expirationDate.setHours(now.getHours() + 2);
    } else if (expirationTime === "4h") {
      expirationDate.setHours(now.getHours() + 4);
    } else if (expirationTime === "8h") {
      expirationDate.setHours(now.getHours() + 8);
    } else if (expirationTime === "12h") {
      expirationDate.setHours(now.getHours() + 12);
    } else if (expirationTime === "24h") {
      expirationDate.setHours(now.getHours() + 24);
    } else if (expirationTime === "3d") {
      expirationDate.setDate(now.getDate() + 3);
    } else if (expirationTime === "7d") {
      expirationDate.setDate(now.getDate() + 7);
    } else {
      // Default to 24 hours if unrecognized format
      expirationDate.setHours(now.getHours() + 24);
    }

    return expirationDate.toISOString();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getFuturesOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching futures orders:", error);
      toast.error("Failed to fetch futures orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.copyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Auto-populate price when pair changes
  useEffect(() => {
    if (currentPair) {
      setPrice(currentPair.price.toString());
      setTriggerPrice(currentPair.price.toString());
    }
  }, [currentPair]);

  const handleCreateOrder = async () => {
    if (!price || !size || !leverage) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Generate uppercase trading code
    const tradingCode = generateTradingCode();

    // Use custom expiration or default to 24 hours from now
    const expirationTime = expiration || "24h";
    const displayExpiration = calculateDisplayExpiration(expirationTime);

    setIsSubmitting(true);
    try {
      const response = await submitFuturesOrder(
        selectedPair,
        orderType === "long" ? "buy" : "sell", // side: "buy" for long, "sell" for short
        parseFloat(size), // quantity
        parseFloat(price), // price
        "limit", // type
        0, // notional (calculated on backend)
        expirationTime, // expiration
        displayExpiration, // displayExpiration
        parseFloat(price), // limit_price
        leverage, // leverage as string
        parseFloat(price), // open_price
        "limit", // open_type
        parseFloat(size), // size
        parseFloat(triggerPrice || price), // trigger_price
        "market", // execution_price
        1, // price_way
        1, // price_type
        tradingCode // Pass the generated code to the backend
      );

      if (response.success) {
        setCreatedOrder(response.data);
        toast.success(
          response.message || "Futures order created successfully!"
        );
        await fetchOrders(); // Refresh orders list
        resetForm();
      } else {
        toast.error("Failed to create futures order");
      }
    } catch (error: unknown) {
      console.error("Error creating futures order:", error);
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          apiError.response?.data?.message || "Error creating futures order"
        );
      } else {
        toast.error("Error creating futures order");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPrice(currentPair?.price.toString() || "");
    setSize("");
    setLeverage("1");
    setTriggerPrice(currentPair?.price.toString() || "");
    setExpiration("");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-600 text-white",
      completed: "bg-green-600 text-white",
      cancelled: "bg-red-600 text-white",
      pending_profit: "bg-blue-600 text-white",
      partial_cancelled: "bg-orange-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-600 text-white"
        }`}
      >
        {status
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </span>
    );
  };

  const copyToClipboard = (text: string, label: string = "Text") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareToWhatsApp = (order: FuturesOrder) => {
    const sideText = order.side === 0 ? "Long" : "Short";
    const message = `🚀 *BITFONIZ - Futures Trading Signal* 🚀\n\n📊 *Trading Code:* ${
      order.copyCode
    }\n💰 *Pair:* ${
      order.symbol
    }\n📈 *Position:* ${sideText}\n💵 *Trigger Price:* $${
      order.trigger_price
    }\n📦 *Size:* ${order.size}\n⚡ *Leverage:* ${
      order.leverage
    }x\n💎 *Total Value:* $${(
      parseFloat(order.trigger_price) *
      order.size *
      parseFloat(order.leverage)
    ).toLocaleString()}\n\n📝 *Description:* ${
      order.type === "limit" ? "Limit Order" : "Market Order"
    }\n\n⏰ *Created:* ${new Date(
      order.createdAt
    ).toLocaleString()}\n\n🔗 Join BITFONIZ for more signals!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareToTelegram = (order: FuturesOrder) => {
    const sideText = order.side === 0 ? "Long" : "Short";
    const message = `🚀 *BITFONIZ - Futures Trading Signal* 🚀\n\n📊 *Trading Code:* ${
      order.copyCode
    }\n💰 *Pair:* ${
      order.symbol
    }\n📈 *Position:* ${sideText}\n💵 *Trigger Price:* $${
      order.trigger_price
    }\n📦 *Size:* ${order.size}\n⚡ *Leverage:* ${
      order.leverage
    }x\n💎 *Total Value:* $${(
      parseFloat(order.trigger_price) *
      order.size *
      parseFloat(order.leverage)
    ).toLocaleString()}\n\n📝 *Description:* ${
      order.type === "limit" ? "Limit Order" : "Market Order"
    }\n\n⏰ *Created:* ${new Date(
      order.createdAt
    ).toLocaleString()}\n\n🔗 Join BITFONIZ for more signals!`;
    const telegramUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(
      message
    )}`;
    window.open(telegramUrl, "_blank");
  };

  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter((o) => o.status === "pending").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalValue: orders.reduce(
      (sum, order) => sum + parseFloat(order.trigger_price) * order.size,
      0
    ),
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            VIP Trading
          </h1>
          <p className="text-gray-400 mt-2">
            Create and manage futures trading codes with leverage
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Futures Order</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4 md:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Total Orders</p>
              <h3 className="text-lg md:text-2xl font-bold text-white">
                {stats.totalOrders}
              </h3>
            </div>
          </div>
          <div className="mt-2 md:mt-4">
            <p className="text-white font-semibold text-sm">All Time</p>
            <p className="text-gray-400 text-xs">Generated orders</p>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4 md:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Active Orders</p>
              <h3 className="text-lg md:text-2xl font-bold text-white">
                {stats.activeOrders}
              </h3>
            </div>
          </div>
          <div className="mt-2 md:mt-4">
            <p className="text-white font-semibold text-sm">Available</p>
            <p className="text-green-400 text-xs">Ready to use</p>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4 md:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Completed</p>
              <h3 className="text-lg md:text-2xl font-bold text-white">
                {stats.completedOrders}
              </h3>
            </div>
          </div>
          <div className="mt-2 md:mt-4">
            <p className="text-white font-semibold text-sm">Used Orders</p>
            <p className="text-purple-400 text-xs">Successful trades</p>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4 md:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Total Value</p>
              <h3 className="text-lg md:text-2xl font-bold text-white">
                ${stats.totalValue.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="mt-2 md:mt-4">
            <p className="text-white font-semibold text-sm">Trade Volume</p>
            <p className="text-yellow-400 text-xs">All orders combined</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search futures orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending_profit">Pending Profit</option>
              <option value="partial_cancelled">Partial Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2A2D36] border-b border-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Leverage
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Copy Code
                </th>
                <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 md:px-6 py-4 text-center text-gray-400"
                  >
                    Loading futures orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 md:px-6 py-4 text-center text-gray-400"
                  >
                    No futures orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-[#2A2D36] transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-white">
                          {order.symbol}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Size: {order.size} @ ${order.trigger_price}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-white">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        {order.side === 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-2" />
                        )}
                        <span className="text-sm text-white">
                          {order.side === 0 ? "Long" : "Short"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-sm font-medium text-yellow-400">
                        {order.leverage}x
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-700 px-2 py-1 rounded text-xs text-green-400">
                          {order.copyCode}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(order.copyCode, "Copy code")
                          }
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareToWhatsApp(order)}
                          className="p-2 text-green-400 hover:bg-green-400/10 rounded transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareToTelegram(order)}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Create Futures Order
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Trading Pair Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trading Pair
                  </label>
                  <select
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    {tradingPairs.map((pair) => (
                      <option key={pair.symbol} value={pair.symbol}>
                        {pair.displayName} - ${pair.price.toLocaleString()} (Max{" "}
                        {pair.maxLeverage}x)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Type and Leverage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Position Type
                    </label>
                    <select
                      value={orderType}
                      onChange={(e) =>
                        setOrderType(e.target.value as "long" | "short")
                      }
                      className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="long">Long (Buy)</option>
                      <option value="short">Short (Sell)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Leverage
                    </label>
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="5">5x</option>
                      <option value="10">10x</option>
                      <option value="20">20x</option>
                      <option value="50">50x</option>
                      {currentPair && currentPair.maxLeverage >= 100 && (
                        <option value="100">100x</option>
                      )}
                      {currentPair && currentPair.maxLeverage === 125 && (
                        <option value="125">125x</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Price and Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Trade Amount (USDT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Size
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      placeholder="0.00000000"
                    />
                  </div>
                </div>

                {/* Trigger Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trigger Price (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Expiration Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiration Time (Optional)
                  </label>
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select expiration time</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="2h">2 hours</option>
                    <option value="4h">4 hours</option>
                    <option value="8h">8 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    If not set, order will expire in 24 hours
                  </p>
                </div>

                {/* Position Details */}
                {price && size && (
                  <div className="bg-[#2A2D36] rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Position Size:</span>
                      <span className="text-white">
                        {size} {currentPair?.baseAsset}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Notional Value:</span>
                      <span className="text-white">
                        $
                        {(
                          parseFloat(price) * parseFloat(size)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Margin Required:</span>
                      <span className="text-white">
                        $
                        {(
                          (parseFloat(price) * parseFloat(size)) /
                          parseFloat(leverage)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Leverage:</span>
                      <span className="text-yellow-400 font-medium">
                        {leverage}x
                      </span>
                    </div>
                  </div>
                )}

                {/* Created Order Display */}
                {createdOrder && (
                  <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-green-400 font-semibold">
                        Futures Order Created Successfully!
                      </h3>
                      <button
                        onClick={() => setCreatedOrder(null)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Order ID:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono">
                            {createdOrder.orderId}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(createdOrder.orderId, "Order ID")
                            }
                            className="text-green-400 hover:text-green-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Copy Code:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400 font-mono font-bold">
                            {createdOrder.copyCode}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                createdOrder.copyCode,
                                "Copy Code"
                              )
                            }
                            className="text-green-400 hover:text-green-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Symbol:</span>
                        <span className="text-white">
                          {createdOrder.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Side:</span>
                        <span
                          className={`${
                            createdOrder.side === 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {createdOrder.side === 0 ? "Long" : "Short"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Type:</span>
                        <span className="text-white capitalize">
                          {createdOrder.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Size:</span>
                        <span className="text-white">{createdOrder.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Leverage:</span>
                        <span className="text-yellow-400 font-medium">
                          {createdOrder.leverage}x
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Trigger Price:</span>
                        <span className="text-white">
                          ${createdOrder.trigger_price}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Limit Price:</span>
                        <span className="text-white">
                          ${createdOrder.limit_price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={isSubmitting || !price || !size}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating..." : "Create Futures Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Futures Order Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Order ID</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-mono">
                        {selectedOrder.orderId}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedOrder.orderId, "Order ID")
                        }
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Copy Code</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-green-400 font-mono font-bold">
                        {selectedOrder.copyCode}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedOrder.copyCode, "Copy Code")
                        }
                        className="text-green-400 hover:text-green-300"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Symbol</label>
                    <p className="text-white">{selectedOrder.symbol}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">User</label>
                    <p className="text-white">{selectedOrder.user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Position</label>
                    <p
                      className={`font-medium ${
                        selectedOrder.side === 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedOrder.side === 0 ? "Long" : "Short"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <p className="text-white capitalize">
                      {selectedOrder.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Size</label>
                    <p className="text-white">{selectedOrder.size}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Leverage</label>
                    <p className="text-yellow-400 font-medium">
                      {selectedOrder.leverage}x
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">
                      Trigger Price
                    </label>
                    <p className="text-white">${selectedOrder.trigger_price}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">
                      Executive Price
                    </label>
                    <p className="text-white">
                      ${selectedOrder.executive_price}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Limit Price</label>
                    <p className="text-white">${selectedOrder.limit_price}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Total Cost</label>
                    <p className="text-white">${selectedOrder.total_cost}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">
                      Executed Quantity
                    </label>
                    <p className="text-white">
                      {selectedOrder.executed_quantity}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Fees</label>
                    <p className="text-white">${selectedOrder.fees}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Created At</label>
                    <p className="text-white">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Updated At</label>
                    <p className="text-white">
                      {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedOrder.executed_at && (
                  <div>
                    <label className="text-sm text-gray-400">Executed At</label>
                    <p className="text-white">
                      {new Date(selectedOrder.executed_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Share Actions */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => shareToWhatsApp(selectedOrder)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share to WhatsApp</span>
                  </button>
                  <button
                    onClick={() => shareToTelegram(selectedOrder)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Share to Telegram</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturesCodesPage;
