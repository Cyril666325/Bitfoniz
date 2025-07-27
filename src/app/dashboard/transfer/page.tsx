"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import {
  getUserBalances,
  getCcPaymentCoins,
  getWithdrawalTransactions,
} from "@/services/ccpayment/ccpayment";
import {
  transferToTradingWallet,
  transferFromTradingWallet,
  transferBetweenTradingAccounts,
  getTradingVolume,
} from "@/services/transfer";
import type { Coin } from "@/types/ccpayment";
import type { Balance } from "@/types/balance";
import { toast } from "sonner";

interface TradingVolumeData {
  totalTradingVolume: number;
  requiredVolume: number;
  volumeMet: boolean;
  remainingVolume: number;
}

interface TradingVolumeResponse {
  success: boolean;
  data: {
    spot: TradingVolumeData[];
    futures: TradingVolumeData[];
  };
}

const WALLET_TYPES = [
  { id: "exchange", name: "Exchange", description: "Main exchange wallet" },
  { id: "spot", name: "Trade", description: "For spot trading" },
  { id: "futures", name: "Contract", description: "For VIP trading" },
];

const COIN_ICONS: Record<string, string> = {
  USDT: "https://resource.cwallet.com/token/icon/usdt.png",
  USDC: "https://resource.cwallet.com/token/icon/usdc.png",
  BTC: "https://resource.cwallet.com/token/icon/btc.png",
  ETH: "https://resource.cwallet.com/token/icon/ETH.png",
  SOL: "https://resource.cwallet.com/token/icon/sol.png",
} as const;

const CoinIcon = ({ symbol, size = 20 }: { symbol: string; size?: number }) => {
  const [error, setError] = useState(false);

  // Handle null/undefined symbol
  const safeSymbol = symbol || "UNKNOWN";
  const iconUrl =
    COIN_ICONS[safeSymbol] || `/assets/coins/${safeSymbol.toLowerCase()}.svg`;

  return (
    <div
      className={`w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center overflow-hidden`}
    >
      <Image
        src={error ? `/assets/coins/generic.svg` : iconUrl}
        alt={safeSymbol}
        width={size}
        height={size}
        className="rounded-full"
        onError={() => setError(true)}
      />
    </div>
  );
};

