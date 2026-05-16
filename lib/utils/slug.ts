/**
 * Slugify Spanish strings — strips accents, collapses non-alphanumerics
 * into dashes. Used by admin forms when generating slugs from names.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop combining marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
