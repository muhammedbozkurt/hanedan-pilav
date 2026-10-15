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

for (const [yol, genislik] of [
  ["/iletisim", 360],
  ["/iletisim", 390],
  ["/en/contact", 360],
  ["/en/contact", 390],
] as const) {
  test(`${yol} ${genislik}px: FAB form alanlarını ve etiketlerini hiçbir kaydırma konumunda örtmez (8 px adım)`, async ({ page }) => {
    await page.setViewportSize({ width: genislik, height: 780 });
    await page.goto(yol);
    const fab = page.locator("[data-wa-fab]");
    await expect(fab).toHaveAttribute("data-gizli", "false");
    const sonuc = await page.evaluate(async () => {
      const fabEl = document.querySelector("[data-wa-fab]") as HTMLElement;
      const form = document.querySelector("form") as HTMLElement;
      const kare = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const hedefler = Array.from(form.querySelectorAll("label, input:not([type=hidden]), textarea, select, button[type=submit]")) as HTMLElement[];
      const ihlaller: string[] = [];
      let gizliKare = 0;
      const son = document.documentElement.scrollHeight - window.innerHeight;
      for (let y = 0; y <= son + 8; y += 8) {
        window.scrollTo(0, Math.min(y, son));
        await kare();
        const gizli = fabEl.getAttribute("data-gizli") === "true";
        if (gizli) gizliKare++;
        else {
          const f = fabEl.getBoundingClientRect();
          for (const h of hedefler) {
            const b = h.getBoundingClientRect();
            if (b.width === 0 || b.height === 0) continue;
            if (f.left < b.right && f.right > b.left && f.top < b.bottom && f.bottom > b.top) {
              ihlaller.push(`y=${Math.round(window.scrollY)} ${h.tagName.toLowerCase()}#${h.id || h.getAttribute("name") || h.textContent?.trim().slice(0, 20)}`);
              break;
            }
          }
        }
      }
      return { ihlaller, gizliKare };
    });
    expect(sonuc.ihlaller, "FAB görünürken örtülen alanlar").toEqual([]);
    expect(sonuc.gizliKare).toBeGreaterThan(5);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(fab).toHaveAttribute("data-gizli", "false");
  });
}

test("Bayilik Başvurusu düğmesi bayimiz-olun bölümüne gider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Bayilik Başvurusu" }).click();
  await expect(page).toHaveURL(/\/bayilerimiz#bayimiz-olun$/);
  await expect(page.locator("#bayimiz-olun")).toBeInViewport();
});

for (const [g, y] of [
  [768, 1024],
  [800, 1280],
  [820, 1180],
  [834, 1194],
  [1024, 1366],
] as const) {
  for (const yol of ["/bayilerimiz", "/en/locations"]) {
    test(`${yol} ${g}x${y}: sayfa açılışında FAB görünür`, async ({ page }) => {
      await page.setViewportSize({ width: g, height: y });
      await page.goto(yol);
      const fab = page.locator("[data-wa-fab]");
      await expect(fab).toHaveAttribute("data-gizli", "false");
      await expect(fab).toBeVisible();
    });
  }
}

test("anasayfa bayilik plakası görünürken FAB çekilir, üstte görünür", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 520 });
  await page.goto("/");
  const fab = page.locator("[data-wa-fab]");
  await expect(fab).toHaveAttribute("data-gizli", "false");
  await page.locator("[data-fab-gizle]").first().scrollIntoViewIfNeeded();
  await expect(fab).toHaveAttribute("data-gizli", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(fab).toHaveAttribute("data-gizli", "false");
});
