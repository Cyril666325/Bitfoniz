"use client";

import type { Coin, Network } from "@/types/ccpayment";
import { AnimatePresence, motion } from "framer-motion";
import { GripHorizontal, X } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface DepositAddressSheetProps {
  isOpen: boolean;
  onClose: () => void;
  coin: Coin;
  network: Network;
  depositAddress: string;
}

const DepositAddressSheet = ({
  isOpen,
  onClose,
  coin,
  network,
  depositAddress,
}: DepositAddressSheetProps) => {
  const [copied, setCopied] = useState(false);

  // Check if this is a hardcoded USDT address
  const isHardcodedUSDT =
    coin.symbol.toUpperCase() === "USDT" &&
    (depositAddress === "TTxwR2wbcr9WehdEdY1RagTDqdPqNWJxzZ" ||
      depositAddress === "0x4a42C446E449EE763edaD06cE150E8a053860351");

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
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
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#202020]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Network Warning */}
              <div className="bg-[#3AEBA5]/10 border border-[#3AEBA5] rounded-lg p-3 text-xs mb-4">
                <p className="text-[#3AEBA5] font-medium mb-0.5">Important</p>
                <p className="text-[#717171]">
                  Only send {coin.symbol} on the {network.chainFullName} network
                  to this address. Sending other assets may result in permanent
                  loss.
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center bg-white p-4 rounded-lg mb-4">
                <QRCodeSVG
                  value={depositAddress}
                  size={160}
                  level="H"
                  includeMargin={true}
                  className="w-full max-w-[160px]"
                />
              </div>

              {/* Address Display */}
              <div className="space-y-2">
                <div className="text-xs text-[#717171] flex items-center justify-between">
                  <span>Deposit Address</span>
                  <span className="text-[10px] bg-[#202020] px-2 py-0.5 rounded-full">
                    Tap to copy
                  </span>
                </div>
                <div
                  onClick={() => copyToClipboard(depositAddress)}
                  className="bg-[#202020] rounded-lg p-3 font-mono text-sm break-all cursor-pointer active:bg-[#282828] transition-colors"
                >
                  {depositAddress}
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-[#3AEBA5] text-center"
                  >
                    Address copied to clipboard!
                  </motion.p>
                )}

                {/* Address Validity Note */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-xs mt-2">
                  <p className="text-yellow-400">
                    <span className="font-medium">Note:</span>{" "}
                    {isHardcodedUSDT
                      ? "This is a permanent USDT deposit address. You can use this address for multiple deposits."
                      : "This address is valid for this transaction only. To make another deposit, please generate a new address."}
                  </p>
                </div>
              </div>

              {/* Minimum Deposit Warning */}
              <div className="bg-[#202020] rounded-lg p-3 text-xs mt-4">
                <p className="text-[#717171]">
                  Minimum deposit:{" "}
                  <span className="text-white">
                    {network.minimumDepositAmount} {coin.symbol}
                  </span>
                </p>
                <p className="text-[#717171] mt-0.5">
                  Deposits below the minimum amount cannot be processed
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DepositAddressSheet;
