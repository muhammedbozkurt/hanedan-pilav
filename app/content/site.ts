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
  yasal: {
    unvan: todo("Ticari unvan müşteriden alınacak (KVKK veri sorumlusu bilgisi için gerekli)."),
    vergiDairesi: todo("Vergi dairesi müşteriden alınacak."),
    vergiNo: todo("Vergi numarası müşteriden alınacak."),
    mersisNo: todo("MERSİS numarası müşteriden alınacak."),
    eposta: todo("Kurumsal e-posta adresi: KVKK başvuruları buraya gelir, formlar buraya iletilir."),
    kep: todo("KEP adresi. İşletmenin KEP adresi yoksa null yapılır, başvuru yollarından KEP satırı kalkar."),
    barindirma: todo("Barındırma sağlayıcısının unvanı ve sunucunun bulunduğu ülke."),
    epostaSaglayici: todo("Kurumsal e-posta hizmeti sağlayıcısının unvanı ve sunucularının bulunduğu ülke."),
    yurtDisiAktarim: todo(
      "Yurt dışına aktarım cümlesi (TR/EN). Sağlayıcılardan biri yurt dışındaysa KVKK md. 9 dayanağı (yeterlilik kararı, Kurula bildirilen standart sözleşme vb.) yazılır; yoksa 'yurt dışına aktarılmaz' denir.",
    ),
    saklamaSuresi: todo("Form e-postalarının saklama süresi (TR/EN), örneğin talebin sonuçlanmasından itibaren kaç ay/yıl."),
    ipSuresi: todo("Hız sınırı için IP adresinin tutulduğu süre (TR/EN); form betiğindeki değerle aynı olmalı."),
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
