# إصلاح مشكلة تأكيد البريد الإلكتروني في Supabase

## المشكلة
```
Account creation requires an email confirmation
```

## الأسباب والحلول

### الحل 1: تعطيل تأكيد البريد الإلكتروني (للتجربة)

#### الخطوات:
1. اذهب إلى لوحة تحكم Supabase: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **Authentication** ← **Providers** ← **Email**
4. ابحث عن **"Confirm email"** أو **"Require email confirmation"**
5. **أزل علامة الصح** من هذا الخيار
6. احفظ التغييرات

---

### الحل 2: تفعيل إرسال البريد الإلكتروني باستخدام Brevo (مُوصى به)

Brevo يقدم **300 بريد مجاني يومياً** وأسهل في الإعداد من Resend.

#### 1. إنشاء حساب Brevo:
1. اذهب إلى: https://www.brevo.com
2. أنشئ حساب مجاني
3. اذهب إلى **SMTP & API** ← **SMTP**
4. أنشئ مفتاح SMTP جديد

#### 2. بيانات SMTP:
```
SMTP Server: smtp-relay.brevo.com
Port: 587
Login: your-email@yourdomain.com
Password: your-brevo-smtp-key
```

#### 3. إعداد في Supabase:
1. اذهب إلى **Settings** ← **Email**
2. فعّل **Enable custom SMTP**
3. املأ البيانات:
```
Host: smtp-relay.brevo.com
Port: 587
Username: your-brevo-email
Password: your-brevo-smtp-key
Sender Email: noreply@yourdomain.com
```

#### 4. أو استخدام API Key مباشرة:
```env
RESEND_API_KEY=your-brevo-api-key
```

---

### الحل 3: استخدام SendGrid (بديل ممتاز)

SendGrid يقدم **100 بريد مجاني يومياً**.

#### 1. إنشاء حساب:
1. اذهب إلى: https://sendgrid.com
2. أنشئ حساب مجاني
3. أنشئ API Key
4. تحقق من بريدك المرسل

#### 2. بيانات SMTP:
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
```

---

### الحل 4: استخدام Mailtrap (للتجربة فقط)

Mailtrap ممتاز للتجربة والتطوير.

#### بيانات الاختبار:
```
Host: smtp.mailtrap.io
Port: 2525
Username: your-mailtrap-username
Password: your-mailtrap-password
```

---

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

---

## متغيرات البيئة (.env.local):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage

# Email Service (أحد هذه الخيارات)
# Brevo (مُوصى به)
BREVO_API_KEY=your-brevo-api-key

# أو SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# أو Mailtrap (للتجربة)
MAILTRAP_USERNAME=your-mailtrap-username
MAILTRAP_PASSWORD=your-mailtrap-password

# رابط التطبيق
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## مقارنة الخدمات:

| الخدمة | المجاني | المزايا |
|-------|---------|---------|
| **Brevo** | 300 بريد/يوم | الأسهل +lots of features |
| **SendGrid** | 100 بريد/يوم | موثوق +وثائق ممتازة |
| **Mailtrap** | غير محدود (تجربة) | للتجربة فقط |
| **Resend** | 100 بريد/شهر | سريع +modern API |

---

## بعد التعديل:
1. احفظ الإعدادات
2. افتح التطبيق من جديد
3. أنشئ حساب جديد
4. يجب أن يعمل الآن! ✅
