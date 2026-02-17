import { useEffect, useState } from "react";
import { Rail, RailResult } from "../core/types";

type Status = "idle" | "loading" | "done";

export function useRail<Ctx>(rail: Rail<Ctx>, inputContext: Ctx) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RailResult<Ctx> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      const res = await rail.evaluate(inputContext);

      if (!cancelled) {
        setResult(res);
        setStatus("done");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [rail, inputContext]);

  return {
    status,
    decision: result?.decision,
    context: result?.context,
  };
}
