import { expect, test } from "@playwright/test";
import { yatayTasma } from "./yardimci.ts";

// Beklenen yollar bilinçli olarak düz yazıldı: rota yardımcılarından bağımsız bir doğrulama olsun.
const SAYFALAR = [
  {
    yol: "/kurumsal",
    baslik: /^Kurumsal · Hanedan Pilav$/,
    aciklama: /günlük 1 ton üretim kapasitesi/,
    teklifAdi: "Teklif İste",
    teklifYolu: "/iletisim?konu=catering",
    bayilikYolu: "/bayilerimiz#bayimiz-olun",
  },
  {
    yol: "/en/about",
    baslik: /^About Us · Hanedan Pilav$/,
    aciklama: /one metric ton of daily production capacity/,
    teklifAdi: "Request a Quote",
    teklifYolu: "/en/contact?topic=catering",
    bayilikYolu: "/en/locations#become-a-franchisee",
  },
] as const;

const BOLUM_BASLIKLARI = ["hikaye-baslik", "calisma-baslik", "catering-baslik", "degerler-baslik", "kapanis-baslik"];

for (const s of SAYFALAR) {
  test.describe(s.yol, () => {
    test("bölümler, tek h1 ve atlamasız başlık hiyerarşisi", async ({ page }) => {
      await page.goto(s.yol);
      await expect(page).toHaveTitle(s.baslik);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", s.aciklama);
      await expect(page.locator("h1")).toHaveCount(1);

      const bolumler = page.locator("main section[aria-labelledby]");
      await expect(bolumler).toHaveCount(BOLUM_BASLIKLARI.length);
      for (const [i, id] of BOLUM_BASLIKLARI.entries()) {
        await expect(bolumler.nth(i)).toHaveAttribute("aria-labelledby", id);
        const baslik = page.locator(`#${id}`);
        await expect(baslik).toBeVisible();
        expect(await baslik.evaluate((el) => el.tagName)).toBe("H2");
      }

      const seviyeler = await page
        .locator("main :is(h1, h2, h3, h4, h5, h6)")
        .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
      expect(seviyeler[0]).toBe(1);
      for (let i = 1; i < seviyeler.length; i++) {
        expect(seviyeler[i]! - seviyeler[i - 1]!, `başlık sırası: ${seviyeler.join(",")}`).toBeLessThanOrEqual(1);
      }
    });

    test("künye olguları ve görsel yerleri", async ({ page }) => {
      await page.goto(s.yol);
      const kunye = page.locator("main dl");
      await expect(kunye).toContainText("1998");
      await expect(kunye).toContainText("Sultangazi");
      await expect(kunye.locator("dt")).toHaveCount(4);
      await expect(page.locator("main [data-cekim], main img")).toHaveCount(2);
    });

    test("#catering çapası bölümü başlığın altında gösterir", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${s.yol}#catering`);
      const baslik = page.locator("#catering-baslik");
      await expect(baslik).toBeInViewport();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      const ust = await baslik.evaluate((el) => el.getBoundingClientRect().top);
      const tenteAlt = await page.getByRole("banner").evaluate((el) => el.getBoundingClientRect().bottom);
      expect(ust).toBeGreaterThanOrEqual(tenteAlt);
    });

    test("Teklif iste ve bayilik bağlantıları doğru yola gider", async ({ page }) => {
      await page.goto(s.yol);
      const teklif = page.locator("#catering").getByRole("link", { name: s.teklifAdi, exact: true });
      await expect(teklif).toHaveCount(1);
      await expect(teklif).toHaveAttribute("href", s.teklifYolu);

      const bayilik = page.locator('section[aria-labelledby="kapanis-baslik"]').getByRole("link");
      await expect(bayilik).toHaveCount(1);
      await expect(bayilik).toHaveAttribute("href", s.bayilikYolu);

      await teklif.click();
      await expect(page).toHaveURL((url) => `${url.pathname}${url.search}` === s.teklifYolu);
      await expect(page.locator("h1")).toBeVisible();
    });

    for (const genislik of [360, 1440]) {
      test(`${genislik}px: yatay taşma yok`, async ({ page }) => {
        await page.setViewportSize({ width: genislik, height: 900 });
        await page.goto(s.yol);
        await page.evaluate(() => document.fonts.ready);
        expect(await yatayTasma(page)).toBeLessThanOrEqual(0);
      });
    }
  });
}
