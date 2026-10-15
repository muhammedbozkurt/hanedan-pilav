import { useLocation, useMatches } from "react-router";
import {
  type Dil,
  type Parametreler,
  type SayfaAnahtari,
  dilBul,
  rotaIdCoz,
  yol as yolOlustur,
} from "~/lib/rotalar.ts";
import { en } from "./en.ts";
import { type Sozluk, tr } from "./tr.ts";

export type { Sozluk };

const SOZLUKLER: Readonly<Record<Dil, Sozluk>> = { tr, en };

export function sozluk(dil: Dil): Sozluk {
  return SOZLUKLER[dil];
}

export function useLang(): Dil {
  return dilBul(useLocation().pathname);
}

export function useT(): Sozluk {
  return sozluk(useLang());
}

type GecerliSayfa = { anahtar: SayfaAnahtari; params: Parametreler } | null;

function useGecerliSayfa(): GecerliSayfa {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const cozum = m ? rotaIdCoz(m.id) : null;
    if (m && cozum) {
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(m.params)) if (v !== undefined) params[k] = v;
      return { anahtar: cozum.anahtar, params };
    }
  }
  return null;
}

export function usePaths() {
  const dil = useLang();
  const gecerli = useGecerliSayfa();
  return {
    dil,
    anahtar: gecerli?.anahtar ?? null,
    yol: (anahtar: SayfaAnahtari, params?: Parametreler) => yolOlustur(anahtar, dil, params),
    // Dil seçici için: aynı sayfanın hedef dildeki karşılığı; eşleşme yoksa (hata sınırı) o dilin anasayfası.
    karsilik: (hedef: Dil) =>
      gecerli ? yolOlustur(gecerli.anahtar, hedef, gecerli.params) : yolOlustur("anasayfa", hedef),
  };
}
