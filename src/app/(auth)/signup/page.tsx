"use client";

import { ChevronLeft, EyeOff, Eye, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getVerificationCode,
  SignUp as SignUpService,
} from "@/services/auth/auth";
import { toast } from "sonner";
import { AxiosError } from "axios";

const SignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeForm, setIsActiveForm] = useState<"email" | "phone-number">(
    "email"
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    referralCode: searchParams.get("ref") || "",
  });

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setFormData((prev) => ({
        ...prev,
        referralCode: ref,
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (activeForm === "email" && !formData.email) {
        toast.error("Please enter your email address");
        return;
      }
      if (activeForm === "phone-number" && !formData.phoneNumber) {
        toast.error("Please enter your phone number");
        return;
      }

      await getVerificationCode(
        activeForm === "phone-number" ? formData.phoneNumber : "",
        activeForm === "email" ? formData.email : ""
      );

      toast.success("Verification code sent successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (activeForm === "email" && !formData.email) {
        toast.error("Please enter your email address");
        return;
      }
      if (activeForm === "phone-number" && !formData.phoneNumber) {
        toast.error("Please enter your phone number");
        return;
      }
      if (!formData.verificationCode) {
        toast.error("Please enter verification code");
        return;
      }
      if (!formData.password) {
        toast.error("Please enter password");
        return;
      }
      if (!formData.confirmPassword) {
        toast.error("Please confirm your password");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      if (!formData.referralCode) {
        toast.error("Please enter a referral code");
        return;
      }

      if (activeForm === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }
      }

      if (activeForm === "phone-number") {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          toast.error("Please enter a valid phone number");
          return;
        }
      }

      await SignUpService(
        activeForm === "email" ? formData.email : "",
        activeForm === "phone-number" ? formData.phoneNumber : "",
        formData.password,
        formData.verificationCode,
        formData.referralCode
      );

      toast.success("Account created successfully!");
      router.push("/signin");
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[493px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4">
        <ChevronLeft
          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
          onClick={() => router.back()}
        />
        <h1 className="font-poppins text-[14px] md:text-[32px] font-medium">
          Create BITFONIZ Account
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6 mt-8 md:mt-[4rem] mb-8 md:mb-[3rem]">
        <button
          onClick={() => setIsActiveForm("email")}
          className={`${
            activeForm === "email"
              ? "text-[#3AEBA5] border-b-[1.2px] border-[#3AEBA5]"
              : "text-[#4B4B4B]"
          } text-[12px] md:text-[14.42px] font-poppins cursor-pointer p-2 md:p-4 transition-colors`}
        >
          Email
        </button>
        <button
          onClick={() => setIsActiveForm("phone-number")}
          className={`${
            activeForm === "phone-number"
              ? "text-[#3AEBA5] border-b-[1.2px] border-[#3AEBA5]"
              : "text-[#4B4B4B]"
          } text-[12px] md:text-[14.42px] font-poppins cursor-pointer p-2 md:p-4 transition-colors`}
        >
          Phone Number
        </button>
      </div>

      {activeForm === "email" ? (
        <form className="flex flex-col gap-4 md:gap-6 w-full mx-auto">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#161616] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
            placeholder="Enter email"
          />

          <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
            <input
              type="number"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleInputChange}
              className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px]"
              placeholder="Enter Verification code"
            />
            <button
              onClick={handleGetCode}
              disabled={loading}
              className={`font-poppins text-[11px] md:text-[12.02px] text-[#3AEBA5] bg-[#3AEBA51A] rounded-full h-[22px] md:h-[25.21px] w-[60px] md:w-[71.83px] cursor-pointer hover:bg-[#3AEBA530] transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Sending..." : "Get code"}
            </button>
          </div>

          <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px]"
              placeholder="Enter Password"
            />
            {showPassword ? (
              <Eye
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <EyeOff
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px]"
              placeholder="Re-enter Password"
            />
            {showConfirmPassword ? (
              <Eye
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <EyeOff
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-poppins text-[12px] md:text-[14.42px] text-[#3AEBA5]">
              Referral Code
            </span>
            <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
              <UsersRound size={20} color="#fff" />
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px] ml-2"
                placeholder="Enter referral code"
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSignUp}
            disabled={loading}
            className="text-[14px] md:text-[19.32px] text-[#1E1E1E] font-medium font-poppins bg-[#F8F8F8] w-full h-[48px] md:h-[57.84px] mt-2 md:mt-3 rounded-full cursor-pointer hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center mt-4 md:mt-6">
            <span className="font-poppins text-[12px] md:text-[18px] font-medium text-[#4B4B4B]">
              Already have an account?{" "}
              <Link
                href={"/signin"}
                className="text-[#3AEBA5] hover:text-[#2ed194] transition-colors"
              >
                Login
              </Link>
            </span>
          </div>

          <p className="font-poppins text-[12px] md:text-[14px] text-center text-[#4B4B4B] mt-2 md:mt-4 pb-8">
            If you&apos;re creating a new account Terms & Conditions and Privacy
            policy will apply
          </p>
        </form>
      ) : (
        <form className="flex flex-col gap-4 md:gap-6 w-full mx-auto">
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#161616] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
            placeholder="Enter Phone Number"
          />

          <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
            <input
              type="number"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleInputChange}
              className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px]"
              placeholder="Enter Verification code"
            />
            <button
              onClick={handleGetCode}
              disabled={loading}
              className={`font-poppins text-[11px] md:text-[12.02px] text-[#3AEBA5] bg-[#3AEBA51A] rounded-full h-[22px] md:h-[25.21px] w-[60px] md:w-[71.83px] cursor-pointer hover:bg-[#3AEBA530] transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Sending..." : "Get code"}
            </button>
          </div>

          <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px]"
              placeholder="Enter Password"
            />
            {showPassword ? (
              <Eye
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <EyeOff
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px]"
              placeholder="Re-enter Password"
            />
            {showConfirmPassword ? (
              <Eye
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <EyeOff
                size={20}
                color="#5A5A5A"
                className="cursor-pointer ml-2"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-poppins text-[12px] md:text-[14.42px] text-[#3AEBA5]">
              Referral Code
            </span>
            <div className="flex items-center h-[48px] md:h-[56px] w-full bg-[#161616] rounded-[9.61px] focus-within:border-[1.2px] focus-within:border-[#3AEBA5] transition-colors px-3">
              <UsersRound size={20} color="#fff" />
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                className="flex-1 h-full w-full bg-transparent outline-none text-[12px] md:text-[15px] ml-2"
                placeholder="Enter referral code"
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSignUp}
            disabled={loading}
            className="text-[14px] md:text-[19.32px] text-[#1E1E1E] font-medium font-poppins bg-[#F8F8F8] w-full h-[48px] md:h-[57.84px] mt-2 md:mt-3 rounded-full cursor-pointer hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center mt-4 md:mt-6">
            <span className="font-poppins text-[12px] md:text-[18px] font-medium text-[#4B4B4B]">
              Already have an account?{" "}
              <Link
                href={"/signin"}
                className="text-[#3AEBA5] hover:text-[#2ed194] transition-colors"
              >
                Login
              </Link>
            </span>
          </div>

          <p className="font-poppins text-[12px] md:text-[14px] text-center text-[#4B4B4B] mt-2 md:mt-4 pb-8">
            If you&apos;re creating a new account Terms & Conditions and Privacy
            policy will apply
          </p>
        </form>
      )}
    </div>
  );
};

// Loading component for Suspense fallback
const SignUpLoading = () => (
  <div className="w-full max-w-[493px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-center gap-4">
      <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 rounded animate-pulse" />
      <div className="h-6 md:h-8 bg-gray-300 rounded animate-pulse w-64" />
    </div>

    <div className="flex items-center gap-4 md:gap-6 mt-8 md:mt-[4rem] mb-8 md:mb-[3rem]">
      <div className="h-8 bg-gray-300 rounded animate-pulse w-16" />
      <div className="h-8 bg-gray-300 rounded animate-pulse w-24" />
    </div>

    <div className="flex flex-col gap-4 md:gap-6 w-full mx-auto">
      <div className="h-[48px] md:h-[56px] bg-gray-300 rounded-[9.61px] animate-pulse" />
      <div className="h-[48px] md:h-[56px] bg-gray-300 rounded-[9.61px] animate-pulse" />
      <div className="h-[48px] md:h-[56px] bg-gray-300 rounded-[9.61px] animate-pulse" />
      <div className="h-[48px] md:h-[56px] bg-gray-300 rounded-[9.61px] animate-pulse" />
      <div className="h-[48px] md:h-[56px] bg-gray-300 rounded-[9.61px] animate-pulse" />
      <div className="h-[48px] md:h-[57.84px] bg-gray-300 rounded-full animate-pulse" />
    </div>
  </div>
);

const SignUpPage = () => {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpForm />
    </Suspense>
  );
};

export default SignUpPage;
