// Kurumsal sayfası sözlüğü. TR tip kaynağıdır; EN aynı tipi sağlar. Olgular yalnız app/content/site.ts ve mevcut sitedeki ifadelerden gelir.
import type { Dil } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";

const tr = {
  meta: {
    baslik: "Kurumsal · Hanedan Pilav",
    aciklama:
      "1998’den bu yana Hanedan Pilav: günlük 1 ton üretim kapasitesi, titiz hijyen standartları, İstanbul geneli şube ağı ve kurumsal firmalara toplu yemek hizmeti.",
  },
  baslik: {
    etiket: "Kurumsal",
    baslik: "Geleneksel lezzet, modern üretim.",
    giris: "Hanedan Pilav, 1998’deki kuruluşundan bu yana gıda sektöründe köklü bir güven markası haline geldi.",
  },
  hikaye: {
    baslik: "1998’den bugüne.",
    paragraflar: [
      "Hanedan Pilav’ın temeli 1998’de atıldı. İlk günden bu yana geleneksel lezzet anlayışımızı koruyor, onu modern üretim standartlarıyla birleştiriyoruz.",
      "Bugün Sultangazi’deki merkezimizden, İstanbul’un geneline yayılan şube ve lojistik ağımızla hem şubelerimize hem de kurumsal firmalara hizmet veriyoruz.",
    ],
    kunye: {
      baslik: "Kısaca Hanedan Pilav",
      kurulus: "Kuruluş",
      merkez: "Merkez",
      kapasite: "Günlük üretim kapasitesi",
      kapasiteDeger: (miktar: number) => `${miktar}\u00a0ton`,
      hizmetAlani: "Hizmet alanı",
      hizmetAlaniDeger: "İstanbul geneli",
    },
    gorsel: { konu: "üretim mutfağı", not: "Geniş plan; paslanmaz tezgâhlar, düzen ve temizlik." },
  },
  calisma: {
    baslik: "Nasıl çalışıyoruz?",
    maddeler: {
      uretim: {
        baslik: "Yüksek kapasiteli üretim",
        metin: "Günlük 1\u00a0ton üretim kapasitemizle hem şubelerimizin hem de toplu yemek siparişlerinin ihtiyacını karşılıyoruz.",
      },
      hijyen: {
        baslik: "Titiz hijyen standartları",
        metin: "Yüksek kapasitede üretirken hijyen standartlarından taviz vermiyor, onları üretimin her aşamasında uyguluyoruz.",
      },
      lojistik: {
        baslik: "İstanbul geneli şube ve lojistik ağı",
        metin: "Şubelerimiz ve lojistik ağımız İstanbul’un geneline yayılır; bu sayede şehrin her yerine hizmet verebiliyoruz.",
      },
    },
  },
  catering: {
    baslik: "Toplu yemek ve organizasyon.",
    metin: "Yüksek üretim kapasitemizle profesyonel ve güvenilir toplu yemek çözümleri sunuyoruz.",
    alanlarBaslik: "Hizmet verdiğimiz alanlar",
    alanlar: {
      kurumsal: "Kurumsal firmalar",
      toplu: "Toplu yemekler",
      organizasyon: "Organizasyonlar",
    },
    eylem: "Teklif İste",
    gorsel: { konu: "toplu yemek servisi", not: "Servis hattında kazanlar; geniş plan, sıcak ışık." },
  },
  degerler: {
    baslik: "Neye önem veriyoruz?",
    maddeler: {
      lezzet: { baslik: "Lezzet", metin: "Geleneksel pişirme anlayışından ödün vermeyen bir mutfak." },
      hijyen: { baslik: "Hijyen", metin: "Mutfakta temizlik ve düzen, her gün aynı titizlikle uygulanır." },
      sureklilik: {
        baslik: "Süreklilik",
        metin: "Her gün aynı lezzeti sunabilmek için üretimde ve lojistikte sürekliliği önceliyoruz.",
      },
    },
  },
  kapanis: {
    baslik: "Kendi Hanedan Pilav şubenizi açın.",
    metin: "Bayilik başvurusuyla ilgili bilgiler Bayilerimiz sayfasında.",
  },
};

export type KurumsalSozluk = typeof tr;

const en: KurumsalSozluk = {
  meta: {
    baslik: "About Us · Hanedan Pilav",
    aciklama:
      "Hanedan Pilav since 1998: one metric ton of daily production capacity, rigorous hygiene standards, locations across Istanbul and catering for companies and events.",
  },
  baslik: {
    etiket: "About us",
    baslik: "Traditional flavor, modern production.",
    giris: "Since its founding in 1998, Hanedan Pilav has grown into a long-trusted name in the food industry.",
  },
  hikaye: {
    baslik: "From 1998 to today.",
    paragraflar: [
      "Hanedan Pilav was founded in 1998. From day one, we have held on to a traditional approach to flavor and paired it with modern production standards.",
      "Today, from our headquarters in Sultangazi, a network of locations and logistics across Istanbul lets us serve our restaurants and corporate clients alike.",
    ],
    kunye: {
      baslik: "Hanedan Pilav at a glance",
      kurulus: "Founded",
      merkez: "Headquarters",
      kapasite: "Daily production capacity",
      kapasiteDeger: (miktar) => `${miktar}\u00a0metric ton`,
      hizmetAlani: "Service area",
      hizmetAlaniDeger: "All of Istanbul",
    },
    gorsel: { konu: "production kitchen", not: "Wide shot; stainless counters, order and cleanliness." },
  },
  calisma: {
    baslik: "How we work.",
    maddeler: {
      uretim: {
        baslik: "High-capacity production",
        metin: "One metric ton of daily production capacity covers our locations and large catering orders alike.",
      },
      hijyen: {
        baslik: "Rigorous hygiene standards",
        metin: "Volume never comes at the expense of hygiene. We apply our standards at every stage of production.",
      },
      lojistik: {
        baslik: "Locations and logistics across Istanbul",
        metin: "Our locations and logistics network span the city, so we can serve customers anywhere in Istanbul.",
      },
    },
  },
  catering: {
    baslik: "Catering for companies and events.",
    metin: "Backed by high production capacity, we offer professional, dependable catering.",
    alanlarBaslik: "Who we serve",
    alanlar: {
      kurumsal: "Corporate clients",
      toplu: "Group meals",
      organizasyon: "Events",
    },
    eylem: "Request a Quote",
    gorsel: { konu: "catering service", not: "Pots on the serving line; wide shot, warm light." },
  },
  degerler: {
    baslik: "What we stand for.",
    maddeler: {
      lezzet: { baslik: "Flavor", metin: "A kitchen that stays true to traditional cooking." },
      hijyen: { baslik: "Hygiene", metin: "Cleanliness and order, kept with the same care every single day." },
      sureklilik: {
        baslik: "Continuity",
        metin: "Steady production and logistics, so the flavor you get today is the flavor you get tomorrow.",
      },
    },
  },
  kapanis: {
    baslik: "Open your own Hanedan Pilav location.",
    metin: "You’ll find how to apply on our Locations page.",
  },
};

const SOZLUKLER: Readonly<Record<Dil, KurumsalSozluk>> = { tr, en };

export function kurumsalSozluk(dil: Dil): KurumsalSozluk {
  return SOZLUKLER[dil];
}

export function useKurumsal(): KurumsalSozluk {
  return kurumsalSozluk(useLang());
}
