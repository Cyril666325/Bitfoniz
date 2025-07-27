"use client";

import { useUser } from "@/context/UserContext";
import { getProfile } from "@/services/profile";
import { Copy, Users, Link as LinkIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const ReferralPage = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching profile...");

      const response = await getProfile();
      console.log("Profile response:", response);

      if (response) {
        setUser(response);
        console.log("User set successfully:", response);
      } else {
        throw new Error("No data received from profile API");
      }
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch referral data";
      setError(errorMessage);
      toast.error("Failed to fetch referral data");
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (!user || !user.refCode) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const copyReferralCode = () => {
    if (user?.refCode) {
      navigator.clipboard.writeText(user.refCode);
      toast.success("Referral code copied to clipboard!");
    } else {
      toast.error("No referral code available");
    }
  };

  const copyReferralLink = () => {
    if (user?.refCode) {
      const link = `https://bitfoniz.exchange/code?ref=${user.refCode}`;
      navigator.clipboard.writeText(link);
      toast.success("Referral link copied to clipboard!");
    } else {
      toast.error("No referral code available");
    }
  };

  const referrals = Array.isArray(user?.referrals) ? user.referrals : [];

  // Sort referrals by createdAt date in descending order (most recent first)
  const sortedReferrals = referrals.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalReferrals = user?.referralCount || referrals.length || 0;

  console.log("Current user:", user);
  console.log("Referrals array:", referrals);
  console.log("Sorted referrals:", sortedReferrals);
  console.log("Total referrals:", totalReferrals);
  console.log("Loading state:", loading);
  console.log("Error state:", error);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#717171]">Loading referral data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-[#3AEBA5] text-black rounded-lg hover:bg-[#2ed194] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
        <p className="text-[#717171] mb-4">No user data available</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-[#3AEBA5] text-black rounded-lg hover:bg-[#2ed194] transition-colors"
        >
          Load Data
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0A0A0A] mt-4 md:p-6">
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#181818] rounded-2xl p-6">
            <h2 className="text-xl font-medium mb-6">Your Referral Code</h2>
            <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl">
              <div className="h-10 w-10 flex items-center justify-center bg-[#282828] rounded-xl">
                <Users className="h-5 w-5 text-[#3AEBA5]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#717171]">Share this code</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-lg">
                    {user?.refCode || "N/A"}
                  </p>
                  <button
                    onClick={copyReferralCode}
                    className="p-2 hover:bg-[#282828] rounded-lg transition-colors"
                    disabled={!user?.refCode}
                  >
                    <Copy className="h-4 w-4 text-[#3AEBA5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Link Section */}
            <div className="flex items-center gap-4 p-4 bg-[#202020] rounded-xl mt-4">
              <div className="h-10 w-10 flex items-center justify-center bg-[#282828] rounded-xl">
                <LinkIcon className="h-5 w-5 text-[#3AEBA5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#717171]">Share this link</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-[#717171] truncate max-w-[200px] md:max-w-none">
                    https://bitfoniz.exchange/code?ref={user?.refCode || "N/A"}
                  </p>
                  <button
                    onClick={copyReferralLink}
                    className="p-2 hover:bg-[#282828] rounded-lg transition-colors flex-shrink-0"
                    disabled={!user?.refCode}
                  >
                    <Copy className="h-4 w-4 text-[#3AEBA5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-[#181818] rounded-2xl p-6">
            <h2 className="text-xl font-medium mb-6">Referral Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#202020] rounded-xl">
                <p className="text-sm text-[#717171]">Total Referrals</p>
                <p className="text-2xl font-medium">{totalReferrals}</p>
              </div>
              <div className="p-4 bg-[#202020] rounded-xl">
                <p className="text-sm text-[#717171]">Recent Referrals</p>
                <p className="text-2xl font-medium">{sortedReferrals.length}</p>
              </div>
            </div>
          </div>

          {/* Referral List */}
          <div className="md:col-span-2 bg-[#181818] rounded-2xl p-6 mb-28">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Your Referrals</h2>
              {sortedReferrals.length > 0 && (
                <span className="text-sm text-[#717171]">
                  Sorted by most recent
                </span>
              )}
            </div>
            {sortedReferrals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#717171]">No referrals yet</p>
                <p className="text-sm text-[#4B4B4B] mt-2">
                  Share your referral code to start earning rewards
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedReferrals.map((referral, index) => (
                  <div
                    key={referral._id || index}
                    className="flex items-center justify-between p-4 bg-[#202020] rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {referral.email || "Unknown email"}
                        </p>
                        {index === 0 && (
                          <span className="px-2 py-1 text-xs bg-[#3AEBA5] text-black rounded-full font-medium">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#717171]">
                        Joined{" "}
                        {referral.createdAt
                          ? new Date(referral.createdAt).toLocaleString()
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
