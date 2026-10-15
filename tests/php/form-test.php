<?php

declare(strict_types=1);

require __DIR__ . '/../../public/api/src/FormIslem.php';

$gecen = 0;
$kalan = [];
function kontrol(string $ad, bool $kosul, string $ek = ''): void
{
    global $gecen, $kalan;
    if ($kosul) {
        $gecen++;
        echo "  ok   $ad\n";
    } else {
        $kalan[] = $ad;
        echo "  FAIL $ad $ek\n";
    }
}

$tmp = sys_get_temp_dir() . '/hanedan-form-test-' . bin2hex(random_bytes(4));
mkdir($tmp, 0700, true);
$log = $tmp . '/posta.log';

function yapilandirma(string $tmp, string $log, array $ek = []): array
{
    return array_replace_recursive([
        'transport' => 'log',
        'log_dosyasi' => $log,
        'gonderen' => ['eposta' => 'form@example.test', 'ad' => 'Test'],
        'alicilar' => ['iletisim' => ['info@example.test'], 'bayilik' => ['bayilik@example.test']],
        'izinli_originler' => ['example.test'],
        'hiz_siniri' => ['adet' => 5, 'pencere_sn' => 600],
        'hiz_dizini' => $tmp . '/hiz',
        'hiz_tuzu' => 'test-tuzu-test-tuzu-test-tuzu-test-tuzu',
        'min_sure_ms' => 2000,
    ], $ek);
}

$ipSayac = 0;
function sunucu(array $ek = []): array
{
    global $ipSayac;
    $ipSayac++;
    return array_replace([
        'REQUEST_METHOD' => 'POST',
        'HTTP_ORIGIN' => 'https://example.test',
        'HTTP_ACCEPT' => 'application/json',
        'REMOTE_ADDR' => '203.0.113.' . ($ipSayac % 250 + 1),
    ], $ek);
}

function gecerliIletisim(array $ek = []): array
{
    return array_replace([
        'form' => 'iletisim', 'lang' => 'tr', 'konu' => 'catering',
        'ad' => 'Ayşe Yılmaz', 'firma' => 'Örnek A.Ş.', 'telefon' => '0 (532) 123 45 67',
        'eposta' => 'ayse@example.test', 'mesaj' => "Merhaba,\n100 kişilik yemek istiyoruz.",
        'kurum_kodu' => '', 'gecen_ms' => '8000',
    ], $ek);
}

function gecerliBayilik(array $ek = []): array
{
    return array_replace([
        'form' => 'bayilik', 'lang' => 'en', 'ad' => 'Can Demir', 'telefon' => '+90 532 123 45 67',
        'eposta' => 'can@example.test', 'ilce' => 'Şişli', 'mevcut_isletme' => 'evet',
        'lokasyon' => 'Mecidiyeköy', 'mesaj' => 'Başvuru notu', 'kurum_kodu' => '', 'gecen_ms' => '9000',
    ], $ek);
}

function logSil(string $log): void
{
    if (is_file($log)) {
        unlink($log);
    }
}

function logOku(string $log): string
{
    return is_file($log) ? (string) file_get_contents($log) : '';
}

/** Posta kaydındaki "Etiket: değer" satırlarının etiketleri, sırasıyla. */
function etiketler(string $kayit): array
{
    preg_match_all('/^([^\n:]+): /m', $kayit, $e);
    return $e[1];
}

function hizDosyalari(string $dizin): array
{
    return glob($dizin . '/*.json') ?: [];
}

$cfg = yapilandirma($tmp, $log);

