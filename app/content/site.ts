// Tek kaynak: sitedeki tüm kurumsal olgular buradan okunur. Doğrulanmamış veya eksik bilgi uydurulmaz, `todo` ile işaretlenir.

export type Todo = { readonly todo: string };

function todo(not: string): Todo {
  return { todo: not };
}

export function isTodo(deger: unknown): deger is Todo {
  return typeof deger === "object" && deger !== null && "todo" in deger;
}

export type SosyalHesap = { readonly ad: string; readonly url: string };

export const SITE = {
  marka: "Hanedan Pilav",
  alanAdi: "https://www.hanedanpilav.com",
  kurulusYili: 1998,
  // Üretim KAPASİTESİ; gerçekleşen üretim miktarı olarak sunulmaz.
  uretimKapasitesi: { miktar: 1, birim: "ton", periyot: "gunluk" },
  telefon: {
    e164: "+905336163754",
    gorunen: "+90 533 616 37 54",
  },
  whatsapp: {
    numara: "905336163754",
    // Numaranın WhatsApp hesabına bağlı olduğu müşteriyle henüz doğrulanmadı.
    dogrulandi: false,
  },
  adres: {
    mahalle: "Yunus Emre Mah.",
    cadde: "Adem Yavuz Cd.",
    kapiNo: "No:76",
    postaKodu: "34260",
    ilce: "Sultangazi",
    il: "İstanbul",
  },
  calismaSaatleri: {
    gunler: "her-gun",
    acilis: "09:00",
    kapanis: "17:00",
  },
  eposta: null as string | null,
  sosyal: [] as readonly SosyalHesap[],
  // Dolu olmayan alan yayın kapısını düşürür: null yalnız kep ve mersisNo içindir; diğerleri boş olmayan TR ve EN değer ister.
  yasal: {
    unvan: todo("Ticari unvan müşteriden alınacak (KVKK veri sorumlusu bilgisi için gerekli)."),
    vergiDairesi: todo("Vergi dairesi müşteriden alınacak."),
    vergiNo: todo("Vergi numarası müşteriden alınacak."),
    mersisNo: todo("MERSİS numarası müşteriden alınacak. Yoksa null yapılır (null yalnız kep ve mersisNo için izinli)."),
    eposta: todo("Kurumsal e-posta adresi: KVKK başvuruları buraya gelir, formlar buraya iletilir."),
    kep: todo("KEP adresi. İşletmenin KEP adresi yoksa null yapılır, başvuru yollarından KEP satırı kalkar."),
    barindirma: todo("Barındırma sağlayıcısının unvanı ve sunucunun bulunduğu ülke."),
    epostaSaglayici: todo("Kurumsal e-posta hizmeti sağlayıcısının unvanı ve sunucularının bulunduğu ülke."),
    yurtDisiAktarim: todo(
      "Yurt dışına aktarım cümlesi (TR/EN). Sağlayıcılardan biri yurt dışındaysa KVKK md. 9 dayanağı (yeterlilik kararı, Kurula bildirilen standart sözleşme vb.) yazılır; yoksa 'yurt dışına aktarılmaz' denir.",
    ),
    saklamaSuresi: todo("Form e-postalarının saklama süresi (TR/EN), örneğin talebin sonuçlanmasından itibaren kaç ay/yıl."),
    // Form betiğinin gerçek davranışı: yalnız geçerli gönderimde IP'nin HMAC özeti oluşur, pencere_sn (600) dolunca betiğe gelen ilk istekte silinir.
    ipSuresi: {
      tr: "Hız sınırı için IP adresinizin kendisi değil, ondan türetilen tek yönlü bir özet kullanılır. Özet yalnız geçerli bir gönderimde oluşturulur. Hız sınırı penceresi son geçerli gönderimden itibaren 10 dakikadır; yeni bir geçerli gönderim süreyi uzatır. Süre dolunca özet, form betiğine gelen ilk istekte ve ayrıca sunucuda 10 dakikada bir çalışan zamanlanmış görevle silinir.",
      en: "For rate limiting, we use a one-way hash derived from your IP address, not the address itself. The hash is created only when a valid submission is made. The rate-limit window is 10 minutes from the most recent valid submission; each new valid submission extends it. Once the window has passed, the hash is deleted on the first request to the form script and also by a scheduled task that runs on the server every 10 minutes.",
    },
    sunucuKayitlari: todo(
      "Barındırma sunucusunun erişim kaydı (IP, tarih/saat, istenen sayfa) tutup tutmadığı ve saklama süresi (TR/EN).",
    ),
  },
} as const;

export function adresSatirlari(): [string, string] {
  const a = SITE.adres;
  return [`${a.mahalle}, ${a.cadde} ${a.kapiNo}`, `${a.postaKodu} ${a.ilce}/${a.il}`];
}

export function adresTekSatir(): string {
  return adresSatirlari().join(", ");
}
