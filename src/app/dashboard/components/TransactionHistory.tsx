"use client";

import { useEffect, useState } from "react";
import { getTransactionHistory } from "@/services/ccpayment/ccpayment";
import EmptyStateIcon from "@/components/ui/EmptyStateIcon";
import { motion } from "framer-motion";
import { Clock, ArrowUpDown, Loader } from "lucide-react";

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

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await getTransactionHistory();
        if (response.transactions) {
          setTransactions(response.transactions);
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch transactions");
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#141414] rounded-2xl p-4 md:p-6 w-full max-w-[650px] h-[452.68px] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-48 bg-[#202020] rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] rounded-2xl p-4 md:p-6 w-full max-w-[650px] h-[452.68px] overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-red-400 text-lg font-medium mb-2">{error}</h3>
          <p className="text-[#4B4B4B] text-sm text-center max-w-[250px] mb-4">
            We encountered an error while fetching your transactions
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-red-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[#141414] rounded-2xl p-4 md:p-6 w-full max-w-[650px] h-[452.68px] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg md:text-[21.1px] text-[#fff] font-medium leading-none">
            Transaction History
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center h-[300px]">
          <EmptyStateIcon className="mx-auto mb-4" />
          <h3 className="text-[#717171] text-lg font-medium mb-2">
            No Recent Transactions
          </h3>
          <p className="text-[#4B4B4B] text-sm text-center max-w-[250px]">
            Your transaction history will appear here once you start trading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] rounded-2xl p-4 md:p-6 w-full max-w-[650px] h-[452.68px] overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg md:text-[21.1px] text-[#fff] font-medium leading-none">
          Transaction History
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors"
          title="Refresh"
        >
          <Loader className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      <div className="divide-y divide-[#ffffff10]">
        {transactions.map((transaction) => (
          <motion.div
            key={transaction._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 hover:bg-[#1a1a1a] transition-colors rounded-xl px-3"
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
    </div>
  );
};

export default TransactionHistory;
