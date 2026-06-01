// Re-export slug-scoped actions so the edit page can `.bind(null, slug)`
// without reaching into ../actions. Keeps the page-level imports tidy.
export { deleteExhibitorAction, updateExhibitorAction } from "../actions";