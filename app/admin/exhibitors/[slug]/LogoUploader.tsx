"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { ExhibitorLogo } from "@/components/admin/ExhibitorLogo";
import { uploadExhibitorLogoAction } from "../actions";

/**
 * Drag-and-drop OR click-to-pick uploader for a single exhibitor's
 * logo. Mirrors PhotoUploader for speakers — same UX, different
 * server action and preview component.
 */
export function LogoUploader({
  slug,
  initialUrl,
  name,
}: {
  slug: string;
  initialUrl: string | null;
  name: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleFile = (file: File) => {
    setError(null);
    setJustSaved(false);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadExhibitorLogoAction(slug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPreviewUrl(result.url);
      setJustSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-franja-text-muted">
        Logo
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition ${
          isDragging
            ? "border-franja-turquoise bg-franja-turquoise/5"
            : "border-franja-border bg-franja-bg-elevated/40 hover:border-franja-turquoise/40"
        }`}
      >
        <ExhibitorLogo logoUrl={previewUrl} name={name} size={120} />

        {pending ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted">
            <Loader2 size={12} className="animate-spin" />
            Subiendo…
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted">
            <ImagePlus size={12} />
            Arrastra un logo o click
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-franja-pink/40 bg-franja-pink/10 px-2.5 py-1.5 text-xs text-franja-pink"
        >
          {error}
        </p>
      )}
      {justSaved && !pending && !error && (
        <p
          role="status"
          className="inline-flex items-center gap-1.5 text-xs text-franja-turquoise"
        >
          <CheckCircle2 size={12} />
          Logo actualizado.
        </p>
      )}
    </div>
  );
}
