import { expect, test } from "@playwright/test";

for (const [genislik, cap] of [
  [390, 52],
  [1440, 58],
] as const) {
  test(`${genislik}px: FAB sağ altta, ~${cap}px, footer bağlantılarını örtmez`, async ({ page }) => {
    await page.setViewportSize({ width: genislik, height: 844 });
    await page.goto("/kurumsal");
    const fab = page.locator("[data-wa-fab]");
    await expect(fab).toBeVisible();
    const kutu = await fab.boundingBox();
    expect(kutu).not.toBeNull();
    if (!kutu) return;
    expect(Math.round(kutu.width)).toBe(cap);
    expect(genislik - (kutu.x + kutu.width)).toBeLessThanOrEqual(24);
    expect(844 - (kutu.y + kutu.height)).toBeLessThanOrEqual(30);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    const fabKutu = await fab.boundingBox();
    const linkler = await page.getByRole("contentinfo").locator("a").all();
    for (const link of linkler) {
      const l = await link.boundingBox();
      if (!l || !fabKutu) continue;
      const kesisir =
        l.x < fabKutu.x + fabKutu.width && l.x + l.width > fabKutu.x && l.y < fabKutu.y + fabKutu.height && l.y + l.height > fabKutu.y;
      expect(kesisir, `FAB "${await link.textContent()}" bağlantısını örtüyor`).toBe(false);
    }
  });
}

test("data-fab-gizle bölümü görünürken FAB çekilir", async ({ page }) => {
  // Kısa ekran: bayilik plakası ilk ekranda görünmesin ki başlangıç durumu ölçülebilsin.
  await page.setViewportSize({ width: 390, height: 520 });
  await page.goto("/bayilerimiz");
  const fab = page.locator("[data-wa-fab]");
  await expect(fab).toHaveAttribute("data-gizli", "false");
  await page.locator("[data-fab-gizle]").first().scrollIntoViewIfNeeded();
  await expect(fab).toHaveAttribute("data-gizli", "true");
  await expect(fab).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(fab).toHaveAttribute("data-gizli", "false");
});

test("Bayilik Başvurusu düğmesi bayimiz-olun bölümüne gider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Bayilik Başvurusu" }).click();
  await expect(page).toHaveURL(/\/bayilerimiz#bayimiz-olun$/);
  await expect(page.locator("#bayimiz-olun")).toBeInViewport();
});
