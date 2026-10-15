import { expect, test } from "@playwright/test";
import { KARSILIK, TUM_YOLLAR, dilBul, digerDil } from "./yardimci.ts";

test.describe("dil seçici", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const yol of TUM_YOLLAR) {
    test(`${yol}: diğer dil bağlantısı eşdeğer yola gider`, async ({ page }) => {
      await page.goto(yol);
      const hedef = digerDil(dilBul(yol));
      const linkler = page.locator(`[role="group"] a[data-dil="${hedef}"]`);
      expect(await linkler.count()).toBeGreaterThanOrEqual(2);
      for (const link of await linkler.all()) {
        await expect(link).toHaveAttribute("href", KARSILIK.get(yol) ?? "YOK");
      }
    });
  }

  test("tıklayınca aynı sayfanın karşılığı açılır ve lang değişir", async ({ page }) => {
    await page.goto("/kurumsal");
    await page.getByRole("banner").locator('a[data-dil="en"]').click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText("Traditional flavor, modern production.");

    await page.goto("/en/locations/sultangazi-merkez");
    await page.getByRole("banner").locator('a[data-dil="tr"]').click();
    await expect(page).toHaveURL(/\/bayilerimiz\/sultangazi-merkez$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });
});
