# Excel Mapper

ابزار رایگان تبدیل و نگاشت ستون‌های فایل اکسل (.xlsx).

## ویژگی‌ها

- آپلود فایل ورودی و قالب
- نگاشت ستون‌ها
- پیش‌نمایش و دانلود خروجی
- ذخیره نگاشت‌ها (نیاز به ورود)
- رابط کاربری فارسی (RTL)

## توسعه محلی

```bash
npm install
cp .env.example .env.local
# مقدار VITE_SUPABASE_ANON_KEY را از داشبورد Supabase بگذارید
npm run dev
```

## استقرار روی Netlify

1. ریپو را به Netlify وصل کنید (یا drag & drop پوشه `dist` بعد از build).
2. در Environment variables این دو مقدار را تنظیم کنید:
   - `VITE_SUPABASE_URL` = 
   - `VITE_SUPABASE_ANON_KEY` = 
3. Build command: `npm run build`
4. Publish directory: `dist`