const Transfer = () => {
  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<Balance | null>(null);
  const [availableBalance, setAvailableBalance] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeBalances, setExchangeBalances] = useState<Balance[]>([]);
  const [spotBalances, setSpotBalances] = useState<Balance[]>([]);
  const [futuresBalances, setFuturesBalances] = useState<Balance[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [fromWalletType, setFromWalletType] = useState(WALLET_TYPES[0]);
  const [toWalletType, setToWalletType] = useState(WALLET_TYPES[1]);
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [volumeData, setVolumeData] = useState<TradingVolumeResponse | null>(
    null
  );
  const [showPendingWithdrawalsModal, setShowPendingWithdrawalsModal] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [balancesResponse, coinsData] = await Promise.all([
          getUserBalances(),
          getCcPaymentCoins(),
        ]);

        if (balancesResponse.success && balancesResponse.data) {
          setExchangeBalances(balancesResponse.data.exchange || []);
          setSpotBalances(balancesResponse.data.spot || []);
          setFuturesBalances(balancesResponse.data.futures || []);

          // Set initial selected coin from exchange balances with balance > 0
          const exchangeAssets = (balancesResponse.data.exchange || []).filter(
            (coin: Balance) => coin.coinName && coin.balance > 0
          );
          if (exchangeAssets.length > 0) {
            setSelectedCoin(exchangeAssets[0]);
            setAvailableBalance(exchangeAssets[0].balance.toFixed(6));
          } else {
            // If no exchange assets with balance, try any exchange asset
            const allExchangeAssets = (
              balancesResponse.data.exchange || []
            ).filter((coin: Balance) => coin.coinName);
            if (allExchangeAssets.length > 0) {
              setSelectedCoin(allExchangeAssets[0]);
              setAvailableBalance("0.00");
            }
          }
        } else {
          setError("Failed to fetch balances");
        }

        if (coinsData.success && coinsData.data.data.coins) {
          setCoins(coinsData.data.data.coins);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load wallet data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      setAvailableBalance(selectedCoin.balance.toString());
    }
  }, [selectedCoin]);

  // Update selected coin when wallet type changes
  useEffect(() => {
    const balances = getBalancesForWalletType(fromWalletType.id);
    const validBalances = balances.filter(
      (coin: Balance) => coin.coinName && coin.balance > 0
    );

    if (validBalances.length > 0) {
      // Try to find the same coin in the new wallet, otherwise select the first one with balance
      const existingCoin = selectedCoin
        ? validBalances.find(
            (coin: Balance) => coin.coinName === selectedCoin.coinName
          )
        : null;

      const newSelectedCoin = existingCoin || validBalances[0];
      setSelectedCoin(newSelectedCoin);
      setAvailableBalance(newSelectedCoin.balance.toFixed(6));
    } else {
      // If no assets with balance, select the first asset (even with 0 balance) for display
      const allAssets = balances.filter((coin: Balance) => coin.coinName);
      if (allAssets.length > 0) {
        setSelectedCoin(allAssets[0]);
        setAvailableBalance("0.00");
      } else {
        setSelectedCoin(null);
        setAvailableBalance("0.00");
      }
    }
  }, [fromWalletType.id, exchangeBalances, spotBalances, futuresBalances]);

  const getBalancesForWalletType = (type: string): Balance[] => {
    switch (type) {
      case "exchange":
        return exchangeBalances;
      case "spot":
        return spotBalances;
      case "futures":
        return futuresBalances;
      default:
        return [];
    }
  };

  const checkTradingVolume = async (fromType: string): Promise<boolean> => {
    try {
      const response: TradingVolumeResponse = await getTradingVolume();
      setVolumeData(response);

      if (response.success && response.data) {
        const accountData =
          fromType === "spot" ? response.data.spot : response.data.futures;

        // Check if volume requirement is met for this account type
        // Since the API returns an array, get the first (and typically only) item
        const volumeStatus = accountData[0];

        if (volumeStatus && !volumeStatus.volumeMet) {
          setShowVolumeModal(true);
          return false;
        }

        return true;
      }

      return true;
    } catch (error) {
      console.error("Failed to check trading volume:", error);
      return true;
    }
  };

  const checkPendingWithdrawals = async (): Promise<boolean> => {
    try {
      const response = await getWithdrawalTransactions();

      if (response.transactions) {
        const pendingWithdrawals = response.transactions.filter(
          (transaction: { status: string }) =>
            transaction.status === "pending" ||
            transaction.status === "processing"
        );

        if (pendingWithdrawals.length > 0) {
          setShowPendingWithdrawalsModal(true);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to check pending withdrawals:", error);
      return true;
    }
  };

  const handleConfirmedTransfer = async () => {
    if (!selectedCoin || !amount || selectedCoin.balance <= 0) return;

    try {
      setIsSubmitting(true);

      const isFromExchange = fromWalletType.id === "exchange";
      const isToExchange = toWalletType.id === "exchange";
      const isSpotToFutures =
        fromWalletType.id === "spot" && toWalletType.id === "futures";
      const isFuturesToSpot =
        fromWalletType.id === "futures" && toWalletType.id === "spot";

      let response;

      // Use transferBetweenTradingAccounts for spot-to-futures and futures-to-spot transfers
      if (isSpotToFutures || isFuturesToSpot) {
        response = await transferBetweenTradingAccounts(
          selectedCoin.coinId.toString(),
          Number(amount),
          fromWalletType.id,
          toWalletType.id,
          selectedCoin.coinName
        );
      } else if (isFromExchange && !isToExchange) {
        response = await transferToTradingWallet(
          selectedCoin.coinId.toString(),
          Number(amount),
          toWalletType.id, // destination: "spot" or "futures"
          selectedCoin.coinName
        );
      } else if (!isFromExchange && isToExchange) {
        response = await transferFromTradingWallet(
          selectedCoin.coinId.toString(),
          Number(amount),
          fromWalletType.id, // source: "spot" or "futures"
          selectedCoin.coinName
        );
      } else {
        response = await transferToTradingWallet(
          selectedCoin.coinId.toString(),
          Number(amount),
          toWalletType.id,
          selectedCoin.coinName
        );
      }

      if (response.success) {
        // Handle different response formats
        if (response.data && response.data.fee && response.data.netAmount) {
          // New response format with fee information
          const feeInfo =
            response.data.feeType === "penalty_fee"
              ? ` (Fee: ${response.data.fee} ${selectedCoin.coinName}, Net: ${response.data.netAmount} ${selectedCoin.coinName})`
              : "";
          toast.success(`${response.message}${feeInfo}`);
        } else {
          // Standard response format
          toast.success(response.message || "Transfer completed successfully!");
        }

        setAmount("");

        const balancesResponse = await getUserBalances();
        if (balancesResponse.success && balancesResponse.data) {
          setExchangeBalances(balancesResponse.data.exchange || []);
          setSpotBalances(balancesResponse.data.spot || []);
          setFuturesBalances(balancesResponse.data.futures || []);

          const updatedWalletBalances = getBalancesForWalletType(
            fromWalletType.id
          );
          const updatedCoin = updatedWalletBalances.find(
            (coin) => coin.coinId === selectedCoin.coinId
          );
          if (updatedCoin) {
            setSelectedCoin(updatedCoin);
            setAvailableBalance(
              updatedCoin.balance > 0 ? updatedCoin.balance.toFixed(6) : "0.00"
            );
          }
        }
      } else {
        toast.error(response.message || "Transfer failed. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Transfer failed:", error);

      let errorMessage = "Transfer failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = apiError.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !amount || selectedCoin.balance <= 0) return;

    try {
      setIsSubmitting(true);

      const isFromExchange = fromWalletType.id === "exchange";
      const isToExchange = toWalletType.id === "exchange";

      if (isFromExchange && !isToExchange) {
        const pendingCheckPassed = await checkPendingWithdrawals();
        if (!pendingCheckPassed) {
          setIsSubmitting(false);
          return;
        }
      }

      if (!isFromExchange && isToExchange) {
        const volumeCheckPassed = await checkTradingVolume(fromWalletType.id);
        if (!volumeCheckPassed) {
          setIsSubmitting(false);
          return;
        }
      }

      await handleConfirmedTransfer();
    } catch (error: unknown) {
      console.error("Transfer failed:", error);
      setIsSubmitting(false);
    }
  };

  const PendingWithdrawalsModal = () => {
    if (!showPendingWithdrawalsModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#1A1D24] rounded-2xl p-6 max-w-md w-full border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tips</h3>
            <button
              onClick={() => setShowPendingWithdrawalsModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              Cannot transfer funds while you have pending withdrawal requests.
              Please wait for your withdrawals to complete or cancel them first.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPendingWithdrawalsModal(false)}
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPendingWithdrawalsModal(false)}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              Done / OK
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const VolumeModal = () => {
    if (!volumeData || !showVolumeModal) return null;

    const accountData =
      fromWalletType.id === "spot"
        ? volumeData.data.spot
        : volumeData.data.futures;

    // Get the first (and typically only) volume status item
    const volumeStatus = accountData[0];

    if (!volumeStatus) return null;

    console.log("Volume Status:", volumeStatus);
    console.log("Required Volume:", volumeStatus.requiredVolume);
    console.log("Total Trading Volume:", volumeStatus.totalTradingVolume);
    console.log("Remaining Volume:", volumeStatus.remainingVolume);
    console.log("Volume Met:", volumeStatus.volumeMet);

    const actualRemaining = volumeStatus.remainingVolume;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#1A1D24] rounded-2xl p-6 max-w-md w-full border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tips</h3>
            <button
              onClick={() => setShowVolumeModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              If the transaction volume is insufficient, you still need to
              complete{" "}
              <span className="text-white font-medium">
                {actualRemaining.toFixed(2)}
              </span>{" "}
              transaction volume, or deduct{" "}
              <span className="text-white font-medium">20%</span> handling fee
              for transfer!
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowVolumeModal(false)}
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setShowVolumeModal(false);
                if (!selectedCoin || !amount || selectedCoin.balance <= 0)
                  return;

                try {
                  setIsSubmitting(true);

                  const isFromExchange = fromWalletType.id === "exchange";
                  const isToExchange = toWalletType.id === "exchange";
                  const isSpotToFutures =
                    fromWalletType.id === "spot" &&
                    toWalletType.id === "futures";
                  const isFuturesToSpot =
                    fromWalletType.id === "futures" &&
                    toWalletType.id === "spot";

                  let response;

                  // Use transferBetweenTradingAccounts for spot-to-futures and futures-to-spot transfers
                  if (isSpotToFutures || isFuturesToSpot) {
                    response = await transferBetweenTradingAccounts(
                      selectedCoin.coinId.toString(),
                      Number(amount),
                      fromWalletType.id,
                      toWalletType.id,
                      selectedCoin.coinName
                    );
                  } else if (isFromExchange && !isToExchange) {
                    response = await transferToTradingWallet(
                      selectedCoin.coinId.toString(),
                      Number(amount),
                      toWalletType.id,
                      selectedCoin.coinName
                    );
                  } else if (!isFromExchange && isToExchange) {
                    response = await transferFromTradingWallet(
                      selectedCoin.coinId.toString(),
                      Number(amount),
                      fromWalletType.id,
                      selectedCoin.coinName
                    );
                  } else {
                    response = await transferToTradingWallet(
                      selectedCoin.coinId.toString(),
                      Number(amount),
                      toWalletType.id,
                      selectedCoin.coinName
                    );
                  }

                  if (response.success) {
                    // Handle different response formats
                    if (
                      response.data &&
                      response.data.fee &&
                      response.data.netAmount
                    ) {
                      // New response format with fee information
                      const feeInfo =
                        response.data.feeType === "penalty_fee"
                          ? ` (Fee: ${response.data.fee} ${selectedCoin.coinName}, Net: ${response.data.netAmount} ${selectedCoin.coinName})`
                          : "";
                      toast.success(`${response.message}${feeInfo}`);
                    } else {
                      // Standard response format
                      toast.success(
                        response.message || "Transfer completed successfully!"
                      );
                    }
                    setAmount("");

                    const balancesResponse = await getUserBalances();
                    if (balancesResponse.success && balancesResponse.data) {
                      setExchangeBalances(balancesResponse.data.exchange || []);
                      setSpotBalances(balancesResponse.data.spot || []);
                      setFuturesBalances(balancesResponse.data.futures || []);

                      const updatedWalletBalances = getBalancesForWalletType(
                        fromWalletType.id
                      );
                      const updatedCoin = updatedWalletBalances.find(
                        (coin) => coin.coinId === selectedCoin.coinId
                      );
                      if (updatedCoin) {
                        setSelectedCoin(updatedCoin);
                        setAvailableBalance(
                          updatedCoin.balance > 0
                            ? updatedCoin.balance.toFixed(6)
                            : "0.00"
                        );
                      }
                    }
                  } else {
                    toast.error(
                      response.message || "Transfer failed. Please try again."
                    );
                  }
                } catch (error: unknown) {
                  console.error("Transfer failed:", error);

                  let errorMessage = "Transfer failed. Please try again.";

                  if (error instanceof Error) {
                    errorMessage = error.message;
                  } else if (
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error
                  ) {
                    const apiError = error as {
                      response?: { data?: { message?: string } };
                    };
                    errorMessage =
                      apiError.response?.data?.message || errorMessage;
                  }

                  toast.error(errorMessage);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="flex-1 px-4 py-3 bg-[#F5A623] text-black font-medium rounded-xl hover:bg-[#E6951F] transition-colors"
            >
              Done / OK
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const WalletOption = ({
    type,
    selected,
  }: {
    type: (typeof WALLET_TYPES)[0];
    selected: boolean;
  }) => (
    <div className="flex items-start gap-3 p-4">
      <div
        className={`w-2 h-2 rounded-full mt-2 ${
          selected ? "bg-[#3AEBA5]" : "bg-gray-600"
        }`}
      />
      <div>
        <h3 className="font-medium">{type.name}</h3>
        <p className="text-sm text-gray-400">{type.description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-6 mb-20">
      <div className="max-w-[500px] mx-auto pt-10">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-lg bg-[#16161680] p-8 rounded-3xl border border-[#ffffff10] shadow-2xl"
          >
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin mr-3" />
              <span className="text-gray-400">Loading wallet data...</span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-lg bg-[#16161680] p-8 rounded-3xl border border-[#ffffff10] shadow-2xl"
          >
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">{error}</div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-[#3AEBA5] to-[#2CD690] text-black font-semibold rounded-2xl px-6 py-3 transition-all hover:shadow-lg hover:shadow-[#3AEBA5]/20"
              >
                Retry
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleTransfer}
            className="space-y-6 backdrop-blur-lg bg-[#16161680] p-8 rounded-3xl border border-[#ffffff10] shadow-2xl"
          >
            <div className="relative">
              <label className="text-sm text-gray-400 mb-2 ml-1 block">
                From
              </label>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => {
                  setIsFromDropdownOpen(!isFromDropdownOpen);
                  setIsToDropdownOpen(false);
                }}
                className="w-full bg-[#16161680] backdrop-blur text-left rounded-2xl p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-all border border-[#ffffff10] hover:border-[#3AEBA5]"
              >
                <span className="text-lg font-medium">
                  {fromWalletType.name}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isFromDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
              {isFromDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 bg-[#161616] rounded-2xl overflow-hidden z-20 shadow-lg border border-[#ffffff10]"
                >
                  {WALLET_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      type="button"
                      whileHover={{ backgroundColor: "#1A1A1A" }}
                      onClick={() => {
                        setFromWalletType(type);
                        setIsFromDropdownOpen(false);
                      }}
                      className="w-full transition-colors"
                    >
                      <WalletOption
                        type={type}
                        selected={type.id === fromWalletType.id}
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="relative flex justify-center">
              <motion.button
                type="button"
                onClick={() => {
                  const temp = fromWalletType;
                  setFromWalletType(toWalletType);
                  setToWalletType(temp);
                }}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute -my-3 w-12 h-12 bg-gradient-to-r from-[#3AEBA5] to-[#2CD690] rounded-full flex items-center justify-center shadow-lg shadow-[#3AEBA5]/20 z-10 hover:shadow-[#3AEBA5]/40 transition-shadow"
              >
                <ArrowDownUp size={20} className="text-black" />
              </motion.button>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-400 mb-2 ml-1 block">
                To
              </label>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => {
                  setIsToDropdownOpen(!isToDropdownOpen);
                  setIsFromDropdownOpen(false);
                }}
                className="w-full bg-[#16161680] backdrop-blur text-left rounded-2xl p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-all border border-[#ffffff10] hover:border-[#3AEBA5]"
              >
                <span className="text-lg font-medium">{toWalletType.name}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isToDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
              {isToDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 bg-[#161616] rounded-2xl overflow-hidden z-20 shadow-lg border border-[#ffffff10]"
                >
                  {WALLET_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      type="button"
                      whileHover={{ backgroundColor: "#1A1A1A" }}
                      onClick={() => {
                        setToWalletType(type);
                        setIsToDropdownOpen(false);
                      }}
                      className="w-full transition-colors"
                    >
                      <WalletOption
                        type={type}
                        selected={type.id === toWalletType.id}
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="relative mt-6">
              <label className="text-sm text-gray-400 mb-2 ml-1 block">
                {fromWalletType.name} Wallet Balance
              </label>
              <div className="bg-[#16161680] backdrop-blur rounded-2xl p-4 border border-[#ffffff10]">
                {getBalancesForWalletType(fromWalletType.id).length > 0 ? (
                  <div className="space-y-3">
                    {getBalancesForWalletType(fromWalletType.id)
                      .filter((coin: Balance) => coin.coinName)
                      .map((coin) => {
                        const coinDetails = coins.find(
                          (c) => c.symbol === coin.coinName
                        );
                        const hasBalance = coin.balance > 0;
                        const displayBalance =
                          coin.balance > 0 ? coin.balance.toFixed(6) : "0.00";

                        return (
                          <motion.button
                            key={coin.coinId}
                            type="button"
                            whileHover={{ scale: hasBalance ? 1.02 : 1 }}
                            onClick={() => {
                              if (hasBalance) {
                                setSelectedCoin(coin);
                                setAvailableBalance(coin.balance.toFixed(6));
                              }
                            }}
                            className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${
                              hasBalance
                                ? "bg-[#202020] hover:bg-[#252525] border border-[#3AEBA5]/20 cursor-pointer"
                                : "bg-[#1A1A1A] border border-gray-700 opacity-60 cursor-not-allowed"
                            } ${
                              selectedCoin?.coinId === coin.coinId
                                ? "ring-2 ring-[#3AEBA5]"
                                : ""
                            }`}
                          >
                            <CoinIcon symbol={coin.coinName || "UNKNOWN"} />
                            <div className="flex flex-col items-start flex-1">
                              <span className="text-base font-medium">
                                {coin.coinName || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {coinDetails?.coinFullName || "Unknown Asset"}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span
                                className={`text-sm font-medium ${
                                  hasBalance ? "text-white" : "text-gray-500"
                                }`}
                              >
                                {displayBalance}
                              </span>
                              {coin.lockedBalance > 0 && (
                                <span className="text-xs text-orange-400">
                                  Locked:{" "}
                                  {coin.lockedBalance > 0
                                    ? coin.lockedBalance.toFixed(6)
                                    : "0.00"}
                                </span>
                              )}
                              {!hasBalance && (
                                <span className="text-xs text-gray-600">
                                  No balance
                                </span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-sm">
                      No assets in {fromWalletType.name} wallet
                    </div>
                    <div className="text-xs mt-1">
                      Switch to a different wallet to see available assets
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 ml-1 block">Amount</label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min. 0.5"
                  className="w-full bg-[#16161680] backdrop-blur rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#3AEBA5] transition-all border border-[#ffffff10] placeholder-gray-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    if (selectedCoin && selectedCoin.balance > 0) {
                      setAmount(selectedCoin.balance.toString());
                    }
                  }}
                  disabled={!selectedCoin || selectedCoin.balance <= 0}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors ${
                    selectedCoin && selectedCoin.balance > 0
                      ? "text-[#3AEBA5] hover:text-[#2CD690] cursor-pointer"
                      : "text-gray-500 cursor-not-allowed"
                  }`}
                >
                  MAX
                </motion.button>
              </div>
              <div className="flex justify-between text-sm px-1">
                <span className="text-gray-400">Available Balance</span>
                <span className="font-medium">
                  {selectedCoin && selectedCoin.balance > 0
                    ? `${selectedCoin.balance.toFixed(6)} ${
                        selectedCoin.coinName || ""
                      }`
                    : selectedCoin
                    ? `0.00 ${selectedCoin.coinName || ""}`
                    : "0.00"}
                </span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={
                isSubmitting ||
                !amount ||
                !selectedCoin ||
                selectedCoin.balance <= 0
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-gradient-to-r from-[#3AEBA5] to-[#2CD690] text-black font-semibold rounded-2xl p-4 mt-8 transition-all ${
                isSubmitting ||
                !amount ||
                !selectedCoin ||
                selectedCoin.balance <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg hover:shadow-[#3AEBA5]/20"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : selectedCoin && selectedCoin.balance <= 0 ? (
                "Insufficient Balance"
              ) : (
                "Transfer Now"
              )}
            </motion.button>
          </motion.form>
        )}
      </div>

      <PendingWithdrawalsModal />
      <VolumeModal />
    </div>
  );
};

export default Transfer;
