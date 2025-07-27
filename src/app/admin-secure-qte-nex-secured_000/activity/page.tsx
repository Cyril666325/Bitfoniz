"use client";

import React, { useState } from "react";
import {
  Activity,
  Shield,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Settings,
  RefreshCw,
} from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  type: "user_action" | "admin_action" | "system" | "security" | "transaction";
  category: string;
  action: string;
  description: string;
  user?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed" | "warning" | "info";
  metadata?: Record<string, unknown>;
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    timestamp: "2024-06-04 16:45:23",
    type: "user_action",
    category: "Authentication",
    action: "LOGIN",
    description: "User logged in successfully",
    user: "alice@example.com",
    userId: "u001",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success",
    metadata: { location: "New York, US" },
  },
  {
    id: "2",
    timestamp: "2024-06-04 16:42:15",
    type: "admin_action",
    category: "User Management",
    action: "USER_SUSPENDED",
    description: "Admin suspended user account for suspicious activity",
    user: "admin@bitfoniz.com",
    userId: "a001",
    ipAddress: "10.0.0.1",
    status: "success",
    metadata: {
      targetUser: "charlie@example.com",
      reason: "Multiple failed login attempts",
    },
  },
  {
    id: "3",
    timestamp: "2024-06-04 16:40:08",
    type: "transaction",
    category: "Spot Trading",
    action: "ORDER_EXECUTED",
    description: "Spot trade order executed via code redemption",
    user: "bob@example.com",
    userId: "u002",
    ipAddress: "203.0.113.45",
    status: "success",
    metadata: { orderCode: "BTC-BUY-001", amount: "0.1 BTC", value: "$6,850" },
  },
  {
    id: "4",
    timestamp: "2024-06-04 16:38:42",
    type: "security",
    category: "Authentication",
    action: "FAILED_LOGIN",
    description: "Multiple failed login attempts detected",
    user: "unknown@hacker.com",
    ipAddress: "198.51.100.42",
    userAgent: "curl/7.68.0",
    status: "failed",
    metadata: { attempts: 5, blocked: true },
  },
  {
    id: "5",
    timestamp: "2024-06-04 16:35:17",
    type: "system",
    category: "System",
    action: "BACKUP_COMPLETED",
    description: "Database backup completed successfully",
    status: "success",
    metadata: { backupSize: "2.5GB", duration: "45 minutes" },
  },
  {
    id: "6",
    timestamp: "2024-06-04 16:32:03",
    type: "user_action",
    category: "KYC",
    action: "KYC_SUBMITTED",
    description: "User submitted KYC documentation",
    user: "diana@example.com",
    userId: "u004",
    ipAddress: "172.16.0.25",
    status: "info",
    metadata: { documents: ["passport", "utility_bill"] },
  },
  {
    id: "7",
    timestamp: "2024-06-04 16:30:45",
    type: "admin_action",
    category: "Spot Codes",
    action: "CODE_CREATED",
    description: "Admin created new spot trading code",
    user: "admin@bitfoniz.com",
    userId: "a001",
    ipAddress: "10.0.0.1",
    status: "success",
    metadata: { code: "ETH-SELL-002", pair: "ETH_USDT", value: "$8,500" },
  },
  {
    id: "8",
    timestamp: "2024-06-04 16:28:19",
    type: "transaction",
    category: "Wallet",
    action: "WITHDRAWAL_REJECTED",
    description: "Withdrawal request rejected due to insufficient funds",
    user: "charlie@example.com",
    userId: "u003",
    ipAddress: "203.0.113.78",
    status: "failed",
    metadata: { amount: "$15,000", reason: "Insufficient balance" },
  },
];

