<?php

declare(strict_types=1);

// Hata ayrıntısı (dosya yolu, yığın) yanıta asla yazılmaz; yalnız sunucu günlüğüne gider.
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');

function hanedanSunucuHatasi(string $kod): never
{
    error_log('hanedan-form: ' . $kod);
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo '{"ok":false,"hata":"sunucu"}';
    exit;
}

if (!extension_loaded('mbstring') || !extension_loaded('openssl')) {
    hanedanSunucuHatasi('eklenti_eksik');
}

try {
    require __DIR__ . '/src/FormIslem.php';

    $yapilandirmaYolu = (string) getenv('HANEDAN_CONFIG');
    if ($yapilandirmaYolu === '') {
        // Yapılandırma web kökünün dışında durur: public_html'in bir üst dizini.
        $yapilandirmaYolu = dirname((string) ($_SERVER['DOCUMENT_ROOT'] ?? __DIR__), 1) . '/hanedan-config.php';
    }

    $cfg = is_file($yapilandirmaYolu) ? require $yapilandirmaYolu : null;
    if (!is_array($cfg)) {
        hanedanSunucuHatasi('yapilandirma_yok');
    }

    $sonuc = FormIslem::isle($_SERVER, $_POST, $cfg);
} catch (Throwable $e) {
    // İstisna metni yol ya da kişisel veri içerebilir: yalnız sınıf adı günlüğe gider.
    hanedanSunucuHatasi('beklenmeyen ' . get_class($e));
}

http_response_code($sonuc['kod']);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
foreach ($sonuc['basliklar'] as $baslik) {
    header($baslik);
}
if ($sonuc['konum'] !== null) {
    header('Location: ' . $sonuc['konum']);
} elseif ($sonuc['json'] !== null) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($sonuc['json'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
