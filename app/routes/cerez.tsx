import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { useT } from "~/i18n/index.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/cerez";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("cerez", location.pathname);

export default function CerezPolitikasi() {
  const m = useT().sayfalar.cerez;
  return <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />;
}
