/**
 * Shared return shape for the per-entity upload Server Actions
 * (speakers photo, exhibitors logo, …). Kept in a tiny standalone
 * module so both the action files and the generic uploader Client
 * Component can import the type without dragging server-only code
 * into the client bundle.
 */
export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };
