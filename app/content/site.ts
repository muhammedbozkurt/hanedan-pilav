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
      tr: "IP adresinizin kendisi değil, ondan türetilen tek yönlü bir özet 10 dakikalık hız sınırı penceresi boyunca kullanılır; pencere dolduktan sonra form betiğine gelen ilk istekte kalıcı olarak silinir.",
      en: "Not your IP address itself but a one-way hash derived from it is used for the 10-minute rate-limit window; once the window has passed, it is permanently deleted on the next request to the form script.",
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
