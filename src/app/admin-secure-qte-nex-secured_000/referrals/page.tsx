"use client";

import React, { useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Share2,
  Gift,
  Target,
  BarChart3,
  UserPlus,
  Percent,
  Calendar,
} from "lucide-react";

interface ReferralUser {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  commissionRate: number;
  joinDate: string;
  lastActivity: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  status: "active" | "inactive" | "suspended";
}

interface ReferralStats {
  totalUsers: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageCommission: number;
  topPerformer: string;
  conversionRate: number;
}

interface CommissionTier {
  name: string;
  minReferrals: number;
  rate: number;
  color: string;
}

const mockReferralUsers: ReferralUser[] = [
  {
    id: "1",
    name: "Alice Thompson",
    email: "alice@example.com",
    referralCode: "ALICE2024",
    totalReferrals: 45,
    activeReferrals: 38,
    totalEarnings: 12450.5,
    monthlyEarnings: 2340.8,
    commissionRate: 15,
    joinDate: "2024-01-15",
    lastActivity: "2 hours ago",
    tier: "gold",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Wilson",
    email: "bob@example.com",
    referralCode: "BOBTRADER",
    totalReferrals: 23,
    activeReferrals: 20,
    totalEarnings: 6890.25,
    monthlyEarnings: 1560.3,
    commissionRate: 12,
    joinDate: "2024-02-20",
    lastActivity: "1 day ago",
    tier: "silver",
    status: "active",
  },
  {
    id: "3",
    name: "Charlie Davis",
    email: "charlie@example.com",
    referralCode: "CRYPTO_C",
    totalReferrals: 67,
    activeReferrals: 55,
    totalEarnings: 18920.75,
    monthlyEarnings: 3210.4,
    commissionRate: 18,
    joinDate: "2023-11-10",
    lastActivity: "3 hours ago",
    tier: "platinum",
    status: "active",
  },
  {
    id: "4",
    name: "Diana Miller",
    email: "diana@example.com",
    referralCode: "DIATRADER",
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 2140.6,
    monthlyEarnings: 420.15,
    commissionRate: 10,
    joinDate: "2024-03-05",
    lastActivity: "2 days ago",
    tier: "bronze",
    status: "inactive",
  },
];

const commissionTiers: CommissionTier[] = [
  { name: "Bronze", minReferrals: 0, rate: 10, color: "text-orange-400" },
  { name: "Silver", minReferrals: 20, rate: 12, color: "text-gray-400" },
  { name: "Gold", minReferrals: 40, rate: 15, color: "text-yellow-400" },
  { name: "Platinum", minReferrals: 60, rate: 18, color: "text-purple-400" },
];

