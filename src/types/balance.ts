export interface BalanceResponse {
  msg: string;
  balance: Balance[];
}

export interface Balance {
  _id: string;
  user: string;
  coinId: number;
  coinName: string;
  balance: number;
  lockedBalance: number;
  updatedAt: string;
}
