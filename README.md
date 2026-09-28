# MoneyAdvisor 💰📈

Nền tảng quản lý tài chính cá nhân, theo dõi danh mục đầu tư và giám sát biến động thị trường (Crypto, Vàng SJC/PNJ, Ngoại tệ Forex) thời gian thực.

---

## 🚀 Tính năng nổi bật

- 🔐 **Đăng nhập Google OAuth (Supabase Auth)**: Đăng nhập bằng tài khoản Google để lưu trữ danh mục đầu tư cá nhân trên Cloud, bảo mật với Row Level Security (RLS).
- 📊 **Quản lý Tài sản & Danh mục Realtime**: Tự động tính toán tổng tài sản (USD / VNĐ), lãi/lỗ (PnL), tỷ lệ phân bổ danh mục theo giá thị trường thời gian thực.
- ➕ **Ghi nhận & Quản lý Giao dịch**: Thêm tài sản mới (Crypto, Vàng SJC, Ngoại tệ, Tiền gửi tiết kiệm...), xóa và theo dõi lợi nhuận từng mã.
- 🪙 **Thị trường Crypto Live**: Tích hợp CoinGecko API lấy giá thời gian thực, biến động 24h, vốn hóa, khối lượng giao dịch của các top coins (BTC, ETH, SOL, BNB, XRP,...).
- 🥇 **Thị trường Vàng & Ngoại hối**: Cập nhật giá vàng SJC, PNJ, Vàng thế giới (Spot Gold XAU/USD) và tỷ giá các đồng tiền chủ chốt (USD, EUR, JPY).
- 📈 **Biểu đồ Kỹ thuật Chuyên sâu (TradingView Widget)**: Tích hợp biểu đồ TradingView đa khung thời gian, chuyển đổi nhanh giữa Bitcoin, Ethereum, Solana, Vàng và chỉ số USD.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Biểu đồ**: [Recharts](https://recharts.org/) & [TradingView Advanced Charts](https://www.tradingview.com/)
- **Xác thực & Cơ sở dữ liệu**: [Supabase](https://supabase.com/) (Google OAuth + Postgres Database)
- **Ngôn ngữ**: TypeScript

---

## 📦 Cài đặt và Chạy thử nghiệm Local

1. **Cài đặt thư viện phụ thuộc**:
```bash
npm install
```

2. **Chạy máy chủ phát triển (Dev server)**:
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm.

3. **Build cho môi trường Production**:
```bash
npm run build
npm run start
```

---

## 🔑 Hướng dẫn Cấu hình Google Auth & Supabase Database

### Bước 1: Tạo file `.env.local`
Tạo file `.env.local` ở thư mục gốc của dự án:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Bước 2: Bật Google Provider trên Supabase
1. Vào Supabase Dashboard → Dự án của bạn → **Authentication** → **Providers**.
2. Chọn **Google** → Bật **Enable Google provider**.
3. Cung cấp `Client ID` và `Client Secret` từ **Google Cloud Console** (mục API & Services > Credentials).
4. Thêm Redirect URL do Supabase cung cấp vào Google Cloud Console.

### Bước 3: Chạy lệnh SQL tạo bảng dữ liệu
Vào **SQL Editor** trong Supabase Dashboard và thực thi đoạn SQL sau:

```sql
-- 1. Tạo bảng portfolio_assets lưu danh mục cho từng người dùng
create table if not exists public.portfolio_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null,
  name text not null,
  category text not null, -- 'crypto', 'gold', 'forex', 'cash', 'stock'
  amount numeric not null,
  buy_price numeric not null,
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bật Row Level Security (RLS)
alter table public.portfolio_assets enable row level security;

-- 3. Tạo chính sách RLS: Người dùng chỉ được xem và sửa danh mục của chính họ
create policy "Users can manage own portfolio assets"
  on public.portfolio_assets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
