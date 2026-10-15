// Yasal sayfaların künye ve süreç bilgileri için tek liste. Bilinmeyen değer uydurulmaz: `todo` kalır, sayfada "[...]"
// yer tutucusu olarak görünür ve YASAL_EKSIKLER'e girer. `null` yalnız kep ve mersisNo için "bu işletmede yok" demektir; o satır sayfadan kalkar. Diğer alanlarda boş, null,
// yer tutucu veya eksik EN değer yayın kapısını (check:yayin) düşürür.
// Yayın öncesi denetim betiği bu dosyayı Node ile doğrudan içe aktarır: yalnız göreli `.ts` içe aktarma ve tip silinebilir sözdizimi.
import { SITE, type Todo, isTodo } from "../../content/site.ts";
import { epostaGecerli } from "../form/dogrula.ts";

export type IkiDil = { readonly tr: string; readonly en: string };
export type YasalDeger = string | IkiDil | Todo | null;

export const YASAL_ALANLAR = [
  "unvan",
  "mersisNo",
  "vergiDairesi",
  "vergiNo",
  "eposta",
  "kep",
  "barindirma",
  "epostaSaglayici",
  "yurtDisiAktarim",
  "saklamaSuresi",
  "ipSuresi",
  "sunucuKayitlari",
] as const;

export type YasalAlan = (typeof YASAL_ALANLAR)[number];

// Tüm değerler site.ts `yasal` altından okunur; doldurulacak yer orasıdır.
export const YASAL_BILGI: Readonly<Record<YasalAlan, YasalDeger>> = {
  unvan: SITE.yasal.unvan,
  mersisNo: SITE.yasal.mersisNo,
  vergiDairesi: SITE.yasal.vergiDairesi,
  vergiNo: SITE.yasal.vergiNo,
  eposta: SITE.eposta ?? SITE.yasal.eposta,
  kep: SITE.yasal.kep,
  barindirma: SITE.yasal.barindirma,
  epostaSaglayici: SITE.yasal.epostaSaglayici,
  yurtDisiAktarim: SITE.yasal.yurtDisiAktarim,
  saklamaSuresi: SITE.yasal.saklamaSuresi,
  ipSuresi: SITE.yasal.ipSuresi,
  sunucuKayitlari: SITE.yasal.sunucuKayitlari,
};

export type YasalEksik = { readonly alan: YasalAlan; readonly not: string };

// `null` ("bu işletmede yok") yalnız bu alanlar için geçerlidir; diğer alanlar dolu olmak zorundadır.
export const YASAL_OPSIYONEL: readonly YasalAlan[] = ["kep", "mersisNo"];

// Düz metin yeterli olan alanlar dilden bağımsızdır; geri kalanı TR ve EN ayrı yazılmalıdır.
const DILDEN_BAGIMSIZ: readonly YasalAlan[] = ["unvan", "mersisNo", "vergiDairesi", "vergiNo", "eposta", "kep"];

const YER_TUTUCU =
  /\[[^\]]*\]|\.\.\.|…|^-$|(?<!\p{L})(?:todo|TBD|TBC|TBA|XXX+|lorem|değiştir|degistir)(?!\p{L})|müşteriden alınacak/iu;

const SIFIR_GENISLIK = /[\u200B\u200C\u200D\u2060\u00AD\uFEFF]/;
const YER_TUTUCU_TAM = new Set(["n/a", "na", "n.a.", "n.a", "?", "--", "x", "xx", "yok", "yok.", "belirtilmedi", "belirtilmedi."]);

function metinSorunu(metin: string, alan: YasalAlan): string | null {
  const m = metin.trim();
  if (m === "") return "boş";
  if (SIFIR_GENISLIK.test(m)) return "sıfır genişlikli karakter içeriyor";
  const kucuk = m.toLocaleLowerCase("tr");
  if (!/[\p{L}\p{N}]/u.test(m)) return "yalnız noktalama veya sembol";
  if (YER_TUTUCU_TAM.has(kucuk)) return "yer tutucu içeriyor";
  if (YER_TUTUCU.test(m) || YER_TUTUCU.test(kucuk) || YER_TUTUCU.test(kucuk.replace(/ı/g, "i")) || kucuk.includes("müşteriden alınacak")) return "yer tutucu içeriyor";
  if (alan === "eposta" && !epostaGecerli(m)) return "geçerli e-posta biçiminde değil";
  return null;
}

function kopyaAnahtar(m: string): string {
  return m.toLocaleLowerCase("tr").replace(/[iıİI]/gu, "i").replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

// Alanın yayına hazır olup olmadığı: sorun yoksa null, varsa nedeni döner.
export function alanSorunu(alan: YasalAlan, deger: YasalDeger | undefined): string | null {
  if (deger === null) return YASAL_OPSIYONEL.includes(alan) ? null : "null yalnız kep ve mersisNo için izinli";
  if (deger === undefined) return "değer yok";
  if (isTodo(deger)) return deger.todo;
  if (typeof deger === "string") {
    if (!DILDEN_BAGIMSIZ.includes(alan)) return "TR ve EN değer ayrı verilmeli ({ tr, en })";
    return metinSorunu(deger, alan);
  }
  if (typeof deger !== "object") return "geçersiz değer";
  for (const dil of ["tr", "en"] as const) {
    const sorun = typeof deger[dil] === "string" ? metinSorunu(deger[dil], alan) : "yok";
    if (sorun !== null) return `${dil.toUpperCase()} değeri ${sorun}`;
  }
  if (!DILDEN_BAGIMSIZ.includes(alan) && kopyaAnahtar(deger.tr) === kopyaAnahtar(deger.en)) return "TR ve EN değer aynı (çeviri eksik olabilir)";
  return null;
}

export function yasalEksikleri(bilgi: Readonly<Record<YasalAlan, YasalDeger | undefined>>): YasalEksik[] {
  return YASAL_ALANLAR.flatMap((alan) => {
    const not = alanSorunu(alan, bilgi[alan]);
    return not === null ? [] : [{ alan, not }];
  });
}

export const YASAL_EKSIKLER: readonly YasalEksik[] = yasalEksikleri(YASAL_BILGI);

// Yasal metinlerin "son güncelleme" tarihi (YYYY-AA-GG). Metin değiştiğinde yalnız burası güncellenir.
export const SON_GUNCELLEME = "2026-10-15";

// Çerez politikasının dayandığı envanter. Site çerez yazmaz; tarayıcı depolamasında yalnız aşağıdaki anahtar oluşur.
// Envanter testle denetlenir (tests/e2e/yasal.spec.ts): listede olmayan bir çerez veya depolama anahtarı görülürse test kalır.
export const CEREZLER: readonly string[] = [];
export const OTURUM_DEPOLAMASI = ["react-router-scroll-positions"] as const;
export const YEREL_DEPOLAMA: readonly string[] = [];
