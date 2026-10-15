import { Bolum } from "~/components/Bolum.tsx";
import { Izgara } from "~/components/galeri/Izgara.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { galeriMetin } from "~/i18n/galeri.ts";
import { useLang } from "~/i18n/index.ts";
import { dilBul } from "~/lib/rotalar.ts";
import { seo } from "~/lib/seo.ts";
import type { Route } from "./+types/galeri";

export const meta: Route.MetaFunction = ({ location }) => {
  const dil = dilBul(location.pathname);
  const m = galeriMetin(dil).meta;
  return seo({ anahtar: "galeri", dil, baslik: m.baslik, aciklama: m.aciklama });
};

export default function Galeri() {
  const m = galeriMetin(useLang());
  return (
    <>
      <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />
      <Bolum>
        <Izgara />
      </Bolum>
    </>
  );
}
