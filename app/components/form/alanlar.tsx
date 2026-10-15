import { WarningCircleIcon } from "@phosphor-icons/react/WarningCircle";
import type { ReactNode, Ref } from "react";
import { Link } from "react-router";
import { Ikon } from "~/components/Ikon.tsx";
import { useFormT } from "~/i18n/form.ts";
import { usePaths } from "~/i18n/index.ts";
import type { AlanAdi } from "./dogrula.ts";
import s from "./Form.module.css";

export type AlanOrtak = {
  ad: AlanAdi;
  etiket: string;
  idOnek: string;
  zorunlu?: boolean;
  ipucu?: string;
  hata?: string | undefined;
};

type DenetimOzellikleri = {
  id: string;
  name: string;
  required: boolean;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

function alanId(idOnek: string, ad: AlanAdi): string {
  return `${idOnek}-${ad}`;
}

function HataMetni({ id, metin }: { id: string; metin: string }) {
  return (
    <p id={id} className={s.hata}>
      <Ikon ikon={WarningCircleIcon} />
      <span>{metin}</span>
    </p>
  );
}

function baglam({ ad, idOnek, zorunlu = false, ipucu, hata }: AlanOrtak) {
  const id = alanId(idOnek, ad);
  const ipucuId = ipucu ? `${id}-ipucu` : undefined;
  const hataId = hata ? `${id}-hata` : undefined;
  const tarif = [ipucuId, hataId].filter(Boolean).join(" ") || undefined;
  const ozellik: DenetimOzellikleri = {
    id,
    name: ad,
    required: zorunlu,
    "aria-invalid": Boolean(hata),
    "aria-describedby": tarif,
  };
  return { id, ipucuId, hataId, ozellik };
}

function Etiket({ htmlFor, etiket, zorunlu }: { htmlFor: string; etiket: string; zorunlu: boolean }) {
  const m = useFormT();
  return (
    <label className={s.etiket} htmlFor={htmlFor}>
      {etiket}
      {zorunlu ? (
        <span className={s.yildiz} aria-hidden="true">
          {" "}
          {m.zorunluIsaret}
        </span>
      ) : (
        <span className={s.opsiyonel}> ({m.opsiyonelSr})</span>
      )}
    </label>
  );
}

function Govde({ girdi, ortak }: { girdi: (o: DenetimOzellikleri) => ReactNode; ortak: AlanOrtak }) {
  const { id, ipucuId, hataId, ozellik } = baglam(ortak);
  return (
    <div className={s.alan}>
      <Etiket htmlFor={id} etiket={ortak.etiket} zorunlu={ortak.zorunlu ?? false} />
      {girdi(ozellik)}
      {ortak.ipucu && ipucuId ? (
        <p id={ipucuId} className={s.ipucu}>
          {ortak.ipucu}
        </p>
      ) : null}
      {ortak.hata && hataId ? <HataMetni id={hataId} metin={ortak.hata} /> : null}
    </div>
  );
}

type MetinTipi = "text" | "email" | "tel";

export function MetinAlani({
  tip = "text",
  autoComplete,
  maxLength,
  ...ortak
}: AlanOrtak & { tip?: MetinTipi; autoComplete?: string; maxLength: number }) {
  return (
    <Govde
      ortak={ortak}
      girdi={(o) => (
        <input
          {...o}
          className={s.girdi}
          type={tip}
          autoComplete={autoComplete}
          maxLength={maxLength}
          inputMode={tip === "tel" ? "tel" : tip === "email" ? "email" : undefined}
          autoCapitalize={tip === "email" ? "none" : undefined}
          spellCheck={tip === "text" ? undefined : false}
        />
      )}
    />
  );
}

export function MesajAlani({ maxLength, ...ortak }: AlanOrtak & { maxLength: number }) {
  return (
    <Govde ortak={ortak} girdi={(o) => <textarea {...o} className={`${s.girdi} ${s.alanMesaj}`} rows={6} maxLength={maxLength} />} />
  );
}

export function ListeAlani({
  children,
  girdiRef,
  ...ortak
}: AlanOrtak & { children: ReactNode; girdiRef?: Ref<HTMLSelectElement> }) {
  return (
    <Govde
      ortak={ortak}
      girdi={(o) => (
        <select {...o} ref={girdiRef} className={`${s.girdi} ${s.liste}`} defaultValue={ortak.ad === "konu" ? "genel" : ""}>
          {children}
        </select>
      )}
    />
  );
}

export function SecenekGrubu({
  ad,
  etiket,
  idOnek,
  secenekler,
  hata,
}: {
  ad: AlanAdi;
  etiket: string;
  idOnek: string;
  secenekler: ReadonlyArray<{ deger: string; etiket: string }>;
  hata?: string | undefined;
}) {
  const m = useFormT();
  const id = alanId(idOnek, ad);
  const hataId = hata ? `${id}-hata` : undefined;
  return (
    <fieldset className={s.grup} aria-describedby={hataId}>
      <legend className={s.etiket}>
        {etiket}
        <span className={s.opsiyonel}> ({m.opsiyonelSr})</span>
      </legend>
      <div className={s.secenekler}>
        {secenekler.map((o) => (
          <label key={o.deger} className={s.secenek}>
            <input type="radio" name={ad} value={o.deger} aria-invalid={Boolean(hata)} />
            <span>{o.etiket}</span>
          </label>
        ))}
      </div>
      {hata && hataId ? <HataMetni id={hataId} metin={hata} /> : null}
    </fieldset>
  );
}

export function BilgiNotu() {
  const m = useFormT();
  const { yol } = usePaths();
  return (
    <p className={s.bilgiNotu}>
      {m.bilgiNotu.once}
      <Link className={s.baglanti} to={yol("kvkk")}>
        {m.bilgiNotu.link}
      </Link>
      {m.bilgiNotu.sonra}
    </p>
  );
}

// Görünmez tuzak: insan görmez ve odaklanamaz, erişilebilirlik ağacında yoktur; botlar doldurursa gönderim sessizce düşer.
export function Tuzak() {
  return (
    <div className={s.tuzak} aria-hidden="true">
      <input type="text" name="kurum_kodu" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export function Ikili({ children }: { children: ReactNode }) {
  return <div className={s.ikili}>{children}</div>;
}
