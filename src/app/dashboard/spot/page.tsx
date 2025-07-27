"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  followOrder,
  getCurrencies,
  getSpotBalance,
  myOrders,
  type CurrencyPair,
} from "@/services/trading";
import {
  Circle,
  Copy,
  Loader,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { OrderBookComponent } from "./OrderBook";
import { TradingViewChart } from "./TradingChart";
import { TradingForm } from "./TradingForm";

interface SpotBalance {
  _id: string;
  coinName: string | null;
  user: string;
  coinId: string;
  balance: number;
  createdAt: string;
  memo: string;
  updatedAt: string;
}

interface TickerData {
  symbol: string;
  last_price: string;
  price_24h_max: string;
  price_24h_min: string;
  volume_24h: string;
  timestamp: number;
}

interface OrderBookEntry {
  price: string;
  size: string;
}

interface OrderBookData {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  displayName: string;
  tradingViewSymbol: string;
  isActive: boolean;
}

interface OrderResponse {
  orderId: string;
  copyCode: string;
  symbol: string;
  side: string;
  originalPrice: number;
  expectedFinalPrice: number;
  profitPercentage: number;
  expiration: string | null;
  status: string;
}

interface Trade {
  tradeId: string;
  price: number;
  quantity: number;
  fee: number;
  role: string;
  timestamp: string;
  _id: string;
}

interface MyOrder {
  _id: string;
  user: string;
  symbol: string;
  quantity: number;
  executedQuantity: number;
  owner: boolean;
  type: string;
  role: string;
  price: number;
  averageExecutionPrice: number;
  side: string;
  status: string;
  copyCode: string;
  expiration: string | null;
  percentage: number;
  orderId: string;
  exchangeFees: number;
  platformFees: number;
  totalFees: number;
  feeCurrency: string;
  trades: Trade[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profit: number;
}

type ConnectionStatus =
  | "Disconnected"
  | "Connecting..."
  | "Connected"
  | "Error";
const SpotTrading: React.FC = () => {
  // State management
  const [selectedPair, setSelectedPair] = useState<string>("BTC_USDT");
  const [orderCode, setOrderCode] = useState<string>("");
  const [, setBalances] = useState<SpotBalance[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyPair[]>([]);
  const [, setSelectedCurrency] = useState<CurrencyPair | null>(null);
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [allTickerData, setAllTickerData] = useState<
    Record<string, TickerData & { fluctuation: number }>
  >({});
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [, setWsConnection] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Disconnected");
  const [loading, setLoading] = useState<boolean>(false);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [pairsLoading, setPairsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [, setBalanceLoading] = useState<boolean>(false);

  // Order execution state
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(
    null
  );
  const [orderError, setOrderError] = useState<string | null>(null);

  // My Orders state
  const [myOrdersList, setMyOrdersList] = useState<MyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeOrderTab, setActiveOrderTab] = useState<"open" | "history">(
    "open"
  );

  // Utility functions
  const safeParseFloat = useCallback((value: unknown): number => {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  const getCurrentTradingPair = useCallback((): TradingPair | null => {
    return tradingPairs.find((pair) => pair.symbol === selectedPair) || null;
  }, [selectedPair, tradingPairs]);

  const refreshBalances = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const balanceData = await getSpotBalance();
      const balances = Array.isArray(balanceData)
        ? balanceData
        : balanceData?.data || balanceData?.balances || [];

      setBalances(balances);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Fetch user orders
  const fetchMyOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await myOrders();
      if (response.success && Array.isArray(response.data)) {
        setMyOrdersList(response.data);
      } else {
        setOrdersError("Failed to load orders");
      }
    } catch (error: unknown) {
      console.error("Error fetching orders:", error);
      const err = error as Error & {
        response?: { data?: { error?: string; message?: string } };
      };
      setOrdersError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to load orders"
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Currency loading functions
  const loadAllCurrencies = useCallback(async (): Promise<CurrencyPair[]> => {
    const allCurrencies: CurrencyPair[] = [];
    let currentPage = 1;
    let hasMore = true;

    try {
      while (hasMore && currentPage <= 10) {
        const response = await getCurrencies(currentPage, 100);

        if (response.success && response.data) {
          allCurrencies.push(...response.data);
          hasMore = response.meta && response.meta.next !== null;
          currentPage++;
        } else {
          hasMore = false;
        }
      }

      return allCurrencies;
    } catch (error) {
      console.error("Error loading currencies:", error);
      return [];
    }
  }, []);

  const fetchTradingPairs = useCallback(async (): Promise<void> => {
    if (pairsLoading) return;

    setPairsLoading(true);
    try {
      const fallbackPairs: TradingPair[] = [
        {
          symbol: "BTC_USDT",
          baseAsset: "BTC",
          quoteAsset: "USDT",
          displayName: "BTC/USDT",
          tradingViewSymbol: "BINANCE:BTCUSDT",
          isActive: true,
        },
        {
          symbol: "ETH_USDT",
          baseAsset: "ETH",
          quoteAsset: "USDT",
          displayName: "ETH/USDT",
          tradingViewSymbol: "BINANCE:ETHUSDT",
          isActive: true,
        },
      ];

      if (currencies.length === 0) {
        setTradingPairs(fallbackPairs);
        // Ensure BTC_USDT is selected by default
        if (selectedPair === "BTC_USDT" || !selectedPair) {
          setSelectedPair("BTC_USDT");
        }
        return;
      }

      const pairs: TradingPair[] = currencies
        .filter((currency) => currency.quoteCurrency === "USDT")
        .map((currency) => ({
          symbol: currency.symbol,
          baseAsset: currency.baseCurrency,
          quoteAsset: currency.quoteCurrency,
          displayName: `${currency.baseCurrency}/${currency.quoteCurrency}`,
          tradingViewSymbol: `BINANCE:${currency.symbol.replace("_", "")}`,
          isActive: true,
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

      // Merge with fallback pairs to ensure we have the essential ones
      const mergedPairs = [...fallbackPairs];
      pairs.forEach((pair) => {
        if (!mergedPairs.find((p) => p.symbol === pair.symbol)) {
          mergedPairs.push(pair);
        }
      });

      setTradingPairs(mergedPairs);

      // Ensure BTC_USDT is selected by default
      if (!selectedPair || selectedPair === "BTC_USDT") {
        setSelectedPair("BTC_USDT");
      }
    } catch (error) {
      console.error("Error creating trading pairs:", error);
      // Fallback to basic pairs on error
      const fallbackPairs: TradingPair[] = [
        {
          symbol: "BTC_USDT",
          baseAsset: "BTC",
          quoteAsset: "USDT",
          displayName: "BTC/USDT",
          tradingViewSymbol: "BINANCE:BTCUSDT",
          isActive: true,
        },
      ];
      setTradingPairs(fallbackPairs);
      setSelectedPair("BTC_USDT");
    } finally {
      setPairsLoading(false);
    }
  }, [currencies, selectedPair]);

  // Trading functions
  const handlePairChange = useCallback(
    (newPair: string): void => {
      setSelectedPair(newPair);
      const newCurrency = currencies.find((c) => c.symbol === newPair);
      setSelectedCurrency(newCurrency || null);
      setOrderCode("");
    },
    [currencies]
  );

  const validateOrder = useCallback((): boolean => {
    return orderCode.trim().length > 0;
  }, [orderCode]);

  const handleSubmitOrder = useCallback(async (): Promise<void> => {
    if (!validateOrder()) {
      return;
    }

    setOrderLoading(true);
    setOrderError(null);
    setOrderResponse(null);

    try {
      const response = await followOrder(orderCode);

      if (response.success) {
        setOrderResponse(response.data);
        setOrderCode(""); // Reset form on success
        await Promise.all([refreshBalances(), fetchMyOrders()]);
      } else {
        setOrderError(response.message || "Order execution failed");
      }
    } catch (error: unknown) {
      console.error("Error submitting order:", error);
      const err = error as Error & {
        response?: { data?: { error?: string; message?: string } };
      };
      setOrderError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to execute order. Please try again."
      );
    } finally {
      setOrderLoading(false);
    }
  }, [validateOrder, orderCode, refreshBalances, fetchMyOrders]);

  // Data loading effects
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async (): Promise<void> => {
      if (loading) return;

      setLoading(true);
      try {
        const [balanceData, currencyData] = await Promise.all([
          getSpotBalance().catch(() => []),
          loadAllCurrencies().catch(() => []),
        ]);

        if (!isMounted) return;

        const balances = Array.isArray(balanceData)
          ? balanceData
          : balanceData?.data || balanceData?.balances || [];

        const currencies = Array.isArray(currencyData) ? currencyData : [];

        setBalances(balances);
        setCurrencies(currencies);

        const btcUsdtCurrency = currencies.find((c) => c.symbol === "BTC_USDT");
        const defaultCurrency = btcUsdtCurrency || currencies[0] || null;

        setSelectedCurrency(defaultCurrency);

        if (btcUsdtCurrency && !selectedPair) {
          setSelectedPair("BTC_USDT");
        }

        await refreshBalances();
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
    fetchMyOrders(); // Load orders on component mount

    return () => {
      isMounted = false;
    };
  }, []);

  // Create trading pairs after currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !pairsLoading) {
      console.log("Currencies loaded, creating trading pairs...");
      fetchTradingPairs();
    }
  }, [currencies.length, fetchTradingPairs, pairsLoading]);

  // Update selected currency when pair changes
  useEffect(() => {
    if (currencies.length > 0 && selectedPair) {
      const currentCurrency = currencies.find(
        (c: CurrencyPair) => c.symbol === selectedPair
      );
      console.log(`Updating currency for ${selectedPair}:`, !!currentCurrency);
      setSelectedCurrency(currentCurrency || null);
    }
  }, [selectedPair, currencies]);

  // Function to fetch ticker data from REST API
  const fetchTickerData = useCallback(
    async (symbol: string) => {
      try {
        const response = await fetch(
          `https://api-cloud.bitmart.com/spot/quotation/v3/ticker?symbol=${symbol}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.code === 1000 && data.data) {
            const ticker = data.data;

            // BitMart API field mapping
            const lastPrice = safeParseFloat(ticker.last); // "last" field
            const highPrice = safeParseFloat(ticker.high_24h); // "high_24h" field
            const lowPrice = safeParseFloat(ticker.low_24h); // "low_24h" field
            const openPrice = safeParseFloat(ticker.open_24h); // "open_24h" field
            const volume = safeParseFloat(ticker.v_24h); // "v_24h" field (base volume)
            const fluctuation = safeParseFloat(ticker.fluctuation); // fluctuation percentage

            setTickerData({
              symbol: symbol,
              last_price: lastPrice.toString(),
              price_24h_max: highPrice.toString(),
              price_24h_min: lowPrice.toString(),
              volume_24h: volume.toString(),
              timestamp: Date.now() / 1000,
            });

            // Use fluctuation from API or calculate from open price
            if (fluctuation !== 0) {
              setPriceChangePercent(fluctuation * 100); // Convert to percentage
            } else if (openPrice > 0) {
              const change = ((lastPrice - openPrice) / openPrice) * 100;
              setPriceChangePercent(change);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ticker data:", error);
      }
    },
    [safeParseFloat]
  );

  // WebSocket connection
  useEffect(() => {
    setTickerData(null);
    setOrderBook(null);
    setPriceChangePercent(0);
    setConnectionStatus("Connecting...");

    // Fetch initial ticker data from REST API
    fetchTickerData(selectedPair);

    const ws = new WebSocket(
      "wss://ws-manager-compress.bitmart.com/api?protocol=1.1"
    );
    setWsConnection(ws);

    const handleTickerData = (data: unknown): void => {
      const tickerItem = Array.isArray(data) ? data[0] : data;
      if (!tickerItem || typeof tickerItem !== "object") return;

      const ticker = tickerItem as Record<string, unknown>;
      const symbol = String(ticker.symbol || "");
      const lastPrice = safeParseFloat(ticker.last_price);
      const openPrice = safeParseFloat(ticker.open_24h);
      const highPrice = safeParseFloat(ticker.high_24h);
      const lowPrice = safeParseFloat(ticker.low_24h);
      const volume = safeParseFloat(ticker.base_volume_24h || ticker.v_24h);

      if (!symbol || lastPrice <= 0) return;

      // Calculate 24h change percentage
      let fluctuation = 0;
      if (openPrice > 0) {
        fluctuation = ((lastPrice - openPrice) / openPrice) * 100;
      }

      const tickerData = {
        symbol: symbol,
        last_price: lastPrice.toString(),
        price_24h_max: highPrice.toString(),
        price_24h_min: lowPrice.toString(),
        volume_24h: volume.toString(),
        timestamp: Date.now() / 1000,
        fluctuation: fluctuation,
      };

      // Update current pair ticker data
      if (symbol === selectedPair) {
        setTickerData({
          symbol: symbol,
          last_price: lastPrice.toString(),
          price_24h_max: highPrice.toString(),
          price_24h_min: lowPrice.toString(),
          volume_24h: volume.toString(),
          timestamp: Date.now() / 1000,
        });
        setPriceChangePercent(fluctuation);
      }

      // Update all ticker data for dropdown
      setAllTickerData((prev) => ({
        ...prev,
        [symbol]: tickerData,
      }));
    };

    const handleOrderBookData = (data: unknown): void => {
      const orderBookItem = Array.isArray(data) ? data[0] : data;
      if (!orderBookItem || typeof orderBookItem !== "object") return;

      const orderBook = orderBookItem as Record<string, unknown>;

      const bids = orderBook.bids || orderBook.buy || [];
      const asks = orderBook.asks || orderBook.sell || [];

      if (!Array.isArray(bids) || !Array.isArray(asks)) {
        return;
      }

      const timestamp = Date.now();

      setOrderBook({
        symbol: String(orderBook.symbol || selectedPair),
        bids: bids.slice(0, 20).map((bid: unknown) => {
          const bidArray = Array.isArray(bid) ? bid : [];
          return {
            price: String(bidArray[0] || "0"),
            size: String(bidArray[1] || "0"),
          };
        }),
        asks: asks.slice(0, 20).map((ask: unknown) => {
          const askArray = Array.isArray(ask) ? ask : [];
          return {
            price: String(askArray[0] || "0"),
            size: String(askArray[1] || "0"),
          };
        }),
        timestamp: timestamp,
      });
    };

    ws.onopen = () => {
      setConnectionStatus("Connected");

      // Subscribe to current pair
      const subscriptions = [
        { op: "subscribe", args: [`spot/ticker:${selectedPair}`] },
        { op: "subscribe", args: [`spot/depth20:${selectedPair}`] },
      ];

      // Subscribe to ticker data for top trading pairs (for dropdown)
      const topPairs = tradingPairs.slice(0, 15); // Get top 15 pairs
      topPairs.forEach((pair) => {
        if (pair.symbol !== selectedPair) {
          // Don't duplicate current pair
          subscriptions.push({
            op: "subscribe",
            args: [`spot/ticker:${pair.symbol}`],
          });
        }
      });

      subscriptions.forEach((sub) => {
        ws.send(JSON.stringify(sub));
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as Record<string, unknown>;

        if (message.table && message.data) {
          const { table, data } = message;

          switch (table) {
            case "spot/ticker":
              handleTickerData(data);
              break;
            case "spot/depth20":
              handleOrderBookData(data);
              break;
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onerror = () => {
      setConnectionStatus("Error");
    };

    ws.onclose = () => {
      setConnectionStatus("Disconnected");
      setWsConnection(null);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        const unsubscriptions = [
          { op: "unsubscribe", args: [`spot/ticker:${selectedPair}`] },
          { op: "unsubscribe", args: [`spot/depth20:${selectedPair}`] },
        ];

        // Unsubscribe from all ticker subscriptions
        const topPairs = tradingPairs.slice(0, 15);
        topPairs.forEach((pair) => {
          if (pair.symbol !== selectedPair) {
            unsubscriptions.push({
              op: "unsubscribe",
              args: [`spot/ticker:${pair.symbol}`],
            });
          }
        });

        unsubscriptions.forEach((unsub) => {
          ws.send(JSON.stringify(unsub));
        });
        ws.close();
      }
    };
  }, [selectedPair, safeParseFloat, fetchTickerData, tradingPairs]);

  // Refresh current pair ticker data every 30 seconds (backup)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedPair) {
        fetchTickerData(selectedPair);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedPair, fetchTickerData]);

  const filteredTradingPairs = tradingPairs.filter(
    (pair) =>
      pair.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.quoteAsset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter orders based on active tab
  const openOrders = myOrdersList.filter(
    (order) => order.status !== "completed" && order.status !== "expired"
  );
  const completedOrders = myOrdersList.filter(
    (order) => order.status === "completed" || order.status === "expired"
  );
  const displayedOrders =
    activeOrderTab === "open" ? openOrders : completedOrders;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E12] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
          <div className="text-xl font-semibold">
            Loading Trading Interface...
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Connecting to markets...
          </div>
        </div>
      </div>
    );
  }

  const currentPair = getCurrentTradingPair();

  return (
    <div className="min-h-screen bg-[#0C0E12] text-white relative">
      {/* Assets List Component */}
      {/* <AssetsList
        balances={balances}
        balanceLoading={balanceLoading}
        tickerData={tickerData}
        refreshBalances={refreshBalances}
        formatBalance={formatBalance}
        safeParseFloat={safeParseFloat}
      /> */}

      {/* Header with ticker info */}
      <div className="border-b border-gray-800 bg-[#0C0E12]">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Symbol selector */}
            <div className="relative">
              <Select value={selectedPair} onValueChange={handlePairChange}>
                <SelectTrigger className="w-full md:w-[280px] h-10 bg-transparent border-gray-700 text-white hover:border-gray-600 transition-colors">
                  <SelectValue>
                    {pairsLoading ? (
                      <div className="flex items-center">
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      currentPair?.displayName || selectedPair
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D24] border-gray-700 text-white max-h-[400px] w-[350px]">
                  <div className="p-2 border-b border-gray-700">
                    <input
                      type="text"
                      placeholder="Search pairs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#2A2D36] border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {pairsLoading ? (
                    <div className="p-4 text-center">
                      <Loader className="w-6 h-6 mx-auto animate-spin mb-2" />
                      <div className="text-sm text-gray-400">
                        Loading trading pairs...
                      </div>
                    </div>
                  ) : (
                    <>
                      {filteredTradingPairs.length > 0 ? (
                        filteredTradingPairs.map((pair) => {
                          const pairTicker = allTickerData[pair.symbol];
                          return (
                            <SelectItem
                              key={pair.symbol}
                              value={pair.symbol}
                              className="hover:bg-gray-700 focus:bg-gray-700 py-3"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {pair.displayName}
                                  </span>
                                  {pairTicker && (
                                    <span className="text-xs text-gray-400">
                                      $
                                      {safeParseFloat(
                                        pairTicker.last_price
                                      ).toFixed(4)}
                                    </span>
                                  )}
                                </div>
                                {pairTicker && (
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-xs font-medium ${
                                        pairTicker.fluctuation >= 0
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {pairTicker.fluctuation >= 0 ? "+" : ""}
                                      {pairTicker.fluctuation.toFixed(2)}%
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {pair.isActive ? "✓" : ""}
                                    </span>
                                  </div>
                                )}
                                {!pairTicker && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    {pair.isActive ? "✓" : ""}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No pairs found
                        </div>
                      )}
                      <div className="p-2 border-t border-gray-700">
                        <button
                          onClick={fetchTradingPairs}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs bg-[#2A2D36] hover:bg-[#3A3D46] rounded transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Refresh Pairs</span>
                        </button>
                      </div>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Price info */}
            {tickerData && currentPair && (
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="bg-[#1A1D24] rounded-lg px-4 py-2 border border-gray-800">
                  <div className="text-xl md:text-2xl font-bold">
                    {safeParseFloat(tickerData.last_price).toFixed(5)}
                  </div>
                  <div className="text-sm text-gray-400">
                    ≈ ${safeParseFloat(tickerData.last_price).toFixed(2)}
                  </div>
                </div>

                <div
                  className={`text-sm bg-[#1A1D24] rounded-lg px-3 py-2 border ${
                    priceChangePercent >= 0
                      ? "border-green-500/30"
                      : "border-red-500/30"
                  }`}
                >
                  <div className="text-gray-400">24h Change</div>
                  <div
                    className={`font-bold flex items-center ${
                      priceChangePercent >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {priceChangePercent >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {priceChangePercent >= 0 ? "+" : ""}
                    {priceChangePercent.toFixed(2)}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4 text-sm">
                  <div className="bg-[#1A1D24] rounded-lg px-2 md:px-3 py-2 border border-gray-800">
                    <div className="text-gray-400 text-xs">24h High</div>
                    <div className="font-medium text-xs md:text-sm">
                      {safeParseFloat(tickerData.price_24h_max).toFixed(5)}
                    </div>
                  </div>

                  <div className="bg-[#1A1D24] rounded-lg px-2 md:px-3 py-2 border border-gray-800">
                    <div className="text-gray-400 text-xs">24h Low</div>
                    <div className="font-medium text-xs md:text-sm">
                      {safeParseFloat(tickerData.price_24h_min).toFixed(5)}
                    </div>
                  </div>

                  <div className="bg-[#1A1D24] rounded-lg px-2 md:px-3 py-2 border border-gray-800">
                    <div className="text-gray-400 text-xs">
                      24h Vol({currentPair.baseAsset})
                    </div>
                    <div className="font-medium text-xs md:text-sm">
                      {Number(tickerData.volume_24h).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connection status */}
          <div
            className={`flex items-center space-x-2 text-xs px-3 md:px-4 py-2 rounded-lg border ${
              connectionStatus === "Connected"
                ? "bg-green-600/10 border-green-500/30 text-green-400"
                : connectionStatus === "Connecting..."
                ? "bg-yellow-600/10 border-yellow-500/30 text-yellow-400"
                : "bg-red-600/10 border-red-500/30 text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "Connected"
                  ? "bg-green-400 animate-pulse"
                  : connectionStatus === "Connecting..."
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="font-medium">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col xl:flex-row gap-2 md:gap-4">
        {/* Chart Section */}
        <div className="flex-1 min-w-0">
          <div className="h-[300px] md:h-[400px] xl:h-[500px] bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg">
            <div className="p-3 md:p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h3 className="font-semibold text-sm md:text-base">Chart</h3>
                <div className="flex flex-wrap gap-1 md:gap-2">
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
              <div className="text-xs text-gray-400 bg-[#2A2D36] px-2 md:px-3 py-1 rounded">
                TradingView:{" "}
                {currentPair?.tradingViewSymbol || `BINANCE:${selectedPair}`}
              </div>
            </div>
            <div className="h-[calc(100%-60px)] md:h-[calc(100%-70px)]">
              {currentPair ? (
                <TradingViewChart
                  symbol={currentPair.tradingViewSymbol}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Circle className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                    <div className="text-sm">
                      Select a trading pair to view chart
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Order Book and Trading Form */}
        <div className="w-full xl:w-[380px] flex flex-col gap-2 md:gap-4">
          {/* Order Book */}
          <div className="h-[280px] md:h-[320px]">
            <div className="h-full bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg">
              <div className="p-3 md:p-4 border-b border-gray-800">
                <h3 className="font-semibold text-sm md:text-base">
                  Order Book
                </h3>
              </div>
              <div className="h-[calc(100%-50px)] md:h-[calc(100%-60px)] overflow-hidden">
                <div className="h-full md:p-4 overflow-y-auto">
                  <OrderBookComponent
                    orderBook={orderBook}
                    tickerData={tickerData}
                    currentPair={currentPair}
                    connectionStatus={connectionStatus}
                    priceChangePercent={priceChangePercent}
                    safeParseFloat={safeParseFloat}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trading Form */}
          <div className="h-[280px] md:h-[320px]">
            <div className="h-full">
              <TradingForm
                orderCode={orderCode}
                setOrderCode={setOrderCode}
                currentPair={currentPair}
                orderLoading={orderLoading}
                validateOrder={validateOrder}
                handleSubmitOrder={handleSubmitOrder}
                orderResponse={orderResponse}
                orderError={orderError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - Open Orders and Trade History */}
      <div className="border-t border-gray-800 bg-[#0C0E12] mb-20">
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg">
          <div className="flex overflow-x-auto border-b border-gray-800">
            <button
              onClick={() => setActiveOrderTab("open")}
              className={`px-3 md:px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeOrderTab === "open"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Open Trade ({openOrders.length})
            </button>
            <button
              onClick={() => setActiveOrderTab("history")}
              className={`px-3 md:px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeOrderTab === "history"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Trade History ({completedOrders.length})
            </button>
            <button
              onClick={fetchMyOrders}
              disabled={ordersLoading}
              className="ml-auto p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Orders"
            >
              <RefreshCw
                className={`w-4 h-4 ${ordersLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="md:p-6">
            {ordersLoading ? (
              <div className="text-center py-8">
                <Loader className="w-6 h-6 mx-auto mb-3 animate-spin text-blue-400" />
                <div className="text-sm text-gray-400">Loading orders...</div>
              </div>
            ) : ordersError ? (
              <div className="text-center py-8">
                <div className="text-red-400 text-sm mb-3">{ordersError}</div>
                <button
                  onClick={fetchMyOrders}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Try Again
                </button>
              </div>
            ) : displayedOrders.length > 0 ? (
              <div className="grid gap-4 md:gap-6 mb-20">
                {displayedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-[#2A2D36] rounded-lg border border-gray-700 p-4 md:p-6 hover:border-gray-600 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Order ID */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Order ID</span>
                        <span className="text-white font-mono text-sm">
                          {order.orderId}
                        </span>
                      </div>

                      {/* Copy Code */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Copy Code</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            {order.copyCode}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(order.copyCode)
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
                            order.side === "buy"
                              ? "text-green-400 bg-green-400/10"
                              : "text-red-400 bg-red-400/10"
                          }`}
                        >
                          {order.side.toUpperCase()}
                        </span>
                      </div>

                      {/* Entry Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          Entry Price
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {order.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Target Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          Target Price
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {order.averageExecutionPrice > 0
                            ? order.averageExecutionPrice.toLocaleString()
                            : (
                                order.price *
                                (1 + order.percentage / 100)
                              ).toLocaleString()}
                        </span>
                      </div>

                      {/* Expected Profit */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          Expected Profit
                        </span>
                        <span className="text-green-400 font-semibold text-sm">
                          +{order.percentage}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Profit</span>
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
                          {order.expiration
                            ? new Date(order.expiration).toLocaleString()
                            : "No expiration"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex justify-between items-center md:col-span-2">
                        <span className="text-gray-400 text-sm">Status</span>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            order.status === "pending_profit"
                              ? "text-yellow-400 bg-yellow-400/10"
                              : order.status === "completed"
                              ? "text-green-400 bg-green-400/10"
                              : order.status === "expired"
                              ? "text-red-400 bg-red-400/10"
                              : order.status === "pending"
                              ? "text-blue-400 bg-blue-400/10"
                              : "text-gray-400 bg-gray-400/10"
                          }`}
                        >
                          {order.status === "pending_profit"
                            ? "Pending Profit"
                            : order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info Row */}
                    <div className="mt-4 pt-4 border-t border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white font-medium">
                          {order.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="text-white">
                          {order.quantity.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Circle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <div className="text-sm font-medium">
                  {activeOrderTab === "open"
                    ? "No open orders"
                    : "No order history"}
                </div>
                <div className="text-xs mt-1">
                  {activeOrderTab === "open"
                    ? "Your active orders will appear here after placing them"
                    : "Your completed and expired orders will appear here"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotTrading;
