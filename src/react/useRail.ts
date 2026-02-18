import { useEffect, useState, useRef } from "react";
import { Rail, RailResult } from "../core/types";

type Status = "idle" | "loading" | "done";

// Simple deep equality check for context objects
function deepEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) return true;

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !deepEqual(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}

function useStableContext<Ctx>(context: Ctx): Ctx {
  const ref = useRef(context);

  if (!deepEqual(ref.current, context)) {
    ref.current = context;
  }

  return ref.current;
}

export function useRail<Ctx>(rail: Rail<Ctx>, inputContext: Ctx) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RailResult<Ctx> | null>(null);

  // Stabilize the context so object literals don't cause infinite re-runs
  const stableContext = useStableContext(inputContext);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      const res = await rail.evaluate(stableContext);

      if (!cancelled) {
        setResult(res);
        setStatus("done");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [rail, stableContext]);

  return {
    status,
    decision: result?.decision,
    context: result?.context,
  };
}
