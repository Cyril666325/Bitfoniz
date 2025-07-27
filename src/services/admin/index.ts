import axios from "@/lib/axios";

export const submitSpotOrder = async (
  symbol: string,
  side: string,
  quantity: number,
  price: number,
  type: string,
  notional: number,
  expiration: string,
  displayExpiration: string,
  percentage: number,
  limit_price: number,
  tradingCode?: string
) => {
  const response = await axios.post("/admin/spot-order", {
    symbol,
    side,
    quantity,
    price,
    type,
    notional,
    expiration,
    displayExpiration,
    percentage,
    limit_price,
    ...(tradingCode && { copyCode: tradingCode }),
  });
  return response.data;
};

export const submitFuturesOrder = async (
  symbol: string,
  side: string,
  quantity: number,
  price: number,
  type: string,
  notional: number,
  expiration: string,
  displayExpiration: string,
  limit_price: number,
  leverage: string,
  open_price: number,
  open_type: string,
  size: number,
  trigger_price: number,
  execution_price: string,
  price_way: number,
  price_type: number,
  tradingCode?: string
) => {
  const response = await axios.post("/admin/futures-order", {
    symbol,
    side,
    quantity,
    price,
    type: "limit",
    notional,
    expiration,
    displayExpiration,
    limit_price,
    leverage,
    open_price,
    open_type: "cross",
    size,
    trigger_price,
    execution_price,
    price_way,
    price_type,
    ...(tradingCode && { copyCode: tradingCode }),
  });
  return response.data;
};

export const getOrders = async () => {
  const response = await axios.get("/admin/orders");
  return response.data;
};

export const getFuturesOrders = async () => {
  const response = await axios.get("/admin/futures-orders");
  return response.data;
};

export const getAvailableOrders = async (status: string) => {
  const response = await axios.get(`/admin/available-orders/${status}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get("/admin/users");
  return response.data;
};

export const getWithdrawalRequests = async () => {
  const response = await axios.get("/admin/withdrawal-requests");
  return response.data;
};

export const approveWithdrawalRequest = async (requestId: string) => {
  const response = await axios.post(
    `/admin/withdrawal-requests/${requestId}/approve`
  );
  return response.data;
};

export const rejectWithdrawalRequest = async (
  requestId: string,
  reason: string
) => {
  const response = await axios.post(
    `/admin/withdrawal-requests/${requestId}/decline`,
    {
      reason,
    }
  );
  return response.data;
};

export const orderDetails = async (orderId: string) => {
  const response = await axios.post(`/admin/order-details`, {
    orderId,
  });
  return response.data;
};

export const getTransfers = async () => {
  const response = await axios.get("/admin/transfers");
  return response.data;
};

export const getTransferDetails = async (userId: string) => {
  const response = await axios.get(`/admin/transfer-details/${userId}`);
  return response.data;
};

export const getTransferStats = async () => {
  const response = await axios.get("/admin/transfer-stats");
  return response.data;
};

export const getUserWallets = async () => {
  const response = await axios.get("/admin/users/balance");
  return response.data;
};

export const updateUserBalance = async (
  userId: string,
  newBalance: number,
  destination: string,
  reason: string
) => {
  const response = await axios.patch(`/admin/users/${userId}/balance`, {
    newBalance,
    destination,
    reason,
  });
  return response.data;
};

export const getVipTiers = async () => {
  const response = await axios.get("/admin/vip-tiers");
  return response.data;
};

export const addNewVipTier = async (
  vipName: string,
  vipLevel: number,
  vipStatus: string,
  vipPercentage: number
) => {
  const response = await axios.post("/admin/vip-tiers", {
    vipName,
    vipLevel,
    vipStatus,
    vipPercentage,
  });
  return response.data;
};

export const updateUserVipTier = async (
  userId: string,
  vipTierId: string | null
) => {
  const response = await axios.patch(`/admin/users/${userId}/vip-tier`, {
    vipTierId,
  });
  return response.data;
};

export const updateVipTier = async (
  vipTierId: string,
  vipName: string,
  vipLevel: number,
  vipStatus: string,
  vipPercentage: number
) => {
  const response = await axios.patch(`/admin/vip-tier/${vipTierId}`, {
    vipName,
    vipLevel,
    vipStatus,
    vipPercentage,
  });
  return response.data;
};

export const deleteVipTier = async (vipTierId: string) => {
  const response = await axios.delete(`/admin/vip-tiers/${vipTierId}`);
  return response.data;
};

export const massDeposit = async (
  amount: number,
  coinId: string,
  coinName: string,
  chain: string
) => {
  const response = await axios.post(`/admin/mass-deposit`, {
    amount,
    coinId,
    coinName,
    chain,
  });
  return response.data;
};

export const massWithdrawal = async (
  amount: number,
  coinId: string,
  memo: string
) => {
  const response = await axios.post(`/admin/mass-withdrawal`, {
    amount,
    coinId,
    memo,
  });
  return response.data;
};

export const getTotalBalance = async () => {
  const response = await axios.get("/admin/total-balance");
  return response.data;
};

export const depositHistory = async () => {
  const response = await axios.get("/admin/deposit-history");
  return response.data;
};

export const withdrawalHistory = async () => {
  const response = await axios.get("/admin/withdrawal-history");
  return response.data;
};
