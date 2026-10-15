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
    // 'smtp': gerçek gönderim. 'log': SMTP yerine log_dosyasi'na yazar (yalnız deneme için).
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

    // IP başına: pencere_sn saniyede en çok adet gönderim. dizin null ise sistem geçici dizini kullanılır.
    'hiz_siniri' => ['adet' => 5, 'pencere_sn' => 600, 'dizin' => null],
    'hiz_tuzu' => 'DEGISTIR-rastgele-bir-dize',

    // Form sayfası açıldıktan en az bu kadar ms sonra gönderim kabul edilir; daha hızlısı bot sayılır.
    'min_sure_ms' => 3000,
];
