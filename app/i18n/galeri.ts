import type { Dil } from "~/lib/rotalar.ts";
import type { Kategori } from "~/content/galeri.ts";

const tr = {
  meta: {
    baslik: "Galeri · Hanedan Pilav",
    aciklama: "Hanedan Pilav galerisi: üretim mutfağı, kazan başı, organizasyon servisi ve tabakta pilav.",
  },
  etiket: "Galeri",
  baslik: "Kazandan tabağa.",
  giris: "Kazan başından servis masasına, Hanedan Pilav mutfağından kareler.",
  filtre: {
    grup: "Kategoriye göre filtrele",
    param: "kategori",
    tumu: "Tümü",
    kategori: {
      urunler: "Ürünler",
      uretim: "Üretim",
      organizasyon: "Organizasyon",
      bayiler: "Bayiler",
    } satisfies Record<Kategori, string>,
  },
  adet: (n: number) => `${n} kare gösteriliyor`,
  bos: {
    baslik: "Bu kategoride henüz kare yok.",
    metin: "Yeni fotoğraflar çekildikçe burada yer alacak.",
    sifirla: "Tüm kareleri göster",
  },
  kutu: {
    ac: (konu: string) => `Büyüt: ${konu}`,
    etiket: "Fotoğraf görüntüleyici",
    kapat: "Kapat",
    onceki: "Önceki fotoğraf",
    sonraki: "Sonraki fotoğraf",
  },
};

export type GaleriMetin = typeof tr;

const en: GaleriMetin = {
  meta: {
    baslik: "Gallery · Hanedan Pilav",
    aciklama: "The Hanedan Pilav gallery: our production kitchen, the cook at the pot, event service, and pilaf on the plate.",
  },
  etiket: "Gallery",
  baslik: "From the pot to the plate.",
  giris: "From the pot to the serving table: scenes from the Hanedan Pilav kitchen.",
  filtre: {
    grup: "Filter by category",
    param: "category",
    tumu: "All",
    kategori: {
      urunler: "Products",
      uretim: "Production",
      organizasyon: "Events",
      bayiler: "Locations",
    },
  },
  adet: (n: number) => (n === 1 ? "Showing 1 photo" : `Showing ${n} photos`),
  bos: {
    baslik: "No photos in this category yet.",
    metin: "New photos will appear here as we shoot them.",
    sifirla: "Show all photos",
  },
  kutu: {
    ac: (konu: string) => `Enlarge: ${konu}`,
    etiket: "Photo viewer",
    kapat: "Close",
    onceki: "Previous photo",
    sonraki: "Next photo",
  },
};

export function galeriMetin(dil: Dil): GaleriMetin {
  return dil === "tr" ? tr : en;
}
