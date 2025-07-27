import React from "react";
import { Circle, Loader } from "lucide-react";

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

interface TickerData {
  symbol: string;
  last_price: string;
  price_24h_max: string;
  price_24h_min: string;
  volume_24h: string;
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

interface OrderBookComponentProps {
  orderBook: OrderBookData | null;
  tickerData: TickerData | null;
  currentPair: TradingPair | null;
  connectionStatus: string;
  priceChangePercent: number;
  safeParseFloat: (value: unknown) => number;
}

export const OrderBookComponent: React.FC<OrderBookComponentProps> = ({
  orderBook,
  tickerData,
  currentPair,
  connectionStatus,
  priceChangePercent,
  safeParseFloat,
}) => {
  if (!orderBook || !tickerData || !currentPair) {
    return (
      <div className="flex items-center justify-center h-full">
        {connectionStatus === "Connected" ? (
          <div className="text-center text-gray-400">
            <Circle className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <div className="text-xs md:text-sm">
              No order book data available
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Loader className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-3 animate-spin text-blue-500" />
            <div className="text-xs md:text-sm text-gray-400">
              Loading order book...
            </div>
          </div>
        )}
      </div>
    );
  }

  const maxTotal = Math.max(
    ...orderBook.asks.map((ask) => safeParseFloat(ask.size)),
    ...orderBook.bids.map((bid) => safeParseFloat(bid.size))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 md:mb-4 text-xs text-gray-400">
        <div className="grid grid-cols-3 w-full">
          <div className="text-left">Price ({currentPair.quoteAsset})</div>
          <div className="text-center hidden sm:block">
            Amount ({currentPair.baseAsset})
          </div>
          <div className="text-center sm:hidden">Amount</div>
          <div className="text-right">Total</div>
        </div>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex-1 overflow-y-auto space-y-0.5 md:space-y-1">
        {orderBook.asks
          .slice()
          .reverse()
          .slice(0, 8) // Limit to 8 entries for mobile
          .map((ask, index) => {
            const price = safeParseFloat(ask.price);
            const size = safeParseFloat(ask.size);
            const total = price * size;
            const percentage = (size / maxTotal) * 100;

            return (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 text-xs py-0.5 md:py-1"
              >
                <div
                  className="absolute inset-0 bg-red-500/10"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative text-left text-red-400 text-xs md:text-sm">
                  <span className="md:hidden">{price.toFixed(3)}</span>
                  <span className="hidden md:inline">{price.toFixed(5)}</span>
                </div>
                <div className="relative text-center text-gray-300 text-xs md:text-sm">
                  <span className="md:hidden">{size.toFixed(4)}</span>
                  <span className="hidden md:inline">{size.toFixed(6)}</span>
                </div>
                <div className="relative text-right text-gray-400 text-xs md:text-sm">
                  <span className="md:hidden">{total.toFixed(2)}</span>
                  <span className="hidden md:inline">{total.toFixed(4)}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Current Price */}
      <div
        className={`py-1.5 md:py-2 px-2 md:px-3 my-1 md:my-2 text-xs md:text-sm font-medium rounded ${
          priceChangePercent >= 0
            ? "bg-green-600/10 text-green-400"
            : "bg-red-600/10 text-red-400"
        }`}
      >
        <div className="flex justify-between items-center">
          <span>Last Price</span>
          <span>
            <span className="md:hidden">
              {safeParseFloat(tickerData.last_price).toFixed(3)}
            </span>
            <span className="hidden md:inline">
              {safeParseFloat(tickerData.last_price).toFixed(5)}
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center text-xs mt-1">
          <span>24h Change</span>
          <span>
            {priceChangePercent >= 0 ? "+" : ""}
            {priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="flex-1 overflow-y-auto space-y-0.5 md:space-y-1">
        {orderBook.bids.slice(0, 8).map((bid, index) => {
          // Limit to 8 entries for mobile
          const price = safeParseFloat(bid.price);
          const size = safeParseFloat(bid.size);
          const total = price * size;
          const percentage = (size / maxTotal) * 100;

          return (
            <div
              key={`bid-${index}`}
              className="relative grid grid-cols-3 text-xs py-0.5 md:py-1"
            >
              <div
                className="absolute inset-0 bg-green-500/10"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative text-left text-green-400 text-xs md:text-sm">
                <span className="md:hidden">{price.toFixed(3)}</span>
                <span className="hidden md:inline">{price.toFixed(5)}</span>
              </div>
              <div className="relative text-center text-gray-300 text-xs md:text-sm">
                <span className="md:hidden">{size.toFixed(4)}</span>
                <span className="hidden md:inline">{size.toFixed(6)}</span>
              </div>
              <div className="relative text-right text-gray-400 text-xs md:text-sm">
                <span className="md:hidden">{total.toFixed(2)}</span>
                <span className="hidden md:inline">{total.toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
