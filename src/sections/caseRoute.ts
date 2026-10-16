// A project's case opens in place under its own hash, so it can be linked, and Back closes it.
export const CASE_PREFIX = '#projects/'

export const caseHash = (id: string) => `${CASE_PREFIX}${id}`

/** The project id a hash names, or null when it names none of `ids`. */
export function parseCaseHash(hash: string, ids: readonly string[]): string | null {
  if (!hash.startsWith(CASE_PREFIX)) return null
  // The hash comes from any link: a malformed escape (e.g. "%E0%A4%A") must not throw.
  let id: string
  try { id = decodeURIComponent(hash.slice(CASE_PREFIX.length)) } catch { return null }
  return ids.includes(id) ? id : null
}
