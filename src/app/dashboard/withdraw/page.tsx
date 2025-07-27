"use client";

import {
  getCcPaymentCoins,
  getWithdrawalTransactions,
} from "@/services/ccpayment/ccpayment";
import { getAssets, getProfile } from "@/services/profile";
import { submitWithdrawalRequest } from "@/services/withdrawal";
import type { Coin, Network } from "@/types/ccpayment";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Shield,
  AlertCircle,
  History,
  X,
  Calendar,
  Check,
  Clock,
  Copy,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NetworkSelectionModal from "./components/NetworkSelectionModal";
import WithdrawFormSheet from "./components/WithdrawFormSheet";

interface UserBalance {
  _id: string;
  coinId: number;
  user: string;
  __v: number;
  balance: number;
  coinName: string;
  lockedBalance: number;
  updatedAt: string;
}

interface UserProfile {
  _id: string;
  email: string;
  referBy: string;
  refCode: string;
  emailVerified: boolean;
  createdAt: string;
  __v: number;
  firstDeposit: boolean;
  isAdmin: boolean;
  kycVerification: boolean;
  phoneVerified: boolean;
  vipTier?: {
    _id: string;
    vipName: string;
    vipLevel: number;
  };
  vipLastUpdated?: string;
  referrals: unknown[];
  referralCount: number;
}

interface WithdrawalTransaction {
  _id: string;
  user: string;
  type: "withdrawal";
  status: "processing" | "completed" | "failed" | "pending" | "declined";
  webhookStatus: string;
  coinId: number;
  address: string;
  chain: string;
  memo: string;
  orderId: string;
  recordId: string;
  logoUrl: string;
  amount: number;
  currency: string;
  fee: number;
  txHash: string | null;
  confirmations: number;
  externalId: string | null;
  externalStatus: string | null;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  declineReason?: string;
}