echo "Ortak doğrulama vakaları (tests/fixtures/dogrulama-vakalari.json)\n";
$liste = json_decode((string) file_get_contents(__DIR__ . '/../fixtures/dogrulama-vakalari.json'), true, 512, JSON_THROW_ON_ERROR);
kontrol('vaka listesi en az 25', count($liste['vakalar']) >= 25, (string) count($liste['vakalar']));
foreach ($liste['vakalar'] as $vaka) {
    $veri = $liste['temel'][$vaka['tur']];
    foreach ($vaka['degisiklik'] as $alan => $deger) {
        $veri[$alan] = is_array($deger) ? str_repeat($deger['tekrar'], $deger['adet']) : $deger;
    }
    [, $hatalar] = FormIslem::dogrula($vaka['tur'], $veri);
    $beklenen = $vaka['hatalar'];
    ksort($hatalar);
    ksort($beklenen);
    kontrol('sunucu: ' . $vaka['ad'], $hatalar === $beklenen, json_encode($hatalar, JSON_UNESCAPED_UNICODE));
}

echo "Doğrulama\n";
$s = FormIslem::isle(sunucu(), gecerliIletisim(['ad' => '', 'eposta' => '', 'mesaj' => '']), $cfg);
kontrol('eksik alan 422', $s['kod'] === 422 && ($s['json']['hata'] ?? '') === 'dogrulama');
kontrol('eksik alan kodlari', ($s['json']['alanlar']['ad'] ?? '') === 'bos' && ($s['json']['alanlar']['mesaj'] ?? '') === 'bos');
kontrol('eksik alan posta yazmadi', logOku($log) === '');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['telefon' => "0532\u{00A0}123\u{00A0}45\u{00A0}67"]), $cfg);
kontrol('NBSP telefon 200', $s['kod'] === 200, (string) json_encode($s['json']));
$s = FormIslem::isle(sunucu(), gecerliIletisim(['eposta' => 'ayşe@gmail.com']), $cfg);
kontrol('ASCII disi e-posta 422', $s['kod'] === 422 && ($s['json']['alanlar']['eposta'] ?? '') === 'gecersiz');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['ad' => ['dizi']]), $cfg);
kontrol('dizi deger 422', $s['kod'] === 422 && ($s['json']['alanlar']['ad'] ?? '') === 'bos');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['ad' => "Ali \xC3\x28"]), $cfg);
kontrol('bozuk UTF-8 422', $s['kod'] === 422 && ($s['json']['alanlar']['ad'] ?? '') === 'gecersiz');

[$v] = FormIslem::dogrula('bayilik', gecerliBayilik(['firma' => 'X Ltd', 'konu' => 'genel']));
kontrol('bayilik: formda olmayan alanlar donmez', !array_key_exists('firma', $v) && !array_key_exists('konu', $v));
[$v] = FormIslem::dogrula('iletisim', gecerliIletisim(['ilce' => 'Şişli', 'lokasyon' => 'x', 'mevcut_isletme' => 'evet']));
kontrol('iletisim: formda olmayan alanlar donmez', !array_key_exists('ilce', $v) && !array_key_exists('lokasyon', $v) && !array_key_exists('mevcut_isletme', $v));

echo "Bot tuzağı ve süre\n";
logSil($log);
$s = FormIslem::isle(sunucu(), gecerliIletisim(['kurum_kodu' => 'http://spam.example']), $cfg);
kontrol('honeypot sessiz basari', $s['kod'] === 200 && ($s['json']['ok'] ?? false) === true);
kontrol('honeypot posta yazmadi', logOku($log) === '');
$s = FormIslem::isle(sunucu(['HTTP_ACCEPT' => 'text/html']), gecerliIletisim(['kurum_kodu' => 'x']), $cfg);
kontrol('honeypot JSON olmayan 303 basari', $s['kod'] === 303 && $s['konum'] === '/iletisim?gonderildi=1#durum-gonderildi');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['gecen_ms' => '900']), $cfg);
kontrol('cok hizli: gorunur 422 cok_hizli', $s['kod'] === 422 && $s['json'] === ['ok' => false, 'hata' => 'cok_hizli'], (string) json_encode($s['json']));
kontrol('cok hizli posta yazmadi', logOku($log) === '');
$s = FormIslem::isle(sunucu(['HTTP_ACCEPT' => 'text/html']), gecerliIletisim(['gecen_ms' => '900', 'lang' => 'en']), $cfg);
kontrol('cok hizli JSON olmayan 303', $s['kod'] === 303 && $s['konum'] === '/en/contact?hata=cok_hizli#durum-hata-cok-hizli', (string) $s['konum']);
$s = FormIslem::isle(sunucu(), gecerliIletisim(['gecen_ms' => '900', 'kurum_kodu' => 'x']), $cfg);
kontrol('cok hizli + honeypot: sessiz basari', $s['kod'] === 200 && ($s['json']['ok'] ?? false) === true);

