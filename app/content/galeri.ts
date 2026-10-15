// Galeri öğeleri. Fotoğraf çekilene kadar `src` boş kalır; Gorsel bileşeni aynı oranda yer tutucu gösterir.

export type Oran = "4:3" | "4:5" | "3:2" | "1:1" | "16:9";

export type GaleriOgesi = {
  readonly id: string;
  readonly oran: Oran;
  readonly src?: string;
  readonly tr: { readonly konu: string; readonly not: string };
  readonly en: { readonly konu: string; readonly not: string };
};

export const GALERI: readonly GaleriOgesi[] = [
  {
    id: "kazan-basinda-usta",
    oran: "4:5",
    tr: { konu: "kazan başında usta", not: "Buhar ve sıcak ışık." },
    en: { konu: "cook at the pot", not: "Steam and warm light." },
  },
  {
    id: "organizasyon-servisi",
    oran: "3:2",
    tr: { konu: "organizasyon servisi", not: "Geniş açı, kurulu masalar." },
    en: { konu: "event service", not: "Wide angle, tables set." },
  },
  {
    id: "tabakta-pilav",
    oran: "1:1",
    tr: { konu: "tabakta pilav", not: "Üstten çekim, doğal ışık." },
    en: { konu: "pilaf on the plate", not: "Overhead, natural light." },
  },
  {
    id: "uretim-alani",
    oran: "4:5",
    tr: { konu: "üretim alanında hijyen", not: "Eldiven ve bone, hijyen detayı." },
    en: { konu: "hygiene on the production floor", not: "Gloves and hairnets, hygiene detail." },
  },
  {
    id: "dukkan-cephesi",
    oran: "4:3",
    tr: { konu: "dükkân cephesi", not: "Tabela okunur, vitrin içeriden sıcak ışıkla aydınlık, akşamüstü." },
    en: { konu: "shop front", not: "Sign legible, window lit warmly from inside, early evening." },
  },
  {
    id: "uretim-mutfagi",
    oran: "4:5",
    tr: { konu: "üretim mutfağı", not: "Geniş plan; paslanmaz tezgâhlar, düzen ve temizlik." },
    en: { konu: "production kitchen", not: "Wide shot; stainless counters, order and cleanliness." },
  },
];
