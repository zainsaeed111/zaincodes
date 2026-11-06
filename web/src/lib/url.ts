/** True only for real absolute http(s) URLs — treats "#", empty, and relative placeholders as absent. */
export function isPublicUrl(value?: string | null): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v || v === "#" || v.startsWith("#")) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
