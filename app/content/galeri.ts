// Fotoğraf eklemek için: optimize edilmiş webp dosyasını public/img/galeri/ altına koyun, ilgili öğeye `src` ("/img/galeri/ad.webp")
// ve iki dilde `alt` ekleyin. Başka kod değişikliği gerekmez; öğe otomatik tıklanır olur ve büyük görünümde açılır.
// Fotoğrafı olmayan öğeler markalı yer tutucu olarak görünür; Türkçe çekim notu `npm run cekim-listesi` ile listelenir.

export type Oran = "4:3" | "4:5" | "3:2" | "1:1" | "16:9";

export type Kategori = "urunler" | "uretim" | "organizasyon" | "bayiler";

export const KATEGORILER: readonly Kategori[] = ["urunler", "uretim", "organizasyon", "bayiler"];

type Temel = {
  readonly id: string;
  readonly kategori: Kategori;
  readonly oran: Oran;
  readonly tr: { readonly konu: string; readonly not: string };
  readonly en: { readonly konu: string; readonly not: string };
};

type Yerturucu = { readonly src?: undefined; readonly alt?: undefined };
type Fotografli = { readonly src: string; readonly alt: { readonly tr: string; readonly en: string } };

export type GaleriOgesi = Temel & (Yerturucu | Fotografli);

export const GALERI: readonly GaleriOgesi[] = [
  {
    id: "kazan-basinda-usta",
    kategori: "uretim",
    oran: "4:5",
    tr: { konu: "kazan başında usta", not: "Buhar ve sıcak ışık." },
    en: { konu: "cook at the pot", not: "Steam and warm light." },
  },
  {
    id: "organizasyon-servisi",
    kategori: "organizasyon",
    oran: "3:2",
    tr: { konu: "organizasyon servisi", not: "Geniş açı, kurulu masalar." },
    en: { konu: "event service", not: "Wide angle, tables set." },
  },
  {
    id: "tabakta-pilav",
    kategori: "urunler",
    oran: "1:1",
    tr: { konu: "tabakta pilav", not: "Üstten çekim, doğal ışık." },
    en: { konu: "pilaf on the plate", not: "Overhead, natural light." },
  },
  {
    id: "nohutlu-pilav",
    kategori: "urunler",
    oran: "3:2",
    tr: { konu: "nohutlu pilav porsiyonu", not: "Yandan çekim, buğulu tabak." },
    en: { konu: "pilaf with chickpeas", not: "Side angle, steaming plate." },
  },
  {
    id: "dukkan-cephesi",
    kategori: "uretim",
    oran: "4:3",
    tr: { konu: "dükkân cephesi", not: "Tabela okunur, vitrin içeriden sıcak ışıkla aydınlık, akşamüstü." },
    en: { konu: "shop front", not: "Sign legible, window lit warmly from inside, early evening." },
  },
  {
    id: "uretim-mutfagi",
    kategori: "uretim",
    oran: "3:2",
    tr: { konu: "üretim mutfağı", not: "Geniş plan; paslanmaz tezgâhlar, düzen ve temizlik." },
    en: { konu: "production kitchen", not: "Wide shot; stainless counters, order and cleanliness." },
  },
];
