import { Middleware } from "../core/types";

export function allowIf<Ctx>(
  predicate: (ctx: Ctx) => boolean,
): Middleware<Ctx> {
  return async (ctx) => {
    if (!predicate(ctx)) {
      return {
        decision: { type: "deny" },
      };
    }
  };
}
