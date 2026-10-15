import { BayiBulucu } from "~/components/bayiler/BayiBulucu.tsx";
import { BayilikPlakasi } from "~/components/bayiler/BayilikPlakasi.tsx";
import { MetinLink } from "~/components/Buton.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { bayilerimizSozluk, useBayilerimiz } from "~/i18n/bayilerimiz.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { BAYILIK_CAPASI, dilBul } from "~/lib/rotalar.ts";
import { seo } from "~/lib/seo.ts";
import type { Route } from "./+types/bayilerimiz";

export const meta: Route.MetaFunction = ({ location }) => {
  const dil = dilBul(location.pathname);
  const m = bayilerimizSozluk(dil).meta;
  return seo({ anahtar: "bayilerimiz", dil, baslik: m.baslik, aciklama: m.aciklama });
};

export default function Bayilerimiz() {
  const m = useBayilerimiz().baslik;
  const t = useT();
  const { dil } = usePaths();
  return (
    <>
      <SayfaBasligi
        etiket={m.etiket}
        baslik={m.baslik}
        giris={m.giris}
        eylemler={<MetinLink to={`#${BAYILIK_CAPASI[dil]}`}>{t.nav.bayilik}</MetinLink>}
      />
      <BayiBulucu />
      <BayilikPlakasi />
    </>
  );
}
