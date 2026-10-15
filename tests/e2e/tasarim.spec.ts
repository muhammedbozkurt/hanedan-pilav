import { type Page, expect, test } from "@playwright/test";

// Görsel tasarım kuralları için nesnel ölçümler: mini harita tabelası, sağ kenar hizası, düğme zemin kuralı, harita odak ve kontrast.

function parlaklik(rgb: readonly number[]): number {
  const [r = 0, g = 0, b = 0] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function kontrast(a: readonly number[], b: readonly number[]): number {
  const [la, lb] = [parlaklik(a), parlaklik(b)].sort((x, y) => y - x);
  return ((la ?? 0) + 0.05) / ((lb ?? 0) + 0.05);
}

const rgb = (renk: string): number[] => (renk.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
const hex = (renk: string): number[] => {
  const h = renk.trim().replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
};

type TabelaOlcusu = { satir: number; sol: number; sag: number; kapSol: number; kapSag: number };

async function tabelaOlc(page: Page): Promise<TabelaOlcusu> {
  return page.evaluate(() => {
    const kap = document.querySelector('figure[data-varyant="mini"]');
    const t = kap?.querySelector<HTMLElement>('[class*="tabela"]');
    if (!kap || !t) throw new Error("mini harita tabelası yok");
    const cs = getComputedStyle(t);
    const ic = t.getBoundingClientRect().height - Number.parseFloat(cs.paddingTop) - Number.parseFloat(cs.paddingBottom);
    const r = t.getBoundingClientRect();
    const k = kap.getBoundingClientRect();
    return { satir: Math.round(ic / Number.parseFloat(cs.lineHeight)), sol: r.left, sag: r.right, kapSol: k.left, kapSag: k.right };
  });
}

const MINI = ["/bayilerimiz/sultangazi-merkez", "/en/locations/sultangazi-merkez", "/iletisim", "/en/contact"];

for (const yol of MINI) {
  for (const genislik of [1440, 390]) {
    test(`${yol} ${genislik}px: mini harita tabelası en çok iki satır ve çerçeve içinde, atıf harita kenarında`, async ({ page }) => {
      await page.setViewportSize({ width: genislik, height: 900 });
      await page.goto(yol);
      await page.evaluate(() => document.fonts.ready);
      const o = await tabelaOlc(page);
      expect(o.satir).toBeLessThanOrEqual(2);
      expect(o.sol).toBeGreaterThanOrEqual(o.kapSol);
      expect(o.sag).toBeLessThanOrEqual(o.kapSag);

      // Uzun tek kelimelik ilçe adı da harf harf kırılmaz, çerçeveden taşmaz.
      await page.evaluate(() => {
        const t = document.querySelector('figure[data-varyant="mini"] [class*="tabela"]');
        if (t) t.textContent = "Gaziosmanpaşa";
      });
      const uzun = await tabelaOlc(page);
      expect(uzun.satir).toBeLessThanOrEqual(2);
      expect(uzun.sag).toBeLessThanOrEqual(uzun.kapSag);

      const [atif, harita] = await page.evaluate(() => {
        const kap = document.querySelector('figure[data-varyant="mini"]');
        return [kap?.querySelector("figcaption a"), kap?.querySelector("svg")].map((e) => e?.getBoundingClientRect().right ?? 0);
      });
      expect(Math.abs((atif ?? 0) - (harita ?? 0))).toBeLessThanOrEqual(1);
    });
  }
}

test("yer tutucular metin göstermez, ekran okuyucudan gizlidir, çekim notunu data-cekim ile taşır", async ({ page }) => {
  await page.goto("/galeri");
  const yerler = page.locator("[data-cekim]");
  const n = await yerler.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const y = yerler.nth(i);
    await expect(y).toHaveAttribute("aria-hidden", "true");
    await expect(y).toHaveAttribute("data-cekim", /^\d+:\d+ \| .+ \| .+$/);
    expect((await y.innerText()).trim()).toBe("");
  }
});

const DUGME_SAYFALARI = ["/", "/en", "/kurumsal", "/bayilerimiz", "/bayilerimiz?ilce=esenler", "/bayilerimiz/sultangazi-merkez", "/iletisim", "/galeri"];

test("düğme zemin kuralı: kara düğme yalnız sarı zeminde, sarı düğme sarı zeminde değil", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const sari = hex("#F4C20D").join(",");
  for (const yol of DUGME_SAYFALARI) {
    await page.goto(yol);
    await page.waitForLoadState("networkidle");
    const dugmeler = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-varyant]")]
        .filter((d) => d.offsetParent !== null || getComputedStyle(d).position === "fixed")
        .map((d) => {
          let e = d.parentElement;
          let zemin = "";
          while (e) {
            const bg = getComputedStyle(e).backgroundColor;
            if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) {
              zemin = bg;
              break;
            }
            e = e.parentElement;
          }
          return { varyant: d.dataset.varyant ?? "", zemin, metin: d.textContent?.trim() ?? "" };
        }),
    );
    expect(dugmeler.length, `${yol}: denetlenecek düğme yok`).toBeGreaterThan(0);
    for (const d of dugmeler) {
      const zeminSari = rgb(d.zemin).join(",") === sari;
      if (d.varyant === "kara") expect(zeminSari, `${yol}: "${d.metin}" kara düğme ${d.zemin} zeminde`).toBe(true);
      if (d.varyant === "sari") expect(zeminSari, `${yol}: "${d.metin}" sarı düğme sarı zeminde`).toBe(false);
    }
  }
});

