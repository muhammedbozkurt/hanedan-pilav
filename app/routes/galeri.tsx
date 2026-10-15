import { Bolum } from "~/components/Bolum.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { GALERI } from "~/content/galeri.ts";
import { useLang, useT } from "~/i18n/index.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/galeri";
import s from "./galeri.module.css";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("galeri", location.pathname);

export default function Galeri() {
  const dil = useLang();
  const m = useT().sayfalar.galeri;
  return (
    <>
      <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />
      <Bolum>
        <ul className={s.izgara}>
          {GALERI.map((oge) => (
            <li key={oge.id}>
              <Gorsel oran={oge.oran} konu={oge[dil].konu} not={oge[dil].not} src={oge.src} />
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
