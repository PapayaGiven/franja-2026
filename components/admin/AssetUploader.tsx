"use client";

import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

/**
 * Generic drag-and-drop / click-to-pick uploader for a single file.
 *
 * This is presentation + UX only — the parent decides what happens
 * with the file via `onFile`. Used in two flavors:
 *
 *   1. Edit pages: `onFile` invokes a Server Action immediately and
 *      flips `pending` so the spinner shows. The preview re-renders
 *      from the new URL once the action returns.
 *
 *   2. Create pages: `onFile` just remembers the File in component
 *      state (and syncs it into a hidden <input type="file" name=...>
 *      so it submits with the surrounding form). No async there.
 *
 * The preview is a render prop because the visual shape differs
 * between speakers (round avatar) and exhibitors (square white box).
 * Keeping it as a prop lets one component cover both without growing
 * a polymorphic prop surface.
 */
export function AssetUploader({
  preview,
  accept,
  pending = false,
  idleHint,
  uploadingHint = "Subiendo…",
  onFile,
  hasFile,
  name,
}: {
  preview: ReactNode;
  accept: string;
  pending?: boolean;
  idleHint: string;
  uploadingHint?: string;
  onFile: (file: File) => void;
  /** When true, render a "selected — click to replace" affordance. */
  hasFile?: boolean;
  /**
   * Optional name for the inner `<input type="file">`. When set, the
   * picked file submits with the surrounding form (deferred mode) and
   * we sync dropped files into `input.files` via DataTransfer. When
   * omitted (immediate mode) the parent handles the file out-of-band
   * and we clear the input after each pick so the same file can be
   * re-picked.
   */
  name?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const deferred = Boolean(name);

  const openPicker = () => inputRef.current?.click();

  return (
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
        if (!file) return;
        if (deferred && inputRef.current) {
          // Mirror the drop into the named input so it submits with
          // the surrounding form. (input.files is read-only via plain
          // assignment in older specs but writable from a DataTransfer
          // in all current browsers.)
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
        }
        onFile(file);
      }}
      onClick={openPicker}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      className={`group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition ${
        isDragging
          ? "border-franja-turquoise bg-franja-turquoise/5"
          : "border-franja-border bg-franja-bg-elevated/40 hover:border-franja-turquoise/40"
      }`}
    >
      {preview}

      {pending ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted">
          <Loader2 size={12} className="animate-spin" />
          {uploadingHint}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted">
          <ImagePlus size={12} />
          {hasFile ? "Click para reemplazar" : idleHint}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          if (!deferred) {
            // Immediate mode → clear so the same file fires onChange
            // again on next pick. Deferred mode KEEPS the file so the
            // surrounding form has it at submit time.
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
