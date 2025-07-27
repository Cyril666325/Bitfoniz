"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import type { Coin, Network } from "@/types/ccpayment";

interface NetworkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: Coin | null;
  onNetworkSelect: (network: Network) => void;
}

const NetworkSelectionModal = ({
  isOpen,
  onClose,
  coin,
  onNetworkSelect,
}: NetworkSelectionModalProps) => {
  if (!coin) return null;

  const networks = Object.values(coin.networks || {});

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-[#181818] rounded-2xl p-6 m-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <Image
                      src={coin.logoUrl}
                      alt={coin.symbol}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{coin.symbol}</h3>
                    <p className="text-sm text-[#717171]">Select Network</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#202020] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Network List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {networks
                  .filter((network) => network.canDeposit)
                  .map((network) => (
                    <motion.button
                      key={network.chain}
                      onClick={() => {
                        onNetworkSelect(network);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-[#202020] hover:bg-[#282828] transition-colors border border-transparent hover:border-[#3AEBA5] group"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium group-hover:text-[#3AEBA5] transition-colors">
                          {network.chainFullName}
                        </span>
                        <span className="text-sm text-[#717171]">
                          Min Deposit: {network.minimumDepositAmount}{" "}
                          {coin.symbol}
                        </span>
                      </div>
                      <span className="text-sm text-[#717171] group-hover:text-[#3AEBA5] transition-colors">
                        {network.chain}
                      </span>
                    </motion.button>
                  ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NetworkSelectionModal;
