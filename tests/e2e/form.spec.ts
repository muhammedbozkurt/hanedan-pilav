import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { ISTANBUL_DISI, dogrula, telefonGecerli } from "../../app/components/form/dogrula.ts";
import { ILCELER } from "../../app/content/ilceler.ts";

const TR = "/iletisim";
const EN = "/en/contact";

async function formHazir(page: Page, yol: string) {
  await page.goto(yol);
  // Hidrasyon bitince form noValidate olur; erken tıklama yerel doğrulamaya düşmesin.
  await expect(page.locator("form")).toHaveAttribute("novalidate", "");
}

async function doldur(page: Page) {
  await page.getByLabel(/^(Ad soyad|Full name)/).fill("Ayşe Yılmaz");
  await page.getByLabel(/^(Telefon|Phone)/).fill("0532 123 45 67");
  await page.getByLabel(/^(E-posta|Email)/).fill("ayse@example.com");
  await page.getByLabel(/^(Mesajınız|Your message)/).fill("100 kişilik yemek için fiyat almak istiyoruz.");
}

test.describe("iletişim formu: doğrulama ve odak", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("boş gönderimde satır içi hatalar çıkar ve ilk hatalı alana odaklanır", async ({ page }) => {
    await formHazir(page, TR);
    await page.getByRole("button", { name: "Gönder" }).click();

    const ad = page.getByLabel(/^Ad soyad/);
    await expect(ad).toBeFocused();
    for (const alan of [ad, page.getByLabel(/^Telefon/), page.getByLabel(/^E-posta/), page.getByLabel(/^Mesajınız/)]) {
      await expect(alan).toHaveAttribute("aria-invalid", "true");
      const tarif = await alan.getAttribute("aria-describedby");
      expect(tarif).toBeTruthy();
      for (const id of (tarif ?? "").split(" ")) await expect(page.locator(`[id="${id}"]`)).toBeVisible();
    }
    await expect(page.getByText("Lütfen adınızı ve soyadınızı yazın.")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "4 alanda düzeltme gerekiyor." })).toBeVisible();
    await expect(page.getByLabel(/^Firma/)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("geçersiz e-posta ve telefon alanına özgü mesaj verir; düzeltince hata kalkar", async ({ page }) => {
    await formHazir(page, TR);
    await doldur(page);
    await page.getByLabel(/^Telefon/).fill("123");
    await page.getByLabel(/^E-posta/).fill("ayse@");
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByLabel(/^Telefon/)).toBeFocused();
    await expect(page.getByText("Geçerli bir telefon numarası yazın.")).toBeVisible();
    await expect(page.getByText("Geçerli bir e-posta adresi yazın.")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("2 alanda düzeltme gerekiyor.");
  });

  test("EN: hata metinleri İngilizce", async ({ page }) => {
    await formHazir(page, EN);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByLabel(/^Full name/)).toBeFocused();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "4 fields need your attention." })).toBeVisible();
  });
});

test.describe("iletişim formu: konu önseçimi", () => {
  const durumlar: Array<[string, string]> = [
    ["/iletisim?konu=catering", "catering"],
    ["/en/contact?topic=catering", "catering"],
    ["/iletisim?topic=bayilik", "bayilik"],
    ["/en/contact?konu=diger", "diger"],
    ["/iletisim?konu=gecersiz", "genel"],
    ["/iletisim", "genel"],
  ];
  for (const [yol, beklenen] of durumlar) {
    test(`${yol} -> ${beklenen}`, async ({ page }) => {
      await page.goto(yol);
      await expect(page.locator("select[name=konu]")).toHaveValue(beklenen);
    });
  }

  test("bilgi notu gönder düğmesinin üstünde, bağlantısı dile göre doğru sayfaya gider; onay kutusu yok", async ({ page }) => {
    await page.goto(TR);
    const trForm = page.locator("form");
    await expect(trForm.getByRole("checkbox")).toHaveCount(0);
    await expect(trForm.getByText("Kişisel verileriniz, talebinizi yanıtlamak için KVKK Aydınlatma Metni’nde açıklandığı şekilde işlenir.")).toBeVisible();
    await expect(trForm.getByRole("link", { name: "KVKK Aydınlatma Metni" })).toHaveAttribute("href", "/kvkk");
    const not = await trForm.getByRole("link", { name: "KVKK Aydınlatma Metni" }).boundingBox();
    const dugme = await trForm.getByRole("button", { name: "Gönder" }).boundingBox();
    expect(not!.y).toBeLessThan(dugme!.y);
    await page.goto(EN);
    await expect(page.locator("form").getByText("Your personal data is processed to respond to your request, as described in our Privacy Notice.")).toBeVisible();
    await expect(page.locator("form").getByRole("link", { name: "Privacy Notice" })).toHaveAttribute("href", "/en/privacy");
  });
});

