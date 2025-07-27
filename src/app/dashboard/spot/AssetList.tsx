import { RefreshCw, Loader } from "lucide-react";
import React from "react";

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

interface AssetsListProps {
  balances: SpotBalance[];
  balanceLoading: boolean;
  tickerData: TickerData | null;
  refreshBalances: () => Promise<void>;
  formatBalance: (balance: number) => string;
  safeParseFloat: (value: unknown) => number;
}

export const AssetsList: React.FC<AssetsListProps> = ({
  balances,
  balanceLoading,
  tickerData,
  refreshBalances,
  formatBalance,
  safeParseFloat,
}) => {
  return (
    <div className="bg-[#1A1D24] border-b border-gray-800">
      <div className="p-2 md:p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Spot Assets</h2>
          <button
            onClick={refreshBalances}
            disabled={balanceLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Balances"
          >
            <RefreshCw
              className={`w-4 h-4 ${balanceLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="text-left pb-2 pr-4">Asset</th>
                <th className="text-right pb-2 px-4">Available Balance</th>
                <th className="text-right pb-2 px-4 hidden md:table-cell">
                  In Order
                </th>
                <th className="text-right pb-2 pl-4">Estimated Value</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {balanceLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <Loader className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-500" />
                    <div className="text-gray-400">Loading balances...</div>
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="text-gray-400">No assets found</div>
                  </td>
                </tr>
              ) : (
                balances.map((balance) => {
                  const price = safeParseFloat(tickerData?.last_price || 0);
                  const value = balance.balance * price;

                  return (
                    <tr
                      key={balance._id}
                      className="border-t border-gray-800 hover:bg-[#2A2D36] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium">{balance.coinName}</div>
                        <div className="text-xs text-gray-400">
                          {balance.coinId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium">
                          {formatBalance(balance.balance)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        <div className="text-gray-400">0.00000000</div>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className="font-medium">
                          ${formatBalance(value)}
                        </div>
                        <div className="text-xs text-gray-400">
                          ≈ {formatBalance(balance.balance)} {balance.coinId}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
