<?php

declare(strict_types=1);

/**
 * Form işleme çekirdeği. form.php ince bir kabuktur; testler bu sınıfı doğrudan çağırır.
 * Veri saklanmaz: yalnız e-posta gider. Günlüğe kişisel veri yazılmaz.
 * Doğrulama kuralları app/components/form/dogrula.ts ile aynıdır; ortak vaka listesi tests/fixtures/dogrulama-vakalari.json.
 */
final class FormIslem
{
    private const KONULAR = [
        'genel' => 'Genel',
        'catering' => 'Toplu yemek ve organizasyon',
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

    // JS String.prototype.trim ile aynı küme: Unicode boşlukları (Z), ASCII boşluk denetimleri ve U+FEFF.
    private const KIRP = '/^[\p{Z}\t\n\x0B\f\r\x{FEFF}]+|[\p{Z}\t\n\x0B\f\r\x{FEFF}]+$/u';

    // \d kullanılmaz: /u ile Arapça-Hint rakamlarını da kabul eder, JS etmez.
    private const TELEFON_TEMIZLE = '/[\t\p{Zs}().\-]/u';
    private const TELEFON_TR = '/^(?:(?:\+|00)?90)?0?[2-58][0-9]{9}$/';
    private const TELEFON_YABANCI = '/^(?:\+|00)(?!90)[1-9][0-9]{9,13}$/';

    // FILTER_VALIDATE_EMAIL'in kabul ettiklerinin alt kümesi: ASCII nokta-atom yerel kısım, ASCII ana makine adı.
    private const EPOSTA = '/^[A-Za-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59})$/';
    private const EPOSTA_YEREL_EN_COK = 64;

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
        $hiz = self::hizAyarlari($cfg);
        // Süresi dolan IP özetleri her istekte silinir: hiçbir özet pencere_sn'den uzun kalmaz.
        self::eskiDosyalariSil($hiz['dizin'], $simdi - $hiz['pencere']);

        if (strtoupper(self::metin($sunucu['REQUEST_METHOD'] ?? '')) !== 'POST') {
            return self::cevap(405, ['ok' => false, 'hata' => 'yontem'], null, ['Allow: POST']);
        }

        $tur = self::metin($post['form'] ?? '') === 'bayilik' ? 'bayilik' : 'iletisim';
        $dil = self::metin($post['lang'] ?? '') === 'en' ? 'en' : 'tr';
        $donus = self::DONUS_YOLLARI[$tur][$dil];
        $hata = static function (string $kod, int $durum, array $basliklar = []) use ($json, $donus): array {
            return $json
                ? self::cevap($durum, ['ok' => false, 'hata' => $kod], null, $basliklar)
                : self::cevap(303, null, $donus . '?hata=' . $kod . '#durum-hata-' . str_replace('_', '-', $kod));
        };

        if (!self::originIzinli($sunucu, $cfg)) {
            return $hata('origin', 403);
        }
        $tuz = self::metin($cfg['hiz_tuzu'] ?? '');
        if (!self::tuzGecerli($tuz)) {
            error_log('hanedan-form: hiz_tuzu_gecersiz');
            return $hata('sunucu', 500);
        }

        $basari = $json
            ? self::cevap(200, ['ok' => true])
            : self::cevap(303, null, $donus . '?gonderildi=1#durum-gonderildi');

        // Yalnız tuzak alanı dolu istek sessizce başarı görür; hız sınırına da sayılmaz.
        if (self::metin($post['kurum_kodu'] ?? '') !== '') {
            return $basari;
        }
        // gecen_ms yalnız JS ile gelir; JS'siz gönderimde süre denetimi atlanır. Çok hızlı gönderim görünür hatadır.
        $gecen = $post['gecen_ms'] ?? null;
        if (is_string($gecen) && is_numeric($gecen) && (float) $gecen < (int) ($cfg['min_sure_ms'] ?? 2000)) {
            return $hata('cok_hizli', 422);
        }

        [$temiz, $hatalar] = self::dogrula($tur, $post);
        if ($hatalar !== []) {
            return $json
                ? self::cevap(422, ['ok' => false, 'hata' => 'dogrulama', 'alanlar' => $hatalar])
                : self::cevap(303, null, $donus . '?hata=dogrulama#durum-hata-dogrulama');
        }

        // Hız sınırı yalnız geçerli gönderimleri sayar: hatasını düzelten kullanıcı kilitlenmez.
        if (!self::hizSiniriGec(self::istemciIp($sunucu, $cfg), $hiz, $tuz, $simdi)) {
            return $hata('hiz', 429, ['Retry-After: ' . $hiz['pencere']]);
        }

        if (!self::gonder($tur, $temiz, $dil, $cfg, $simdi)) {
            return $hata('sunucu', 500);
        }
        return $basari;
    }

