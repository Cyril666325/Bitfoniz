"use client";

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

import {
  addNewVipTier,
  getAllUsers,
  getVipTiers,
  updateUserVipTier,
  updateVipTier,
  deleteVipTier,
} from "@/services/admin";
import {
  AlertTriangle,
  CheckCircle,
  Crown,
  Edit,
  Loader,
  Plus,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface VipTier {
  _id: string;
  vipName: string;
  vipLevel: number;
  vipStatus: string;
  vipPercentage: number;
}

interface User {
  _id: string;
  email: string;
  vipTier?: {
    _id: string;
    vipName: string;
    vipLevel: number;
  };
  isVip?: boolean;
}

const VipManagementPage: React.FC = () => {
  const [vipTiers, setVipTiers] = useState<VipTier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showCreateTierModal, setShowCreateTierModal] = useState(false);
  const [showEditTierModal, setShowEditTierModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<VipTier | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tierToDelete, setTierToDelete] = useState<VipTier | null>(null);

  // Form states
  const [tierForm, setTierForm] = useState({
    vipName: "",
    vipLevel: 1,
    vipStatus: "active",
    vipPercentage: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tiersResponse, usersResponse] = await Promise.all([
        getVipTiers(),
        getAllUsers(),
      ]);

      if (tiersResponse.success) {
        setVipTiers(tiersResponse.data || []);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load VIP data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async () => {
    try {
      setSubmitting(true);
      const response = await addNewVipTier(
        tierForm.vipName,
        tierForm.vipLevel,
        tierForm.vipStatus,
        tierForm.vipPercentage
      );

      if (response.success) {
        setSuccess("VIP tier created successfully!");
        setShowCreateTierModal(false);
        resetTierForm();
        await fetchData();
      } else {
        setError(response.message || "Failed to create VIP tier");
      }
    } catch (err) {
      console.error("Error creating tier:", err);
      setError("Failed to create VIP tier. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTier = async () => {
    if (!selectedTier) return;

    try {
      setSubmitting(true);
      const response = await updateVipTier(
        selectedTier._id,
        tierForm.vipName,
        tierForm.vipLevel,
        tierForm.vipStatus,
        tierForm.vipPercentage
      );

      if (response.success) {
        setSuccess("VIP tier updated successfully!");
        setShowEditTierModal(false);
        resetTierForm();
        await fetchData();
      } else {
        setError(response.message || "Failed to update VIP tier");
      }
    } catch (err) {
      console.error("Error updating tier:", err);
      setError("Failed to update VIP tier. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUserToVip = async (
    userId: string,
    vipTierId: string | null
  ) => {
    try {
      setSubmitting(true);
      const response = await updateUserVipTier(userId, vipTierId);

      if (response.success) {
        setSuccess("User VIP status updated successfully!");
        setShowAssignUserModal(false);
        await fetchData();
      } else {
        setError(response.message || "Failed to update user VIP status");
      }
    } catch (err) {
      console.error("Error updating user VIP:", err);
      setError("Failed to update user VIP status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTier = async () => {
    if (!tierToDelete) return;

    try {
      setSubmitting(true);
      const response = await deleteVipTier(tierToDelete._id);

      if (response.success) {
        setSuccess("VIP tier deleted successfully!");
        setShowDeleteConfirmModal(false);
        setTierToDelete(null);
        await fetchData();
      } else {
        setError(response.message || "Failed to delete VIP tier");
      }
    } catch (err) {
      console.error("Error deleting tier:", err);
      setError("Failed to delete VIP tier. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetTierForm = () => {
    setTierForm({
      vipName: "",
      vipLevel: 1,
      vipStatus: "active",
      vipPercentage: 0,
    });
    setSelectedTier(null);
  };

  const openEditModal = (tier: VipTier) => {
    setSelectedTier(tier);
    setTierForm({
      vipName: tier.vipName,
      vipLevel: tier.vipLevel,
      vipStatus: tier.vipStatus,
      vipPercentage: tier.vipPercentage,
    });
    setShowEditTierModal(true);
  };

  const openDeleteModal = (tier: VipTier) => {
    setTierToDelete(tier);
    setShowDeleteConfirmModal(true);
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVipTierName = (vipTierId?: string) => {
    const tier = vipTiers.find((t) => t._id === vipTierId);
    return tier ? tier.vipName : "Regular User";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading VIP data...</p>
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
            onClick={fetchData}
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
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            <span>VIP Management</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Manage VIP tiers and assign users to VIP levels
          </p>
        </div>
        <button
          onClick={() => setShowCreateTierModal(true)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create VIP Tier</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIP Tiers Section */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span>VIP Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vipTiers.map((tier) => (
            <div
              key={tier._id}
              className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {tier.vipName}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(tier)}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(tier)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <span className="text-white font-medium">
                    {tier.vipLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tier.vipStatus === "active"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {tier.vipStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Percentage:</span>
                  <span className="text-yellow-400 font-medium">
                    {tier.vipPercentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Management Section */}
      <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>User VIP Management</span>
          </h2>
          {/* <button
            onClick={() => setShowAssignUserModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2"
          >
            <Crown className="w-4 h-4" />
            <span>Assign VIP</span>
          </button> */}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full md:w-1/3"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2A2D36] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  VIP Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.slice(0, 10).map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-[#2A2D36] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.email}
                        </div>
                        <div className="text-gray-400 text-sm">
                          ID: {user._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.vipTier
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-gray-600/20 text-gray-400"
                      }`}
                    >
                      {getVipTierName(user.vipTier?._id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowAssignUserModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors"
                    >
                      Manage VIP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create VIP Tier Modal */}
      {showCreateTierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create VIP Tier</h2>
              <button
                onClick={() => setShowCreateTierModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VIP Name
                </label>
                <input
                  type="text"
                  value={tierForm.vipName}
                  onChange={(e) =>
                    setTierForm({ ...tierForm, vipName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Gold, Platinum, Diamond"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VIP Level
                </label>
                <input
                  type="number"
                  min="1"
                  value={tierForm.vipLevel}
                  onChange={(e) =>
                    setTierForm({
                      ...tierForm,
                      vipLevel: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={tierForm.vipStatus}
                  onChange={(e) =>
                    setTierForm({ ...tierForm, vipStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tierForm.vipPercentage}
                  onChange={(e) =>
                    setTierForm({
                      ...tierForm,
                      vipPercentage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700 mt-6">
              <button
                onClick={() => setShowCreateTierModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTier}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Tier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit VIP Tier Modal */}
      {showEditTierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit VIP Tier</h2>
              <button
                onClick={() => setShowEditTierModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VIP Name
                </label>
                <input
                  type="text"
                  value={tierForm.vipName}
                  onChange={(e) =>
                    setTierForm({ ...tierForm, vipName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VIP Level
                </label>
                <input
                  type="number"
                  min="1"
                  value={tierForm.vipLevel}
                  onChange={(e) =>
                    setTierForm({
                      ...tierForm,
                      vipLevel: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={tierForm.vipStatus}
                  onChange={(e) =>
                    setTierForm({ ...tierForm, vipStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tierForm.vipPercentage}
                  onChange={(e) =>
                    setTierForm({
                      ...tierForm,
                      vipPercentage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#2A2D36] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700 mt-6">
              <button
                onClick={() => setShowEditTierModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTier}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Tier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User VIP Modal */}
      {showAssignUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">
                Assign VIP Status
              </h2>
              <button
                onClick={() => setShowAssignUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedUser && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-4 bg-[#2A2D36] rounded-lg flex-shrink-0">
                    <p className="text-gray-400 text-sm">Selected User</p>
                    <p className="text-white font-medium">
                      {selectedUser.email}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Current: {getVipTierName(selectedUser.vipTier?._id)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select VIP Tier
                    </label>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      <button
                        onClick={() =>
                          handleAssignUserToVip(selectedUser._id, null)
                        }
                        className="w-full p-3 bg-[#2A2D36] hover:bg-[#323232] border border-gray-600 rounded-lg text-left transition-colors"
                      >
                        <span className="text-white">Regular User</span>
                        <span className="text-gray-400 text-sm block">
                          No VIP benefits
                        </span>
                      </button>
                      {vipTiers.map((tier) => (
                        <button
                          key={tier._id}
                          onClick={() =>
                            handleAssignUserToVip(selectedUser._id, tier._id)
                          }
                          className="w-full p-3 bg-[#2A2D36] hover:bg-[#323232] border border-gray-600 rounded-lg text-left transition-colors"
                        >
                          <span className="text-white">{tier.vipName}</span>
                          <span className="text-gray-400 text-sm block">
                            Level {tier.vipLevel} • {tier.vipPercentage}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && tierToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Delete VIP Tier</h2>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-medium mb-2">Warning!</p>
                <p className="text-gray-300 text-sm">
                  Are you sure you want to delete the VIP tier &quot;
                  {tierToDelete.vipName}&quot;? This action cannot be undone and
                  may affect users assigned to this tier.
                </p>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Tier Details:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{tierToDelete.vipName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{tierToDelete.vipLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Percentage:</span>
                    <span className="text-yellow-400">
                      {tierToDelete.vipPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-700 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setTierToDelete(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTier}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Tier</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VipManagementPage;
