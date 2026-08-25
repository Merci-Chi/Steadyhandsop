import { useState, useEffect } from "react";
import type { OnlineUser } from "@shared/schema";

const STORAGE_KEY = "eez-user";

const AVATAR_COLORS = [
  "#0ea5e9", // sky blue
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#10b981", // emerald
  "#22c55e", // green
  "#84cc16", // lime
  "#eab308", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#a855f7", // purple
  "#6366f1", // indigo
];

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function useLocalUser() {
  const [user, setUser] = useState<OnlineUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({
          ...parsed,
          isTyping: false,
          typingContent: "",
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const createUser = (displayName: string) => {
    const username = displayName.toLowerCase().replace(/\s+/g, "_");
    const newUser: OnlineUser = {
      id: generateUserId(),
      username,
      displayName,
      avatarColor: getRandomColor(),
      isTyping: false,
      typingContent: "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const updateUser = (updates: Partial<OnlineUser>) => {
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUser(updated);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return {
    user,
    isLoading,
    createUser,
    updateUser,
    logout,
  };
}
