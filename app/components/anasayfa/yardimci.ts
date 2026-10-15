import { GALERI, type GaleriOgesi } from "~/content/galeri.ts";
import type { Dil } from "~/lib/rotalar.ts";

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
