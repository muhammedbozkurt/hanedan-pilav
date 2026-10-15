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
| `npm run check:yayin` | Canlı yayın kapısı: eksik yasal bilgi, doğrulanmamış WhatsApp, e-posta yoksa hata verir (verify'a dahil değil) |
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
  lib/                rotalar.ts (sayfa tablosu), seo.ts, jsonld.ts, iletisim.ts
  styles/             tokens.css, global.css, fonts.css
public/               img/ (logo, favicon, og görseli), brand/ (orijinal logo)
scripts/              kapı betikleri ve yerel statik sunucu
tests/e2e/            Playwright testleri
```

## Yeni sayfa veya bayi eklemek

- Sayfa: `app/lib/rotalar.ts` içindeki `SAYFALAR` tablosuna TR ve EN yolu ile modülü ekleyin, `app/i18n/tr.ts` ve `en.ts` sözlüklerine metinleri yazın. Prerender listesi ve dil seçici tablodan beslenir.
- Bayi: `app/content/bayiler.ts` dosyasına ekleyin; detay sayfaları iki dilde otomatik üretilir.

## Yayın

Çıktı `build/client` klasörüdür; Plesk (LiteSpeed, PHP 8.2) paylaşımlı barındırmaya FTPS ile yüklenir, Node sunucusu gerekmez. Her yol `yol/index.html` olarak üretilir.

### Build ortamı

`SITE_ORTAM` değişkeni build sonrası adımları (`postbuild`) belirler:

- `staging`: `robots.txt` her şeyi kapatır (`Disallow: /`), `.htaccess` tüm yanıtlara `X-Robots-Tag: noindex, nofollow` ekler.
- `production` (varsayılan): `robots.txt` izinlidir ve `sitemap.xml` adresini bildirir.

`postbuild` ayrıca `sitemap.xml` üretir (404 hariç, hreflang alternatifleriyle) ve `.htaccess` şablonundaki CSP'ye tüm HTML'lerdeki satır içi betiklerin sha256 hash'lerini yazar. Sourcemap üretilmez. Yerelde `SITE_ORTAM=staging npm run build` ile staging çıktısı alınır.

### Sunucu yapısı ve gizli yapılandırma

- Web kökü (`httpdocs` veya alt alan adının kökü) `build/client` içeriğini alır. Sunucuda `.htaccess` kökte, `en/`, `en/locations/` ve `bayilerimiz/` altında olmalıdır (son ikisi bilinmeyen bayi adreslerini `ErrorDocument` ile 404 koduyla yanıtlar: TR `__spa-fallback.html`, EN `postbuild`in ürettiği `en/locations/__bilinmeyen.html`).
- `hanedan-config.php` (örnek: `deploy/hanedan-config.example.php`) web kökünün bir üst dizinine elle konur; FTP dağıtımı web kökünün dışına dokunmaz ve bu dosyayı yüklemez.
- FTP hesabının kök dizini web kökünün üstünü de görebiliyorsa `FTP_DIR_*` değişkeni yalnız web kökünü göstermelidir.

### GitHub ayarları

| Tür | Ad | Açıklama |
| --- | --- | --- |
| Secret | `FTP_SERVER` | FTP sunucu adı (FTPS) |
| Secret | `FTP_USERNAME` | FTP kullanıcısı |
| Secret | `FTP_PASSWORD` | FTP şifresi |
| Variable | `FTP_DIR_STAGING` | Test alt alan adının web kökü, sonu `/` ile biter (ör. `/test.hanedanpilav.com/httpdocs/`) |
| Variable | `FTP_DIR_PRODUCTION` | Canlı web kökü, sonu `/` ile biter (ör. `/httpdocs/`) |
| Environment | `staging` | Onay kuralı gerekmez |
| Environment | `production` | "Required reviewers" ile onay kuralı eklenir |

`.github/workflows/deploy.yml`: `main`'e push'ta `verify` sonra staging'e otomatik yükleme. Production yalnız Actions sekmesinden "Deploy" iş akışı elle çalıştırılınca (`main` dalında) ve `production` environment onayından sonra yüklenir; önce `npm run check:yayin` koşar. Dağıtım eylemi sunucuda `.ftp-deploy-sync-state.json` tutar; `.htaccess` nokta dosyalarını dışarıya kapattığı için erişilemez.

Güvenlik önerileri:

- Sırlar (`FTP_*`) repo düzeyinde değil, `staging` ve `production` environment düzeyinde tutulur; production sırları staging işine görünmez.
- Ortam başına ayrı FTP hesabı açılır ve her hesap yalnız kendi web köküne kısıtlanır (Plesk'te hesabın ana dizini olarak ayarlanır).
- `production` environment'ında "Required reviewers" zorunludur ve "Deployment branches" yalnız `main` ile sınırlanır.
- Deploy iş akışı `FTP_DIR_STAGING`/`FTP_DIR_PRODUCTION` boşsa, `/` ise veya ikisi aynıysa yüklemeden önce durur. Production işi yalnız `refs/heads/main` dalından çalışır.
- İş akışlarındaki tüm eylemler tam commit SHA'sına sabitlidir (yanında etiket yorumu); güncellerken SHA `git ls-remote` ile doğrulanır. Yetki varsayılanı `contents: read`'dir.
- `verify` işi PHP 8.2 (mbstring) ile `php tests/php/form-test.php` koşar.
- `npm run check:yayin` boş, `null` (yalnız `kep` ve `mersisNo` hariç), yer tutuculu (`[...]`, `todo`, `DEGISTIR`, `TBD`) veya EN karşılığı eksik yasal alanlarda hata verir.

### Plesk: test ortamı

1. Alan adı altında test için alt alan adı oluşturun (ör. `test.hanedanpilav.com`), PHP 8.2 seçin, SSL sertifikası (Let's Encrypt) ekleyin.
2. Alt alan adı için "Parola korumalı dizinler" ile web kökünü kullanıcı adı/şifre ile koruyun (arama motorlarına ek olarak insan erişimini de kapatır).
3. `hanedan-config.php` dosyasını alt alan adı web kökünün bir üstüne koyun (ör. `.../test.hanedanpilav.com/hanedan-config.php`, web kökü `httpdocs` ise bir üst dizin).
4. `FTP_DIR_STAGING` değişkenini bu alt alan adının web köküne ayarlayın, `main`'e push edin.
5. `scripts/yayin-kontrol.sh https://<test-alt-alan-adi> staging` koşun (şifre koruması için `KONTROL_KULLANICI=kullanici:sifre` verin).

### Canlıya geçiş kontrol listesi

- [ ] `npm run check:yayin` hatasız: yasal künye bilgileri (`app/components/yasal/bilgiler.ts`, `app/content/site.ts`), kurumsal e-posta ve doğrulanmış WhatsApp numarası dolu.
- [ ] Test ortamında `scripts/yayin-kontrol.sh` hatasız, tarayıcıda konsolda CSP ihlali yok.
- [ ] Mevcut WordPress sitesinin dosya ve veritabanı yedeği alındı (elle, otomatikleştirilmez).
- [ ] Canlı `httpdocs` içeriği yedekten sonra temizlendi (elle; `hanedan-config.php` web kökünün üstünde kalır).
- [ ] `hanedan-config.php` canlı hesapta web kökünün bir üstünde, form e-posta ayarları doğru.
- [ ] Plesk zamanlanmış görevi (aşağıdaki "IP özeti temizliği") kurulu ve çalışıyor; görev kurulduktan sonra `app/content/site.ts` içinde `ipTemizlikGorevi.kuruldu` true yapılır (`check:yayin` bunu denetler); zorunludur, çünkü gizlilik metni özetin 10 dakikada bir silindiğini söyler.
- [ ] `FTP_DIR_PRODUCTION` ayarlı, `production` environment onay kuralı tanımlı.
- [ ] Actions sekmesinden "Deploy" elle çalıştırıldı ve onaylandı.
- [ ] `scripts/yayin-kontrol.sh https://www.hanedanpilav.com production` hatasız.
- [ ] Search Console'da `https://www.hanedanpilav.com/sitemap.xml` gönderildi.

### IP özeti temizliği (Plesk zamanlanmış görevi)

Hız sınırı özetleri, form betiğine gelen her istekte silinir. Trafik olmayan saatlerde de silinmeleri için Plesk > Zamanlanmış Görevler'de her 10 dakikada bir şu komut çalıştırılır:

```bash
curl -fsS -o /dev/null -w '' --max-time 20 https://www.hanedanpilav.com/api/form.php || true
```

Betik GET isteğine 405 döner (beklenen); `-f` bu yanıtı hata sayar, `|| true` görevin hata vermemesini sağlar. Temizlik 405 dönmeden önce yapılır. `pencere_sn` değişirse `app/content/site.ts` içindeki `yasal.ipSuresi` de güncellenir.

### Duman testi

```bash
scripts/yayin-kontrol.sh https://www.hanedanpilav.com production
scripts/yayin-kontrol.sh https://test.hanedanpilav.com staging
```

Betik yönlendirmeleri (http/https, apex/www, sondaki eğik çizgi, eski WordPress adresleri), 404 ve 410 kodlarını, güvenlik ve önbellek başlıklarını, robots/sitemap'i, kapalı dosyaları ve `/api/form.php` GET isteğinin 405 döndüğünü kontrol eder; hata varsa sıfırdan farklı kodla çıkar.

### .htaccess notları

`public/.htaccess` Apache 2.4 ve LiteSpeed uyumludur, her yönerge `IfModule` korumalıdır; yerelde çalıştırılamaz, ilk doğrulama staging'de yapılır. 404 için `<If>` yerine dizin başına `ErrorDocument` kullanılır: kökte `/404/index.html`, `public/en/.htaccess` içinde `/en/404/index.html`. CSP'deki betik hash'leri `postbuild` sırasında hesaplanır; sayfa veya bayi eklendikçe liste kendiliğinden güncellenir (başlık boyutu sunucu sınırının, genelde 8 KB, altında kalmalıdır).
