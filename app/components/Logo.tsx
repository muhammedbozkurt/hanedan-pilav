// Marka logosu: WebP öncelikli, PNG yedekli. Ölçü sabit (520x188) olduğu için yerleşim kaymaz.
export function Logo({ alt, tembel }: { alt: string; tembel?: boolean }) {
  return (
    <picture>
      <source srcSet="/img/logo-saydam.webp" type="image/webp" />
      <img src="/img/logo-saydam.png" width={520} height={188} alt={alt} {...(tembel ? { loading: "lazy" as const } : {})} />
    </picture>
  );
}
