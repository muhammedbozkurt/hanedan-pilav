import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { Calisma } from "~/components/kurumsal/Calisma.tsx";
import { Catering } from "~/components/kurumsal/Catering.tsx";
import { Degerler } from "~/components/kurumsal/Degerler.tsx";
import { Hikaye } from "~/components/kurumsal/Hikaye.tsx";
import { Kapanis } from "~/components/kurumsal/Kapanis.tsx";
import { kurumsalSozluk, useKurumsal } from "~/i18n/kurumsal.ts";
import { dilBul } from "~/lib/rotalar.ts";
import { seo } from "~/lib/seo.ts";
import type { Route } from "./+types/kurumsal";

export const meta: Route.MetaFunction = ({ location }) => {
  const dil = dilBul(location.pathname);
  const m = kurumsalSozluk(dil).meta;
  return seo({ anahtar: "kurumsal", dil, baslik: m.baslik, aciklama: m.aciklama });
};

export default function Kurumsal() {
  const m = useKurumsal().baslik;
  return (
    <>
      <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />
      <Hikaye />
      <Calisma />
      <Catering />
      <Degerler />
      <Kapanis />
    </>
  );
}
