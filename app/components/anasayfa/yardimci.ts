import { GALERI, type GaleriOgesi } from "~/content/galeri.ts";
import { type Dil, yol } from "~/lib/rotalar.ts";

// Kurumsal sayfadaki Catering bölümüyle aynı sözleşme (app/components/kurumsal/Catering.tsx): bölüm çapası ve iletişim formunun konu anahtarı.
const CATERING_CAPASI = "catering";
const KONU_ANAHTARI: Readonly<Record<Dil, string>> = { tr: "konu", en: "topic" };
const TEKLIF_KONUSU = "catering";

export function cateringYolu(dil: Dil): string {
  return `${yol("kurumsal", dil)}#${CATERING_CAPASI}`;
}

export function teklifYolu(dil: Dil): string {
  return `${yol("iletisim", dil)}?${new URLSearchParams({ [KONU_ANAHTARI[dil]]: TEKLIF_KONUSU })}`;
}

type GorselBilgisi = { konu: string; not: string; src?: string; alt?: string };

export function gorselBilgisi(oge: GaleriOgesi, dil: Dil): GorselBilgisi {
  const metin = oge[dil];
  return oge.src ? { ...metin, src: oge.src, alt: oge.alt[dil] } : { ...metin };
}

// Anasayfadaki fotoğraf yerleri galeri içeriğinden beslenir: galeri öğesine fotoğraf eklenince burada da görünür.
export function galeriGorseli(id: string, dil: Dil): GorselBilgisi {
  const oge = GALERI.find((o) => o.id === id);
  if (!oge) throw new Error(`Galeri öğesi bulunamadı: "${id}" (app/content/galeri.ts)`);
  return gorselBilgisi(oge, dil);
}
