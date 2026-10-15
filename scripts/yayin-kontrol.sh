#!/usr/bin/env bash
# Canlı/test ortamı duman testi: yönlendirmeler, başlıklar, 404/410 kodları, form ucu.
# Kullanım: scripts/yayin-kontrol.sh <taban-url> [staging|production]
#   ör. scripts/yayin-kontrol.sh https://test.hanedanpilav.com staging
#       scripts/yayin-kontrol.sh https://www.hanedanpilav.com production
# Şifre korumalı test ortamı için: KONTROL_KULLANICI=kullanici:sifre scripts/yayin-kontrol.sh ...
set -u

TABAN="${1:-}"
ORTAM="${2:-production}"
if [[ -z "$TABAN" || ! "$TABAN" =~ ^https?://[^/]+$ ]]; then
  echo "Kullanım: $0 <taban-url> [staging|production]   (taban-url sonunda eğik çizgi olmadan, ör. https://www.hanedanpilav.com)" >&2
  exit 2
fi
if [[ "$ORTAM" != "staging" && "$ORTAM" != "production" ]]; then
  echo "Ortam staging veya production olmalı." >&2
  exit 2
fi

HOST="${TABAN#*://}"
KIMLIK=()
if [[ -n "${KONTROL_KULLANICI:-}" ]]; then KIMLIK=(-u "$KONTROL_KULLANICI"); fi

GECTI=0
KALDI=0
ok() { GECTI=$((GECTI + 1)); printf '  ok    %s\n' "$1"; }
hata() { KALDI=$((KALDI + 1)); printf '  HATA  %s\n' "$1"; }

# durum <yol> [curl seçenekleri]: HTTP durum kodunu yazar (yönlendirme izlenmez)
durum() { local yol="$1"; shift; curl -s -o /dev/null -w '%{http_code}' --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "$@" "$TABAN$yol"; }
# baslik <yol> <başlık-adı> [curl seçenekleri]: başlık değerini yazar (küçük harf eşleşir)
baslik() {
  local yol="$1" ad="$2"; shift 2
  curl -s -I --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "$@" "$TABAN$yol" | tr -d '\r' | awk -v a="$(echo "$ad" | tr '[:upper:]' '[:lower:]')" 'tolower($1)==a":" { sub(/^[^:]*: */, ""); print; exit }'
}
beklenen_durum() { # yol beklenen etiket [curl seçenekleri]
  local yol="$1" bek="$2" etiket="$3"; shift 3
  local d; d="$(durum "$yol" "$@")"
  if [[ "$d" == "$bek" ]]; then ok "$etiket ($d)"; else hata "$etiket: beklenen $bek, gelen $d"; fi
}
yonlendirme() { # yol beklenenKonumParçası etiket
  local yol="$1" parca="$2" etiket="$3"
  local d k; d="$(durum "$yol")"; k="$(baslik "$yol" location)"
  if [[ "$d" == "301" && "$k" == *"$parca" ]]; then ok "$etiket (301 -> $k)"; else hata "$etiket: beklenen 301 ...$parca, gelen $d ${k:-konum yok}"; fi
}
baslik_var() { # yol başlık parça etiket
  local deger; deger="$(baslik "$1" "$2")"
  if [[ "$deger" == *"$3"* && -n "$deger" ]]; then ok "$4"; else hata "$4: '$2' içinde '$3' yok (gelen: ${deger:-yok})"; fi
}

echo "== Yönlendirmeler ($TABAN, ortam: $ORTAM)"
if [[ "$TABAN" == https://* ]]; then
  d="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "http://$HOST/kurumsal")"
  k="$(curl -s -I --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "http://$HOST/kurumsal" | tr -d '\r' | awk 'tolower($1)=="location:" {print $2; exit}')"
  if [[ "$d" == "301" && "$k" == https://* ]]; then ok "http -> https (301 -> $k)"; else hata "http -> https: gelen $d ${k:-konum yok}"; fi
fi
if [[ "$ORTAM" == "production" && "$HOST" == www.hanedanpilav.com ]]; then
  k="$(curl -s -I --max-time 20 "https://hanedanpilav.com/kurumsal" | tr -d '\r' | awk 'tolower($1)=="location:" {print $2; exit}')"
  if [[ "$k" == "https://www.hanedanpilav.com/kurumsal" ]]; then ok "apex -> www ($k)"; else hata "apex -> www: gelen ${k:-konum yok}"; fi
fi
beklenen_durum "/kurumsal" 200 "/kurumsal yönlendirmesiz 200"
beklenen_durum "/en/about" 200 "/en/about yönlendirmesiz 200"
beklenen_durum "/" 200 "anasayfa 200"
yonlendirme "/kurumsal/" "/kurumsal" "/kurumsal/ -> /kurumsal"
yonlendirme "/en/about/" "/en/about" "/en/about/ -> /en/about"
yonlendirme "/kurumsal/index.html" "/kurumsal" "/kurumsal/index.html -> /kurumsal"
yonlendirme "/about-us/" "/kurumsal" "WordPress /about-us/"
yonlendirme "/contact/" "/iletisim" "WordPress /contact/"
yonlendirme "/menu/" "/kurumsal#catering" "WordPress /menu/ (parça korunur)"
yonlendirme "/sitemap_index.xml" "/sitemap.xml" "WordPress /sitemap_index.xml"

echo "== 404 ve 410"
beklenen_durum "/yok-boyle-bir-sayfa" 404 "TR bilinmeyen yol 404"
beklenen_durum "/en/yok-boyle-bir-sayfa" 404 "EN bilinmeyen yol 404"
if curl -s --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "$TABAN/yok-boyle-bir-sayfa" | grep -q '<html lang="tr"'; then ok "TR 404 gövdesi Türkçe sayfa"; else hata "TR 404 gövdesi Türkçe 404 sayfası değil"; fi
if curl -s --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "$TABAN/en/yok-boyle-bir-sayfa" | grep -q '<html lang="en"'; then ok "EN 404 gövdesi İngilizce sayfa"; else hata "EN 404 gövdesi İngilizce 404 sayfası değil"; fi
for y in /hello-world/ /category/haber /feed/ /wp-admin/ /wp-admin/admin-ajax.php /wp-login.php /wp-content/uploads/a.jpg /xmlrpc.php; do
  beklenen_durum "$y" 410 "410 $y"
done

echo "== Başlıklar (anasayfa)"
baslik_var "/" strict-transport-security "max-age=31536000" "HSTS"
baslik_var "/" x-content-type-options "nosniff" "nosniff"
baslik_var "/" referrer-policy "strict-origin-when-cross-origin" "Referrer-Policy"
baslik_var "/" permissions-policy "geolocation=(self)" "Permissions-Policy"
baslik_var "/" content-security-policy "default-src 'self'" "CSP var"
baslik_var "/" content-security-policy "frame-ancestors 'self'" "CSP frame-ancestors"
baslik_var "/" content-security-policy "'sha256-" "CSP betik hash'leri"
csp="$(baslik "/" content-security-policy)"
betik="$(echo "$csp" | tr ';' '\n' | grep -E '^ *script-src ' || true)"
if [[ "$betik" == *"unsafe-inline"* ]]; then hata "CSP script-src 'unsafe-inline' içeriyor"; else ok "CSP script-src unsafe-inline içermiyor"; fi
baslik_var "/" cache-control "no-cache" "HTML Cache-Control no-cache"
if [[ "$ORTAM" == "staging" ]]; then
  baslik_var "/" x-robots-tag "noindex" "staging X-Robots-Tag noindex"
else
  x="$(baslik "/" x-robots-tag)"
  if [[ -z "$x" ]]; then ok "production X-Robots-Tag yok"; else hata "production X-Robots-Tag var: $x"; fi
fi

echo "== Önbellek ve statik dosyalar"
varlik="$(curl -s --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "$TABAN/" | grep -oE '/assets/[A-Za-z0-9._-]+\.(js|css)' | head -1)"
if [[ -n "$varlik" ]]; then baslik_var "$varlik" cache-control "immutable" "hash'li varlık immutable ($varlik)"; else hata "anasayfada /assets varlığı bulunamadı"; fi
baslik_var "/img/og-hanedan-pilav.png" cache-control "max-age=604800" "/img 7 gün"
beklenen_durum "/sitemap.xml" 200 "sitemap.xml"
beklenen_durum "/robots.txt" 200 "robots.txt"
robots="$(curl -s --max-time 20 ${KIMLIK[@]+"${KIMLIK[@]}"} "$TABAN/robots.txt")"
if [[ "$ORTAM" == "staging" ]]; then
  if grep -q '^Disallow: /$' <<<"$robots"; then ok "staging robots.txt Disallow: /"; else hata "staging robots.txt Disallow: / değil"; fi
else
  if grep -q '^Disallow: /$' <<<"$robots"; then hata "production robots.txt Disallow: / (staging derlemesi mi?)"; else ok "production robots.txt izinli"; fi
  if grep -q '^Sitemap: ' <<<"$robots"; then ok "production robots.txt Sitemap satırı"; else hata "production robots.txt Sitemap satırı yok"; fi
fi

echo "== Erişim kapalı olmalı"
for y in /.htaccess /.env /.git/config /assets/ornek.js.map /api/src/FormIslem.php /api/vendor/autoload.php; do
  d="$(durum "$y")"
  if [[ "$d" == "403" || "$d" == "404" || "$d" == "410" ]]; then ok "$y kapalı ($d)"; else hata "$y erişilebilir ($d)"; fi
done

echo "== Form ucu"
beklenen_durum "/api/form.php" 405 "GET /api/form.php 405"

echo
echo "Özet: $GECTI geçti, $KALDI hata"
[[ "$KALDI" -eq 0 ]]
