import { ArrowLeftIcon } from "@phosphor-icons/react/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { XIcon } from "@phosphor-icons/react/X";
import { type PointerEvent, useEffect, useId, useRef } from "react";
import type { Dil } from "~/lib/rotalar.ts";
import type { GaleriMetin } from "~/i18n/galeri.ts";
import { Ikon } from "../Ikon.tsx";
import { kaydirmaYonu, onceki, sayac, sonraki } from "./gezinme.ts";
import s from "./Lightbox.module.css";

export type KutuOgesi = { id: string; src: string; alt: string; oran: [number, number] };

type Props = {
  ogeler: readonly KutuOgesi[];
  indeks: number | null;
  metin: GaleriMetin["kutu"];
  dil: Dil;
  onGit: (i: number) => void;
  onKapat: () => void;
};

export function Lightbox({ ogeler, indeks, metin, dil, onGit, onKapat }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const sayacId = useId();
  const baslangic = useRef<{ x: number; y: number } | null>(null);
  const acik = indeks !== null;
  const n = ogeler.length;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (acik && !d.open) d.showModal();
    if (!acik && d.open) d.close();
  }, [acik]);

  useEffect(() => {
    if (!acik) return;
    const onceki_ = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = onceki_;
    };
  }, [acik]);

  const oge = indeks !== null ? ogeler[indeks] : undefined;

  function tus(e: React.KeyboardEvent) {
    if (indeks === null) return;
    // Dil RTL değil; ok yönleri sabit.
    if (e.key === "ArrowRight") onGit(sonraki(indeks, n));
    else if (e.key === "ArrowLeft") onGit(onceki(indeks, n));
  }

  function basla(e: PointerEvent) {
    baslangic.current = { x: e.clientX, y: e.clientY };
  }
  function bitir(e: PointerEvent) {
    const b = baslangic.current;
    baslangic.current = null;
    if (!b || indeks === null) return;
    const yon = kaydirmaYonu(e.clientX - b.x, e.clientY - b.y);
    if (yon === 1) onGit(sonraki(indeks, n));
    else if (yon === -1) onGit(onceki(indeks, n));
  }

  return (
    <dialog
      ref={ref}
      className={s.kutu}
      lang={dil}
      aria-label={metin.etiket}
      aria-describedby={sayacId}
      onClose={onKapat}
      onCancel={(e) => {
        e.preventDefault();
        onKapat();
      }}
      onKeyDown={tus}
      onClick={(e) => {
        if (e.target === e.currentTarget) onKapat();
      }}
    >
      {/* Sayaç kalıcı canlı bölgedir: açılışta diyalog açıklaması olarak okunur, gezinmede değişimi duyurulur.
          Modal açıkken dışarısı erişilebilirlik ağacından çıktığı için bölge diyaloğun içinde, içerikten bağımsız durur. */}
      <p id={sayacId} className={s.sayac} aria-live="polite" aria-atomic="true">
        {acik ? sayac(indeks, n) : ""}
      </p>
      {oge ? (
        <div className={s.ic}>
          <button type="button" className={s.kapat} onClick={onKapat} aria-label={metin.kapat}>
            <Ikon ikon={XIcon} />
          </button>
          <div className={s.sahne} onPointerDown={basla} onPointerUp={bitir} onPointerCancel={() => (baslangic.current = null)}>
            <img key={oge.id} className={s.foto} src={oge.src} alt={oge.alt} draggable={false} />
          </div>
          {n > 1 ? (
            <>
              <button
                type="button"
                className={`${s.ok} ${s.solOk}`}
                onClick={() => onGit(onceki(indeks ?? 0, n))}
                aria-label={metin.onceki}
              >
                <Ikon ikon={ArrowLeftIcon} />
              </button>
              <button
                type="button"
                className={`${s.ok} ${s.sagOk}`}
                onClick={() => onGit(sonraki(indeks ?? 0, n))}
                aria-label={metin.sonraki}
              >
                <Ikon ikon={ArrowRightIcon} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
