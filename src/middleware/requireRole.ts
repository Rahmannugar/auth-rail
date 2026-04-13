import type { Middleware } from "../core/types";

export function requireRole<Ctx extends { user?: { role: string } | null }>(
  role: string,
): Middleware<Ctx> {
  async function requireRoleMiddleware(ctx: Ctx) {
    if (!ctx.user || ctx.user.role !== role) {
      return {
        decision: {
          type: "deny",
          reason: "insufficient_role",
        } as const,
      };
    }
  }

  return requireRoleMiddleware;
}