$s = FormIslem::isle(sunucu(), gecerliIletisim(['gecen_ms' => '2500']), $cfg);
kontrol('2.5 sn sonra gonderen kullanici: 200 ve posta gitti', $s['kod'] === 200 && str_contains(logOku($log), 'Ayşe Yılmaz'));
logSil($log);
$jsSiz = gecerliIletisim();
unset($jsSiz['gecen_ms']);
$s = FormIslem::isle(sunucu(['HTTP_ACCEPT' => 'text/html']), $jsSiz, $cfg);
kontrol('JS siz (gecen_ms yok): sure denetimi atlanir', $s['kod'] === 303 && $s['konum'] === '/iletisim?gonderildi=1#durum-gonderildi' && logOku($log) !== '');

foreach (['ad' => "Ali\r\nBcc: kurban@example.test", 'telefon' => "0532 123 45 67\nX: y", 'eposta' => "a@example.test\r\nBcc: b@example.test", 'firma' => "Firma\rBcc: x"] as $alan => $deger) {
    logSil($log);
    $s = FormIslem::isle(sunucu(), gecerliIletisim([$alan => $deger]), $cfg);
    kontrol("CRLF reddi: $alan", $s['kod'] === 422 && ($s['json']['alanlar'][$alan] ?? '') === 'gecersiz' && logOku($log) === '');
}

echo "Geçerli istek ve e-posta alanları\n";
logSil($log);
$s = FormIslem::isle(sunucu(), gecerliIletisim(), $cfg);
$icerik = logOku($log);
kontrol('gecerli iletisim 200', $s['kod'] === 200 && $s['json'] === ['ok' => true]);
kontrol('log: alici ve yanit', str_contains($icerik, 'Kime: info@example.test') && str_contains($icerik, 'Yanit: ayse@example.test'));
kontrol('log: konu ve govde', str_contains($icerik, 'Konu: [Hanedan Pilav] İletişim (Toplu yemek ve organizasyon): Ayşe Yılmaz') && str_contains($icerik, '100 kişilik yemek istiyoruz.'));
kontrol(
    'iletisim e-postasi yalniz beyan edilen alanlar',
    etiketler($icerik) === ['Kimden', 'Kime', 'Yanit', 'Konu', 'Form', 'Dil', 'Zaman', 'Konu', 'Ad soyad', 'Firma', 'Telefon', 'E-posta'],
    (string) json_encode(etiketler($icerik), JSON_UNESCAPED_UNICODE)
);

logSil($log);
$s = FormIslem::isle(sunucu(), gecerliBayilik(['firma' => 'X Ltd', 'konu' => 'genel']), $cfg);
$icerik = logOku($log);
kontrol('gecerli bayilik 200', $s['kod'] === 200);
kontrol('bayilik log: alici ve ilce', str_contains($icerik, 'Kime: bayilik@example.test') && str_contains($icerik, 'İlçe: Şişli') && str_contains($icerik, 'Mevcut işletme: Evet'));
kontrol('bayilik: formda olmayan firma postaya girmez', !str_contains($icerik, 'X Ltd') && !str_contains($icerik, 'Firma'));
kontrol(
    'bayilik e-postasi yalniz beyan edilen alanlar',
    etiketler($icerik) === ['Kimden', 'Kime', 'Yanit', 'Konu', 'Form', 'Dil', 'Zaman', 'Ad soyad', 'Telefon', 'E-posta', 'İlçe', 'Mevcut işletme', 'Düşünülen lokasyon'],
    (string) json_encode(etiketler($icerik), JSON_UNESCAPED_UNICODE)
);
kontrol('bayilik mesaji postada', str_contains($icerik, "Mesaj:\nBaşvuru notu"));

