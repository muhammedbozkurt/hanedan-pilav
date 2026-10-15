import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { useT } from "~/i18n/index.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/kvkk";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("kvkk", location.pathname);

export default function Kvkk() {
  const m = useT().sayfalar.kvkk;
  return <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />;
}
