import { ILCELER } from "~/content/ilceler.ts";
import { useFormT } from "~/i18n/form.ts";
import { Ikili, ListeAlani, MesajAlani, MetinAlani, SecenekGrubu } from "./alanlar.tsx";
import { ISTANBUL_DISI, LIMIT } from "./dogrula.ts";
import { FormKabugu } from "./FormKabugu.tsx";

export function BayilikFormu({ className }: { className?: string }) {
  const m = useFormT();
  return (
    <FormKabugu tur="bayilik" gonderEtiket={m.gonder.bayilik} className={className}>
      {({ idOnek, hata }) => (
        <>
          <MetinAlani ad="ad" etiket={m.alanlar.ad} idOnek={idOnek} zorunlu autoComplete="name" maxLength={LIMIT.ad} hata={hata("ad")} />
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
          <ListeAlani ad="ilce" etiket={m.alanlar.ilce} idOnek={idOnek} zorunlu hata={hata("ilce")}>
            <option value="">{m.ilce.sec}</option>
            {ILCELER.map((i) => (
              <option key={i.slug} value={i.ad}>
                {i.ad}
              </option>
            ))}
            <option value={ISTANBUL_DISI}>{m.ilce.istanbulDisi}</option>
          </ListeAlani>
          <SecenekGrubu
            ad="mevcut_isletme"
            etiket={m.alanlar.isletme}
            idOnek={idOnek}
            secenekler={[
              { deger: "evet", etiket: m.isletme.evet },
              { deger: "hayir", etiket: m.isletme.hayir },
            ]}
            hata={hata("mevcut_isletme")}
          />
          <MetinAlani ad="lokasyon" etiket={m.alanlar.lokasyon} idOnek={idOnek} maxLength={LIMIT.lokasyon} ipucu={m.ipucu.lokasyon} hata={hata("lokasyon")} />
          <MesajAlani ad="mesaj" etiket={m.alanlar.mesaj} idOnek={idOnek} maxLength={LIMIT.mesaj} hata={hata("mesaj")} />
        </>
      )}
    </FormKabugu>
  );
}
