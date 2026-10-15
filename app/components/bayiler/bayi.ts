import type { HaritaPin } from "~/components/harita/IstanbulHarita.tsx";
import type { Bayi } from "~/content/bayiler.ts";
import { ilceBul } from "~/content/ilceler.ts";

export type Konum = { readonly lat: number; readonly lng: number };

export function adresMetni(b: Bayi): string {
  return `${b.adres.satir}, ${b.adres.postaKodu} ${b.adres.ilce}/${b.adres.il}`;
}

export function yolTarifiHref(b: Bayi): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresMetni(b))}`;
}

export function ilceSlugu(b: Bayi): string | undefined {
  return ilceBul(b.adres.ilce)?.slug;
}

// Arama Türkçe karakterden bağımsız çalışır: "kadikoy" yazan da Kadıköy'ü bulur.
export function sade(metin: string): string {
  return metin
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function eslesir(b: Bayi, sorgu: string): boolean {
  const q = sade(sorgu);
  if (!q) return true;
  return [b.ad.tr, b.ad.en, b.adres.ilce, b.adres.satir].some((alan) => sade(alan).includes(q));
}

const DUNYA_YARICAPI_KM = 6371;

export function haversineKm(a: Konum, b: Konum): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * DUNYA_YARICAPI_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Haritada ilçe başına tek pin: merkez varsa "Merkez", yoksa şube sayısı. Pin ilçe merkezindedir, adres noktası değildir.
export function haritaPinleri(
  bayiler: readonly Bayi[],
  etiket: { merkez: string; sube: (adet: number) => string },
): HaritaPin[] {
  const ilceler = new Map<string, Bayi[]>();
  for (const b of bayiler) {
    const slug = ilceSlugu(b);
    if (!slug) continue;
    ilceler.set(slug, [...(ilceler.get(slug) ?? []), b]);
  }
  return [...ilceler].map(([ilce, liste]) => ({
    ilce,
    etiket: liste.some((b) => b.tur === "merkez") ? etiket.merkez : etiket.sube(liste.length),
  }));
}
