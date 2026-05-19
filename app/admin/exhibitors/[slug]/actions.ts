// Re-export the slug-scoped action so the edit page can `.bind(null, slug)`
// without reaching into ../actions. Keeps the page-level imports tidy.
export { updateExhibitorAction } from "../actions";
