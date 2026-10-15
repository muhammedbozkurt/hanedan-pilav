import { expect, test } from "@playwright/test";
import { WA_PARCASI, yatayTasma } from "./yardimci.ts";

// Beklenen yollar bilinçli olarak düz yazıldı: rota yardımcılarından bağımsız bir doğrulama olsun.
const SAYFALAR = [
  {
    yol: "/",
    baslik: /^Hanedan Pilav · 1998’den beri değişmeyen lezzet$/,
    aciklama: /Günlük 1 ton üretim kapasitesi/,
    bayilik: { ad: "Bayilik Başvurusu", yol: "/bayilerimiz#bayimiz-olun" },
    teklif: { ad: "Toplu Yemek Teklifi", yol: "/iletisim?konu=catering" },
    hizmetler: ["/bayilerimiz#bayimiz-olun", "/kurumsal#catering", "/bayilerimiz"],
    kurumsal: { ad: "Kurumsal hikayemiz", yol: "/kurumsal" },
    bayiBul: { ad: "En Yakın Bayiyi Bul", yol: "/bayilerimiz" },
    galeri: { ad: "Tüm galeri", yol: "/galeri", serit: "Galeri şeridi" },
    pin: "Merkez · Sultangazi",
    wa: "WhatsApp’tan yazın",
  },
  {
    yol: "/en",
    baslik: /^Hanedan Pilav · Made the same way since 1998$/,
    aciklama: /Franchise opportunities, catering and locations across Istanbul/,
    bayilik: { ad: "Become a Franchisee", yol: "/en/locations#become-a-franchisee" },
    teklif: { ad: "Get a Catering Quote", yol: "/en/contact?topic=catering" },
    hizmetler: ["/en/locations#become-a-franchisee", "/en/about#catering", "/en/locations"],
    kurumsal: { ad: "Read our story", yol: "/en/about" },
    bayiBul: { ad: "Find a Location", yol: "/en/locations" },
    galeri: { ad: "Full gallery", yol: "/en/gallery", serit: "Gallery strip" },
    pin: "HQ · Sultangazi",
    wa: "Chat on WhatsApp",
  },
] as const;

const BOLUMLER = [
  "acilis-baslik",
  "kunye-baslik",
  "hizmet-baslik",
  "hikaye-baslik",
  "bayi-baslik",
  "galeri-baslik",
  "plaka-baslik",
] as const;

const bolum = (id: (typeof BOLUMLER)[number]) => `main section[aria-labelledby="${id}"]`;

