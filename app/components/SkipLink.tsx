import { useT } from "~/i18n/index.ts";
import s from "./SkipLink.module.css";

export function SkipLink() {
  const t = useT();
  return (
    <a className={s.atla} href="#icerik" data-arka-plan="">
      {t.genel.atla}
    </a>
  );
}
