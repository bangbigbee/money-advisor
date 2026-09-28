# MoneyAdvisor 💰📈

Nền tảng quản lý tài chính cá nhân, theo dõi danh mục đầu tư và giám sát biến động thị trường (Crypto, Vàng SJC/PNJ, Ngoại tệ Forex) thời gian thực.

---

## 🚀 Tính năng nổi bật

- **Quản lý Tài sản & Danh mục (Portfolio Tracker)**: Thống kê tổng tài sản, tỷ lệ phân bổ danh mục (Crypto, Vàng, Tiết kiệm, Tiền mặt) cùng biểu đồ phân bổ trực quan.
- **Thị trường Tiền mã hóa (Live Crypto Market)**: Tích hợp CoinGecko API lấy giá thời gian thực, biến động 24h, vốn hóa, khối lượng giao dịch của các top coins (BTC, ETH, SOL, BNB, XRP,...).
- **Thị trường Vàng & Ngoại hối**: Cập nhật giá vàng SJC, PNJ, Vàng thế giới (Spot Gold XAU/USD) và tỷ giá các đồng tiền chủ chốt (USD, EUR, JPY).
- **Biểu đồ Kỹ thuật Chuyên sâu (TradingView Widget)**: Tích hợp biểu đồ TradingView đa khung thời gian, chuyển đổi nhanh giữa Bitcoin, Ethereum, Vàng và chỉ số USD.
- **Sẵn sàng tích hợp Supabase**: Cấu trúc database sẵn sàng cho xác thực người dùng (Auth) và lưu trữ lịch sử giao dịch.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Biểu đồ**: [Recharts](https://recharts.org/) & [TradingView Advanced Charts](https://www.tradingview.com/)
- **Backend / Database**: [Supabase](https://supabase.com/)
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

## 🔑 Cấu hình Biến môi trường (.env)

Tạo file `.env.local` từ mẫu sau nếu cần kết nối Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🌐 Hướng dẫn Đẩy code lên GitHub

1. Tạo repository mới trên GitHub (ví dụ: `MoneyAdvisor`).
2. Mở Terminal tại thư mục này và chạy:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/MoneyAdvisor.git
git branch -M main
git push -u origin main
```
