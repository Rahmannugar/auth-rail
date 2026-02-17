import { Middleware, RailResult, RailOptions } from "./types";

export async function executeMiddleware<Ctx>(
  railName: string,
  middleware: Middleware<Ctx>[],
  initialContext: Ctx,
  options?: RailOptions,
): Promise<RailResult<Ctx>> {
  let currentContext = { ...initialContext };

  for (const fn of middleware) {
    const middlewareName = fn.name || "anonymous";

    if (options?.debug) {
      console.log(`[AuthRail:${railName}] → ${middlewareName}`);
    }

    const result = await fn(Object.freeze({ ...currentContext }));

    if (result?.context) {
      currentContext = {
        ...currentContext,
        ...result.context,
      };

      if (options?.debug) {
        console.log(`[AuthRail:${railName}] enriched context`, result.context);
      }
    }

    if (result?.decision) {
      if (options?.debug) {
        console.log(`[AuthRail:${railName}] decision →`, result.decision);
      }

      return {
        decision: result.decision,
        context: currentContext,
      };
    }
  }

  if (options?.debug) {
    console.log(`[AuthRail:${railName}] decision → allow`);
  }

  return {
    decision: { type: "allow" },
    context: currentContext,
  };
}
