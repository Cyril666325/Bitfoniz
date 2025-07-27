"use client";

import {
  getTransactionHistory,
  getUserBalances,
} from "@/services/ccpayment/ccpayment";
import type { Balance } from "@/types/balance";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import QuickActions from "../components/QuickActions";
import AssetQuickActions from "./AssetQuickActions";

// Add Transaction type
interface Transaction {
  _id: string;
  user: string;
  status: string;
  webhookStatus: string;
  coinId: number;
  memo: string;
  recordId: string;
  logoUrl: string;
  amount: number;
  fee: number;
  txHash: string | null;
  confirmations: number;
  externalId: string | null;
  externalStatus: string | null;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const BalanceSkeleton = () => (
  <div className="bg-[#181818] rounded-2xl p-6 animate-pulse">
    <div className="h-8 w-32 bg-[#202020] rounded-lg mb-4" />
    <div className="h-12 w-48 bg-[#202020] rounded-lg mb-2" />
    <div className="h-6 w-24 bg-[#202020] rounded-lg" />
  </div>
);

const TransactionSkeleton = () => (
  <div className="bg-[#181818] rounded-xl p-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-[#202020] rounded-full" />
        <div>
          <div className="h-5 w-24 bg-[#202020] rounded mb-2" />
          <div className="h-4 w-32 bg-[#202020] rounded" />
        </div>
      </div>
      <div className="h-6 w-20 bg-[#202020] rounded" />
    </div>
  </div>
);

const AssetsPage = () => {
  const [exchangeBalances, setExchangeBalances] = useState<Balance[]>([]);
  const [spotBalances, setSpotBalances] = useState<Balance[]>([]);
  const [futuresBalances, setFuturesBalances] = useState<Balance[]>([]);
  const [, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [balanceResponse, transactionResponse] = await Promise.all([
          getUserBalances(),
          getTransactionHistory(),
        ]);

        if (balanceResponse.success && balanceResponse.data) {
          setExchangeBalances(balanceResponse.data.exchange || []);
          setSpotBalances(balanceResponse.data.spot || []);
          setFuturesBalances(balanceResponse.data.futures || []);

          // Calculate total balance across all wallet types
          const total = [
            ...(balanceResponse.data.exchange || []),
            ...(balanceResponse.data.spot || []),
            ...(balanceResponse.data.futures || []),
          ].reduce((acc: number, curr: Balance) => acc + curr.balance, 0);

          setTotalBalance(total);
        }

        if (transactionResponse.transactions) {
          setTransactions(transactionResponse.transactions);
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMainBalance = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return new Intl.DateTimeFormat("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   }).format(date);
  // };

  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case "completed":
  //       return "bg-green-500/20 text-green-400";
  //     case "pending":
  //       return "bg-yellow-500/20 text-yellow-400";
  //     case "failed":
  //       return "bg-red-500/20 text-red-400";
  //     default:
  //       return "bg-gray-500/20 text-gray-400";
  //   }
  // };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="h-[200px] bg-[#181818] rounded-3xl animate-pulse" />
        <div className="h-[120px] bg-[#181818] rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <BalanceSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[#181818] rounded animate-pulse" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <TransactionSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 md:pt-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] bg-[#181818] rounded-3xl p-8 md:p-12 border border-red-500/20"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl md:text-2xl font-medium text-red-400 mb-3">
            {error}
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-8">
            We encountered an error while fetching your assets. Please try
            again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-red-400"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const allBalances = [
    ...exchangeBalances,
    ...spotBalances,
    ...futuresBalances,
  ];

  if (allBalances.length === 0) {
    return (
      <div className="pt-4 md:pt-6 space-y-6">
        <div className="bg-gradient-to-br from-[#3AEBA5]/20 to-[#2CD690]/20 rounded-3xl p-6 md:p-8 border border-[#3AEBA5]/20">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Welcome to BITFONIZ
          </h1>
          <p className="text-gray-400 mb-6">
            Start your trading journey by adding funds to your account
          </p>
          <AssetQuickActions />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[300px] bg-[#181818] rounded-3xl p-8 md:p-12"
        >
          <Wallet className="w-16 h-16 text-gray-400 mb-6" />
          <h2 className="text-xl md:text-2xl font-medium text-gray-200 mb-3">
            No Assets Found
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-8">
            You don&apos;t have any assets in your wallet yet. Start by
            depositing some funds.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = "/dashboard/deposit")}
            className="px-8 py-3 bg-gradient-to-r from-[#3AEBA5] to-[#2CD690] text-black font-medium rounded-xl hover:shadow-lg hover:shadow-[#3AEBA5]/20 transition-all"
          >
            Deposit Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-4 md:pt-6 space-y-6 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#181818] rounded-3xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 col-span-1">
              <div>
                <Image
                  src="/assets/dashboard/assetsicon.svg"
                  alt="BITFONIZ"
                  width={71.03}
                  height={26}
                />
                <h3 className="text-[#4B4B4B] text-[10px] font-poppins font-medium mb-2">
                  Wallet Balance
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] md:text-4xl font-semibold font-sg">
                    ${formatMainBalance(totalBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <QuickActions />
      </div>

      {/* My Account Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-medium text-gray-200">My Account</h2>
        </div>

        {/* Exchange Account */}
        <div className="bg-[#181818] rounded-2xl p-6 border border-[#ffffff10]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#4B4B4B] text-sm font-medium mb-1">
                Exchange
              </h3>
              <p className="text-2xl font-semibold text-white">
                $
                {exchangeBalances.length > 0
                  ? formatMainBalance(
                      exchangeBalances.reduce(
                        (total, balance) => total + balance.balance,
                        0
                      )
                    )
                  : "0.00"}
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Trade (Spot) Account */}
        <div className="bg-[#181818] rounded-2xl p-6 border border-[#ffffff10]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#4B4B4B] text-sm font-medium mb-1">Trade</h3>
              <p className="text-2xl font-semibold text-white">
                $
                {spotBalances.length > 0
                  ? formatMainBalance(
                      spotBalances.reduce(
                        (total, balance) => total + balance.balance,
                        0
                      )
                    )
                  : "0.00"}
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Perpetual Account */}
        <div className="bg-[#181818] rounded-2xl p-6 border border-[#ffffff10]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#4B4B4B] text-sm font-medium mb-1">
                Contract
              </h3>
              <p className="text-2xl font-semibold text-white">
                $
                {futuresBalances.length > 0
                  ? formatMainBalance(
                      futuresBalances.reduce(
                        (total, balance) => total + balance.balance,
                        0
                      )
                    )
                  : "0.00"}
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="space-y-4 mb-40">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-medium text-gray-200">
            Recent Transactions
          </h2>
        </div>

        <div className="bg-[#181818] rounded-2xl border border-[#ffffff10]">
          {transactions.length > 0 ? (
            <div className="divide-y divide-[#ffffff10]">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2A2D36] rounded-full flex items-center justify-center">
                        <ArrowUpDown className="w-5 h-5 text-[#3AEBA5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {transaction.amount.toFixed(2)}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        ID:{" "}
                        {transaction.recordId
                          ? transaction.recordId.slice(0, 12) + "..."
                          : "N/A"}
                      </div>
                      {transaction.fee > 0 && (
                        <div className="text-xs text-gray-500">
                          Fee: {transaction.fee}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
              <h3 className="text-lg font-medium text-gray-300 mb-1">
                No Transactions Yet
              </h3>
              <p className="text-gray-400 text-sm">
                Your transaction history will appear here
              </p>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default AssetsPage;
