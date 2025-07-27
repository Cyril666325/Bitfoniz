import axios from "@/lib/axios";
import type {
  CCPaymentCoinsResponse,
  Asset,
  AssetsResponse,
  SimpleCurrenciesResponse,
  SimpleCurrency,
} from "@/types/ccpayment";

export const getCcPaymentCoins = async () => {
  try {
    const response = await axios.get<CCPaymentCoinsResponse>(
      "/ccpayment/coins"
    );
    console.log("Raw API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error in getCcPaymentCoins:", error);
    throw error;
  }
};

export const getAssets = async (): Promise<Asset[]> => {
  try {
    const response = await axios.get<AssetsResponse>("/ccpayment/assets");
    if (!response.data.success) {
      throw new Error("Failed to fetch assets");
    }
    return response.data.data.data.assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

export const getAsset = async (assetId: string) => {
  const response = await axios.post(`/ccpayment/assets/${assetId}`);
  return response.data;
};

export const withdraw = async (
  coinId: string,
  amount: number,
  address: string,
  chain: string,
  memo: string
) => {
  const response = await axios.post(`/ccpayment/withdraw`, {
    coinId,
    amount,
    address,
    chain,
    memo,
  });
  return response.data;
};

export const withdrawToTradingWallet = async (
  coinId: string,
  amount: number,
  destination: string,
  chain: string,
  memo: string
) => {
  const response = await axios.post(`/ccpayment/withdraw-to-trading-wallet`, {
    coinId,
    amount,
    destination,
    chain,
    memo,
  });
  return response.data;
};

export const getDepositAddress = async (chain: string) => {
  const response = await axios.post(`/ccpayment/deposit-address`, {
    chain,
  });
  return response.data;
};

export const getUserBalances = async () => {
  const response = await axios.get(`/user/balances`);
  return response.data;
};

export const getTransactionHistory = async () => {
  const response = await axios.get(`/user/transactions`);
  return response.data;
};


export const getDepositTransactions = async () => {
  const response = await axios.get(`/user/transactions/deposits`);
  return response.data;
};

export const getWithdrawalTransactions = async () => {
  const response = await axios.get(`/user/transactions/withdrawals`);
  return response.data;
};

export const getSimpleCurrencies = async (): Promise<SimpleCurrency[]> => {
  try {
    const response = await axios.get<SimpleCurrenciesResponse>("/currencies");
    if (!response.data.success) {
      throw new Error("Failed to fetch currencies");
    }
    return response.data.data.currencies;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error;
  }
};