const WithdrawPage = () => {
  const router = useRouter();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isWithdrawSheetOpen, setIsWithdrawSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Transaction history states
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactions, setTransactions] = useState<WithdrawalTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Minimum withdrawal amount in USD
  const MIN_WITHDRAWAL_USD = 25;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch coins, user balances, and profile
        const [coinsResponse, balancesResponse, profileResponse] =
          await Promise.all([getCcPaymentCoins(), getAssets(), getProfile()]);

        // Set coins
        if (coinsResponse?.data?.data?.coins) {
          const coinsData = coinsResponse.data.data.coins;
          setCoins(coinsData);
          setFilteredCoins(coinsData);
        }

        // Set user balances
        if (balancesResponse?.balance) {
          setUserBalances(balancesResponse.balance);
        }

        // Set user profile
        if (profileResponse) {
          setUserProfile(profileResponse);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.coinFullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoins(filtered);
  }, [searchTerm, coins]);

  const fetchTransactionHistory = async () => {
    try {
      setTransactionsLoading(true);
      const response = await getWithdrawalTransactions();
      if (response.transactions) {
        setTransactions(response.transactions);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleShowTransactionHistory = () => {
    setShowTransactionHistory(true);
    fetchTransactionHistory();
  };

  // Get available balance (balance - locked balance)
  const getAvailableBalance = (coinId: number): number => {
    const balance = userBalances.find((b) => b.coinId === coinId);
    return balance ? balance.balance - balance.lockedBalance : 0;
  };

  // Calculate minimum withdrawal amount based on coin price and $25 minimum
  const getMinimumWithdrawal = (coin: Coin, network: Network): number => {
    const coinPrice = Number(coin.price);
    const networkMinimum = Number(network.minimumWithdrawAmount);
    const usdMinimumInCoin = MIN_WITHDRAWAL_USD / coinPrice;

    // Use the higher of network minimum or $25 equivalent
    return Math.max(networkMinimum, usdMinimumInCoin);
  };

  // Check if user can withdraw (KYC verified)
  const canWithdraw = (): boolean => {
    return userProfile?.kycVerification === true;
  };

  const handleCoinSelect = (coin: Coin) => {
    // Check KYC status before allowing coin selection
    if (!canWithdraw()) {
      setError("Please complete your KYC verification to withdraw funds.");
      return;
    }

    setSelectedCoin(coin);
    setSelectedNetwork(null);
    setAmount("");
    setWithdrawalAddress("");
    setMemo("");
    setError(null);
    setSuccess(null);
    setIsNetworkModalOpen(true);
  };

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setError(null);
    setSuccess(null);
    // Automatically open the withdraw sheet on mobile after network selection
    setIsWithdrawSheetOpen(true);
  };

  const handleWithdraw = async (data: {
    amount: string;
    address: string;
    memo?: string;
  }) => {
    if (!selectedCoin || !selectedNetwork) return;

    // Double-check KYC status before withdrawal
    if (!canWithdraw()) {
      setError("KYC verification is required to complete withdrawals.");
      return;
    }

    try {
      setWithdrawing(true);
      setError(null);
      setSuccess(null);

      const response = await submitWithdrawalRequest(
        selectedCoin.coinId.toString(),
        selectedCoin.coinFullName,
        Number(data.amount),
        data.address,
        selectedNetwork.chain,
        data.memo || ""
      );

      console.log("Withdrawal response:", response);

      if (response.success) {
        setSuccess(
          "Withdrawal request submitted successfully! It will be processed shortly."
        );
        // Reset form
        setAmount("");
        setWithdrawalAddress("");
        setMemo("");
        // Refresh balances
        const balancesResponse = await getAssets();
        if (balancesResponse?.balance) {
          setUserBalances(balancesResponse.balance);
        }
      } else {
        setError(
          response.message || "Withdrawal request failed. Please try again."
        );
      }
    } catch (error: unknown) {
      console.error("Withdrawal error:", error);

      // Handle different types of errors
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const isValidAmount = (): boolean => {
    if (!selectedNetwork || !selectedCoin || !amount) return false;

    const inputAmount = Number(amount);
    const availableBalance = getAvailableBalance(selectedCoin.coinId);
    const minimumWithdrawal = getMinimumWithdrawal(
      selectedCoin,
      selectedNetwork
    );

    // Check if amount is valid number
    if (isNaN(inputAmount) || inputAmount <= 0) return false;

    // Check minimum withdrawal (including $25 minimum)
    if (inputAmount < minimumWithdrawal) return false;

    // Check if user has sufficient balance
    if (inputAmount > availableBalance) return false;

    return true;
  };

  const handleMaxClick = () => {
    if (!selectedCoin) return;
    const availableBalance = getAvailableBalance(selectedCoin.coinId);
    setAmount(availableBalance.toString());
  };

  const getValidationMessage = (): string | null => {
    if (!selectedNetwork || !selectedCoin || !amount) return null;

    const inputAmount = Number(amount);
    const availableBalance = getAvailableBalance(selectedCoin.coinId);
    const minimumWithdrawal = getMinimumWithdrawal(
      selectedCoin,
      selectedNetwork
    );

    if (isNaN(inputAmount) || inputAmount <= 0) {
      return "Please enter a valid amount";
    }

    if (inputAmount < minimumWithdrawal) {
      return `Minimum withdrawal: ${minimumWithdrawal.toFixed(6)} ${
        selectedCoin.symbol
      } (≈$${MIN_WITHDRAWAL_USD})`;
    }

    if (inputAmount > availableBalance) {
      return `Insufficient balance. Available: ${availableBalance.toFixed(6)} ${
        selectedCoin.symbol
      }`;
    }

    return null;
  };

  const handleKycRedirect = () => {
    router.push("/kyc");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-400" />;
      case "processing":
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
      case "declined":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "processing":
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
      case "declined":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-[#0A0A0A]">
      <div className="w-full max-w-[1280px] pt-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 sticky top-0 bg-[#0A0A0A] py-2 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 flex items-center justify-center bg-[#181818] rounded-xl hover:bg-[#202020] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-medium">Withdraw Crypto</h1>
          </div>
          <button
            onClick={handleShowTransactionHistory}
            className="flex items-center gap-2 px-4 py-2 bg-[#181818] rounded-xl hover:bg-[#202020] transition-colors text-[#3AEBA5]"
          >
            <History size={18} />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        {/* KYC Warning - Show if KYC not verified */}
        {userProfile && !canWithdraw() && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-medium mb-1">
                  KYC Verification Required
                </h3>
                <p className="text-yellow-400/80 text-sm mb-3">
                  You need to complete your KYC verification before you can
                  withdraw funds. This helps us ensure the security of your
                  account and comply with regulations.
                </p>
                <button
                  onClick={handleKycRedirect}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
                >
                  Complete KYC Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="md:col-span-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="md:col-span-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-400 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#717171]">Loading available coins...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Coin Selection */}
            <div className="bg-[#181818] rounded-2xl p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search coins..."
                    className="w-full h-12 bg-[#202020] rounded-xl pl-12 pr-4 text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5] transition-all"
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#717171]"
                    size={20}
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] md:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#3AEBA5] scrollbar-track-[#202020] scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                {filteredCoins.length === 0 ? (
                  <div className="text-center text-[#717171] py-8">
                    <p className="mb-2">No coins found</p>
                    <p className="text-sm">
                      Try searching with a different term
                    </p>
                  </div>
                ) : (
                  filteredCoins.map((coin) => {
                    const availableBalance = getAvailableBalance(coin.coinId);
                    const isKycVerified = canWithdraw();
                    return (
                      <motion.button
                        key={coin.coinId}
                        onClick={() => handleCoinSelect(coin)}
                        disabled={!isKycVerified}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                          !isKycVerified
                            ? "opacity-50 cursor-not-allowed bg-[#202020]/50"
                            : selectedCoin?.coinId === coin.coinId
                            ? "bg-[#3AEBA5]/10 border border-[#3AEBA5]"
                            : "hover:bg-[#202020] border border-transparent"
                        }`}
                        whileTap={isKycVerified ? { scale: 0.98 } : {}}
                      >
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={coin.logoUrl}
                            alt={coin.symbol}
                            fill
                            className="rounded-full object-cover"
                          />
                          {!isKycVerified && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Shield className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium truncate">
                              {coin.symbol}
                            </h3>
                            <span className="text-sm text-[#717171] flex-shrink-0">
                              ${Number(coin.price).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-[#717171] truncate">
                              {coin.coinFullName}
                            </p>
                            <span className="text-xs text-[#3AEBA5] flex-shrink-0">
                              {availableBalance.toFixed(6)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-[#717171] flex-shrink-0"
                        />
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Withdrawal Form - Desktop Only */}
            <div className="hidden md:block">
              {selectedCoin && selectedNetwork && canWithdraw() && (
                <div className="bg-[#181818] rounded-2xl p-6">
                  {/* Selected Coin and Network Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <Image
                          src={selectedCoin.logoUrl}
                          alt={selectedCoin.symbol}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedCoin.symbol}</h3>
                        <p className="text-sm text-[#717171]">
                          {selectedNetwork.chainFullName}
                        </p>
                        <p className="text-xs text-[#3AEBA5]">
                          Available:{" "}
                          {getAvailableBalance(selectedCoin.coinId).toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNetworkModalOpen(true)}
                      className="px-4 py-2 text-sm bg-[#202020] rounded-lg hover:bg-[#282828] transition-colors text-[#3AEBA5]"
                    >
                      Change Network
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2 mb-6">
                    <label className="text-sm text-[#717171]">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min ${getMinimumWithdrawal(
                          selectedCoin,
                          selectedNetwork
                        ).toFixed(6)}`}
                        className="w-full h-12 bg-[#202020] rounded-xl px-4 text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5]"
                      />
                      <button
                        onClick={handleMaxClick}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-[#3AEBA5] hover:text-[#3AEBA5]/80 transition-colors"
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
                  <div className="space-y-2 mb-6">
                    <label className="text-sm text-[#717171]">
                      Withdrawal Address
                    </label>
                    <input
                      type="text"
                      value={withdrawalAddress}
                      onChange={(e) => setWithdrawalAddress(e.target.value)}
                      placeholder={`Enter ${selectedCoin.symbol} address`}
                      className="w-full h-12 bg-[#202020] rounded-xl px-4 text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5]"
                    />
                  </div>

                  {/* Memo Input (Optional) */}
                  {selectedNetwork.isSupportMemo && (
                    <div className="space-y-2 mb-6">
                      <label className="text-sm text-[#717171]">
                        Memo (Optional)
                      </label>
                      <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Enter memo"
                        className="w-full h-12 bg-[#202020] rounded-xl px-4 text-white placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#3AEBA5]"
                      />
                    </div>
                  )}

                  {/* Warning Messages */}
                  <div className="bg-[#FF494933] text-[#FF4949] rounded-xl p-4 space-y-2 text-sm mb-6">
                    <p className="flex items-center gap-2">
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#FF4949]"></span>
                      Minimum withdrawal: ${MIN_WITHDRAWAL_USD} (≈
                      {getMinimumWithdrawal(
                        selectedCoin,
                        selectedNetwork
                      ).toFixed(6)}{" "}
                      {selectedCoin.symbol})
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#FF4949]"></span>
                      Only withdraw to {selectedNetwork.chainFullName} addresses
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#FF4949]"></span>
                      Withdrawing to other networks may result in permanent loss
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() =>
                      handleWithdraw({
                        amount,
                        address: withdrawalAddress,
                        memo: memo || undefined,
                      })
                    }
                    disabled={
                      !isValidAmount() || !withdrawalAddress || withdrawing
                    }
                    className={`w-full h-12 rounded-xl font-medium transition-colors ${
                      isValidAmount() && withdrawalAddress && !withdrawing
                        ? "bg-[#3AEBA5] text-black hover:bg-[#3AEBA5]/90"
                        : "bg-[#3AEBA5]/20 text-[#717171] cursor-not-allowed"
                    }`}
                  >
                    {withdrawing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      "Request Withdrawal"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Withdrawal History</h2>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className="p-2 hover:bg-[#202020] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {transactionsLoading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-4">
                  <div className="w-6 h-6 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#717171]">
                    Loading transaction history...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-[#717171] mx-auto mb-4" />
                  <p className="text-[#717171] text-lg">
                    No withdrawal history found
                  </p>
                  <p className="text-[#717171] text-sm mt-2">
                    Your withdrawal transactions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="bg-[#202020] rounded-xl p-4 hover:bg-[#252525] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <h3 className="font-medium">
                              {transaction.currency}
                            </h3>
                            <p className="text-sm text-[#717171]">
                              {formatDate(transaction.createdAt)}
                            </p>
                            <p className="text-xs text-[#717171]">
                              Chain: {transaction.chain}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-400">
                            -{transaction.amount.toLocaleString()}{" "}
                            {transaction.currency}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                          {transaction.fee > 0 && (
                            <p className="text-xs text-[#717171] mt-1">
                              Fee: {transaction.fee} {transaction.currency}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address and Transaction Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#717171] mb-1">
                              Address
                            </p>
                            <p className="text-xs font-mono text-white truncate">
                              {transaction.address}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                transaction.address,
                                `address-${transaction._id}`
                              )
                            }
                            className="ml-2 p-1 hover:bg-[#202020] rounded transition-colors"
                          >
                            <Copy size={14} className="text-[#717171]" />
                          </button>
                          {copiedField === `address-${transaction._id}` && (
                            <span className="text-xs text-[#3AEBA5] ml-2">
                              Copied!
                            </span>
                          )}
                        </div>

                        {transaction.recordId && (
                          <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#717171] mb-1">
                                Record ID
                              </p>
                              <p className="text-xs font-mono text-white truncate">
                                {transaction.recordId}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  transaction.recordId,
                                  `record-${transaction._id}`
                                )
                              }
                              className="ml-2 p-1 hover:bg-[#202020] rounded transition-colors"
                            >
                              <Copy size={14} className="text-[#717171]" />
                            </button>
                            {copiedField === `record-${transaction._id}` && (
                              <span className="text-xs text-[#3AEBA5] ml-2">
                                Copied!
                              </span>
                            )}
                          </div>
                        )}

                        {transaction.txHash && (
                          <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#717171] mb-1">
                                Transaction Hash
                              </p>
                              <p className="text-xs font-mono text-white truncate">
                                {transaction.txHash}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  transaction.txHash!,
                                  `txhash-${transaction._id}`
                                )
                              }
                              className="ml-2 p-1 hover:bg-[#202020] rounded transition-colors"
                            >
                              <Copy size={14} className="text-[#717171]" />
                            </button>
                            {copiedField === `txhash-${transaction._id}` && (
                              <span className="text-xs text-[#3AEBA5] ml-2">
                                Copied!
                              </span>
                            )}
                          </div>
                        )}

                        {transaction.memo && (
                          <div className="bg-[#1A1A1A] rounded-lg p-2">
                            <p className="text-xs text-[#717171] mb-1">Memo</p>
                            <p className="text-xs text-white">
                              {transaction.memo}
                            </p>
                          </div>
                        )}

                        {transaction.status === "declined" &&
                          transaction.declineReason && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                              <p className="text-xs text-red-400 mb-1">
                                Decline Reason
                              </p>
                              <p className="text-xs text-red-300">
                                {transaction.declineReason}
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="text-xs text-[#717171] bg-[#1A1A1A] rounded-lg p-2 font-mono mt-2">
                        ID: {transaction._id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Network Selection Modal */}
      <NetworkSelectionModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        coin={selectedCoin}
        onNetworkSelect={handleNetworkSelect}
      />

      {/* Withdraw Form Bottom Sheet - Mobile Only */}
      {selectedCoin && selectedNetwork && canWithdraw() && (
        <WithdrawFormSheet
          isOpen={isWithdrawSheetOpen}
          onClose={() => setIsWithdrawSheetOpen(false)}
          coin={selectedCoin}
          network={selectedNetwork}
          onNetworkChange={() => setIsNetworkModalOpen(true)}
          onWithdraw={handleWithdraw}
          userBalance={getAvailableBalance(selectedCoin.coinId)}
          minimumWithdrawal={getMinimumWithdrawal(
            selectedCoin,
            selectedNetwork
          )}
          minUsdAmount={MIN_WITHDRAWAL_USD}
        />
      )}
    </div>
  );
};

export default WithdrawPage;
