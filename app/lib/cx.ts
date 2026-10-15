export function cx(...siniflar: Array<string | false | null | undefined>): string {
  return siniflar.filter(Boolean).join(" ");
}
