"use client";

import React, { useState } from "react";
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
  BarChart,
  Bar,
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

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "admin-1",
    name: "Bang (Admin)",
    email: "bangdtbk@gmail.com",
    role: "ADMIN",
    scansUsed: 142,
    scansLimit: 999999,
    joinedDate: "2026-09-01",
    lastActive: "Vừa xong",
    status: "active",
  },
  {
    id: "u-2",
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    role: "PRO",
    scansUsed: 18,
    scansLimit: 50,
    joinedDate: "2026-09-12",
    lastActive: "5 phút trước",
    status: "active",
  },
  {
    id: "u-3",
    name: "Trần Minh Tuấn",
    email: "tuan.tran99@gmail.com",
    role: "ULTRA",
    scansUsed: 89,
    scansLimit: 9999,
    joinedDate: "2026-09-15",
    lastActive: "12 phút trước",
    status: "active",
  },
  {
    id: "u-4",
    name: "Lê Hoàng Yến",
    email: "hoangyen.le@gmail.com",
    role: "STARTER",
    scansUsed: 3,
    scansLimit: 3,
    joinedDate: "2026-09-20",
    lastActive: "1 giờ trước",
    status: "active",
  },
  {
    id: "u-5",
    name: "Phạm Quốc Dũng",
    email: "dung.crypto@gmail.com",
    role: "PRO",
    scansUsed: 32,
    scansLimit: 50,
    joinedDate: "2026-09-22",
    lastActive: "3 giờ trước",
    status: "active",
  },
  {
    id: "u-6",
    name: "Vũ Mai Phương",
    email: "phuong.vu88@gmail.com",
    role: "STARTER",
    scansUsed: 1,
    scansLimit: 3,
    joinedDate: "2026-09-25",
    lastActive: "1 ngày trước",
    status: "active",
  },
  {
    id: "u-7",
    name: "Đỗ Gia Huy",
    email: "giahuy.trade@gmail.com",
    role: "ULTRA",
    scansUsed: 154,
    scansLimit: 9999,
    joinedDate: "2026-09-18",
    lastActive: "2 ngày trước",
    status: "active",
  },
];

const SCAN_GROWTH_DATA = [
  { day: "T2", scans: 420, users: 110 },
  { day: "T3", scans: 680, users: 145 },
  { day: "T4", scans: 910, users: 190 },
  { day: "T5", scans: 1150, users: 240 },
  { day: "T6", scans: 1420, users: 310 },
  { day: "T7", scans: 1980, users: 430 },
  { day: "CN", scans: 2450, users: 520 },
];

const TIER_DISTRIBUTION_DATA = [
  { name: "STARTER (82.5%)", value: 1180, color: "#71717a" },
  { name: "PRO (12.9%)", value: 185, color: "#10b981" },
  { name: "ULTRA (4.3%)", value: 62, color: "#f59e0b" },
  { name: "ADMIN", value: 1, color: "#f43f5e" },
];

const TOP_SCANNED_COINS = [
  { coin: "BTC", count: 1840, share: 38 },
  { coin: "SOL", count: 1160, share: 24 },
  { coin: "ETH", count: 870, share: 18 },
  { coin: "SUI", count: 580, share: 12 },
  { coin: "PEPE", count: 390, share: 8 },
];

export function AdminDashboard() {
  const { user, role, setRole } = useAuth();
  const [usersList, setUsersList] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleChangeUserRole = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
              scansLimit:
                newRole === "STARTER"
                  ? 3
                  : newRole === "PRO"
                  ? 50
                  : 9999,
            }
          : u
      )
    );
  };

  const handleResetUserScans = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, scansUsed: 0 } : u))
    );
    alert("Đã làm mới lại lượt quét của người dùng!");
  };

  return (
    <div className="space-y-8">
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
              Theo dõi lượng người dùng, phân bổ gói tài khoản, thống kê Quét AI và giám sát hệ thống
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-300 font-medium">Supabase: Online</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-300 font-medium">Groq AI: 45ms</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-300 font-medium">CoinGecko: Live</span>
          </div>
        </div>
      </div>

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
            <div className="text-2xl font-black text-white font-mono">1,428</div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +142 users tuần này (+11.8%)
            </div>
          </div>
        </div>

        {/* AI Scans Today */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lượt Quét AI Hôm nay
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Scan className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">4,892</div>
            <div className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5" /> 42,150 tổng lượt all-time
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
            <div className="text-2xl font-black text-white font-mono">$18.4M</div>
            <div className="text-xs text-zinc-400 font-mono mt-1">
              ≈ 468.8 Tỷ VNĐ
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
            <div className="text-2xl font-black text-amber-400 font-mono">67.8M ₫</div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> 185 PRO • 62 ULTRA VIP
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Chart (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Tăng trưởng Người dùng & Lượt Quét AI (7 Ngày qua)
              </h3>
              <p className="text-xs text-zinc-400">Khối lượng truy cập và hoạt động của toàn hệ thống</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SCAN_GROWTH_DATA}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  name="Lượt Quét AI"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScans)"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Người dùng mới"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution & Top Scans (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Phân bổ Gói Tài khoản
            </h3>
            <p className="text-xs text-zinc-400">Tỷ lệ chuyển đổi gói STARTER ➔ PRO ➔ ULTRA</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TIER_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {TIER_DISTRIBUTION_DATA.map((entry, index) => (
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

          {/* Top Coins Bar Breakdown */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <span className="text-xs font-semibold text-zinc-300">Top Coin được Quét AI nhiều nhất:</span>
            <div className="grid grid-cols-5 gap-1 text-center">
              {TOP_SCANNED_COINS.map((item) => (
                <div key={item.coin} className="p-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <div className="font-mono font-bold text-xs text-white">{item.coin}</div>
                  <div className="text-[10px] text-emerald-400">{item.share}%</div>
                </div>
              ))}
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
              Quản lý Danh sách Người dùng & Phân cấp
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Xem chi tiết tài khoản, thay đổi quyền hạn gói và thiết lập lượt quét cho từng user
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
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition">
                  {/* User info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
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
                      onChange={(e) => handleChangeUserRole(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 focus:outline-none focus:border-rose-500/60 cursor-pointer"
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
                    <span className="text-zinc-500"> / {u.scansLimit > 9999 ? "∞" : u.scansLimit}</span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 font-mono text-zinc-400">{u.joinedDate}</td>

                  {/* Last active */}
                  <td className="py-3.5 px-4 text-emerald-400">{u.lastActive}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleResetUserScans(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition cursor-pointer"
                      title="Làm mới lại lượt quét của user"
                    >
                      Reset lượt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
