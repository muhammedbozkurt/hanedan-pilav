import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/global.css";

import jakartaLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";
import rokkittLatin from "@fontsource-variable/rokkitt/files/rokkitt-latin-wght-normal.woff2?url";
import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/root";
import { Footer } from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";
import { BulunamadiIcerik, HataIcerik } from "./components/HataIcerik.tsx";
import { RotaOdak } from "./components/RotaOdak.tsx";
import { SkipLink } from "./components/SkipLink.tsx";
import { WhatsAppFab } from "./components/WhatsAppFab.tsx";
import { useLang, useT } from "./i18n/index.ts";

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: rokkittLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: jakartaLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/img/favicon.png", type: "image/png" },
];

// Menü düğmesi yalnız JS varken gösterilir (referanstaki `.js` sınıfı); boyamadan önce eklenir.
const JS_ISARETI = "document.documentElement.classList.add('js')";

export function Layout({ children }: { children: ReactNode }) {
  const dil = useLang();
  return (
    <html lang={dil} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F4C20D" />
        <script dangerouslySetInnerHTML={{ __html: JS_ISARETI }} />
        <Meta />
        <Links />
      </head>
      <body>
        <SkipLink />
        <Header />
        <main id="icerik" tabIndex={-1} data-arka-plan="">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
        <RotaOdak />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const t = useT();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <title>{t.sayfalar.bulunamadi.meta.baslik}</title>
        <meta name="robots" content="noindex" />
        <BulunamadiIcerik />
      </>
    );
  }
  const ayrinti = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;
  return (
    <>
      <title>{t.hata.metaBaslik}</title>
      <meta name="robots" content="noindex" />
      <HataIcerik ayrinti={ayrinti} />
    </>
  );
}
