import { Middleware, Rail } from "./types";
import { executeMiddleware } from "./execute";

export function createRail<Ctx>(
  name: string,
  middleware: Middleware<Ctx>[],
): Rail<Ctx> {
  return {
    name,
    async evaluate(ctx: Ctx) {
      return executeMiddleware(middleware, ctx);
    },
  };
}