const ReferralsPage: React.FC = () => {
  const [referralUsers, setReferralUsers] =
    useState<ReferralUser[]>(mockReferralUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<ReferralUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  const filteredUsers = referralUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = tierFilter === "all" || user.tier === tierFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const stats: ReferralStats = {
    totalUsers: referralUsers.length,
    totalEarnings: referralUsers.reduce(
      (sum, user) => sum + user.totalEarnings,
      0
    ),
    monthlyEarnings: referralUsers.reduce(
      (sum, user) => sum + user.monthlyEarnings,
      0
    ),
    averageCommission:
      referralUsers.reduce((sum, user) => sum + user.commissionRate, 0) /
      referralUsers.length,
    topPerformer: referralUsers.reduce((prev, current) =>
      prev.totalEarnings > current.totalEarnings ? prev : current
    ).name,
    conversionRate: 68.5,
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      bronze: "bg-orange-600 text-white",
      silver: "bg-gray-600 text-white",
      gold: "bg-yellow-600 text-white",
      platinum: "bg-purple-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[tier as keyof typeof styles]
        }`}
      >
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-600 text-white",
      inactive: "bg-yellow-600 text-white",
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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze":
        return <Award className="w-4 h-4 text-orange-400" />;
      case "silver":
        return <Award className="w-4 h-4 text-gray-400" />;
      case "gold":
        return <Award className="w-4 h-4 text-yellow-400" />;
      case "platinum":
        return <Star className="w-4 h-4 text-purple-400" />;
      default:
        return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    setReferralUsers(
      referralUsers.map((user) => {
        if (user.id === userId) {
          switch (action) {
            case "suspend":
              return { ...user, status: "suspended" as const };
            case "activate":
              return { ...user, status: "active" as const };
            case "deactivate":
              return { ...user, status: "inactive" as const };
            default:
              return user;
          }
        }
        return user;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Referral Management</h1>
          <p className="text-gray-400 mt-2">
            Monitor and manage the referral program
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTierModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Manage Tiers
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Referrers</p>
              <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-xl font-bold text-white">
                ${stats.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Monthly</p>
              <p className="text-xl font-bold text-white">
                ${stats.monthlyEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Commission</p>
              <p className="text-xl font-bold text-white">
                {stats.averageCommission.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Conversion</p>
              <p className="text-xl font-bold text-white">
                {stats.conversionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Top Performer</p>
              <p className="text-lg font-bold text-white truncate">
                {stats.topPerformer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Tiers Overview */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Commission Tiers</h3>
          <button
            onClick={() => setShowTierModal(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit Tiers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {commissionTiers.map((tier) => (
            <div key={tier.name} className="bg-[#2A2D36] rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Award className={`w-5 h-5 ${tier.color}`} />
                <h4 className={`font-semibold ${tier.color}`}>{tier.name}</h4>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">
                  Min Referrals:{" "}
                  <span className="text-white">{tier.minReferrals}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Commission: <span className="text-white">{tier.rate}%</span>
                </div>
                <div className="text-sm text-gray-400">
                  Users:{" "}
                  <span className="text-white">
                    {
                      referralUsers.filter(
                        (u) => u.tier === tier.name.toLowerCase()
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
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
                placeholder="Search referrers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Showing {filteredUsers.length} of {referralUsers.length} referrers
            </span>
          </div>
        </div>
      </div>

      {/* Referrers Table */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2A2D36] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Earnings
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
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#2A2D36] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="bg-[#2A2D36] px-2 py-1 rounded text-green-400 text-sm">
                        {user.referralCode}
                      </code>
                      <button className="text-gray-400 hover:text-white">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getTierIcon(user.tier)}
                      {getTierBadge(user.tier)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">
                        {user.totalReferrals}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {user.activeReferrals} active
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {user.commissionRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">
                        ${user.totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-green-400 text-sm">
                        +${user.monthlyEarnings.toLocaleString()} this month
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {user.status === "active" && (
                        <button
                          onClick={() => handleUserAction("suspend", user.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded transition-colors"
                          title="Suspend"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No referrers found</div>
            <div className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Referrer Details
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-[#2A2D36] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Referrer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{selectedUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Referral Code:</span>
                      <code className="bg-[#1A1D24] px-2 py-1 rounded text-green-400">
                        {selectedUser.referralCode}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tier:</span>
                      <div className="flex items-center space-x-2">
                        {getTierIcon(selectedUser.tier)}
                        {getTierBadge(selectedUser.tier)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="bg-[#2A2D36] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Referrals:</span>
                      <span className="text-white font-bold">
                        {selectedUser.totalReferrals}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Referrals:</span>
                      <span className="text-green-400 font-medium">
                        {selectedUser.activeReferrals}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Commission Rate:</span>
                      <span className="text-white">
                        {selectedUser.commissionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conversion Rate:</span>
                      <span className="text-white">
                        {(
                          (selectedUser.activeReferrals /
                            selectedUser.totalReferrals) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#2A2D36] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Earnings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Earnings:</span>
                      <span className="text-white font-bold">
                        ${selectedUser.totalEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Earnings:</span>
                      <span className="text-green-400 font-medium">
                        ${selectedUser.monthlyEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg per Referral:</span>
                      <span className="text-white">
                        $
                        {(
                          selectedUser.totalEarnings /
                          selectedUser.totalReferrals
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2A2D36] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Joined:</span>
                      <span className="text-white">
                        {selectedUser.joinDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Activity:</span>
                      <span className="text-white">
                        {selectedUser.lastActivity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Days Active:</span>
                      <span className="text-white">
                        {Math.ceil(
                          (new Date().getTime() -
                            new Date(selectedUser.joinDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700 mt-6">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
                Edit Commission
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
                View Referrals
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white transition-colors">
                Upgrade Tier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier Management Modal */}
      {showTierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Manage Commission Tiers
              </h2>
              <button
                onClick={() => setShowTierModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {commissionTiers.map((tier, index) => (
                <div key={tier.name} className="bg-[#2A2D36] rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Tier Name
                      </label>
                      <input
                        type="text"
                        value={tier.name}
                        className="w-full px-3 py-2 bg-[#1A1D24] border border-gray-600 rounded text-white focus:outline-none focus:border-green-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Min Referrals
                      </label>
                      <input
                        type="number"
                        value={tier.minReferrals}
                        className="w-full px-3 py-2 bg-[#1A1D24] border border-gray-600 rounded text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        value={tier.rate}
                        className="w-full px-3 py-2 bg-[#1A1D24] border border-gray-600 rounded text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700 mt-6">
              <button
                onClick={() => setShowTierModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsPage;
