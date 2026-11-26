"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUsers: () => Promise<void>;
  pendingCounts: {
    reviewApp: number;
    reviewFeedback: number;
    fillFeedback: number;
  };
  refreshPendingCounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  loading: true,
  login: async () => ({ success: false }),
  logout: () => { },
  refreshUsers: async () => { },
  pendingCounts: { reviewApp: 0, reviewFeedback: 0, fillFeedback: 0 },
  refreshPendingCounts: async () => { }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({ reviewApp: 0, reviewFeedback: 0, fillFeedback: 0 });

  const refreshUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data: User[] = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(data.user));
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "登入失敗" };
      }
    } catch (err) {
      return { success: false, error: "網路連線異常" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
    }
    router.push("/login");
  };

  const refreshPendingCounts = async () => {
    if (!currentUser) return;
    try {
      const [appRes, fbRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/feedback")
      ]);
      let revApp = 0;
      let revFb = 0;
      let fillFb = 0;

      if (appRes.ok) {
        const apps = await appRes.json();
        if (currentUser.role === "MANAGER") {
          revApp = apps.filter((a: any) => a.status === "PENDING_UNIT_REVIEW").length;
        } else if (currentUser.role === "HR_MANAGER" || currentUser.role === "ADMIN") {
          revApp = apps.filter((a: any) => a.status === "PENDING_HR_REVIEW").length;
        }
      }

      if (fbRes.ok) {
        const fbs = await fbRes.json();
        fillFb = fbs.filter((f: any) => f.empId === currentUser.id && f.status === "DRAFT").length;
        if (currentUser.role === "MANAGER") {
          revFb = fbs.filter((f: any) => f.status === "SUBMITTED").length;
        } else if (currentUser.role === "DEPT_HEAD" || currentUser.role === "ADMIN") {
          revFb = fbs.filter((f: any) => f.status === "MANAGER_REVIEWED").length;
        }
      }

      setPendingCounts({
        reviewApp: revApp,
        reviewFeedback: revFb,
        fillFeedback: fillFb
      });
    } catch (e) {
      console.error("Error refreshing pending counts:", e);
    }
  };

  // Initial session check
  useEffect(() => {
    refreshUsers();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("auth_user");
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setCurrentUser(user);
        } catch {
          localStorage.removeItem("auth_user");
        }
      }
    }
    setLoading(false);
  }, []);

  // Route guard: if not logged in and not on /login or /attendance/scan, redirect to /login
  useEffect(() => {
    if (loading) return;
    const isPublicRoute = pathname === "/login" || pathname.startsWith("/attendance/scan");
    if (!currentUser && !isPublicRoute) {
      router.push("/login");
    }
  }, [currentUser, loading, pathname, router]);

  useEffect(() => {
    if (currentUser) {
      refreshPendingCounts();
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        login,
        logout,
        refreshUsers,
        pendingCounts,
        refreshPendingCounts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
