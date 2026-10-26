/** Only same-origin relative paths are allowed as return-to targets. */
export function safeRedirect(v: unknown, fallback = "/dashboard"): string {
  if (typeof v !== "string" || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return fallback;
  return v;
}
