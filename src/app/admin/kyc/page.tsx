"use client";

import { useState, useEffect } from "react";
import { getKycVerifications, kycVerification } from "@/services/kyc";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader,
  Filter,
} from "lucide-react";

interface KYCVerification {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  fullName: string;
  city: string;
  country: string;
  idNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const KYCVerificationsPage = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await getKycVerifications(selectedStatus);
      if (response.success) {
        setVerifications(response.data);
        setPagination(response.pagination);
        setError(null);
      } else {
        throw new Error("Failed to fetch KYC verifications");
      }
    } catch (err) {
      setError("Failed to load KYC verifications");
      console.error("Error fetching verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [selectedStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setProcessingId(id);
      const response = await kycVerification(id, newStatus, "");
      if (response.success) {
        toast.success(`KYC verification ${newStatus} successfully`);
        fetchVerifications(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update KYC status. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredVerifications = verifications.filter(
    (verification) =>
      verification.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verification.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-[#3AEBA5]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-red-500 mb-2">{error}</h3>
          <button
            onClick={fetchVerifications}
            className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">KYC Verifications</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-[300px] h-10 bg-[#1A1A1A] rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#3AEBA5]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 bg-[#1A1A1A] rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#3AEBA5] appearance-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#242424]">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  User
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Full Name
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Location
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  ID Number
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {filteredVerifications.length > 0 ? (
                filteredVerifications.map((verification) => (
                  <motion.tr
                    key={verification._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#242424] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{verification.user.email}</p>
                        <p className="text-sm text-gray-400">
                          ID: {verification.user._id}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">{verification.fullName}</td>
                    <td className="py-4 px-6">
                      {verification.city}, {verification.country}
                    </td>
                    <td className="py-4 px-6">{verification.idNumber}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          verification.status
                        )}`}
                      >
                        {verification.status === "pending" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {verification.status === "approved" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {verification.status === "rejected" && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {verification.status.charAt(0).toUpperCase() +
                          verification.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {formatDate(verification.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      {verification.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleStatusChange(verification._id, "approved")
                            }
                            disabled={processingId === verification._id}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm disabled:opacity-50"
                          >
                            {processingId === verification._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(verification._id, "rejected")
                            }
                            disabled={processingId === verification._id}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                          >
                            {processingId === verification._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No KYC verifications found</p>
                    <p className="text-sm">
                      {searchQuery
                        ? "Try adjusting your search"
                        : `No ${selectedStatus} verifications`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">
            Showing {verifications.length} of {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => {
                  // Add pagination logic here
                }}
                className={`w-8 h-8 rounded ${
                  pagination.page === i + 1
                    ? "bg-[#3AEBA5] text-black"
                    : "bg-[#1A1A1A] text-white hover:bg-[#242424]"
                } transition-colors`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerificationsPage;
