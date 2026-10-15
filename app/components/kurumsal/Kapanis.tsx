import { Kap } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { usePaths, useT } from "~/i18n/index.ts";
import { useKurumsal } from "~/i18n/kurumsal.ts";
import { bayilikYolu } from "~/lib/rotalar.ts";
import s from "./Kapanis.module.css";

// Bayilik başvurusuna yönlendiren sade bant. Bolum yerine düz section: bandın kendi, daha kısa dikey boşluğu var.
// Düğme etiketi menüdeki bayilik eylemiyle aynıdır (aynı niyete tek etiket).
export function Kapanis() {
  const m = useKurumsal().kapanis;
  const t = useT();
  const { dil } = usePaths();
  return (
    <section aria-labelledby="kapanis-baslik" className={s.bant}>
      <Kap>
        <div className={s.ic}>
          <div className={s.metin}>
            <h2 id="kapanis-baslik">{m.baslik}</h2>
            <p>{m.metin}</p>
          </div>
          <Buton to={bayilikYolu(dil)} varyant="kara">
            {t.nav.bayilik}
          </Buton>
        </div>
      </Kap>
    </section>
  );
}
