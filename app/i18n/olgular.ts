// Metinlere giren olgular (kuruluş yılı, üretim kapasitesi) site.ts'ten okunur; sözlüklerde rakam sabit yazılmaz.
import { SITE } from "~/content/site.ts";

export const KURULUS_YILI = SITE.kurulusYili;
const KAPASITE = SITE.uretimKapasitesi.miktar;

const BIRLER = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const ONLAR = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];

// Türkçe ek, sayının okunuşundaki son sözcüğe uyar: 1998’den, 1990’dan, 2004’te.
function sonSozcuk(n: number): string {
  if (n % 10) return BIRLER[n % 10] ?? "";
  if (n % 100) return ONLAR[(n % 100) / 10] ?? "";
  return n % 1000 ? "yüz" : "bin";
}

export function yilEki(yil: number, ek: "den" | "de"): string {
  const sozcuk = sonSozcuk(yil);
  const unlu = [...sozcuk].reverse().find((h) => "aeıioöuü".includes(h)) ?? "e";
  const d = "çfhkpsşt".includes(sozcuk.at(-1) ?? "") ? "t" : "d";
  const a = "aıou".includes(unlu) ? "a" : "e";
  return `${yil}’${d}${a}${ek === "den" ? "n" : ""}`;
}

// Gövde metninde rakam ile birim ayrılmasın diye varsayılan ayraç bölünmez boşluktur; meta metinlerde düz boşluk verilir.
export function kapasiteTr(ayrac = " "): string {
  return `${KAPASITE}${ayrac}ton`;
}

export function kapasiteEn(ayrac = " "): string {
  return KAPASITE === 1 ? `one metric${ayrac}ton` : `${KAPASITE} metric${ayrac}tons`;
}

export function metrikTon(miktar: number): string {
  return `${miktar} metric ${miktar === 1 ? "ton" : "tons"}`;
}
