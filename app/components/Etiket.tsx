import type { ReactNode } from "react";
import { cx } from "~/lib/cx.ts";
import s from "./Etiket.module.css";

export function Etiket({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(s.etiket, className)}>{children}</span>;
}
