"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  ImagePlus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import type { UploadResult } from "@/lib/admin/upload";

export type EntityOption = { id: string; slug: string; name: string };

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  slug: string | null; // matched or chosen
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  uploadedUrl?: string;
};

type Strings = {
  /** "Subir múltiples fotos" / "Subir múltiples logos" */
  triggerLabel: string;
  /** "Subir fotos en lote" / "Subir logos en lote" */
  modalTitle: string;
  /** "Arrastra fotos aquí…" / "Arrastra logos aquí…" */
  dropZoneText: string;
  /** "fotos" / "logos" — used in result count */
  assetPlural: string;
};

/**
 * Multi-file uploader generic over entity type. Drops or picks N
 * images, tries to auto-match each filename (sans extension) to an
 * entity slug, lets the admin fix unmatched files via a per-item
 * dropdown, then uploads sequentially.
 *
 * Series, not Promise.all: keeps us under Supabase Storage rate limits
 * and gives the user clear per-file progress.
 *
 * The `upload` Server Action is passed in by the caller — that's how
 * we stay shared between speakers (photo_url) and exhibitors
 * (logo_url) without conditional logic inside the component.
 */
export function BulkAssetUploader({
  entities,
  upload,
  strings,
}: {
  entities: EntityOption[];
  upload: (slug: string, formData: FormData) => Promise<UploadResult>;
  strings: Strings;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const slugSet = useMemo(
    () => new Set(entities.map((e) => e.slug)),
    [entities],
  );

  // Revoke object URLs when the component unmounts.
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (running) return;
    setOpen(false);
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
  };

  const addFiles = (files: FileList | File[]) => {
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const candidate = slugify(baseName);
      const matched = slugSet.has(candidate) ? candidate : null;
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        slug: matched,
        status: "pending",
      });
    }
    setItems((prev) => [...prev, ...next]);
  };

  const updateItem = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const startUpload = async () => {
    if (running) return;
    setRunning(true);
    for (const it of items) {
      if (!it.slug || it.status === "done") continue;
      updateItem(it.id, { status: "uploading", error: undefined });
      const fd = new FormData();
      fd.append("file", it.file);
      const result = await upload(it.slug, fd);
      if (result.ok) {
        updateItem(it.id, { status: "done", uploadedUrl: result.url });
      } else {
        updateItem(it.id, { status: "error", error: result.error });
      }
    }
    setRunning(false);
    router.refresh();
  };

  const readyCount = items.filter((it) => it.slug && it.status !== "done").length;
  const unmatchedCount = items.filter((it) => !it.slug).length;
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-franja-turquoise px-3 py-1.5 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark"
      >
        <Upload size={12} strokeWidth={2.5} />
        {strings.triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-asset-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-franja-border bg-franja-bg-elevated shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-franja-border px-5 py-3">
              <div className="space-y-0.5">
                <h2
                  id="bulk-asset-title"
                  className="text-sm font-medium text-franja-text-primary"
                >
                  {strings.modalTitle}
                </h2>
                <p className="text-xs text-franja-text-muted">
                  Si el archivo se llama igual que un slug, lo vinculo automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={running}
                className="rounded-md p-1 text-franja-text-muted transition hover:bg-white/5 hover:text-franja-text-primary disabled:opacity-40"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
                  isDragging
                    ? "border-franja-turquoise bg-franja-turquoise/5"
                    : "border-franja-border bg-franja-bg/40 hover:border-franja-turquoise/40"
                }`}
              >
                <ImagePlus
                  size={24}
                  className="text-franja-text-muted"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-franja-text-primary">
                  {strings.dropZoneText}
                </p>
                <p className="text-xs text-franja-text-muted">
                  PNG, JPG, WebP — hasta 8 MB cada una
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center gap-3 rounded-lg border border-franja-border bg-franja-bg/40 p-2.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.previewUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md bg-white object-contain"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p
                          className="truncate text-xs text-franja-text-primary"
                          title={it.file.name}
                        >
                          {it.file.name}
                        </p>
                        {it.slug ? (
                          <p className="inline-flex items-center gap-1 text-[11px] text-franja-turquoise">
                            <CheckCircle2 size={10} />
                            Vinculado a <span className="font-mono">{it.slug}</span>
                          </p>
                        ) : (
                          <EntityPicker
                            entities={entities}
                            value={it.slug}
                            onChange={(slug) => updateItem(it.id, { slug })}
                          />
                        )}
                        {it.error && (
                          <p className="inline-flex items-center gap-1 text-[11px] text-franja-pink">
                            <AlertCircle size={10} />
                            {it.error}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {it.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            disabled={running}
                            className="rounded-md p-1 text-franja-text-muted transition hover:bg-white/5 hover:text-franja-pink disabled:opacity-40"
                            aria-label="Quitar"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        {it.status === "uploading" && (
                          <Loader2
                            size={14}
                            className="animate-spin text-franja-text-muted"
                          />
                        )}
                        {it.status === "done" && (
                          <CheckCircle2 size={14} className="text-franja-turquoise" />
                        )}
                        {it.status === "error" && (
                          <AlertCircle size={14} className="text-franja-pink" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-franja-border px-5 py-3">
              <p className="text-xs text-franja-text-muted">
                {items.length === 0
                  ? "Sin archivos"
                  : `${doneCount} ${strings.assetPlural} subidos · ${unmatchedCount} sin vincular`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={running}
                  className="rounded-md border border-franja-border px-3 py-1.5 text-xs text-franja-text-muted transition hover:border-franja-border-strong hover:text-franja-text-primary disabled:opacity-40"
                >
                  {running ? "Subiendo…" : doneCount > 0 ? "Cerrar" : "Cancelar"}
                </button>
                <button
                  type="button"
                  onClick={startUpload}
                  disabled={running || readyCount === 0}
                  className="inline-flex items-center gap-2 rounded-md bg-franja-turquoise px-3 py-1.5 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark disabled:bg-franja-turquoise/40"
                >
                  {running ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} strokeWidth={2.5} />
                  )}
                  Subir {readyCount > 0 ? `(${readyCount})` : ""}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function EntityPicker({
  entities,
  value,
  onChange,
}: {
  entities: EntityOption[];
  value: string | null;
  onChange: (slug: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-franja-text-muted">Vincular con:</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-md border border-franja-border bg-franja-bg/60 px-2 py-1 text-[11px] text-franja-text-primary outline-none transition focus:border-franja-turquoise"
      >
        <option value="">— seleccionar —</option>
        {entities.map((e) => (
          <option key={e.id} value={e.slug}>
            {e.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Mirror the slug convention used by the seed migration: kebab-case,
 * accent-stripped, lowercase, only [a-z0-9-]. The DB uses unaccent(...)
 * for the same purpose so this matches what's in the slug column.
 */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
