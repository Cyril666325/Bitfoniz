"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  LogOut,
  Loader,
  Crown,
  Calendar,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AdminSettings = () => {
  const { user, logout, refreshUser } = useUser();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResetPassword = () => {
    // Navigate to password reset page or show modal
    router.push("/forgot-password");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/admin-login");
  };

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast.success("Profile refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 lg:mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Admin Settings
          </h1>
          <p className="text-lg lg:text-xl text-gray-400">
            Manage your admin account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="xl:col-span-3 bg-[#181818] rounded-2xl p-6 lg:p-8 border border-gray-800"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl lg:text-3xl font-semibold">
                Profile Information
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshProfile}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition-colors disabled:opacity-50 text-sm lg:text-base"
              >
                <Loader
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                  <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-[#3AEBA5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">User ID</p>
                    <p className="font-medium">{user._id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                  <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#3AEBA5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {user.phonenumber && (
                  <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                    <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-[#3AEBA5]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="font-medium">{user.phonenumber}</p>
                    </div>
                  </div>
                )}

                {user.country && (
                  <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                    <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#3AEBA5]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="font-medium">{user.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                  <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#3AEBA5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">KYC Status</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.kycVerification
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {user.kycVerification ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {user.vipTier && (
                  <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                    <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-[#3AEBA5]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">VIP Tier</p>
                      <p className="font-medium">
                        {typeof user.vipTier === "object" &&
                        user.vipTier.vipName
                          ? `${user.vipTier.vipName} (Level ${user.vipTier.vipLevel})`
                          : `Tier ${user.vipTier}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                  <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#3AEBA5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                  <div className="w-12 h-12 bg-[#3AEBA5]/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#3AEBA5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Security Actions */}
            <div className="bg-[#181818] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetPassword}
                  className="w-full flex items-center gap-3 p-4 bg-[#202020] hover:bg-[#252525] rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Key className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Reset Password</p>
                    <p className="text-sm text-gray-400">
                      Change your account password
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-[#181818] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 bg-[#202020] hover:bg-red-500/10 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-red-400">Logout</p>
                    <p className="text-sm text-gray-400">
                      Sign out of your admin account
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Quick Stats */}
            {(user.referralCount !== undefined || user.referrals) && (
              <div className="bg-[#181818] rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  {user.referralCount !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-[#202020] rounded-xl">
                      <span className="text-gray-400">Total Referrals</span>
                      <span className="font-medium">{user.referralCount}</span>
                    </div>
                  )}
                  {user.referrals && (
                    <div className="flex justify-between items-center p-3 bg-[#202020] rounded-xl">
                      <span className="text-gray-400">Active Referrals</span>
                      <span className="font-medium">
                        {
                          user.referrals.filter((ref) => ref.firstDeposit)
                            .length
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
