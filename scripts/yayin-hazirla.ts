// Build sonrası: ortama göre robots.txt yazar, .htaccess şablonuna ortam başlığı ve CSP (satır içi betik hash'leri) işler.
// Ortam SITE_ORTAM ile gelir: "staging" ya da "production" (varsayılan).
// Kullanım: node scripts/yayin-hazirla.ts [kök]
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cspUret, htaccessIsle, ortamOku, robotsUret, tumBetikHashleri } from "./yayin-lib.ts";

const kok = resolve(process.argv[2] ?? "build/client");
const ortam = ortamOku(process.env.SITE_ORTAM);

await writeFile(resolve(kok, "robots.txt"), robotsUret(ortam));

// /en/locations/<bilinmeyen> için 404 kabuğu: TR kabuğu (__spa-fallback.html) Türkçe başlık/altlıkla gelir, İngilizce adreste hidrasyon
// uyuşmazlığı verir; prerender EN 404 sayfası ise <head> bağlantı sırası bayi-detay rotasından ayrıştığı için uyuşmaz. Bu yüzden
// bayi-detay çıktısı iskelet alınır (head sırası istemcinin eşlediği rotayla birebir), yalnız SEO etiketleri ve <main> EN 404'ten gelir.
const enDizin = resolve(kok, "en/locations");
const ornekBayi = (await readdir(enDizin, { withFileTypes: true })).find((o) => o.isDirectory());
if (!ornekBayi) throw new Error("en/locations altında bayi detay çıktısı yok");
const enBulunamadi = await readFile(resolve(kok, "en/404/index.html"), "utf8");
const enDetay = await readFile(resolve(enDizin, ornekBayi.name, "index.html"), "utf8");
const seoAraligi = /<title>[\s\S]*?<meta property="og:image:height"[^>]*\/>/;
const anaAraligi = /<main[\s\S]*<\/main>/;
const noindex = '<meta name="robots" content="noindex"/>';
const bulunanSeo = enBulunamadi.match(seoAraligi)?.[0];
const bulunanMain = enBulunamadi.match(anaAraligi)?.[0];
if (!bulunanSeo || !bulunanMain || !seoAraligi.test(enDetay) || !anaAraligi.test(enDetay) || !bulunanSeo.includes(noindex) && !enBulunamadi.includes(noindex)) {
  throw new Error("EN 404 kabuğu üretilemedi: beklenen head/main aralıkları bulunamadı");
}
const kabuk = enDetay
  .replace(seoAraligi, () => (bulunanSeo.includes(noindex) ? bulunanSeo : bulunanSeo + noindex))
  .replace(anaAraligi, () => bulunanMain);
await writeFile(resolve(enDizin, "__bilinmeyen.html"), kabuk);

const hashler = await tumBetikHashleri(kok);
const sablon = await readFile(resolve(kok, ".htaccess"), "utf8");
await writeFile(resolve(kok, ".htaccess"), htaccessIsle(sablon, ortam, cspUret(hashler)));

console.log(`yayın hazırlığı: ortam=${ortam}, robots.txt yazıldı, .htaccess CSP ${hashler.length} betik hash'iyle işlendi`);
