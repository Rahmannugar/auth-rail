import { Middleware, RailResult, Decision } from "./types";

export async function executeMiddleware<Ctx>(
  middleware: Middleware<Ctx>[],
  initialContext: Ctx,
): Promise<RailResult<Ctx>> {
  let index = -1;
  let currentContext = { ...initialContext };

  async function dispatch(
    i: number,
  ): Promise<{ decision?: Decision; context?: Partial<Ctx> }> {
    if (i <= index) {
      throw new Error("next() called multiple times");
    }

    index = i;

    const fn = middleware[i];

    if (!fn) {
      return {};
    }

    const result = await fn(Object.freeze({ ...currentContext }), async () =>
      dispatch(i + 1),
    );

    if (result?.context) {
      currentContext = {
        ...currentContext,
        ...result.context,
      };
    }

    return result || {};
  }

  const finalResult = await dispatch(0);

  return {
    decision: finalResult.decision ?? { type: "allow" },
    context: currentContext,
  };
}
