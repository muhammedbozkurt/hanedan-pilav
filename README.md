# Hanedan Pilav

hanedanpilav.com kurumsal sitesinin yenilenmiş sürümü. Türkçe ve İngilizce, tamamen statik çıktı.

## Stack

- React Router v7 (framework mode, `ssr: false`, tüm rotalar prerender) + Vite + TypeScript (strict)
- Stil: `app/styles/tokens.css` (tasarım token'ları), `app/styles/global.css` (taban), bileşenlerde CSS Modules. Tailwind yok.
- Fontlar: `@fontsource-variable` paketleri (Rokkitt, Plus Jakarta Sans; latin + latin-ext), kendi alan adından sunulur.
- İkonlar: `@phosphor-icons/react` (bold), WhatsApp glifi Simple Icons (CC0).
- Analitik, çerez ve üçüncü taraf istek yok.

## Kurulum

```bash
npm ci
npx playwright install chromium   # e2e testleri için bir kez
npm run dev                       # http://localhost:8780
```

Node 22.18 veya üstü gerekir (betikler `.ts` dosyalarını doğrudan çalıştırır).

## Scriptler

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu (8780) |
| `npm run build` | Statik çıktıyı `build/client` altına üretir |
| `npm run typecheck` | Rota tipleri + `tsc --noEmit` + CSS Modules sınıf denetimi |
| `npm run check:metin` | Uzun/orta tire ve yasaklı kelime taraması |
| `npm run check:rotalar` | Sayfa tablosu, routes.ts, prerender listesi ve build çıktısı tutarlılığı |
| `npm run test:e2e` | Playwright, `build/client` çıktısına karşı (8781) |
| `npm run serve` | `build/client` çıktısını yerelde servis eder (8781) |
| `npm run verify` | Hepsini sırayla koşar; CI aynı komutu çalıştırır |

## Klasör yapısı

```
app/
  root.tsx            kök yerleşim, fontlar, hata sınırı
  routes.ts           rota yapılandırması (TR + EN, sayfa tablosundan üretilir)
  routes/             sayfa modülleri (her modül iki dilde kullanılır)
  components/         Header, Footer, WhatsAppFab, LangSwitch, Gorsel, Buton, SayfaBasligi...
  content/            site.ts, bayiler.ts, galeri.ts (tek içerik kaynağı)
  i18n/               tr.ts (tip kaynağı), en.ts, useLang / useT / usePaths
  lib/                rotalar.ts (sayfa tablosu), seo.ts, iletisim.ts
  styles/             tokens.css, global.css, fonts.css
public/               img/ (logo, favicon, og görseli), brand/ (orijinal logo)
scripts/              kapı betikleri ve yerel statik sunucu
tests/e2e/            Playwright testleri
```

## Yeni sayfa veya bayi eklemek

- Sayfa: `app/lib/rotalar.ts` içindeki `SAYFALAR` tablosuna TR ve EN yolu ile modülü ekleyin, `app/i18n/tr.ts` ve `en.ts` sözlüklerine metinleri yazın. Prerender listesi ve dil seçici tablodan beslenir.
- Bayi: `app/content/bayiler.ts` dosyasına ekleyin; detay sayfaları iki dilde otomatik üretilir.

## Yayın

Çıktı `build/client` klasörüdür; Plesk (LiteSpeed, PHP 8.2) paylaşımlı barındırmaya FTP ile yüklenir, Node sunucusu gerekmez. Her yol `yol/index.html` olarak üretilir. Sunucu tarafında `/kurumsal` isteğinin yönlendirme olmadan `/kurumsal/index.html` dosyasını döndürmesi ve bilinmeyen yolların `404/index.html` (EN için `en/404/index.html`) ile 404 kodu vermesi gerekir; `.htaccess` ayarı yayın aşamasında eklenecek.
