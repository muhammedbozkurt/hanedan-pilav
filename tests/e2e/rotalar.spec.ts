import { expect, test } from "@playwright/test";
import { SITE, TUM_YOLLAR, WA_PARCASI, dilBul } from "./yardimci.ts";

test.describe("her rota", () => {
  for (const yol of TUM_YOLLAR) {
    test(`${yol}: 200, tek h1, doğru lang, header/footer/FAB, konsol hatasız`, async ({ page }) => {
      const konsolHatalari: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") konsolHatalari.push(m.text());
      });
      page.on("pageerror", (e) => konsolHatalari.push(e.message));
      const yanit = await page.goto(yol);
      await page.waitForLoadState("networkidle");
      expect(yanit?.status()).toBe(200);

      await expect(page.locator("html")).toHaveAttribute("lang", dilBul(yol));
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page).toHaveTitle(/Hanedan Pilav/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE.alanAdi}${yol}`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeAttached();
      const fab = page.locator("[data-wa-fab]");
      await expect(fab).toHaveCount(1);
      await expect(fab).toHaveAttribute("href", new RegExp(WA_PARCASI.replace(/\./g, "\\.")));
      expect(konsolHatalari, "hidrasyon veya çalışma zamanı hatası").toEqual([]);
    });
  }

  test("bilinmeyen yol 404 sayfası döner", async ({ page }) => {
    const tr = await page.goto("/olmayan-sayfa");
    expect(tr?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("h1")).toHaveCount(1);
    const en = await page.goto("/en/missing-page");
    expect(en?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
