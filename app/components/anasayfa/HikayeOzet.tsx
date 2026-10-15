import { Bolum } from "~/components/Bolum.tsx";
import { MetinLink } from "~/components/Buton.tsx";
import { Etiket } from "~/components/Etiket.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { usePaths } from "~/i18n/index.ts";
import s from "./HikayeOzet.module.css";
import { galeriGorseli } from "./yardimci.ts";

export function HikayeOzet() {
  const m = useAnasayfa().hikaye;
  const { dil, yol } = usePaths();
  const ilkeler = [m.ilkeler.lezzet, m.ilkeler.hijyen, m.ilkeler.sureklilik];
  return (
    <Bolum baslikId="hikaye-baslik" ustBoslukYok>
      <div className={s.izgara}>
        <Gorsel className={s.foto} oran="4:5" {...galeriGorseli("uretim-mutfagi", dil)} sizes="(max-width: 899px) 100vw, 520px" />
        <div className={s.metin}>
          <Etiket>{m.etiket}</Etiket>
          <h2 id="hikaye-baslik">{m.baslik}</h2>
          <p className={s.giris}>{m.giris}</p>
          <ul className={s.ilkeler}>
            {ilkeler.map((i) => (
              <li key={i.baslik}>
                <h3>{i.baslik}</h3>
                <p>{i.metin}</p>
              </li>
            ))}
          </ul>
          <MetinLink to={yol("kurumsal")} className={s.link}>
            {m.eylem}
          </MetinLink>
        </div>
      </div>
    </Bolum>
  );
}
