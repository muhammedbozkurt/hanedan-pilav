import { Bolum } from "~/components/Bolum.tsx";
import { MetinLink } from "~/components/Buton.tsx";
import { usePaths } from "~/i18n/index.ts";
import { useIletisim } from "~/i18n/iletisim.ts";
import { bayilikYolu, cateringYolu } from "~/lib/rotalar.ts";
import s from "./Yonlendirme.module.css";

export function Yonlendirme() {
  const m = useIletisim().yonlendirme;
  const { dil } = usePaths();
  const kartlar = [
    { anahtar: "bayilik", ...m.bayilik, to: bayilikYolu(dil) },
    { anahtar: "catering", ...m.catering, to: cateringYolu(dil) },
  ];
  return (
    <Bolum baslikId="yonlendirme-baslik" ustBoslukYok>
      <h2 id="yonlendirme-baslik" className={s.baslik}>
        {m.baslik}
      </h2>
      <ul className={s.liste}>
        {kartlar.map((k) => (
          <li key={k.anahtar} className={s.kart}>
            <h3>{k.baslik}</h3>
            <p>{k.metin}</p>
            <MetinLink to={k.to}>{k.eylem}</MetinLink>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
