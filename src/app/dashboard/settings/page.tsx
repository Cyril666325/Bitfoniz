"use client";

import { useUser } from "@/context/UserContext";
import {
  Lock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { KycStatus } from "@/services/kyc";

interface KycData {
  _id: string;
  user: string;
  fullName: string;
  city: string;
  country: string;
  idNumber: string;
  status: string;
  reason?: string;
  frontImageUrl: string;
  backImageUrl: string;
  idImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

const Settings = () => {
  const { user, logout } = useUser();
  const router = useRouter();
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await KycStatus();
        if (response.success && response.data) {
          setKycData(response.data);
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      } finally {
        setKycLoading(false);
      }
    };

    if (user) {
      fetchKycStatus();
    }
  }, [user]);

  const handleResetPassword = async () => {
    router.push("/forgot-password");
  };

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  const handleKYCVerification = () => {
    router.push("/kyc");
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0A0A0A]">
      <div className="flex-1 w-full max-w-[1440px] mx-auto md:px-6 pb-8 pt-4">
        <div className="grid grid-cols-1 gap-6">
          {/* Profile Section */}
          <div className="bg-[#181818] rounded-2xl p-6">
            <h2 className="text-xl font-medium mb-6">Profile Settings</h2>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                <div className="h-10 w-10 flex items-center justify-center bg-[#282828] rounded-xl">
                  <Mail className="h-5 w-5 text-[#3AEBA5]" />
                </div>
                <div>
                  <p className="text-sm text-[#717171]">Email</p>
                  <p className="font-medium">{user?.email || "Not set"}</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
                <div className="h-10 w-10 flex items-center justify-center bg-[#282828] rounded-xl">
                  <Phone className="h-5 w-5 text-[#3AEBA5]" />
                </div>
                <div>
                  <p className="text-sm text-[#717171]">Phone Number</p>
                  <p className="font-medium">
                    {user?.phonenumber || "Not set"}
                  </p>
                </div>
              </div>

              <div className="bg-[#202020] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center bg-[#282828] rounded-xl">
                    {kycData?.status === "rejected" ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-[#3AEBA5]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">KYC Verification</p>
                        <p className="text-sm text-[#717171]">
                          {kycData?.status === "rejected"
                            ? "Your KYC verification was rejected"
                            : "Complete your identity verification"}
                        </p>
                      </div>
                      {kycLoading ? (
                        <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                          Loading...
                        </span>
                      ) : !kycData || !kycData.status ? (
                        <button
                          onClick={handleKYCVerification}
                          className="text-xs px-3 py-1 bg-[#3AEBA5] text-black rounded-full hover:bg-[#3AEBA5]/80 transition-colors"
                        >
                          Start KYC
                        </button>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            kycData.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : kycData.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : kycData.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {kycData.status === "approved"
                            ? "Verified"
                            : kycData.status === "rejected"
                            ? "Rejected"
                            : kycData.status === "pending"
                            ? "Pending"
                            : "Not Submitted"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {kycData?.status === "rejected" && kycData.reason && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-400 mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-300">{kycData.reason}</p>
                        <div className="mt-2">
                          <button
                            onClick={handleKYCVerification}
                            className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            Re-submit KYC
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approved status action */}
                {kycData?.status === "approved" && (
                  <div className="mt-3 text-xs text-green-400">
                    ✓ Your identity has been successfully verified
                  </div>
                )}

                {/* Pending status action */}
                {kycData?.status === "pending" && (
                  <div className="mt-3 text-xs text-yellow-400">
                    ⏳ Your KYC verification is under review
                  </div>
                )}
              </div>

              {/* Reset Password */}
              <button
                onClick={handleResetPassword}
                className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl w-full hover:bg-[#282828] transition-colors group"
              >
                <div className="h-10 w-10 flex items-center justify-center bg-[#282828] group-hover:bg-[#323232] rounded-xl transition-colors">
                  <Lock className="h-5 w-5 text-[#3AEBA5]" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Reset Password</p>
                  <p className="text-sm text-[#717171]">
                    Change your account password
                  </p>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl w-full hover:bg-[#282828] transition-colors group"
              >
                <div className="h-10 w-10 flex items-center justify-center bg-[#282828] group-hover:bg-[#323232] rounded-xl transition-colors">
                  <LogOut className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-red-500">Logout</p>
                  <p className="text-sm text-[#717171]">
                    Sign out of your account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
