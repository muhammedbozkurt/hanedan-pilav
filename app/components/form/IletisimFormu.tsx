import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Ikili, ListeAlani, MesajAlani, MetinAlani } from "./alanlar.tsx";
import { KONULAR, LIMIT, konuCoz } from "./dogrula.ts";
import { FormKabugu } from "./FormKabugu.tsx";
import { useFormT } from "~/i18n/form.ts";
import { KONU_SORGU_ANAHTARI } from "~/lib/rotalar.ts";

// Konu önseçimi: TR ?konu=, EN ?topic= (ikisi de iki dilde çalışır). Sayfa prerender edildiği için istemcide uygulanır.
function useKonuOnSecimi() {
  const ref = useRef<HTMLSelectElement>(null);
  const [arama] = useSearchParams();
  const deger = konuCoz(arama.get(KONU_SORGU_ANAHTARI.tr) ?? arama.get(KONU_SORGU_ANAHTARI.en));
  useEffect(() => {
    if (deger && ref.current) ref.current.value = deger;
  }, [deger]);
  return ref;
}

export function IletisimFormu({ className }: { className?: string }) {
  const m = useFormT();
  const konuRef = useKonuOnSecimi();
  return (
    <FormKabugu tur="iletisim" gonderEtiket={m.gonder.iletisim} className={className}>
      {({ idOnek, hata }) => (
        <>
          <ListeAlani ad="konu" etiket={m.konu.etiket} idOnek={idOnek} zorunlu hata={hata("konu")} girdiRef={konuRef}>
            {KONULAR.map((k) => (
              <option key={k} value={k}>
                {m.konu[k]}
              </option>
            ))}
          </ListeAlani>
          <Ikili>
            <MetinAlani ad="ad" etiket={m.alanlar.ad} idOnek={idOnek} zorunlu autoComplete="name" maxLength={LIMIT.ad} hata={hata("ad")} />
            <MetinAlani ad="firma" etiket={m.alanlar.firma} idOnek={idOnek} autoComplete="organization" maxLength={LIMIT.firma} hata={hata("firma")} />
          </Ikili>
          <Ikili>
            <MetinAlani
              ad="telefon"
              etiket={m.alanlar.telefon}
              idOnek={idOnek}
              tip="tel"
              zorunlu
              autoComplete="tel"
              maxLength={LIMIT.telefon}
              ipucu={m.ipucu.telefon}
              hata={hata("telefon")}
            />
            <MetinAlani ad="eposta" etiket={m.alanlar.eposta} idOnek={idOnek} tip="email" zorunlu autoComplete="email" maxLength={LIMIT.eposta} hata={hata("eposta")} />
          </Ikili>
          <MesajAlani ad="mesaj" etiket={m.alanlar.mesaj} idOnek={idOnek} zorunlu maxLength={LIMIT.mesaj} hata={hata("mesaj")} />
        </>
      )}
    </FormKabugu>
  );
}