echo "JS'siz dönüşler (303 ve çapalar)\n";
$html = ['HTTP_ACCEPT' => 'text/html'];
$s = FormIslem::isle(sunucu($html + ['HTTP_ORIGIN' => '', 'HTTP_REFERER' => 'https://example.test/en/contact']), gecerliIletisim(['lang' => 'en']), $cfg);
kontrol('basari 303', $s['kod'] === 303 && $s['konum'] === '/en/contact?gonderildi=1#durum-gonderildi');
$s = FormIslem::isle(sunucu($html), gecerliIletisim(['eposta' => 'x']), $cfg);
kontrol('dogrulama 303', $s['kod'] === 303 && $s['konum'] === '/iletisim?hata=dogrulama#durum-hata-dogrulama');
$s = FormIslem::isle(sunucu($html + ['HTTP_ORIGIN' => 'https://kotu.example']), gecerliBayilik(['lang' => 'tr']), $cfg);
kontrol('origin 303', $s['kod'] === 303 && $s['konum'] === '/bayilerimiz?hata=origin#durum-hata-origin' && $s['json'] === null);
$bos = yapilandirma($tmp, $log);
$bos['alicilar']['iletisim'] = [];
$s = FormIslem::isle(sunucu($html), gecerliIletisim(), $bos);
kontrol('sunucu 303', $s['kod'] === 303 && $s['konum'] === '/iletisim?hata=sunucu#durum-hata-sunucu');
$ipHtml = '198.51.100.200';
for ($i = 0; $i < 5; $i++) {
    FormIslem::isle(sunucu($html + ['REMOTE_ADDR' => $ipHtml]), gecerliIletisim(), $cfg);
}
$s = FormIslem::isle(sunucu($html + ['REMOTE_ADDR' => $ipHtml]), gecerliIletisim(['lang' => 'en']), $cfg);
kontrol('hiz 303', $s['kod'] === 303 && $s['konum'] === '/en/contact?hata=hiz#durum-hata-hiz');

echo "Yöntem, origin, yapılandırma\n";
$s = FormIslem::isle(sunucu(['REQUEST_METHOD' => 'GET']), [], $cfg);
kontrol('GET 405', $s['kod'] === 405 && in_array('Allow: POST', $s['basliklar'], true));
$s = FormIslem::isle(sunucu(['HTTP_ORIGIN' => 'https://kotu.example']), gecerliIletisim(), $cfg);
kontrol('yabanci origin 403', $s['kod'] === 403 && ($s['json']['hata'] ?? '') === 'origin');
$s = FormIslem::isle(sunucu(['HTTP_ORIGIN' => '', 'HTTP_REFERER' => '']), gecerliIletisim(), $cfg);
kontrol('origin ve referer yok 403', $s['kod'] === 403);

foreach (['yok' => null, 'bos' => '', 'bosluk' => '   ', 'ornek' => 'DEGISTIR-rastgele-bir-dize', 'kucuk' => 'degistir', 'kisa31' => str_repeat('a', 31)] as $ad => $tuz) {
    $c = yapilandirma($tmp, $log);
    if ($tuz === null) {
        unset($c['hiz_tuzu']);
    } else {
        $c['hiz_tuzu'] = $tuz;
    }
    logSil($log);
    $s = FormIslem::isle(sunucu(), gecerliIletisim(), $c);
    kontrol("hiz_tuzu $ad: 500 sabit govde, posta yok", $s['kod'] === 500 && $s['json'] === ['ok' => false, 'hata' => 'sunucu'] && logOku($log) === '');
}
$s = FormIslem::isle(sunucu(), gecerliIletisim(), $bos, 5000);
kontrol('alici yoksa 500', $s['kod'] === 500 && $s['json'] === ['ok' => false, 'hata' => 'sunucu']);

