"use client";

import { ArrowRightLeft, ArrowUp, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getWithdrawalTransactions } from "@/services/ccpayment/ccpayment";

const AssetQuickActions = () => {
  const router = useRouter();
  const [hasPendingWithdrawals, setHasPendingWithdrawals] = useState(false);

  useEffect(() => {
    const checkPendingWithdrawals = async () => {
      try {
        const response = await getWithdrawalTransactions();

        if (response.transactions) {
          // Check if there are any pending or processing withdrawals
          const pendingWithdrawals = response.transactions.filter(
            (transaction: any) =>
              transaction.status === "pending" ||
              transaction.status === "processing"
          );

          setHasPendingWithdrawals(pendingWithdrawals.length > 0);
        }
      } catch (error) {
        console.error("Failed to check pending withdrawals:", error);
        // If API fails, don't block transfers
        setHasPendingWithdrawals(false);
      }
    };

    checkPendingWithdrawals();
  }, []);

  const actions = [
    {
      title: "Deposit",
      icon: Plus,
      href: "/dashboard/deposit",
      description: "Add funds to your account",
      color:
        "from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30",
      bgIcon: "bg-emerald-500/10",
      textColor: "text-emerald-500",
      disabled: false,
    },
    {
      title: "Withdraw",
      icon: ArrowUp,
      href: "/dashboard/withdraw",
      description: "Transfer to external wallet",
      color:
        "from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30",
      bgIcon: "bg-blue-500/10",
      textColor: "text-blue-500",
      disabled: false,
    },
    {
      title: "Convert",
      icon: RefreshCw,
      href: "/dashboard/convert",
      description: "Swap between assets",
      color:
        "from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30",
      bgIcon: "bg-purple-500/10",
      textColor: "text-purple-500",
      disabled: false,
    },
    {
      title: "Transfer",
      icon: ArrowRightLeft,
      href: "/dashboard/transfer",
      description: hasPendingWithdrawals
        ? "Disabled: Pending withdrawals"
        : "Move between wallets",
      color: hasPendingWithdrawals
        ? "from-gray-500/20 to-gray-500/20"
        : "from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30",
      bgIcon: hasPendingWithdrawals ? "bg-gray-500/10" : "bg-amber-500/10",
      textColor: hasPendingWithdrawals ? "text-gray-500" : "text-amber-500",
      disabled: hasPendingWithdrawals,
    },
  ];

  const handleActionClick = (action: (typeof actions)[0]) => {
    if (action.disabled) {
      // Could show a toast message here if needed
      return;
    }
    router.push(action.href);
  };

  return (
    <div className="w-full bg-[#111111] rounded-3xl pt-4 md:pt-6">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-lg md:text-xl font-medium text-gray-200">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-400">Manage your assets easily</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[#3AEBA5] text-sm hover:text-[#2CD690] transition-colors"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => handleActionClick(action)}
            className={`group flex flex-col bg-gradient-to-br ${action.color} rounded-2xl p-4 md:p-5 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/5`}
          >
            <div className="w-full flex items-center justify-between mb-6 md:mb-8">
              <div
                className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${action.bgIcon} backdrop-blur flex items-center justify-center`}
              >
                <action.icon
                  className={`${action.textColor} transition-transform group-hover:scale-110`}
                  size={22}
                />
              </div>
              <div className="h-8 w-8 rounded-lg bg-black/20  backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={action.textColor}
                >
                  <path
                    d="M1 7H13M13 7L7 1M13 7L7 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3
                className={`text-base md:text-lg font-medium ${action.textColor} mb-1`}
              >
                {action.title}
              </h3>
              <p className="text-sm text-gray-400 font-light">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetQuickActions;
