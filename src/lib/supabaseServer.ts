import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

// Server-side admin client (chỉ chạy trên NodeJS server, không gửi về client)
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseSecretKey || "placeholder-secret-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
