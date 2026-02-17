import { Middleware } from "../core/types";

export function requireRole<Ctx extends { user: { role: string } | null }>(
  role: string,
): Middleware<Ctx> {
  return async (ctx) => {
    if (!ctx.user || ctx.user.role !== role) {
      return {
        decision: { type: "deny", reason: "insufficient_role" },
      };
    }
  };
}
