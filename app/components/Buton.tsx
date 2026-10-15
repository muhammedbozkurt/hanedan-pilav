import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "~/lib/cx.ts";
import s from "./Buton.module.css";
import { Ikon } from "./Ikon.tsx";

// Zemin kuralı (referans E): kraft, emaye ve koyu zeminde birincil eylem sarı, ikincil eylem emaye düğmedir.
// Kara düğme yalnız sarı zeminde (tente, sarı bant, sarı plaka) birincil eylemdir. tests/e2e/tasarim.spec.ts bunu denetler.
type Varyant = "sari" | "emaye" | "kara";

type Ortak = {
  varyant?: Varyant;
  kucuk?: boolean;
  ikon?: Icon;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

type IcBaglanti = Ortak & { to: string; href?: never; yeniSekme?: never };
type DisBaglanti = Ortak & { href: string; to?: never; yeniSekme?: boolean; yeniSekmeMetni?: string };

const VARYANT: Record<Varyant, string | undefined> = { sari: undefined, emaye: s.emaye, kara: s.kara };

// Emaye düğme: iç yol için <Link>, tel:/wa.me gibi dış adresler için <a>.
export function Buton(props: IcBaglanti | DisBaglanti) {
  const { varyant = "sari", kucuk, ikon, className, onClick, children } = props;
  const sinif = cx(s.dugme, VARYANT[varyant], kucuk && s.kucuk, className);
  const icerik = (
    <>
      {ikon ? <Ikon ikon={ikon} /> : null}
      <span>{children}</span>
    </>
  );
  if (props.to !== undefined) {
    return (
      <Link className={sinif} to={props.to} onClick={onClick} data-varyant={varyant}>
        {icerik}
      </Link>
    );
  }
  const yeni = props.yeniSekme === true;
  return (
    <a className={sinif} href={props.href} onClick={onClick} data-varyant={varyant} {...(yeni ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {icerik}
      {yeni && props.yeniSekmeMetni ? <span className="sr">{props.yeniSekmeMetni}</span> : null}
    </a>
  );
}

export function MetinLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link className={cx(s.metinLink, className)} to={to}>
      <span>{children}</span>
      <Ikon ikon={ArrowRightIcon} />
    </Link>
  );
}
