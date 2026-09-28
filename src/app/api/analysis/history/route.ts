import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ history: [] });
    }

    const client = supabaseAdmin && process.env.SUPABASE_SECRET_KEY ? supabaseAdmin : supabase;

    const { data, error } = await client
      .from("analysis_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("Lỗi tải analysis_history từ Supabase:", error.message);
      return NextResponse.json({ history: [], error: error.message });
    }

    return NextResponse.json({ history: data || [] });
  } catch (error: any) {
    console.error("Lỗi GET /api/analysis/history:", error);
    return NextResponse.json({ history: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      symbol,
      name,
      coinImage,
      priceAtAnalysis,
      spotAction,
      futureAction,
      summaryText,
      fullResultJson,
    } = body;

    if (!userId || !symbol || !name) {
      return NextResponse.json({ error: "Thiếu thông tin phân tích" }, { status: 400 });
    }

    const client = supabaseAdmin && process.env.SUPABASE_SECRET_KEY ? supabaseAdmin : supabase;

    const payload = {
      user_id: userId,
      symbol: symbol.toUpperCase(),
      name,
      coin_image: coinImage || null,
      price_at_analysis: Number(priceAtAnalysis) || 0,
      spot_action: spotAction || "QUAN SÁT",
      future_action: futureAction || "QUAN SÁT",
      summary_text: summaryText || "",
      full_result_json: fullResultJson || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("analysis_history")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn("Lỗi lưu analysis_history vào Supabase:", error.message);
      return NextResponse.json({ success: false, error: error.message, item: payload });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    console.error("Lỗi POST /api/analysis/history:", error);
    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    const client = supabaseAdmin && process.env.SUPABASE_SECRET_KEY ? supabaseAdmin : supabase;

    let query = client.from("analysis_history").delete().eq("user_id", userId);
    if (id) {
      query = query.eq("id", id);
    }

    const { error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lỗi DELETE /api/analysis/history:", error);
    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}
