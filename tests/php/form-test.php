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
        'hiz_siniri' => ['adet' => 5, 'pencere_sn' => 600, 'dizin' => $tmp . '/hiz'],
        'hiz_tuzu' => 'test',
        'min_sure_ms' => 3000,
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
        'REMOTE_ADDR' => '203.0.113.' . $ipSayac,
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
        'lokasyon' => 'Mecidiyeköy', 'mesaj' => '', 'kurum_kodu' => '', 'gecen_ms' => '9000',
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

$cfg = yapilandirma($tmp, $log);

echo "Doğrulama\n";
$s = FormIslem::isle(sunucu(), gecerliIletisim(['ad' => '', 'eposta' => '', 'mesaj' => '']), $cfg);
kontrol('eksik alan 422', $s['kod'] === 422);
kontrol('eksik alan kodlari', ($s['json']['alanlar']['ad'] ?? '') === 'bos' && ($s['json']['alanlar']['mesaj'] ?? '') === 'bos');
kontrol('eksik alan posta yazmadi', logOku($log) === '');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['eposta' => 'yanlis@']), $cfg);
kontrol('gecersiz eposta 422', $s['kod'] === 422 && ($s['json']['alanlar']['eposta'] ?? '') === 'gecersiz');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['telefon' => '123']), $cfg);
kontrol('gecersiz telefon 422', $s['kod'] === 422 && ($s['json']['alanlar']['telefon'] ?? '') === 'gecersiz');

foreach (['05321234567', '+905321234567', '532 123 45 67', '0212 555 12 34', '+1 415 555 2671'] as $tel) {
    kontrol("telefon kabul: $tel", FormIslem::telefonGecerli($tel));
}
foreach (['123', '0532 123', 'abcdefghij', '+90 123 456 78 90'] as $tel) {
    kontrol("telefon red: $tel", !FormIslem::telefonGecerli($tel));
}

$s = FormIslem::isle(sunucu(), gecerliIletisim(['mesaj' => str_repeat('a', 3001)]), $cfg);
kontrol('uzun mesaj 422', $s['kod'] === 422 && ($s['json']['alanlar']['mesaj'] ?? '') === 'uzun');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['konu' => 'sahte']), $cfg);
kontrol('gecersiz konu 422', $s['kod'] === 422 && isset($s['json']['alanlar']['konu']));

$s = FormIslem::isle(sunucu(), gecerliIletisim(['ad' => ['dizi']]), $cfg);
kontrol('dizi deger 422', $s['kod'] === 422 && ($s['json']['alanlar']['ad'] ?? '') === 'bos');

$s = FormIslem::isle(sunucu(), gecerliBayilik(['ilce' => 'Atlantis']), $cfg);
kontrol('bayilik gecersiz ilce 422', $s['kod'] === 422 && ($s['json']['alanlar']['ilce'] ?? '') === 'gecersiz');

echo "Bot ve enjeksiyon\n";
logSil($log);
$s = FormIslem::isle(sunucu(), gecerliIletisim(['kurum_kodu' => 'http://spam.example']), $cfg);
kontrol('honeypot sessiz basari', $s['kod'] === 200 && ($s['json']['ok'] ?? false) === true);
kontrol('honeypot posta yazmadi', logOku($log) === '');

$s = FormIslem::isle(sunucu(), gecerliIletisim(['gecen_ms' => '900']), $cfg);
kontrol('cok hizli gonderim sessiz basari', $s['kod'] === 200 && ($s['json']['ok'] ?? false) === true);
kontrol('cok hizli posta yazmadi', logOku($log) === '');

$s = FormIslem::isle(sunucu(['HTTP_ACCEPT' => 'text/html']), gecerliIletisim(['kurum_kodu' => 'x']), $cfg);
kontrol('honeypot JSON olmayan 303 basari', $s['kod'] === 303 && $s['konum'] === '/iletisim?gonderildi=1#durum-gonderildi');

foreach (['ad' => "Ali\r\nBcc: kurban@example.test", 'telefon' => "0532 123 45 67\nX: y", 'eposta' => "a@example.test\r\nBcc: b@example.test", 'firma' => "Firma\rBcc: x"] as $alan => $deger) {
    $s = FormIslem::isle(sunucu(), gecerliIletisim([$alan => $deger]), $cfg);
    kontrol("CRLF reddi: $alan", $s['kod'] === 422 && ($s['json']['alanlar'][$alan] ?? '') === 'gecersiz');
}
kontrol('CRLF posta yazmadi', logOku($log) === '');

