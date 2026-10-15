// Bayilerimiz ve bayi detay sözlüğü. TR tip kaynağıdır; EN aynı tipi sağlar.
// Bayilik anlatımı yalnız mevcut site olgularına dayanır: süreç adımı, yatırım tutarı veya kazanç vaadi yazılmaz.
import type { Dil } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";
import { metrikTon } from "./olgular.ts";

const tr = {
  meta: {
    baslik: "Bayilerimiz · Hanedan Pilav",
    aciklama:
      "Hanedan Pilav bayileri: ilçenize göre bayi bulun; adres, telefon ve yol tarifine ulaşın. Bayilik başvurusunu da bu sayfadan yapabilirsiniz.",
  },
  baslik: {
    etiket: "Bayilerimiz",
    baslik: "Size en yakın bayiyi bulun.",
    giris: "İlçenizi seçin; bayimizin adresine, telefonuna ve yol tarifine buradan ulaşın. Merkezimiz İstanbul Sultangazi’de.",
    sayac: (adet: number) => `${adet} bayi`,
  },
  bulucu: {
    baslik: "Bayi bulucu",
    ilce: "İlçe",
    tumIlceler: "Tüm ilçeler",
    yaka: { avrupa: "Avrupa Yakası", anadolu: "Anadolu Yakası" },
    ara: "Ara",
    araIpucu: "Bayi adı ya da ilçe…",
    konum: {
      dugme: "Konumumu kullan",
      bekliyor: "Konum alınıyor…",
      hata: "Konumunuza erişilemedi. İlçe seçerek arayabilirsiniz.",
      not: "Konumunuz yalnız bu cihazda mesafe hesabı için kullanılır; hiçbir yere gönderilmez, saklanmaz.",
      siralandi: "Bayiler size olan uzaklığa göre sıralandı.",
    },
    mesafe: (km: string) => `${km} km`,
    sonuc: (adet: number) => (adet === 0 ? "Bayi bulunamadı." : `${adet} bayi listeleniyor.`),
    listeBaslik: "Bayi listesi",
    temizle: "Tüm bayileri göster",
    bos: {
      ilceBaslik: "Bu ilçede henüz bayimiz yok.",
      ilceMetin: (ilce: string) => `${ilce} ilçesinde Hanedan Pilav şubesi açmak isterseniz başvurunuzu bekliyoruz.`,
      aramaBaslik: "Aramanızla eşleşen bayi yok.",
      aramaMetin: "Farklı bir ad ya da ilçe deneyin.",
    },
    harita: {
      goster: "Haritayı göster",
      gizle: "Haritayı gizle",
      sube: (adet: number) => (adet === 1 ? "Bayi" : `${adet} bayi`),
    },
  },
  satir: {
    tur: { merkez: "Merkez", sube: "Şube" },
    telefonSr: "Telefon:",
    yolTarifi: "Yol tarifi",
    yolTarifiAria: (ad: string) => `Yol tarifi: ${ad}`,
  },
  bayilik: {
    etiket: "Bayilik",
    baslik: "Hanedan Pilav bayisi olun.",
    giris:
      "Büyümeye devam eden franchise ve bayilik yapımızla yatırımcılara sürdürülebilir bir iş modeli sunuyoruz. Kendi Hanedan Pilav şubenizi açmak istiyorsanız formu doldurun.",
    olgularBaslik: "Kısaca Hanedan Pilav",
    olgular: {
      kurulus: "Kuruluş",
      kapasite: "Günlük üretim kapasitesi",
      kapasiteDeger: (miktar: number) => `${miktar}\u00a0ton`,
      merkez: "Merkez",
      merkezDeger: "Sultangazi, İstanbul",
    },
    sonrakiBaslik: "Sonraki adım",
    sonraki: "Başvurunuzu aldıktan sonra sizinle iletişime geçiyoruz.",
    telefonOnce: "Başvurmadan önce sorularınız için:",
    formBaslik: "Başvuru formu",
  },
  detay: {
    meta: {
      baslik: (ad: string) => `${ad} · Hanedan Pilav`,
      aciklama: (ad: string, adres: string) =>
        `Hanedan Pilav ${ad}: ${adres}. Adres, telefon, çalışma saatleri ve yol tarifi.`,
    },
    geri: "Tüm bayiler",
    bilgiBaslik: "İletişim bilgileri",
    adres: "Adres",
    telefon: "Telefon",
    ara: "Hemen arayın",
    yolTarifi: "Yol tarifi",
    haritaBaslik: "Haritada konum",
  },
};

