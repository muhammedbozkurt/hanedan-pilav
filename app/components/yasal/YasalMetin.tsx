import type { ReactNode } from "react";
import { Link } from "react-router";
import { SITE, adresTekSatir, isTodo } from "~/content/site.ts";
import { usePaths } from "~/i18n/index.ts";
import type { Blok, Parca, Satir, YasalBolum, YasalSozluk } from "~/i18n/yasal.ts";
import { TEL_HREF } from "~/lib/iletisim.ts";
import { YASAL_BILGI, type YasalAlan } from "./bilgiler.ts";
import s from "./YasalSayfa.module.css";

// Değeri `null` olan alan "bu işletmede yok" demektir: o alanı taşıyan satır hiç çizilmez.
function satirGorunur(satir: Satir): boolean {
  return satir.every((p) => typeof p === "string" || !("alan" in p) || YASAL_BILGI[p.alan] !== null);
}

function AlanDegeri({ alan, ortak }: { alan: YasalAlan; ortak: YasalSozluk["ortak"] }) {
  const { dil } = usePaths();
  const deger = YASAL_BILGI[alan];
  if (deger === null) return null;
  if (isTodo(deger)) {
    return (
      <mark className={s.eksik} data-yasal-eksik={alan}>
        [{ortak.eksik[alan]}]
      </mark>
    );
  }
  const metin = typeof deger === "string" ? deger : deger[dil];
  if (alan === "eposta") return <a href={`mailto:${metin}`}>{metin}</a>;
  return <>{metin}</>;
}

function ParcaGoster({ parca, ortak }: { parca: Parca; ortak: YasalSozluk["ortak"] }) {
  const { yol } = usePaths();
  if (typeof parca === "string") return <>{parca}</>;
  if ("kalin" in parca) return <strong>{parca.kalin}</strong>;
  if ("kod" in parca) return <code translate="no">{parca.kod}</code>;
  if ("alan" in parca) return <AlanDegeri alan={parca.alan} ortak={ortak} />;
  if ("sayfa" in parca) return <Link to={yol(parca.sayfa)}>{parca.metin}</Link>;
  if (parca.sabit === "telefon") {
    return (
      <a className="nw" href={TEL_HREF}>
        {SITE.telefon.gorunen}
      </a>
    );
  }
  return <span lang="tr">{adresTekSatir()}</span>;
}

function SatirGoster({ satir, ortak }: { satir: Satir; ortak: YasalSozluk["ortak"] }): ReactNode {
  return satir.map((parca, i) => <ParcaGoster key={i} parca={parca} ortak={ortak} />);
}

function BlokGoster({ blok, ortak }: { blok: Blok; ortak: YasalSozluk["ortak"] }) {
  if ("p" in blok) {
    return satirGorunur(blok.p) ? (
      <p>
        <SatirGoster satir={blok.p} ortak={ortak} />
      </p>
    ) : null;
  }
  if ("not" in blok) {
    return (
      <p className={s.not}>
        <SatirGoster satir={blok.not} ortak={ortak} />
      </p>
    );
  }
  if ("liste" in blok) {
    return (
      <ul className={s.liste}>
        {blok.liste.filter(satirGorunur).map((satir, i) => (
          <li key={i}>
            <SatirGoster satir={satir} ortak={ortak} />
          </li>
        ))}
      </ul>
    );
  }
  const tanimlar = blok.tanimlar.filter((t) => satirGorunur(t.deger));
  return (
    <div className={s.kalem}>
      {blok.baslik ? <h3>{blok.baslik}</h3> : null}
      <dl>
        {tanimlar.map((t) => (
          <div key={t.etiket}>
            <dt>{t.etiket}</dt>
            <dd>
              <SatirGoster satir={t.deger} ortak={ortak} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function YasalBolumGoster({ bolum, no, ortak }: { bolum: YasalBolum; no: string; ortak: YasalSozluk["ortak"] }) {
  return (
    <section className={s.bolum} aria-labelledby={bolum.id}>
      <h2 id={bolum.id}>
        <span className={s.no} aria-hidden="true">
          {no}
        </span>
        <span>{bolum.baslik}</span>
      </h2>
      {bolum.bloklar.map((blok, i) => (
        <BlokGoster key={i} blok={blok} ortak={ortak} />
      ))}
    </section>
  );
}

// Sayfada kullanılan ve değeri henüz bilinmeyen alanlar; taslak notu yalnız bunlar varsa görünür.
export function eksikAlanlar(bolumler: readonly YasalBolum[]): YasalAlan[] {
  const alanlar = new Set<YasalAlan>();
  const tara = (satir: Satir) => {
    for (const p of satir) if (typeof p !== "string" && "alan" in p && isTodo(YASAL_BILGI[p.alan])) alanlar.add(p.alan);
  };
  for (const bolum of bolumler) {
    for (const blok of bolum.bloklar) {
      if ("p" in blok) tara(blok.p);
      else if ("not" in blok) tara(blok.not);
      else if ("liste" in blok) blok.liste.forEach(tara);
      else blok.tanimlar.forEach((t) => tara(t.deger));
    }
  }
  return [...alanlar];
}
