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

test("TR ve EN aynı olan IkiDil değer reddedilir; dilden bağımsız alanlar muaf", () => {
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki("2 yıl", "2 yıl") }), ["saklamaSuresi"]);
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki(" 2 yıl", "2 yıl ") }), ["saklamaSuresi"]);
  assert.deepEqual(alanlar({ ...TAM, unvan: iki("Hanedan Ltd.", "Hanedan Ltd.") }), []);
});

test("yeni yer tutucu kalıpları: …, TBA ve tek başına tire", () => {
  for (const yt of ["…", "Yakında…", "TBA", "tba", "-", " - "]) {
    assert.deepEqual(alanlar({ ...TAM, unvan: yt }), ["unvan"], yt);
    assert.deepEqual(alanlar({ ...TAM, barindirma: iki(yt, "Hosting Inc.") }), ["barindirma"], yt);
  }
  assert.deepEqual(alanlar({ ...TAM, vergiDairesi: "Bağcılar - Sultangazi" }), []);
});

test("eposta geçerli e-posta biçiminde olmalı", () => {
  for (const e of ["info", "info@", "info@hanedanpilav", "a b@c.com", "info@@c.com", "a@b.xn---"]) {
    assert.deepEqual(alanlar({ ...TAM, eposta: e }), ["eposta"], e);
  }
  assert.deepEqual(alanlar({ ...TAM, eposta: "info@hanedanpilav.com" }), []);
});

test("yalnız noktalama/sembol, kısa yer tutucular ve sıfır genişlikli karakterler reddedilir", () => {
  for (const yt of ["N/A", "n/a", "?", "--", "x", "XX", "!!!", "***", "·", "\u200B", "\uFEFF", "Hanedan\u200BLtd", "\u200CAnkara", "a\u200Db"]) {
    assert.deepEqual(alanlar({ ...TAM, unvan: yt }), ["unvan"], JSON.stringify(yt));
    assert.deepEqual(alanlar({ ...TAM, barindirma: iki(yt, "Hosting Inc.") }), ["barindirma"], JSON.stringify(yt));
  }
  assert.deepEqual(alanlar({ ...TAM, unvan: "X Gıda A.Ş." }), []);
});

test("Türkçe yer tutucu büyük İ ile de yakalanır", () => {
  for (const yt of ["MÜŞTERİDEN ALINACAK", "Müşteriden Alınacak", "müşteriden alınacak"]) {
    assert.deepEqual(alanlar({ ...TAM, unvan: yt }), ["unvan"], yt);
  }
});

test("TR/EN kopya denetimi noktalama, büyük harf ve boşluk farkını yok sayar", () => {
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki("2 YIL.", "2  yıl") }), ["saklamaSuresi"]);
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki("Iğdır, 2 yıl!", "ığdır 2 yıl") }), ["saklamaSuresi"]);
});

test("IP özeti temizlik görevi kapısı her iki bayrak değerinde doğru karar verir", async () => {
  const { ipGorevHatasi } = await import("../../scripts/yayin-kapi.ts");
  assert.match(ipGorevHatasi(false) ?? "", /Plesk zamanlanmış IP özeti temizlik görevi kurulmadı/);
  assert.equal(ipGorevHatasi(true), null);
});

test("gerçek Türkçe yasal cümleler yer tutucu sayılmaz", () => {
  const cumleler = [
    "Mevzuat değiştirildiğinde güncellenir.",
    "Değiştirilen kayıtlar 2 yıl saklanır.",
    "Talep sonuçlanana kadar, yok sayılmaz.",
    "Bu işletmede belirtilmedik bir aktarım yapılmaz.",
    "Sunucu kayıtları 90 gün tutulur ve sonra otomatik silinir.",
    "Iğdır, İstanbul ve Ankara dışındaki kayıtlar da aynı sürede silinir.",
  ];
  for (const c of cumleler) {
    assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki(c, `${c} (EN)`) }), [], c);
  }
});

test("yeni yer tutucular: U+2060, U+00AD, tam değer yok/belirtilmedi/n.a.", () => {
  for (const yt of ["a\u2060b", "Hane\u00ADdan", "yok", "Yok", "belirtilmedi", "n.a.", "N.A.", "DEĞİŞTİR", "değiştir", "DEGISTIR"]) {
    assert.deepEqual(alanlar({ ...TAM, unvan: yt }), ["unvan"], yt);
  }
});

test("TR/EN kopya karşılaştırması i/ı/İ/I farkını yok sayar", () => {
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki("IĞDIR 2 YIL", "iğdir 2 yil") }), ["saklamaSuresi"]);
  assert.deepEqual(alanlar({ ...TAM, saklamaSuresi: iki("İzmir 2 yıl", "Izmir 2 yil") }), ["saklamaSuresi"]);
});
