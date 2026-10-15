import assert from "node:assert/strict";
import { test } from "node:test";
import { YASAL_ALANLAR, YASAL_EKSIKLER, type YasalAlan, type YasalDeger, yasalEksikleri } from "../../app/components/yasal/bilgiler.ts";

const iki = (tr: string, en: string) => ({ tr, en });

const TAM: Record<YasalAlan, YasalDeger> = {
  unvan: "Hanedan Gıda Ltd. Şti.",
  mersisNo: null,
  vergiDairesi: "Sultangazi",
  vergiNo: "1234567890",
  eposta: "info@hanedanpilav.com",
  kep: null,
  barindirma: iki("Örnek Barındırma A.Ş., Türkiye", "Example Hosting Inc., Turkey"),
  epostaSaglayici: iki("Örnek Posta A.Ş., Türkiye", "Example Mail Inc., Turkey"),
  yurtDisiAktarim: iki("Yurt dışına aktarılmaz.", "Not transferred abroad."),
  saklamaSuresi: iki("Talebin sonuçlanmasından itibaren 2 yıl.", "2 years after the request is resolved."),
  ipSuresi: iki("24 saat.", "24 hours."),
  sunucuKayitlari: iki("Tutulur, 90 gün.", "Kept for 90 days."),
};

function alanlar(bilgi: Record<string, YasalDeger | undefined>): YasalAlan[] {
  return yasalEksikleri(bilgi as Record<YasalAlan, YasalDeger>).map((e) => e.alan);
}

test("geçerli tam veri kapıyı geçer; kep ve mersisNo null olabilir", () => {
  assert.deepEqual(alanlar(TAM), []);
});

test("bugünkü gerçek veri eksik listesi verir", () => {
  assert.ok(YASAL_EKSIKLER.length > 0);
});

test("null unvan kapıyı geçemez", () => {
  assert.deepEqual(alanlar({ ...TAM, unvan: null }), ["unvan"]);
});

test("null yalnız kep ve mersisNo için izinli", () => {
  for (const alan of YASAL_ALANLAR) {
    const sonuc = alanlar({ ...TAM, [alan]: null });
    assert.equal(sonuc.length === 0, alan === "kep" || alan === "mersisNo", alan);
  }
});

test("boş string ve boşluk kapıyı geçemez", () => {
  assert.deepEqual(alanlar({ ...TAM, vergiNo: "" }), ["vergiNo"]);
  assert.deepEqual(alanlar({ ...TAM, vergiNo: "   " }), ["vergiNo"]);
  assert.deepEqual(alanlar({ ...TAM, ipSuresi: iki("", "") }), ["ipSuresi"]);
});

test("yer tutucu kalıpları reddedilir", () => {
  for (const yt of ["[...]", "[unvan]", "todo", "TODO", "DEGISTIR", "DEĞİŞTİR", "TBD", "xxx", "..."]) {
    assert.deepEqual(alanlar({ ...TAM, unvan: yt }), ["unvan"], yt);
    assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki(yt, "2 years") }), ["saklamaSuresi"], yt);
  }
});

test("yalnız TR değer kapıyı geçemez", () => {
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki("2 yıl", "") }), ["saklamaSuresi"]);
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: { tr: "2 yıl" } as never }), ["saklamaSuresi"]);
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: "2 yıl" }), ["saklamaSuresi"]);
});

test("todo değerleri ve eksik alanlar reddedilir", () => {
  assert.deepEqual(alanlar({ ...TAM, eposta: { todo: "gerekli" } }), ["eposta"]);
  assert.deepEqual(alanlar({ ...TAM, eposta: undefined }), ["eposta"]);
});
