"use client";

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Shield,
  UserCheck,
  Clock,
  Copy,
  Wallet,
  Eye,
} from "lucide-react";
import { getAllUsers } from "@/services/admin";

interface User {
  _id: string;
  email: string;
  password: string;
  referBy: string;
  refCode: string;
  emailVerified: boolean;
  firstDeposit: boolean;
  createdAt: string;
  isAdmin: boolean;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.refCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "admin" && user.isAdmin) ||
      (statusFilter === "verified" && user.emailVerified) ||
      (statusFilter === "deposited" && user.firstDeposit);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (user: User) => {
    if (user.isAdmin) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Admin
        </span>
      );
    }
    if (!user.emailVerified) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Unverified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Verified
      </span>
    );
  };

  const getDepositBadge = (hasDeposited: boolean) => {
    const styles = hasDeposited
      ? "bg-green-600 text-white"
      : "bg-yellow-600 text-white";
    const icon = hasDeposited ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <Clock className="w-3 h-3" />
    );

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${styles}`}
      >
        {icon}
        <span>{hasDeposited ? "Deposited" : "No Deposit"}</span>
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email or ref code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A1D24] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="verified">Verified</option>
            <option value="deposited">Deposited</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2A2D36]">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Deposit Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referral
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#2A2D36] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {user._id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4">
                      {getDepositBadge(user.firstDeposit)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Code:</span>
                          <span className="text-sm text-white">
                            {user.refCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(user.refCode)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {user.referBy && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">
                              Referred by:
                            </span>
                            <span className="text-sm text-white">
                              {user.referBy.substring(0, 8)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {new Date(user.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCloseModal}
          />
          <div className="relative bg-[#1A1D24] rounded-lg p-6 max-w-lg w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold text-white">User Details</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <div className="text-white">{selectedUser.email}</div>
              </div>

              <div>
                <label className="text-sm text-gray-400 flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Password</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono bg-[#2A2D36] px-3 py-2 rounded border border-gray-700 text-sm flex-1 break-all">
                    {selectedUser.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedUser.password)}
                    className="text-gray-400 hover:text-white p-1 hover:bg-[#2A2D36] rounded transition-colors"
                    title="Copy password"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">User ID</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white">{selectedUser._id}</span>
                  <button
                    onClick={() => copyToClipboard(selectedUser._id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Referral Code</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white">{selectedUser.refCode}</span>
                  <button
                    onClick={() => copyToClipboard(selectedUser.refCode)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Status</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield
                      className={`w-4 h-4 ${
                        selectedUser.isAdmin
                          ? "text-purple-500"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="text-white">
                      {selectedUser.isAdmin ? "Admin" : "Regular User"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        selectedUser.emailVerified
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="text-white">
                      {selectedUser.emailVerified
                        ? "Email Verified"
                        : "Email Not Verified"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wallet
                      className={`w-4 h-4 ${
                        selectedUser.firstDeposit
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="text-white">
                      {selectedUser.firstDeposit
                        ? "Has Deposited"
                        : "No Deposits"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Join Date</label>
                <div className="text-white">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
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

export default UsersPage;
