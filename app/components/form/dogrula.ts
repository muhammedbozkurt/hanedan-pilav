// İstemci doğrulaması; kurallar public/api/src/FormIslem.php ile aynıdır (sunucu yine de doğrular).
// Eşlik tests/fixtures/dogrulama-vakalari.json ile iki tarafta da sınanır.
// Node testlerinden de içe aktarıldığı için yol takma adı (~/) kullanılmaz.
import { ILCELER } from "../../content/ilceler.ts";

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
  | "lokasyon";
export type HataKodu = "bos" | "uzun" | "gecersiz";
export type Hatalar = Partial<Record<AlanAdi, HataKodu>>;

export const KONULAR = ["genel", "catering", "bayilik", "diger"] as const;
export type Konu = (typeof KONULAR)[number];
export const ISTANBUL_DISI = "istanbul-disi";
const ILCE_ADLARI: ReadonlySet<string> = new Set(ILCELER.map((i) => i.ad));

export const LIMIT = { ad: 100, firma: 120, telefon: 30, eposta: 254, mesaj: 3000, lokasyon: 200 } as const;

export const FORM_ADRESI = "/api/form.php";

export function konuCoz(deger: string | null): Konu | null {
  return (KONULAR as readonly string[]).includes(deger ?? "") ? (deger as Konu) : null;
}

const TELEFON_TEMIZLE = /[\t\p{Zs}().-]/gu;
const TELEFON_TR = /^(?:(?:\+|00)?90)?0?[2-58][0-9]{9}$/;
const TELEFON_YABANCI = /^(?:\+|00)(?!90)[1-9][0-9]{9,13}$/;

export function telefonGecerli(telefon: string): boolean {
  const sade = telefon.replace(TELEFON_TEMIZLE, "");
  return TELEFON_TR.test(sade) || TELEFON_YABANCI.test(sade);
}

// Sunucudaki FILTER_VALIDATE_EMAIL'in reddettiklerini de reddeder: ASCII nokta-atom yerel kısım, ASCII ana makine adı.
const EPOSTA =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59})$/;
const EPOSTA_YEREL_EN_COK = 64;

export function epostaGecerli(eposta: string): boolean {
  return EPOSTA.test(eposta) && eposta.indexOf("@") <= EPOSTA_YEREL_EN_COK;
}

const SATIR_SONU = /[\u0000-\u001F\u007F]/;
const KONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

// Yalnız formun beyan ettiği alanlar denetlenir; sunucu da diğerlerini yok sayar.
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

  if (!h.telefon && !telefonGecerli(al("telefon").trim())) h.telefon = "gecersiz";
  if (!h.eposta && !epostaGecerli(al("eposta").trim())) h.eposta = "gecersiz";

  const mesaj = al("mesaj").replace(/\r\n?/g, "\n").trim();
  if (KONTROL.test(mesaj)) h.mesaj = "gecersiz";
  else if (mesaj === "" && tur === "iletisim") h.mesaj = "bos";
  else if ([...mesaj].length > LIMIT.mesaj) h.mesaj = "uzun";

  if (tur === "iletisim") {
    if (!konuCoz(al("konu"))) h.konu = "gecersiz";
    tekSatir("firma", false);
  } else {
    const ilce = al("ilce");
    if (ilce === "") h.ilce = "bos";
    else if (ilce !== ISTANBUL_DISI && !ILCE_ADLARI.has(ilce)) h.ilce = "gecersiz";
    const isletme = al("mevcut_isletme");
    if (isletme !== "" && isletme !== "evet" && isletme !== "hayir") h.mevcut_isletme = "gecersiz";
    tekSatir("lokasyon", false);
  }
  return h;
}
