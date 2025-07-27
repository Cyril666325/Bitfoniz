"use client";

import { getUserWallets, updateUserBalance } from "@/services/admin";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Loader,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Balance {
  _id: string;
  user: string;
  coinId: string | number;
  coinName: string;
  balance: number;
  lockedBalance: number;
  updatedAt: string;
  createdAt?: string;
  currency?: string;
  chain?: string;
  memo?: string;
  requiredVolume?: number;
  tradingVolume?: number;
  __v?: number;
  logoUrl?: string;
}

interface UserBalances {
  main: Balance[];
  spot: Balance[];
  futures: Balance[];
}

interface UserWalletData {
  userId: string;
  email: string;
  balances: UserBalances;
}

interface ProcessedUserWallet {
  userId: string;
  email: string;
  mainBalance: number;
  spotBalance: number;
  futuresBalance: number;
  totalBalance: number;
  totalLocked: number;
  currencies: string[];
  lastActivity: string;
  status: "active" | "frozen" | "suspended";
}

const WalletsPage: React.FC = () => {
  const [userWallets, setUserWallets] = useState<ProcessedUserWallet[]>([]);
  const [rawWalletData, setRawWalletData] = useState<UserWalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [selectedWallet, setSelectedWallet] =
    useState<ProcessedUserWallet | null>(null);
  const [selectedRawWallet, setSelectedRawWallet] =
    useState<UserWalletData | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  // Balance update states
  const [showUpdateBalanceModal, setShowUpdateBalanceModal] = useState(false);
  const [updateBalanceLoading, setUpdateBalanceLoading] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("main");
  const [balanceOperation, setBalanceOperation] = useState("add");
  const [updateReason, setUpdateReason] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Process raw API data into our display format
  const processWalletData = (
    rawData: UserWalletData[]
  ): ProcessedUserWallet[] => {
    return rawData.map((userData) => {
      const { userId, email, balances } = userData;

      // Calculate totals for each wallet type
      const mainBalance = balances.main.reduce(
        (sum, bal) => sum + bal.balance,
        0
      );
      const spotBalance = balances.spot.reduce(
        (sum, bal) => sum + bal.balance,
        0
      );
      const futuresBalance = balances.futures.reduce(
        (sum, bal) => sum + bal.balance,
        0
      );

      const totalBalance = mainBalance + spotBalance + futuresBalance;
      const totalLocked = [
        ...balances.main,
        ...balances.spot,
        ...balances.futures,
      ].reduce((sum, bal) => sum + (bal.lockedBalance || 0), 0);

      // Get unique currencies
      const currencies = Array.from(
        new Set(
          [
            ...balances.main.map((b) => b.coinName),
            ...balances.spot.map((b) => b.coinName),
            ...balances.futures.map((b) => b.coinName),
          ].filter(Boolean)
        )
      );

      // Get last activity from most recent update
      const allBalances = [
        ...balances.main,
        ...balances.spot,
        ...balances.futures,
      ];
      const lastUpdate = allBalances.reduce((latest, balance) => {
        const current = new Date(balance.updatedAt);
        return current > latest ? current : latest;
      }, new Date(0));

      return {
        userId,
        email,
        mainBalance,
        spotBalance,
        futuresBalance,
        totalBalance,
        totalLocked,
        currencies,
        lastActivity: formatTimeAgo(lastUpdate),
        status: "active" as const,
      };
    });
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return "Less than an hour ago";
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserWallets();

      if (response.success) {
        setRawWalletData(response.data);
        const processedData = processWalletData(response.data);
        setUserWallets(processedData);
        setTotalUsers(response.totalUsers || response.data.length);
      } else {
        setError("Failed to fetch wallet data");
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const filteredWallets = userWallets.filter((wallet) => {
    const matchesSearch =
      wallet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.currencies.some((currency) =>
        currency.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || wallet.status === statusFilter;

    const matchesCurrency =
      currencyFilter === "all" || wallet.currencies.includes(currencyFilter);

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  // Calculate totals
  const totalBalance = userWallets.reduce(
    (sum, wallet) => sum + wallet.totalBalance,
    0
  );
  const totalAvailable = userWallets.reduce(
    (sum, wallet) => sum + (wallet.totalBalance - wallet.totalLocked),
    0
  );
  const totalLocked = userWallets.reduce(
    (sum, wallet) => sum + wallet.totalLocked,
    0
  );

  // Get unique currencies for filter
  const allCurrencies = Array.from(
    new Set(userWallets.flatMap((wallet) => wallet.currencies))
  ).sort();

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-600 text-white",
      frozen: "bg-blue-600 text-white",
      suspended: "bg-red-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewWallet = (wallet: ProcessedUserWallet) => {
    setSelectedWallet(wallet);
    const rawWallet = rawWalletData.find((raw) => raw.userId === wallet.userId);
    setSelectedRawWallet(rawWallet || null);
    setShowWalletModal(true);
  };

  const handleUpdateBalance = (wallet: ProcessedUserWallet) => {
    setSelectedWallet(wallet);
    setNewBalance("");
    setSelectedAccount("main");
    setBalanceOperation("add");
    setUpdateReason("");
    setUpdateError(null);
    setUpdateSuccess(null);
    setShowUpdateBalanceModal(true);
  };

  const submitBalanceUpdate = async () => {
    if (!selectedWallet) return;

    const amountToChange = parseFloat(newBalance);
    if (isNaN(amountToChange) || amountToChange <= 0) {
      setUpdateError("Please enter a valid positive amount");
      return;
    }

    if (!updateReason.trim()) {
      setUpdateError("Please provide a reason for this balance update");
      return;
    }

    // Get current balance of selected account for validation only
    let currentBalance = 0;
    if (selectedAccount === "main") {
      currentBalance = selectedWallet.mainBalance;
    } else if (selectedAccount === "spot") {
      currentBalance = selectedWallet.spotBalance;
    } else if (selectedAccount === "futures") {
      currentBalance = selectedWallet.futuresBalance;
    }

    // Validate that we're not subtracting more than available balance
    if (balanceOperation === "subtract" && amountToChange > currentBalance) {
      setUpdateError("Cannot subtract more than the current balance");
      return;
    }

    // Determine the amount to send to API (positive for add, negative for subtract)
    const newBalanceAmount =
      balanceOperation === "add" ? amountToChange : -amountToChange;

    try {
      setUpdateBalanceLoading(true);
      setUpdateError(null);

      const response = await updateUserBalance(
        selectedWallet.userId,
        newBalanceAmount,
        selectedAccount,
        updateReason.trim()
      );

      if (response.success) {
        setUpdateSuccess(
          `Balance ${
            balanceOperation === "add" ? "added" : "subtracted"
          } successfully for ${
            selectedWallet.email
          } in ${selectedAccount} wallet`
        );
        setShowUpdateBalanceModal(false);
        await fetchWalletData();
      } else {
        setUpdateError(response.message || "Failed to update balance");
      }
    } catch (err) {
      console.error("Error updating balance:", err);
      const error = err as Error & {
        response?: { data?: { error?: string; message?: string } };
      };
      setUpdateError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error.message ||
          "Failed to update balance. Please try again."
      );
    } finally {
      setUpdateBalanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchWalletData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Wallet Management</h1>
          <p className="text-gray-400 mt-2">
            Monitor and manage user wallets and transactions ({totalUsers}{" "}
            users)
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchWalletData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
            Export Wallets
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <h3 className="text-2xl font-bold text-white">
                $
                {totalBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Platform Wide</p>
            <p className="text-gray-400 text-sm">All currencies combined</p>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available</p>
              <h3 className="text-2xl font-bold text-white">
                $
                {totalAvailable.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Liquid Funds</p>
            <p className="text-green-400 text-sm">Ready for trading</p>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Locked</p>
              <h3 className="text-2xl font-bold text-white">
                $
                {totalLocked.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">In Orders</p>
            <p className="text-yellow-400 text-sm">Pending trades</p>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{totalUsers}</h3>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Registered</p>
            <p className="text-purple-400 text-sm">Platform users</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search wallets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Currencies</option>
              {allCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Showing {filteredWallets.length} of {userWallets.length} wallets
            </span>
          </div>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2A2D36] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Main Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Spot Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Futures Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Locked
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredWallets.map((wallet) => (
                <tr
                  key={wallet.userId}
                  className="hover:bg-[#2A2D36] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {wallet.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {wallet.email}
                        </div>
                        <div className="text-gray-400 text-sm">
                          ID: {wallet.userId.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      $
                      {wallet.mainBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-blue-400 font-medium">
                      $
                      {wallet.spotBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-purple-400 font-medium">
                      $
                      {wallet.futuresBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-green-400 font-medium text-lg">
                      $
                      {wallet.totalBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-yellow-400 font-medium">
                      $
                      {wallet.totalLocked.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(wallet.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewWallet(wallet)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                        title="View Wallet Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleUpdateBalance(wallet)}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded transition-colors"
                        title="Update Balance"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWallets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No wallets found</div>
            <div className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </div>
          </div>
        )}
      </div>

      {/* Wallet Details Modal */}
      {showWalletModal && selectedWallet && selectedRawWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-6xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Wallet Details</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Wallet */}
              <div className="bg-[#2A2D36] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-blue-400" />
                  Main Wallet
                </h3>
                <div className="space-y-3">
                  {selectedRawWallet.balances.main.map((balance, index) => (
                    <div
                      key={balance._id || index}
                      className="border-b border-gray-700 pb-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {balance.coinName}:
                        </span>
                        <span className="text-white font-medium">
                          {balance.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </span>
                      </div>
                      {balance.lockedBalance > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Locked:</span>
                          <span className="text-yellow-400">
                            {balance.lockedBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedRawWallet.balances.main.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No main wallet balances
                    </p>
                  )}
                </div>
              </div>

              {/* Spot Wallet */}
              <div className="bg-[#2A2D36] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Spot Wallet
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedRawWallet.balances.spot.map((balance, index) => (
                    <div
                      key={balance._id || index}
                      className="border-b border-gray-700 pb-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {balance.coinName}:
                        </span>
                        <span className="text-white font-medium">
                          {balance.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </span>
                      </div>
                      {balance.lockedBalance > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Locked:</span>
                          <span className="text-yellow-400">
                            {balance.lockedBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}
                          </span>
                        </div>
                      )}
                      {balance.chain && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Chain:</span>
                          <span className="text-blue-400">{balance.chain}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedRawWallet.balances.spot.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No spot wallet balances
                    </p>
                  )}
                </div>
              </div>

              {/* Futures Wallet */}
              <div className="bg-[#2A2D36] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-purple-400" />
                  Futures Wallet
                </h3>
                <div className="space-y-3">
                  {selectedRawWallet.balances.futures.map((balance, index) => (
                    <div
                      key={balance._id || index}
                      className="border-b border-gray-700 pb-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {balance.coinName}:
                        </span>
                        <span className="text-white font-medium">
                          {balance.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </span>
                      </div>
                      {balance.lockedBalance > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Locked:</span>
                          <span className="text-yellow-400">
                            {balance.lockedBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}
                          </span>
                        </div>
                      )}
                      {balance.tradingVolume !== undefined &&
                        balance.tradingVolume > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Trading Vol:</span>
                            <span className="text-green-400">
                              {balance.tradingVolume.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                  {selectedRawWallet.balances.futures.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No futures wallet balances
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 bg-[#2A2D36] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-white text-xl font-bold">
                    $
                    {selectedWallet.totalBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Main Wallet</p>
                  <p className="text-blue-400 text-xl font-bold">
                    $
                    {selectedWallet.mainBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Spot Wallet</p>
                  <p className="text-green-400 text-xl font-bold">
                    $
                    {selectedWallet.spotBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Futures Wallet</p>
                  <p className="text-purple-400 text-xl font-bold">
                    $
                    {selectedWallet.futuresBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700">
              <button
                onClick={() => handleUpdateBalance(selectedWallet)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {showUpdateBalanceModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Update User Balance
              </h2>
              <button
                onClick={() => setShowUpdateBalanceModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  User Email
                </label>
                <div className="px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-gray-300">
                  {selectedWallet.email}
                </div>
              </div>

              {/* Option 1: Total Balance of All 3 Accounts */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Total Balance (All Accounts)
                </label>
                <div className="px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-green-400 font-semibold">
                  $
                  {selectedWallet.totalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </div>
              </div>

              {/* Option 2: Select Account */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="main">Main Wallet</option>
                  <option value="spot">Spot Wallet (Trade)</option>
                  <option value="futures">Futures Wallet (Contract)</option>
                </select>
              </div>

              {/* Option 3: Selected Account Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Selected Account Balance
                </label>
                <div className="px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-blue-400 font-semibold">
                  $
                  {selectedAccount === "main" &&
                    selectedWallet.mainBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  {selectedAccount === "spot" &&
                    selectedWallet.spotBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  {selectedAccount === "futures" &&
                    selectedWallet.futuresBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                </div>
              </div>

              {/* Option 4: Amount Input with Add/Subtract */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Amount to {balanceOperation === "add" ? "Add" : "Subtract"}
                </label>
                <div className="flex space-x-2">
                  <select
                    value={balanceOperation}
                    onChange={(e) => setBalanceOperation(e.target.value)}
                    className="px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="add">Add (+)</option>
                    <option value="subtract">Subtract (-)</option>
                  </select>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                {newBalance && (
                  <div className="mt-1 p-2 bg-[#2A2D36] border border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-300">
                      Action:{" "}
                      <span
                        className={`font-mono font-semibold ${
                          balanceOperation === "add"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {balanceOperation === "add" ? "+" : "-"}
                        {newBalance}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Option 5: Reason for Balance Update */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Reason for Balance Update *
                </label>

                {/* Quick Reason Selection */}
                <div className="mb-1">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setUpdateReason(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">-- Select a predefined reason --</option>
                    <option value="Administrative adjustment">
                      Administrative adjustment
                    </option>
                    <option value="Deposit correction">
                      Deposit correction
                    </option>
                    <option value="Withdrawal correction">
                      Withdrawal correction
                    </option>
                    <option value="Trading fee refund">
                      Trading fee refund
                    </option>
                    <option value="Customer service compensation">
                      Customer service compensation
                    </option>
                    <option value="System error correction">
                      System error correction
                    </option>
                    <option value="Promotional bonus">Promotional bonus</option>
                    <option value="Account migration">Account migration</option>
                    <option value="Manual verification required">
                      Manual verification required
                    </option>
                  </select>
                </div>

                <textarea
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="Enter the reason for this balance update (required)"
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {updateReason.length}/200
                  </p>
                </div>
              </div>

              {updateError && (
                <div className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{updateError}</p>
                </div>
              )}

              {updateSuccess && (
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">{updateSuccess}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-700 mt-4">
              <button
                onClick={() => setShowUpdateBalanceModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitBalanceUpdate}
                disabled={
                  updateBalanceLoading || !updateReason.trim() || !newBalance
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {updateBalanceLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {balanceOperation === "add" ? "Add" : "Subtract"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletsPage;
