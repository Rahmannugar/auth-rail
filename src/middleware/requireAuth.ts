import { Middleware } from "../core/types";

export function requireAuth<
  Ctx extends { user: unknown | null },
>(): Middleware<Ctx> {
  return async (ctx) => {
    if (!ctx.user) {
      return {
        decision: { type: "redirect", to: "/login" },
      };
    }
  };
}
