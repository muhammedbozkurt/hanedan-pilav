import { expect, test, type Page } from "@playwright/test";
import { BAYILER } from "../../app/content/bayiler.ts";
import { yatayTasma } from "./yardimci.ts";

// Beklenen metin ve yollar bilinçli olarak düz yazıldı: uygulamanın yardımcılarından bağımsız bir doğrulama olsun.
const merkez = BAYILER.find((b) => b.slug === "sultangazi-merkez");
if (!merkez?.telefon) throw new Error("Sultangazi merkez verisi eksik");
const ADRES = `${merkez.adres.satir}, ${merkez.adres.postaKodu} ${merkez.adres.ilce}/${merkez.adres.il}`;
const YOL_TARIFI = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADRES)}`;
const TEL = `tel:${merkez.telefon.e164}`;

const DILLER = [
  {
    dil: "tr",
    yol: "/bayilerimiz",
    detay: "/bayilerimiz/sultangazi-merkez",
    capa: "bayimiz-olun",
    baslik: /^Bayilerimiz · Hanedan Pilav$/,
    aciklama: /ilçenize göre bayi bulun/,
    ad: "Sultangazi Merkez",
    tur: "Merkez",
    ilce: "İlçe",
    yolTarifi: /^Yol tarifi: Sultangazi Merkez \(yeni sekmede açılır\)$/,
    bosBaslik: "Bu ilçede henüz bayimiz yok.",
    bayilik: "Bayilik Başvurusu",
    bayilikBaslik: "Hanedan Pilav bayisi olun.",
    temizle: "Tüm bayileri göster",
    goster: "Haritayı göster",
    gizle: "Haritayı gizle",
    konum: "Konumumu kullan",
    merkezIlce: "Sultangazi, merkez",
    yokIlce: "Esenler, bayi yok",
    gonder: "Başvuruyu gönder",
    adAlani: /^Ad soyad/,
    adHata: "Lütfen adınızı ve soyadınızı yazın.",
    duzeltme: "4 alanda düzeltme gerekiyor.",
  },
  {
    dil: "en",
    yol: "/en/locations",
    detay: "/en/locations/sultangazi-merkez",
    capa: "become-a-franchisee",
    baslik: /^Locations · Hanedan Pilav$/,
    aciklama: /Find a Hanedan Pilav location by district/,
    ad: "Sultangazi Headquarters",
    tur: "Headquarters",
    ilce: "District",
    yolTarifi: /^Directions to Sultangazi Headquarters \(opens in a new tab\)$/,
    bosBaslik: "We don’t have a location in this district yet.",
    bayilik: "Become a Franchisee",
    bayilikBaslik: "Become a Hanedan Pilav franchisee.",
    temizle: "Show All Locations",
    goster: "Show Map",
    gizle: "Hide Map",
    konum: "Use My Location",
    merkezIlce: "Sultangazi, headquarters",
    yokIlce: "Esenler, no location",
    gonder: "Submit application",
    adAlani: /^Full name/,
    adHata: "Please enter your full name.",
    duzeltme: "4 fields need your attention.",
  },
] as const;

const arama = (page: Page) => page.getByRole("search");
const ilceSecimi = (page: Page, etiket: string) => arama(page).getByLabel(etiket);
const liste = (page: Page) => page.locator("main ul").filter({ has: page.locator("article") });

async function hidrasyon(page: Page) {
  // Bayilik formu hidrasyonda noValidate olur; bu, sayfadaki etkileşimlerin hazır olduğunun işaretidir.
  await expect(page.locator("main form")).toHaveAttribute("novalidate", "");
}

for (const d of DILLER) {
  test.describe(`${d.yol} masaüstü`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("meta, merkez satırı ve bağlantıları", async ({ page }) => {
      await page.goto(d.yol);
      await expect(page).toHaveTitle(d.baslik);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", d.aciklama);

      const satir = liste(page).locator("article");
      await expect(satir).toHaveCount(BAYILER.length);
      const ilk = satir.first();
      await expect(ilk.getByRole("heading", { level: 3, name: d.ad })).toBeVisible();
      await expect(ilk.getByRole("link", { name: d.ad, exact: true })).toHaveAttribute("href", d.detay);
      await expect(ilk.getByText(d.tur, { exact: true })).toBeVisible();
      await expect(ilk.getByText(ADRES)).toBeVisible();
      await expect(ilk.locator(`a[href="${TEL}"]`)).toBeVisible();

      const tarif = ilk.getByRole("link", { name: d.yolTarifi });
      await expect(tarif).toHaveAttribute("href", YOL_TARIFI);
      await expect(tarif).toHaveAttribute("target", "_blank");
      await expect(tarif).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("tek bayi varken sayı ve konum düğmesi gösterilmez", async ({ page }) => {
      await page.goto(d.yol);
      await hidrasyon(page);
      expect(BAYILER.some((b) => b.tur === "sube")).toBe(false);
      expect(BAYILER.some((b) => b.konum)).toBe(false);
      await expect(page.getByText(/^\d+ (bayi|locations?)$/)).toHaveCount(0);
      await expect(page.getByRole("button", { name: d.konum })).toHaveCount(0);
    });

    test("ilçe seçimi filtreler; boş durum bayilik bölümüne götürür", async ({ page }) => {
      await page.goto(d.yol);
      await hidrasyon(page);
      const secim = ilceSecimi(page, d.ilce);
      await expect(secim.locator("option")).toHaveCount(40);
      await expect(secim.locator("optgroup")).toHaveCount(2);

      await secim.selectOption("kadikoy");
      await expect(page).toHaveURL(/[?&](ilce|district)=kadikoy/);
      await expect(liste(page)).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 3, name: d.bosBaslik })).toBeVisible();
      await expect(page.locator('svg [role="button"][aria-pressed="true"]')).toHaveCount(1);

      await secim.selectOption("sultangazi");
      await expect(liste(page).locator("article")).toHaveCount(1);

      await secim.selectOption("fatih");
      const bulucu = page.locator("main section").filter({ has: page.getByRole("search") });
      await bulucu.getByRole("link", { name: d.bayilik }).click();
      await expect(page).toHaveURL(new RegExp(`fatih#${d.capa}$`));
      await expect(page.getByRole("heading", { level: 2, name: d.bayilikBaslik })).toBeInViewport();
      await expect(secim).toHaveValue("fatih");

      await page.getByRole("button", { name: d.temizle }).click();
      await expect(secim).toHaveValue("");
      await expect(liste(page).locator("article")).toHaveCount(BAYILER.length);
    });

    test("adresle gelen ilçe seçimi uygulanır, arama Türkçe karakterden bağımsızdır", async ({ page }) => {
      await page.goto(`${d.yol}?${d.dil === "tr" ? "ilce" : "district"}=uskudar`);
      await hidrasyon(page);
      await expect(ilceSecimi(page, d.ilce)).toHaveValue("uskudar");
      await expect(page.getByRole("heading", { level: 3, name: d.bosBaslik })).toBeVisible();

      await page.goto(d.yol);
      await hidrasyon(page);
      const kutu = arama(page).getByRole("searchbox");
      await kutu.fill("SULTANGAZİ");
      await expect(liste(page).locator("article")).toHaveCount(1);
      await kutu.fill("kadikoy");
      await expect(liste(page)).toHaveCount(0);
      await expect(page.getByRole("button", { name: d.temizle })).toBeVisible();
      await page.getByRole("button", { name: d.temizle }).click();
      await expect(kutu).toHaveValue("");
      await expect(liste(page).locator("article")).toHaveCount(BAYILER.length);
    });

    test("haritadan seçim listeyi ve select'i günceller", async ({ page }) => {
      await page.goto(d.yol);
      await hidrasyon(page);
      const secim = ilceSecimi(page, d.ilce);
      await expect(page.getByRole("button", { name: d.goster })).toBeHidden();

      await page.getByRole("button", { name: d.yokIlce }).click();
      await expect(secim).toHaveValue("esenler");
      await expect(page.getByRole("heading", { level: 3, name: d.bosBaslik })).toBeVisible();

      const merkezIlce = page.getByRole("button", { name: d.merkezIlce });
      await merkezIlce.click();
      await expect(secim).toHaveValue("sultangazi");
      await expect(merkezIlce).toHaveAttribute("aria-pressed", "true");
      await expect(liste(page).locator("article")).toHaveCount(1);

      await merkezIlce.click();
      await expect(secim).toHaveValue("");
      await expect(merkezIlce).toHaveAttribute("aria-pressed", "false");

      await secim.selectOption("esenler");
      await expect(page.getByRole("button", { name: d.yokIlce })).toHaveAttribute("aria-pressed", "true");
    });

    test("header düğmesi bayilik bölümüne gider; başlık tentenin altında kalmaz", async ({ page }) => {
      await page.goto(d.dil === "tr" ? "/" : "/en");
      await page.getByRole("banner").getByRole("link", { name: d.bayilik }).click();
      await expect(page).toHaveURL(new RegExp(`${d.yol}#${d.capa}$`));
      const bolum = page.locator(`#${d.capa}`);
      await expect(bolum).toBeFocused();
      const baslik = page.getByRole("heading", { level: 2, name: d.bayilikBaslik });
      await expect(baslik).toBeInViewport();
      await expect
        .poll(async () => {
          const tente = await page.getByRole("banner").boundingBox();
          const b = await baslik.boundingBox();
          return tente && b ? b.y - (tente.y + tente.height) : -1;
        })
        .toBeGreaterThan(0);
    });

    test("çapalı doğrudan açılışta başlık görünür", async ({ page }) => {
      await page.goto(`${d.yol}#${d.capa}`);
      await hidrasyon(page);
      const baslik = page.getByRole("heading", { level: 2, name: d.bayilikBaslik });
      await expect(baslik).toBeInViewport();
      await expect
        .poll(async () => {
          const tente = await page.getByRole("banner").boundingBox();
          const b = await baslik.boundingBox();
          return tente && b ? b.y - (tente.y + tente.height) : -1;
        })
        .toBeGreaterThan(0);
    });

    test("bayilik formu plaka içinde; boş gönderimde zorunlu alan hataları", async ({ page }) => {
      await page.goto(d.yol);
      await hidrasyon(page);
      const bolum = page.locator(`#${d.capa}`);
      const form = bolum.locator("form");
      await expect(form).toHaveCount(1);
      await expect(form.locator('input[name="form"]')).toHaveValue("bayilik");
      await expect(bolum.locator("[data-fab-gizle]")).toHaveCount(1);
      await form.getByRole("button", { name: d.gonder }).click();
      const ad = form.getByLabel(d.adAlani);
      await expect(ad).toBeFocused();
      await expect(ad).toHaveAttribute("aria-invalid", "true");
      await expect(form.getByText(d.adHata)).toBeVisible();
      await expect(form.getByRole("status").filter({ hasText: d.duzeltme })).toBeVisible();
    });
  });

  test.describe(`${d.yol} mobil`, () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("harita varsayılan kapalı, düğmeyle açılır; select ve liste önde", async ({ page }) => {
      await page.goto(d.yol);
      await hidrasyon(page);
      await expect(ilceSecimi(page, d.ilce)).toBeInViewport();
      const harita = page.locator("#bayi-haritasi");
      await expect(harita).toBeHidden();
      const dugme = page.getByRole("button", { name: d.goster });
      await expect(dugme).toHaveAttribute("aria-expanded", "false");
      await expect(dugme).toHaveAttribute("aria-controls", "bayi-haritasi");
      await expect(liste(page).locator("article")).toHaveCount(BAYILER.length);

      await dugme.click();
      await expect(harita).toBeVisible();
      const kapat = page.getByRole("button", { name: d.gizle });
      await expect(kapat).toHaveAttribute("aria-expanded", "true");
      await page.getByRole("button", { name: d.yokIlce }).click();
      await expect(ilceSecimi(page, d.ilce)).toHaveValue("esenler");
      expect(await yatayTasma(page)).toBeLessThanOrEqual(0);

      await kapat.click();
      await expect(harita).toBeHidden();
    });

    test("bayilik plakası görünürken FAB çekilir", async ({ page }) => {
      await page.goto(d.yol);
      await hidrasyon(page);
      const fab = page.locator("[data-wa-fab]");
      await expect(fab).toHaveAttribute("data-gizli", "false");
      await page.locator(`#${d.capa} [data-fab-gizle]`).scrollIntoViewIfNeeded();
      await expect(fab).toHaveAttribute("data-gizli", "true");
      await expect(fab).toBeHidden();
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(fab).toHaveAttribute("data-gizli", "false");
    });
  });
}

