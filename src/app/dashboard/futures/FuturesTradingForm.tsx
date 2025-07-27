import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

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

interface FuturesTradingFormProps {
  orderCode: string;
  setOrderCode: (code: string) => void;
  currentPair: FuturesTradingPair | null;
  orderLoading: boolean;
  validateOrder: () => boolean;
  handleOrderCodeSubmit: () => void;
  getOrderDetailsFromCode: (code: string) => FuturesOrderDetails | null;
  availableMargin: number;
}

export const FuturesTradingForm: React.FC<FuturesTradingFormProps> = ({
  orderCode,
  setOrderCode,
  currentPair,
  orderLoading,
  validateOrder,
  handleOrderCodeSubmit,
  getOrderDetailsFromCode,
  availableMargin,
}) => {
  const orderDetails = orderCode ? getOrderDetailsFromCode(orderCode) : null;

  return (
    <div className="h-full bg-[#1A1D24] rounded-lg border border-gray-800 shadow-lg mb-20">
      <div className="p-3 md:p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          <h3 className="text-base md:text-lg font-semibold text-white">
            Execute Futures Order
          </h3>
        </div>
      </div>

      <div className="p-3 md:p-4 space-y-3 md:space-y-4 h-[calc(100%-50px)] md:h-[calc(100%-60px)] overflow-y-auto">
        {/* Available Margin */}
        <div className="bg-[#2A2D36] p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400 mb-1">Available Margin</div>
          <div className="text-base md:text-lg font-bold text-green-400">
            ${availableMargin.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Use margin responsibly - high leverage increases risk
          </div>
        </div>

        {/* Order Code input */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium">
            Futures Order Code
          </label>
          <Input
            type="text"
            placeholder="Enter your futures order code"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            className="h-10 md:h-12 bg-[#2A2D36] border-gray-600 text-sm focus:border-yellow-500 transition-colors"
          />
          <div className="text-xs text-gray-500">
            Enter the futures order code provided to you
          </div>
        </div>

        {/* Current pair info */}
        {currentPair && (
          <div className="bg-[#2A2D36] p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Trading Pair</div>
            <div className="text-sm font-medium">{currentPair.displayName}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Max Leverage:</span>
                <span className="text-yellow-400 font-bold ml-1">
                  {currentPair.maxLeverage}x
                </span>
              </div>
              <div>
                <span className="text-gray-500">Min Margin:</span>
                <span className="text-white ml-1">
                  ${currentPair.minMargin}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Preview */}
        {orderDetails && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Order Details Preview
              </span>
            </div>

            {/* Position Type */}
            <div className="bg-[#2A2D36] p-3 rounded border border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Position Type</span>
                <div className="flex items-center space-x-2">
                  {orderDetails.positionType === "long" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-bold uppercase ${
                      orderDetails.positionType === "long"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {orderDetails.positionType}
                  </span>
                </div>
              </div>
            </div>

            {/* Trade Details */}
            <div className="bg-[#2A2D36] p-3 rounded border border-gray-600 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Price:</span>
                    <span className="text-white font-mono">
                      ${orderDetails.entryPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white font-mono">
                      {orderDetails.quantity.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Leverage:</span>
                    <span className="text-yellow-400 font-bold">
                      {orderDetails.leverage}x
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Margin:</span>
                    <span className="text-white font-mono">
                      ${orderDetails.margin.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Value:</span>
                    <span className="text-white font-mono">
                      ${orderDetails.totalValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trade %:</span>
                    <span className="text-blue-400 font-medium">
                      {orderDetails.tradePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Management */}
            {(orderDetails.stopLoss || orderDetails.takeProfit) && (
              <div className="bg-[#2A2D36] p-3 rounded border border-gray-600">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    Risk Management
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {orderDetails.stopLoss && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stop Loss:</span>
                      <span className="text-red-400 font-mono">
                        ${orderDetails.stopLoss.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {orderDetails.takeProfit && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Take Profit:</span>
                      <span className="text-green-400 font-mono">
                        ${orderDetails.takeProfit.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Liquidation Risk */}
            <div className="bg-red-600/10 p-3 rounded border border-red-600/30">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">
                  Liquidation Risk
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Liq. Price:</span>
                  <span className="text-red-400 font-mono">
                    ${orderDetails.liquidationPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fees:</span>
                  <span className="text-white font-mono">
                    ${orderDetails.fees.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-yellow-600/10 p-3 rounded border border-yellow-600/30">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-400">
                  <div className="font-medium mb-1">High Risk Warning</div>
                  <div className="text-yellow-400/80">
                    Futures trading involves substantial risk. You can lose more
                    than your initial margin. Ensure you understand the risks
                    before proceeding.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          className={`w-full h-10 md:h-12 text-sm font-bold transition-all duration-200 shadow-lg ${
            orderDetails
              ? "bg-yellow-600 hover:bg-yellow-700 hover:shadow-yellow-500/25"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25"
          }`}
          onClick={handleOrderCodeSubmit}
          disabled={orderLoading || !validateOrder()}
        >
          {orderLoading ? (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {orderDetails ? "Confirm Futures Order" : "Get Order Details"}
        </Button>

        {orderDetails && (
          <div className="text-center">
            <div className="text-xs text-gray-400">
              Review all details carefully before confirming
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
