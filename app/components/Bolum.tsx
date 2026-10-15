import type { ReactNode } from "react";
import { cx } from "~/lib/cx.ts";
import s from "./Bolum.module.css";

export function Kap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("kap", className)}>{children}</div>;
}

type BolumProps = {
  children: ReactNode;
  id?: string;
  baslikId?: string;
  // Art arda gelen bölümlerde üst boşluk tekrarlanmaz (referanstaki `padding-top:0` düzeni).
  ustBoslukYok?: boolean;
  koyu?: boolean;
  className?: string;
  fabGizle?: boolean;
};

export function Bolum({ children, id, baslikId, ustBoslukYok, koyu, className, fabGizle }: BolumProps) {
  return (
    <section
      id={id}
      aria-labelledby={baslikId}
      className={cx(s.bolum, ustBoslukYok && s.ustYok, koyu && cx(s.koyu, "koyu"), className)}
      {...(fabGizle ? { "data-fab-gizle": "" } : {})}
    >
      <Kap>{children}</Kap>
    </section>
  );
}
