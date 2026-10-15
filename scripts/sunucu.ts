// Küçük statik sunucu: build/client çıktısını, LiteSpeed/Apache'de planlanan davranışla servis eder.
// "/yol" dizinse yönlendirme yapmadan "/yol/index.html" döner; dosya yoksa dile göre 404 sayfası 404 koduyla döner.
// Bayi detay alt ağaçlarında (/bayilerimiz/x, /en/locations/x) 404 içeriği yerine içeriksiz kabuk döner (public/**/.htaccess ile aynı).
// Kullanım: node scripts/sunucu.ts <kök> <port>
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const kok = resolve(process.argv[2] ?? "build/client");
const port = Number(process.argv[3] ?? 8781);
const host = "127.0.0.1";

const TURLER: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

async function dosyaMi(yol: string): Promise<boolean> {
  try {
    return (await stat(yol)).isFile();
  } catch {
    return false;
  }
}

async function coz(pathname: string): Promise<string | null> {
  const goreli = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const tam = resolve(join(kok, goreli));
  if (tam !== kok && !tam.startsWith(kok + sep)) return null;
  if (await dosyaMi(tam)) return tam;
  const dizinIndeksi = join(tam, "index.html");
  if (await dosyaMi(dizinIndeksi)) return dizinIndeksi;
  return null;
}

const sunucu = createServer(async (istek, yanit) => {
  try {
    const url = new URL(istek.url ?? "/", `http://${host}`);
    let dosya = await coz(url.pathname);
    let durum = 200;
    if (!dosya) {
      durum = 404;
      const en = url.pathname === "/en" || url.pathname.startsWith("/en/");
      const bayiKabugu = /^\/bayilerimiz\/[^/]+\/?$/.test(url.pathname)
        ? "/__spa-fallback.html"
        : /^\/en\/locations\/[^/]+\/?$/.test(url.pathname)
          ? "/en/locations/__bilinmeyen.html"
          : null;
      dosya = await coz(bayiKabugu ?? (en ? "/en/404/index.html" : "/404/index.html"));
    }
    if (!dosya) {
      yanit.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404");
      return;
    }
    yanit.writeHead(durum, {
      "content-type": TURLER[extname(dosya).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    if (istek.method === "HEAD") {
      yanit.end();
      return;
    }
    createReadStream(dosya).pipe(yanit);
  } catch (hata) {
    yanit.writeHead(500, { "content-type": "text/plain; charset=utf-8" }).end(String(hata));
  }
});

sunucu.listen(port, host, () => {
  console.log(`Statik sunucu: http://${host}:${port} (kök: ${kok})`);
});

for (const sinyal of ["SIGINT", "SIGTERM"] as const) {
  process.on(sinyal, () => sunucu.close(() => process.exit(0)));
}
