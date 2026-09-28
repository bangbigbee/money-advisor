"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Crown,
  Scan,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Server,
  Zap,
  Clock,
  ArrowUpRight,
  Database,
  Sliders,
  Copy,
  Check,
  Code,
  Sparkles,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  scansUsed: number;
  scansLimit: number;
  joinedDate: string;
  lastActive: string;
  status: "active" | "suspended";
}

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  tierCounts: {
    STARTER: number;
    PRO: number;
    ULTRA: number;
    ADMIN: number;
  };
  totalAssetsValueUSD: number;
}

const TIER_LIMITS: Record<UserRole, number> = {
  STARTER: 3,
  PRO: 50,
  ULTRA: 9999,
  ADMIN: 999999,
};

const SQL_MIGRATION_SNIPPET = `-- Tạo bảng lưu trữ thông tin User và Phân quyền trong Supabase
create table if not exists public.user_profiles (
  id text primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'STARTER',
  scans_used integer default 0,
  last_active timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kích hoạt Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- Cho phép đọc và ghi dữ liệu hồ sơ
drop policy if exists "Public read profiles" on public.user_profiles;
create policy "Public read profiles" on public.user_profiles for select using (true);

drop policy if exists "Users and admin can upsert profiles" on public.user_profiles;
create policy "Users and admin can upsert profiles" on public.user_profiles for all using (true);`;