    /**
     * Yalnız formun beyan ettiği alanlar okunur ve döner; diğerleri yok sayılır.
     *
     * @param array<string, mixed> $post
     * @return array{0: array<string, string>, 1: array<string, string>}
     */
    public static function dogrula(string $tur, array $post): array
    {
        $hata = [];
        $v = [];
        $tekSatir = static function (string $alan, bool $zorunlu) use ($post, &$hata, &$v): void {
            $ham = self::metin($post[$alan] ?? '');
            if (preg_match('//u', $ham) !== 1 || preg_match('/[\x00-\x1F\x7F]/', $ham) === 1) {
                $hata[$alan] = 'gecersiz';
                $v[$alan] = '';
                return;
            }
            $deger = self::kirp($ham);
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

        if (!isset($hata['telefon']) && !self::telefonGecerli($v['telefon'])) {
            $hata['telefon'] = 'gecersiz';
        }
        if (!isset($hata['eposta']) && !self::epostaGecerli($v['eposta'])) {
            $hata['eposta'] = 'gecersiz';
        }

        $mesajHam = str_replace(["\r\n", "\r"], "\n", self::metin($post['mesaj'] ?? ''));
        $mesaj = preg_match('//u', $mesajHam) === 1 ? self::kirp($mesajHam) : null;
        if ($mesaj === null || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $mesaj) === 1) {
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
            $tekSatir('firma', false);
        } else {
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
            $tekSatir('lokasyon', false);
        }

        return [$v, $hata];
    }

    public static function telefonGecerli(string $telefon): bool
    {
        $sade = preg_replace(self::TELEFON_TEMIZLE, '', $telefon);
        if (!is_string($sade)) {
            return false;
        }
        return preg_match(self::TELEFON_TR, $sade) === 1 || preg_match(self::TELEFON_YABANCI, $sade) === 1;
    }

