import type { Middleware } from "../core/types";

export function allowIf<Ctx>(
  predicate: (ctx: Ctx) => boolean,
): Middleware<Ctx> {
  async function allowIfMiddleware(ctx: Ctx) {
    if (!predicate(ctx)) {
      return {
        decision: {
          type: "deny",
        } as const,
      };
    }
  }

  return allowIfMiddleware;
}
