import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { useT } from "~/i18n/index.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/kurumsal";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("kurumsal", location.pathname);

export default function Kurumsal() {
  const m = useT().sayfalar.kurumsal;
  return <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />;
}
