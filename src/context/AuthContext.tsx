"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type UserRole = "STARTER" | "PRO" | "ULTRA" | "ADMIN";

export interface UserTierInfo {
  role: UserRole;
  scansLimit: number;
  scansUsed: number;
  remainingScans: number;
  canScan: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  role: UserRole;
  scansUsed: number;
  scansLimit: number;
  remainingScans: number;
  canScan: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  useScanQuota: () => boolean; // returns true if scan allowed and consumed
  setRole: (role: UserRole) => void;
  resetScans: () => void;
}

const ADMIN_EMAIL = "bangdtbk@gmail.com";

const TIER_LIMITS: Record<UserRole, number> = {
  STARTER: 3,
  PRO: 50,
  ULTRA: 9999,
  ADMIN: 999999,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [role, setRoleState] = useState<UserRole>("STARTER");
  const [scansUsed, setScansUsed] = useState<number>(0);

  // Determine limits based on role
  const scansLimit = TIER_LIMITS[role] || 3;
  const isUnlimited = role === "ADMIN" || role === "ULTRA";
  const remainingScans = isUnlimited ? 999 : Math.max(0, scansLimit - scansUsed);
  const canScan = isUnlimited || remainingScans > 0;

  // Initialize or update user role and scans
  useEffect(() => {
    if (!user) {
      // Guest user: check guest storage or default to STARTER with 3 scans
      const savedGuestScans = localStorage.getItem("moneyadvisor_guest_scans");
      setRoleState("STARTER");
      setScansUsed(savedGuestScans ? parseInt(savedGuestScans, 10) || 0 : 0);
      return;
    }

    const email = user.email?.toLowerCase().trim() || "";
    const isAdmin = email === ADMIN_EMAIL.toLowerCase();

    // Key for local persistence
    const userKey = `user_tier_${user.id}`;
    const savedTier = localStorage.getItem(userKey);

    if (isAdmin) {
      setRoleState("ADMIN");
      setScansUsed(0);
    } else if (savedTier) {
      try {
        const parsed = JSON.parse(savedTier);
        setRoleState(parsed.role || "STARTER");
        setScansUsed(parsed.scansUsed || 0);
      } catch {
        setRoleState("STARTER");
        setScansUsed(0);
      }
    } else {
      // Default to STARTER for new users
      setRoleState("STARTER");
      setScansUsed(0);
      localStorage.setItem(userKey, JSON.stringify({ role: "STARTER", scansUsed: 0 }));
    }
  }, [user]);

  // Save changes to local storage when scansUsed or role changes
  const persistUserData = (newRole: UserRole, newScansUsed: number) => {
    if (user) {
      const userKey = `user_tier_${user.id}`;
      localStorage.setItem(
        userKey,
        JSON.stringify({ role: newRole, scansUsed: newScansUsed })
      );
    } else {
      localStorage.setItem("moneyadvisor_guest_scans", newScansUsed.toString());
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      alert(
        "Chưa cấu hình Supabase! Vui lòng thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY vào file .env.local và bật Google Provider trong Supabase Dashboard."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Lỗi đăng nhập Google:", error.message);
      alert("Đăng nhập thất bại: " + error.message);
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Lỗi đăng xuất:", error.message);
    } else {
      setUser(null);
      setSession(null);
      setRoleState("STARTER");
    }
  };

  const useScanQuota = (): boolean => {
    if (role === "ADMIN" || role === "ULTRA") {
      return true;
    }
    if (remainingScans <= 0) {
      return false;
    }

    const nextUsed = scansUsed + 1;
    setScansUsed(nextUsed);
    persistUserData(role, nextUsed);
    return true;
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    persistUserData(newRole, scansUsed);
  };

  const resetScans = () => {
    setScansUsed(0);
    persistUserData(role, 0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        role,
        scansUsed,
        scansLimit,
        remainingScans,
        canScan,
        signInWithGoogle,
        signOut,
        useScanQuota,
        setRole,
        resetScans,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
