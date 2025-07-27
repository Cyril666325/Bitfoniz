"use client";

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowDownUp, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SUPPORTED_COINS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "https://resource.cwallet.com/token/icon/btc.png",
    minAmount: 0.00026,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://resource.cwallet.com/token/icon/ETH.png",
    minAmount: 0.01,
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "https://resource.cwallet.com/token/icon/usdt.png",
    minAmount: 6,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://resource.cwallet.com/token/icon/usdc.png",
    minAmount: 6,
  },
];

interface CoinSelectorProps {
  selectedCoin: (typeof SUPPORTED_COINS)[0];
  onSelect: (coin: (typeof SUPPORTED_COINS)[0]) => void;
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  showMinAmount?: boolean;
}

const CoinSelector = ({
  selectedCoin,
  onSelect,
  label,
  amount,
  onAmountChange,
  showMinAmount,
}: CoinSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="text-gray-400 text-sm mb-2 block">{label}</label>
      <div className="bg-[#202020] rounded-xl p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333] transition-colors rounded-lg px-3 py-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Image
              src={selectedCoin.icon}
              alt={selectedCoin.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium text-white">
              {selectedCoin.symbol}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="bg-transparent text-xl md:text-2xl text-white outline-none flex-1 text-center sm:text-right"
          />
        </div>
        {showMinAmount && (
          <div className="text-xs sm:text-sm text-gray-400">
            Min amount: {selectedCoin.minAmount} {selectedCoin.symbol}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-full bg-[#202020] rounded-xl shadow-lg z-50 p-2"
          >
            {SUPPORTED_COINS.map((coin) => (
              <motion.button
                key={coin.symbol}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                onClick={() => {
                  onSelect(coin);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg"
              >
                <Image
                  src={coin.icon}
                  alt={coin.symbol}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div className="text-left">
                  <div className="font-medium text-white">{coin.symbol}</div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {coin.name}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ConvertPage() {
  const [fromCoin, setFromCoin] = useState(SUPPORTED_COINS[0]);
  const [toCoin, setToCoin] = useState(SUPPORTED_COINS[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const handleSwap = () => {
    const tempCoin = fromCoin;
    const tempAmount = fromAmount;
    setFromCoin(toCoin);
    setFromAmount(toAmount);
    setToCoin(tempCoin);
    setToAmount(tempAmount);
  };

  return (
    <div className="max-w-[600px] mx-auto p-3 sm:p-6">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Link
          href="/dashboard"
          className="hover:bg-[#2A2A2A] p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Convert</h1>
      </div>

      <div className="space-y-6 bg-[#181818] p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl">
        <CoinSelector
          label="From"
          selectedCoin={fromCoin}
          onSelect={setFromCoin}
          amount={fromAmount}
          onAmountChange={setFromAmount}
          showMinAmount
        />

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSwap}
            className="bg-[#3AEBA5] rounded-full p-3 md:p-4 -my-3 z-10 hover:bg-[#2CD695] transition-colors"
          >
            <ArrowDownUp className="w-5 h-5 md:w-6 md:h-6 text-[#181818]" />
          </motion.button>
        </div>

        <CoinSelector
          label="To"
          selectedCoin={toCoin}
          onSelect={setToCoin}
          amount={toAmount}
          onAmountChange={setToAmount}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#3AEBA5] text-[#181818] rounded-xl py-4 md:py-5 text-base md:text-lg font-semibold mt-6 hover:bg-[#2CD695] transition-colors"
        >
          Swap Now
        </motion.button>
      </div>
    </div>
  );
}
