import { SayfaBulunamadi } from "~/components/yasal/SayfaBulunamadi.tsx";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/bulunamadi";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("bulunamadi", location.pathname, { indeksle: false });

export default function Bulunamadi() {
  return <SayfaBulunamadi />;
}
