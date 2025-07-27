export interface User {
  _id: string;
  email: string;
  phonenumber?: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  kycVerification: boolean;
  isAdmin: boolean;
  firstDeposit: boolean;
  refCode: string;
  referBy: string;
  referralCount: number;
  referrals: Referral[];
  createdAt: string;
  updatedAt: string;
  country?: string;
  vipLastUpdated?: string | null;
  vipTier?: VipTier;
  __v: number;
}

export interface VipTier {
  _id: string;
  vipName: string;
  vipLevel: number;
}

export interface Referral {
  _id: string;
  email: string;
  createdAt?: string;
  firstDeposit?: boolean;
}
