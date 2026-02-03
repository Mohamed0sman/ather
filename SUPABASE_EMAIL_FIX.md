# إصلاح مشكلة تأكيد البريد الإلكتروني في Supabase

## المشكلة
```
Account creation requires an email confirmation
```

## الحل 1: تعطيل تأكيد البريد الإلكتروني (للتجربة)

### الخطوات:
1. اذهب إلى لوحة تحكم Supabase: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **Authentication** ← **Providers** ← **Email**
4. ابحث عن **"Confirm email"** أو **"Require email confirmation"**
5. **أزل علامة الصح** من هذا الخيار
6. احفظ التغييرات

## الحل 2: تفعيل إرسال البريد الإلكتروني

### باستخدام Resend (مجاني):
1. اذهب إلى: https://resend.com
2. أنشئ حساب واحصل على API Key
3. في Supabase: **Authentication** ← **Email Templates**
4. أضف Resend API Key

### في Supabase Dashboard:
1. اذهب إلى **Settings** ← **Email**
2. فعّل **Enable email provider**
3. أو استخدم SMTP:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: your-resend-api-key
```

## الحل 3: للتجربة المحلية - تجاوز التأكيد

إذا كنت تريد تجاوز تأكيد البريد الإلكتروني للتجربة، عدّل `utils/auth.ts`:

```typescript
const { data, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
    // أضف هذا السطر لتعطيل التأكيد:
    // emailConfirm: false
  },
});
```

**ملاحظة:** الخيار `emailConfirm` لا يعمل مع جميع إعدادات Supabase.

## الإعداد الصحيح للـ Auth في Supabase:

### Authentication → Providers → Email:
- ✅ Enable Email provider
- ⬜ Confirm email (أزل الصح للتجربة)
- ⬜ Secure your site (إذا لم يكن لديك نطاق)
- ✅ Autoconfirm sessions

### Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-production-domain.com/auth/callback`

## بعد التعديل:
1. احفظ الإعدادات
2. افتح التطبيق من جديد
3. أنشئ حساب جديد
4. يجب أن يعمل الآن!
