<?php

declare(strict_types=1);

/**
 * Hanedan Pilav form yapılandırması.
 * Bu dosyanın kopyası sunucuda WEB KÖKÜNÜN DIŞINA, public_html'in bir üst dizinine
 * "hanedan-config.php" adıyla konur (ör. /var/www/vhosts/ALANADI/hanedan-config.php).
 * Başka bir yol için sunucuda HANEDAN_CONFIG ortam değişkeni tanımlanabilir.
 * Gerçek şifreler repoya girmez.
 */
return [
    // 'smtp': gerçek gönderim. 'log': SMTP yerine log_dosyasi'na yazar.
    // 'log' YALNIZ TEST İÇİNDİR: formdaki kişisel verilerin tamamını (ad, telefon, e-posta, mesaj)
    // düz metin dosyaya yazar. Canlıda asla kullanılmaz; denemeden sonra log dosyası silinir.
    'transport' => 'smtp',
    'log_dosyasi' => '/tmp/hanedan-posta.log',

    'smtp' => [
        'host' => 'mail.ornek-alan-adi.com',
        'port' => 587,
        'kullanici' => 'form@ornek-alan-adi.com',
        'sifre' => 'DEGISTIR',
        'guvenlik' => 'tls', // 'tls' (587, STARTTLS), 'ssl' (465) veya '' (şifresiz, önerilmez)
    ],

    // Gönderen adresi SMTP hesabının alan adında olmalıdır (SPF/DKIM). Kullanıcı e-postası Reply-To olur.
    'gonderen' => ['eposta' => 'form@ornek-alan-adi.com', 'ad' => 'Hanedan Pilav Web'],

    'alicilar' => [
        'iletisim' => ['info@ornek-alan-adi.com'],
        'bayilik' => ['bayilik@ornek-alan-adi.com'],
    ],

    // Origin/Referer ana makine adları (şema ve port yazılmaz).
    'izinli_originler' => ['ornek-alan-adi.com', 'www.ornek-alan-adi.com'],

    // IP başına: pencere_sn saniyede en çok adet GEÇERLİ gönderim (hatalı gönderimler sayılmaz).
    // IPv6 adresleri /64 önekine göre gruplanır. IP düz yazılmaz, hiz_tuzu ile HMAC özeti dosya adı olur;
    // özet dosyası son kabul edilen gönderimden pencere_sn sonra, bir sonraki form isteğinde silinir.
    'hiz_siniri' => ['adet' => 5, 'pencere_sn' => 600],

    // Hız sınırı özet dosyalarının dizini. Web kökünün DIŞINDA olmalı (ör. /var/www/vhosts/ALANADI/hanedan-hiz).
    // null ise sistem geçici dizini kullanılır. Dizin yazılamazsa form çalışmayı sürdürür, sınır uygulanmaz.
    'hiz_dizini' => null,

    // Zorunlu: uzun, rastgele bir dize (ör. `openssl rand -hex 32` çıktısı). Boş bırakılır ya da
    // "DEGISTIR" içerirse form 500 döner.
    'hiz_tuzu' => 'DEGISTIR-rastgele-bir-dize',

    // Sunucunun önünde CDN ya da ters vekil varsa onun IP/CIDR listesi (ör. ['10.0.0.0/8', '2001:db8::/32']).
    // Yalnız REMOTE_ADDR bu listedeyse X-Forwarded-For okunur. Vekil yoksa boş kalır; başlık yok sayılır.
    'guvenilir_vekiller' => [],

    // Sayfa açılışından (istemci içi geçişte form açılışından) en az bu kadar ms sonra gönderim kabul edilir.
    // Daha hızlısı görünür bir hata alır ve yeniden deneyebilir. JS'siz gönderimde bu denetim yoktur.
    'min_sure_ms' => 2000,
];
