"use client";

import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { forgotPassword, resetPassword } from "@/services/auth/auth";
import { toast } from "sonner";

const ForgotPassword = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleForgotPassword = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.email) {
        toast.error("Please enter your email address");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const response = await forgotPassword(formData.email);

      if (response.data.success) {
        setStep("reset");
        toast.success("OTP sent successfully!");
      } else {
        toast.error(response.data.message);
        return;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.otp) {
        toast.error("Please enter the OTP");
        return;
      }

      if (!formData.password) {
        toast.error("Please enter your new password");
        return;
      }

      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const response = await resetPassword(
        formData.email,
        formData.password,
        formData.otp
      );

      if (response.data.success) {
        toast.success("Password reset successfully!");
        router.push("/signin");
      } else {
        toast.error(response.data.message);
        return;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
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
          {step === "email" ? "Forgot Password" : "Reset Password"}
        </h1>
      </div>

      <form className="flex flex-col gap-4 md:gap-6 w-full mx-auto mt-8">
        {step === "email" ? (
          <>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#161616] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
              placeholder="Enter email"
            />

            <button
              type="submit"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-[14px] md:text-[19.32px] text-[#1E1E1E] font-medium font-poppins bg-[#F8F8F8] w-full h-[48px] md:h-[57.84px] mt-2 md:mt-3 rounded-full cursor-pointer hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-[14px] md:text-[16px] text-[#4B4B4B]">
                We&apos;ve sent a verification code to
              </p>
              <p className="text-[14px] md:text-[16px] font-medium">
                {formData.email}
              </p>
            </div>

            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#161616] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
              placeholder="Enter OTP"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#161616] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
                placeholder="New password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#161616] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
              placeholder="Confirm new password"
            />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-[14px] md:text-[19.32px] text-[#1E1E1E] font-medium font-poppins bg-[#e0e0e0] w-1/2 h-[48px] md:h-[57.84px] mt-2 md:mt-3 rounded-full cursor-pointer hover:bg-[#d0d0d0] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleResetPassword}
                disabled={loading}
                className="text-[14px] md:text-[19.32px] text-[#1E1E1E] font-medium font-poppins bg-[#F8F8F8] w-1/2 h-[48px] md:h-[57.84px] mt-2 md:mt-3 rounded-full cursor-pointer hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-4 md:mt-6">
          <span className="font-poppins text-[12px] md:text-[18px] font-medium text-[#4B4B4B]">
            Back to{" "}
            <Link
              href={"/signin"}
              className="text-[#3AEBA5] hover:text-[#2ed194] transition-colors"
            >
              Login
            </Link>
          </span>
        </div>

        <p className="font-poppins text-[12px] md:text-[14px] text-center text-[#4B4B4B] mt-2 md:mt-4 pb-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
