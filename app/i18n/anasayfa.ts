// Anasayfa sözlüğü. TR tip kaynağıdır; EN aynı tipi sağlar. Metinler onaylı "E Esnaf Tabelası" referansından gelir; olgular app/content/site.ts'ten.
import type { Dil } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";

const tr = {
  meta: {
    baslik: "Hanedan Pilav · 1998’den beri değişmeyen lezzet",
    aciklama:
      "Hanedan Pilav: 1998’den beri değişmeyen lezzet. Günlük 1 ton üretim kapasitesi, İstanbul geneli şube ve lojistik ağı, bayilik ve toplu yemek hizmeti.",
  },
  acilis: {
    baslikBas: "1998’den beri",
    baslikSon: "değişmeyen lezzet.",
    giris:
      "Şubede tabak tabak, organizasyonda kazan kazan. Günlük 1\u00a0ton üretim kapasitesiyle bayilerimize ve kurumsal firmalara hizmet veriyoruz.",
    teklif: "Toplu Yemek Teklifi",
  },
  kunye: {
    baslik: "Kısaca Hanedan Pilav",
    kurulus: "Kuruluş yılımız",
    kapasite: "Günlük üretim kapasitesi",
    kapasiteDeger: (miktar: number) => `${miktar}\u00a0ton`,
    ag: "Geneline yayılan şube ve lojistik ağı",
    agDeger: "İstanbul",
    merkez: "Merkezimiz",
  },
  hizmetler: {
    baslik: "Esnaf samimiyeti, kurumsal düzen.",
    bayilik: {
      baslik: "Franchise ve bayilik",
      metin: "Yatırımcılar için sürdürülebilir bir iş modeli: kendi Hanedan Pilav şubenizi açın.",
    },
    catering: {
      baslik: "Toplu yemek ve organizasyon",
      metin: "Kurumsal firmalara ve organizasyonlara, yüksek üretim kapasitesiyle profesyonel ve güvenilir hizmet.",
    },
    bayiler: {
      baslik: "Bayilerimizi bulun",
      metin: "Size en yakın Hanedan Pilav şubesini bulun.",
    },
  },
  hikaye: {
    etiket: "Kurumsal",
    baslik: "Geleneksel lezzet, modern üretim.",
    giris: "Hanedan Pilav, kuruluşundan bu yana gıda sektöründe köklü bir güven markası haline geldi.",
    ilkeler: {
      lezzet: { baslik: "Lezzet", metin: "Geleneksel pişirme anlayışına bağlı mutfak." },
      hijyen: { baslik: "Hijyen", metin: "Titizlikle uygulanan hijyen standartları." },
      sureklilik: { baslik: "Süreklilik", metin: "Operasyonel sürekliliği önceleyen üretim ve lojistik." },
    },
    eylem: "Kurumsal hikayemiz",
  },
  harita: {
    baslik: "İstanbul geneline yayılan bir ağ.",
    metin: "Şubelerimizin tam listesi ve size en yakın bayi, Bayilerimiz sayfasında.",
    eylem: "En Yakın Bayiyi Bul",
    pin: "Merkez",
    karadeniz: "Karadeniz",
    marmara: "Marmara Denizi",
    ariaEtiket: (merkez: string) => `İstanbul haritası, merkez: ${merkez}`,
  },
  galeri: {
    baslik: "Kazandan tabağa.",
    eylem: "Tüm galeri",
    seritAria: "Galeri şeridi",
  },
  plaka: {
    etiket: "Franchise",
    baslik: "Hanedan Pilav bayisi olun.",
    metin: "Büyümeye devam eden bayilik ağımıza katılın. Başvuru formunu doldurun ya da bize doğrudan ulaşın.",
    telefon: "Telefon",
    mesaj: "Mesaj",
  },
};

export type AnasayfaSozluk = typeof tr;

const en: AnasayfaSozluk = {
  meta: {
    baslik: "Hanedan Pilav · Made the same way since 1998",
    aciklama:
      "Hanedan Pilav, made the same way since 1998. Franchise opportunities, catering and locations across Istanbul.",
  },
  acilis: {
    baslikBas: "Made the same way",
    baslikSon: "since 1998.",
    giris: "By the plate or by the pot: one metric\u00a0ton of daily capacity, serving our franchisees and corporate clients.",
    teklif: "Get a Catering Quote",
  },
  kunye: {
    baslik: "Hanedan Pilav at a glance",
    kurulus: "Founded",
    kapasite: "Daily production capacity (metric ton)",
    kapasiteDeger: (miktar) => `${miktar}\u00a0ton`,
    ag: "Locations and logistics across the city",
    agDeger: "Istanbul",
    merkez: "Headquarters",
  },
  hizmetler: {
    baslik: "Local-shop warmth, corporate standards.",
    bayilik: {
      baslik: "Franchise",
      metin: "A sustainable business model for investors: open your own Hanedan Pilav franchise.",
    },
    catering: {
      baslik: "Catering and events",
      metin: "Professional, reliable catering for companies and large events, backed by high production capacity.",
    },
    bayiler: {
      baslik: "Find a location",
      metin: "Find the Hanedan Pilav location nearest you.",
    },
  },
  hikaye: {
    etiket: "About us",
    baslik: "Traditional flavor, modern production.",
    giris: "Since its founding, Hanedan Pilav has grown into a long-trusted name in the food industry.",
    ilkeler: {
      lezzet: { baslik: "Flavor", metin: "A kitchen rooted in traditional cooking." },
      hijyen: { baslik: "Hygiene", metin: "Rigorous hygiene standards." },
      sureklilik: { baslik: "Continuity", metin: "Production and logistics built for operational continuity." },
    },
    eylem: "Read our story",
  },
  harita: {
    baslik: "Locations across Istanbul.",
    metin: "The full list, including the location nearest you, is on our Locations page.",
    eylem: "Find a Location",
    pin: "HQ",
    karadeniz: "Black Sea",
    marmara: "Sea of Marmara",
    ariaEtiket: (merkez) => `Map of Istanbul, headquarters: ${merkez}`,
  },
  galeri: {
    baslik: "From the pot to the plate.",
    eylem: "Full gallery",
    seritAria: "Gallery strip",
  },
  plaka: {
    etiket: "Franchise",
    baslik: "Hang your own Hanedan Pilav sign.",
    metin: "Hanedan Pilav is growing through franchising. Fill out the application form or contact us directly.",
    telefon: "Phone",
    mesaj: "Message",
  },
};

const SOZLUKLER: Readonly<Record<Dil, AnasayfaSozluk>> = { tr, en };

export function anasayfaSozluk(dil: Dil): AnasayfaSozluk {
  return SOZLUKLER[dil];
}

export function useAnasayfa(): AnasayfaSozluk {
  return anasayfaSozluk(useLang());
}
