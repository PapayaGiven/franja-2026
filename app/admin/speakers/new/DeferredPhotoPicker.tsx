"use client";

import { useEffect, useState } from "react";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";
import { AssetUploader } from "@/components/admin/AssetUploader";

/**
 * Deferred-mode photo picker for the /admin/speakers/new flow. The
 * file is held locally and inlined in the form as `<input name="photo">`
 * — createSpeakerAction picks it up after the row is inserted (it
 * needs the new slug to compose the Storage path).
 */
export function DeferredPhotoPicker() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPickedName(file.name);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-franja-text-muted">
        Foto (opcional)
      </p>
      <AssetUploader
        preview={
          <SpeakerAvatar photoUrl={previewUrl} name={pickedName ?? "speaker"} size={100} />
        }
        accept="image/jpeg,image/png,image/webp,image/avif"
        idleHint="Arrastra una foto o click"
        onFile={handleFile}
        hasFile={Boolean(previewUrl)}
        name="photo"
      />
      {pickedName && (
        <p className="truncate text-[11px] text-franja-text-muted" title={pickedName}>
          Seleccionada: {pickedName}
        </p>
      )}
    </div>
  );
}
