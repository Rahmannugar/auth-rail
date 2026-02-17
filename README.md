# AuthRail

<p align="center">
  <img src="images/authrail.png" alt="AuthRail Logo" width="140" />
</p>

<p align="center">
  <strong>Framework-agnostic, client-side policy engine for web applications.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/authrail">
    <img src="https://img.shields.io/npm/v/authrail.svg" alt="npm version" />
  </a>
  <a href="https://github.com/Rahmannugar/auth-rail/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/authrail.svg" alt="license" />
  </a>
</p>

## Table of Contents

- [Why AuthRail?](#why-authrail)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [React Integration](#react-integration)
- [Using the Core Engine in Any Environment](#using-the-core-engine-in-any-environment)
- [Built-in Middleware](#built-in-middleware)
- [Advanced Patterns](#advanced-patterns)
- [API Reference](#api-reference)
- [Debugging](#debugging)
- [Demo](#demo)
- [License](#license)

---

AuthRail enables composable middleware that evaluates authentication, authorization, and contextual rules before rendering UI, navigating routes, or exposing features.

It is deterministic, linear, framework-agnostic, and has **zero runtime dependencies**.

## Why AuthRail?

Modern frontend applications require more than simple route guards. You need a predictable policy pipeline that handles:

- **Composable access policies**: Stack rules (Auth -> Role -> Context).
- **Role-based UI gating**: Hide/show components based on permissions.
- **Deterministic execution**: No hidden control flow or complex state machines.
- **Explicit redirect signaling**: Policies emit redirect decisions; your application handles navigation.
- **Context enrichment**: Middleware can update context (e.g., fetch profile after auth).

## Installation

```bash
npm install authrail
```

### Peer Dependencies (for React)

If you are using the React adapter, ensure you have the following installed:

- `react ^18.0.0 || ^19.0.0`
- `react-dom ^18.0.0 || ^19.0.0`

---

## Core Concepts

AuthRail executes middleware sequentially in a pipeline. Middleware executes strictly in the order they appear in the array.

1. **Freeze Context**: The input context is treated as immutable.
2. **Run Middleware**: Each middleware returns a decision or context updates.
3. **Short-circuiting**: The engine stops at the first `deny` or `redirect` decision.
4. **Merge Enrichment**: Successful middleware can contribute new data to the context.
5. **Default Allow**: If no middleware rejects, the final result is `allow`.

---

## React Integration

### 1. Define a Rail

```typescript
import { createRail, requireAuth, requireRole } from "authrail";

type AppContext = {
  user: { id: string; role: "admin" | "user" } | null;
  subscription?: string;
};

export const adminRail = createRail<AppContext>("admin-area", [
  requireAuth("/login"),
  requireRole("admin"),
]);
```

### 2. Using `RailBoundary`

Wrap components to enforce policies declaratively.

```tsx
import { RailBoundary } from "authrail";

function Dashboard() {
  const { user } = useAuth(); // Your auth hook

  return (
    <RailBoundary
      rail={adminRail}
      context={{ user }}
      onRedirect={(to) => navigate(to)}
      fallback={<Spinner />}
      denied={<AccessDenied />}
    >
      <AdminPanel />
    </RailBoundary>
  );
}
```

### 3. Using `protect()` HOC

For route-level protection or component composition.

```tsx
import { protect } from "authrail";

const ProtectedAdmin = protect(
  adminRail,
  () => ({ user: getCurrentUser() }), // Context provider
  (to) => navigate(to), // Redirect handler
)(AdminPage);
```

### 4. Using `useRail()` Hook

For imperative decision making within a component.

```tsx
import { useRail } from "authrail";

function DeleteButton({ user }) {
  const { decision, status } = useRail(adminRail, { user });

  if (status === "loading") return <span>Checking permissions...</span>;
  if (decision?.type !== "allow") return null;

  return <button>Delete Record</button>;
}
```

---

## Using the Core Engine in Any Environment

The core engine is framework-neutral. It can run anywhere JavaScript runs—from the browser to the server (Node.js, Edge functions, etc.).

### Example: Client-Side Navigation

```typescript
const result = await adminRail.evaluate({ user });

if (result.decision.type === "redirect") {
  // Use your router's navigate function
  router.push(result.decision.to);
} else if (result.decision.type === "deny") {
  showAccessDenied();
}
```

### Example: API Authorization

AuthRail can be used as a policy layer before performing sensitive operations in a backend environment.

```typescript
const result = await adminRail.evaluate({
  user: req.user,
});

if (result.decision.type !== "allow") {
  return res.status(403).json({ error: "Forbidden" });
}
```

### Versatile Policy Enforcement

This makes AuthRail suitable for:

- **Permission enforcement** before database access.
- **Feature flag evaluation** across different platforms.
- **Role-based API protection**.
- **Consistent policy logic** shared between frontend and backend.

> **AuthRail is a decision engine.** It emits intents, and your application decides how to act on them.

## Built-in Middleware

| Middleware           | Description                                |
| :------------------- | :----------------------------------------- |
| `requireAuth(to)`    | Redirects if `ctx.user` is null/undefined. |
| `requireRole(role)`  | Denies if user role doesn't match.         |
| `allowIf(predicate)` | Denies if predicate returns `false`.       |
| `blockIf(predicate)` | Denies if predicate returns `true`.        |

---

## Advanced Patterns

### 1. Dynamic Context Enrichment

Middleware can do more than just gate access; it can fetch data and inject it into the application pipeline.

```typescript
const withUserPermissions = async (ctx) => {
  if (ctx.user) {
    const permissions = await api.getPermissions(ctx.user.id);
    return { context: { permissions } }; // This is merged into the rail result context
  }
};
```

### 2. Functional Middleware Factories

Create reusable middleware that accepts configuration.

```typescript
const requireFeature = (featureName: string) => {
  return allowIf((ctx) => ctx.features?.[featureName] === true);
};

// Usage
createRail("billing", [requireAuth("/login"), requireFeature("billing-v2")]);
```

### 3. Handling Multiple Paths

You can use `redirect` to handle complex branching logic directly in your policy.

```typescript
const onboardingRail = createRail("onboarding", [
  (ctx) => {
    if (!ctx.profile.hasCompletedBio)
      return { decision: { type: "redirect", to: "/onboarding/bio" } as const };
    if (!ctx.profile.hasSelectedPlan)
      return { decision: { type: "redirect", to: "/pricing" } as const };
  },
]);
```

---

## API Reference

### `createRail<Ctx>(name, middleware, options?)`

Initializes a new policy rail.

- `name`: A string identifier for debugging.
- `middleware`: An array of `Middleware` functions.
- `options`:
  - `debug`: Boolean to enable execution logging.

### `<RailBoundary />`

The primary React component for declarative protection.

- `rail`: The Rail instance to evaluate.
- `context`: The current application state.
- `fallback`: Component to show while evaluating (async).
- `denied`: Component to show if the decision is `deny`.
- `onRedirect`: Callback fired if the decision is `redirect`.

### `protect(rail, getContext, onRedirect, ...)`

High-Order Component for wrapping route components or library-level exports.

---

## Custom Middleware

You can easily create your own middleware to handle complex logic or context enrichment.

```typescript
const enrichmentMiddleware = async (ctx) => {
  if (ctx.user) {
    const details = await fetchUserDetails(ctx.user.id);
    return { context: { details } }; // Updates internal rail context
  }
};
```

---

## Debugging

Enable deterministic logging to trace decision-making in the console.

```typescript
createRail("admin", middleware, { debug: true });
```

**Example Output:**

```text
[AuthRail:admin] → requireAuthMiddleware
[AuthRail:admin] → requireRoleMiddleware
[AuthRail:admin] decision → allow
```

---

## FAQ

**Q: Can I use AuthRail with any framework?**  
A: Yes! While AuthRail is designed for the client-side and v1 has only a React Adapter, the core engine works in any JS environment. You can use it in Server Components or Middleware as long as you provide the relevant context.

**Q: How does AuthRail handle async middleware?**  
A: Every middleware is awaited. The pipeline execution is sequential, ensuring that context enrichment from one middleware is available to the next.

**Q: Does it support nested rails?**  
A: Since rails are just evaluation engines, you can easily call one rail inside another middleware, or combine them in your component logic.

**Q: What happens if no middleware returns a decision?**  
A: AuthRail defaults to `{ type: "allow" }`. We believe policies should be explicit about what they block, rather than blocking by default.

---

## Demo

A complete demo application with authentication, role gating, and policy toggling is available here:

👉 [https://github.com/Rahmannugar/authrail-demo](https://github.com/Rahmannugar/authrail-demo)

---

## License

MIT © [Rahmannugar](https://github.com/Rahmannugar)
