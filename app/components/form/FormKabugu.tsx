import { CheckCircleIcon } from "@phosphor-icons/react/CheckCircle";
import { WarningCircleIcon } from "@phosphor-icons/react/WarningCircle";
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router";
import { Ikon } from "~/components/Ikon.tsx";
import { cx } from "~/lib/cx.ts";
import { type FormMetni, hataMetni, useFormT } from "~/i18n/form.ts";
import { useLang } from "~/i18n/index.ts";
import { BilgiNotu, Tuzak } from "./alanlar.tsx";
import { type AlanAdi, FORM_ADRESI, type FormTuru, type Hatalar, type HataKodu, dogrula } from "./dogrula.ts";
import s from "./Form.module.css";

export type AlanBaglami = {
  idOnek: string;
  m: FormMetni;
  hata: (ad: AlanAdi) => string | undefined;
};

type Durum =
  | { tur: "bos" }
  | { tur: "gonderiliyor" }
  | { tur: "basari" }
  | { tur: "hata"; metin: string };

type HataTuru = "dogrulama" | "cokHizli" | "sunucu" | "hiz" | "ag" | "origin";

// Sunucunun hata kodu ve JS'siz dönüşteki ?hata= değeri; noscript çapası bundan türer (durum-hata-cok-hizli).
const SUNUCU_HATALARI = {
  dogrulama: "dogrulama",
  cok_hizli: "cokHizli",
  hiz: "hiz",
  sunucu: "sunucu",
  origin: "origin",
} as const satisfies Record<string, HataTuru>;
type SunucuHataKodu = keyof typeof SUNUCU_HATALARI;
const SUNUCU_HATA_KODLARI = Object.keys(SUNUCU_HATALARI) as SunucuHataKodu[];

function sunucuHatasi(kod: unknown): HataTuru | null {
  return typeof kod === "string" && Object.hasOwn(SUNUCU_HATALARI, kod) ? SUNUCU_HATALARI[kod as SunucuHataKodu] : null;
}

function hataCapasi(kod: SunucuHataKodu): string {
  return `durum-hata-${kod.replace("_", "-")}`;
}

const bosAbonelik = () => () => {};

function hataKodlari(girdi: unknown): Hatalar {
  const cikti: Hatalar = {};
  if (girdi && typeof girdi === "object") {
    for (const [ad, kod] of Object.entries(girdi)) {
      if (kod === "bos" || kod === "uzun" || kod === "gecersiz") cikti[ad as AlanAdi] = kod as HataKodu;
    }
  }
  return cikti;
}

function degerler(form: HTMLFormElement): Record<string, string> {
  const veri: Record<string, string> = {};
  for (const [ad, deger] of new FormData(form)) if (typeof deger === "string") veri[ad] = deger;
  return veri;
}

type Props = {
  tur: FormTuru;
  gonderEtiket: string;
  children: (b: AlanBaglami) => ReactNode;
  className?: string | undefined;
};

