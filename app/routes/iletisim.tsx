import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { Buton } from "~/components/Buton.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { useT } from "~/i18n/index.ts";
import { TEL_HREF, saatMetni } from "~/lib/iletisim.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import { SITE } from "~/content/site.ts";
import type { Route } from "./+types/iletisim";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("iletisim", location.pathname);

export default function Iletisim() {
  const t = useT();
  const m = t.sayfalar.iletisim;
  return (
    <SayfaBasligi
      etiket={m.etiket}
      baslik={m.baslik}
      giris={m.giris(saatMetni(t))}
      eylemler={
        <Buton href={TEL_HREF} ikon={PhoneIcon}>
          <span className="sr">{t.genel.telSr} </span>
          {SITE.telefon.gorunen}
        </Buton>
      }
    />
  );
}
