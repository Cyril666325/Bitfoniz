import axios from "@/lib/axios";

// Note: KYC submissions now use direct file uploads via FormData in the component
// instead of this function which used image URLs. This function is kept for reference.
export const submitKyc = async (
  fullName: string,
  city: string,
  country: string,
  idNumber: string,
  idFrontImage: string,
  idBackImage: string,
  selfieImage: string
) => {
  const response = await axios.post(`/user/kyc-verification`, {
    fullName,
    city,
    country,
    idNumber,
    frontImage: idFrontImage,
    backImage: idBackImage,
    idImage: selfieImage,
  });
  return response.data;
};

export const getKycVerifications = async (
  status: string,
  page: number = 1,
  limit: number = 20
) => {
  const response = await axios.get(
    `/admin/kyc-verifications?status=${status}&page=${page}&limit=${limit}`
  );
  return response.data;
};

export const kycVerification = async (
  kycId: string,
  status: string,
  reason: string
) => {
  const response = await axios.put(`/admin/kyc-verification/${kycId}`, {
    status,
    reason,
  });
  return response.data;
};

export const KycStatus = async () => {
  const response = await axios.get(`/user/kyc-status`);
  return response.data;
};
