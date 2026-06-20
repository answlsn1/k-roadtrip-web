// Founder-only allowlist for the private /admin/metrics dashboard.
// Override with ADMIN_EMAILS (comma-separated) in the environment if needed.
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "answlsn1@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
