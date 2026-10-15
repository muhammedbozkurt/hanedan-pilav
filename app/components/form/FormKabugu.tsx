import { CheckCircleIcon } from "@phosphor-icons/react/CheckCircle";
import { WarningCircleIcon } from "@phosphor-icons/react/WarningCircle";
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Ikon } from "~/components/Ikon.tsx";
import { cx } from "~/lib/cx.ts";
import { type FormMetni, hataMetni, useFormT } from "~/i18n/form.ts";
import { useLang } from "~/i18n/index.ts";
import { Tuzak } from "./alanlar.tsx";
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

type HataTuru = "dogrulama" | "sunucu" | "hiz" | "ag" | "origin";

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
  const acilis = useRef(0);
  const [hazir, setHazir] = useState(false);
  const [hatalar, setHatalar] = useState<Hatalar>({});
  const [durum, setDurum] = useState<Durum>({ tur: "bos" });
  const [odak, setOdak] = useState(0);
  const [arama] = useSearchParams();

  useEffect(() => {
    acilis.current = Date.now();
    setHazir(true);
  }, []);

  // JS'siz gönderimden dönen ?gonderildi=1 / ?hata=... durumu, sayfa JS ile açıldığında da gösterilir.
  const sorgu = arama.toString();
  useEffect(() => {
    const p = new URLSearchParams(sorgu);
    if (p.get("gonderildi") === "1") setDurum({ tur: "basari" });
    const h = p.get("hata");
    if (h === "dogrulama" || h === "sunucu" || h === "hiz" || h === "origin") setDurum({ tur: "hata", metin: m.durum[h] });
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
    veri.set("gecen_ms", String(Date.now() - acilis.current));
    try {
      const yanit = await fetch(FORM_ADRESI, { method: "POST", body: veri, headers: { Accept: "application/json" } });
      const govde: unknown = await yanit.json().catch(() => null);
      if (yanit.ok) {
        form.reset();
        acilis.current = Date.now();
        setDurum({ tur: "basari" });
      } else if (yanit.status === 422) {
        const sunucuHata = hataKodlari((govde as { alanlar?: unknown } | null)?.alanlar);
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
            <p className={s.durumBaslik}>{m.durum.basariBaslik}</p>
            <p>{m.durum.basariMetin}</p>
          </div>
        </div>
        <div id="durum-hata" className={cx(s.durum, s.hataDurum, s.statik)} role="alert">
          <Ikon ikon={WarningCircleIcon} />
          <p>{m.durum.dogrulama}</p>
        </div>
      </noscript>
      <input type="hidden" name="form" value={tur} />
      <input type="hidden" name="lang" value={dil} />
      <Tuzak />
      <p className={s.zorunluNot}>{m.zorunluNot}</p>
      <div className={s.alanlar}>{children(baglam)}</div>
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
              <p className={s.durumBaslik}>{m.durum.basariBaslik}</p>
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
