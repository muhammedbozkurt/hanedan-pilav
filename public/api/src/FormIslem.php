<?php

declare(strict_types=1);

/**
 * Form işleme çekirdeği. form.php ince bir kabuktur; testler bu sınıfı doğrudan çağırır.
 * Veri saklanmaz: yalnız e-posta gider. Günlüğe kişisel veri yazılmaz.
 */
final class FormIslem
{
    private const KONULAR = [
        'genel' => 'Genel',
        'catering' => 'Kurumsal toplu yemek / catering',
        'bayilik' => 'Bayilik',
        'diger' => 'Diğer',
    ];

    private const ISTANBUL_DISI = 'istanbul-disi';

    private const ILCELER = [
        'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir',
        'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy',
        'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
        'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli',
        'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu',
    ];

    private const DONUS_YOLLARI = [
        'iletisim' => ['tr' => '/iletisim', 'en' => '/en/contact'],
        'bayilik' => ['tr' => '/bayilerimiz', 'en' => '/en/locations'],
    ];

    private const LIMITLER = [
        'ad' => 100, 'firma' => 120, 'telefon' => 30, 'eposta' => 254,
        'mesaj' => 3000, 'lokasyon' => 200,
    ];

    /**
     * @param array<string, mixed> $sunucu $_SERVER biçimli istek bilgisi
     * @param array<string, mixed> $post   $_POST biçimli gövde
     * @param array<string, mixed> $cfg    hanedan-config.php içeriği
     * @return array{kod:int, json:?array<string, mixed>, konum:?string, basliklar:list<string>}
     */
    public static function isle(array $sunucu, array $post, array $cfg, ?int $simdi = null): array
    {
        $simdi ??= time();
        $json = self::jsonIstendi($sunucu);
        $yontem = strtoupper(self::metin($sunucu['REQUEST_METHOD'] ?? ''));

        if ($yontem !== 'POST') {
            return self::cevap(405, ['ok' => false, 'hata' => 'yontem'], null, ['Allow: POST']);
        }
        if (!self::originIzinli($sunucu, $cfg)) {
            return self::cevap(403, ['ok' => false, 'hata' => 'origin']);
        }

        $tur = self::metin($post['form'] ?? '') === 'bayilik' ? 'bayilik' : 'iletisim';
        $dil = self::metin($post['lang'] ?? '') === 'en' ? 'en' : 'tr';
        $donus = self::DONUS_YOLLARI[$tur][$dil];

        $hiz = is_array($cfg['hiz_siniri'] ?? null) ? $cfg['hiz_siniri'] : [];
        if (!self::hizSiniriGec(self::metin($sunucu['REMOTE_ADDR'] ?? ''), $hiz, $cfg, $simdi)) {
            return $json
                ? self::cevap(429, ['ok' => false, 'hata' => 'hiz'], null, ['Retry-After: 600'])
                : self::cevap(303, null, $donus . '?hata=hiz#durum-hata');
        }

        $basari = $json
            ? self::cevap(200, ['ok' => true])
            : self::cevap(303, null, $donus . '?gonderildi=1#durum-gonderildi');

        // Bot izleri sessizce başarı gibi görünür: botun denemeyi sürdürmesi için ipucu verilmez.
        if (self::metin($post['kurum_kodu'] ?? '') !== '') {
            return $basari;
        }
        $minMs = (int) ($cfg['min_sure_ms'] ?? 3000);
        $gecen = $post['gecen_ms'] ?? null;
        if (is_string($gecen) && $gecen !== '' && is_numeric($gecen) && (float) $gecen < $minMs) {
            return $basari;
        }

        [$temiz, $hatalar] = self::dogrula($tur, $post);
        if ($hatalar !== []) {
            return $json
                ? self::cevap(422, ['ok' => false, 'alanlar' => $hatalar])
                : self::cevap(303, null, $donus . '?hata=dogrulama#durum-hata');
        }

        if (!self::gonder($tur, $temiz, $dil, $cfg, $simdi)) {
            return $json
                ? self::cevap(500, ['ok' => false, 'hata' => 'sunucu'])
                : self::cevap(303, null, $donus . '?hata=sunucu#durum-hata');
        }
        return $basari;
    }

