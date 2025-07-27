"use client";

import React, { useState } from "react";
import { ChevronLeft, X, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import axios from "@/lib/axios";

interface FormData {
  name: string;
  city: string;
  country: string;
  idNumber: string;
}

interface ImageUpload {
  file: File | null;
  preview: string | null;
}

const KYCPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    city: "",
    country: "",
    idNumber: "",
  });

  const [images, setImages] = useState({
    idFront: {
      file: null,
      preview: null,
    } as ImageUpload,
    idBack: {
      file: null,
      preview: null,
    } as ImageUpload,
    selfie: {
      file: null,
      preview: null,
    } as ImageUpload,
  });

  const handleImageSelect = (
    type: "idFront" | "idBack" | "selfie",
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => ({
        ...prev,
        [type]: {
          file,
          preview: e.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (type: "idFront" | "idBack" | "selfie") => {
    setImages((prev) => ({
      ...prev,
      [type]: {
        file: null,
        preview: null,
      },
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check if all required images are selected
    if (!images.idFront.file || !images.idBack.file || !images.selfie.file) {
      toast.error(
        "Please upload all required documents (ID Front, ID Back, and Selfie)"
      );
      setLoading(false);
      return;
    }

    try {
      // Create FormData object to send files
      const submitFormData = new FormData();

      // Append text fields
      submitFormData.append("fullName", formData.name);
      submitFormData.append("city", formData.city);
      submitFormData.append("country", formData.country);
      submitFormData.append("idNumber", formData.idNumber);

      // Append image files
      submitFormData.append("frontImage", images.idFront.file);
      submitFormData.append("backImage", images.idBack.file);
      submitFormData.append("idImage", images.selfie.file);

      const response = await axios.post(
        "/user/kyc-verification",
        submitFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setShowModal(true);
        toast.success(
          response.data.message || "KYC verification submitted successfully"
        );
      } else {
        throw new Error(
          response.data.message || "Failed to submit KYC verification"
        );
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to submit KYC information. Please try again.";

      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleProceedToDashboard = () => {
    setShowModal(false);
    router.push("/dashboard");
  };

  const ImageUploadComponent = ({
    type,
    title,
    description,
    isCircular = false,
  }: {
    type: "idFront" | "idBack" | "selfie";
    title: string;
    description: string;
    isCircular?: boolean;
  }) => {
    const image = images[type];

    return (
      <div className="bg-[#202020] rounded-xl p-4 border-2 border-dashed border-gray-600 hover:border-[#3AEBA5] transition-colors">
        <div className="text-center">
          <h3 className="text-sm font-medium mb-2">{title}</h3>
          <p className="text-xs text-gray-400 mb-4">{description}</p>

          {!image.preview ? (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageSelect(type, file);
                  }
                }}
              />
              <div className="flex flex-col items-center py-6">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-[#3AEBA5]">Choose Image</span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 10MB
                </span>
              </div>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={image.preview}
                  alt={title}
                  className={`w-full h-32 object-cover rounded-lg mx-auto ${
                    isCircular ? "w-32 rounded-full" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(type)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full py-2 bg-green-600 text-white rounded-lg text-center flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Image Selected
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChevronLeft
              className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
              onClick={() => router.back()}
            />
            <h1 className="font-poppins text-[14px] md:text-[32px] font-medium">
              Identity Verification (KYC)
            </h1>
          </div>
          <button
            onClick={handleSkip}
            className="text-[12px] md:text-[14px] text-[#3AEBA5] hover:text-[#3AEBA5]/80 font-medium cursor-pointer"
          >
            Skip for now
          </button>
        </div>

        <p className="text-[12px] md:text-[14px] text-[#4B4B4B] mt-4 mb-8">
          Complete your identity verification to unlock full platform features
          and higher transaction limits
        </p>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#161616] rounded-xl p-6">
            <h2 className="text-[14px] md:text-[18px] font-semibold mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#202020] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
                placeholder="Full Name"
                required
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#202020] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
                placeholder="City"
                required
              />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#202020] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
                placeholder="Country"
                required
              />
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="h-[48px] md:h-[56px] w-full text-[12px] md:text-[15px] bg-[#202020] rounded-[9.61px] outline-none focus:border-[1.2px] focus:border-[#3AEBA5] px-3 transition-colors"
                placeholder="ID Number"
                required
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-[#161616] rounded-xl p-6">
            <h2 className="text-[14px] md:text-[18px] font-semibold mb-6">
              Document Upload
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ImageUploadComponent
                type="idFront"
                title="ID Front"
                description="Upload the front side of your government-issued ID"
              />
              <ImageUploadComponent
                type="idBack"
                title="ID Back"
                description="Upload the back side of your government-issued ID"
              />
              <ImageUploadComponent
                type="selfie"
                title="Picture holding ID"
                description="Upload a clear picture of yourself holding your ID"
                isCircular={true}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !images.idFront.file ||
              !images.idBack.file ||
              !images.selfie.file
            }
            className="w-full h-[48px] md:h-[56px] bg-[#3AEBA5] hover:bg-[#3AEBA5]/90 text-black font-medium rounded-[9.61px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Submit Verification"}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] rounded-xl p-6 max-w-[400px] w-full relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[#3AEBA5]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Verification Submitted
                </h3>
                <p className="text-gray-400 mb-6">
                  Your KYC verification request has been submitted successfully.
                  We&apos;ll review your information and notify you once
                  approved.
                </p>
                <button
                  onClick={handleProceedToDashboard}
                  className="w-full h-12 bg-[#3AEBA5] text-black font-medium rounded-lg hover:bg-[#3AEBA5]/90 transition-colors"
                >
                  Proceed to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KYCPage;
