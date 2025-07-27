import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Loader,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import React from "react";

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

interface OrderConfirmationModalProps {
  orderDetails: FuturesOrderDetails;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderDetails,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  // const getRiskLevel = (
  //   leverage: number
  // ): { level: string; color: string; bgColor: string } => {
  //   if (leverage <= 5)
  //     return {
  //       level: "Low",
  //       color: "text-green-400",
  //       bgColor: "bg-green-600/20 border-green-600/30",
  //     };
  //   if (leverage <= 10)
  //     return {
  //       level: "Medium",
  //       color: "text-yellow-400",
  //       bgColor: "bg-yellow-600/20 border-yellow-600/30",
  //     };
  //   if (leverage <= 25)
  //     return {
  //       level: "High",
  //       color: "text-orange-400",
  //       bgColor: "bg-orange-600/20 border-orange-600/30",
  //     };
  //   return {
  //     level: "Extreme",
  //     color: "text-red-400",
  //     bgColor: "bg-red-600/20 border-red-600/30",
  //   };
  // };

  // const riskLevel = getRiskLevel(orderDetails.leverage);

  // const potentialPnL = {
  //   profit: orderDetails.totalValue * 0.1, // 10% profit simulation
  //   loss: orderDetails.margin * 0.8, // 80% of margin loss simulation
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Confirm Futures Order
                </h2>
                <p className="text-gray-400 text-xs md:text-sm">
                  Review and confirm your futures trade
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Order Summary */}
          <div className="bg-[#2A2D36] rounded-lg p-3 md:p-4 border border-gray-600">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <h3 className="text-base md:text-lg font-semibold text-white">
                Order Summary
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Order Code:</span>
                  <span className="text-white font-mono text-xs md:text-sm">
                    {orderDetails.orderCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Trading Pair:</span>
                  <span className="text-white font-medium text-sm">
                    {orderDetails.pair.replace("_", "/")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Position Type:</span>
                  <div className="flex items-center space-x-2">
                    {orderDetails.positionType === "long" ? (
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                    )}
                    <span
                      className={`font-bold uppercase text-xs md:text-sm ${
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

              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Entry Price:</span>
                  <span className="text-white font-mono text-sm">
                    ${orderDetails.entryPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Quantity:</span>
                  <span className="text-white font-mono text-sm">
                    {orderDetails.quantity.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Leverage:</span>
                  <span className="text-yellow-400 font-bold text-sm">
                    {orderDetails.leverage}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-[#2A2D36] rounded-lg p-3 md:p-4 border border-gray-600">
              <div className="flex items-center space-x-2 mb-2 md:mb-3">
                <DollarSign className="w-4 h-4 text-green-400" />
                <h4 className="font-semibold text-white text-sm md:text-base">
                  Financial Details
                </h4>
              </div>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Margin Required:</span>
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
                  <span className="text-gray-400">Trading Fees:</span>
                  <span className="text-white font-mono">
                    ${orderDetails.fees.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Usage:</span>
                  <span className="text-blue-400 font-medium">
                    {orderDetails.tradePercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* <div
              className={`rounded-lg p-3 md:p-4 border ${riskLevel.bgColor}`}
            >
              <div className="flex items-center space-x-2 mb-2 md:mb-3">
                <AlertTriangle className={`w-4 h-4 ${riskLevel.color}`} />
                <h4 className="font-semibold text-white text-sm md:text-base">
                  Risk Assessment
                </h4>
              </div>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Level:</span>
                  <span className={`font-bold ${riskLevel.color}`}>
                    {riskLevel.level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liquidation:</span>
                  <span className="text-red-400 font-mono">
                    ${orderDetails.liquidationPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Loss:</span>
                  <span className="text-red-400 font-mono">
                    -${potentialPnL.loss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential Profit:</span>
                  <span className="text-green-400 font-mono">
                    +${potentialPnL.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Risk Management */}
          {(orderDetails.stopLoss || orderDetails.takeProfit) && (
            <div className="bg-[#2A2D36] rounded-lg p-3 md:p-4 border border-gray-600">
              <div className="flex items-center space-x-2 mb-2 md:mb-3">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <h4 className="font-semibold text-white text-sm md:text-base">
                  Risk Management
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                {orderDetails.stopLoss && (
                  <div className="bg-red-600/10 p-3 rounded border border-red-600/20">
                    <div className="text-gray-400 mb-1">Stop Loss</div>
                    <div className="text-red-400 font-mono font-bold">
                      ${orderDetails.stopLoss.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Loss limit:{" "}
                      {(
                        ((orderDetails.entryPrice - orderDetails.stopLoss) /
                          orderDetails.entryPrice) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                )}
                {orderDetails.takeProfit && (
                  <div className="bg-green-600/10 p-3 rounded border border-green-600/20">
                    <div className="text-gray-400 mb-1">Take Profit</div>
                    <div className="text-green-400 font-mono font-bold">
                      ${orderDetails.takeProfit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Profit target:{" "}
                      {(
                        ((orderDetails.takeProfit - orderDetails.entryPrice) /
                          orderDetails.entryPrice) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Warning */}
          {/* <div className="bg-red-600/10 rounded-lg p-3 md:p-4 border border-red-600/30">
            <div className="flex items-start space-x-2 md:space-x-3">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-red-400">
                <div className="font-semibold mb-2 text-sm md:text-base">
                  Final Risk Warning
                </div>
                <div className="text-xs md:text-sm text-red-400/80 space-y-1">
                  <p>• Futures trading involves substantial risk of loss</p>
                  <p>• You can lose more than your initial margin</p>
                  <p>• High leverage amplifies both profits and losses</p>
                  <p>• Market volatility can trigger automatic liquidation</p>
                  <p>• Only trade with funds you can afford to lose</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Confirmation Checkbox */}
          {/* <div className="bg-[#2A2D36] rounded-lg p-3 md:p-4 border border-gray-600">
            <div className="flex items-start space-x-2 md:space-x-3">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mt-0.5" />
              <div className="text-xs md:text-sm text-gray-300">
                <p>By confirming this order, I acknowledge that:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                  <li>I have reviewed all order details carefully</li>
                  <li>I understand the risks involved in futures trading</li>
                  <li>I am aware of the potential for significant losses</li>
                  <li>I have sufficient margin to maintain this position</li>
                </ul>
              </div>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-10 md:h-12 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel Order
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-10 md:h-12 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Confirm & Execute
                </>
              )}
            </Button>
          </div>

          <div className="text-center mt-3">
            <div className="text-xs text-gray-500">
              This action cannot be undone. Please ensure all details are
              correct.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