    /**
     * @param array<string, mixed> $post
     * @return array{0: array<string, string>, 1: array<string, string>}
     */
    public static function dogrula(string $tur, array $post): array
    {
        $hata = [];
        $v = [];
        $tekSatir = static function (string $alan, bool $zorunlu) use ($post, &$hata, &$v): void {
            $ham = self::metin($post[$alan] ?? '');
            if (preg_match('/[\x00-\x1F\x7F]/u', $ham) === 1 || preg_match('//u', $ham) !== 1) {
                $hata[$alan] = 'gecersiz';
                $v[$alan] = '';
                return;
            }
            $deger = trim($ham);
            $v[$alan] = $deger;
            if ($deger === '') {
                if ($zorunlu) {
                    $hata[$alan] = 'bos';
                }
                return;
            }
            if (mb_strlen($deger) > self::LIMITLER[$alan]) {
                $hata[$alan] = 'uzun';
            }
        };

        $tekSatir('ad', true);
        $tekSatir('telefon', true);
        $tekSatir('eposta', true);
        $tekSatir('firma', false);

        if (!isset($hata['telefon']) && !self::telefonGecerli($v['telefon'])) {
            $hata['telefon'] = 'gecersiz';
        }
        if (!isset($hata['eposta']) && filter_var($v['eposta'], FILTER_VALIDATE_EMAIL) === false) {
            $hata['eposta'] = 'gecersiz';
        }

        $mesajHam = str_replace(["\r\n", "\r"], "\n", self::metin($post['mesaj'] ?? ''));
        $mesaj = trim($mesajHam);
        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', $mesaj) === 1 || preg_match('//u', $mesaj) !== 1) {
            $hata['mesaj'] = 'gecersiz';
            $mesaj = '';
        } elseif ($mesaj === '' && $tur === 'iletisim') {
            $hata['mesaj'] = 'bos';
        } elseif (mb_strlen($mesaj) > self::LIMITLER['mesaj']) {
            $hata['mesaj'] = 'uzun';
        }
        $v['mesaj'] = $mesaj;

        if ($tur === 'iletisim') {
            $konu = self::metin($post['konu'] ?? '');
            if (!array_key_exists($konu, self::KONULAR)) {
                $hata['konu'] = 'gecersiz';
            }
            $v['konu'] = $konu;
        } else {
            $tekSatir('lokasyon', false);
            $ilce = self::metin($post['ilce'] ?? '');
            if ($ilce === '') {
                $hata['ilce'] = 'bos';
            } elseif ($ilce !== self::ISTANBUL_DISI && !in_array($ilce, self::ILCELER, true)) {
                $hata['ilce'] = 'gecersiz';
            }
            $v['ilce'] = $ilce;
            $isletme = self::metin($post['mevcut_isletme'] ?? '');
            if ($isletme !== '' && $isletme !== 'evet' && $isletme !== 'hayir') {
                $hata['mevcut_isletme'] = 'gecersiz';
            }
            $v['mevcut_isletme'] = $isletme;
        }

