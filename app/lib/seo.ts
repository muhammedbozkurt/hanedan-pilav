import type { MetaDescriptor } from "react-router";
import { SITE } from "~/content/site.ts";
import { sozluk } from "~/i18n/index.ts";
import { ACIKLAMA_UST_SINIR, BASLIK_UST_SINIR, sinirla } from "./metin-sinir.ts";
import { DILLER, type Dil, type Parametreler, type SayfaAnahtari, VARSAYILAN_DIL, dilBul, yol } from "./rotalar.ts";

export const SITE_URL = SITE.alanAdi;

const OG_GORSEL = { yol: "/img/og-hanedan-pilav.png", genislik: 1200, yukseklik: 630 };

export type SeoGirdisi = {
  anahtar: SayfaAnahtari;
  dil: Dil;
  baslik: string;
  aciklama: string;
  params?: Parametreler;
  gorsel?: string;
  indeksle?: boolean;
};

function mutlak(yolVeyaUrl: string): string {
  return /^https?:\/\//.test(yolVeyaUrl) ? yolVeyaUrl : `${SITE_URL}${yolVeyaUrl}`;
}

export function seo({ anahtar, dil, baslik: hamBaslik, aciklama: hamAciklama, params, gorsel, indeksle = true }: SeoGirdisi): MetaDescriptor[] {
  const baslik = sinirla(hamBaslik, BASLIK_UST_SINIR);
  const aciklama = sinirla(hamAciklama, ACIKLAMA_UST_SINIR);
  const url = mutlak(yol(anahtar, dil, params));
  const gorselUrl = mutlak(gorsel ?? OG_GORSEL.yol);
  const t = sozluk(dil);
  const etiketler: MetaDescriptor[] = [
    { title: baslik },
    { name: "description", content: aciklama },
    { tagName: "link", rel: "canonical", href: url },
    ...DILLER.map(
      (d): MetaDescriptor => ({ tagName: "link", rel: "alternate", hrefLang: d, href: mutlak(yol(anahtar, d, params)) }),
    ),
    {
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: mutlak(yol(anahtar, VARSAYILAN_DIL, params)),
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE.marka },
    { property: "og:url", content: url },
    { property: "og:title", content: baslik },
    { property: "og:description", content: aciklama },
    { property: "og:image", content: gorselUrl },
    { property: "og:locale", content: t.dil.ogLocale },
    ...DILLER.filter((d) => d !== dil).map(
      (d): MetaDescriptor => ({ property: "og:locale:alternate", content: sozluk(d).dil.ogLocale }),
    ),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: baslik },
    { name: "twitter:description", content: aciklama },
    { name: "twitter:image", content: gorselUrl },
  ];
  if (!gorsel) {
    etiketler.push(
      { property: "og:image:alt", content: SITE.marka },
      { property: "og:image:width", content: String(OG_GORSEL.genislik) },
      { property: "og:image:height", content: String(OG_GORSEL.yukseklik) },
    );
  }
  if (!indeksle) etiketler.push({ name: "robots", content: "noindex" });
  return etiketler;
}

type SabitMetaliSayfa = Exclude<SayfaAnahtari, "bayiDetay">;

// Sabit başlık/açıklamalı sayfalar için kısa yol: dil, yoldan çözülür.
export function sayfaSeo(anahtar: SabitMetaliSayfa, pathname: string, secenek: { indeksle?: boolean } = {}): MetaDescriptor[] {
  const dil = dilBul(pathname);
  const m = sozluk(dil).sayfalar[anahtar].meta;
  return seo({ anahtar, dil, baslik: m.baslik, aciklama: m.aciklama, ...secenek });
}