    public static function epostaGecerli(string $eposta): bool
    {
        $yerel = strstr($eposta, '@', true);
        return $yerel !== false
            && strlen($yerel) <= self::EPOSTA_YEREL_EN_COK
            && preg_match(self::EPOSTA, $eposta) === 1
            && filter_var($eposta, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Hız sınırında kullanılan istemci adresi. REMOTE_ADDR güvenilir bir vekilse X-Forwarded-For
     * zincirinde sağdan ilk güvenilmeyen adres alınır; aksi hâlde başlık yok sayılır.
     *
     * @param array<string, mixed> $sunucu
     * @param array<string, mixed> $cfg
     */
    public static function istemciIp(array $sunucu, array $cfg): string
    {
        $uzak = trim(self::metin($sunucu['REMOTE_ADDR'] ?? ''));
        $vekiller = array_values(array_filter((array) ($cfg['guvenilir_vekiller'] ?? []), 'is_string'));
        if ($vekiller === [] || !self::vekilMi($uzak, $vekiller)) {
            return $uzak;
        }
        $zincir = explode(',', self::metin($sunucu['HTTP_X_FORWARDED_FOR'] ?? ''));
        $aday = $uzak;
        for ($i = count($zincir) - 1; $i >= 0; $i--) {
            $adres = self::adresAyikla($zincir[$i]);
            if ($adres === null) {
                // Bozuk giriş: daha soldaki adresleri istemci kendisi yazmış olabilir, güvenilmez.
                break;
            }
            $aday = $adres;
            if (!self::vekilMi($adres, $vekiller)) {
                return $adres;
            }
        }
        return $aday;
    }

    /** IPv4 adresin kendisi, IPv6 ise /64 öneki: aynı ağda adres değiştirerek sınır aşılamaz. */
    public static function ipAnahtari(string $ip): string
    {
        $b = self::ikili($ip);
        if ($b === null) {
            return 'gecersiz';
        }
        if (strlen($b) === 4) {
            return 'v4:' . (string) inet_ntop($b);
        }
        return 'v6:' . bin2hex(substr($b, 0, 8)) . '/64';
    }

    public static function cidrIcinde(string $ip, string $cidr): bool
    {
        $parca = explode('/', trim($cidr), 2);
        $ipB = self::ikili($ip);
        $agB = self::ikili($parca[0]);
        if ($ipB === null || $agB === null || strlen($ipB) !== strlen($agB)) {
            return false;
        }
        $enCok = strlen($ipB) * 8;
        if (!isset($parca[1])) {
            $uzunluk = $enCok;
        } elseif (ctype_digit($parca[1])) {
            $uzunluk = (int) $parca[1];
        } else {
            return false;
        }
        if ($uzunluk > $enCok) {
            return false;
        }
        $tam = intdiv($uzunluk, 8);
        if (strncmp($ipB, $agB, $tam) !== 0) {
            return false;
        }
        $artan = $uzunluk % 8;
        if ($artan === 0) {
            return true;
        }
        $maske = (0xFF << (8 - $artan)) & 0xFF;
        return (ord($ipB[$tam]) & $maske) === (ord($agB[$tam]) & $maske);
    }

    /** @param list<string> $vekiller */
    private static function vekilMi(string $ip, array $vekiller): bool
    {
        foreach ($vekiller as $cidr) {
            if (self::cidrIcinde($ip, $cidr)) {
                return true;
            }
        }
        return false;
    }

    private static function adresAyikla(string $giris): ?string
    {
        $giris = trim($giris);
        if (preg_match('/^\[([0-9A-Fa-f:.]+)\](?::[0-9]+)?$/', $giris, $e) === 1) {
            $giris = $e[1];
        } elseif (preg_match('/^([0-9]{1,3}(?:\.[0-9]{1,3}){3}):[0-9]+$/', $giris, $e) === 1) {
            $giris = $e[1];
        }
        return self::ikili($giris) === null ? null : $giris;
    }

    private static function ikili(string $ip): ?string
    {
        $ip = trim($ip);
        if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
            return null;
        }
        $b = inet_pton($ip);
        if ($b === false) {
            return null;
        }
        // IPv4 eşlemeli IPv6 (::ffff:a.b.c.d) IPv4 sayılır.
        if (strlen($b) === 16 && str_starts_with($b, str_repeat("\0", 10) . "\xFF\xFF")) {
            return substr($b, 12);
        }
        return $b;
    }

    private static function tuzGecerli(string $tuz): bool
    {
        return trim($tuz) !== '' && stripos($tuz, 'DEGISTIR') === false;
    }

    /**
     * @param array<string, mixed> $cfg
     * @return array{adet:int, pencere:int, dizin:string}
     */
    private static function hizAyarlari(array $cfg): array
    {
        $hiz = is_array($cfg['hiz_siniri'] ?? null) ? $cfg['hiz_siniri'] : [];
        $dizin = self::metin($cfg['hiz_dizini'] ?? '');
        if ($dizin === '') {
            $dizin = self::metin($hiz['dizin'] ?? '');
        }
        if ($dizin === '') {
            $dizin = sys_get_temp_dir() . '/hanedan-hiz';
        }
        return [
            'adet' => max(1, (int) ($hiz['adet'] ?? 5)),
            'pencere' => max(1, (int) ($hiz['pencere_sn'] ?? 600)),
            'dizin' => rtrim($dizin, '/'),
        ];
    }

    /**
     * Dizin ya da dosya hatasında bilerek açık kalır (gönderim engellenmez); günlüğe yalnız kod yazılır.
     *
     * @param array{adet:int, pencere:int, dizin:string} $hiz
     */
    private static function hizSiniriGec(string $ip, array $hiz, string $tuz, int $simdi): bool
    {
        $dizin = $hiz['dizin'];
        if (!is_dir($dizin) && !@mkdir($dizin, 0700, true) && !is_dir($dizin)) {
            error_log('hanedan-form: hiz_dizini_yok');
            return true;
        }
        $kilit = self::kilitAl($dizin);
        if ($kilit === null) {
            return true;
        }
        try {
            // IP düz yazılmaz: tuzlu HMAC özeti dosya adı olur, içerikte yalnız zaman damgaları durur.
            $dosya = $dizin . '/' . hash_hmac('sha256', self::ipAnahtari($ip), $tuz) . '.json';
            $icerik = is_file($dosya) ? @file_get_contents($dosya) : '';
            $liste = json_decode($icerik === false || $icerik === '' ? '[]' : $icerik, true);
            $liste = is_array($liste)
                ? array_values(array_filter($liste, static fn ($t): bool => is_int($t) && $t > $simdi - $hiz['pencere']))
                : [];
            if (count($liste) >= $hiz['adet']) {
                return false;
            }
            $liste[] = $simdi;
            if (@file_put_contents($dosya, (string) json_encode($liste)) === false) {
                error_log('hanedan-form: hiz_dosyasi_yazilamadi');
                return true;
            }
            // Dosya zamanı son kabul edilen gönderimdir; temizlik bu zamana bakar.
            @touch($dosya, $simdi);
            return true;
        } finally {
            flock($kilit, LOCK_UN);
            fclose($kilit);
        }
    }

    private static function eskiDosyalariSil(string $dizin, int $esik): void
    {
        if (!is_dir($dizin)) {
            return;
        }
        $kilit = self::kilitAl($dizin);
        if ($kilit === null) {
            return;
        }
        try {
            foreach (glob($dizin . '/*.json') ?: [] as $d) {
                clearstatcache(true, $d);
                $m = @filemtime($d);
                if ($m !== false && $m <= $esik) {
                    @unlink($d);
                }
            }
        } finally {
            flock($kilit, LOCK_UN);
            fclose($kilit);
        }
    }

    /**
     * Dizin genelinde tek kilit: sayaç okuma-yazma ve temizlik aynı anda koşmaz, silinmiş dosyaya yazılmaz.
     *
     * @return resource|null
     */
    private static function kilitAl(string $dizin)
    {
        $f = @fopen($dizin . '/.kilit', 'c');
        if ($f === false) {
            error_log('hanedan-form: hiz_kilidi_acilamadi');
            return null;
        }
        if (!flock($f, LOCK_EX)) {
            fclose($f);
            error_log('hanedan-form: hiz_kilidi_alinamadi');
            return null;
        }
        return $f;
    }

    /**
     * E-postaya yalnız formun beyan edilen alanları girer (aydınlatma metnindeki liste).
     *
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
            $satirlar[] = 'Ad soyad: ' . $v['ad'];
            if ($v['firma'] !== '') {
                $satirlar[] = 'Firma: ' . $v['firma'];
            }
            $satirlar[] = 'Telefon: ' . $v['telefon'];
            $satirlar[] = 'E-posta: ' . $v['eposta'];
        } else {
            $satirlar[] = 'Ad soyad: ' . $v['ad'];
            $satirlar[] = 'Telefon: ' . $v['telefon'];
            $satirlar[] = 'E-posta: ' . $v['eposta'];
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

    /**
     * Yalnız deneme içindir: e-postanın tamamını (kişisel veri) düz metin dosyaya yazar.
     *
     * @param array<string, mixed> $posta
     */
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

    /** @param array<string, mixed> $sunucu */
    private static function jsonIstendi(array $sunucu): bool
    {
        return stripos(self::metin($sunucu['HTTP_ACCEPT'] ?? ''), 'application/json') !== false;
    }

    private static function metin(mixed $deger): string
    {
        return is_string($deger) ? $deger : '';
    }

    private static function kirp(string $deger): string
    {
        return preg_replace(self::KIRP, '', $deger) ?? '';
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
