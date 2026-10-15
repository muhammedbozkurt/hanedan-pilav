import { Kap } from "~/components/Bolum.tsx";
import { IletisimFormu } from "~/components/form/IletisimFormu.tsx";
import { Bilgiler } from "~/components/iletisim/Bilgiler.tsx";
import { Yonlendirme } from "~/components/iletisim/Yonlendirme.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { iletisimSozluk, useIletisim } from "~/i18n/iletisim.ts";
import { dilBul } from "~/lib/rotalar.ts";
import { seo } from "~/lib/seo.ts";
import type { Route } from "./+types/iletisim";
import s from "./iletisim.module.css";

export const meta: Route.MetaFunction = ({ location }) => {
  const dil = dilBul(location.pathname);
  const m = iletisimSozluk(dil).meta;
  return seo({ anahtar: "iletisim", dil, baslik: m.baslik, aciklama: m.aciklama });
};

export default function Iletisim() {
  const m = useIletisim();
  return (
    <>
      <SayfaBasligi etiket={m.baslik.etiket} baslik={m.baslik.baslik} giris={m.baslik.giris} />
      <section className={s.icerik} aria-labelledby="form-baslik">
        <Kap>
          <div className={s.izgara}>
            <Bilgiler />
            <div className={s.formKolon} data-fab-gizle="">
              <h2 id="form-baslik">{m.form.baslik}</h2>
              <p className={s.formMetin}>{m.form.metin}</p>
              <IletisimFormu className={s.form} />
            </div>
          </div>
        </Kap>
      </section>
      <Yonlendirme />
    </>
  );
}
