"use client";

import React, { useState } from "react";
import { X, Key, ShieldCheck, Database, Copy, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function SupabaseConfigGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isConfigured } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Tạo bảng portfolio_assets lưu danh mục cho từng người dùng
create table if not exists public.portfolio_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null,
  name text not null,
  category text not null,
  amount numeric not null,
  buy_price numeric not null,
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bật Row Level Security (RLS) bảo vệ dữ liệu riêng tư
alter table public.portfolio_assets enable row level security;

-- 3. Tạo chính sách RLS: Người dùng chỉ đọc và sửa danh mục của chính họ
create policy "Users can manage own portfolio assets"
  on public.portfolio_assets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cấu hình Google OAuth & Supabase Database
              </h3>
              <p className="text-xs text-zinc-400">
                Đồng bộ dữ liệu tài sản thật trên Cloud cho từng tài khoản Google
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300">
          {/* Status Badge */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              isConfigured
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">
                {isConfigured
                  ? "Supabase đã được kết nối thành công!"
                  : "Chưa thiết lập biến môi trường .env.local"}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isConfigured
                  ? "Người dùng đã có thể bấm 'Đăng nhập Google' để lưu danh mục trực tiếp vào database."
                  : "Dự án hiện đang chạy ở chế độ lưu trữ LocalStorage tự động. Để đồng bộ Cloud Google, làm theo 3 bước bên dưới."}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Tạo file <code className="text-emerald-400">.env.local</code> ở thư mục gốc:
              </h4>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Bật Google Auth trong Supabase Dashboard:
              </h4>
              <p className="text-zinc-400">
                Vào <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Google</strong> → Bật <strong>Enable Google provider</strong> và dán <code>Client ID</code>, <code>Client Secret</code> từ Google Cloud Console.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  Chạy lệnh SQL sau trong Supabase SQL Editor:
                </h4>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Đã sao chép!" : "Sao chép SQL"}
                </button>
              </div>

              <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px] text-emerald-400/90 overflow-x-auto">
                {sqlCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