        return [$v, $hata];
    }

    public static function telefonGecerli(string $telefon): bool
    {
        $sade = preg_replace('/[\s().\-]/', '', $telefon) ?? '';
        if (preg_match('/^(?:\+?90|0)?[2-5]\d{9}$/', $sade) === 1) {
            return true;
        }
        return preg_match('/^\+(?!90)[1-9]\d{9,13}$/', $sade) === 1;
    }

    /**
     * @param array<string, mixed> $sunucu
     * @param array<string, mixed> $cfg
     */
    private static function originIzinli(array $sunucu, array $cfg): bool
    {
        $izinli = array_map('strtolower', array_filter((array) ($cfg['izinli_originler'] ?? []), 'is_string'));
        if ($izinli === []) {
            return false;
        }
        $kaynak = self::metin($sunucu['HTTP_ORIGIN'] ?? '');
        if ($kaynak === '') {
            $kaynak = self::metin($sunucu['HTTP_REFERER'] ?? '');
        }
        if ($kaynak === '') {
            return false;
        }
        $host = parse_url($kaynak, PHP_URL_HOST);
        return is_string($host) && in_array(strtolower($host), $izinli, true);
    }

    /**
     * @param array<string, mixed> $hiz
     * @param array<string, mixed> $cfg
     */
    private static function hizSiniriGec(string $ip, array $hiz, array $cfg, int $simdi): bool
    {
        $adet = (int) ($hiz['adet'] ?? 5);
        $pencere = (int) ($hiz['pencere_sn'] ?? 600);
        $dizin = is_string($hiz['dizin'] ?? null) && $hiz['dizin'] !== ''
            ? $hiz['dizin']
            : sys_get_temp_dir() . '/hanedan-hiz';
        if (!is_dir($dizin) && !@mkdir($dizin, 0700, true) && !is_dir($dizin)) {
            error_log('hanedan-form: hiz_dizini_yok');
            return true;
        }
        // IP düz yazılmaz: tuzlu özet dosya adı olur.
        $tuz = (string) ($cfg['hiz_tuzu'] ?? 'hanedan');
        $dosya = $dizin . '/' . hash('sha256', $tuz . '|' . $ip) . '.json';
        $f = @fopen($dosya, 'c+');
        if ($f === false) {
            error_log('hanedan-form: hiz_dosyasi_acilamadi');
            return true;
        }
        $izin = true;
        if (flock($f, LOCK_EX)) {
            $icerik = stream_get_contents($f);
            $liste = json_decode($icerik === false || $icerik === '' ? '[]' : $icerik, true);
            $liste = is_array($liste) ? array_values(array_filter($liste, static fn ($t): bool => is_int($t) && $t > $simdi - $pencere)) : [];
            if (count($liste) >= $adet) {
                $izin = false;
            } else {
                $liste[] = $simdi;
            }
            ftruncate($f, 0);
            rewind($f);
            fwrite($f, (string) json_encode($liste));
            fflush($f);
            flock($f, LOCK_UN);
        }
        fclose($f);
        if (random_int(1, 50) === 1) {
            self::eskiDosyalariSil($dizin, $simdi - $pencere);
        }
        return $izin;
    }

    private static function eskiDosyalariSil(string $dizin, int $esik): void
    {
        foreach (glob($dizin . '/*.json') ?: [] as $d) {
            $m = @filemtime($d);
            if ($m !== false && $m < $esik) {
                @unlink($d);
            }
        }
    }

    /**
     * @param array<string, string> $v
     * @param array<string, mixed> $cfg
     */
    private static function gonder(string $tur, array $v, string $dil, array $cfg, int $simdi): bool
    {
        $alicilar = array_values(array_filter((array) ($cfg['alicilar'][$tur] ?? []), 'is_string'));
        $gonderen = is_array($cfg['gonderen'] ?? null) ? $cfg['gonderen'] : [];
        $gonderenEposta = self::metin($gonderen['eposta'] ?? '');
        if ($alicilar === [] || $gonderenEposta === '') {
            error_log('hanedan-form: yapilandirma_eksik');
            return false;
        }

        $adGuvenli = trim(preg_replace('/[\x00-\x1F\x7F<>"]/u', '', $v['ad']) ?? '');
        $baslikTur = $tur === 'bayilik' ? 'Bayilik başvurusu' : 'İletişim';
        $konu = $tur === 'iletisim' ? ' (' . self::KONULAR[$v['konu']] . ')' : '';
        $baslik = '[Hanedan Pilav] ' . $baslikTur . $konu . ': ' . $adGuvenli;
        $baslik = trim(preg_replace('/[\r\n]+/', ' ', $baslik) ?? '');

        $satirlar = ['Form: ' . $baslikTur, 'Dil: ' . strtoupper($dil), 'Zaman: ' . gmdate('Y-m-d H:i', $simdi) . ' UTC', ''];
        if ($tur === 'iletisim') {
            $satirlar[] = 'Konu: ' . self::KONULAR[$v['konu']];
        }
        $satirlar[] = 'Ad soyad: ' . $v['ad'];
        if ($v['firma'] !== '') {
            $satirlar[] = 'Firma: ' . $v['firma'];
        }
        $satirlar[] = 'Telefon: ' . $v['telefon'];
        $satirlar[] = 'E-posta: ' . $v['eposta'];
        if ($tur === 'bayilik') {
            $satirlar[] = 'İlçe: ' . ($v['ilce'] === self::ISTANBUL_DISI ? 'İstanbul dışı' : $v['ilce']);
            if ($v['mevcut_isletme'] !== '') {
                $satirlar[] = 'Mevcut işletme: ' . ($v['mevcut_isletme'] === 'evet' ? 'Evet' : 'Hayır');
            }
            if ($v['lokasyon'] !== '') {
                $satirlar[] = 'Düşünülen lokasyon: ' . $v['lokasyon'];
            }
        }
        if ($v['mesaj'] !== '') {
            $satirlar[] = '';
            $satirlar[] = 'Mesaj:';
            $satirlar[] = $v['mesaj'];
        }
        $govde = implode("\n", $satirlar) . "\n";

        $posta = [
            'gonderen' => $gonderenEposta,
            'gonderen_ad' => self::metin($gonderen['ad'] ?? 'Hanedan Pilav Web'),
            'alicilar' => $alicilar,
            'yanit' => $v['eposta'],
            'yanit_ad' => $adGuvenli,
            'konu' => $baslik,
            'govde' => $govde,
        ];

        try {
            if (self::metin($cfg['transport'] ?? 'smtp') === 'log') {
                return self::logaYaz($posta, self::metin($cfg['log_dosyasi'] ?? ''));
            }
            return self::smtpGonder($posta, is_array($cfg['smtp'] ?? null) ? $cfg['smtp'] : []);
        } catch (Throwable $e) {
            // Posta ve SMTP hata metinleri adres içerebilir: yalnız sınıf adı günlüğe gider.
            error_log('hanedan-form: gonderim_hatasi ' . get_class($e));
            return false;
        }
    }

    /** @param array<string, mixed> $posta */
    private static function logaYaz(array $posta, string $dosya): bool
    {
        if ($dosya === '') {
            return false;
        }
        $kayit = "---\nKimden: {$posta['gonderen']}\nKime: " . implode(', ', $posta['alicilar'])
            . "\nYanit: {$posta['yanit']}\nKonu: {$posta['konu']}\n\n{$posta['govde']}";
        return file_put_contents($dosya, $kayit, FILE_APPEND | LOCK_EX) !== false;
    }

    /**
     * @param array<string, mixed> $posta
     * @param array<string, mixed> $smtp
     */
    private static function smtpGonder(array $posta, array $smtp): bool
    {
        $kok = __DIR__ . '/../vendor/phpmailer';
        require_once $kok . '/Exception.php';
        require_once $kok . '/PHPMailer.php';
        require_once $kok . '/SMTP.php';

        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host = self::metin($smtp['host'] ?? '');
        $m->Port = (int) ($smtp['port'] ?? 587);
        $kullanici = self::metin($smtp['kullanici'] ?? '');
        $m->SMTPAuth = $kullanici !== '';
        $m->Username = $kullanici;
        $m->Password = self::metin($smtp['sifre'] ?? '');
        $guvenlik = self::metin($smtp['guvenlik'] ?? 'tls');
        $m->SMTPSecure = $guvenlik === 'ssl'
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : ($guvenlik === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : '');
        $m->SMTPAutoTLS = $guvenlik !== '';
        $m->Timeout = 10;
        $m->CharSet = 'UTF-8';
        $m->Encoding = 'base64';
        $m->setFrom((string) $posta['gonderen'], (string) $posta['gonderen_ad']);
        foreach ((array) $posta['alicilar'] as $alici) {
            $m->addAddress((string) $alici);
        }
        $m->addReplyTo((string) $posta['yanit'], (string) $posta['yanit_ad']);
        $m->Subject = (string) $posta['konu'];
        $m->isHTML(false);
        $m->Body = (string) $posta['govde'];
        return $m->send();
    }

    /** @param array<string, mixed> $sunucu */
    private static function jsonIstendi(array $sunucu): bool
    {
        return stripos(self::metin($sunucu['HTTP_ACCEPT'] ?? ''), 'application/json') !== false;
    }

    private static function metin(mixed $deger): string
    {
        return is_string($deger) ? $deger : '';
    }

    /**
     * @param ?array<string, mixed> $json
     * @param list<string> $basliklar
     * @return array{kod:int, json:?array<string, mixed>, konum:?string, basliklar:list<string>}
     */
    private static function cevap(int $kod, ?array $json, ?string $konum = null, array $basliklar = []): array
    {
        return ['kod' => $kod, 'json' => $json, 'konum' => $konum, 'basliklar' => $basliklar];
    }
}