echo "Geçerli istek\n";
$s = FormIslem::isle(sunucu(), gecerliIletisim(), $cfg);
$icerik = logOku($log);
kontrol('gecerli iletisim 200', $s['kod'] === 200 && ($s['json']['ok'] ?? false) === true);
kontrol('log: alici ve yanit', str_contains($icerik, 'Kime: info@example.test') && str_contains($icerik, 'Yanit: ayse@example.test'));
kontrol('log: konu ve govde', str_contains($icerik, 'Konu: [Hanedan Pilav] İletişim (Kurumsal toplu yemek / catering): Ayşe Yılmaz') && str_contains($icerik, '100 kişilik yemek istiyoruz.'));

logSil($log);
$s = FormIslem::isle(sunucu(), gecerliBayilik(), $cfg);
$icerik = logOku($log);
kontrol('gecerli bayilik 200', $s['kod'] === 200);
kontrol('bayilik log: alici ve ilce', str_contains($icerik, 'Kime: bayilik@example.test') && str_contains($icerik, 'İlçe: Şişli') && str_contains($icerik, 'Mevcut işletme: Evet'));

logSil($log);
$s = FormIslem::isle(sunucu(['HTTP_ACCEPT' => 'text/html', 'HTTP_ORIGIN' => '', 'HTTP_REFERER' => 'https://example.test/en/contact']), gecerliIletisim(['lang' => 'en']), $cfg);
kontrol('JSON olmayan 303 yonlendirme', $s['kod'] === 303 && $s['konum'] === '/en/contact?gonderildi=1#durum-gonderildi');
$s = FormIslem::isle(sunucu(['HTTP_ACCEPT' => 'text/html']), gecerliIletisim(['eposta' => 'x']), $cfg);
kontrol('JSON olmayan dogrulama 303', $s['kod'] === 303 && $s['konum'] === '/iletisim?hata=dogrulama#durum-hata');

echo "Yöntem, origin, hız sınırı, hata\n";
$s = FormIslem::isle(sunucu(['REQUEST_METHOD' => 'GET']), [], $cfg);
kontrol('GET 405', $s['kod'] === 405 && in_array('Allow: POST', $s['basliklar'], true));

$s = FormIslem::isle(sunucu(['HTTP_ORIGIN' => 'https://kotu.example']), gecerliIletisim(), $cfg);
kontrol('yabanci origin 403', $s['kod'] === 403);
$s = FormIslem::isle(sunucu(['HTTP_ORIGIN' => '', 'HTTP_REFERER' => '']), gecerliIletisim(), $cfg);
kontrol('origin ve referer yok 403', $s['kod'] === 403);

$ip = '198.51.100.7';
$kodlar = [];
for ($i = 0; $i < 6; $i++) {
    $kodlar[] = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 1000 + $i)['kod'];
}
kontrol('hiz siniri: 5 gecer, 6. 429', $kodlar === [200, 200, 200, 200, 200, 429], json_encode($kodlar));
$s = FormIslem::isle(sunucu(['REMOTE_ADDR' => $ip]), gecerliIletisim(), $cfg, 1000 + 700);
kontrol('hiz siniri pencere sonrasi acilir', $s['kod'] === 200);
$s = FormIslem::isle(sunucu(['REMOTE_ADDR' => '198.51.100.8']), gecerliIletisim(), $cfg, 1006);
kontrol('hiz siniri baska IP etkilenmez', $s['kod'] === 200);
$dosyalar = glob($tmp . '/hiz/*.json') ?: [];
$ipDuz = false;
foreach ($dosyalar as $d) {
    $ipDuz = $ipDuz || str_contains($d, '198.51') || str_contains((string) file_get_contents($d), '198.51');
}
kontrol('hiz dosyasi IP duz yazmaz', $dosyalar !== [] && !$ipDuz);

$bos = yapilandirma($tmp, $log);
$bos['alicilar']['iletisim'] = [];
$s = FormIslem::isle(sunucu(), gecerliIletisim(), $bos, 5000);
kontrol('alici yoksa 500', $s['kod'] === 500 && ($s['json']['hata'] ?? '') === 'sunucu');

echo "\n$gecen gecti, " . count($kalan) . " kaldi\n";
exit($kalan === [] ? 0 : 1);