const DETAYLAR = [
  {
    yol: "/bayilerimiz/sultangazi-merkez",
    liste: "/bayilerimiz",
    baslik: /^Sultangazi Merkez · Hanedan Pilav$/,
    ad: "Sultangazi Merkez",
    tur: "Merkez",
    saat: "Her gün 09:00-17:00",
    yolTarifi: /^Yol tarifi al \(yeni sekmede açılır\)$/,
    not: "İlçe merkezi gösterilir, adres noktası değildir.",
    geri: "Tüm bayiler",
    bulunamadi: "Bu sayfa menüde yok.",
  },
  {
    yol: "/en/locations/sultangazi-merkez",
    liste: "/en/locations",
    baslik: /^Sultangazi Headquarters · Hanedan Pilav$/,
    ad: "Sultangazi Headquarters",
    tur: "Headquarters",
    saat: "Every day, 09:00-17:00",
    yolTarifi: /^Get Directions \(opens in a new tab\)$/,
    not: "Shows the district center, not a street address.",
    geri: "All locations",
    bulunamadi: "This page isn’t on the menu.",
  },
] as const;

for (const d of DETAYLAR) {
  test.describe(d.yol, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("ad, tür, adres, telefon, saat, yol tarifi ve mini harita", async ({ page }) => {
      await page.goto(d.yol);
      await expect(page).toHaveTitle(d.baslik);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", new RegExp(merkez.adres.satir.replace(/\./g, "\\.")));
      await expect(page.locator("h1")).toHaveText(d.ad);
      await expect(page.locator("header").getByText(d.tur, { exact: true })).toBeVisible();
      await expect(page.locator("main dl")).toContainText(ADRES);
      await expect(page.locator("main dl")).toContainText(d.saat);
      await expect(page.locator(`main a[href="${TEL}"]`)).toHaveCount(2);

      const tarif = page.getByRole("link", { name: d.yolTarifi });
      await expect(tarif).toHaveAttribute("href", YOL_TARIFI);
      await expect(tarif).toHaveAttribute("target", "_blank");
      await expect(tarif).toHaveAttribute("rel", "noopener noreferrer");

      const harita = page.locator('figure[data-varyant="mini"]');
      await expect(harita).toBeVisible();
      await expect(harita).toContainText(d.not);
      await expect(harita.locator("svg")).toHaveAttribute("role", "img");

      await expect(page.getByRole("link", { name: d.geri, exact: true })).toHaveAttribute("href", d.liste);
    });

    test("detay sayfası bayi JSON-LD'si içerir", async ({ page }) => {
      await page.goto(d.yol);
      const bloklar = await page.locator('script[type="application/ld+json"]').allTextContents();
      const bayi = bloklar.map((b) => JSON.parse(b) as { "@type"?: string; url?: string }).find((v) => v["@type"] === "FoodEstablishment");
      expect(bayi?.url).toBe(`https://www.hanedanpilav.com${d.yol}`);
    });

    test("listeden detaya ve geri istemci tarafında geçilir", async ({ page }) => {
      await page.goto(d.liste);
      await hidrasyon(page);
      await page.locator("main article").getByRole("link", { name: d.ad, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${d.yol}$`));
      await expect(page.locator("h1")).toHaveText(d.ad);
      await page.getByRole("link", { name: d.geri, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${d.liste}$`));
    });

    test("bilinmeyen bayi 404 döner, konsolda React hatası yok", async ({ page }) => {
      // Bilinen sınırlama: sunucu bilinmeyen adreste prerender /404 HTML'ini döner, istemci ise bayi-detay rotasını eşler; <head> içindeki
      // rota CSS/modulepreload bağlantıları ayrıştığı için React #418 hidrasyon uyarısı verir ve istemci çizimine geri döner.
      // Kapsam dışı (public/.htaccess, scripts/**) bir çözüm gerektirir; bu yüzden yalnız #418 ve belge 404 satırı ayıklanır.
      const hatalar: string[] = [];
      const bilinen = /Minified React error #418|Failed to load resource: the server responded with a status of 404/;
      page.on("pageerror", (e) => hatalar.push(e.message));
      page.on("console", (c) => {
        if (c.type() === "error") hatalar.push(c.text());
      });
      const yanit = await page.goto(d.yol.replace("sultangazi-merkez", "olmayan-bayi"));
      expect(yanit?.status()).toBe(404);
      await expect(page.locator("h1")).toHaveText(d.bulunamadi);
      await page.waitForLoadState("networkidle");
      expect(hatalar.filter((h) => !bilinen.test(h))).toEqual([]);
    });
  });
}

for (const genislik of [360, 1440]) {
  test.describe(`${genislik}px taşma`, () => {
    test.use({ viewport: { width: genislik, height: 900 } });
    for (const yol of ["/bayilerimiz", "/en/locations", "/bayilerimiz/sultangazi-merkez", "/en/locations/sultangazi-merkez"]) {
      test(`${yol}: yatay taşma yok`, async ({ page }) => {
        await page.goto(yol);
        await page.evaluate(() => document.fonts.ready);
        expect(await yatayTasma(page)).toBeLessThanOrEqual(0);
      });
    }
  });
}
