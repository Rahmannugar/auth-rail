import type { Middleware } from "../core/types";

export function blockIf<Ctx>(
  predicate: (ctx: Ctx) => boolean,
): Middleware<Ctx> {
  async function blockIfMiddleware(ctx: Ctx) {
    if (predicate(ctx)) {
      return {
        decision: {
          type: "deny",
        } as const,
      };
    }
  }

  return blockIfMiddleware;
}
