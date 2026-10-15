// Build sonrası: ortama göre robots.txt yazar, .htaccess şablonuna ortam başlığı ve CSP (satır içi betik hash'leri) işler.
// Ortam SITE_ORTAM ile gelir: "staging" ya da "production" (varsayılan).
// Kullanım: node scripts/yayin-hazirla.ts [kök]
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cspUret, htaccessIsle, ortamOku, robotsUret, tumBetikHashleri } from "./yayin-lib.ts";

const kok = resolve(process.argv[2] ?? "build/client");
const ortam = ortamOku(process.env.SITE_ORTAM);

await writeFile(resolve(kok, "robots.txt"), robotsUret(ortam));

const hashler = await tumBetikHashleri(kok);
const sablon = await readFile(resolve(kok, ".htaccess"), "utf8");
await writeFile(resolve(kok, ".htaccess"), htaccessIsle(sablon, ortam, cspUret(hashler)));

console.log(`yayın hazırlığı: ortam=${ortam}, robots.txt yazıldı, .htaccess CSP ${hashler.length} betik hash'iyle işlendi`);
