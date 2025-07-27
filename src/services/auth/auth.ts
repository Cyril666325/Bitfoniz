import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getVerificationCode = async (
  phonenumber: string,
  email: string
) => {
  const response = await axios.post(`${API_URL}/auth/get-verification-code`, {
    phonenumber,
    email,
  });
  return response.data;
};

export const SignUp = async (
  email: string,
  phonenumber: string,
  password: string,
  verificationCode: string,
  referBy: string
) => {
  const payload: Record<string, string> = {
    email,
    password,
    verificationCode,
    referBy,
  };

  if (phonenumber) {
    payload.phonenumber = phonenumber;
  }

  const response = await axios.post(`${API_URL}/auth/signup`, payload);
  return response.data;
};

export const login = async (
  email: string,
  phonenumber: string,
  password: string
) => {
  const payload: Record<string, string> = {
    email,
    password,
  };

  if (phonenumber) {
    payload.phonenumber = phonenumber;
  }

  const response = await axios.post(`${API_URL}/auth/login`, payload);
  return response;
};

export const forgotPassword = async (email: string) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, {
    email,
  });
  return response;
};

export const resetPassword = async (email: string, password: string, otp: string) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, {
    email,
    newPassword: password,
    otp,
  });
  return response;
};