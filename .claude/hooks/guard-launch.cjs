#!/usr/bin/env node
/* ============================================================================
 * K-RoadTrip — launch hard-guard (PreToolUse hook)
 *
 * settings.json "ask"/"deny" rules are advisory and can be bypassed (Write vs
 * Edit, arg reordering, alternate spellings). This hook enforces the two
 * non-negotiable launch hard-rules from CLAUDE.md §5 at the tool-call level:
 *
 *   (1) NO autonomous writes to supabase/migrations/**  (production DB schema)
 *   (2) NO production deploy commands  (vercel --prod / promote, vc --prod, …)
 *
 * A blocked call exits with code 2 — Claude Code treats that as a hard block
 * and feeds the stderr message back to the model.
 *
 * Human override (deliberate, per-action): set the matching env var in the
 * OPERATOR's shell before the action. That downgrades the hard block to the
 * normal settings.json "ask" prompt (it does NOT auto-approve):
 *     migrations  →  KRT_ALLOW_MIGRATIONS=1
 *     prod deploy →  KRT_ALLOW_PROD_DEPLOY=1
 * Claude cannot set these for itself; only the human operator's shell can.
 * ========================================================================== */

const FILE_KEYS = ["file_path", "notebook_path", "path"];

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    // Never hang the tool pipeline if stdin is empty for some reason.
    const t = setTimeout(() => resolve(data), 2000);
    if (typeof t.unref === "function") t.unref();
  });
}

/** Hard block: stderr is shown to Claude, exit 2 cancels the tool call. */
function block(reason) {
  process.stderr.write(reason + "\n");
  process.exit(2);
}

function truthy(v) {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s !== "" && s !== "0" && s !== "false" && s !== "no";
}

(async () => {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    // Unparseable input → nothing identifiable to guard. Fail open so we never
    // brick an entire session over a malformed/absent payload.
    process.exit(0);
  }

  const tool = payload.tool_name || "";
  const input = payload.tool_input || {};

  // ── Rule (1): production DB schema (supabase/migrations/**) ───────────────
  if (/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(tool)) {
    const target = FILE_KEYS.map((k) => input[k]).find(Boolean) || "";
    const norm = String(target).replace(/\\/g, "/");
    if (/(^|\/)supabase\/migrations\//i.test(norm)) {
      if (truthy(process.env.KRT_ALLOW_MIGRATIONS)) {
        process.stderr.write(
          "[launch-guard] KRT_ALLOW_MIGRATIONS set — deferring to the normal approval prompt.\n"
        );
        process.exit(0);
      }
      block(
        "BLOCKED by K-RoadTrip launch-guard (hard rule): writing to supabase/migrations/ " +
          "alters the PRODUCTION DB schema.\n" +
          "CLAUDE.md §5 forbids changing migrations/prod DB without explicit human approval.\n" +
          "If the operator approves: set KRT_ALLOW_MIGRATIONS=1 in their shell, then re-run.\n" +
          "Target: " +
          target
      );
    }
  }

  // ── Rule (2): production deploy commands ──────────────────────────────────
  if (tool === "Bash") {
    const cmd = String(input.command || "");
    const isProdDeploy =
      /\b(npx\s+)?(vercel|vc)\b[^\n|;&]*--prod(uction)?\b/i.test(cmd) ||
      /\b(npx\s+)?(vercel|vc)\s+promote\b/i.test(cmd);
    if (isProdDeploy) {
      if (truthy(process.env.KRT_ALLOW_PROD_DEPLOY)) {
        process.stderr.write(
          "[launch-guard] KRT_ALLOW_PROD_DEPLOY set — deferring to the normal approval prompt.\n"
        );
        process.exit(0);
      }
      block(
        "BLOCKED by K-RoadTrip launch-guard (hard rule): production deploy command detected.\n" +
          "Launching to production is a human-gated action and must not run autonomously (CLAUDE.md).\n" +
          "The operator should deploy it themselves, or set KRT_ALLOW_PROD_DEPLOY=1 and re-run.\n" +
          "Command: " +
          cmd
      );
    }
  }

  process.exit(0);
})();
