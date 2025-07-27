import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import React from "react";

interface TradingFormProps {
  orderCode: string;
  setOrderCode: (code: string) => void;
  currentPair: {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    displayName: string;
    tradingViewSymbol: string;
    isActive: boolean;
  } | null;
  orderLoading: boolean;
  validateOrder: () => boolean;
  handleSubmitOrder: () => Promise<void>;
  orderResponse: {
    orderId: string;
    copyCode: string;
    symbol: string;
    side: string;
    originalPrice: number;
    expectedFinalPrice: number;
    profitPercentage: number;
    expiration: string | null;
    status: string;
  } | null;
  orderError: string | null;
}

export const TradingForm: React.FC<TradingFormProps> = ({
  orderCode,
  setOrderCode,
  currentPair,
  orderLoading,
  validateOrder,
  handleSubmitOrder,
  orderResponse,
  orderError,
}) => {
  return (
    <div className="h-full bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg">
      <div className="border-b border-gray-800">
        <div className="p-2 md:p-4">
          <h3 className="font-semibold text-sm md:text-base">Follow Trade</h3>
        </div>
      </div>
      <div className="p-2 md:p-4 h-[calc(100%-50px)] overflow-y-auto">
        <div className="space-y-3 md:space-y-4">
          <div>
            <label
              htmlFor="orderCode"
              className="block text-xs md:text-sm font-medium text-gray-400 mb-2"
            >
              Order Code
            </label>
            <input
              type="text"
              id="orderCode"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Enter order code to follow"
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#2A2D36] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 text-sm md:text-base"
            />
          </div>

          {currentPair && (
            <div className="bg-[#2A2D36] rounded-lg p-3 md:p-4 space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Trading Pair</span>
                <span className="text-white font-medium">
                  {currentPair.displayName}
                </span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Base Asset</span>
                <span className="text-white">{currentPair.baseAsset}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Quote Asset</span>
                <span className="text-white">{currentPair.quoteAsset}</span>
              </div>
            </div>
          )}

          {orderError && (
            <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-red-400">{orderError}</p>
            </div>
          )}

          <Button
            onClick={handleSubmitOrder}
            disabled={!validateOrder() || orderLoading}
            className="w-full h-10 md:h-12 text-sm md:text-base font-medium"
          >
            {orderLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Following Trade...
              </>
            ) : (
              "Follow Trade"
            )}
          </Button>

          {orderResponse && (
            <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">
                  Order ID
                </span>
                <span className="text-xs md:text-sm text-white font-mono">
                  {orderResponse.orderId.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">
                  Copy Code
                </span>
                <span className="text-xs md:text-sm text-white font-mono">
                  {orderResponse.copyCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">Side</span>
                <span
                  className={`text-xs md:text-sm font-medium ${
                    orderResponse.side === "buy"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {orderResponse.side.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">
                  Entry Price
                </span>
                <span className="text-xs md:text-sm text-white">
                  {orderResponse.originalPrice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">
                  Target Price
                </span>
                <span className="text-xs md:text-sm text-white">
                  {orderResponse.expectedFinalPrice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">
                  Expected Profit
                </span>
                <span className="text-xs md:text-sm text-green-400 font-medium">
                  +{orderResponse.profitPercentage}%
                </span>
              </div>
              {orderResponse.expiration && (
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-400">
                    Expires At
                  </span>
                  <span className="text-xs md:text-sm text-white">
                    {new Date(orderResponse.expiration).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-400">Status</span>
                <span className="text-xs md:text-sm text-yellow-400 capitalize font-medium">
                  {orderResponse.status.replace("_", " ")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
