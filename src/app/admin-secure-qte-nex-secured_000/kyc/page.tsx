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
  Eye,
  Download,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
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
  frontImageUrl: string;
  backImageUrl: string;
  idImageUrl: string;
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
  const [selectedVerification, setSelectedVerification] =
    useState<KYCVerification | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [kycToReject, setKycToReject] = useState<string | null>(null);

  const fetchVerifications = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getKycVerifications(
        selectedStatus,
        page,
        pagination.limit
      );
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
    fetchVerifications(1); // Reset to page 1 when status changes
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset pagination state
  }, [selectedStatus]);

  const handleStatusChange = async (
    id: string,
    newStatus: string,
    reason: string = ""
  ) => {
    try {
      setProcessingId(id);
      const currentVerification = verifications.find((v) => v._id === id);
      const currentStatus = currentVerification?.status;

      const response = await kycVerification(id, newStatus, reason);
      if (response.success) {
        // Provide contextual success messages
        if (currentStatus === "pending") {
          toast.success(`KYC verification ${newStatus} successfully`);
        } else {
          toast.success(
            `KYC status changed from ${currentStatus} to ${newStatus}`
          );
        }
        fetchVerifications(pagination.page); // Refresh the current page
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

  const handleViewDetails = (verification: KYCVerification) => {
    setSelectedVerification(verification);
  };

  const handleViewImage = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const handleRejectClick = (kycId: string) => {
    setKycToReject(kycId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!kycToReject || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    await handleStatusChange(kycToReject, "rejected", rejectionReason.trim());
    setShowRejectModal(false);
    setRejectionReason("");
    setKycToReject(null);
    setSelectedVerification(null); // Close details modal if open
  };

  const handlePageChange = async (newPage: number) => {
    if (
      newPage !== pagination.page &&
      newPage >= 1 &&
      newPage <= pagination.pages
    ) {
      await fetchVerifications(newPage);
      setPagination((prev) => ({ ...prev, page: newPage }));
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
            onClick={() => fetchVerifications(pagination.page)}
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
        <div>
          <h1 className="text-2xl font-semibold">KYC Verifications</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage KYC verifications - Status can be changed at any time
          </p>
        </div>

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
              title="Filter KYCs by status (all can be modified)"
            >
              <option value="pending">View Pending</option>
              <option value="approved">View Approved</option>
              <option value="rejected">View Rejected</option>
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
                      <div className="flex flex-col">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            verification.status
                          )}`}
                          title={
                            verification.status !== "pending"
                              ? `Last updated: ${formatDate(
                                  verification.updatedAt
                                )}`
                              : ""
                          }
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
                        {verification.status !== "pending" && (
                          <span className="text-xs text-gray-500 mt-1">
                            Modifiable
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {formatDate(verification.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(verification)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>

                        {/* Show different buttons based on current status */}
                        {verification.status !== "approved" && (
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
                        )}

                        {verification.status !== "rejected" && (
                          <button
                            onClick={() => handleRejectClick(verification._id)}
                            disabled={processingId === verification._id}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                          >
                            {processingId === verification._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </button>
                        )}

                        {verification.status !== "pending" && (
                          <button
                            onClick={() =>
                              handleStatusChange(verification._id, "pending")
                            }
                            disabled={processingId === verification._id}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors text-sm disabled:opacity-50"
                          >
                            {processingId === verification._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Reset"
                            )}
                          </button>
                        )}
                      </div>
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
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm bg-[#1A1A1A] text-white hover:bg-[#242424] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded transition-colors ${
                    pagination.page === pageNum
                      ? "bg-[#3AEBA5] text-black"
                      : "bg-[#1A1A1A] text-white hover:bg-[#242424]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Show dots if there are more pages */}
            {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
              <>
                <span className="text-gray-400">...</span>
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  className="w-8 h-8 rounded bg-[#1A1A1A] text-white hover:bg-[#242424] transition-colors"
                >
                  {pagination.pages}
                </button>
              </>
            )}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 text-sm bg-[#1A1A1A] text-white hover:bg-[#242424] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KYC Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#242424] flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                KYC Verification Details
              </h2>
              <button
                onClick={() => setSelectedVerification(null)}
                className="p-2 hover:bg-[#242424] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="font-medium">
                      {selectedVerification.user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="font-medium">
                      {selectedVerification.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">ID Number</label>
                    <p className="font-medium">
                      {selectedVerification.idNumber}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Location</label>
                    <p className="font-medium">
                      {selectedVerification.city},{" "}
                      {selectedVerification.country}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedVerification.status
                      )}`}
                    >
                      {selectedVerification.status === "pending" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {selectedVerification.status === "approved" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedVerification.status === "rejected" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedVerification.status.charAt(0).toUpperCase() +
                        selectedVerification.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Submitted</label>
                    <p className="font-medium">
                      {formatDate(selectedVerification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Document Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Front Image */}
                  <div className="bg-[#242424] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">ID Front</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleViewImage(
                              selectedVerification.frontImageUrl,
                              "ID Front"
                            )
                          }
                          className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                          title="View Image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadImage(
                              selectedVerification.frontImageUrl,
                              `${selectedVerification.fullName}_ID_Front.jpg`
                            )
                          }
                          className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="aspect-video bg-[#3A3A3A] rounded-lg overflow-hidden">
                      <img
                        src={selectedVerification.frontImageUrl}
                        alt="ID Front"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleViewImage(
                            selectedVerification.frontImageUrl,
                            "ID Front"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Back Image */}
                  <div className="bg-[#242424] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">ID Back</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleViewImage(
                              selectedVerification.backImageUrl,
                              "ID Back"
                            )
                          }
                          className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                          title="View Image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadImage(
                              selectedVerification.backImageUrl,
                              `${selectedVerification.fullName}_ID_Back.jpg`
                            )
                          }
                          className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="aspect-video bg-[#3A3A3A] rounded-lg overflow-hidden">
                      <img
                        src={selectedVerification.backImageUrl}
                        alt="ID Back"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleViewImage(
                            selectedVerification.backImageUrl,
                            "ID Back"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Selfie Image */}
                  <div className="bg-[#242424] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Selfie with ID</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleViewImage(
                              selectedVerification.idImageUrl,
                              "Selfie with ID"
                            )
                          }
                          className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                          title="View Image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadImage(
                              selectedVerification.idImageUrl,
                              `${selectedVerification.fullName}_Selfie_with_ID.jpg`
                            )
                          }
                          className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="aspect-video bg-[#3A3A3A] rounded-lg overflow-hidden">
                      <img
                        src={selectedVerification.idImageUrl}
                        alt="Selfie with ID"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleViewImage(
                            selectedVerification.idImageUrl,
                            "Selfie with ID"
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Always show, regardless of current status */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#242424]">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Change Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      selectedVerification.status
                    )}`}
                  >
                    Current:{" "}
                    {selectedVerification.status.charAt(0).toUpperCase() +
                      selectedVerification.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  {selectedVerification.status !== "approved" && (
                    <button
                      onClick={() => {
                        handleStatusChange(
                          selectedVerification._id,
                          "approved"
                        );
                        setSelectedVerification(null);
                      }}
                      disabled={processingId === selectedVerification._id}
                      className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === selectedVerification._id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                  )}

                  {selectedVerification.status !== "rejected" && (
                    <button
                      onClick={() =>
                        handleRejectClick(selectedVerification._id)
                      }
                      disabled={processingId === selectedVerification._id}
                      className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === selectedVerification._id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  )}

                  {selectedVerification.status !== "pending" && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedVerification._id, "pending");
                        setSelectedVerification(null);
                      }}
                      disabled={processingId === selectedVerification._id}
                      className="px-6 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === selectedVerification._id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#242424] flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownloadImage(
                      selectedImage.url,
                      `${selectedImage.title.replace(/\s+/g, "_")}.jpg`
                    )
                  }
                  className="px-3 py-1 bg-[#3AEBA5]/20 text-[#3AEBA5] rounded hover:bg-[#3AEBA5]/30 transition-colors text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                  }}
                  className="p-2 hover:bg-[#242424] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-[#242424] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-400">
                Reject KYC Verification
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setKycToReject(null);
                }}
                className="p-2 hover:bg-[#242424] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejecting this KYC verification..."
                  className="w-full h-24 bg-[#242424] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    This reason will be visible to the user
                  </span>
                  <span className="text-xs text-gray-500">
                    {rejectionReason.length}/500
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setKycToReject(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[#242424] text-gray-300 rounded-lg hover:bg-[#3A3A3A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={
                    !rejectionReason.trim() || processingId === kycToReject
                  }
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId === kycToReject ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject KYC
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerificationsPage;
