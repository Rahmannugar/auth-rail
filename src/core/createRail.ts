import { Middleware, Rail, RailOptions } from "./types";
import { executeMiddleware } from "./execute";

export function createRail<Ctx>(
  name: string,
  middleware: Middleware<Ctx>[],
  options?: RailOptions,
): Rail<Ctx> {
  return {
    name,
    async evaluate(ctx: Ctx) {
      return executeMiddleware(name, middleware, ctx, options);
    },
  };
}
