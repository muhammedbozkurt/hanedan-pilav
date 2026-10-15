import { expect, test } from "@playwright/test";
import { GALERI, KATEGORILER } from "../../app/content/galeri.ts";
import { yatayTasma } from "./yardimci.ts";

const SAYFALAR = [
  { yol: "/galeri", param: "kategori", tumu: "Tümü", uretim: "Üretim", bayiler: "Bayiler" },
  { yol: "/en/gallery", param: "category", tumu: "All", uretim: "Production", bayiler: "Locations" },
] as const;

for (const sf of SAYFALAR) {
  test.describe(sf.yol, () => {
    test("tek h1 ve ızgara öğeleri", async ({ page }) => {
      await page.goto(sf.yol);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("[data-galeri-izgara] > li")).toHaveCount(GALERI.length);
    });

    test("fotoğrafsız öğeler tıklanamaz", async ({ page }) => {
      await page.goto(sf.yol);
      const yerTutucu = GALERI.filter((o) => !o.src).length;
      await expect(page.locator("[data-galeri-izgara] > li[data-yer-tutucu]")).toHaveCount(yerTutucu);
      await expect(page.locator("[data-galeri-izgara] button")).toHaveCount(GALERI.length - yerTutucu);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    });

    test("filtre çalışır ve URL'yi günceller", async ({ page }) => {
      await page.goto(sf.yol);
      const uretim = GALERI.filter((o) => o.kategori === "uretim").length;
      const cip = page.getByRole("button", { name: sf.uretim, exact: true });
      await cip.click();
      await expect(cip).toHaveAttribute("aria-pressed", "true");
      await expect(page).toHaveURL(new RegExp(`\\?${sf.param}=uretim`));
      await expect(page.locator("[data-galeri-izgara] > li")).toHaveCount(uretim);
      await page.getByRole("button", { name: sf.tumu, exact: true }).click();
      await expect(page.locator("[data-galeri-izgara] > li")).toHaveCount(GALERI.length);
      await expect(page).not.toHaveURL(/\?/);
    });

    test("paylaşılan URL süzgeci uygular; bilinmeyen kategori tümünü gösterir", async ({ page }) => {
      await page.goto(`${sf.yol}?${sf.param}=uretim`);
      await expect(page.getByRole("button", { name: sf.uretim, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("[data-galeri-izgara] > li")).toHaveCount(GALERI.filter((o) => o.kategori === "uretim").length);

      await page.goto(`${sf.yol}?${sf.param}=bayiler`);
      const bayiler = GALERI.filter((o) => o.kategori === "bayiler").length;
      if (bayiler > 0) {
        await expect(page.getByRole("button", { name: sf.bayiler, exact: true })).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator("[data-galeri-izgara] > li")).toHaveCount(bayiler);
      }

      await page.goto(`${sf.yol}?${sf.param}=olmayan`);
      await expect(page.getByRole("button", { name: sf.tumu, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("[data-galeri-izgara] > li")).toHaveCount(GALERI.length);
    });

    // İçeriksiz kategori çipi gösterilmez; adresle gelinirse ızgara yerine sakin bir boş durum çizilir.
    test("içeriksiz kategori: çip yok, adresle gelinirse boş durum", async ({ page }) => {
      const bos = KATEGORILER.filter((k) => !GALERI.some((o) => o.kategori === k));
      await page.goto(sf.yol);
      const cipler = page.locator('main [role="group"] button');
      await expect(cipler).toHaveCount(KATEGORILER.length - bos.length + 1);
      const ilkBos = bos[0];
      if (!ilkBos) return;
      await page.goto(`${sf.yol}?${sf.param}=${ilkBos}`);
      await expect(page.locator("[data-galeri-izgara]")).toHaveCount(0);
      await expect(page.locator("main h2")).toHaveCount(1);
    });

    for (const genislik of [360, 1440]) {
      test(`${genislik}px yatay taşma yok`, async ({ page }) => {
        await page.setViewportSize({ width: genislik, height: 900 });
        await page.goto(sf.yol);
        await page.waitForLoadState("networkidle");
        expect(await yatayTasma(page)).toBeLessThanOrEqual(0);
      });
    }
  });
}
