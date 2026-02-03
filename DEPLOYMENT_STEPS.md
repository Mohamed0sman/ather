# 🚀 خطوات النشر على GitHub و Vercel

## الخطوة 1: فتح Terminal

افتح Terminal جديد (Ctrl+Alt+T) ونفذ الأوامر التالية:

```bash
# الانتقال لمجلد المشروع
cd /home/os/Documents/Ather_db/ather

# إنشاء ملف البيئة
cp .env.example .env.local
```

## الخطوة 2: رفع على GitHub

```bash
# تهيئة Git
git init
git add .
git commit -m "Initial commit - Ather Project Management App"

# ربط بالمستودع
git remote add origin https://github.com/Mohamed0sman/ather.git

# الرفع
git branch -M main
git push -u origin main
```

## الخطوة 3: النشر على Vercel

### الطريقة الأولى (الـ Terminal):
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel --yes
```

### الطريقة الثانية (المتصفح):
1. اذهب لموقع: https://vercel.com
2. اضغط "Add New Project"
3. اختر المستودع `ather` من GitHub
4. اضغط "Deploy"

## الخطوة 4: إعداد Supabase

1. اذهب لـ: https://supabase.com
2. أنشئ مشروع جديد
3. اذهب لـ Settings → API
4. انسخ URL و anon key
5. أضفهم لملف `.env.local`

## ملاحظات مهمة:

⚠️ **يجب إنشاء ملف `.env.local` قبل النشر!**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## بعد النشر:

- 🌐 **رابط الموقع**: سيتم إنشاؤه بعد النشر
- 📁 **GitHub**: https://github.com/Mohamed0sman/ather
- 🔧 **Supabase**: قاعدة البيانات والتخزين