// Ortak kabuk: JS yokken düz POST (PHP 303 ile geri döner), JS varken fetch + JSON. Durumlar tek canlı bölgede duyurulur.
export function FormKabugu({ tur, gonderEtiket, children, className }: Props) {
  const m = useFormT();
  const dil = useLang();
  const idOnek = useId();
  const formRef = useRef<HTMLFormElement>(null);
  // Hidrasyonda true, istemci içi geçişte false: ilk yüklemede süre sayfa gezinmesinin başından sayılır.
  const hidrasyonda = useSyncExternalStore(bosAbonelik, () => false, () => true);
  const ilkYukleme = useRef(hidrasyonda);
  const acilis = useRef(0);
  const [hazir, setHazir] = useState(false);
  const [hatalar, setHatalar] = useState<Hatalar>({});
  const [durum, setDurum] = useState<Durum>({ tur: "bos" });
  const [odak, setOdak] = useState(0);
  const [arama] = useSearchParams();

  useEffect(() => {
    // performance.now() gezinmenin başından (performance.timeOrigin) sayar; yavaş ağda hidrasyon süresi de dâhil olur.
    acilis.current = ilkYukleme.current ? 0 : performance.now();
    setHazir(true);
  }, []);

  // JS'siz gönderimden dönen ?gonderildi=1 / ?hata=... durumu, sayfa JS ile açıldığında da gösterilir.
  const sorgu = arama.toString();
  useEffect(() => {
    const p = new URLSearchParams(sorgu);
    if (p.get("gonderildi") === "1") setDurum({ tur: "basari" });
    const h = sunucuHatasi(p.get("hata"));
    if (h) setDurum({ tur: "hata", metin: m.durum[h] });
  }, [sorgu, m]);

  useEffect(() => {
    if (odak === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [odak]);

  const hataGoster = (t: HataTuru) => setDurum({ tur: "hata", metin: m.durum[t] });

  async function gonder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (durum.tur === "gonderiliyor") return;
    const form = e.currentTarget;
    const bulunan = dogrula(tur, degerler(form));
    setHatalar(bulunan);
    const adet = Object.keys(bulunan).length;
    if (adet > 0) {
      setDurum({ tur: "hata", metin: m.durum.duzeltme(adet) });
      setOdak((n) => n + 1);
      return;
    }
    setDurum({ tur: "gonderiliyor" });
    const veri = new FormData(form);
    veri.set("gecen_ms", String(Math.round(performance.now() - acilis.current)));
    try {
      const yanit = await fetch(FORM_ADRESI, { method: "POST", body: veri, headers: { Accept: "application/json" } });
      const ham: unknown = await yanit.json().catch(() => null);
      const govde = ham && typeof ham === "object" ? (ham as { ok?: unknown; hata?: unknown; alanlar?: unknown }) : null;
      // Başarı yalnız sunucu açıkça ok:true dediğinde: 200 dönen bir hata sayfası başarı sayılmaz.
      if (yanit.ok && govde?.ok === true) {
        form.reset();
        acilis.current = performance.now();
        setDurum({ tur: "basari" });
      } else if (yanit.status === 422 && sunucuHatasi(govde?.hata) === "cokHizli") {
        hataGoster("cokHizli");
      } else if (yanit.status === 422) {
        const sunucuHata = hataKodlari(govde?.alanlar);
        setHatalar(sunucuHata);
        const n = Object.keys(sunucuHata).length;
        if (n > 0) {
          setDurum({ tur: "hata", metin: m.durum.duzeltme(n) });
          setOdak((c) => c + 1);
        } else hataGoster("dogrulama");
      } else if (yanit.status === 429) hataGoster("hiz");
      else if (yanit.status === 403) hataGoster("origin");
      else hataGoster("sunucu");
    } catch {
      hataGoster("ag");
    }
  }

  const baglam: AlanBaglami = {
    idOnek,
    m,
    hata: (ad) => {
      const kod = hatalar[ad];
      return kod ? hataMetni(m, ad, kod) : undefined;
    },
  };
  const gonderiliyor = durum.tur === "gonderiliyor";

  return (
    <form
      ref={formRef}
      className={cx(s.form, className)}
      method="post"
      action={FORM_ADRESI}
      noValidate={hazir}
      onSubmit={gonder}
    >
      <noscript>
        <div id="durum-gonderildi" className={cx(s.durum, s.basari, s.statik)} role="status">
          <Ikon ikon={CheckCircleIcon} />
          <div>
            <p className={s.durumBaslik}>{m.durum.basariBaslik[tur]}</p>
            <p>{m.durum.basariMetin}</p>
          </div>
        </div>
        {SUNUCU_HATA_KODLARI.map((kod) => (
          <div key={kod} id={hataCapasi(kod)} className={cx(s.durum, s.hataDurum, s.statik)} role="alert">
            <Ikon ikon={WarningCircleIcon} />
            <p>{m.durum[SUNUCU_HATALARI[kod]]}</p>
          </div>
        ))}
      </noscript>
      <input type="hidden" name="form" value={tur} />
      <input type="hidden" name="lang" value={dil} />
      <Tuzak />
      <p className={s.zorunluNot}>{m.zorunluNot}</p>
      <div className={s.alanlar}>{children(baglam)}</div>
      <BilgiNotu />
      <div className={s.eylem}>
        <button type="submit" className={s.gonder} aria-disabled={gonderiliyor}>
          {gonderiliyor ? m.gonder.gonderiliyor : gonderEtiket}
        </button>
      </div>
      <div
        className={cx(s.durum, durum.tur === "basari" && s.basari, durum.tur === "hata" && s.hataDurum, durum.tur === "gonderiliyor" && s.bekle)}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {durum.tur === "gonderiliyor" ? <p>{m.durum.gonderiliyor}</p> : null}
        {durum.tur === "basari" ? (
          <>
            <Ikon ikon={CheckCircleIcon} />
            <div>
              <p className={s.durumBaslik}>{m.durum.basariBaslik[tur]}</p>
              <p>{m.durum.basariMetin}</p>
            </div>
          </>
        ) : null}
        {durum.tur === "hata" ? (
          <>
            <Ikon ikon={WarningCircleIcon} />
            <p>{durum.metin}</p>
          </>
        ) : null}
      </div>
    </form>
  );
}
