"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";
import { AssetUploader } from "@/components/admin/AssetUploader";
import { uploadSpeakerPhotoAction } from "../actions";

/**
 * Immediate-upload mode: as soon as the admin drops/picks a file the
 * Server Action fires; preview swaps to the returned URL.
 */
export function PhotoUploader({
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
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleFile = (file: File) => {
    setError(null);
    setJustSaved(false);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadSpeakerPhotoAction(slug, formData);
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
        Foto
      </p>

      <AssetUploader
        preview={<SpeakerAvatar photoUrl={previewUrl} name={name} size={120} />}
        accept="image/jpeg,image/png,image/webp,image/avif"
        pending={pending}
        idleHint="Arrastra una foto o click"
        onFile={handleFile}
      />

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
          Foto actualizada.
        </p>
      )}
    </div>
  );
}
