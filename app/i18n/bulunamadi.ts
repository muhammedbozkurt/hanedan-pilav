// 404 sayfasının gövde metinleri (TR/EN). Sayfa başlığı ve açıklaması (meta) tr.ts/en.ts'deki `sayfalar.bulunamadi.meta`dan gelir.
import type { Dil } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";

export type BulunamadiHedefi = "anasayfa" | "bayilerimiz" | "iletisim";

export type BulunamadiSozluk = {
  readonly etiket: string;
  readonly baslik: string;
  readonly giris: string;
  readonly devamBaslik: string;
  readonly baglantilar: Readonly<Record<BulunamadiHedefi, { readonly baslik: string; readonly aciklama: string }>>;
};

export const bulunamadiTr: BulunamadiSozluk = {
  etiket: "404 · Sayfa bulunamadı",
  baslik: "Bu sayfa menüde yok.",
  giris:
    "Bağlantı eskimiş ya da sayfa taşınmış olabilir. Merak etmeyin, aradığınız lezzet yerinde: aşağıdaki sayfalardan devam edebilirsiniz.",
  devamBaslik: "Buradan devam edin",
  baglantilar: {
    anasayfa: { baslik: "Anasayfa", aciklama: "Hanedan Pilav’a baştan göz atın." },
    bayilerimiz: { baslik: "Bayilerimiz", aciklama: "Size en yakın şubeyi bulun." },
    iletisim: { baslik: "İletişim", aciklama: "Bize ulaşmanın tüm yolları." },
  },
};

export const bulunamadiEn: BulunamadiSozluk = {
  etiket: "404 · Page not found",
  baslik: "This page isn’t on the menu.",
  giris:
    "The link may be out of date, or the page may have moved. Everything else is right where it should be, so pick up from one of the pages below.",
  devamBaslik: "Keep going from here",
  baglantilar: {
    anasayfa: { baslik: "Homepage", aciklama: "Start again from the top." },
    bayilerimiz: { baslik: "Locations", aciklama: "Find the Hanedan Pilav location nearest you." },
    iletisim: { baslik: "Contact", aciklama: "All the ways to reach us." },
  },
};

const SOZLUKLER: Readonly<Record<Dil, BulunamadiSozluk>> = { tr: bulunamadiTr, en: bulunamadiEn };

export function useBulunamadi(): BulunamadiSozluk {
  return SOZLUKLER[useLang()];
}