test("/bayilerimiz: seçili ilçe odakta sarı kalır, odak ve seçim sınırı üste çizilir, boş ilçe sınırı en az 3:1", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/bayilerimiz");
  const ilce = page.getByRole("button", { name: "Esenler, bayi yok" });
  await ilce.focus();
  await page.keyboard.press("Enter");
  await expect(ilce).toHaveAttribute("aria-pressed", "true");
  await expect(ilce).toBeFocused();
  // Dolgu geçişi .2s sürer; son değer beklenir.
  await expect.poll(async () => rgb(await ilce.evaluate((e) => getComputedStyle(e).fill)).join(",")).toBe(hex("#F4C20D").join(","));
  // Seçim kopyası + odak kopyası, sekme sırası değişmeden svg'nin sonunda.
  await expect(page.locator('#bayi-haritasi svg > path[aria-hidden="true"]')).toHaveCount(2);

  const bos = page.getByRole("button", { name: "Arnavutköy, bayi yok" });
  const [cizgi, dolgu] = await bos.evaluate((e) => [getComputedStyle(e).stroke, getComputedStyle(e).fill]);
  const emaye = hex("#FBF7EC");
  expect(kontrast(rgb(cizgi ?? ""), emaye)).toBeGreaterThanOrEqual(3);
  expect(kontrast(rgb(cizgi ?? ""), rgb(dolgu ?? ""))).toBeGreaterThanOrEqual(3);
});

test("/iletisim 1440px: yönlendirme kartları ve form aynı sağ kenarda; bilgi listesi ikinci kalın çizgiyle açılmaz", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/iletisim");
  const formSag = await page.locator("main form").evaluate((e) => e.getBoundingClientRect().right);
  const kartSag = await page.locator('section[aria-labelledby="yonlendirme-baslik"] li').last().evaluate((e) => e.getBoundingClientRect().right);
  expect(Math.abs(formSag - kartSag)).toBeLessThanOrEqual(1);
  const ustCizgi = await page.locator('section[aria-labelledby="form-baslik"] dl').evaluate((e) => getComputedStyle(e).borderTopWidth);
  expect(ustCizgi).toBe("0px");
});

test("/kurumsal 390px: künye, çalışma ve değer çizgileri aynı sağ kenarda biter", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kurumsal");
  const saglar = await Promise.all(
    ["hikaye-baslik", "calisma-baslik", "degerler-baslik"].map((id) =>
      page.locator(`section[aria-labelledby="${id}"] :is(dl, ul)`).first().evaluate((e) => e.getBoundingClientRect().right),
    ),
  );
  const ilk = saglar[0] ?? 0;
  for (const sag of saglar) expect(Math.abs(sag - ilk)).toBeLessThanOrEqual(1);
});

test("WhatsApp yeşili beyaz glifle en az 4:1", async ({ page }) => {
  await page.goto("/");
  const wa = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--wa"));
  expect(kontrast(hex(wa), [255, 255, 255])).toBeGreaterThanOrEqual(4);
});

test("logo WebP öncelikli, PNG yedekli; TR sayfa Rokkitt latin-ext'i önceden yükler, EN yüklemez", async ({ page, request }) => {
  await page.goto("/");
  const kaynak = page.locator('header picture source[type="image/webp"]');
  await expect(kaynak).toHaveCount(1);
  const webp = await request.get((await kaynak.getAttribute("srcset")) ?? "");
  expect(webp.status()).toBe(200);
  expect(webp.headers()["content-type"]).toBe("image/webp");
  await expect(page.locator("header picture img")).toHaveAttribute("src", /\.png$/);
  await expect(page.locator('link[rel="preload"][href*="rokkitt-latin-ext"]')).toHaveCount(1);
  await page.goto("/en");
  await expect(page.locator('link[rel="preload"][href*="rokkitt-latin-ext"]')).toHaveCount(0);
});
