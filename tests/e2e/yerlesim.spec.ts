import { expect, test } from "@playwright/test";
import { TUM_YOLLAR, yatayTasma } from "./yardimci.ts";

for (const genislik of [360, 1440]) {
  test.describe(`${genislik}px`, () => {
    test.use({ viewport: { width: genislik, height: 900 } });
    for (const yol of TUM_YOLLAR) {
      test(`${yol}: yatay taşma yok`, async ({ page }) => {
        await page.goto(yol);
        await page.evaluate(() => document.fonts.ready);
        expect(await yatayTasma(page)).toBeLessThanOrEqual(0);
      });
    }
  });
}

test.describe("başlık kaydırınca kompakt, yerleşim kaymaz", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("kompakt geçişte h1 konumu değişmez", async ({ page }) => {
    await page.goto("/galeri");
    const tente = page.getByRole("banner");
    await expect(tente).toHaveAttribute("data-kompakt", "false");
    // offsetTop yerleşimi ölçer; giriş animasyonunun transform'u sonucu etkilemez.
    const konum = () => page.locator("h1").evaluate((el) => (el as HTMLElement).offsetTop);
    const once = await konum();
    await page.mouse.wheel(0, 400);
    await expect(tente).toHaveAttribute("data-kompakt", "true");
    expect(await konum()).toBe(once);
  });
});
