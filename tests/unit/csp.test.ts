import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { cspUret, htaccessIsle, ortamOku, satirIciBetikHashleri } from "../../scripts/yayin-lib.ts";

const hash = (s: string) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

test("satır içi betik hash'i tam içerik üzerinden hesaplanır", () => {
  const html = `<script>window.a = "ğ";</script><script type="module" async="">import "/x.js";</script>`;
  assert.deepEqual(satirIciBetikHashleri(html), [hash('window.a = "ğ";'), hash('import "/x.js";')]);
});

test("src'li, boş ve JSON-LD betikleri hash'lenmez", () => {
  const html = `<script src="/a.js"></script><script></script><script type="application/ld+json">{"a":1}</script><script type="text/javascript">x()</script>`;
  assert.deepEqual(satirIciBetikHashleri(html), [hash("x()")]);
});

test("CSP: unsafe-inline betikte yok, zorunlu yönergeler var", () => {
  const csp = cspUret([hash("a"), hash("b")]);
  const betik = csp.split("; ").find((p) => p.startsWith("script-src ")) ?? "";
  assert.ok(betik.includes(hash("a")) && betik.includes(hash("b")));
  assert.ok(!betik.includes("unsafe-inline"));
  for (const parca of [
    "default-src 'self'", "img-src 'self' data:", "font-src 'self'", "connect-src 'self'", "form-action 'self'",
    "base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'", "upgrade-insecure-requests",
  ]) {
    assert.ok(csp.split("; ").includes(parca), parca);
  }
});

test("htaccessIsle ortam başlığını ve CSP'yi bloklara yazar, tekrar çalıştırılabilir", () => {
  const sablon = "  # BEGIN ORTAM\n  # END ORTAM\n  # BEGIN CSP\n  # END CSP\n";
  const staging = htaccessIsle(sablon, "staging", "default-src 'self'");
  assert.match(staging, /Header always set X-Robots-Tag "noindex, nofollow"/);
  assert.match(staging, /Content-Security-Policy "default-src 'self'"/);
  const canli = htaccessIsle(staging, "production", "default-src 'none'");
  assert.doesNotMatch(canli, /X-Robots-Tag/);
  assert.match(canli, /Content-Security-Policy "default-src 'none'"/);
  assert.equal((canli.match(/Content-Security-Policy/g) ?? []).length, 1);
  assert.throws(() => htaccessIsle("yok", "staging", "x"));
});

test("ortamOku varsayılanı production, geçersiz değerde hata verir", () => {
  assert.equal(ortamOku(undefined), "production");
  assert.equal(ortamOku(" staging "), "staging");
  assert.throws(() => ortamOku("test"));
});