for (const s of SAYFALAR) {
  test.describe(s.yol, () => {
    test("meta, tek h1, yedi bölüm referans sırasıyla ve atlamasız başlık hiyerarşisi", async ({ page }) => {
      await page.goto(s.yol);
      await expect(page).toHaveTitle(s.baslik);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", s.aciklama);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveId("acilis-baslik");

      const bolumler = page.locator("main section[aria-labelledby]");
      await expect(bolumler).toHaveCount(BOLUMLER.length);
      for (const [i, id] of BOLUMLER.entries()) {
        await expect(bolumler.nth(i)).toHaveAttribute("aria-labelledby", id);
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }

      const seviyeler = await page
        .locator("main :is(h1, h2, h3, h4, h5, h6)")
        .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
      expect(seviyeler[0]).toBe(1);
      for (let i = 1; i < seviyeler.length; i++) {
        expect(seviyeler[i]! - seviyeler[i - 1]!, `başlık sırası: ${seviyeler.join(",")}`).toBeLessThanOrEqual(1);
      }
    });

    test("künye olguları", async ({ page }) => {
      await page.goto(s.yol);
      const kunye = page.locator(bolum("kunye-baslik")).locator("dl");
      await expect(kunye.locator("dt")).toHaveCount(4);
      await expect(kunye).toContainText("1998");
      await expect(kunye).toContainText(/1\s+ton/);
      await expect(kunye).toContainText("Sultangazi");
    });

    test("eylem bağlantıları doğru yollara gider", async ({ page }) => {
      await page.goto(s.yol);
      const acilis = page.locator(bolum("acilis-baslik"));
      await expect(acilis.getByRole("link")).toHaveCount(2);
      await expect(acilis.getByRole("link", { name: s.bayilik.ad, exact: true })).toHaveAttribute("href", s.bayilik.yol);
      await expect(acilis.getByRole("link", { name: s.teklif.ad, exact: true })).toHaveAttribute("href", s.teklif.yol);

      const hizmetler = page.locator(bolum("hizmet-baslik")).getByRole("link");
      await expect(hizmetler).toHaveCount(s.hizmetler.length);
      for (const [i, yol] of s.hizmetler.entries()) await expect(hizmetler.nth(i)).toHaveAttribute("href", yol);

      const hikaye = page.locator(bolum("hikaye-baslik")).getByRole("link");
      await expect(hikaye).toHaveCount(1);
      await expect(hikaye).toHaveAccessibleName(s.kurumsal.ad);
      await expect(hikaye).toHaveAttribute("href", s.kurumsal.yol);

      const harita = page.locator(bolum("bayi-baslik")).getByRole("link", { name: s.bayiBul.ad, exact: true });
      await expect(harita).toHaveAttribute("href", s.bayiBul.yol);

      const galeri = page.locator(bolum("galeri-baslik")).getByRole("link", { name: s.galeri.ad, exact: true });
      await expect(galeri).toHaveAttribute("href", s.galeri.yol);

      const plaka = page.locator(bolum("plaka-baslik"));
      await expect(plaka.getByRole("link", { name: s.bayilik.ad, exact: true })).toHaveAttribute("href", s.bayilik.yol);
      await expect(plaka.locator('a[href^="tel:"]')).toHaveAttribute("href", "tel:+905336163754");
      const wa = plaka.getByRole("link", { name: new RegExp(s.wa) });
      await expect(wa).toHaveAttribute("href", new RegExp(WA_PARCASI));
      await expect(wa).toHaveAttribute("target", "_blank");
    });

    test("toplu yemek teklifi iletişim formunda catering konusunu önseçer", async ({ page }) => {
      await page.goto(s.yol);
      await page.locator(bolum("acilis-baslik")).getByRole("link", { name: s.teklif.ad, exact: true }).click();
      await expect(page).toHaveURL((url) => `${url.pathname}${url.search}` === s.teklif.yol);
      await expect(page.locator("select[name=konu]")).toHaveValue("catering");
    });

    test("galeri şeridinde dört kare", async ({ page }) => {
      await page.goto(s.yol);
      const serit = page.getByRole("region", { name: s.galeri.serit });
      await expect(serit.locator("li")).toHaveCount(4);
      await expect(serit.locator('li [role="img"], li img')).toHaveCount(4);
    });

    for (const genislik of [360, 1440]) {
      test(`${genislik}px: harita tanıtımında merkez pini panonun içinde, taşma yok`, async ({ page }) => {
        await page.setViewportSize({ width: genislik, height: 900 });
        await page.goto(s.yol);
        await page.evaluate(() => document.fonts.ready);
        expect(await yatayTasma(page)).toBeLessThanOrEqual(0);

        const harita = page.locator(bolum("bayi-baslik"));
        await expect(harita.locator('figure[data-varyant="tanitim"]')).toHaveCount(1);
        const pin = harita.getByText(s.pin, { exact: true });
        await expect(pin).toHaveCount(1);
        // Pinin kendisine kaydırılmaz: kırpan kesit de kayar ve taşma gizlenirdi.
        await harita.scrollIntoViewIfNeeded();
        await expect(pin).toBeVisible();
        // Pano taşanı kırpar: tabela panonun sınırları içinde kalmalı ki okunabilsin.
        const pano = await harita.locator("figure").evaluate((el) => el.closest("section > .kap > div")!.getBoundingClientRect().toJSON());
        const kutu = await pin.boundingBox();
        expect(kutu).not.toBeNull();
        if (!kutu) return;
        expect(kutu.x).toBeGreaterThanOrEqual(pano.left);
        expect(kutu.x + kutu.width).toBeLessThanOrEqual(pano.right);
        expect(kutu.y).toBeGreaterThanOrEqual(pano.top);
        expect(kutu.y + kutu.height).toBeLessThanOrEqual(pano.bottom);
      });
    }
  });
}

for (const [genislik, yukseklik] of [
  [390, 844],
  [1440, 900],
] as const) {
  test(`${genislik}px: bayilik plakası görünürken FAB gizlenir, plaka dışında görünür`, async ({ page }) => {
    await page.setViewportSize({ width: genislik, height: yukseklik });
    await page.goto("/");
    const fab = page.locator("[data-wa-fab]");
    const plaka = page.locator(bolum("plaka-baslik")).locator("[data-fab-gizle]");
    await expect(plaka).toHaveCount(1);
    await expect(fab).toHaveAttribute("data-gizli", "false");
    await expect(fab).toBeVisible();

    await plaka.scrollIntoViewIfNeeded();
    await expect(fab).toHaveAttribute("data-gizli", "true");
    await expect(fab).toBeHidden();

    await page.locator(bolum("hizmet-baslik")).scrollIntoViewIfNeeded();
    await expect(fab).toHaveAttribute("data-gizli", "false");
    await expect(fab).toBeVisible();
  });
}
