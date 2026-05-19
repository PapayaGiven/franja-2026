"use client";

import {
  BulkAssetUploader,
  type EntityOption,
} from "@/components/admin/BulkAssetUploader";
import { uploadExhibitorLogoAction } from "./actions";

/**
 * Thin exhibitor-specific wrapper around the generic uploader.
 * Mirrors app/admin/speakers/BulkPhotoUploader.tsx.
 */
export function BulkLogoUploader({ exhibitors }: { exhibitors: EntityOption[] }) {
  return (
    <BulkAssetUploader
      entities={exhibitors}
      upload={uploadExhibitorLogoAction}
      strings={{
        triggerLabel: "Subir múltiples logos",
        modalTitle: "Subir logos en lote",
        dropZoneText: "Arrastra logos aquí o click para seleccionar",
        assetPlural: "logos",
      }}
    />
  );
}
