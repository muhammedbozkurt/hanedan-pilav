import { usePaths, useT } from "~/i18n/index.ts";
import { Buton } from "./Buton.tsx";
import { SayfaBasligi } from "./SayfaBasligi.tsx";
import { SayfaBulunamadi } from "./yasal/SayfaBulunamadi.tsx";

// 404 rotası ve kök hata sınırı aynı görünümü kullanmalı; farklı olursa prerender HTML ile hidrasyon çakışır.
export function BulunamadiIcerik() {
  return <SayfaBulunamadi />;
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