echo "Hız sınırı: sıra ve sayım\n";
$ip = '198.51.100.7';
$kodlar = [];
for ($i = 0; $i < 6; $i++) {
    $kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 1000 + $i)['kod'];
}
kontrol('5 gecerli gecer, 6. 429', $kodlar === [200, 200, 200, 200, 200, 429], (string) json_encode($kodlar));
$s = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 1000 + 5);
kontrol('429 Retry-After pencere', in_array('Retry-After: 600', $s['basliklar'], true));
$s = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 1000 + 700);
kontrol('pencere sonrasi acilir', $s['kod'] === 200);
$s = FormIslem::isle(sunucu(['REMOTE_ADDR' => '198.51.100.8']), gecerliIletisim(), $cfg, 1701);
kontrol('baska IP etkilenmez', $s['kod'] === 200);

$ip = '198.51.100.50';
$kodlar = [];
for ($i = 0; $i < 5; $i++) {
    $kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(['eposta' => 'ayşe@gmail.com']), $cfg, 2000 + $i)['kod'];
}
$kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 2010)['kod'];
kontrol('5 hatali deneme sayilmaz: [422x5, 200]', $kodlar === [422, 422, 422, 422, 422, 200], (string) json_encode($kodlar));

$ip = '198.51.100.51';
$kodlar = [];
for ($i = 0; $i < 6; $i++) {
    $kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(['kurum_kodu' => 'x']), $cfg, 2000 + $i)['kod'];
    $kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(['gecen_ms' => '10']), $cfg, 2000 + $i)['kod'];
}
$kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 2010)['kod'];
kontrol('honeypot ve cok hizli sayilmaz', array_slice($kodlar, -1) === [200] && !in_array(429, $kodlar, true), (string) json_encode($kodlar));

$dosyalar = hizDosyalari($tmp . '/hiz');
$ipDuz = false;
foreach ($dosyalar as $d) {
    $ipDuz = $ipDuz || str_contains($d, '198.51') || str_contains((string) file_get_contents($d), '198.51');
}
kontrol('hiz dosyasi IP duz yazmaz', $dosyalar !== [] && !$ipDuz);
$cfgEski = yapilandirma($tmp, $log, ['hiz_siniri' => ['dizin' => $tmp . '/hiz-eski']]);
unset($cfgEski['hiz_dizini']);
FormIslem::isle(sunucu(), gecerliIletisim(), $cfgEski);
kontrol('eski hiz_siniri.dizin anahtari da calisir', count(hizDosyalari($tmp . '/hiz-eski')) === 1);

echo "Hız sınırı: IP özeti saklama süresi\n";
$cfgS = yapilandirma($tmp, $log, ['hiz_dizini' => $tmp . '/hiz-sure']);
$t0 = 1_700_000_000;
FormIslem::isle(sunucu(['REMOTE_ADDR' => '192.0.2.9']), gecerliIletisim(), $cfgS, $t0);
$f = hizDosyalari($tmp . '/hiz-sure');
clearstatcache();
kontrol('gecerli gonderim ozet dosyasi yazar', count($f) === 1 && filemtime($f[0]) === $t0);
FormIslem::isle(sunucu(['REQUEST_METHOD' => 'GET']), [], $cfgS, $t0 + 599);
kontrol('pencere dolmadan silinmez', count(hizDosyalari($tmp . '/hiz-sure')) === 1);
FormIslem::isle(sunucu(['REQUEST_METHOD' => 'GET']), [], $cfgS, $t0 + 600);
kontrol('pencere dolunca ilk istekte (GET bile) silinir', hizDosyalari($tmp . '/hiz-sure') === []);
FormIslem::isle(sunucu(['REMOTE_ADDR' => '192.0.2.9']), gecerliIletisim(), $cfgS, $t0);
FormIslem::isle(sunucu(['REMOTE_ADDR' => '192.0.2.10']), gecerliIletisim(['eposta' => 'x']), $cfgS, $t0 + 30 * 86400);
kontrol('30 gun sonra hatali tek istek bile eski ozeti siler', hizDosyalari($tmp . '/hiz-sure') === []);
touch($tmp . '/dosya');
$s = FormIslem::isle(sunucu(), gecerliIletisim(), yapilandirma($tmp, $log, ['hiz_dizini' => $tmp . '/dosya/hiz']));
kontrol('hiz dizini olusturulamazsa bilincli acik kalir', $s['kod'] === 200);

