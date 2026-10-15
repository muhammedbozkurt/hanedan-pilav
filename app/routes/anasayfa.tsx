import { Acilis } from "~/components/anasayfa/Acilis.tsx";
import { BayilikPlakasi } from "~/components/anasayfa/BayilikPlakasi.tsx";
import { GaleriSeridi } from "~/components/anasayfa/GaleriSeridi.tsx";
import { HaritaTanitim } from "~/components/anasayfa/HaritaTanitim.tsx";
import { HikayeOzet } from "~/components/anasayfa/HikayeOzet.tsx";
import { Hizmetler } from "~/components/anasayfa/Hizmetler.tsx";
import { Kunye } from "~/components/anasayfa/Kunye.tsx";
import { anasayfaSozluk } from "~/i18n/anasayfa.ts";
import { dilBul } from "~/lib/rotalar.ts";
import { seo } from "~/lib/seo.ts";
import type { Route } from "./+types/anasayfa";

export const meta: Route.MetaFunction = ({ location }) => {
  const dil = dilBul(location.pathname);
  const m = anasayfaSozluk(dil).meta;
  return seo({ anahtar: "anasayfa", dil, baslik: m.baslik, aciklama: m.aciklama });
};

// Bölüm sırası onaylı "E Esnaf Tabelası" referansıyla birebir aynıdır.
export default function Anasayfa() {
  return (
    <>
      <Acilis />
      <Kunye />
      <Hizmetler />
      <HikayeOzet />
      <HaritaTanitim />
      <GaleriSeridi />
      <BayilikPlakasi />
    </>
  );
}
