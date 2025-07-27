import axios from "@/lib/axios";

export const getMyWithdrawalRequests = async () => {
  const response = await axios.get("/withdrawal/my-requests");
  return response.data;
};

export const submitWithdrawalRequest = async (
  coinId: string,
  coinName: string,
  amount: number,
  address: string,
  chain: string,
  memo: string
) => {
  const response = await axios.post("/withdrawal/request", {
    coinId,
    coinName,
    amount,
    address,
    chain,
    memo,
    walletType: "main",
  });
  return response.data;
};
