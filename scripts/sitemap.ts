// Build sonrası: build/client/sitemap.xml üretir (tüm prerender yolları, 404 hariç).
// Kullanım: node scripts/sitemap.ts [kök]
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sitemapKayitlari, sitemapUret, sonDegisiklikTarihi } from "./yayin-lib.ts";

const kok = resolve(process.argv[2] ?? "build/client");
const kayitlar = sitemapKayitlari();
await writeFile(resolve(kok, "sitemap.xml"), sitemapUret(kayitlar, sonDegisiklikTarihi()));
console.log(`sitemap.xml: ${kayitlar.length} adres`);
