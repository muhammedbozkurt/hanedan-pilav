import { expect, test } from "@playwright/test";
import { ILCELER } from "../../app/content/ilceler.ts";

const SAYFALAR = [
  { yol: "/bayilerimiz", merkez: "Sultangazi, merkez", yok: "Esenler, bayi yok", atif: "© OpenStreetMap’e katkıda bulunanlar" },
  { yol: "/en/locations", merkez: "Sultangazi, headquarters", yok: "Esenler, no location", atif: "© OpenStreetMap contributors" },
];

for (const sayfa of SAYFALAR) {
  test.describe(sayfa.yol, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("39 ilçe çizilir ve atıf bağlantısı vardır", async ({ page }) => {
      await page.goto(sayfa.yol);
      await expect(page.locator('svg [role="button"]')).toHaveCount(ILCELER.length);
      const atif = page.getByRole("link", { name: sayfa.atif });
      await expect(atif).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
    });

    test("ilçe etiketleri dile göre gelir", async ({ page }) => {
      await page.goto(sayfa.yol);
      await expect(page.getByRole("button", { name: sayfa.merkez })).toBeVisible();
      await expect(page.getByRole("button", { name: sayfa.yok })).toBeVisible();
    });

    test("klavyeyle ilçe odaklanır ve seçilir", async ({ page }) => {
      await page.goto(sayfa.yol);
      const ilce = page.getByRole("button", { name: sayfa.yok });
      await ilce.focus();
      await expect(ilce).toBeFocused();
      await expect(ilce).toHaveAttribute("aria-pressed", "false");
      await page.keyboard.press("Enter");
      await expect(ilce).toHaveAttribute("aria-pressed", "true");
      const merkez = page.getByRole("button", { name: sayfa.merkez });
      await merkez.focus();
      await page.keyboard.press("Space");
      await expect(merkez).toHaveAttribute("aria-pressed", "true");
      await expect(ilce).toHaveAttribute("aria-pressed", "false");
    });
  });
}
