"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  Users,
  Copy,
  QrCode,
  ChevronDown,
} from "lucide-react";
import { massDeposit, massWithdrawal, getTotalBalance } from "@/services/admin";
import { getCcPaymentCoins } from "@/services/ccpayment/ccpayment";
import type { Coin } from "@/types/ccpayment";

interface TotalBalanceData {
  platformTotal: {
    amount: number;
    currency: string;
  };
  userFunds: {
    mainBalance: number;
    spotBalance: number;
    futuresBalance: number;
    total: number;
    currency: string;
  };
  summary: {
    difference: number;
    isOverdrawn: boolean;
    message: string;
  };
}

interface MassDepositData {
  orderId: string;
  amount: number;
  coinId: string;
  coinName: string;
  chain: string;
  recordId: string;
  depositAddress: string;
  qrCode: string;
}

interface MassWithdrawalData {
  orderId: string;
  totalUserFunds: number;
  withdrawalAmount: number;
  chargeAmount: number;
  chargePercentage: number;
  processedUsers: number;
  recordId: string;
}

const MassOperationsPage = () => {
  const [totalBalance, setTotalBalance] = useState<TotalBalanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);

  // Mass Deposit Form State
  const [depositForm, setDepositForm] = useState({
    amount: "",
    coinId: "",
    coinName: "",
    chain: "",
  });
  const [depositResult, setDepositResult] = useState<MassDepositData | null>(
    null
  );

  // Mass Withdrawal Form State
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    coinId: "",
    memo: "",
  });
  const [withdrawalResult, setWithdrawalResult] =
    useState<MassWithdrawalData | null>(null);

  useEffect(() => {
    fetchTotalBalance();
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setCoinsLoading(true);
      const response = await getCcPaymentCoins();
      if (response.success && response.data?.data?.coins) {
        setCoins(response.data.data.coins);
      } else {
        toast.error("Failed to fetch coin data");
      }
    } catch (error) {
      console.error("Error fetching coins:", error);
      toast.error("Failed to fetch coin data");
    } finally {
      setCoinsLoading(false);
    }
  };

  const fetchTotalBalance = async () => {
    try {
      setLoading(true);
      const response = await getTotalBalance();
      setTotalBalance(response.data);
    } catch (error) {
      console.error("Error fetching total balance:", error);
      toast.error("Failed to fetch total balance");
    } finally {
      setLoading(false);
    }
  };

  const handleMassDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !depositForm.amount ||
      !depositForm.coinId ||
      !depositForm.coinName ||
      !depositForm.chain
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setOperationLoading(true);
      const result = await massDeposit(
        parseFloat(depositForm.amount),
        depositForm.coinId,
        depositForm.coinName,
        depositForm.chain
      );
      setDepositResult(result.data);
      toast.success(result.message || "Mass deposit initiated successfully");
      // Reset form
      setDepositForm({ amount: "", coinId: "", coinName: "", chain: "" });
      // Refresh balance
      fetchTotalBalance();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to initiate mass deposit"
      );
    } finally {
      setOperationLoading(false);
    }
  };

  const handleMassWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !withdrawalForm.amount ||
      !withdrawalForm.coinId ||
      !withdrawalForm.memo
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setOperationLoading(true);
      const result = await massWithdrawal(
        parseFloat(withdrawalForm.amount),
        withdrawalForm.coinId,
        withdrawalForm.memo
      );
      setWithdrawalResult(result.data);
      toast.success(result.message || "Mass withdrawal processed successfully");
      // Reset form
      setWithdrawalForm({ amount: "", coinId: "", memo: "" });
      // Refresh balance
      fetchTotalBalance();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to process mass withdrawal"
      );
    } finally {
      setOperationLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleCoinSelect = (
    coinId: string,
    coinName: string,
    formType: "deposit" | "withdrawal"
  ) => {
    if (formType === "deposit") {
      setDepositForm((prev) => ({
        ...prev,
        coinId,
        coinName,
        chain: "", // Reset chain when coin changes
      }));
    } else {
      setWithdrawalForm((prev) => ({ ...prev, coinId }));
    }
  };

  const handleChainSelect = (chain: string) => {
    setDepositForm((prev) => ({ ...prev, chain }));
  };

  const getSelectedCoin = (coinId: string) => {
    return coins.find((coin) => coin.coinId.toString() === coinId);
  };

  const getAvailableChains = (coinId: string) => {
    const coin = getSelectedCoin(coinId);
    return coin ? Object.keys(coin.networks) : [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mass Operations</h1>
          <p className="text-[#717171]">Manage mass deposits and withdrawals</p>
        </div>

        {/* Total Balance Overview */}
        {totalBalance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#181818] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#3AEBA5]/10 rounded-xl">
                  <Wallet className="h-5 w-5 text-[#3AEBA5]" />
                </div>
                <div>
                  <p className="text-sm text-[#717171]">Platform Balance</p>
                  <p className="text-2xl font-bold">
                    {totalBalance.platformTotal.amount.toFixed(2)}{" "}
                    {totalBalance.platformTotal.currency}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#181818] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 flex items-center justify-center bg-blue-500/10 rounded-xl">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-[#717171]">Total User Funds</p>
                  <p className="text-2xl font-bold">
                    {totalBalance.userFunds.total.toFixed(2)}{" "}
                    {totalBalance.userFunds.currency}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#717171] space-y-1">
                <div className="flex justify-between">
                  <span>Main:</span>
                  <span>{totalBalance.userFunds.mainBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spot:</span>
                  <span>{totalBalance.userFunds.spotBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Futures:</span>
                  <span>
                    {totalBalance.userFunds.futuresBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#181818] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-xl ${
                    totalBalance.summary.isOverdrawn
                      ? "bg-red-500/10"
                      : "bg-green-500/10"
                  }`}
                >
                  {totalBalance.summary.isOverdrawn ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#717171]">Difference</p>
                  <p
                    className={`text-2xl font-bold ${
                      totalBalance.summary.isOverdrawn
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {totalBalance.summary.isOverdrawn ? "-" : "+"}
                    {Math.abs(totalBalance.summary.difference).toFixed(2)} USDT
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#717171]">
                {totalBalance.summary.message}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mass Deposit Section */}
          <div className="bg-[#181818] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center bg-[#3AEBA5]/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-[#3AEBA5]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mass Deposit</h2>
                <p className="text-sm text-[#717171]">
                  Add funds to all user accounts
                </p>
              </div>
            </div>

            <form onSubmit={handleMassDeposit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={depositForm.amount}
                    onChange={(e) =>
                      setDepositForm({ ...depositForm, amount: e.target.value })
                    }
                    className="w-full p-3 bg-[#202020] border border-[#333] rounded-xl focus:outline-none focus:border-[#3AEBA5] transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Coin
                  </label>
                  <div className="relative">
                    <select
                      value={depositForm.coinId}
                      onChange={(e) => {
                        const selectedCoin = coins.find(
                          (coin) => coin.coinId.toString() === e.target.value
                        );
                        handleCoinSelect(
                          e.target.value,
                          selectedCoin?.coinFullName || "",
                          "deposit"
                        );
                      }}
                      className="w-full p-3 bg-[#202020] border border-[#333] rounded-xl focus:outline-none focus:border-[#3AEBA5] transition-colors appearance-none cursor-pointer"
                      required
                      disabled={coinsLoading}
                    >
                      <option value="">
                        {coinsLoading ? "Loading coins..." : "Select a coin"}
                      </option>
                      {coins.map((coin) => (
                        <option key={coin.coinId} value={coin.coinId}>
                          {coin.symbol} - {coin.coinFullName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#717171] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Chain
                </label>
                <div className="relative">
                  <select
                    value={depositForm.chain}
                    onChange={(e) => handleChainSelect(e.target.value)}
                    className="w-full p-3 bg-[#202020] border border-[#333] rounded-xl focus:outline-none focus:border-[#3AEBA5] transition-colors appearance-none cursor-pointer"
                    required
                    disabled={!depositForm.coinId}
                  >
                    <option value="">
                      {!depositForm.coinId
                        ? "Select a coin first"
                        : "Select a chain"}
                    </option>
                    {getAvailableChains(depositForm.coinId).map((chain) => {
                      const selectedCoin = getSelectedCoin(depositForm.coinId);
                      const network = selectedCoin?.networks[chain];
                      return (
                        <option key={chain} value={chain}>
                          {network?.chainFullName || chain}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#717171] pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={operationLoading || coinsLoading}
                className="w-full bg-[#3AEBA5] text-black font-medium py-3 rounded-xl hover:bg-[#3AEBA5]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? "Processing..." : "Execute Mass Deposit"}
              </button>
            </form>

            {/* Deposit Result */}
            {depositResult && (
              <div className="mt-6 p-4 bg-[#202020] rounded-xl">
                <h3 className="font-medium mb-3 text-[#3AEBA5]">
                  Deposit Result
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Order ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{depositResult.orderId}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(depositResult.orderId, "Order ID")
                        }
                        className="p-1 hover:bg-[#282828] rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Record ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {depositResult.recordId}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(depositResult.recordId, "Record ID")
                        }
                        className="p-1 hover:bg-[#282828] rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Deposit Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {depositResult.depositAddress}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            depositResult.depositAddress,
                            "Deposit Address"
                          )
                        }
                        className="p-1 hover:bg-[#282828] rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {depositResult.qrCode && (
                    <div className="flex justify-between">
                      <span className="text-[#717171]">QR Code:</span>
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        <span className="text-xs">Available</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mass Withdrawal Section */}
          <div className="bg-[#181818] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center bg-red-500/10 rounded-xl">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mass Withdrawal</h2>
                <p className="text-sm text-[#717171]">
                  Process withdrawals from user accounts
                </p>
              </div>
            </div>

            <form onSubmit={handleMassWithdrawal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={withdrawalForm.amount}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        amount: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-[#202020] border border-[#333] rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Coin
                  </label>
                  <div className="relative">
                    <select
                      value={withdrawalForm.coinId}
                      onChange={(e) => {
                        const selectedCoin = coins.find(
                          (coin) => coin.coinId.toString() === e.target.value
                        );
                        handleCoinSelect(
                          e.target.value,
                          selectedCoin?.coinFullName || "",
                          "withdrawal"
                        );
                      }}
                      className="w-full p-3 bg-[#202020] border border-[#333] rounded-xl focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
                      required
                      disabled={coinsLoading}
                    >
                      <option value="">
                        {coinsLoading ? "Loading coins..." : "Select a coin"}
                      </option>
                      {coins.map((coin) => (
                        <option key={coin.coinId} value={coin.coinId}>
                          {coin.symbol} - {coin.coinFullName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#717171] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Memo</label>
                <textarea
                  value={withdrawalForm.memo}
                  onChange={(e) =>
                    setWithdrawalForm({
                      ...withdrawalForm,
                      memo: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-[#202020] border border-[#333] rounded-xl focus:outline-none focus:border-red-500 transition-colors resize-none"
                  placeholder="Withdrawal reason or memo..."
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={operationLoading || coinsLoading}
                className="w-full bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? "Processing..." : "Execute Mass Withdrawal"}
              </button>
            </form>

            {/* Withdrawal Result */}
            {withdrawalResult && (
              <div className="mt-6 p-4 bg-[#202020] rounded-xl">
                <h3 className="font-medium mb-3 text-red-500">
                  Withdrawal Result
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Order ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {withdrawalResult.orderId}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(withdrawalResult.orderId, "Order ID")
                        }
                        className="p-1 hover:bg-[#282828] rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Record ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {withdrawalResult.recordId}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            withdrawalResult.recordId,
                            "Record ID"
                          )
                        }
                        className="p-1 hover:bg-[#282828] rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Total User Funds:</span>
                    <span>{withdrawalResult.totalUserFunds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Withdrawal Amount:</span>
                    <span>{withdrawalResult.withdrawalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Charge Amount:</span>
                    <span>{withdrawalResult.chargeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Charge Percentage:</span>
                    <span>{withdrawalResult.chargePercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171]">Processed Users:</span>
                    <span className="font-medium text-[#3AEBA5]">
                      {withdrawalResult.processedUsers}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Balance Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchTotalBalance}
            disabled={loading}
            className="px-6 py-3 bg-[#282828] hover:bg-[#333] text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Balance"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MassOperationsPage;
