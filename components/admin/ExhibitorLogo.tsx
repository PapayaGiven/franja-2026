import { Store } from "lucide-react";

/**
 * Square logo box for exhibitor rows / forms. White background because
 * most brand logos are designed for light surfaces. Falls back to a
 * generic store icon when `logoUrl` is null.
 */
export function ExhibitorLogo({
  logoUrl,
  name,
  size = 40,
  className = "",
}: {
  logoUrl: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const base = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md ${className}`;
  const dim = { width: size, height: size };

  if (logoUrl) {
    return (
      <span className={`${base} bg-white`} style={dim} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-contain p-1"
        />
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-franja-border/40 text-franja-text-muted`}
      style={dim}
      role="img"
      aria-label={`Logo de ${name} no disponible`}
    >
      <Store
        size={Math.round(size * 0.5)}
        strokeWidth={1.5}
        className="text-franja-text-muted/70"
      />
    </span>
  );
}
