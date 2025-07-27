import axios from "@/lib/axios";

export const transferToTradingWallet = async (
  coinId: string,
  amount: number,
  destination: string,
  coinName: string
) => {
  const response = await axios.post(`/transfer/to-trade`, {
    coinId,
    amount,
    destination,
    coinName,
  });
  return response.data;
};

export const transferFromTradingWallet = async (
  coinId: string,
  amount: number,
  destination: string,
  coinName: string
) => {
  const response = await axios.post(`/transfer/to-exchange`, {
    coinId,
    amount,
    source: destination,
    coinName,
  });
  return response.data;
};

export const getTradingVolume = async () => {
  const response = await axios.get(`/user/trading-volume-status`);
  return response.data;
};

export const transferBetweenTradingAccounts = async (
  coinId: string,
  amount: number,
  fromAccount: string,
  toAccount: string,
  coinName: string
) => {
  const response = await axios.post(`/transfer/between-trade-accounts`, {
    coinId,
    amount,
    fromAccount,
    toAccount,
    coinName,
  });
  return response.data;
};
