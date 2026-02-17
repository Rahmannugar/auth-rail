export type Decision =
  | { type: "allow" }
  | { type: "deny"; reason?: string }
  | { type: "redirect"; to: string };

export type MiddlewareResult<Ctx> = {
  decision?: Decision;
  context?: Partial<Ctx>;
};

export type Middleware<Ctx> = (
  ctx: Readonly<Ctx>,
) => Promise<MiddlewareResult<Ctx> | void>;

export type RailResult<Ctx> = {
  decision: Decision;
  context: Ctx;
};

export type Rail<Ctx> = {
  name: string;
  evaluate(ctx: Ctx): Promise<RailResult<Ctx>>;
};
