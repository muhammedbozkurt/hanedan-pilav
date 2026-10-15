// Rota tablosunun tek kaynağı: routes.ts, prerender listesi, dil seçici, hreflang ve kapı betikleri buradan okur.
// Node betikleri de içe aktardığı için yalnız tip silinebilir sözdizimi ve göreli `.ts` içe aktarma kullanılır.
import { BAYILER } from "../content/bayiler.ts";

export const DILLER = ["tr", "en"] as const;
export type Dil = (typeof DILLER)[number];
export const VARSAYILAN_DIL: Dil = "tr";

type SayfaTanimi = { readonly modul: string } & Readonly<Record<Dil, string>>;

export const SAYFALAR = {
  anasayfa: { modul: "routes/anasayfa.tsx", tr: "/", en: "/en" },
  kurumsal: { modul: "routes/kurumsal.tsx", tr: "/kurumsal", en: "/en/about" },
  bayilerimiz: { modul: "routes/bayilerimiz.tsx", tr: "/bayilerimiz", en: "/en/locations" },
  bayiDetay: { modul: "routes/bayi-detay.tsx", tr: "/bayilerimiz/:slug", en: "/en/locations/:slug" },
  galeri: { modul: "routes/galeri.tsx", tr: "/galeri", en: "/en/gallery" },
  iletisim: { modul: "routes/iletisim.tsx", tr: "/iletisim", en: "/en/contact" },
  kvkk: { modul: "routes/kvkk.tsx", tr: "/kvkk", en: "/en/privacy" },
  cerez: { modul: "routes/cerez.tsx", tr: "/cerez-politikasi", en: "/en/cookies" },
  bulunamadi: { modul: "routes/bulunamadi.tsx", tr: "/404", en: "/en/404" },
} as const satisfies Record<string, SayfaTanimi>;

export type SayfaAnahtari = keyof typeof SAYFALAR;
export const SAYFA_ANAHTARLARI = Object.keys(SAYFALAR) as SayfaAnahtari[];

export type Parametreler = Readonly<Record<string, string>>;

// Parametreli rotaların prerender edilecek değerleri veriden üretilir.
const PARAMETRE_KAYNAKLARI: Partial<Record<SayfaAnahtari, () => Parametreler[]>> = {
  bayiDetay: () => BAYILER.map((b) => ({ slug: b.slug })),
};

// Bayilik başvurusu çapası: bayilerimiz sayfasındaki bölümün id'si, dile göre.
export const BAYILIK_CAPASI: Readonly<Record<Dil, string>> = {
  tr: "bayimiz-olun",
  en: "become-a-franchisee",
};

export function rotaId(dil: Dil, anahtar: SayfaAnahtari): string {
  return `${dil}.${anahtar}`;
}

export function rotaIdCoz(id: string): { dil: Dil; anahtar: SayfaAnahtari } | null {
  const [dil, anahtar] = id.split(".");
  if (!dil || !anahtar) return null;
  if (!(DILLER as readonly string[]).includes(dil)) return null;
  if (!(anahtar in SAYFALAR)) return null;
  return { dil: dil as Dil, anahtar: anahtar as SayfaAnahtari };
}

export function dilBul(pathname: string): Dil {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
}

export function yolParametreleri(desen: string): string[] {
  return desen
    .split("/")
    .filter((p) => p.startsWith(":"))
    .map((p) => p.slice(1));
}

export function yol(anahtar: SayfaAnahtari, dil: Dil, params: Parametreler = {}): string {
  return SAYFALAR[anahtar][dil].replace(/:([A-Za-z0-9_]+)/g, (_, ad: string) => {
    const deger = params[ad];
    if (deger === undefined) throw new Error(`"${anahtar}" yolu için "${ad}" parametresi eksik.`);
    return encodeURIComponent(deger);
  });
}

export function bayilikYolu(dil: Dil): string {
  return `${yol("bayilerimiz", dil)}#${BAYILIK_CAPASI[dil]}`;
}

export function sayfaYollari(anahtar: SayfaAnahtari, dil: Dil): string[] {
  const desen = SAYFALAR[anahtar][dil];
  if (yolParametreleri(desen).length === 0) return [desen];
  const kaynak = PARAMETRE_KAYNAKLARI[anahtar];
  if (!kaynak) throw new Error(`"${anahtar}" parametreli ama PARAMETRE_KAYNAKLARI içinde değeri yok.`);
  return kaynak().map((p) => yol(anahtar, dil, p));
}

export function tumYollar(): string[] {
  return SAYFA_ANAHTARLARI.flatMap((anahtar) => DILLER.flatMap((dil) => sayfaYollari(anahtar, dil)));
}
