import { YasalSayfa } from "~/components/yasal/YasalSayfa.tsx";
import { CEREZ_BOLUMLERI, useYasal } from "~/i18n/yasal.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/cerez";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("cerez", location.pathname);

export default function CerezPolitikasi() {
  const y = useYasal();
  return <YasalSayfa metin={y.cerez} sira={CEREZ_BOLUMLERI} ortak={y.ortak} />;
}
