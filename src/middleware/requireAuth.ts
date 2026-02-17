import type { Middleware } from "../core/types";

export function requireAuth<Ctx extends { user: unknown | null }>(
  redirectTo: string,
): Middleware<Ctx> {
  async function requireAuthMiddleware(ctx: Ctx) {
    if (!ctx.user) {
      return {
        decision: {
          type: "redirect",
          to: redirectTo,
        } as const,
      };
    }
  }

  return requireAuthMiddleware;
}
