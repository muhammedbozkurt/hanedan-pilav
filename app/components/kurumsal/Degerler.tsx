import { Bolum } from "~/components/Bolum.tsx";
import { useKurumsal } from "~/i18n/kurumsal.ts";
import s from "./Degerler.module.css";

const SIRA = ["lezzet", "hijyen", "sureklilik"] as const;

export function Degerler() {
  const m = useKurumsal().degerler;
  return (
    <Bolum baslikId="degerler-baslik" ustBoslukYok>
      <h2 id="degerler-baslik" className={s.baslik}>
        {m.baslik}
      </h2>
      <ul className={s.liste}>
        {SIRA.map((anahtar) => (
          <li key={anahtar} className={s.satir}>
            <h3>{m.maddeler[anahtar].baslik}</h3>
            <p>{m.maddeler[anahtar].metin}</p>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
