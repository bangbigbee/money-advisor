import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email, fullName, avatarUrl, role, scansUsed, incrementScan } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Thiếu ID hoặc Email người dùng" }, { status: 400 });
    }

    const client = supabaseAdmin && process.env.SUPABASE_SECRET_KEY ? supabaseAdmin : supabase;

    // Check if user already exists
    const { data: existingUser } = await client
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    const isAdmin = email.toLowerCase() === "bangdtbk@gmail.com";
    const userRole = isAdmin ? "ADMIN" : (existingUser?.role || role || "STARTER");
    
    let currentScans = existingUser ? Number(existingUser.scans_used) || 0 : (typeof scansUsed === "number" ? scansUsed : 0);
    if (incrementScan) {
      currentScans += 1;
    }

    const payload = {
      id,
      email: email.toLowerCase().trim(),
      full_name: fullName || existingUser?.full_name || email.split("@")[0],
      avatar_url: avatarUrl || existingUser?.avatar_url || null,
      role: userRole,
      scans_used: currentScans,
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("user_profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.warn("Lỗi lưu user_profiles vào Supabase:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    console.error("Lỗi sync user profile:", error);
    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}
