"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Code,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Shield,
  TrendingUp,
  ArrowUpDown,
  FileCheck,
  Crown,
  MessageSquare,
  Banknote,
  History,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, setToken } = useUser();
  const { unreadCount, markAllOldMessagesAsRead } = useUnreadMessages();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const adminToken = localStorage.getItem("adminToken");

    if (!isAdmin || !adminToken) {
      router.push("/admin-login");
      return;
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    // Clear admin data from localStorage
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminToken");

    // Clear context
    setUser(null);
    setToken(null);

    // Redirect to login
    router.push("/admin-login");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0C0E12]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin-secure-qte-nex-secured_000",
      icon: LayoutDashboard,
      current: pathname === "/admin-secure-qte-nex-secured_000",
    },
    {
      name: "Users",
      href: "/admin-secure-qte-nex-secured_000/users",
      icon: Users,
      current: pathname === "/admin-secure-qte-nex-secured_000/users",
    },
    {
      name: "KYC Verifications",
      href: "/admin-secure-qte-nex-secured_000/kyc",
      icon: FileCheck,
      current: pathname === "/admin-secure-qte-nex-secured_000/kyc",
    },
    {
      name: "VIP Management",
      href: "/admin-secure-qte-nex-secured_000/vip",
      icon: Crown,
      current: pathname === "/admin-secure-qte-nex-secured_000/vip",
    },
    {
      name: "Wallets",
      href: "/admin-secure-qte-nex-secured_000/wallets",
      icon: Wallet,
      current: pathname === "/admin-secure-qte-nex-secured_000/wallets",
    },
    {
      name: "Transfers",
      href: "/admin-secure-qte-nex-secured_000/transfers",
      icon: ArrowUpDown,
      current: pathname === "/admin-secure-qte-nex-secured_000/transfers",
    },
    {
      name: "Deposit/Withdrawal History",
      href: "/admin-secure-qte-nex-secured_000/deposit-withdrawal-history",
      icon: History,
      current:
        pathname ===
        "/admin-secure-qte-nex-secured_000/deposit-withdrawal-history",
    },
    {
      name: "Mass Operations",
      href: "/admin-secure-qte-nex-secured_000/mass-operations",
      icon: Banknote,
      current: pathname === "/admin-secure-qte-nex-secured_000/mass-operations",
    },
    {
      name: "Spot Codes",
      href: "/admin-secure-qte-nex-secured_000/spot-codes",
      icon: Code,
      current: pathname === "/admin-secure-qte-nex-secured_000/spot-codes",
    },
    {
      name: "VIP Trading",
      href: "/admin-secure-qte-nex-secured_000/futures-codes",
      icon: TrendingUp,
      current: pathname === "/admin-secure-qte-nex-secured_000/futures-codes",
    },
    {
      name: "Referrals",
      href: "/admin-secure-qte-nex-secured_000/referrals",
      icon: UserCheck,
      current: pathname === "/admin-secure-qte-nex-secured_000/referrals",
    },
    {
      name: "Activity",
      href: "/admin-secure-qte-nex-secured_000/activity",
      icon: Activity,
      current: pathname === "/admin-secure-qte-nex-secured_000/activity",
    },
    {
      name: "Support Chat",
      href: "/admin-secure-qte-nex-secured_000/support",
      icon: MessageSquare,
      current: pathname === "/admin-secure-qte-nex-secured_000/support",
    },
  ];

  return (
    <div className="flex h-screen bg-[#0C0E12] text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1D24] border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isSupport = item.name === "Support Chat";
              const showBadge = isSupport && unreadCount > 0;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    item.current
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {showBadge && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-[#1A1D24] border-b border-gray-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb or title could go here */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-white">
              {navigation.find((item) => item.current)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <div
                className="flex items-center space-x-2 text-sm bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
                onDoubleClick={async () => {
                  const success = await markAllOldMessagesAsRead();
                  if (success) {
                    toast.success("Old messages marked as read");
                  }
                }}
                title="Double-click to clear old unread messages"
              >
                <MessageSquare className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">
                  {unreadCount} new message{unreadCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400">System Status: </span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0C0E12]">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
