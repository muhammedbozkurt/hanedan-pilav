import { CookingPotIcon } from "@phosphor-icons/react/CookingPot";
import { HandSoapIcon } from "@phosphor-icons/react/HandSoap";
import { TruckIcon } from "@phosphor-icons/react/Truck";
import { Bolum } from "~/components/Bolum.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { useKurumsal } from "~/i18n/kurumsal.ts";
import s from "./Calisma.module.css";

const IKONLAR = { uretim: CookingPotIcon, hijyen: HandSoapIcon, lojistik: TruckIcon } as const;
const SIRA = ["uretim", "hijyen", "lojistik"] as const;

export function Calisma() {
  const m = useKurumsal().calisma;
  return (
    <Bolum baslikId="calisma-baslik" koyu>
      <h2 id="calisma-baslik" className={s.baslik}>
        {m.baslik}
      </h2>
      <ul className={s.liste}>
        {SIRA.map((anahtar) => (
          <li key={anahtar} className={s.madde}>
            <Ikon ikon={IKONLAR[anahtar]} className={s.ikon} />
            <h3>{m.maddeler[anahtar].baslik}</h3>
            <p>{m.maddeler[anahtar].metin}</p>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