echo "Hız sınırı: kilit ve varsayılan dizin güvenliği\n";
$tuz32 = str_repeat('a', 32);
kontrol('hiz_tuzu tam 32 karakter kabul edilir', FormIslem::isle(sunucu(), gecerliIletisim(), yapilandirma($tmp, $log, ['hiz_tuzu' => $tuz32]))['kod'] === 200);

// php-wasm'da flock engellemez ve fileowner() her zaman 0 döner; bu yetenekler yoksa ilgili sınama atlanır, mantık yerel PHP'de çalışır.
mkdir($tmp . '/yetenek', 0700);
$ya = fopen($tmp . '/yetenek/k', 'c');
$yb = fopen($tmp . '/yetenek/k', 'c');
flock($ya, LOCK_EX);
$kilitDestegi = !flock($yb, LOCK_EX | LOCK_NB);
fclose($ya);
fclose($yb);
$sahipDestegi = fileowner($tmp . '/yetenek') === getmyuid();

if ($kilitDestegi) {
    $cfgK = yapilandirma($tmp, $log, ['hiz_dizini' => $tmp . '/hiz-kilit']);
    mkdir($tmp . '/hiz-kilit', 0700, true);
    $tutucu = fopen($tmp . '/hiz-kilit/.kilit', 'c');
    flock($tutucu, LOCK_EX);
    $onceki = ini_set('error_log', $tmp . '/php-hata.log');
    $bas = microtime(true);
    $s = FormIslem::isle(sunucu(), gecerliIletisim(), $cfgK, 7000);
    $sure = microtime(true) - $bas;
    ini_set('error_log', (string) $onceki);
    $gunluk = is_file($tmp . '/php-hata.log') ? (string) file_get_contents($tmp . '/php-hata.log') : '';
    kontrol('kilit alinamazsa form yine de basarili (fail-open)', $s['kod'] === 200, (string) json_encode($s));
    kontrol('kilit en cok ~1 sn beklenir', $sure >= 0.5 && $sure < 3.0, (string) $sure);
    kontrol('kilit hatasi kodla gunluge yazilir, kisisel veri yok', str_contains($gunluk, 'hiz_kilidi_alinamadi') && !str_contains($gunluk, 'ayse@') && !str_contains($gunluk, '203.0.113'));
    kontrol('kilit alinamazken ozet dosyasi yazilmaz', hizDosyalari($tmp . '/hiz-kilit') === []);
    flock($tutucu, LOCK_UN);
    fclose($tutucu);
    FormIslem::isle(sunucu(), gecerliIletisim(), $cfgK, 7001);
    kontrol('kilit serbest kalinca ozet yazilir', count(hizDosyalari($tmp . '/hiz-kilit')) === 1);
} else {
    kontrol('kilit sinamasi atlandi (flock engellemiyor)', true);
}

