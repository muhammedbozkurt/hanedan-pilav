import { expect, test } from "@playwright/test";

test.describe("mobil menü", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("açılır, odak içeride kalır, Escape ile kapanır ve odak düğmeye döner", async ({ page }) => {
    await page.goto("/kurumsal");
    const ac = page.getByRole("button", { name: "Menü" });
    const menu = page.getByRole("dialog", { name: "Site menüsü" });
    await expect(ac).toBeVisible();
    await expect(ac).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeHidden();

    await ac.click();
    await expect(menu).toBeVisible();
    await expect(ac).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "Kapat" })).toBeFocused();
    await expect(page.locator("html")).toHaveClass(/menu-acik/);
    await expect(page.locator("main#icerik")).toHaveJSProperty("inert", true);

    // Odak tuzağı: ilk öğeden geriye Tab son öğeye, sondan ileri Tab ilk öğeye gider.
    await page.keyboard.press("Shift+Tab");
    const sonOdak = await page.evaluate(() => document.activeElement?.closest("#mobil-menu") !== null);
    expect(sonOdak).toBe(true);
    for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.closest("#mobil-menu") !== null)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(ac).toBeFocused();
    await expect(ac).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("html")).not.toHaveClass(/menu-acik/);
    await expect(page.locator("main#icerik")).toHaveJSProperty("inert", false);
  });

  test("menüden sayfaya geçince menü kapanır", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu" }).click();
    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Gallery" }).click();
    await expect(page).toHaveURL(/\/en\/gallery$/);
    await expect(menu).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/menu-acik/);
  });

  test("geniş ekranda menü düğmesi yok, yatay gezinme var", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menü" })).toBeHidden();
    await expect(page.getByRole("banner").getByRole("navigation")).toBeVisible();
  });
});
