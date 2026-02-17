import React, { useEffect } from "react";
import { Rail } from "../core/types";
import { useRail } from "./useRail";

type Props<Ctx> = {
  rail: Rail<Ctx>;
  context: Ctx;
  fallback?: React.ReactNode;
  denied?: React.ReactNode;
  onRedirect?: (to: string) => void;
  children: React.ReactNode;
};

export function RailBoundary<Ctx>({
  rail,
  context,
  fallback = null,
  denied = null,
  onRedirect,
  children,
}: Props<Ctx>) {
  const { status, decision } = useRail(rail, context);

  useEffect(() => {
    if (decision?.type === "redirect" && onRedirect) {
      onRedirect(decision.to);
    }
  }, [decision, onRedirect]);

  if (status === "loading") return <>{fallback}</>;
  if (!decision) return null;
  if (decision.type === "redirect") return null;
  if (decision.type === "deny") return <>{denied}</>;

  return <>{children}</>;
}
