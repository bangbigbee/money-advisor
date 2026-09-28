"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js App Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl bg-[#0f1225] border border-rose-500/30 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Đã xảy ra sự cố hiển thị</h2>
          <p className="text-sm text-slate-400 mt-1">
            Hệ thống đã tự động bảo vệ dữ liệu phiên làm việc. Bấm nút bên dưới để thử lại ngay.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:brightness-110 transition shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại ngay</span>
        </button>
      </div>
    </div>
  );
}
