// İstemci doğrulaması; kurallar public/api/src/FormIslem.php ile aynı tutulur (sunucu yine de doğrular).

export type FormTuru = "iletisim" | "bayilik";
export type AlanAdi =
  | "konu"
  | "ad"
  | "firma"
  | "telefon"
  | "eposta"
  | "mesaj"
  | "ilce"
  | "mevcut_isletme"
  | "lokasyon"
  | "kvkk";
export type HataKodu = "bos" | "uzun" | "gecersiz";
export type Hatalar = Partial<Record<AlanAdi, HataKodu>>;

export const KONULAR = ["genel", "catering", "bayilik", "diger"] as const;
export type Konu = (typeof KONULAR)[number];
export const ISTANBUL_DISI = "istanbul-disi";

export const LIMIT = { ad: 100, firma: 120, telefon: 30, eposta: 254, mesaj: 3000, lokasyon: 200 } as const;

export const FORM_ADRESI = "/api/form.php";
export const MIN_BEKLEME_MS = 3000;

export function konuCoz(deger: string | null): Konu | null {
  return (KONULAR as readonly string[]).includes(deger ?? "") ? (deger as Konu) : null;
}

export function telefonGecerli(telefon: string): boolean {
  const sade = telefon.replace(/[\s().-]/g, "");
  return /^(?:\+?90|0)?[2-5]\d{9}$/.test(sade) || /^\+(?!90)[1-9]\d{9,13}$/.test(sade);
}

export function epostaGecerli(eposta: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(eposta);
}

const SATIR_SONU = /[\r\n\u0000-\u001F\u007F]/;
const KONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function dogrula(tur: FormTuru, v: Readonly<Record<string, string>>): Hatalar {
  const h: Hatalar = {};
  const al = (k: string) => v[k] ?? "";

  const tekSatir = (k: "ad" | "firma" | "telefon" | "eposta" | "lokasyon", zorunlu: boolean) => {
    const ham = al(k);
    if (SATIR_SONU.test(ham)) {
      h[k] = "gecersiz";
      return;
    }
    const d = ham.trim();
    if (d === "") {
      if (zorunlu) h[k] = "bos";
      return;
    }
    if ([...d].length > LIMIT[k]) h[k] = "uzun";
  };
  tekSatir("ad", true);
  tekSatir("telefon", true);
  tekSatir("eposta", true);
  tekSatir("firma", false);

  if (!h.telefon && !telefonGecerli(al("telefon").trim())) h.telefon = "gecersiz";
  if (!h.eposta && !epostaGecerli(al("eposta").trim())) h.eposta = "gecersiz";

  const mesaj = al("mesaj").trim();
  if (KONTROL.test(mesaj)) h.mesaj = "gecersiz";
  else if (mesaj === "" && tur === "iletisim") h.mesaj = "bos";
  else if ([...mesaj].length > LIMIT.mesaj) h.mesaj = "uzun";

  if (al("kvkk") === "") h.kvkk = "bos";

  if (tur === "iletisim") {
    if (!konuCoz(al("konu"))) h.konu = "gecersiz";
  } else {
    tekSatir("lokasyon", false);
    if (al("ilce") === "") h.ilce = "bos";
    const isletme = al("mevcut_isletme");
    if (isletme !== "" && isletme !== "evet" && isletme !== "hayir") h.mevcut_isletme = "gecersiz";
  }
  return h;
}
