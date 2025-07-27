"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getUserBalances } from "@/services/ccpayment/ccpayment";
import { motion } from "framer-motion";

// Types for the new balance structure
interface WalletBalance {
  _id: string;
  user: string;
  coinId: string | number;
  coinName: string;
  balance: number;
  lockedBalance: number;
  updatedAt: string;
  __v: number;
  logoUrl?: string;
  currency?: string;
  chain?: string;
  memo?: string;
  requiredVolume?: number;
  tradingVolume?: number;
  createdAt?: string;
}

interface UserBalancesResponse {
  success: boolean;
  data: {
    exchange: WalletBalance[];
    spot: WalletBalance[];
    futures: WalletBalance[];
  };
}

// Mock data for the chart
const generateChartData = () => {
  const data = [];
  let value = 40000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value = value + (Math.random() - 0.5) * 2000;
    data.push({
      date: date.toLocaleDateString(),
      value: value,
    });
  }
  return data;
};

const BalanceSkeleton = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 bg-[#202020] rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-[#202020] rounded-full animate-pulse" />
        </div>
      </div>
      <div className="mb-4">
        <div className="h-20 w-48 bg-[#202020] rounded-lg animate-pulse mb-2" />
        <div className="h-6 w-24 bg-[#202020] rounded-lg animate-pulse" />
      </div>
      <div className="hidden md:block h-[130.1px] w-full">
        <div className="h-full w-full bg-[#202020] rounded-lg animate-pulse" />
      </div>
    </>
  );
};

const WalletBalance = () => {
  const [balancesData, setBalancesData] = useState<UserBalancesResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [chartData] = useState(generateChartData);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        const response = await getUserBalances();
        setBalancesData(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch wallet balance");
        console.error("Error fetching wallet balance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, []);

  const totalBalance = useMemo(() => {
    if (!balancesData?.data) return 0;

    const { exchange, spot, futures } = balancesData.data;

    // Calculate total from all wallet types
    const exchangeTotal = exchange.reduce((total, balance) => {
      return total + balance.balance + balance.lockedBalance;
    }, 0);

    const spotTotal = spot.reduce((total, balance) => {
      return total + balance.balance + balance.lockedBalance;
    }, 0);

    const futuresTotal = futures.reduce((total, balance) => {
      return total + balance.balance + balance.lockedBalance;
    }, 0);

    return exchangeTotal + spotTotal + futuresTotal;
  }, [balancesData]);

  const walletBreakdown = useMemo(() => {
    if (!balancesData?.data) return { exchange: 0, spot: 0, futures: 0 };

    const { exchange, spot, futures } = balancesData.data;

    return {
      exchange: exchange.reduce(
        (total, balance) => total + balance.balance + balance.lockedBalance,
        0
      ),
      spot: spot.reduce(
        (total, balance) => total + balance.balance + balance.lockedBalance,
        0
      ),
      futures: futures.reduce(
        (total, balance) => total + balance.balance + balance.lockedBalance,
        0
      ),
    };
  }, [balancesData]);

  const formatBalance = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#181818] rounded-2xl p-4 md:p-6 w-full max-w-full overflow-hidden"
    >
      {isLoading ? (
        <BalanceSkeleton />
      ) : error ? (
        <div className="text-red-400 p-4 rounded-lg text-center bg-red-500/10">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-[22.25px] text-[#4B4B4B] font-medium font-poppins">
                Wallet Balance
              </h2>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="hover:bg-[#1f1f1f] p-1 rounded-full transition-colors cursor-pointer"
              >
                {isBalanceHidden ? (
                  <EyeOff size={18} className="text-gray-400" />
                ) : (
                  <Eye size={18} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-4xl md:text-[75.63px] font-sg font-medium mb-2 text-[#fff] break-all">
              {isBalanceHidden ? "****" : `$${formatBalance(totalBalance)}`}
            </h1>
            <div className="text-gray-400 text-sm">Total Balance</div>
          </div>

          {/* Wallet Breakdown */}
          {!isBalanceHidden && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#202020] rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Exchange</div>
                <div className="text-sm font-medium text-white">
                  ${formatBalance(walletBreakdown.exchange)}
                </div>
              </div>
              <div className="bg-[#202020] rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Spot</div>
                <div className="text-sm font-medium text-white">
                  ${formatBalance(walletBreakdown.spot)}
                </div>
              </div>
              <div className="bg-[#202020] rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">VIP Trade</div>
                <div className="text-sm font-medium text-white">
                  ${formatBalance(walletBreakdown.futures)}
                </div>
              </div>
            </div>
          )}

          {/* Chart section */}
          <div className="hidden md:block h-[130.1px] w-full pb-8 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f1f1f",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3AEBA5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default WalletBalance;
