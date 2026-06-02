# Çağrı Merkezi Analizi (Call Center Analysis)

Çağrı merkezi kayıtlarını analiz etmek için Türkçe bir web uygulaması.
Ses dosyası yükle → otomatik Türkçe deşifre + yapılandırılmış analiz (Gemini) → filtrelenebilir panel.

## Teknolojiler
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS — Inter yazı tipiyle modern, açık (light) tema
- Supabase (Postgres, Auth, Storage, Realtime)
- Google Vertex AI — `gemini-2.5-flash-lite` (ses → deşifre + alan çıkarımı, tek çağrı)

## Kurulum

### 1. Bağımlılıklar
```bash
npm install
```

### 2. Supabase
- https://supabase.com adresinde bir proje oluşturun.
- **SQL editor**'de `supabase/migrations/` altındaki dosyaları sırayla çalıştırın
  (`0001_init.sql`, `0002_serial_processing.sql`, `0003_allow_authed_delete.sql`).
- **Authentication → Users → Add user** ile bir kullanıcı oluşturun (e-posta + parola).
  Bu, giriş bilgileriniz olacaktır.

> Not: Bu sürüm orijinal projeden farklı, yeni bir Supabase veritabanına bağlanır.
> Aşağıdaki `NEXT_PUBLIC_SUPABASE_*` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini
> **yeni** projenizin değerleriyle doldurun.

### 3. Ortam değişkenleri
Kopyalayıp doldurun:
```bash
cp .env.local.example .env.local
```
- `NEXT_PUBLIC_SUPABASE_URL` — Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings → API → anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → service_role key (yalnızca sunucu)
- Vertex AI kimlik bilgileri — yerelde `GOOGLE_APPLICATION_CREDENTIALS`,
  üretimde (Vercel) `GOOGLE_CREDENTIALS_JSON`; ayrıca `GOOGLE_CLOUD_PROJECT` ve `GOOGLE_CLOUD_LOCATION`
- `NEXT_PUBLIC_APP_URL` — geliştirme için `http://localhost:3000`

### 4. Çalıştırma
```bash
npm run dev
```
http://localhost:3000 adresini açın → giriş yapın → yüklemeye başlayın.

## Nasıl çalışır
1. **Yükleme** (`app/dashboard/upload`): bir server action dosyayı Supabase Storage'a kaydeder ve
   `status='pending'` ile bir `calls` satırı ekler, ardından beklemeden seri işleyiciyi tetikler.
2. **İşleme** (`lib/process.ts` + `app/api/process/*`):
   - Ses dosyasını imzalı bir URL ile indirir.
   - Sesi Gemini'ye gönderir → tek çağrıda Türkçe deşifre + yapılandırılmış alanlar.
   - Satırı her adımda günceller (`transcribing` → `analyzing` → `done`).
3. **Panel** Supabase Realtime'a abone olur; durum değişiklikleri anlık görünür.

## Notlar / sınırlar
- Sesler satır içi (base64) gönderilir; pratikte ~20 MB istek boyutuna kadar sorunsuzdur.
- İşleyici Next.js sunucusu içinde çalışır (en fazla 5 dakika). Çok uzun çağrılar veya yoğun eşzamanlılık
  için işlemeyi bir kuyruğa / Supabase Edge Function'a taşıyın.
- Geçici Gemini hataları (503/429/zaman aşımı) için satır `pending`'de kalır ve `/api/retry-pending`
  cron'u (her dakika) tekrar dener.
- Tam metin arama Postgres `simple` sözlüğünü kullanır (Türkçe köklemesi yoktur, ancak alt dize /
  kelime eşleştirmesi sorunsuz çalışır).
