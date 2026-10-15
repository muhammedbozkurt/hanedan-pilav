import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { Buton } from "~/components/Buton.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { usePaths, useT } from "~/i18n/index.ts";
import { bayilikYolu } from "~/lib/rotalar.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/anasayfa";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("anasayfa", location.pathname);

export default function Anasayfa() {
  const t = useT();
  const { dil, yol } = usePaths();
  const m = t.sayfalar.anasayfa;
  return (
    <SayfaBasligi
      baslik={
        <>
          {m.baslikBas} <span className="nw">{m.baslikSon}</span>
        </>
      }
      giris={m.giris}
      eylemler={
        <>
          <Buton to={bayilikYolu(dil)}>{t.nav.bayilik}</Buton>
          <Buton to={yol("bayilerimiz")} varyant="emaye" ikon={MapPinIcon}>
            {m.bayilerEylem}
          </Buton>
        </>
      }
    />
  );
}
