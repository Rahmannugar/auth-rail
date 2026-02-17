import { Middleware, RailResult } from "./types";

export async function executeMiddleware<Ctx>(
  middleware: Middleware<Ctx>[],
  initialContext: Ctx,
): Promise<RailResult<Ctx>> {
  let currentContext = { ...initialContext };

  for (const fn of middleware) {
    const result = await fn(Object.freeze({ ...currentContext }));

    if (result?.context) {
      currentContext = {
        ...currentContext,
        ...result.context,
      };
    }

    if (result?.decision) {
      return {
        decision: result.decision,
        context: currentContext,
      };
    }
  }

  return {
    decision: { type: "allow" },
    context: currentContext,
  };
}
