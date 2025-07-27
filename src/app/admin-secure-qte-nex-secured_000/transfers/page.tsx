"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  approveWithdrawalRequest,
  getTransfers,
  getTransferStats,
  getWithdrawalRequests,
  rejectWithdrawalRequest,
} from "@/services/admin";
import {
  CheckCircle,
  DollarSign,
  Filter,
  Loader,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface TransferStats {
  period: string;
  totalTransfers: number;
  totalVolume: number;
  totalFees: number;
  transfersByType: Array<{
    _id: string;
    count: number;
    volume: number;
  }>;
  transfersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  topCoins: Array<{
    _id: string;
    volume: number;
    count: number;
  }>;
}

interface Transfer {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  fromAccount: string;
  toAccount: string;
  coinId: string;
  coinName: string;
  amount: number;
  fee: number;
  feeType: string;
  netAmount: number;
  requiredVolume: number;
  currentVolume: number;
  volumeMet: boolean;
  status: string;
  transferType: string;
  createdAt: string;
  updatedAt: string;
}

interface WithdrawalRequest {
  _id: string;
  user: {
    _id: string;
    email: string;
    phonenumber?: string | null;
  };
  coinId: number;
  coinName: string;
  amount: number;
  address: string;
  chain: string;
  memo: string;
  walletType: string;
  status: string;
  declineReason: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    email: string;
  };
  orderId?: string;
  processedAt?: string;
  recordId?: string;
}