if ($sahipDestegi) {
    $guvenli = new ReflectionMethod(FormIslem::class, 'dizinGuvenli');
    $guvenli->setAccessible(true);
    mkdir($tmp . '/g700', 0700);
    mkdir($tmp . '/g755', 0700);
    chmod($tmp . '/g755', 0755);
    kontrol('dizinGuvenli: 0700 ve kendi dizinimiz', $guvenli->invoke(null, $tmp . '/g700') === true);
    kontrol('dizinGuvenli: 0755 reddedilir', $guvenli->invoke(null, $tmp . '/g755') === false);

    $eskiTmp = getenv('TMPDIR');
    $tmpK = $tmp . '/sistem-gecici';
    mkdir($tmpK, 0700);
    putenv('TMPDIR=' . $tmpK);
    if (sys_get_temp_dir() === $tmpK) {
        $cfgD = yapilandirma($tmp, $log);
        unset($cfgD['hiz_dizini']);
        mkdir($tmpK . '/hanedan-hiz', 0755);
        chmod($tmpK . '/hanedan-hiz', 0755);
        $s = FormIslem::isle(sunucu(), gecerliIletisim(), $cfgD, 7100);
        kontrol('varsayilan dizin 0755 ise sinir atlanir, form calisir', $s['kod'] === 200 && hizDosyalari($tmpK . '/hanedan-hiz') === []);
        chmod($tmpK . '/hanedan-hiz', 0700);
        FormIslem::isle(sunucu(), gecerliIletisim(), $cfgD, 7101);
        kontrol('varsayilan dizin 0700 ise sinir uygulanir', count(hizDosyalari($tmpK . '/hanedan-hiz')) === 1);
    }
    putenv($eskiTmp === false ? 'TMPDIR' : 'TMPDIR=' . $eskiTmp);
} else {
    $guvenli = new ReflectionMethod(FormIslem::class, 'dizinGuvenli');
    $guvenli->setAccessible(true);
    kontrol('sahip denetimi: sahip uyusmazsa dizin guvensiz sayilir (wasm)', $guvenli->invoke(null, $tmp . '/yetenek') === false);
}

echo "Hız sınırı: IPv6 /64 ve istemci adresi\n";
kontrol('IPv6 ayni /64 ayni anahtar', FormIslem::ipAnahtari('2001:db8:1:2::1') === FormIslem::ipAnahtari('2001:db8:1:2:ffff:ffff:ffff:ffff'));
kontrol('IPv6 farkli /64 farkli anahtar', FormIslem::ipAnahtari('2001:db8:1:2::1') !== FormIslem::ipAnahtari('2001:db8:1:3::1'));
kontrol('IPv4 eslemeli IPv6 IPv4 sayilir', FormIslem::ipAnahtari('::ffff:192.0.2.1') === FormIslem::ipAnahtari('192.0.2.1'));
$cfg6 = yapilandirma($tmp, $log, ['hiz_dizini' => $tmp . '/hiz6']);
$kodlar = [];
for ($i = 1; $i <= 6; $i++) {
    $kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => '2001:db8:1:2::' . dechex($i * 4097)]), gecerliIletisim(), $cfg6, 3000 + $i)['kod'];
}
kontrol('IPv6: ayni /64 icinde adres degistirmek siniri asmaz', $kodlar === [200, 200, 200, 200, 200, 429], (string) json_encode($kodlar));
$s = FormIslem::isle(sunucu(['REMOTE_ADDR' => '2001:db8:1:3::1']), gecerliIletisim(), $cfg6, 3010);
kontrol('IPv6: komsu /64 etkilenmez', $s['kod'] === 200);

kontrol('CIDR: /24 icinde', FormIslem::cidrIcinde('192.168.1.77', '192.168.1.0/24'));
kontrol('CIDR: /23 icinde', FormIslem::cidrIcinde('192.168.1.77', '192.168.0.0/23'));
kontrol('CIDR: /23 disinda', !FormIslem::cidrIcinde('192.168.2.1', '192.168.0.0/23'));
kontrol('CIDR: oneksiz tek adres', FormIslem::cidrIcinde('10.0.0.1', '10.0.0.1') && !FormIslem::cidrIcinde('10.0.0.2', '10.0.0.1'));
kontrol('CIDR: gecersiz onek', !FormIslem::cidrIcinde('10.0.0.1', '10.0.0.0/33') && !FormIslem::cidrIcinde('10.0.0.1', 'kotu'));
kontrol('CIDR: IPv6', FormIslem::cidrIcinde('2001:db8:abcd::1', '2001:db8::/32') && !FormIslem::cidrIcinde('2001:db9::1', '2001:db8::/32'));
kontrol('CIDR: aile karismaz', !FormIslem::cidrIcinde('10.0.0.1', '::/0'));

