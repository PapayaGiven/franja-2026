import { User } from "lucide-react";

interface SpeakerAvatarProps {
  photoUrl: string | null;
  name: string;
  size?: number;
  className?: string;
}

/**
 * Avatar de conferencista. Cuando `photoUrl` viene null (la mayoría
 * de los speakers aún no tienen foto subida), mostramos una silueta
 * gris genérica — explícitamente NO iniciales (decisión post-0003).
 *
 * Server-component friendly: usa <img> nativo (no next/image) porque
 * los URLs vienen de Supabase Storage y no estamos optimizando aún.
 */
export function SpeakerAvatar({
  photoUrl,
  name,
  size = 56,
  className = "",
}: SpeakerAvatarProps) {
  const dim = { width: size, height: size };
  const radius = "rounded-full";
  const base = `inline-flex items-center justify-center overflow-hidden bg-franja-border/40 text-franja-text-muted shrink-0 ${radius} ${className}`;

  if (photoUrl) {
    return (
      <span className={base} style={dim} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  // Silueta gris genérica — User icon de lucide a ~55% del tamaño total
  // para mantener buen padding visual independiente del size.
  return (
    <span
      className={base}
      style={dim}
      role="img"
      aria-label={`Foto de ${name} no disponible`}
    >
      <User
        size={Math.round(size * 0.55)}
        strokeWidth={1.5}
        className="text-franja-text-muted/70"
      />
    </span>
  );
}
