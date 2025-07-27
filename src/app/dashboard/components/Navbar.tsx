"use client";

import { useUser } from "@/context/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Crown,
  Headset,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  {
    title: "Market",
    href: "/dashboard/market",
    icon: "/assets/dashboard/bottombar/market.svg",
    activeIcon: "/assets/dashboard/bottombar/market-active.svg",
  },
  {
    title: "Trade",
    href: null, // No direct href, will show dropdown instead
    icon: "/assets/dashboard/bottombar/trade.svg",
    activeIcon: "/assets/dashboard/bottombar/trade-active.svg",
  },
  {
    title: "Home",
    href: "/dashboard",
    icon: "/assets/dashboard/bottombar/home.svg",
    activeIcon: "/assets/dashboard/bottombar/home-active.svg",
  },
  {
    title: "Assets",
    href: "/dashboard/assets",
    icon: "/assets/dashboard/bottombar/assets.svg",
    activeIcon: "/assets/dashboard/bottombar/assets-active.svg",
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: "/assets/dashboard/bottombar/referrals.svg",
    activeIcon: "/assets/dashboard/bottombar/referrals-active.svg",
  },
];

const tradeOptions = [
  {
    title: "VIP Trade",
    href: "/dashboard/futures",
    description: "Advanced trading features",
  },
  {
    title: "Spot Trade",
    href: "/dashboard/spot",
    description: "Basic trading",
  },
];

const desktopNavLinks = [
  {
    title: "Market",
    href: "/dashboard/market",
  },
  {
    title: "VIP Trading",
    href: "/dashboard/futures",
  },
  {
    title: "Spot",
    href: "/dashboard/spot",
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
  },
  {
    title: "Assets",
    href: "/dashboard/assets",
  },
];

const profileMenuItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    title: "Logout",
    icon: LogOut,
    href: "/signin",
  },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, refreshUser } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradeDropdownOpen, setIsTradeDropdownOpen] = useState(false);

  // Debug log to see what user data we have
  console.log("Navbar user data:", user);
  console.log("User vipTier:", user?.vipTier);
  console.log("VipTier exists:", !!user?.vipTier);

  // Refresh user data when component mounts if VIP tier is missing
  useEffect(() => {
    if (user && !user.vipTier) {
      console.log("VIP tier missing, refreshing user data...");
      refreshUser();
    }
  }, [user, refreshUser]);

  const displayIdentifier =
    user?.email || user?.phonenumber || "No contact info";

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  const handleTradeClick = () => {
    setIsTradeDropdownOpen(!isTradeDropdownOpen);
  };

  const handleTradeOptionClick = (href: string) => {
    setIsTradeDropdownOpen(false);
    router.push(href);
  };

  // Check if current path is a trade route for active state
  const isTradeActive =
    pathname === "/dashboard/spot" || pathname === "/dashboard/futures";

  // Close trade dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isTradeDropdownOpen) {
        setIsTradeDropdownOpen(false);
      }
    };

    if (isTradeDropdownOpen) {
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isTradeDropdownOpen]);

  return (
    <>
      {/* Desktop Navbar */}
      <header className="fixed top-0 left-0 right-0 padding-x pt-6 md:pt-4 h-auto z-50 bg-[#0A0A0A]/80 backdrop-blur-sm lg:block hidden">
        <div className="flex items-center justify-between bg-transparent p-4 rounded-[22px]">
          <div className="flex items-center gap-[9rem]">
            <Link href={"/dashboard"}>
              <Image
                src={"/assets/logo.svg"}
                alt="logo"
                height={50}
                width={120.93}
              />
            </Link>
            <nav className="flex items-center gap-20">
              {desktopNavLinks.map((item, index) => (
                <div key={index}>
                  <Link
                    href={item.href}
                    className={`font-primary font-medium text-[16px] transition-colors ${
                      pathname === item.href
                        ? "text-[#3AEBA5]"
                        : "text-white hover:text-[#3AEBA5]"
                    }`}
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
              onClick={() => router.push("/dashboard/support")}
            >
              <Headset color="#B6B6B6" size={25} />
            </button>
            <div className="relative">
              <button
                className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors overflow-hidden"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Image
                  src="/assets/logo-sm.svg"
                  alt="avatar"
                  height={50}
                  width={120.93}
                  className="object-contain"
                />
              </button>

              {/* Desktop Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-[340px] bg-[#181818] rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/assets/logo-sm.svg"
                          alt="avatar"
                          height={50}
                          width={120.93}
                          className="rounded-full"
                        />
                        <div>
                          <p className="text-sm text-gray-400">
                            {displayIdentifier}
                          </p>
                          {user && user._id ? (
                            <p className="text-xs text-gray-500">
                              ID: {user._id}
                            </p>
                          ) : (
                            <p className="text-xs text-red-400">No ID found</p>
                          )}
                          {user?.vipTier ? (
                            <div className="flex items-center gap-1 mt-1">
                              <Crown className="w-3 h-3 text-yellow-400" />
                              <p className="text-xs text-yellow-400 font-medium">
                                {user.vipTier.vipName} (Level{" "}
                                {user.vipTier.vipLevel})
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 mt-1">
                              <Crown className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-500">
                                Regular User
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      {profileMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        if (item.title === "Logout") {
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setIsProfileOpen(false);
                                handleLogout();
                              }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors w-full text-left"
                            >
                              <Icon size={18} className="text-gray-400" />
                              <span className="text-white">{item.title}</span>
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Icon size={18} className="text-gray-400" />
                            <span className="text-white">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50">
        {/* Trade Dropdown */}
        <AnimatePresence>
          {isTradeDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-[#181818] rounded-xl shadow-lg overflow-hidden border border-[#2A2A2A] w-[280px]"
            >
              <div className="p-2">
                {tradeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleTradeOptionClick(option.href)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#2A2A2A] rounded-lg transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{option.title}</p>
                      <p className="text-xs text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="bg-[#181818] w-[350px] h-[66px] backdrop-blur-md border-t border-[#1F1F1F] flex items-center justify-center rounded-full mx-auto">
          <div className="flex items-center justify-around px-4 py-2 w-full">
            {navLinks.map((item, index) => {
              const isActive =
                item.title === "Trade" ? isTradeActive : pathname === item.href;
              return (
                <motion.button
                  key={index}
                  onClick={() => {
                    if (item.title === "Trade") {
                      handleTradeClick();
                    } else if (item.href) {
                      setIsTradeDropdownOpen(false);
                      router.push(item.href);
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      y: isActive ? -8 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`${
                      isActive
                        ? "bg-[#323232] rounded-full w-[54px] h-[54px] flex items-center justify-center"
                        : "bg-transparent"
                    }`}
                  >
                    <Image
                      src={isActive ? item.activeIcon : item.icon}
                      alt={item.title}
                      width={24}
                      height={24}
                    />
                  </motion.div>
                  <motion.span
                    className="text-[8px] font-medium text-[#B6B6B6]"
                    animate={{
                      opacity: isActive ? 0 : 1,
                      height: isActive ? 0 : "auto",
                      marginTop: isActive ? 0 : 4,
                    }}
                  >
                    {item.title}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>

      <header className="lg:hidden padding-x z-50">
        <div className="flex items-center justify-between p-4">
          <Image
            src="/assets/logo.svg"
            alt="avatar"
            width={100}
            height={100}
            className="object-contain"
          />
          <div className="flex items-center gap-4">
            <button
              className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
              onClick={() => router.push("/dashboard/support")}
            >
              <Headset color="#B6B6B6" size={25} />
            </button>
            {/* <button
              className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
              onClick={handleClick}
            >
              <Bell color="#B6B6B6" size={22} />
            </button> */}
            <button
              className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Image
                src="/assets/logo-sm.svg"
                alt="avatar"
                width={25}
                height={25}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#141414] z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="p-4 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/logo-sm.svg"
                    alt="avatar"
                    width={50}
                    height={50}
                  />
                  <div>
                    <p className="text-sm text-gray-400">{displayIdentifier}</p>
                    {user && user._id ? (
                      <p className="text-xs text-gray-500">ID: {user._id}</p>
                    ) : (
                      <p className="text-xs text-red-400">No ID found</p>
                    )}
                    {user?.vipTier ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <p className="text-xs text-yellow-400 font-medium">
                          {user.vipTier.vipName} (Level {user.vipTier.vipLevel})
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-500">Regular User</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-4">
                {profileMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  if (item.title === "Logout") {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#2A2A2A] transition-colors w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} className="text-gray-400" />
                          <span className="text-white">{item.title}</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#2A2A2A] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-gray-400" />
                        <span className="text-white">{item.title}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
