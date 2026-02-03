# دليل نشر مشروع Ather

## متطلبات النشر

### 1. تثبيت المتطلبات
تأكد من تثبيت التالي على جهازك:
- **Node.js** (الإصدار 18 أو أحدث) - [تحميل من هنا](https://nodejs.org/)
- **Git** - [تحميل من هنا](https://git-scm.com/)
- **GitHub Account** - [من هنا](https://github.com)

### 2. إنشاء ملف البيئة (.env.local)

```bash
# نسخ ملف المثال
cp .env.example .env.local
```

املأ الملف بالمتغيرات التالية:
```env
# Supabase (مطلوب)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage

# Resend (اختياري - لإرسال البريد)
RESEND_API_KEY=re_xxxxxxxx

# رابط التطبيق (لـ OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## خطوات النشر المحلي

### 1. فتح المشروع في Terminal
```bash
cd /home/os/Documents/Ather_db/ather
```

### 2. تثبيت المكتبات
```bash
npm install
```

### 3. تشغيل المشروع محلياً
```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000

## خطوات الرفع على GitHub

### 1. إنشاء Repository جديد
1. اذهب إلى: https://github.com/new
2. اسم Repository: `ather`
3. اختر: Public أو Private
4. لا تضف README الآن

### 2. رفع الكود
```bash
# تهيئة Git إذا لم يكن مهيأ
git init

# إضافة الملفات
git add .

# إنشاء commit
git commit -m "Initial commit - Ather Project Management App"

# ربط بالمستودع البعيد
git remote add origin https://github.com/Mohamed0sman/ather.git

# رفع الكود
git branch -M main
git push -u origin main
```

## إعداد Supabase

### 1. إنشاء مشروع جديد
1. اذهب إلى: https://supabase.com
2. Create New Project
3. املأ البيانات المطلوبة

### 2. إعدادات Authentication
1. Authentication → Settings
2. Enable Email Auth
3. Configure Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

### 3. نسخ المفاتيح
1. Settings → API
2. نسخ Project URL
3. نسخ anon public key

## نشر على Vercel (موصى به)

### 1. ربط بـ Vercel
```bash
npm i -g vercel
vercel
```

### أو من خلال الموقع:
1. اذهب إلى: https://vercel.com
2. Add New Project
3. اختر Repository من GitHub
4. اضغط Deploy

### 2. إضافة Environment Variables في Vercel
في إعدادات المشروع على Vercel، أضف:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_STORAGE_URL
- RESEND_API_KEY (اختياري)

## بعد النشر

### اختبار تسجيل الدخول
1. افتح التطبيق
2. أنشئ حساب جديد
3. تحقق من استلام البريد (إذا فعلت Email Confirmation)
4. سجل دخولك

## المشاكل الشائعة وحلولها

### "Cannot find module 'react'"
```bash
npm install
rm -rf node_modules
npm install
```

### مشاكل Supabase
- تأكد من صحة Project URL
- تأكد من تفعيل RLS policies
- تحقق من Redirect URLs

### مشاكل OAuth
- تأكد من إضافة Redirect URLs في إعدادات Provider
- للمشاكل مع Google: تحقق من OAuth consent screen

## هيكل المشروع

```
ather/
├── app/                    # Next.js App Router
│   ├── login/             # صفحة تسجيل الدخول
│   ├── create-account/    # صفحة إنشاء حساب
│   ├── projects/          # إدارة المشاريع
│   └── ...
├── components/            # مكونات React
├── utils/                 # أدوات مساعدة
├── lib/                   # مكتبات
└── supabase/              # إعدادات قاعدة البيانات
```

## الميزات المحسنة

✅ واجهة تسجيل دخول محسنة
✅ قوة كلمة المرور مع مؤشر بصري
✅ إنشاء تلقائي لملفات المستخدمين
✅ تصميم أكثر احترافية
✅ تأثيرات بصرية جميلة
✅ تحسين تجربة المستخدم

---
تم إعداد هذا الدليل لمشروع Ather - نظام إدارة المشاريع
