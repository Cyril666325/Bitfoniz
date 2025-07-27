"use client";

import {
  followFuturesOrder,
  getCurrencies,
  getSpotBalance,
  myFuturesOrders,
  type CurrencyPair,
} from "@/services/trading";
import { Circle, Copy, Loader, Zap } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { TradingViewChart } from "../spot/TradingChart";
import { FuturesTradingForm } from "./FuturesTradingForm";
import { OrderConfirmationModal } from "./OrderConfirmationModal";

interface FuturesBalance {
  _id: string;
  coinName: string | null;
  user: string;
  coinId: string;
  balance: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnl: number;
  createdAt: string;
  memo: string;
  updatedAt: string;
}

interface FuturesTradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  displayName: string;
  tradingViewSymbol: string;
  isActive: boolean;
  maxLeverage: number;
  minMargin: number;
  tickSize: string;
  contractSize: number;
}

interface FuturesOrderDetails {
  orderCode: string;
  pair: string;
  positionType: "long" | "short";
  leverage: number;
  entryPrice: number;
  quantity: number;
  margin: number;
  totalValue: number;
  stopLoss?: number;
  takeProfit?: number;
  fees: number;
  liquidationPrice: number;
  tradePercentage: number;
}

interface FuturesOrder {
  id: string;
  code: string;
  pair: string;
  type: "long" | "short";
  leverage: number;
  entryPrice: number;
  amount: number;
  margin: number;
  totalValue: number;
  stopLoss?: number;
  takeProfit?: number;
  status: "pending_profit" | "completed";
  createdAt: string;
  percentage: number;
  profit: number;
}

interface ApiOrderResponse {
  _id: string;
  user: string;
  symbol: string;
  orderId: string;
  side: number;
  type: string;
  leverage: string;
  open_type: string;
  size: number;
  trigger_price: string;
  executive_price: string;
  price_way: number;
  price_type: number;
  mode: number;
  status: string;
  executed_price?: string;
  executed_quantity: number;
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
  percentage: number;
  profit: number;
}

