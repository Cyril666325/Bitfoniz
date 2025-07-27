"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  Filter,
  Search,
  Loader,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  History,
} from "lucide-react";
import { depositHistory, withdrawalHistory } from "@/services/admin";
import { toast } from "sonner";

interface DepositRecord {
  _id: string;
  user: string;
  type: string;
  status: string;
  webhookStatus: string;
  coinId: number;
  address: string;
  chain: string;
  memo: string;
  orderId: string;
  logoUrl: string;
  amount: number;
  currency: string;
  fee: number;
  txHash: string | null;
  confirmations: number;
  externalId: string | null;
  externalStatus: string | null;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reason?: string;
}

interface WithdrawalRecord {
  _id: string;
  user: string;
  type: string;
  status: string;
  webhookStatus: string;
  coinId: number;
  address: string;
  chain: string;
  memo: string;
  orderId: string;
  recordId: string;
  logoUrl: string;
  amount: number;
  currency: string;
  fee: number;
  txHash: string | null;
  confirmations: number;
  externalId: string | null;
  externalStatus: string | null;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reason?: string;
}

const DepositWithdrawalHistoryPage: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">(
    "deposits"
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoadingDeposits(true);
      setIsLoadingWithdrawals(true);

      const [depositsResponse, withdrawalsResponse] = await Promise.all([
        depositHistory(),
        withdrawalHistory(),
      ]);

      if (depositsResponse.status) {
        setDeposits(depositsResponse.data);
      }

      if (withdrawalsResponse.status) {
        setWithdrawals(withdrawalsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch deposit/withdrawal history");
    } finally {
      setIsLoadingDeposits(false);
      setIsLoadingWithdrawals(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-600 text-white",
      processing: "bg-blue-600 text-white",
      completed: "bg-green-600 text-white",
      cancelled: "bg-red-600 text-white",
      rejected: "bg-red-600 text-white",
      failed: "bg-red-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status.toLowerCase() as keyof typeof styles] ||
          "bg-gray-600 text-white"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(num);
  };

  const copyToClipboard = (text: string, label: string = "Text") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch =
      deposit.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deposit.currency || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (deposit.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deposit.memo || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || deposit.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    // Filter out specific order ID
    const isExcludedOrderId =
      withdrawal.orderId === "6847ee2c39e1b43e826754c7_1751452603032";

    const matchesSearch =
      withdrawal.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (withdrawal.currency || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (withdrawal.recordId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (withdrawal.reason || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (withdrawal.memo || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      withdrawal.status.toLowerCase() === statusFilter;

    return !isExcludedOrderId && matchesSearch && matchesStatus;
  });

  // Calculate stats
  const depositStats = {
    total: deposits.length,
    pending: deposits.filter((d) => d.status.toLowerCase() === "pending")
      .length,
    processing: deposits.filter((d) => d.status.toLowerCase() === "processing")
      .length,
    completed: deposits.filter((d) => d.status.toLowerCase() === "completed")
      .length,
    totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0),
  };

  const withdrawalStats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status.toLowerCase() === "pending")
      .length,
    processing: withdrawals.filter(
      (w) => w.status.toLowerCase() === "processing"
    ).length,
    completed: withdrawals.filter((w) => w.status.toLowerCase() === "completed")
      .length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-400" />
            <span>Deposit & Withdrawal History</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor all deposit and withdrawal transactions
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoadingDeposits || isLoadingWithdrawals}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isLoadingDeposits || isLoadingWithdrawals ? "animate-spin" : ""
            }`}
          />
          <span>
            {isLoadingDeposits || isLoadingWithdrawals
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deposits */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-600/20 rounded">
              <ArrowDownRight className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {depositStats.total}
            </h3>
            <p className="text-gray-400 text-sm">Deposits</p>
            <p className="text-green-400 text-xs mt-1">
              ${formatNumber(depositStats.totalAmount)}
            </p>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-600/20 rounded">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {withdrawalStats.total}
            </h3>
            <p className="text-gray-400 text-sm">Withdrawals</p>
            <p className="text-red-400 text-xs mt-1">
              ${formatNumber(withdrawalStats.totalAmount)}
            </p>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-600/20 rounded">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xs text-gray-400">Pending</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {depositStats.pending + withdrawalStats.pending}
            </h3>
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-yellow-400 text-xs mt-1">
              {depositStats.pending} deposits, {withdrawalStats.pending}{" "}
              withdrawals
            </p>
          </div>
        </div>

        {/* Completed Transactions */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-600/20 rounded">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs text-gray-400">Completed</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {depositStats.completed + withdrawalStats.completed}
            </h3>
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-blue-400 text-xs mt-1">
              {depositStats.completed} deposits, {withdrawalStats.completed}{" "}
              withdrawals
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "deposits"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Deposits ({depositStats.total})
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "withdrawals"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Withdrawals ({withdrawalStats.total})
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID, address, chain, currency, reason, or memo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#2A2D36] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#2A2D36] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2A2D36]">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                {activeTab === "withdrawals" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Record ID
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Chain/Network
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {activeTab === "deposits" ? (
                isLoadingDeposits ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading deposits...
                    </td>
                  </tr>
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No deposits found
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <tr
                      key={deposit._id}
                      className="hover:bg-[#2A2D36] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-mono">
                          {deposit.orderId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {deposit.type.replace("_", " ").toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {formatNumber(deposit.amount)}{" "}
                          {deposit.currency || "USDT"}
                        </div>
                        {deposit.fee > 0 && (
                          <div className="text-xs text-gray-400">
                            Fee: {formatNumber(deposit.fee)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {deposit.chain}
                        </div>
                        <div className="text-xs text-gray-400">
                          Coin ID: {deposit.coinId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-mono max-w-xs truncate">
                          {deposit.address}
                        </div>
                        {deposit.memo && (
                          <div className="text-xs text-gray-400">
                            Memo: {deposit.memo}
                          </div>
                        )}
                        {deposit.reason && (
                          <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded mt-1">
                            Reason: {deposit.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getStatusBadge(deposit.status)}
                          <div className="text-xs text-gray-400">
                            Webhook: {deposit.webhookStatus}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {new Date(deposit.createdAt).toLocaleString()}
                        </div>
                        {deposit.completedAt && (
                          <div className="text-xs text-gray-400">
                            Completed:{" "}
                            {new Date(deposit.completedAt).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              copyToClipboard(deposit.orderId, "Order ID")
                            }
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Copy Order ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {deposit.txHash && (
                            <a
                              href={`https://etherscan.io/tx/${deposit.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Transaction"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : // Withdrawals
              isLoadingWithdrawals ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading withdrawals...
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal._id}
                    className="hover:bg-[#2A2D36] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-mono">
                        {withdrawal.orderId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {withdrawal.type.replace("_", " ").toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-mono">
                        {withdrawal.recordId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {formatNumber(withdrawal.amount)}{" "}
                        {withdrawal.currency || "USDT"}
                      </div>
                      {withdrawal.fee > 0 && (
                        <div className="text-xs text-gray-400">
                          Fee: {formatNumber(withdrawal.fee)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {withdrawal.chain}
                      </div>
                      <div className="text-xs text-gray-400">
                        Coin ID: {withdrawal.coinId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-mono max-w-xs truncate">
                        {withdrawal.address}
                      </div>
                      {withdrawal.memo && (
                        <div className="text-xs text-gray-400">
                          Memo: {withdrawal.memo}
                        </div>
                      )}
                      {withdrawal.reason && (
                        <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded mt-1">
                          Reason: {withdrawal.reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getStatusBadge(withdrawal.status)}
                        <div className="text-xs text-gray-400">
                          Webhook: {withdrawal.webhookStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </div>
                      {withdrawal.completedAt && (
                        <div className="text-xs text-gray-400">
                          Completed:{" "}
                          {new Date(withdrawal.completedAt).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            copyToClipboard(withdrawal.orderId, "Order ID")
                          }
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Copy Order ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(withdrawal.recordId, "Record ID")
                          }
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Copy Record ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {withdrawal.txHash && (
                          <a
                            href={`https://etherscan.io/tx/${withdrawal.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Transaction"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepositWithdrawalHistoryPage;
