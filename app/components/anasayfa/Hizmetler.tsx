import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { CookingPotIcon } from "@phosphor-icons/react/CookingPot";
import { HandshakeIcon } from "@phosphor-icons/react/Handshake";
import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { Link } from "react-router";
import { Bolum } from "~/components/Bolum.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { usePaths } from "~/i18n/index.ts";
import { bayilikYolu, cateringYolu } from "~/lib/rotalar.ts";
import s from "./Hizmetler.module.css";

export function Hizmetler() {
  const m = useAnasayfa().hizmetler;
  const { dil, yol } = usePaths();
  const satirlar = [
    { anahtar: "bayilik", ikon: HandshakeIcon, madde: m.bayilik, to: bayilikYolu(dil) },
    { anahtar: "catering", ikon: CookingPotIcon, madde: m.catering, to: cateringYolu(dil) },
    { anahtar: "bayiler", ikon: MapPinIcon, madde: m.bayiler, to: yol("bayilerimiz") },
  ];
  return (
    <Bolum baslikId="hizmet-baslik">
      <h2 id="hizmet-baslik" className={s.baslik}>
        {m.baslik}
      </h2>
      <ul className={s.liste}>
        {satirlar.map((r) => (
          <li key={r.anahtar}>
            <Link className={s.hizmet} to={r.to}>
              <span className={s.ikon}>
                <Ikon ikon={r.ikon} />
              </span>
              <h3>
                {r.madde.baslik}
                <Ikon ikon={ArrowRightIcon} className={s.okDar} />
              </h3>
              <p>{r.madde.metin}</p>
              <span className={s.ok}>
                <Ikon ikon={ArrowRightIcon} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
