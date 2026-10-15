import { Link } from "react-router";
import { sozluk, usePaths, useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { DILLER } from "~/lib/rotalar.ts";
import s from "./LangSwitch.module.css";

// Dil seçici: diğer dil için aynı sayfanın karşılığına bağlantı; seçili dil bağlantı değildir.
export function LangSwitch({ koyu, className }: { koyu?: boolean; className?: string }) {
  const t = useT();
  const { dil, karsilik } = usePaths();
  return (
    <div className={cx(s.dil, koyu && s.koyu, className)} role="group" aria-label={t.genel.dilAria}>
      {DILLER.map((d) => {
        const hedef = sozluk(d).dil;
        if (d === dil) {
          return (
            <span key={d} className={cx(s.secenek, s.aktif)} aria-current="true" lang={d}>
              {hedef.kisa}
              <span className="sr">
                {" "}
                {hedef.ad} ({t.genel.secili})
              </span>
            </span>
          );
        }
        return (
          <Link key={d} className={s.secenek} to={karsilik(d)} hrefLang={d} lang={d} data-dil={d}>
            {hedef.kisa}
            <span className="sr"> {hedef.ad}</span>
          </Link>
        );
      })}
    </div>
  );
}
