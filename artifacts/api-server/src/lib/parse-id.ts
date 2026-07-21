/**
 * Safely parse a route parameter (string or string[]) into an integer ID.
 */
export function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}
