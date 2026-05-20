"use client";

import { useEffect, useState } from "react";
import { ExhibitorLogo } from "@/components/admin/ExhibitorLogo";
import { AssetUploader } from "@/components/admin/AssetUploader";

/**
 * Deferred-mode wrapper used on /admin/exhibitors/new — the file is
 * NOT uploaded immediately. It's stored in an inner hidden input
 * called `logo` that submits with the surrounding form;
 * createExhibitorAction reads it and runs the upload after the row
 * is inserted (it needs the new slug to compose the storage path).
 *
 * The preview is driven by a local object URL so the admin can see
 * what they picked before submitting.
 */
export function DeferredLogoPicker() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);

  // Revoke the object URL when it changes or on unmount so we don't
  // leak blob handles.
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
        Logo (opcional)
      </p>
      <AssetUploader
        preview={
          <ExhibitorLogo logoUrl={previewUrl} name={pickedName ?? "logo"} size={100} />
        }
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        idleHint="Arrastra un logo o click"
        onFile={handleFile}
        hasFile={Boolean(previewUrl)}
        name="logo"
      />
      {pickedName && (
        <p className="truncate text-[11px] text-franja-text-muted" title={pickedName}>
          Seleccionado: {pickedName}
        </p>
      )}
    </div>
  );
}
