// Yasal sayfaların künye ve süreç bilgileri için tek liste. Bilinmeyen değer uydurulmaz: `todo` kalır, sayfada "[...]"
// yer tutucusu olarak görünür ve YASAL_EKSIKLER'e girer. `null` "bu işletme için geçerli değil" demektir; o satır sayfadan kalkar.
// Yayın öncesi denetim betiği bu dosyayı Node ile doğrudan içe aktarır: yalnız göreli `.ts` içe aktarma ve tip silinebilir sözdizimi.
import { SITE, type Todo, isTodo } from "../../content/site.ts";

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

function eksik(not: string): Todo {
  return { todo: not };
}

// site.ts'de karşılığı olan alanlar oradan okunur; site.ts'de henüz yeri olmayanlar burada tanımlıdır.
export const YASAL_BILGI: Readonly<Record<YasalAlan, YasalDeger>> = {
  unvan: SITE.yasal.unvan,
  mersisNo: SITE.yasal.mersisNo,
  vergiDairesi: SITE.yasal.vergiDairesi,
  vergiNo: SITE.yasal.vergiNo,
  eposta: SITE.eposta ?? eksik("Kurumsal e-posta adresi: KVKK başvuruları buraya gelir, formlar buraya iletilir."),
  kep: eksik("KEP adresi. İşletmenin KEP adresi yoksa null yapılır, başvuru yollarından KEP satırı kalkar."),
  barindirma: eksik("Barındırma sağlayıcısının unvanı ve sunucunun bulunduğu ülke."),
  epostaSaglayici: eksik("Kurumsal e-posta hizmeti sağlayıcısının unvanı ve sunucularının bulunduğu ülke."),
  yurtDisiAktarim: eksik(
    "Yurt dışına aktarım cümlesi (TR/EN). Sağlayıcılardan biri yurt dışındaysa KVKK md. 9 dayanağı (yeterlilik kararı, Kurula bildirilen standart sözleşme vb.) yazılır; yoksa 'yurt dışına aktarılmaz' denir.",
  ),
  saklamaSuresi: eksik("Form e-postalarının saklama süresi (TR/EN), örneğin talebin sonuçlanmasından itibaren kaç ay/yıl."),
  ipSuresi: eksik("Hız sınırı için IP adresinin tutulduğu süre (TR/EN); form betiğindeki değerle aynı olmalı."),
  sunucuKayitlari: eksik(
    "Barındırma sunucusunun erişim kaydı (IP, tarih/saat, istenen sayfa) tutup tutmadığı ve saklama süresi (TR/EN).",
  ),
};

export type YasalEksik = { readonly alan: YasalAlan; readonly not: string };

export const YASAL_EKSIKLER: readonly YasalEksik[] = YASAL_ALANLAR.flatMap((alan) => {
  const deger = YASAL_BILGI[alan];
  return isTodo(deger) ? [{ alan, not: deger.todo }] : [];
});

// Yasal metinlerin "son güncelleme" tarihi (YYYY-AA-GG). Metin değiştiğinde yalnız burası güncellenir.
export const SON_GUNCELLEME = "2026-10-15";

// Çerez politikasının dayandığı envanter. Site çerez yazmaz; tarayıcı depolamasında yalnız aşağıdaki anahtar oluşur.
// Envanter testle denetlenir (tests/e2e/yasal.spec.ts): listede olmayan bir çerez veya depolama anahtarı görülürse test kalır.
export const CEREZLER: readonly string[] = [];
export const OTURUM_DEPOLAMASI = ["react-router-scroll-positions"] as const;
export const YEREL_DEPOLAMA: readonly string[] = [];