export function AdminDashboard() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScans: 0,
    tierCounts: { STARTER: 0, PRO: 0, ULTRA: 0, ADMIN: 0 },
    totalAssetsValueUSD: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();

      if (data.users && Array.isArray(data.users)) {
        const mapped: ManagedUser[] = data.users.map((u: any) => {
          const userRole = (u.role || "STARTER") as UserRole;
          const joinedFormatted = u.created_at
            ? new Date(u.created_at).toLocaleDateString("vi-VN")
            : "Chưa rõ";
          
          let lastActiveFormatted = "Chưa rõ";
          if (u.last_active) {
            const diffMin = Math.floor(
              (Date.now() - new Date(u.last_active).getTime()) / 60000
            );
            if (diffMin < 2) lastActiveFormatted = "Vừa xong";
            else if (diffMin < 60) lastActiveFormatted = `${diffMin} phút trước`;
            else if (diffMin < 1440)
              lastActiveFormatted = `${Math.floor(diffMin / 60)} giờ trước`;
            else
              lastActiveFormatted = `${Math.floor(diffMin / 1440)} ngày trước`;
          }

          return {
            id: u.id,
            name: u.full_name || u.email?.split("@")[0] || "User",
            email: u.email || "",
            avatar: u.avatar_url,
            role: userRole,
            scansUsed: Number(u.scans_used) || 0,
            scansLimit: TIER_LIMITS[userRole] || 3,
            joinedDate: joinedFormatted,
            lastActive: lastActiveFormatted,
            status: "active",
          };
        });

        setUsersList(mapped);

        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu admin:", err);
      showToast("error", "Không thể kết nối Supabase API: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    setIsUpdating(true);
    try {
      // Optimistic UI update
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: newRole,
                scansLimit: TIER_LIMITS[newRole] || 3,
              }
            : u
        )
      );

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi cập nhật phân quyền");
      }

      showToast(
        "success",
        `Đã nâng cấp người dùng thành gói [${newRole}] trong Supabase Database!`
      );
      // Re-fetch to update accurate counts
      fetchUsers();
    } catch (err: any) {
      showToast("error", "Thao tác thất bại: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetUserScans = async (userId: string) => {
    setIsUpdating(true);
    try {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, scansUsed: 0 } : u))
      );

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, resetScans: true }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi reset lượt quét");
      }

      showToast("success", "Đã reset về 0 lượt quét AI cho người dùng trong Database!");
      fetchUsers();
    } catch (err: any) {
      showToast("error", "Reset thất bại: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SNIPPET);
    setCopiedSql(true);
    showToast("success", "Đã sao chép SQL Schema vào clipboard!");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Dynamic pie chart distribution based on real database records
  const totalInDb = Math.max(1, usersList.length);
  const starterCount = stats.tierCounts.STARTER || usersList.filter((u) => u.role === "STARTER").length;
  const proCount = stats.tierCounts.PRO || usersList.filter((u) => u.role === "PRO").length;
  const ultraCount = stats.tierCounts.ULTRA || usersList.filter((u) => u.role === "ULTRA").length;
  const adminCount = stats.tierCounts.ADMIN || usersList.filter((u) => u.role === "ADMIN").length;

  const dynamicTierData = [
    {
      name: `STARTER (${Math.round((starterCount / totalInDb) * 100)}%)`,
      value: starterCount || 0,
      color: "#71717a",
    },
    {
      name: `PRO (${Math.round((proCount / totalInDb) * 100)}%)`,
      value: proCount || 0,
      color: "#10b981",
    },
    {
      name: `ULTRA (${Math.round((ultraCount / totalInDb) * 100)}%)`,
      value: ultraCount || 0,
      color: "#f59e0b",
    },
    {
      name: `ADMIN (${Math.round((adminCount / totalInDb) * 100)}%)`,
      value: adminCount || 0,
      color: "#f43f5e",
    },
  ];

  // Dynamic MRR calculation based on active paid subscribers
  const estimatedMRR_VND = proCount * 199000 + ultraCount * 499000;
  const estimatedMRRFormatted =
    estimatedMRR_VND >= 1000000
      ? `${(estimatedMRR_VND / 1000000).toFixed(1)}M ₫`
      : `${(estimatedMRR_VND / 1000).toFixed(0)}k ₫`;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : notification.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
              : "bg-cyan-950/90 border-cyan-500/40 text-cyan-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-zinc-900/80 to-zinc-900 border border-rose-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg">
            <Crown className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Admin Control Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                👑 Super Admin
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Dữ liệu người dùng thời gian thực kết nối trực tiếp với Supabase Database
            </p>
          </div>
        </div>

        {/* System Health Indicators & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-semibold transition cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-rose-400" />
            <span>Supabase Schema SQL</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Đang đồng bộ..." : "Làm mới Data"}</span>
          </button>
        </div>
      </div>

      {/* SQL Migration Helper Banner */}
      {showSqlGuide && (
        <div className="p-5 rounded-2xl bg-zinc-900/95 border border-rose-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>SQL Script khởi tạo bảng `user_profiles` trên Supabase</span>
            </div>
            <button
              onClick={copySqlToClipboard}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition font-mono"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? "Đã chép" : "Copy SQL"}</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Nếu bạn vừa tạo dự án Supabase mới, hãy vào <strong>Supabase Dashboard ➔ SQL Editor ➔ New query</strong> và dán đoạn SQL sau để đảm bảo bảng lưu người dùng hoạt động hoàn hảo:
          </p>
          <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
            {SQL_MIGRATION_SNIPPET}
          </pre>
        </div>
      )}

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tổng số Người dùng
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString("vi-VN") : usersList.length}
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Dữ liệu thời gian thực từ Supabase
            </div>
          </div>
        </div>

        {/* AI Scans */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tổng Lượt Quét AI
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Scan className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.totalScans.toLocaleString("vi-VN")}
            </div>
            <div className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5" /> Quota được quản lý phân quyền
            </div>
          </div>
        </div>

        {/* Total Assets Tracked */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tài sản theo dõi
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              ${(stats.totalAssetsValueUSD || 0).toLocaleString("en-US")}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-1">
              ≈ {(((stats.totalAssetsValueUSD || 0) * 25480) / 1000000).toFixed(1)} Triệu VNĐ
            </div>
          </div>
        </div>

        {/* Estimated MRR */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Doanh thu ước tính (MRR)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {estimatedMRRFormatted}
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> {proCount} PRO • {ultraCount} ULTRA VIP
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Tier Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Phân bổ Gói Tài khoản Thực tế
            </h3>
            <p className="text-xs text-zinc-400">Tỷ lệ các gói tài khoản lưu trong database</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicTierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dynamicTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tier Counts grid */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-800 text-center">
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Starter</div>
              <div className="font-mono font-bold text-sm text-zinc-200">{starterCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">PRO</div>
              <div className="font-mono font-bold text-sm text-emerald-400">{proCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-amber-400 font-bold uppercase">ULTRA</div>
              <div className="font-mono font-bold text-sm text-amber-400">{ultraCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-rose-400 font-bold uppercase">ADMIN</div>
              <div className="font-mono font-bold text-sm text-rose-400">{adminCount}</div>
            </div>
          </div>
        </div>

        {/* Feature & Quotas Summary Card (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Chính sách Phân cấp Người dùng & Giới hạn Quét AI
            </h3>
            <p className="text-xs text-zinc-400">Thiết lập tự động áp dụng khi người dùng đăng nhập bằng Google</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">STARTER</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">Free</span>
              </div>
              <div className="text-lg font-black text-white font-mono">3 Lượt</div>
              <p className="text-[11px] text-zinc-500">Mặc định khi đăng ký tài khoản mới qua Google.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">PRO PLAN</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">199k/th</span>
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono">50 Lượt/ngày</div>
              <p className="text-[11px] text-zinc-500">Phân tích chuyên sâu 2 luồng Spot & Future/Margin.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">ULTRA VIP</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">499k/th</span>
              </div>
              <div className="text-lg font-black text-amber-400 font-mono">Vô hạn (∞)</div>
              <p className="text-[11px] text-zinc-500">Toàn bộ tính năng AI nâng cao và ưu tiên xử lý tức thì.</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table Section */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
              Quản lý Danh sách Người dùng & Phân cấp Thực tế
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Dữ liệu lưu trực tiếp trong Supabase. Khi chọn đổi phân cấp hoặc reset lượt, cơ sở dữ liệu sẽ cập nhật ngay lập tức.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm user hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/60 sm:w-52"
              />
            </div>

            {/* Filter by Role */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto scrollbar-thin">
              {["ALL", "STARTER", "PRO", "ULTRA", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    roleFilter === r
                      ? "bg-zinc-800 text-rose-400 font-bold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-zinc-300 whitespace-nowrap">
            <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Người dùng</th>
                <th className="py-3 px-4 font-semibold">Phân cấp (Tier)</th>
                <th className="py-3 px-4 font-semibold text-center">Lượt Quét AI</th>
                <th className="py-3 px-4 font-semibold">Ngày tham gia</th>
                <th className="py-3 px-4 font-semibold">Hoạt động cuối</th>
                <th className="py-3 px-4 font-semibold text-center">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500 text-xs">
                    {isLoading
                      ? "Đang tải dữ liệu người dùng từ Supabase..."
                      : "Chưa có người dùng nào được ghi nhận. Hãy đăng nhập tài khoản Google để tài khoản tự động được tạo và ghi vào cơ sở dữ liệu."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            {u.role === "ADMIN" && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <div className="text-[11px] text-zinc-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        disabled={isUpdating}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 focus:outline-none focus:border-rose-500/60 cursor-pointer disabled:opacity-50"
                      >
                        <option value="STARTER">STARTER (3 lượt)</option>
                        <option value="PRO">PRO (50 lượt/ngày)</option>
                        <option value="ULTRA">ULTRA (Không giới hạn)</option>
                        <option value="ADMIN">ADMIN (Quản trị)</option>
                      </select>
                    </td>

                    {/* Scan quota */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-bold text-white">{u.scansUsed}</span>
                      <span className="text-zinc-500">
                        {" "}
                        / {u.scansLimit > 9999 ? "∞" : u.scansLimit}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400">{u.joinedDate}</td>

                    {/* Last active */}
                    <td className="py-3.5 px-4 text-emerald-400">{u.lastActive}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleResetUserScans(u.id)}
                        disabled={isUpdating}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition cursor-pointer disabled:opacity-50"
                        title="Làm mới lại lượt quét của user về 0"
                      >
                        Reset lượt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
