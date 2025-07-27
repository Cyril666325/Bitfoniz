"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  getAllUsers,
  getOrders,
  getTransfers,
  getTransferStats,
  getWithdrawalRequests,
} from "@/services/admin";

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalDeposited: number;
  depositGrowth: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  totalTrades: number;
  tradesToday: number;
}

interface TransferData {
  period: string;
  deposits: number;
  withdrawals: number;
}

interface User {
  _id: string;
  createdAt: string;
}

interface Order {
  _id: string;
  createdAt: string;
}

interface WithdrawalRequest {
  _id: string;
  status: string;
  amount: number;
}

interface Transfer {
  _id: string;
  type: string;
  user: string;
  amount: number;
  currency: string;
  createdAt: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalDeposited: 0,
    depositGrowth: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    totalTrades: 0,
    tradesToday: 0,
  });
  const [transferData, setTransferData] = useState<TransferData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        usersResponse,
        ordersResponse,
        transfersResponse,
        withdrawalsResponse,
        transferStatsResponse,
      ] = await Promise.all([
        getAllUsers(),
        getOrders(),
        getTransfers(),
        getWithdrawalRequests(),
        getTransferStats(),
      ]);

      // Extract data arrays from API responses
      const users = usersResponse?.data || usersResponse || [];
      const orders = ordersResponse?.data || ordersResponse || [];
      const transfers = transfersResponse?.data || transfersResponse || [];
      const withdrawals =
        withdrawalsResponse?.data || withdrawalsResponse || [];
      const transferStats =
        transferStatsResponse?.data || transferStatsResponse || {};

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const newUsersToday = Array.isArray(users)
        ? users.filter((user: User) => new Date(user.createdAt) >= todayStart)
            .length
        : 0;

      const tradesToday = Array.isArray(orders)
        ? orders.filter(
            (order: Order) => new Date(order.createdAt) >= todayStart
          ).length
        : 0;

      const pendingWithdrawals = Array.isArray(withdrawals)
        ? withdrawals
            .filter((w: WithdrawalRequest) => w.status === "pending")
            .reduce(
              (sum: number, w: WithdrawalRequest) => sum + (w.amount || 0),
              0
            )
        : 0;

      // Update stats
      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        newUsersToday,
        totalDeposited: transferStats.totalDeposits || 0,
        depositGrowth: transferStats.depositGrowth || 0,
        totalWithdrawn: transferStats.totalWithdrawals || 0,
        pendingWithdrawals,
        totalTrades: Array.isArray(orders) ? orders.length : 0,
        tradesToday,
      });
      setTransferData(transferStats.periodData || []);
      if (Array.isArray(transfers)) {
        const recentTransfers = transfers
          .slice(0, 5)
          .map((transfer: Transfer) => ({
            id: transfer._id,
            type: transfer.type,
            description: `${transfer.user} ${transfer.type} ${transfer.amount} ${transfer.currency}`,
            time: new Date(transfer.createdAt).toLocaleTimeString(),
            date: new Date(transfer.createdAt).toLocaleDateString(),
          }));

        setRecentActivity(recentTransfers);
      } else {
        setRecentActivity([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats({
        totalUsers: 0,
        newUsersToday: 0,
        totalDeposited: 0,
        depositGrowth: 0,
        totalWithdrawn: 0,
        pendingWithdrawals: 0,
        totalTrades: 0,
        tradesToday: 0,
      });
      setTransferData([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back, Admin</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className={`flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Users</p>
                <h3 className="text-2xl font-bold text-white">
                  {stats.totalUsers.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Total Users</p>
            <p className="text-gray-400 text-sm">
              {stats.newUsersToday} new today
            </p>
          </div>
        </div>

        {/* Deposits Card */}
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Deposits</p>
                <h3 className="text-2xl font-bold text-white">
                  ${stats.totalDeposited.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Deposited</p>
            <p className="text-green-400 text-sm">
              +{stats.depositGrowth}% this {selectedPeriod.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Withdrawals Card */}
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Withdrawals</p>
                <h3 className="text-2xl font-bold text-white">
                  ${stats.totalWithdrawn.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Withdrawn</p>
            <p className="text-yellow-400 text-sm">
              Pending: ${stats.pendingWithdrawals.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Trades Card */}
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Trades</p>
                <h3 className="text-2xl font-bold text-white">
                  {stats.totalTrades.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-white font-semibold">Trades Executed</p>
            <p className="text-green-400 text-sm">+{stats.tradesToday} today</p>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposits vs Withdrawals Chart */}
        <div className="lg:col-span-2 bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Deposits vs Withdrawals
            </h3>
            <div className="flex space-x-2">
              {["Daily", "Weekly", "Monthly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    selectedPeriod === period
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            {transferData.map((data) => (
              <div key={data.period} className="flex items-center space-x-4">
                <div className="w-8 text-gray-400 text-sm">{data.period}</div>
                <div className="flex-1 flex space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-8 flex items-center">
                    <div
                      className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${
                          (data.deposits /
                            Math.max(
                              ...transferData.map((d) =>
                                Math.max(d.deposits, d.withdrawals)
                              )
                            )) *
                          100
                        }%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        ${(data.deposits / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-8 flex items-center">
                    <div
                      className="bg-red-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${
                          (data.withdrawals /
                            Math.max(
                              ...transferData.map((d) =>
                                Math.max(d.deposits, d.withdrawals)
                              )
                            )) *
                          100
                        }%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        ${(data.withdrawals / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-300 text-sm">Deposits</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-300 text-sm">Withdrawals</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded bg-[#2A2D36] hover:bg-[#3A3D46] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {activity.type}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {activity.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
