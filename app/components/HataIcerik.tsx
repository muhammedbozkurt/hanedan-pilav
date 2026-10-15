import { usePaths, useT } from "~/i18n/index.ts";
import { Buton } from "./Buton.tsx";
import { SayfaBasligi } from "./SayfaBasligi.tsx";

// 404 rotası ve kök hata sınırı aynı görünümü kullanır.
export function BulunamadiIcerik() {
  const t = useT();
  const { yol } = usePaths();
  const m = t.sayfalar.bulunamadi;
  return (
    <SayfaBasligi
      etiket={m.etiket}
      baslik={m.baslik}
      giris={m.giris}
      eylemler={<Buton to={yol("anasayfa")}>{m.eylem}</Buton>}
    />
  );
}

export function HataIcerik({ ayrinti }: { ayrinti?: string }) {
  const t = useT();
  const { yol } = usePaths();
  return (
    <SayfaBasligi
      etiket={t.hata.etiket}
      baslik={t.hata.baslik}
      giris={t.hata.giris}
      eylemler={<Buton to={yol("anasayfa")}>{t.sayfalar.bulunamadi.eylem}</Buton>}
    >
      {ayrinti ? <pre style={{ marginTop: 24, whiteSpace: "pre-wrap", fontSize: 13 }}>{ayrinti}</pre> : null}
    </SayfaBasligi>
  );
}
