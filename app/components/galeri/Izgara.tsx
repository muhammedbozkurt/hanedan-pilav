import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Gorsel } from "~/components/Gorsel.tsx";
import { GALERI, KATEGORILER, type Kategori } from "~/content/galeri.ts";
import { galeriMetin } from "~/i18n/galeri.ts";
import { useLang } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { Lightbox } from "./Lightbox.tsx";
import s from "./Izgara.module.css";

function kategoriMi(v: string | null): v is Kategori {
  return KATEGORILER.some((k) => k === v);
}

export function Izgara() {
  const dil = useLang();
  const m = galeriMetin(dil);
  const [params, setParams] = useSearchParams();
  // Önbiçimlenmiş HTML süzgeçsizdir; URL'deki süzgeç yalnız bağlandıktan sonra uygulanır (hidrasyon uyuşmazlığı olmasın).
  const [hazir, setHazir] = useState(false);
  useEffect(() => setHazir(true), []);
  const ham = params.get(m.filtre.param);
  const secili: Kategori | null = hazir && kategoriMi(ham) ? ham : null;

  const kategoriler = useMemo(() => KATEGORILER.filter((k) => GALERI.some((o) => o.kategori === k)), []);
  const filtreGorunur = kategoriler.length > 1;
  const gorunen = secili ? GALERI.filter((o) => o.kategori === secili) : GALERI;

  const kutuOgeleri = useMemo(
    () =>
      gorunen.flatMap((o) => {
        if (!o.src) return [];
        const [g, y] = o.oran.split(":").map(Number);
        return [{ id: o.id, src: o.src, alt: o.alt[dil], oran: [g ?? 1, y ?? 1] as [number, number] }];
      }),
    [gorunen, dil],
  );
  const [acik, setAcik] = useState<number | null>(null);
  const tetikleyici = useRef<HTMLElement | null>(null);

  function sec(k: Kategori | null) {
    const yeni = new URLSearchParams(params);
    if (k) yeni.set(m.filtre.param, k);
    else yeni.delete(m.filtre.param);
    setParams(yeni, { replace: true, preventScrollReset: true });
  }

  function kapat() {
    setAcik(null);
    tetikleyici.current?.focus();
  }

  return (
    <>
      {filtreGorunur ? (
        <div className={s.filtre} role="group" aria-label={m.filtre.grup}>
          <button type="button" className={s.cip} aria-pressed={secili === null} onClick={() => sec(null)}>
            {m.filtre.tumu}
          </button>
          {kategoriler.map((k) => (
            <button key={k} type="button" className={s.cip} aria-pressed={secili === k} onClick={() => sec(k)}>
              {m.filtre.kategori[k]}
            </button>
          ))}
        </div>
      ) : null}
      <p className={s.durum} role="status">
        {m.adet(gorunen.length)}
      </p>
      {gorunen.length === 0 ? (
        <div className={s.bos}>
          <h2>{m.bos.baslik}</h2>
          <p>{m.bos.metin}</p>
          <button type="button" className={s.cip} onClick={() => sec(null)}>
            {m.bos.sifirla}
          </button>
        </div>
      ) : (
        <ul className={s.izgara} data-galeri-izgara>
          {gorunen.map((o) => {
            const gorsel = <Gorsel oran={o.oran} konu={o[dil].konu} cekim={o.tr} src={o.src} alt={o.alt?.[dil]} sizes="(min-width: 900px) 33vw, (min-width: 540px) 50vw, 100vw" />;
            const i = kutuOgeleri.findIndex((k) => k.id === o.id);
            return (
              <li key={o.id} className={s.oge} data-yer-tutucu={o.src ? undefined : ""}>
                {o.src ? (
                  <button
                    type="button"
                    className={cx(s.tetik)}
                    aria-label={m.kutu.ac(o[dil].konu)}
                    aria-haspopup="dialog"
                    onClick={(e) => {
                      tetikleyici.current = e.currentTarget;
                      setAcik(i);
                    }}
                  >
                    {gorsel}
                  </button>
                ) : (
                  gorsel
                )}
              </li>
            );
          })}
        </ul>
      )}
      {kutuOgeleri.length > 0 ? (
        <Lightbox ogeler={kutuOgeleri} indeks={acik} metin={m.kutu} dil={dil} onGit={setAcik} onKapat={kapat} />
      ) : null}
    </>
  );
}