const TransfersPage: React.FC = () => {
  const [stats, setStats] = useState<TransferStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoadingStats(true);
      setIsLoadingWithdrawals(true);
      setIsLoadingTransfers(true);

      const [statsResponse, withdrawalsResponse, transfersResponse] =
        await Promise.all([
          getTransferStats(),
          getWithdrawalRequests(),
          getTransfers(),
        ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (withdrawalsResponse.success) {
        setWithdrawals(withdrawalsResponse.data);
      }

      if (transfersResponse.success) {
        setTransfers(transfersResponse.data.transfers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingWithdrawals(false);
      setIsLoadingTransfers(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-600 text-white",
      completed: "bg-green-600 text-white",
      cancelled: "bg-red-600 text-white",
      rejected: "bg-red-600 text-white",
      processing: "bg-blue-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-600 text-white"
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

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    // Check for null or invalid data
    if (
      !withdrawal ||
      !withdrawal._id ||
      !withdrawal.user ||
      !withdrawal.user.email ||
      !withdrawal.amount ||
      !withdrawal.coinName ||
      !withdrawal.status ||
      !withdrawal.chain ||
      !withdrawal.address
    ) {
      return false;
    }
    // if (withdrawal.user?.email?.toLowerCase() === "onarigeorge013@gmail.com") {
    //   return false;
    // }

    const matchesSearch =
      (withdrawal.user?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (withdrawal.coinName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (withdrawal.recordId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || withdrawal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle approve withdrawal request
  const handleApprove = async (requestId: string) => {
    if (!requestId) {
      toast.error("Invalid request ID");
      return;
    }

    try {
      setProcessingId(requestId);
      const response = await approveWithdrawalRequest(requestId);

      if (response.success) {
        toast.success("Withdrawal request approved successfully");
        // Update the status locally
        setWithdrawals((prev) =>
          prev.map((req) =>
            req._id === requestId
              ? {
                  ...req,
                  status: "approved",
                  approvedBy: response.data?.approvedBy || null,
                }
              : req
          )
        );
        // Refresh data to get latest state
        fetchData();
      } else {
        throw new Error(response.message || "Failed to approve withdrawal");
      }
    } catch (error: unknown) {
      console.error("Error approving withdrawal:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve withdrawal request"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Open reject dialog
  const openRejectDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  // Handle reject withdrawal request
  const handleReject = async () => {
    if (!selectedRequestId) {
      toast.error("No withdrawal request selected");
      return;
    }

    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingId(selectedRequestId);
      const response = await rejectWithdrawalRequest(
        selectedRequestId,
        rejectReason.trim()
      );

      if (response.success) {
        toast.success("Withdrawal request rejected successfully");
        // Update the status locally
        setWithdrawals((prev) =>
          prev.map((req) =>
            req._id === selectedRequestId
              ? {
                  ...req,
                  status: "declined",
                  declineReason: rejectReason.trim(),
                }
              : req
          )
        );
        setShowRejectDialog(false);
        setRejectReason("");
        // Refresh data to get latest state
        fetchData();
      } else {
        throw new Error(response.message || "Failed to reject withdrawal");
      }
    } catch (error: unknown) {
      console.error("Error rejecting withdrawal:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject withdrawal request"
      );
    } finally {
      setProcessingId(null);
      setSelectedRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Transfers & Withdrawals
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor transfer activity and manage withdrawal requests
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoadingStats || isLoadingWithdrawals}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isLoadingStats || isLoadingWithdrawals ? "animate-spin" : ""
            }`}
          />
          <span>
            {isLoadingStats || isLoadingWithdrawals
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transfers */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-600/20 rounded">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {isLoadingStats ? "..." : stats?.totalTransfers || 0}
            </h3>
            <p className="text-gray-400 text-sm">Total Transfers</p>
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-600/20 rounded">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              ${isLoadingStats ? "..." : formatNumber(stats?.totalVolume || 0)}
            </h3>
            <p className="text-gray-400 text-sm">Total Volume</p>
          </div>
        </div>

        {/* Total Fees */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-600/20 rounded">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              ${isLoadingStats ? "..." : formatNumber(stats?.totalFees || 0)}
            </h3>
            <p className="text-gray-400 text-sm">Total Fees</p>
          </div>
        </div>

        {/* Top Currency */}
        <div className="bg-[#1A1D24] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-600/20 rounded">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xs text-gray-400">Most Active</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {isLoadingStats ? "..." : stats?.topCoins?.[0]?._id || "No data"}
            </h3>
            <p className="text-gray-400 text-sm">Top Currency</p>
          </div>
        </div>
      </div>

      {/* Transfer Type Distribution */}
      {stats?.transfersByType && stats.transfersByType.length > 0 && (
        <div className="bg-[#1A1D24] rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            Transfer Type Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.transfersByType.map((type) => (
              <div
                key={type._id}
                className="bg-[#2A2D36] rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-400">
                    {type._id
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {type.count} transfers
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Volume</p>
                  <p className="text-lg font-semibold text-white">
                    ${formatNumber(type.volume)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfers */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 mb-6">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Transfers</h3>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email or coin..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2A2D36]">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Volume Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoadingTransfers ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    Loading transfers...
                  </td>
                </tr>
              ) : transfers.filter(
                  (transfer) =>
                    (statusFilter === "all" ||
                      transfer.status === statusFilter) &&
                    (searchTerm === "" ||
                      (transfer.user?.email || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (transfer.coinName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
                ).length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No transfers found
                  </td>
                </tr>
              ) : (
                transfers
                  .filter(
                    (transfer) =>
                      (statusFilter === "all" ||
                        transfer.status === statusFilter) &&
                      (searchTerm === "" ||
                        (transfer.user?.email || "")
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        (transfer.coinName || "")
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()))
                  )
                  .map((transfer) => (
                    <tr
                      key={transfer._id}
                      className="hover:bg-[#2A2D36] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {transfer.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {transfer.transferType
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {transfer.fromAccount.charAt(0).toUpperCase() +
                            transfer.fromAccount.slice(1)}{" "}
                          →{" "}
                          {transfer.toAccount.charAt(0).toUpperCase() +
                            transfer.toAccount.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {formatNumber(transfer.amount)} {transfer.coinName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {transfer.fee > 0 ? (
                            <>
                              {formatNumber(transfer.fee)} {transfer.coinName}
                              <div className="text-xs text-gray-400">
                                {transfer.feeType
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {transfer.requiredVolume > 0 ? (
                            <div>
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                                  <div
                                    className={`h-full rounded-full ${
                                      transfer.volumeMet
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        (transfer.currentVolume /
                                          transfer.requiredVolume) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs">
                                  {Math.round(
                                    (transfer.currentVolume /
                                      transfer.requiredVolume) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatNumber(transfer.currentVolume)}/
                                {formatNumber(transfer.requiredVolume)}{" "}
                                {transfer.coinName}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transfer.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">
            Withdrawal Requests
          </h3>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email, coin name or record ID..."
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
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2A2D36]">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Network
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoadingWithdrawals ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    Loading withdrawal requests...
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No withdrawal requests found
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal._id}
                    className="hover:bg-[#2A2D36] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {withdrawal.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {formatNumber(withdrawal.amount)} {withdrawal.coinName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {withdrawal.chain}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        {withdrawal.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {withdrawal.recordId ? (
                          <span className="text-blue-400">
                            {withdrawal.recordId.slice(0, 8)}...
                            {withdrawal.recordId.slice(-8)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(withdrawal._id)}
                              disabled={processingId === withdrawal._id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingId === withdrawal._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(withdrawal._id)}
                              disabled={processingId === withdrawal._id}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {processingId === withdrawal._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                        {withdrawal.status === "rejected" &&
                          withdrawal.declineReason && (
                            <span
                              className="text-sm text-gray-400"
                              title={withdrawal.declineReason}
                            >
                              Reason: {withdrawal.declineReason}
                            </span>
                          )}
                        {withdrawal.status === "completed" &&
                          withdrawal.reason && (
                            <span
                              className="text-sm text-gray-400"
                              title={withdrawal.reason}
                            >
                              Note: {withdrawal.reason}
                            </span>
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-[#2A2D36] border-gray-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                !rejectReason.trim() || processingId === selectedRequestId
              }
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processingId === selectedRequestId ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransfersPage;
