import { ArrowLeftIcon } from "@phosphor-icons/react/ArrowLeft";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "~/lib/cx.ts";
import { Etiket } from "./Etiket.tsx";
import { Ikon } from "./Ikon.tsx";
import s from "./SayfaBasligi.module.css";

type Props = {
  baslik: ReactNode;
  etiket?: string;
  giris?: ReactNode;
  geri?: { to: string; metin: string };
  eylemler?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// İç sayfa başlığı: tek h1, isteğe bağlı üst etiket, giriş paragrafı ve eylemler. Alt kenardaki kara çizgi içerikle ayrımı kurar.
export function SayfaBasligi({ baslik, etiket, giris, geri, eylemler, children, className }: Props) {
  return (
    <header className={cx(s.sayfaBaslik, className)}>
      <div className={cx("kap")}>
        <div className={s.ic}>
          {geri ? (
            <Link className={s.geri} to={geri.to}>
              <Ikon ikon={ArrowLeftIcon} />
              <span>{geri.metin}</span>
            </Link>
          ) : null}
          {etiket ? <Etiket className={s.etiket}>{etiket}</Etiket> : null}
          <h1 id="sayfa-baslik">{baslik}</h1>
          {giris ? <p className={s.giris}>{giris}</p> : null}
          {eylemler ? <div className={s.eylemler}>{eylemler}</div> : null}
          {children}
        </div>
      </div>
    </header>
  );
}
