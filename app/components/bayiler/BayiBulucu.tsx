import { GpsFixIcon } from "@phosphor-icons/react/GpsFix";
import { MapTrifoldIcon } from "@phosphor-icons/react/MapTrifold";
import { StorefrontIcon } from "@phosphor-icons/react/Storefront";
import { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { IstanbulHarita } from "~/components/harita/IstanbulHarita.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { type Bayi, BAYILER } from "~/content/bayiler.ts";
import { ILCELER, type Yaka } from "~/content/ilceler.ts";
import { useBayilerimiz } from "~/i18n/bayilerimiz.ts";
import { HARITA_METNI } from "~/i18n/harita.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { BAYILIK_CAPASI, type Dil } from "~/lib/rotalar.ts";
import { type Konum, eslesir, haritaPinleri, haversineKm, ilceSlugu } from "./bayi.ts";
import { BayiSatiri } from "./BayiSatiri.tsx";
import s from "./BayiBulucu.module.css";

const YAKALAR: readonly Yaka[] = ["avrupa", "anadolu"];
const ILCE_SLUGLARI = new Set(ILCELER.map((i) => i.slug));
// Konum düğmesi yalnız verilerde koordinatı olan bir bayi varsa anlamlıdır.
const KONUMLU_BAYI_VAR = BAYILER.some((b) => b.konum !== undefined);
const SUBE_VAR = BAYILER.some((b) => b.tur === "sube");
const ILCE_PARAMETRESI: Readonly<Record<Dil, string>> = { tr: "ilce", en: "district" };

type KonumDurumu = "bos" | "bekliyor" | "hata" | "tamam";

function urldenIlce(p: URLSearchParams): string | null {
  const deger = p.get("ilce") ?? p.get("district");
  return deger && ILCE_SLUGLARI.has(deger) ? deger : null;
}

export function BayiBulucu() {
  const m = useBayilerimiz();
  const t = useT();
  const { dil } = usePaths();
  const harita = HARITA_METNI[dil];
  const { search } = useLocation();
  const [arama, setArama] = useSearchParams();
  const kimlik = useId();
  const [ilce, setIlce] = useState<string | null>(null);
  const [sorgu, setSorgu] = useState("");
  const [haritaAcik, setHaritaAcik] = useState(false);
  const [konum, setKonum] = useState<Konum | null>(null);
  const [konumDurumu, setKonumDurumu] = useState<KonumDurumu>("bos");

  // İlçe seçimi adreste tutulur (paylaşılabilir). Prerender HTML'i filtresiz olduğundan adres hidrasyondan sonra okunur.
  const aramaMetni = arama.toString();
  useEffect(() => {
    setIlce(urldenIlce(new URLSearchParams(aramaMetni)));
  }, [aramaMetni]);

  const ilceSec = (slug: string | null) => {
    setIlce(slug);
    setArama(
      (onceki) => {
        const p = new URLSearchParams(onceki);
        p.delete("ilce");
        p.delete("district");
        if (slug) p.set(ILCE_PARAMETRESI[dil], slug);
        return p;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const temizle = () => {
    setSorgu("");
    ilceSec(null);
  };

  const konumumuKullan = () => {
    if (konumDurumu === "bekliyor") return;
    if (!("geolocation" in navigator)) {
      setKonumDurumu("hata");
      return;
    }
    setKonumDurumu("bekliyor");
    // Konum yalnız bu bileşenin belleğinde tutulur; hiçbir yere gönderilmez, saklanmaz.
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setKonum({ lat: p.coords.latitude, lng: p.coords.longitude });
        setKonumDurumu("tamam");
      },
      () => setKonumDurumu("hata"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const pinler = useMemo(
    () => haritaPinleri(BAYILER, { merkez: harita.merkezEtiket, sube: m.bulucu.harita.sube }),
    [harita.merkezEtiket, m.bulucu.harita.sube],
  );
  const vurgulu = useMemo(() => pinler.map((p) => p.ilce), [pinler]);

  const ilceBayileri = ilce ? BAYILER.filter((b) => ilceSlugu(b) === ilce) : BAYILER;
  const sayi = new Intl.NumberFormat(dil, { maximumFractionDigits: 1 });
  const mesafe = (b: Bayi): number | null => (konum && b.konum ? haversineKm(konum, b.konum) : null);
  const sonuc = ilceBayileri
    .filter((b) => eslesir(b, sorgu))
    .map((b) => ({ bayi: b, km: mesafe(b) }))
    .sort((a, b) => (a.km ?? Number.POSITIVE_INFINITY) - (b.km ?? Number.POSITIVE_INFINITY));
  const seciliIlce = ilce ? ILCELER.find((i) => i.slug === ilce) : undefined;
  const ilceBos = seciliIlce !== undefined && ilceBayileri.length === 0;
  const filtreVar = ilce !== null || sorgu.trim() !== "";

  const ilceId = `${kimlik}-ilce`;
  const araId = `${kimlik}-ara`;
  const konumNotId = `${kimlik}-konum-not`;

  return (
    <Bolum baslikId="bulucu-baslik" className={s.bolum}>
      <h2 id="bulucu-baslik" className="sr">
        {m.bulucu.baslik}
      </h2>
      <div className={s.duzen}>
        <div className={s.kontroller} role="search" aria-labelledby="bulucu-baslik">
          <div className={s.alanlar}>
            <div className={s.alan}>
              <label className={s.etiket} htmlFor={ilceId}>
                {m.bulucu.ilce}
              </label>
              <select
                id={ilceId}
                name="ilce"
                className={s.secim}
                value={ilce ?? ""}
                onChange={(e) => ilceSec(e.target.value || null)}
              >
                <option value="">{m.bulucu.tumIlceler}</option>
                {YAKALAR.map((yaka) => (
                  <optgroup key={yaka} label={m.bulucu.yaka[yaka]}>
                    {ILCELER.filter((i) => i.yaka === yaka).map((i) => (
                      <option key={i.slug} value={i.slug}>
                        {i.ad}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className={s.alan}>
              <label className={s.etiket} htmlFor={araId}>
                {m.bulucu.ara}
              </label>
              <input
                id={araId}
                name="ara"
                type="search"
                className={s.girdi}
                value={sorgu}
                onChange={(e) => setSorgu(e.target.value)}
                placeholder={m.bulucu.araIpucu}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
              />
            </div>
          </div>
          {KONUMLU_BAYI_VAR ? (
            <div className={s.konum}>
              <button
                type="button"
                className={s.ikincilDugme}
                onClick={konumumuKullan}
                aria-describedby={konumNotId}
                aria-disabled={konumDurumu === "bekliyor"}
              >
                <Ikon ikon={GpsFixIcon} />
                <span>{konumDurumu === "bekliyor" ? m.bulucu.konum.bekliyor : m.bulucu.konum.dugme}</span>
              </button>
              <p id={konumNotId} className={s.konumNot}>
                {konumDurumu === "hata" ? m.bulucu.konum.hata : m.bulucu.konum.not}
              </p>
            </div>
          ) : null}
          {SUBE_VAR ? <p className={s.sayac}>{m.baslik.sayac(BAYILER.length)}</p> : null}
        </div>

        <button
          type="button"
          className={s.haritaDugme}
          aria-expanded={haritaAcik}
          aria-controls="bayi-haritasi"
          onClick={() => setHaritaAcik((a) => !a)}
        >
          <Ikon ikon={MapTrifoldIcon} />
          <span>{haritaAcik ? m.bulucu.harita.gizle : m.bulucu.harita.goster}</span>
        </button>
        <div id="bayi-haritasi" className={s.harita} data-acik={haritaAcik ? "true" : "false"}>
          <IstanbulHarita
            varyant="tam"
            vurgulu={vurgulu}
            pinler={pinler}
            secili={ilce}
            onSec={(slug) => ilceSec(slug === ilce ? null : slug)}
          />
        </div>

        <div className={s.sonuclar}>
          <p className="sr" role="status">
            {konumDurumu === "tamam" ? `${m.bulucu.konum.siralandi} ` : ""}
            {m.bulucu.sonuc(sonuc.length)}
          </p>
          {sonuc.length > 0 ? (
            <ul className={s.liste} aria-label={m.bulucu.listeBaslik}>
              {sonuc.map(({ bayi, km }) => (
                <li key={bayi.slug}>
                  <BayiSatiri bayi={bayi} mesafe={km === null ? undefined : m.bulucu.mesafe(sayi.format(km))} />
                </li>
              ))}
            </ul>
          ) : (
            <div className={s.bos}>
              <Ikon ikon={StorefrontIcon} className={s.bosIkon} />
              <h3 className={s.bosBaslik}>{ilceBos ? m.bulucu.bos.ilceBaslik : m.bulucu.bos.aramaBaslik}</h3>
              <p className={s.bosMetin}>
                {ilceBos && seciliIlce ? m.bulucu.bos.ilceMetin(seciliIlce.ad) : m.bulucu.bos.aramaMetin}
              </p>
              <div className={s.bosEylem}>
                {ilceBos ? (
                  <Buton to={`${search}#${BAYILIK_CAPASI[dil]}`} varyant="kara">
                    {t.nav.bayilik}
                  </Buton>
                ) : null}
                {filtreVar ? (
                  <button type="button" className={s.temizle} onClick={temizle}>
                    {m.bulucu.temizle}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Bolum>
  );
}