const ActivityPage: React.FC = () => {
  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>(mockActivityLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || log.type === typeFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      success: "bg-green-600 text-white",
      failed: "bg-red-600 text-white",
      warning: "bg-yellow-600 text-white",
      info: "bg-blue-600 text-white",
    };

    const icons = {
      success: <CheckCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      warning: <AlertTriangle className="w-3 h-3" />,
      info: <Activity className="w-3 h-3" />,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
          styles[status as keyof typeof styles]
        }`}
      >
        {icons[status as keyof typeof icons]}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user_action":
        return <User className="w-4 h-4 text-blue-400" />;
      case "admin_action":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "system":
        return <Settings className="w-4 h-4 text-gray-400" />;
      case "security":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "transaction":
        return <DollarSign className="w-4 h-4 text-green-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      user_action: "bg-blue-600/20 text-blue-400",
      admin_action: "bg-purple-600/20 text-purple-400",
      system: "bg-gray-600/20 text-gray-400",
      security: "bg-red-600/20 text-red-400",
      transaction: "bg-green-600/20 text-green-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[type as keyof typeof styles]
        }`}
      >
        {type.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const stats = {
    totalLogs: activityLogs.length,
    successfulActions: activityLogs.filter((log) => log.status === "success")
      .length,
    failedActions: activityLogs.filter((log) => log.status === "failed").length,
    securityEvents: activityLogs.filter((log) => log.type === "security")
      .length,
    adminActions: activityLogs.filter((log) => log.type === "admin_action")
      .length,
    userActions: activityLogs.filter((log) => log.type === "user_action")
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Activity</h1>
          <p className="text-gray-400 mt-2">
            Monitor all system activities and user actions
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Events</p>
              <p className="text-xl font-bold text-white">{stats.totalLogs}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Successful</p>
              <p className="text-xl font-bold text-white">
                {stats.successfulActions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-xl font-bold text-white">
                {stats.failedActions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Security</p>
              <p className="text-xl font-bold text-white">
                {stats.securityEvents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Admin</p>
              <p className="text-xl font-bold text-white">
                {stats.adminActions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">User</p>
              <p className="text-xl font-bold text-white">
                {stats.userActions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 w-64"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="user_action">User Actions</option>
              <option value="admin_action">Admin Actions</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="transaction">Transactions</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Showing {filteredLogs.length} of {activityLogs.length} events
            </span>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2A2D36] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
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
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[#2A2D36] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-white text-sm">
                          {log.timestamp.split(" ")[1]}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {log.timestamp.split(" ")[0]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(log.type)}
                      {getTypeBadge(log.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{log.action}</div>
                      <div className="text-gray-400 text-sm">
                        {log.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.user ? (
                      <div>
                        <div className="text-white text-sm">{log.user}</div>
                        <div className="text-gray-400 text-xs">
                          {log.ipAddress}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white text-sm max-w-xs truncate">
                      {log.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No activity logs found</div>
            <div className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </div>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Activity Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#2A2D36] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timestamp:</span>
                      <span className="text-white">
                        {selectedLog.timestamp}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      {getTypeBadge(selectedLog.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{selectedLog.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Action:</span>
                      <span className="text-white font-medium">
                        {selectedLog.action}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      {getStatusBadge(selectedLog.status)}
                    </div>
                  </div>
                </div>

                <div className="bg-[#2A2D36] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">User:</span>
                      <span className="text-white">
                        {selectedLog.user || "System"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white">
                        {selectedLog.userId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IP Address:</span>
                      <span className="text-white">
                        {selectedLog.ipAddress || "N/A"}
                      </span>
                    </div>
                    {selectedLog.userAgent && (
                      <div>
                        <span className="text-gray-400">User Agent:</span>
                        <div className="text-white text-sm mt-1 break-all">
                          {selectedLog.userAgent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Description
                </h3>
                <p className="text-gray-300">{selectedLog.description}</p>
              </div>

              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="bg-[#2A2D36] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Additional Details
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.metadata).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-400 capitalize">
                              {key.replace("_", " ")}:
                            </span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700 mt-6">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
                Export Details
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
