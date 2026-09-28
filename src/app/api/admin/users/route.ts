import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Choose client: supabaseAdmin if service role is configured, otherwise fallback to public client
    const client = supabaseAdmin && process.env.SUPABASE_SECRET_KEY ? supabaseAdmin : supabase;

    // 1. Fetch all user profiles from Supabase database
    const { data: users, error: userError } = await client
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (userError) {
      console.warn("Lỗi khi tải user_profiles từ Supabase:", userError.message);
      // Return empty array with error status so frontend can handle gracefully
      return NextResponse.json({
        users: [],
        stats: {
          totalUsers: 0,
          totalScans: 0,
          tierCounts: { STARTER: 0, PRO: 0, ULTRA: 0, ADMIN: 0 },
          totalAssetsValueUSD: 0,
        },
        error: userError.message,
      });
    }

    const userList = users || [];

    // 2. Fetch total assets tracked across all users from portfolio_assets
    let totalAssetsUSD = 0;
    try {
      const { data: assets } = await client
        .from("portfolio_assets")
        .select("amount, buy_price, currency");

      if (assets) {
        totalAssetsUSD = assets.reduce((sum, a) => {
          const price = Number(a.buy_price) || 0;
          const amount = Number(a.amount) || 0;
          const val = a.currency === "VND" ? (price * amount) / 25480 : price * amount;
          return sum + val;
        }, 0);
      }
    } catch (e) {
      console.warn("Could not calculate portfolio assets total:", e);
    }

    // 3. Aggregate real metrics
    const totalUsers = userList.length;
    const totalScans = userList.reduce((acc, u) => acc + (Number(u.scans_used) || 0), 0);

    const tierCounts = {
      STARTER: userList.filter((u) => u.role === "STARTER").length,
      PRO: userList.filter((u) => u.role === "PRO").length,
      ULTRA: userList.filter((u) => u.role === "ULTRA").length,
      ADMIN: userList.filter((u) => u.role === "ADMIN" || u.email?.toLowerCase() === "bangdtbk@gmail.com").length,
    };

    return NextResponse.json({
      users: userList,
      stats: {
        totalUsers,
        totalScans,
        tierCounts,
        totalAssetsValueUSD: Math.round(totalAssetsUSD),
      },
    });
  } catch (error: any) {
    console.error("Lỗi API Admin Users:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi xử lý server" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, scansUsed, resetScans } = body;

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    const client = supabaseAdmin && process.env.SUPABASE_SECRET_KEY ? supabaseAdmin : supabase;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (role) updates.role = role;
    if (typeof scansUsed === "number") updates.scans_used = scansUsed;
    if (resetScans) updates.scans_used = 0;

    const { data, error } = await client
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error("Lỗi cập nhật user admin:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi cập nhật" },
      { status: 500 }
    );
  }
}