export type BayilerimizSozluk = typeof tr;

const en: BayilerimizSozluk = {
  meta: {
    baslik: "Locations · Hanedan Pilav",
    aciklama:
      "Find a Hanedan Pilav location by district and get the address, phone number, and directions. You can also apply for a franchise on this page.",
  },
  baslik: {
    etiket: "Locations",
    baslik: "Find a location near you.",
    giris: "Pick your district to get the address, phone number, and directions for a location near you. Our headquarters is in Sultangazi, Istanbul.",
    sayac: (adet) => `${adet} locations`,
  },
  bulucu: {
    baslik: "Location finder",
    ilce: "District",
    tumIlceler: "All districts",
    yaka: { avrupa: "European side", anadolu: "Asian side" },
    ara: "Search",
    araIpucu: "Location name or district…",
    konum: {
      dugme: "Use My Location",
      bekliyor: "Finding your location…",
      hata: "We couldn’t access your location. You can search by district instead.",
      not: "Your location stays on this device and is only used to calculate distance. It is never sent or stored.",
      siralandi: "Locations are now sorted by distance from you.",
    },
    mesafe: (km) => `${km} km`,
    sonuc: (adet) => (adet === 0 ? "No locations found." : adet === 1 ? "Showing 1 location." : `Showing ${adet} locations.`),
    listeBaslik: "Location list",
    temizle: "Show All Locations",
    bos: {
      ilceBaslik: "We don’t have a location in this district yet.",
      ilceMetin: (ilce) => `Interested in opening a franchise in ${ilce}? We’d like to hear from you.`,
      aramaBaslik: "No locations match your search.",
      aramaMetin: "Try a different name or district.",
    },
    harita: {
      goster: "Show Map",
      gizle: "Hide Map",
      sube: (adet) => (adet === 1 ? "Location" : `${adet} locations`),
    },
  },
  satir: {
    tur: { merkez: "Headquarters", sube: "Location" },
    telefonSr: "Phone:",
    yolTarifi: "Directions",
    yolTarifiAria: (ad) => `Directions to ${ad}`,
  },
  bayilik: {
    etiket: "Franchise",
    baslik: "Become a Hanedan Pilav franchisee.",
    giris:
      "Our franchise network keeps growing, and we offer investors a sustainable business model. If you’d like to open your own Hanedan Pilav location, fill out the form.",
    olgularBaslik: "Hanedan Pilav at a glance",
    olgular: {
      kurulus: "Founded",
      kapasite: "Daily production capacity",
      kapasiteDeger: metrikTon,
      merkez: "Headquarters",
      merkezDeger: "Sultangazi, Istanbul",
    },
    sonrakiBaslik: "What happens next",
    sonraki: "Once we receive your application, we’ll get in touch with you.",
    telefonOnce: "Have a question first? Call us:",
    formBaslik: "Franchise application",
  },
  detay: {
    meta: {
      baslik: (ad) => `${ad} · Hanedan Pilav`,
      aciklama: (ad, adres) => `Hanedan Pilav ${ad}: ${adres}. Address, phone number, hours, and directions.`,
    },
    geri: "All locations",
    bilgiBaslik: "Contact details",
    adres: "Address",
    telefon: "Phone",
    ara: "Call Now",
    yolTarifi: "Directions",
    haritaBaslik: "Location on the map",
  },
};

const SOZLUKLER: Readonly<Record<Dil, BayilerimizSozluk>> = { tr, en };

export function bayilerimizSozluk(dil: Dil): BayilerimizSozluk {
  return SOZLUKLER[dil];
}

export function useBayilerimiz(): BayilerimizSozluk {
  return bayilerimizSozluk(useLang());
}