test.describe("iletişim formu: spam tuzağı ve JS'siz çalışma", () => {
  test("honeypot görünmez, odaklanamaz ve erişilebilirlik ağacında yok", async ({ page }) => {
    await page.goto(TR);
    const tuzak = page.locator('input[name="kurum_kodu"]');
    await expect(tuzak).toHaveCount(1);
    await expect(tuzak).toBeHidden();
    await expect(tuzak).toHaveAttribute("tabindex", "-1");
    await expect(tuzak.locator("xpath=ancestor::*[@aria-hidden='true']")).toHaveCount(1);
    // ad, firma, telefon, e-posta, mesaj: tuzak sayılmaz.
    await expect(page.locator("form").getByRole("textbox")).toHaveCount(5);
  });

  test("JS kapalıyken yerel POST: action, method ve zorunlu alanlar", async ({ browser }) => {
    const baglam = await browser.newContext({ javaScriptEnabled: false });
    const page = await baglam.newPage();
    await page.goto(TR);
    const form = page.locator("form");
    await expect(form).toHaveAttribute("method", /post/i);
    await expect(form).toHaveAttribute("action", "/api/form.php");
    await expect(form).not.toHaveAttribute("novalidate", "");
    await expect(form.locator('input[name="form"]')).toHaveValue("iletisim");
    await expect(form.locator('input[name="lang"]')).toHaveValue("tr");
    await expect(page.getByLabel(/^Ad soyad/)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await baglam.close();
  });

  test("JS kapalıyken PHP dönüşü (?gonderildi=1#durum-gonderildi) başarı durumunu gösterir", async ({ browser }) => {
    const baglam = await browser.newContext({ javaScriptEnabled: false });
    const page = await baglam.newPage();
    await page.goto(`${TR}?gonderildi=1#durum-gonderildi`);
    // Playwright metin sorguları noscript içeriğini atlar: kimlikle bakılır.
    await expect(page.locator("#durum-gonderildi")).toBeVisible();
    await expect(page.locator("#durum-gonderildi")).toContainText("Mesajınız bize ulaştı.");
    await expect(page.locator("[id^='durum-hata-']:visible")).toHaveCount(0);
    await page.goto(TR);
    await expect(page.locator("#durum-gonderildi")).toBeHidden();
    await baglam.close();
  });

  // PHP her hata türü için ayrı çapaya 303 ile döner (public/api/src/FormIslem.php); her çapa kendi mesajını gösterir.
  const JSSIZ_HATALAR = [
    ["dogrulama", "durum-hata-dogrulama", "Gönderilemedi. Zorunlu alanları"],
    ["cok_hizli", "durum-hata-cok-hizli", "Form çok hızlı gönderildi."],
    ["hiz", "durum-hata-hiz", "Kısa sürede çok fazla gönderim"],
    ["sunucu", "durum-hata-sunucu", "şu anda gönderilemedi"],
    ["origin", "durum-hata-origin", "Gönderim bu adresten kabul edilmiyor."],
  ] as const;

  test("JS kapalıyken her hata türü kendi çapasında kendi mesajını gösterir", async ({ browser }) => {
    const baglam = await browser.newContext({ javaScriptEnabled: false });
    const page = await baglam.newPage();
    for (const [kod, capa, metin] of JSSIZ_HATALAR) {
      await page.goto(`${TR}?hata=${kod}#${capa}`);
      await expect(page.locator(`#${capa}`), kod).toBeVisible();
      await expect(page.locator(`#${capa}`), kod).toContainText(metin);
      await expect(page.locator("[id^='durum-hata-']:visible"), kod).toHaveCount(1);
      await expect(page.locator("#durum-gonderildi")).toBeHidden();
    }
    await baglam.close();
  });

  test("JS kapalıyken bayilik başarı dönüşü başvuru metnini gösterir", async ({ browser }) => {
    const baglam = await browser.newContext({ javaScriptEnabled: false });
    const page = await baglam.newPage();
    await page.goto("/bayilerimiz?gonderildi=1#durum-gonderildi");
    await expect(page.locator("#durum-gonderildi")).toContainText("Başvurunuz bize ulaştı.");
    await page.goto("/en/locations?gonderildi=1#durum-gonderildi");
    await expect(page.locator("#durum-gonderildi")).toContainText("We’ve received your application.");
    await baglam.close();
  });

  test("JS açıkken ?gonderildi=1 ve ?hata=... durumu canlı bölgede gösterilir", async ({ page }) => {
    await page.goto(`${TR}?gonderildi=1`);
    await expect(page.getByRole("status").filter({ hasText: "Mesajınız bize ulaştı." })).toBeVisible();
    await page.goto(`${EN}?gonderildi=1`);
    await expect(page.getByRole("status").filter({ hasText: "We’ve received your message." })).toBeVisible();
    await page.goto(`${EN}?hata=hiz`);
    await expect(page.getByRole("status").filter({ hasText: "Too many submissions" })).toBeVisible();
    await page.goto(`${TR}?hata=cok_hizli`);
    await expect(page.getByRole("status").filter({ hasText: "Form çok hızlı gönderildi." })).toBeVisible();
    await page.goto(`${EN}?hata=origin`);
    await expect(page.getByRole("status").filter({ hasText: "Submissions from this address are not accepted." })).toBeVisible();
  });
});

function gecenMs(govde: string): number {
  const eslesme = /name="gecen_ms"\r\n\r\n(\d+)\r\n/.exec(govde);
  if (!eslesme?.[1]) throw new Error("gecen_ms gönderilmedi");
  return Number(eslesme[1]);
}

test.describe("iletişim formu: süre ölçümü", () => {
  test("ilk yüklemede süre sayfa gezinmesinin başından sayılır (hidrasyon dâhil)", async ({ page }) => {
    let govde = "";
    await page.route("**/api/form.php", async (rota) => {
      govde = rota.request().postData() ?? "";
      await rota.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await formHazir(page, TR);
    await doldur(page);
    const once = await page.evaluate(() => performance.now());
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Mesajınız bize ulaştı." })).toBeVisible();
    expect(gecenMs(govde)).toBeGreaterThanOrEqual(Math.floor(once));
  });

  test("istemci içi geçişte süre formun açılışından sayılır", async ({ page }) => {
    let govde = "";
    await page.route("**/api/form.php", async (rota) => {
      govde = rota.request().postData() ?? "";
      await rota.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await page.waitForTimeout(800);
    await page.getByRole("banner").getByRole("link", { name: "İletişim" }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/iletisim$/);
    await expect(page.locator("form")).toHaveAttribute("novalidate", "");
    await doldur(page);
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Mesajınız bize ulaştı." })).toBeVisible();
    const sonra = await page.evaluate(() => performance.now());
    expect(gecenMs(govde)).toBeLessThan(sonra - 700);
  });
});

test.describe("iletişim formu: gönderim (fetch taklidi)", () => {
  test("başarılı gönderim JSON ister, alanları yollar ve başarıyı duyurur", async ({ page }) => {
    let istek: { accept: string | undefined; govde: string } | null = null;
    await page.route("**/api/form.php", async (rota) => {
      const r = rota.request();
      istek = { accept: r.headers()["accept"], govde: r.postData() ?? "" };
      await rota.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await formHazir(page, `${TR}?konu=catering`);
    await doldur(page);
    await page.getByRole("button", { name: "Gönder" }).click();

    const durum = page.getByRole("status").filter({ hasText: "Mesajınız bize ulaştı." });
    await expect(durum).toBeVisible();
    expect(istek).not.toBeNull();
    expect(istek!.accept).toContain("application/json");
    for (const parca of ['name="konu"\r\n\r\ncatering', 'name="kurum_kodu"\r\n\r\n\r\n', 'name="gecen_ms"', 'name="form"\r\n\r\niletisim']) {
      expect(istek!.govde).toContain(parca);
    }
    await expect(page.getByLabel(/^Ad soyad/)).toHaveValue("");
  });

  test("sunucu 422 alan hatalarını ilgili alana yazar ve odaklar", async ({ page }) => {
    await page.route("**/api/form.php", (rota) =>
      rota.fulfill({ status: 422, contentType: "application/json", body: '{"ok":false,"alanlar":{"eposta":"gecersiz"}}' }),
    );
    await formHazir(page, TR);
    await doldur(page);
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByLabel(/^E-posta/)).toBeFocused();
    await expect(page.getByLabel(/^E-posta/)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Geçerli bir e-posta adresi yazın.")).toBeVisible();
  });

  for (const [kod, govde, metin] of [
    [429, '{"ok":false,"hata":"hiz"}', "Kısa sürede çok fazla gönderim"],
    [500, '{"ok":false,"hata":"sunucu"}', "şu anda gönderilemedi"],
    [422, '{"ok":false,"hata":"cok_hizli"}', "Form çok hızlı gönderildi. Lütfen birkaç saniye bekleyip yeniden deneyin."],
    [403, '{"ok":false,"hata":"origin"}', "Gönderim bu adresten kabul edilmiyor."],
    [200, '<!doctype html><title>hata</title>', "şu anda gönderilemedi"],
    [200, '{"ok":false}', "şu anda gönderilemedi"],
  ] as const) {
    test(`sunucu ${kod} ${govde.slice(0, 24)} durumu duyurulur ve girilen veri korunur`, async ({ page }) => {
      await page.route("**/api/form.php", (rota) => rota.fulfill({ status: kod, contentType: "application/json", body: govde }));
      await formHazir(page, TR);
      await doldur(page);
      await page.getByRole("button", { name: "Gönder" }).click();
      await expect(page.getByRole("status").filter({ hasText: metin })).toBeVisible();
      await expect(page.getByLabel(/^Ad soyad/)).toHaveValue("Ayşe Yılmaz");
    });
  }

  test("ağ hatası duyurulur", async ({ page }) => {
    await page.route("**/api/form.php", (rota) => rota.abort("failed"));
    await formHazir(page, TR);
    await doldur(page);
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Bağlantı kurulamadı." })).toBeVisible();
  });

  test("gönderilirken ikinci tıklama tek istek üretir", async ({ page }) => {
    let adet = 0;
    await page.route("**/api/form.php", async (rota) => {
      adet++;
      await new Promise((r) => setTimeout(r, 400));
      await rota.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await formHazir(page, TR);
    await doldur(page);
    const dugme = page.getByRole("button", { name: "Gönder" });
    await dugme.click();
    await expect(page.getByRole("button", { name: "Gönderiliyor" })).toHaveAttribute("aria-disabled", "true");
    // aria-disabled düğme Playwright'ta "etkin değil" sayılır; kullanıcı gibi zorla tıklanır.
    await page.getByRole("button", { name: "Gönderiliyor" }).click({ force: true });
    await expect(page.getByRole("status").filter({ hasText: "Mesajınız bize ulaştı." })).toBeVisible();
    expect(adet).toBe(1);
  });
});

test.describe("bayilik formu: başarı metni", () => {
  for (const [yol, alanlar, dugme, basari] of [
    ["/bayilerimiz", { ad: /^Ad soyad/, telefon: /^Telefon/, eposta: /^E-posta/, ilce: /^İlçe/ }, "Başvuruyu gönder", "Başvurunuz bize ulaştı."],
    ["/en/locations", { ad: /^Full name/, telefon: /^Phone/, eposta: /^Email/, ilce: /^District/ }, "Submit application", "We’ve received your application."],
  ] as const) {
    test(`${yol}: başarıda başvuru metni`, async ({ page }) => {
      await page.route("**/api/form.php", (rota) => rota.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
      await page.goto(yol);
      const form = page.locator("main form");
      await expect(form).toHaveAttribute("novalidate", "");
      await form.getByLabel(alanlar.ad).fill("Can Demir");
      await form.getByLabel(alanlar.telefon).fill("0532 123 45 67");
      await form.getByLabel(alanlar.eposta).fill("can@example.com");
      await form.getByLabel(alanlar.ilce).selectOption("Şişli");
      await form.getByRole("button", { name: dugme }).click();
      await expect(form.getByRole("status").filter({ hasText: basari })).toBeVisible();
    });
  }
});

test.describe("doğrulama kuralları (bayilik dahil) ve PHP ile eşleşme", () => {
  const gecerliBayilik = {
    ad: "Can Demir",
    telefon: "+90 532 123 45 67",
    eposta: "can@example.com",
    ilce: "Şişli",
  };

  test("bayilik: geçerli kayıt hatasız, eksik ilçe hatalı", () => {
    expect(dogrula("bayilik", gecerliBayilik)).toEqual({});
    expect(dogrula("bayilik", { ...gecerliBayilik, ilce: "" })).toEqual({ ilce: "bos" });
    expect(dogrula("bayilik", { ...gecerliBayilik, ilce: ISTANBUL_DISI, mevcut_isletme: "evet" })).toEqual({});
    expect(dogrula("bayilik", { ...gecerliBayilik, mevcut_isletme: "belki" })).toEqual({ mevcut_isletme: "gecersiz" });
    expect(dogrula("bayilik", { ...gecerliBayilik, lokasyon: "x".repeat(201) })).toEqual({ lokasyon: "uzun" });
  });

  test("iletişim: mesaj zorunlu, konu geçerli olmalı, satır sonu reddedilir", () => {
    const temel = { konu: "genel", ad: "A", telefon: "05321234567", eposta: "a@b.co", mesaj: "m" };
    expect(dogrula("iletisim", temel)).toEqual({});
    expect(dogrula("iletisim", { ...temel, mesaj: " " })).toEqual({ mesaj: "bos" });
    expect(dogrula("iletisim", { ...temel, konu: "x" })).toEqual({ konu: "gecersiz" });
    expect(dogrula("iletisim", { ...temel, ad: "Ali\r\nBcc: x" })).toEqual({ ad: "gecersiz" });
  });

  test("Türkçe telefon biçimleri kabul edilir", () => {
    for (const t of ["0532 123 45 67", "(0532) 123-45-67", "+90 532 123 45 67", "5321234567", "0212 555 12 34", "+1 415 555 2671"]) {
      expect(telefonGecerli(t), t).toBe(true);
    }
    for (const t of ["123", "0532 123", "telefon", "+90 123 456 78 90"]) expect(telefonGecerli(t), t).toBe(false);
  });

  test("PHP ilçe listesi app/content/ilceler.ts ile aynı", () => {
    const php = readFileSync("public/api/src/FormIslem.php", "utf8");
    const blok = php.slice(php.indexOf("private const ILCELER"), php.indexOf("private const DONUS_YOLLARI"));
    const phpIlceler = [...blok.matchAll(/'([^']+)'/g)].map((e) => e[1]);
    expect(phpIlceler).toEqual(ILCELER.map((i) => i.ad));
    expect(ILCELER).toHaveLength(39);
  });
});
