import axios from "@/lib/axios";
import { AxiosError } from "axios";

export const getProfile = async () => {
  try {
    console.log("Making API call to /user/profile");
    const response = await axios.get(`/user/profile`);
    console.log("API response:", response);

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(`Invalid response: ${response.status}`);
    }
  } catch (error: unknown) {
    console.error("getProfile error:", error);

    if (error instanceof AxiosError) {
      // Handle axios errors
      const message =
        error.response?.data?.message ||
        `Server error: ${error.response?.status}`;
      throw new Error(message);
    } else if (error instanceof Error) {
      // Handle other Error objects
      throw error;
    } else {
      // Something else happened
      throw new Error("Unknown error occurred");
    }
  }
};

export const getAssets = async () => {
  const response = await axios.get(`/user/assets`);
  return response.data;
};
