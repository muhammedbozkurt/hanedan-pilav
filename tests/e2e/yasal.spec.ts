import { expect, test } from "@playwright/test";
import {
  CEREZLER,
  OTURUM_DEPOLAMASI,
  SON_GUNCELLEME,
  YASAL_EKSIKLER,
  YEREL_DEPOLAMA,
} from "../../app/components/yasal/bilgiler.ts";
import { yol } from "../../app/lib/rotalar.ts";
import { TUM_YOLLAR, dilBul, yatayTasma } from "./yardimci.ts";

const KVKK_YOLLARI = [yol("kvkk", "tr"), yol("kvkk", "en")];
const YASAL_YOLLAR = [...KVKK_YOLLARI, yol("cerez", "tr"), yol("cerez", "en")];
const BULUNAMADI_YOLLARI = [yol("bulunamadi", "tr"), yol("bulunamadi", "en")];

test.describe("yasal sayfalar", () => {
  for (const y of YASAL_YOLLAR) {
    test(`${y}: tek h1, indekslenir, son güncelleme tarihi, içindekiler her bölüme gider`, async ({ page }) => {
      await page.goto(y);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator(`main time[datetime="${SON_GUNCELLEME}"]`)).toHaveCount(1);

      const baglantilar = page.locator('main nav[aria-labelledby="icindekiler-baslik"]').getByRole("link");
      const basliklar = page.locator("main section > h2[id]");
      const n = await baglantilar.count();
      expect(n).toBeGreaterThanOrEqual(5);
      await expect(basliklar).toHaveCount(n);
      const hedefler: string[] = [];
      for (let i = 0; i < n; i++) {
        const id = (await baglantilar.nth(i).getAttribute("href"))?.split("#")[1] ?? "";
        expect(id, `içindekiler ${i + 1}. bağlantının çapası`).not.toBe("");
        expect(await basliklar.nth(i).getAttribute("id")).toBe(id);
        hedefler.push(id);
      }

      // Son ve ikinci bağlantı: adres çapayı alır, hedef görünür, odak hedefte ve sabit başlığın altında kalmaz.
      for (const i of [n - 1, 1]) {
        const id = hedefler[i] ?? "";
        await baglantilar.nth(i).click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        const hedef = page.locator(`[id="${id}"]`);
        await expect(hedef).toBeInViewport();
        await expect(hedef).toBeFocused();
        await expect
          .poll(async () => {
            const tente = await page.getByRole("banner").boundingBox();
            const kutu = await hedef.boundingBox();
            return (kutu?.y ?? -1) - ((tente?.y ?? 0) + (tente?.height ?? 0));
          })
          .toBeGreaterThanOrEqual(0);
      }
    });
  }

  for (const y of KVKK_YOLLARI) {
    test(`${y}: her eksik yasal alan yer tutucuyla, dolu alan yer tutucusuz görünür`, async ({ page }) => {
      await page.goto(y);
      const isaretli = await page
        .locator("main [data-yasal-eksik]")
        .evaluateAll((el) => el.map((e) => e.getAttribute("data-yasal-eksik") ?? ""));
      expect(new Set(isaretli)).toEqual(new Set(YASAL_EKSIKLER.map((e) => e.alan)));
      await expect(page.locator('main [role="note"]')).toHaveCount(YASAL_EKSIKLER.length > 0 ? 1 : 0);
      await expect(page.locator("main")).not.toContainText("undefined");
    });
  }
});

test.describe("404 sayfaları", () => {
  for (const y of BULUNAMADI_YOLLARI) {
    test(`${y}: noindex (statik HTML'de de), tek h1, dile göre anasayfa/bayilerimiz/iletişim bağlantıları`, async ({
      page,
      request,
    }) => {
      const dil = dilBul(y);
      const html = await (await request.get(y)).text();
      expect(html).toMatch(/<meta[^>]*name="robots"[^>]*content="noindex"/);

      const yanit = await page.goto(y);
      expect(yanit?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", dil);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator("h1")).toHaveCount(1);
      const devam = page.locator('main nav[aria-labelledby="devam-baslik"]');
      for (const hedef of ["anasayfa", "bayilerimiz", "iletisim"] as const) {
        await expect(devam.locator(`a[href="${yol(hedef, dil)}"]`)).toHaveCount(1);
      }
    });
  }

  // Bilinmeyen adreste sunucu prerender edilmiş /404 HTML'ini döner; istemci ise kök hata sınırını çizer.
  // HataIcerik.tsx'teki BulunamadiIcerik bu sayfanın gövdesini (SayfaBulunamadi) kullanana dek iki çıktı ayrışır.
  test.fixme("bilinmeyen adreste 404 gövdesi hidrasyonda korunur, React hatası yok", async ({ page }) => {
    const hatalar: string[] = [];
    page.on("pageerror", (e) => hatalar.push(e.message));
    for (const y of ["/olmayan-sayfa", "/en/missing-page"]) {
      await page.goto(y);
      await page.waitForLoadState("networkidle");
      await expect(page.locator('main nav[aria-labelledby="devam-baslik"]')).toHaveCount(1);
    }
    expect(hatalar).toEqual([]);
  });
});

test.describe("yatay taşma", () => {
  for (const genislik of [360, 1440]) {
    test.describe(`${genislik}px`, () => {
      test.use({ viewport: { width: genislik, height: 900 } });
      for (const y of [...YASAL_YOLLAR, ...BULUNAMADI_YOLLARI]) {
        test(`${y}: yatay taşma yok`, async ({ page }) => {
          await page.goto(y);
          await page.evaluate(() => document.fonts.ready);
          expect(await yatayTasma(page)).toBeLessThanOrEqual(0);
        });
      }
    });
  }
});

// Çerez politikasının iddiaları gerçek tarayıcıda denetlenir: listede olmayan çerez, depolama anahtarı veya dış istek varsa kalır.
test("çerez politikası envanteri gerçek davranışla aynı", async ({ page, context, baseURL }) => {
  const kok = new URL(baseURL ?? "http://127.0.0.1").origin;
  const disIstekler: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== kok) disIstekler.push(r.url());
  });
  for (const y of TUM_YOLLAR) {
    await page.goto(y);
    await page.waitForLoadState("networkidle");
  }
  // İstemci tarafı geçiş ve yenileme: kaydırma konumu sayfadan ayrılırken (pagehide) yazılır.
  await page.goto(yol("anasayfa", "tr"));
  await page.locator(`footer a[href="${yol("kvkk", "tr")}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${yol("kvkk", "tr")}$`));
  await page.reload();
  await page.waitForLoadState("networkidle");

  const cerezler = (await context.cookies()).map((c) => c.name);
  const depo = await page.evaluate(() => ({ oturum: Object.keys(sessionStorage), yerel: Object.keys(localStorage) }));
  expect(cerezler.filter((ad) => !CEREZLER.includes(ad))).toEqual([]);
  expect(depo.yerel.filter((ad) => !YEREL_DEPOLAMA.includes(ad))).toEqual([]);
  expect(depo.oturum.filter((ad) => !(OTURUM_DEPOLAMASI as readonly string[]).includes(ad))).toEqual([]);
  // Politika bu kaydı anlatıyor; kütüphane anahtarı değiştirirse metin de güncellenmeli.
  expect(depo.oturum).toEqual(expect.arrayContaining([...OTURUM_DEPOLAMASI]));
  expect(disIstekler).toEqual([]);
});
