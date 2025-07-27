"use client";

import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { login } from "@/services/auth/auth";
import { useUser } from "@/context/UserContext";
import { AxiosError } from "axios";
import Link from "next/link";

const AdminLogin = () => {
  const router = useRouter();
  const { setUser, setToken } = useUser();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.email) {
        toast.error("Please enter your email address");
        return;
      }

      if (!formData.password) {
        toast.error("Please enter your password");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const response = await login(formData.email, "", formData.password);

      if (response.data.success) {
        if (!response.data.user.isAdmin) {
          toast.error("Unauthorized access. Admin privileges required.");
          return;
        }

        // Store admin status and token in localStorage
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminToken", response.data.token);

        setUser(response.data.user);
        setToken(response.data.token);
        router.push("/admin-secure-qte-nex-secured_000");
        toast.success("Welcome back, admin!");
      } else {
        toast.error(response.data.message);
        return;
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to login");
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
          Admin Login
        </h1>
      </div>

      <form className="flex flex-col gap-4 md:gap-6 w-full mx-auto mt-8">
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
        <Link
          href={"/forgot-password"}
          className="text-[#3AEBA5] underline text-right"
        >
          Forgot Password
        </Link>

        <button
          type="submit"
          onClick={handleLogin}
          disabled={loading}
          className="text-[14px] md:text-[19.32px] text-[#1E1E1E] font-medium font-poppins bg-[#F8F8F8] w-full h-[48px] md:h-[57.84px] mt-2 md:mt-3 rounded-full cursor-pointer hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="font-poppins text-[12px] md:text-[14px] text-center text-[#4B4B4B] mt-2 md:mt-4 pb-8">
          This portal is restricted to authorized administrators only
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
