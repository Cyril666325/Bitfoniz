"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  ChevronRight,
  History,
  X,
  Calendar,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  getCcPaymentCoins,
  getDepositAddress,
  getDepositTransactions,
  getSimpleCurrencies,
} from "@/services/ccpayment/ccpayment";
import type { Coin, Network, SimpleCurrency } from "@/types/ccpayment";
import NetworkSelectionModal from "./components/NetworkSelectionModal";
import DepositAddressSheet from "./components/DepositAddressSheet";

interface DepositTransaction {
  _id: string;
  user: string;
  type: "deposit";
  amount: number;
  coinName: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  reason?: string;
  memo?: string;
  chain?: string;
  currency?: string;
  fee?: number;
}

const DepositPage = () => {
  const router = useRouter();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [simpleCurrencies, setSimpleCurrencies] = useState<SimpleCurrency[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [depositAddress, setDepositAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isDepositAddressSheetOpen, setIsDepositAddressSheetOpen] =
    useState(false);

  // Transaction history states
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactions, setTransactions] = useState<DepositTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        // Try to fetch simple currencies first
        try {
          const simpleCurrenciesData = await getSimpleCurrencies();
          console.log("Simple currencies data:", simpleCurrenciesData);
          setSimpleCurrencies(simpleCurrenciesData);
          
          // Convert simple currencies to Coin format for compatibility
          const convertedCoins: Coin[] = simpleCurrenciesData
            .filter(currency => currency.deposit_enabled)
            .map(currency => {
              // Common coin logos mapping
              const logoMap: { [key: string]: string } = {
                BTC: "https://resource.cwallet.com/token/icon/btc.png",
                ETH: "https://resource.cwallet.com/token/icon/eth.png",
                USDT: "https://resource.cwallet.com/token/icon/usdt.png",
                USDC: "https://resource.cwallet.com/token/icon/usdc.png",
                SOL: "https://resource.cwallet.com/token/icon/sol.png",
                ADA: "https://resource.cwallet.com/token/icon/ada.png",
                DOT: "https://resource.cwallet.com/token/icon/dot.png",
                LINK: "https://resource.cwallet.com/token/icon/link.png",
                BNB: "https://resource.cwallet.com/token/icon/bnb.png",
                XRP: "https://resource.cwallet.com/token/icon/xrp.png",
              };

              // Network configurations for common coins
              const networkConfigs: { [key: string]: { [key: string]: Network } } = {
                USDT: {
                  TRC20: {
                    chain: "TRC20",
                    chainFullName: "Tron (TRC20)",
                    contract: "",
                    precision: 6,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "1",
                    minimumWithdrawAmount: "1",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                  ERC20: {
                    chain: "ERC20",
                    chainFullName: "Ethereum (ERC20)",
                    contract: "",
                    precision: 6,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "10",
                    minimumWithdrawAmount: "10",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                },
                BTC: {
                  BTC: {
                    chain: "BTC",
                    chainFullName: "Bitcoin",
                    contract: "",
                    precision: 8,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "0.0001",
                    minimumWithdrawAmount: "0.001",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                },
                ETH: {
                  ETH: {
                    chain: "ETH",
                    chainFullName: "Ethereum",
                    contract: "",
                    precision: 18,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "0.001",
                    minimumWithdrawAmount: "0.01",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                },
                USDC: {
                  ERC20: {
                    chain: "ERC20",
                    chainFullName: "Ethereum (ERC20)",
                    contract: "",
                    precision: 6,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "10",
                    minimumWithdrawAmount: "10",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                  TRC20: {
                    chain: "TRC20",
                    chainFullName: "Tron (TRC20)",
                    contract: "",
                    precision: 6,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "1",
                    minimumWithdrawAmount: "1",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                },
                SOL: {
                  SOL: {
                    chain: "SOL",
                    chainFullName: "Solana",
                    contract: "",
                    precision: 9,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "0.01",
                    minimumWithdrawAmount: "0.01",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                },
                BNB: {
                  BSC: {
                    chain: "BSC",
                    chainFullName: "Binance Smart Chain",
                    contract: "",
                    precision: 18,
                    canDeposit: true,
                    canWithdraw: true,
                    minimumDepositAmount: "0.001",
                    minimumWithdrawAmount: "0.01",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  },
                },
              };

              return {
                coinId: parseInt(currency.id) || 0,
                symbol: currency.id,
                coinFullName: currency.name,
                logoUrl: logoMap[currency.id] || `https://resource.cwallet.com/token/icon/${currency.id.toLowerCase()}.png`,
                status: "active",
                networks: networkConfigs[currency.id] || {
                  // Default network configuration
                  [currency.id]: {
                    chain: currency.id,
                    chainFullName: currency.name,
                    contract: "",
                    precision: 8,
                    canDeposit: currency.deposit_enabled,
                    canWithdraw: currency.withdraw_enabled,
                    minimumDepositAmount: "0.0001",
                    minimumWithdrawAmount: "0.0001",
                    maximumWithdrawAmount: "999999",
                    isSupportMemo: false,
                  }
                },
                price: "0", // You may want to fetch real prices separately
              };
            });
          
          setCoins(convertedCoins);
          setFilteredCoins(convertedCoins);
          setLoading(false);
          return;
        } catch (simpleError) {
          console.log("Simple currencies failed, falling back to CCPayment:", simpleError);
        }

        // Fallback to CCPayment coins
        const response = await getCcPaymentCoins();
        console.log("Full API Response:", response);

        if (response?.data?.data?.coins) {
          const coinsData = response.data.data.coins;
          console.log("Coins length:", coinsData.length);
          console.log("First coin:", coinsData[0]);

          setCoins(coinsData);
          setFilteredCoins(coinsData);
        } else {
          console.error("Invalid response structure:", response);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coins:", error);
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    console.log("Current coins state:", coins);
    console.log("Current filtered coins state:", filteredCoins);
    console.log("Current search term:", searchTerm);

    const filtered = coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.coinFullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("Filtered results:", filtered);
    setFilteredCoins(filtered);
  }, [searchTerm, coins]);

  const fetchTransactionHistory = async () => {
    try {
      setTransactionsLoading(true);
      const response = await getDepositTransactions();
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

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setSelectedNetwork(null);
    setDepositAddress("");
    setIsNetworkModalOpen(true);
  };

  const handleNetworkSelect = async (network: Network) => {
    setSelectedNetwork(network);
    setAddressLoading(true);

    // Hardcoded addresses for specific coins/networks
    const hardcodedAddresses: { [key: string]: { [key: string]: string } } = {
      USDT: {
        TRC20: "TDbrnCuVG2NdU3S7ihtKhJ3JMcCCb2uvaH",
        ERC20: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      },
      BTC: {
        BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      },
      ETH: {
        ETH: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      },
      USDC: {
        ERC20: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        TRC20: "TDbrnCuVG2NdU3S7ihtKhJ3JMcCCb2uvaH",
      },
      SOL: {
        SOL: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      },
      BNB: {
        BSC: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      },
    };

    try {
      const coinSymbol = selectedCoin?.symbol.toUpperCase();
      const networkChain = network.chain.toUpperCase();
      
      // Check if we have a hardcoded address for this coin and network
      if (coinSymbol && hardcodedAddresses[coinSymbol] && hardcodedAddresses[coinSymbol][networkChain]) {
        console.log("Using hardcoded address for", coinSymbol, "on", networkChain);
        const address = hardcodedAddresses[coinSymbol][networkChain];
        setDepositAddress(address);
        setIsDepositAddressSheetOpen(true);
      } else {
        // For other coins/networks, use API
        console.log("Fetching address from API for", coinSymbol, "on", networkChain);
        const response = await getDepositAddress(network.chain);
        if (response.success) {
          setDepositAddress(response.data.address);
          setIsDepositAddressSheetOpen(true);
        } else {
          console.error("Failed to get deposit address from API");
        }
      }
    } catch (error) {
      console.error("Error handling network selection:", error);
    }
    setAddressLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
            <h1 className="text-xl md:text-2xl font-medium">Deposit Crypto</h1>
          </div>
          <button
            onClick={handleShowTransactionHistory}
            className="flex items-center gap-2 px-4 py-2 bg-[#181818] rounded-xl hover:bg-[#202020] transition-colors text-[#3AEBA5]"
          >
            <History size={18} />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

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
                  filteredCoins.map((coin) => (
                    <motion.button
                      key={coin.coinId}
                      onClick={() => handleCoinSelect(coin)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                        selectedCoin?.coinId === coin.coinId
                          ? "bg-[#3AEBA5]/10 border border-[#3AEBA5]"
                          : "hover:bg-[#202020] border border-transparent"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                          src={coin.logoUrl}
                          alt={coin.symbol}
                          fill
                          className="rounded-full object-cover"
                        />
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
                        <p className="text-sm text-[#717171] truncate">
                          {coin.coinFullName}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-[#717171] flex-shrink-0"
                      />
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Deposit Address Container - Desktop Only */}
            <div className="hidden md:block">
              {selectedCoin && selectedNetwork ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#181818] rounded-2xl p-6"
                >
                  {/* Selected Coin and Network Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0">
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
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNetworkModalOpen(true)}
                      className="px-4 py-2 text-sm bg-[#202020] rounded-lg hover:bg-[#282828] transition-colors text-[#3AEBA5]"
                    >
                      Change Network
                    </button>
                  </div>

                  {addressLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-4">
                      <div className="w-6 h-6 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[#717171]">
                        Generating deposit address...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Network Warning */}
                      <div className="bg-[#3AEBA5]/10 border border-[#3AEBA5] rounded-xl p-4 text-sm">
                        <p className="text-[#3AEBA5] font-medium mb-1">
                          Important
                        </p>
                        <p className="text-[#717171]">
                          Only send {selectedCoin.symbol} on the{" "}
                          {selectedNetwork.chainFullName} network to this
                          address. Sending other assets may result in permanent
                          loss.
                        </p>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center bg-white p-6 rounded-xl">
                        <QRCodeSVG
                          value={depositAddress}
                          size={200}
                          level="H"
                          includeMargin={true}
                          className="w-full max-w-[200px]"
                        />
                      </div>

                      {/* Address Display */}
                      <div className="space-y-3">
                        <div className="text-sm text-[#717171] flex items-center justify-between">
                          <span>Deposit Address</span>
                          <span className="text-xs bg-[#202020] px-2 py-1 rounded-full">
                            Click to copy
                          </span>
                        </div>
                        <div
                          onClick={() => copyToClipboard(depositAddress)}
                          className="flex-1 bg-[#202020] rounded-xl p-6 font-mono text-lg break-all cursor-pointer hover:bg-[#282828] transition-colors"
                        >
                          {depositAddress}
                        </div>
                        {copied && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-[#3AEBA5] text-center"
                          >
                            Address copied to clipboard!
                          </motion.p>
                        )}

                        {/* Address Validity Note */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm">
                          <p className="text-yellow-400 text-xs">
                            <span className="font-medium">Note:</span> This
                            address is valid for this transaction only. To make
                            another deposit, please generate a new address.
                          </p>
                        </div>
                      </div>

                      {/* Minimum Deposit Warning */}
                      <div className="bg-[#202020] rounded-xl p-4 text-sm">
                        <p className="text-[#717171]">
                          Minimum deposit:{" "}
                          <span className="text-white">
                            {selectedNetwork.minimumDepositAmount}{" "}
                            {selectedCoin.symbol}
                          </span>
                        </p>
                        <p className="text-[#717171] mt-1">
                          Deposits below the minimum amount cannot be processed
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : selectedCoin ? (
                <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-center justify-center h-[400px] text-center">
                  <p className="text-[#717171] mb-4">
                    Select a network to continue
                  </p>
                  <button
                    onClick={() => setIsNetworkModalOpen(true)}
                    className="px-6 py-3 bg-[#3AEBA5] text-black rounded-xl font-medium hover:bg-[#33d494] transition-colors"
                  >
                    Choose Network
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex bg-[#181818] rounded-2xl p-6 flex-col items-center justify-center h-[400px] text-center">
                  <p className="text-[#717171]">Select a coin to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Deposit History</h2>
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
                    No deposit history found
                  </p>
                  <p className="text-[#717171] text-sm mt-2">
                    Your deposit transactions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="bg-[#202020] rounded-xl p-4 hover:bg-[#252525] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <h3 className="font-medium">
                              {transaction.coinName || transaction.currency}
                            </h3>
                            <p className="text-sm text-[#717171]">
                              {formatDate(transaction.createdAt)}
                            </p>
                            {transaction.chain && (
                              <p className="text-xs text-[#717171]">
                                {transaction.chain}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#3AEBA5]">
                            +{transaction.amount.toLocaleString()}{" "}
                            {transaction.currency || transaction.coinName}
                          </p>
                          {transaction.fee && transaction.fee > 0 && (
                            <p className="text-xs text-[#717171]">
                              Fee: {transaction.fee}
                            </p>
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Reason Display */}
                      {transaction.reason && (
                        <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-400 font-medium mb-1">
                            Reason
                          </p>
                          <p className="text-sm text-white">
                            {transaction.reason}
                          </p>
                        </div>
                      )}

                      {/* Memo Display */}
                      {transaction.memo && (
                        <div className="mb-2 p-2 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                          <p className="text-xs text-gray-400 font-medium mb-1">
                            Memo
                          </p>
                          <p className="text-sm text-white">
                            {transaction.memo}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-[#717171] bg-[#1A1A1A] rounded-lg p-2 font-mono">
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

      {/* Deposit Address Bottom Sheet - Mobile Only */}
      {selectedCoin && selectedNetwork && !addressLoading && (
        <DepositAddressSheet
          isOpen={isDepositAddressSheetOpen}
          onClose={() => setIsDepositAddressSheetOpen(false)}
          coin={selectedCoin}
          network={selectedNetwork}
          depositAddress={depositAddress}
        />
      )}
    </div>
  );
};

export default DepositPage;
