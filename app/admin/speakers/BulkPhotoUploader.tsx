"use client";

import {
  BulkAssetUploader,
  type EntityOption,
} from "@/components/admin/BulkAssetUploader";
import { uploadSpeakerPhotoAction } from "./actions";

/**
 * Thin speaker-specific wrapper around the generic uploader. Lives
 * here so the page.tsx import stays stable; all of the heavy lifting
 * is in components/admin/BulkAssetUploader.tsx.
 */
export function BulkPhotoUploader({ speakers }: { speakers: EntityOption[] }) {
  return (
    <BulkAssetUploader
      entities={speakers}
      upload={uploadSpeakerPhotoAction}
      strings={{
        triggerLabel: "Subir múltiples fotos",
        modalTitle: "Subir fotos en lote",
        dropZoneText: "Arrastra fotos aquí o click para seleccionar",
        assetPlural: "fotos",
      }}
    />
  );
}