$vekil = ['guvenilir_vekiller' => ['10.0.0.0/8', '2001:db8::/32']];
$xff = static fn (string $uzak, string $baslik): array => ['REMOTE_ADDR' => $uzak, 'HTTP_X_FORWARDED_FOR' => $baslik];
kontrol('vekil listesi bos: XFF yok sayilir', FormIslem::istemciIp($xff('203.0.113.5', '198.51.100.9'), []) === '203.0.113.5');
kontrol('REMOTE_ADDR vekil degil: XFF yok sayilir', FormIslem::istemciIp($xff('203.0.113.5', '198.51.100.9'), $vekil) === '203.0.113.5');
kontrol('guvenilir vekil: XFF istemcisi', FormIslem::istemciIp($xff('10.0.0.5', '198.51.100.9'), $vekil) === '198.51.100.9');
kontrol('en sagdaki guvenilmeyen: soldaki sahte adres yok sayilir', FormIslem::istemciIp($xff('10.0.0.5', '1.1.1.1, 198.51.100.9, 10.0.0.7'), $vekil) === '198.51.100.9');
kontrol('IPv6 vekil ve koseli/portlu giris', FormIslem::istemciIp($xff('2001:db8::1', '192.0.2.44, [2001:db8:ffff::1]:443'), $vekil) === '192.0.2.44');
kontrol('IPv4:port girisi', FormIslem::istemciIp($xff('10.0.0.5', '192.0.2.45:5555'), $vekil) === '192.0.2.45');
kontrol('bozuk XFF: REMOTE_ADDR', FormIslem::istemciIp($xff('10.0.0.5', 'bilinmiyor'), $vekil) === '10.0.0.5');
kontrol('XFF yok: REMOTE_ADDR', FormIslem::istemciIp(['REMOTE_ADDR' => '10.0.0.5'], $vekil) === '10.0.0.5');
kontrol('zincirin tamami vekil: en soldaki', FormIslem::istemciIp($xff('10.0.0.5', '10.9.9.9, 10.0.0.7'), $vekil) === '10.9.9.9');

$cfgV = yapilandirma($tmp, $log, ['hiz_dizini' => $tmp . '/hiz-vekil'] + $vekil);
$kodlar = [];
for ($i = 0; $i < 6; $i++) {
    $kodlar[] = FormIslem::isle(sunucu($xff('10.0.0.5', '198.51.100.60')), gecerliIletisim(), $cfgV, 4000 + $i)['kod'];
}
$kodlar[] = FormIslem::isle(sunucu($xff('10.0.0.5', '198.51.100.61')), gecerliIletisim(), $cfgV, 4010)['kod'];
kontrol('vekil arkasinda istemci basina sinir', $kodlar === [200, 200, 200, 200, 200, 429, 200], (string) json_encode($kodlar));
$kodlar = [];
for ($i = 0; $i < 6; $i++) {
    $kodlar[] = FormIslem::isle(sunucu($xff('203.0.113.99', '198.51.100.' . (70 + $i))), gecerliIletisim(), $cfgV, 4000 + $i)['kod'];
}
kontrol('vekil olmayan kaynak XFF degistirerek siniri asamaz', $kodlar === [200, 200, 200, 200, 200, 429], (string) json_encode($kodlar));

echo "form.php kabuğu\n";
$kabuk = (string) file_get_contents(__DIR__ . '/../../public/api/form.php');
kontrol('display_errors kapali', str_contains($kabuk, "ini_set('display_errors', '0');"));
kontrol('mbstring ve openssl denetimi', str_contains($kabuk, "extension_loaded('mbstring')") && str_contains($kabuk, "extension_loaded('openssl')"));
kontrol('hata govdesi sabit', substr_count($kabuk, '{"ok":false,"hata":"sunucu"}') === 1);

echo "\n$gecen gecti, " . count($kalan) . " kaldi\n";
exit($kalan === [] ? 0 : 1);
