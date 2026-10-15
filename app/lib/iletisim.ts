import { SITE } from "~/content/site.ts";
import type { Sozluk } from "~/i18n/index.ts";

export const TEL_HREF = `tel:${SITE.telefon.e164}`;

export function waHref(t: Sozluk): string {
  return `https://wa.me/${SITE.whatsapp.numara}?text=${encodeURIComponent(t.wa.mesaj)}`;
}

export function saatMetni(t: Sozluk): string {
  return t.saat.metin(SITE.calismaSaatleri.acilis, SITE.calismaSaatleri.kapanis);
}
