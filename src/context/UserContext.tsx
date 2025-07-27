"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types/user";
import { getProfile } from "@/services/profile";

interface UserContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

const shortenUserId = (user: User): User => {
  const userWithId = user as User & { id?: string };
  const userId = userWithId.id || user._id;

  if (!userId) {
    return user;
  }

  return {
    ...user,
    _id: userId.substring(0, 8),
  };
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshUser = async () => {
    try {
      const profileData = await getProfile();
      const shortenedUser = shortenUserId(profileData);
      setUser(shortenedUser);
      console.log("Profile refreshed:", shortenedUser);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const setUserWithShortenedId = (userData: User | null) => {
    if (userData) {
      setUser(shortenUserId(userData));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(shortenUserId(parsedUser));
    }
    if (storedToken) setToken(storedToken);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && token && !user?.vipTier) {
      console.log("Fetching latest profile data...");
      refreshUser();
    }
  }, [isLoaded, token]);

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token, isLoaded]);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        setUser: setUserWithShortenedId,
        setToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
