"use client";

import type { Coin, Network } from "@/types/ccpayment";
import { AnimatePresence, motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface WithdrawFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  coin: Coin;
  network: Network;
  onNetworkChange: () => void;
  onWithdraw: (data: {
    amount: string;
    address: string;
    memo?: string;
  }) => Promise<void>;
  userBalance: number;
  minimumWithdrawal: number;
  minUsdAmount: number;
}

const WithdrawFormSheet = ({
  isOpen,
  onClose,
  coin,
  network,
  onNetworkChange,
  onWithdraw,
  userBalance,
  minimumWithdrawal,
  minUsdAmount,
}: WithdrawFormSheetProps) => {
  const [amount, setAmount] = useState("");
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidAmount = (): boolean => {
    if (!amount) return false;

    const inputAmount = Number(amount);

    // Check if amount is valid number
    if (isNaN(inputAmount) || inputAmount <= 0) return false;

    // Check minimum withdrawal (including $25 minimum)
    if (inputAmount < minimumWithdrawal) return false;

    // Check if user has sufficient balance
    if (inputAmount > userBalance) return false;

    return true;
  };

  const getValidationMessage = (): string | null => {
    if (!amount) return null;

    const inputAmount = Number(amount);

    if (isNaN(inputAmount) || inputAmount <= 0) {
      return "Please enter a valid amount";
    }

    if (inputAmount < minimumWithdrawal) {
      return `Minimum withdrawal: ${minimumWithdrawal.toFixed(6)} ${
        coin.symbol
      } (≈$${minUsdAmount})`;
    }

    if (inputAmount > userBalance) {
      return `Insufficient balance. Available: ${userBalance.toFixed(6)} ${
        coin.symbol
      }`;
    }

    return null;
  };

  const handleMaxClick = () => {
    setAmount(userBalance.toString());
  };

  const handleSubmit = async () => {
    if (!isValidAmount() || !withdrawalAddress || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onWithdraw({
        amount,
        address: withdrawalAddress,
        memo: memo || undefined,
      });
      // Reset form on success
      setAmount("");
      setWithdrawalAddress("");
      setMemo("");
      onClose();
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#181818] rounded-t-[20px] z-50 lg:hidden overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div
              className="flex justify-center py-2 cursor-pointer touch-pan-x sticky top-0 bg-[#181818] z-10"
              onClick={onClose}
            >
              <GripHorizontal className="text-[#717171]" size={20} />
            </div>

            <div className="px-4 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src={coin.logoUrl}
                      alt={coin.symbol}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{coin.symbol}</h3>
                    <p className="text-xs text-[#717171]">
                      {network.chainFullName}
                    </p>
                    <p className="text-xs text-[#3AEBA5]">
                      Available: {userBalance.toFixed(6)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onNetworkChange}
                  className="px-3 py-1.5 text-xs bg-[#202020] rounded-lg text-[#3AEBA5]"
                >
                  Change Network
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs text-[#717171]">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min ${minimumWithdrawal.toFixed(6)}`}
                    className="w-full h-11 bg-[#202020] rounded-lg px-3 text-sm text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5]"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#3AEBA5]"
                  >
                    MAX
                  </button>
                </div>
                {getValidationMessage() && (
                  <p className="text-xs text-red-400 mt-1">
                    {getValidationMessage()}
                  </p>
                )}
              </div>

              {/* Address Input */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs text-[#717171]">
                  Withdrawal Address
                </label>
                <input
                  type="text"
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                  placeholder={`Enter ${coin.symbol} address`}
                  className="w-full h-11 bg-[#202020] rounded-lg px-3 text-sm text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5]"
                />
              </div>

              {/* Memo Input (Optional) */}
              {network.isSupportMemo && (
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs text-[#717171]">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Enter memo"
                    className="w-full h-11 bg-[#202020] rounded-lg px-3 text-sm text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5]"
                  />
                </div>
              )}

              {/* Warning Messages */}
              <div className="bg-[#FF494933] text-[#FF4949] rounded-lg p-3 space-y-1.5 text-xs mb-4">
                <p className="flex items-center gap-2">
                  <span className="block w-1 h-1 rounded-full bg-[#FF4949]"></span>
                  Minimum withdrawal: ${minUsdAmount} (≈
                  {minimumWithdrawal.toFixed(6)} {coin.symbol})
                </p>
                <p className="flex items-center gap-2">
                  <span className="block w-1 h-1 rounded-full bg-[#FF4949]"></span>
                  Only withdraw to {network.chainFullName} addresses
                </p>
                <p className="flex items-center gap-2">
                  <span className="block w-1 h-1 rounded-full bg-[#FF4949]"></span>
                  Withdrawing to other networks may result in permanent loss
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  !isValidAmount() || !withdrawalAddress || isSubmitting
                }
                className={`w-full h-11 rounded-lg text-sm font-medium transition-colors ${
                  isValidAmount() && withdrawalAddress && !isSubmitting
                    ? "bg-[#3AEBA5] text-black active:bg-[#3AEBA5]/90"
                    : "bg-[#3AEBA5]/20 text-[#717171] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  "Request Withdrawal"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WithdrawFormSheet;
