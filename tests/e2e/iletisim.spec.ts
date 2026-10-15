import { expect, test } from "@playwright/test";
import { SITE, WA_PARCASI, yatayTasma } from "./yardimci.ts";

const SAYFALAR = [
  { yol: "/iletisim", dil: "tr", konu: "konu", bayilik: "/bayilerimiz#bayimiz-olun", catering: "/kurumsal#catering" },
  { yol: "/en/contact", dil: "en", konu: "topic", bayilik: "/en/locations#become-a-franchisee", catering: "/en/about#catering" },
] as const;

for (const sayfa of SAYFALAR) {
  test.describe(`${sayfa.yol}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("tek h1, tel ve WhatsApp bağlantıları", async ({ page }) => {
      await page.goto(sayfa.yol);
      await expect(page.locator("h1")).toHaveCount(1);
      const main = page.locator("main");
      await expect(main.locator(`a[href="tel:${SITE.telefon.e164}"]`)).toHaveCount(1);
      const wa = main.locator(`a[href*="${WA_PARCASI}"]`);
      await expect(wa).toHaveCount(1);
      await expect(wa).toHaveAttribute("href", /\?text=.+/);
      await expect(wa).toHaveAttribute("target", "_blank");
      await expect(wa).toHaveAttribute("rel", "noopener noreferrer");
      await expect(wa).toContainText(sayfa.dil === "tr" ? "yeni sekmede açılır" : "opens in a new tab");
      await expect(wa).toContainText(sayfa.dil === "tr" ? "WhatsApp’tan yazın" : "Chat on WhatsApp");
    });

    test("yol tarifi bağlantısı kodlanmış adresle yeni sekmede açılır", async ({ page }) => {
      await page.goto(sayfa.yol);
      const link = page.locator('main a[href^="https://www.google.com/maps/search/"]');
      await expect(link).toHaveCount(1);
      const href = (await link.getAttribute("href")) ?? "";
      const url = new URL(href);
      expect(url.searchParams.get("api")).toBe("1");
      const sorgu = url.searchParams.get("query") ?? "";
      expect(sorgu).toContain(SITE.adres.cadde);
      expect(sorgu).toContain(SITE.adres.ilce);
      expect(href).not.toContain(" ");
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("e-posta satırı yalnız adres tanımlıysa görünür", async ({ page }) => {
      await page.goto(sayfa.yol);
      const posta = page.locator('main a[href^="mailto:"]');
      if (SITE.eposta === null) {
        await expect(posta).toHaveCount(0);
        await expect(page.locator("main dt", { hasText: /^(E-posta|Email)$/ })).toHaveCount(0);
      } else {
        await expect(posta).toHaveAttribute("href", `mailto:${SITE.eposta}`);
      }
    });

    test("mini harita ve adres noktası notu ile OSM atfı var", async ({ page }) => {
      await page.goto(sayfa.yol);
      const harita = page.locator('main figure[data-varyant="mini"]');
      await expect(harita).toHaveCount(1);
      await expect(harita).toContainText(sayfa.dil === "tr" ? "tam adresi değil" : "not the exact address");
      const atif = harita.getByRole("link", { name: /OpenStreetMap/ });
      await expect(atif).toHaveAttribute("href", /openstreetmap\.org/);
    });

    test("form var ve konu önseçimi çalışır", async ({ page }) => {
      await page.goto(sayfa.yol);
      await expect(page.locator("main form")).toHaveCount(1);
      await expect(page.locator("select[name=konu]")).toHaveValue("genel");
      await page.goto(`${sayfa.yol}?${sayfa.konu}=catering`);
      await expect(page.locator("select[name=konu]")).toHaveValue("catering");
    });

    test("bayilik ve toplu yemek yönlendirmeleri doğru yola gider", async ({ page }) => {
      await page.goto(sayfa.yol);
      await expect(page.locator(`main a[href="${sayfa.bayilik}"]`)).toHaveCount(1);
      await expect(page.locator(`main a[href="${sayfa.catering}"]`)).toHaveCount(1);
    });
  });

  for (const genislik of [360, 1440]) {
    test(`${sayfa.yol} ${genislik}px: yatay taşma yok`, async ({ page }) => {
      await page.setViewportSize({ width: genislik, height: 900 });
      await page.goto(sayfa.yol);
      await page.evaluate(() => document.fonts.ready);
      expect(await yatayTasma(page)).toBeLessThanOrEqual(0);
    });
  }
}
