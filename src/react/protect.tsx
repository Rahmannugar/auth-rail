import React from "react";
import type { Rail } from "../core/types";
import { RailBoundary } from "./RailBoundary";

export function protect<Ctx>(
  rail: Rail<Ctx>,
  getContext: () => Ctx,
  onRedirect?: (to: string) => void,
  fallback?: React.ReactNode,
  denied?: React.ReactNode,
) {
  return function <P extends object>(
    Component: React.ComponentType<P>,
  ): React.FC<P> {
    const Protected: React.FC<P> = (props) => {
      const context = getContext();

      return (
        <RailBoundary
          rail={rail}
          context={context}
          fallback={fallback}
          denied={denied}
          onRedirect={onRedirect}
        >
          <Component {...props} />
        </RailBoundary>
      );
    };

    Protected.displayName = `Protect(${Component.displayName || Component.name || "Component"})`;

    return Protected;
  };
}
