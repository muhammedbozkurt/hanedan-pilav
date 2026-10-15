import { Kap } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { useLang, useT } from "~/i18n/index.ts";
import { bayilikYolu, teklifYolu } from "~/lib/rotalar.ts";
import s from "./Acilis.module.css";
import { galeriGorseli } from "./yardimci.ts";

// Dükkân cephesi: sayfanın tek h1'i, iki eylem ve vitrin çerçeveli açılış fotoğrafı (vitrin motifi yalnız burada).
export function Acilis() {
  const m = useAnasayfa().acilis;
  const t = useT();
  const dil = useLang();
  return (
    <section className={s.acilis} aria-labelledby="acilis-baslik">
      <Kap className={s.ic}>
        <div className={s.metin}>
          <h1 id="acilis-baslik">
            {m.baslikBas} <span className="nw">{m.baslikSon}</span>
          </h1>
          <p className={s.giris}>{m.giris}</p>
          <div className={s.eylemler}>
            <Buton to={bayilikYolu(dil)} className={s.eylem}>
              {t.nav.bayilik}
            </Buton>
            <Buton to={teklifYolu(dil)} varyant="emaye" className={s.eylem}>
              {m.teklif}
            </Buton>
          </div>
        </div>
        <div className={s.cephe}>
          <div className={s.vitrin}>
            <Gorsel
              className={s.cam}
              oran="4:3"
              {...galeriGorseli("dukkan-cephesi", dil)}
              oncelikli
              sizes="(max-width: 899px) 100vw, 640px"
            />
          </div>
        </div>
      </Kap>
    </section>
  );
}
