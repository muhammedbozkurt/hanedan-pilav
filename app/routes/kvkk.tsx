import { YasalSayfa } from "~/components/yasal/YasalSayfa.tsx";
import { KVKK_BOLUMLERI, useYasal } from "~/i18n/yasal.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/kvkk";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("kvkk", location.pathname);

export default function Kvkk() {
  const y = useYasal();
  return <YasalSayfa metin={y.kvkk} sira={KVKK_BOLUMLERI} ortak={y.ortak} />;
}