const FuturesTrading: React.FC = () => {
  // State management
  const [selectedPair, setSelectedPair] = useState<string>("BTC_USDT");
  const [orderCode, setOrderCode] = useState<string>("");
  const [balances, setBalances] = useState<FuturesBalance[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyPair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [tradingPairs, setTradingPairs] = useState<FuturesTradingPair[]>([]);
  const [pairsLoading, setPairsLoading] = useState<boolean>(false);
  const [userOrders, setUserOrders] = useState<FuturesOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

  // Futures specific state
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<FuturesOrderDetails | null>(
    null
  );

  // Utility functions
  const getCurrentTradingPair = useCallback((): FuturesTradingPair | null => {
    return tradingPairs.find((pair) => pair.symbol === selectedPair) || null;
  }, [selectedPair, tradingPairs]);

  const getAvailableMargin = useCallback((): number => {
    // Find USDT balance for margin
    const usdtBalance = balances.find(
      (balance) => balance.coinId === "USDT" || balance.coinName === "USDT"
    );
    return usdtBalance
      ? usdtBalance.availableMargin || usdtBalance.balance
      : 10000; // Default to 10000 for demo
  }, [balances]);

  // Get order details from code
  const getOrderDetailsFromCode = useCallback(
    (code: string): FuturesOrderDetails | null => {
      if (!code || code.length < 3) return null;

      // Find matching order from user's orders
      const existingOrder = userOrders.find(
        (order) => order.code === code && order.status === "pending_profit"
      );

      if (existingOrder) {
        return {
          orderCode: existingOrder.code,
          pair: existingOrder.pair,
          positionType: existingOrder.type,
          leverage: existingOrder.leverage,
          entryPrice: existingOrder.entryPrice,
          quantity: existingOrder.amount,
          margin: existingOrder.margin,
          totalValue: existingOrder.totalValue,
          stopLoss: existingOrder.stopLoss,
          takeProfit: existingOrder.takeProfit,
          fees: existingOrder.totalValue * 0.001, // 0.1% fees
          liquidationPrice:
            existingOrder.type === "long"
              ? existingOrder.entryPrice * 0.8 // 20% drop for long
              : existingOrder.entryPrice * 1.2, // 20% rise for short
          tradePercentage: (existingOrder.margin / getAvailableMargin()) * 100,
        };
      }

      return null;
    },
    [userOrders, getAvailableMargin]
  );

  // Balance and currency functions
  const refreshBalances = useCallback(async () => {
    setLoading(true);
    try {
      const balanceData = await getSpotBalance();
      const balances = Array.isArray(balanceData)
        ? balanceData
        : balanceData?.data || balanceData?.balances || [];

      // Convert to futures balances with margin info
      const futuresBalances: FuturesBalance[] = balances.map(
        (balance: FuturesBalance) => ({
          ...balance,
          availableMargin: balance.balance * 0.8, // 80% available for margin
          usedMargin: balance.balance * 0.1, // 10% used
          unrealizedPnl: (Math.random() - 0.5) * balance.balance * 0.05, // Random PnL
        })
      );

      setBalances(futuresBalances);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create futures trading pairs
  const fetchTradingPairs = useCallback(async (): Promise<void> => {
    if (pairsLoading) return;

    setPairsLoading(true);
    try {
      const fallbackPairs: FuturesTradingPair[] = [
        {
          symbol: "BTC_USDT",
          baseAsset: "BTC",
          quoteAsset: "USDT",
          displayName: "BTC/USDT",
          tradingViewSymbol: "BINANCE:BTCUSDT",
          isActive: true,
          maxLeverage: 125,
          minMargin: 10,
          tickSize: "0.01",
          contractSize: 1,
        },
        {
          symbol: "ETH_USDT",
          baseAsset: "ETH",
          quoteAsset: "USDT",
          displayName: "ETH/USDT",
          tradingViewSymbol: "BINANCE:ETHUSDT",
          isActive: true,
          maxLeverage: 100,
          minMargin: 5,
          tickSize: "0.01",
          contractSize: 1,
        },
      ];

      if (currencies.length === 0) {
        setTradingPairs(fallbackPairs);
        if (selectedPair === "BTC_USDT" || !selectedPair) {
          setSelectedPair("BTC_USDT");
        }
        return;
      }

      const pairs: FuturesTradingPair[] = currencies
        .filter((currency) => currency.quoteCurrency === "USDT")
        .map((currency) => ({
          symbol: currency.symbol,
          baseAsset: currency.baseCurrency,
          quoteAsset: currency.quoteCurrency,
          displayName: `${currency.baseCurrency}/${currency.quoteCurrency}`,
          tradingViewSymbol: `BINANCE:${currency.symbol.replace("_", "")}`,
          isActive: true,
          maxLeverage:
            currency.baseCurrency === "BTC"
              ? 125
              : currency.baseCurrency === "ETH"
              ? 100
              : 75,
          minMargin: currency.baseCurrency === "BTC" ? 10 : 5,
          tickSize: "0.01",
          contractSize: 1,
        }))
        .sort((a, b) => {
          const majorCoins = [
            "BTC",
            "ETH",
            "BNB",
            "ADA",
            "XRP",
            "SOL",
            "DOGE",
            "DOT",
          ];
          const aScore = majorCoins.indexOf(a.baseAsset);
          const bScore = majorCoins.indexOf(b.baseAsset);

          if (aScore !== -1 && bScore !== -1) return aScore - bScore;
          if (aScore !== -1) return -1;
          if (bScore !== -1) return 1;
          return a.baseAsset.localeCompare(b.baseAsset);
        })
        .slice(0, 100);

      const mergedPairs = [...fallbackPairs];
      pairs.forEach((pair) => {
        if (!mergedPairs.find((p) => p.symbol === pair.symbol)) {
          mergedPairs.push(pair);
        }
      });

      setTradingPairs(mergedPairs);

      if (!selectedPair || selectedPair === "BTC_USDT") {
        setSelectedPair("BTC_USDT");
      }
    } catch (error) {
      console.error("Error creating futures trading pairs:", error);
      const fallbackPairs: FuturesTradingPair[] = [
        {
          symbol: "BTC_USDT",
          baseAsset: "BTC",
          quoteAsset: "USDT",
          displayName: "BTC/USDT",
          tradingViewSymbol: "BINANCE:BTCUSDT",
          isActive: true,
          maxLeverage: 125,
          minMargin: 10,
          tickSize: "0.01",
          contractSize: 1,
        },
      ];
      setTradingPairs(fallbackPairs);
      setSelectedPair("BTC_USDT");
    } finally {
      setPairsLoading(false);
    }
  }, [currencies, selectedPair]);

  // Fetch user's futures orders
  const fetchUserOrders = useCallback(async () => {
    if (ordersLoading) return;
    setOrdersLoading(true);
    try {
      const response = await myFuturesOrders();
      const ordersData = response?.data || response || [];

      const mappedOrders: FuturesOrder[] = Array.isArray(ordersData)
        ? ordersData.map((apiOrder: ApiOrderResponse) => ({
            id: apiOrder._id || apiOrder.orderId,
            percentage: apiOrder.percentage || 0,
            code: apiOrder.copyCode || apiOrder.orderId,
            pair: apiOrder.symbol,
            type: apiOrder.side === 1 ? "long" : "short",
            leverage: parseInt(apiOrder.leverage) || 1,
            entryPrice:
              parseFloat(apiOrder.executive_price) ||
              parseFloat(apiOrder.trigger_price) ||
              0,
            amount: apiOrder.size || apiOrder.executed_quantity || 0,
            margin: apiOrder.total_cost || 0,
            totalValue:
              (apiOrder.size || 0) *
              (parseFloat(apiOrder.executive_price) ||
                parseFloat(apiOrder.trigger_price) ||
                0),
            stopLoss: undefined,
            takeProfit: undefined,
            status:
              apiOrder.status === "pending_profit"
                ? "pending_profit"
                : apiOrder.status === "completed"
                ? "completed"
                : "pending_profit",
            createdAt: apiOrder.createdAt,
            profit: apiOrder.profit || 0,
          }))
        : [];

      setUserOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersLoading]);

  const validateOrder = useCallback((): boolean => {
    return orderCode.trim().length > 0;
  }, [orderCode]);

  const handleOrderCodeSubmit = useCallback(async (): Promise<void> => {
    if (!validateOrder()) return;

    setOrderLoading(true);
    try {
      // Call the API to get order details
      const response = await followFuturesOrder(orderCode);

      if (response.success && response.data) {
        // Map API response to order details
        const apiData = response.data;
        const orderDetails: FuturesOrderDetails = {
          orderCode: apiData.copyCode,
          pair: apiData.symbol,
          positionType: apiData.side === "buy" ? "long" : "short",
          leverage: parseInt(apiData.leverage) || 1,
          entryPrice: apiData.originalPrice,
          quantity: apiData.size,
          margin:
            (apiData.size * apiData.originalPrice) /
            (parseInt(apiData.leverage) || 1),
          totalValue: apiData.size * apiData.originalPrice,
          stopLoss: undefined,
          takeProfit: apiData.expectedFinalPrice,
          fees: apiData.size * apiData.originalPrice * 0.001, // 0.1% fees
          liquidationPrice:
            apiData.side === "buy"
              ? apiData.originalPrice * 0.8 // 20% drop for long
              : apiData.originalPrice * 1.2, // 20% rise for short
          tradePercentage: apiData.profitPercentage,
        };

        setOrderDetails(orderDetails);
        setShowConfirmationModal(true);

        // Show success message from API
        if (response.message) {
          toast.success(response.message);
        } else {
          toast.success("Order executed successfully!");
        }

        // Reset form and refresh data
        setOrderCode("");
        await Promise.all([refreshBalances(), fetchUserOrders()]);
      }
    } catch (error: unknown) {
      console.error("Error getting order details:", error);

      // Handle specific error messages
      let errorMessage = "Failed to get order details. Please try again.";

      // Check if it's an AxiosError first
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { error?: string; message?: string };
            status?: number;
          };
          message?: string;
        };

        // Debug logging
        console.log("AxiosError response:", axiosError.response);
        console.log("AxiosError response data:", axiosError.response?.data);
        console.log(
          "AxiosError response data error:",
          axiosError.response?.data?.error
        );

        // Extract error message from response data
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
          console.log("Using error from response.data.error:", errorMessage);
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
          console.log("Using error from response.data.message:", errorMessage);
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
          console.log("Using error from axiosError.message:", errorMessage);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        console.log("Using error from Error.message:", errorMessage);
      }

      console.log("Final error message to display:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  }, [orderCode, validateOrder, refreshBalances, fetchUserOrders]);

  const handleConfirmOrder = useCallback(async (): Promise<void> => {
    if (!orderDetails) return;

    // Since the order was already executed when getting details,
    // we just need to close the modal and refresh the data
    setOrderCode("");
    setOrderDetails(null);
    setShowConfirmationModal(false);

    // Refresh balances and orders to show the updated state
    await Promise.all([refreshBalances(), fetchUserOrders()]);
  }, [orderDetails, refreshBalances, fetchUserOrders]);

  // Initial data loading
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async (): Promise<void> => {
      if (loading) return;

      setLoading(true);
      try {
        const currencyData = await getCurrencies(1, 100).catch(() => ({
          success: false,
          data: [],
          meta: {
            totalItems: 0,
            currentPage: 1,
            totalPages: 1,
            prev: null,
            next: null,
          },
        }));

        if (!isMounted) return;

        const currencies = Array.isArray(currencyData?.data)
          ? currencyData.data
          : [];
        setCurrencies(currencies);

        const btcUsdtCurrency = currencies.find(
          (c: CurrencyPair) => c.symbol === "BTC_USDT"
        );

        if (btcUsdtCurrency && !selectedPair) {
          setSelectedPair("BTC_USDT");
        }

        await Promise.all([refreshBalances(), fetchUserOrders()]);
      } catch (error) {
        if (!isMounted) return;
        console.error("Error loading initial data:", error);
        setBalances([]);
        setCurrencies([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Create trading pairs after currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !pairsLoading) {
      fetchTradingPairs();
    }
  }, [currencies.length, fetchTradingPairs, pairsLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E12] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
          <div className="text-xl font-semibold">
            Loading Futures Interface...
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Connecting to futures markets...
          </div>
        </div>
      </div>
    );
  }

  const currentPair = getCurrentTradingPair();

  return (
    <div className="min-h-screen bg-[#0C0E12] text-white relative">
      {/* Header with futures branding */}
      <div className="border-b border-gray-800 p-3 md:p-4 bg-[#0C0E12]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <h1 className="text-lg md:text-xl font-bold">VIP Trading</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="text-xs md:text-sm">
              <span className="text-gray-400 hidden sm:inline">
                Available Margin:
              </span>
              <span className="text-gray-400 sm:hidden">Margin:</span>
              <span className="text-white font-bold ml-1 md:ml-2">
                ${getAvailableMargin().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading interface */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-100px)]">
        {/* Left side - Chart and Orders */}
        <div className="flex-1 p-2 md:p-4 flex flex-col space-y-2 md:space-y-4">
          {/* Chart */}
          <div className="flex-1 min-h-[300px] md:min-h-[400px] bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg">
            <div className="p-3 md:p-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 md:space-x-4">
                <h3 className="font-semibold text-sm md:text-base">
                  VIP Chart
                </h3>
                <div className="flex space-x-1 md:space-x-2">
                  {["1m", "5m", "15m", "1h", "4h", "1d"].map((interval) => (
                    <button
                      key={interval}
                      className="px-2 md:px-3 py-1 text-xs rounded bg-[#2A2D36] hover:bg-[#3A3D46] transition-colors"
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>
              {currentPair && (
                <div className="flex items-center space-x-2 md:space-x-4 text-xs">
                  <div className="text-gray-400">
                    <span className="hidden sm:inline">Max Leverage: </span>
                    <span className="sm:hidden">Lev: </span>
                    <span className="text-yellow-400 font-bold">
                      {currentPair.maxLeverage}x
                    </span>
                  </div>
                  <div className="text-gray-400 hidden md:block">
                    Contract:{" "}
                    <span className="text-white">
                      {currentPair.contractSize} {currentPair.baseAsset}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="h-[calc(100%-50px)] md:h-[calc(100%-60px)]">
              {currentPair ? (
                <TradingViewChart
                  symbol={currentPair.tradingViewSymbol}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Circle className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                    <div className="text-xs md:text-sm">
                      Select a VIP pair to view chart
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="h-[250px] md:h-[300px] bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg">
            <div className="p-3 md:p-4 border-b border-gray-800">
              <h3 className="font-semibold text-sm md:text-base">
                My VIP Orders
              </h3>
            </div>
            <div className="overflow-y-auto h-[calc(100%-50px)] md:h-[calc(100%-60px)] p-4">
              {ordersLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <div className="text-sm text-gray-400">
                      Loading orders...
                    </div>
                  </div>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Circle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <div className="text-sm">No orders found</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#2A2D36] rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Order ID */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Order ID
                          </span>
                          <span className="text-white font-mono text-sm">
                            {order.id}
                          </span>
                        </div>

                        {/* Copy Code */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Copy Code
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-sm">
                              {order.code}
                            </span>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(order.code)
                              }
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy Code"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Side */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Side</span>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              order.type === "long"
                                ? "text-green-400 bg-green-400/10"
                                : "text-red-400 bg-red-400/10"
                            }`}
                          >
                            {order.type.toUpperCase()}
                          </span>
                        </div>

                        {/* Entry Price */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Entry Price
                          </span>
                          <span className="text-white font-semibold text-sm">
                            {order.entryPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Target Price (calculated based on leverage and type) */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Target Price
                          </span>
                          <span className="text-white font-semibold text-sm">
                            {order.type === "long"
                              ? (order.entryPrice * 1.1).toLocaleString()
                              : (order.entryPrice * 0.9).toLocaleString()}
                          </span>
                        </div>

                        {/* Expected Profit (calculated based on leverage) */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Expected Profit
                          </span>
                          <span className="text-green-400 font-semibold text-sm">
                            +{order.percentage}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Profit
                          </span>
                          <span className="text-green-400 font-semibold text-sm">
                            ${order.profit.toLocaleString()}
                          </span>
                        </div>

                        {/* Expires At */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Expires At
                          </span>
                          <span className="text-white text-sm">
                            {new Date(
                              new Date(order.createdAt).getTime() +
                                24 * 60 * 60 * 1000
                            ).toLocaleString()}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex justify-between items-center md:col-span-2">
                          <span className="text-gray-400 text-sm">Status</span>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              order.status === "pending_profit"
                                ? "text-yellow-400 bg-yellow-400/10"
                                : "text-blue-400 bg-blue-400/10"
                            }`}
                          >
                            {order.status === "pending_profit"
                              ? "Pending Profit"
                              : "Completed"}
                          </span>
                        </div>
                      </div>

                      {/* Additional Info Row */}
                      <div className="mt-3 pt-3 border-t border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pair:</span>
                          <span className="text-white font-medium">
                            {order.pair.replace("_", "/")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Leverage:</span>
                          <span className="text-yellow-400 font-bold">
                            {order.leverage}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white">
                            {order.amount.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Trading Form */}
        <div className="w-full lg:w-[400px] flex flex-col space-y-2 md:space-y-4 p-2 md:p-4">
          <FuturesTradingForm
            orderCode={orderCode}
            setOrderCode={setOrderCode}
            currentPair={currentPair}
            orderLoading={orderLoading}
            validateOrder={validateOrder}
            handleOrderCodeSubmit={handleOrderCodeSubmit}
            getOrderDetailsFromCode={getOrderDetailsFromCode}
            availableMargin={getAvailableMargin()}
          />
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmationModal && orderDetails && (
        <OrderConfirmationModal
          orderDetails={orderDetails}
          onConfirm={handleConfirmOrder}
          onCancel={() => {
            setShowConfirmationModal(false);
            setOrderDetails(null);
          }}
          isLoading={orderLoading}
        />
      )}
    </div>
  );
};

export default FuturesTrading;
