# AuthRail

<p align="center">
  <img src="https://res.cloudinary.com/thirtythree/image/upload/v1771337067/authrail-icon_umnwa4.png" alt="AuthRail Logo" width="140" />
</p>

<p align="center">
  <strong>Framework-agnostic client-side access control layer for web applications.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/authrail">
    <img src="https://img.shields.io/npm/v/authrail.svg" alt="npm version" />
  </a>
  <a href="https://github.com/Rahmannugar/auth-rail/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/authrail.svg" alt="license" />
  </a>
</p>

---

AuthRail enables composable middleware that evaluates authentication, authorization, and contextual rules before rendering UI, navigating routes, or exposing features. It is deterministic, linear, and framework-agnostic.

## Why AuthRail?

Modern frontend applications require more than simple route guards. You need a predictable policy pipeline that handles:

- **Composable access policies**: Stack rules (Auth -> Role -> Context).
- **Role-based UI gating**: Hide/show components based on permissions.
- **Deterministic execution**: No hidden control flow or complex state machines.
- **Explicit redirect control**: Control navigation at the policy level.
- **Context enrichment**: Middleware can update context (e.g., fetch profile after auth).

## Installation

```bash
npm install authrail
```

### Peer Dependencies (for React)

If you are using the React adapter, ensure you have the following installed:

- `react >= 18`
- `react-dom >= 18`

---

##  Core Concepts

AuthRail executes middleware sequentially in a pipeline.

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

## Vanilla Usage

AuthRail can be used in any environment (Node.js, Vanilla JS, etc.).

```typescript
const result = await adminRail.evaluate({ user: null });

if (result.decision.type === "redirect") {
  // Use your router's navigate function
  router.push(result.decision.to);
} else if (result.decision.type === "deny") {
  console.error("Access denied:", result.decision.reason);
}
```

---

##  Built-in Middleware

| Middleware           | Description                                |
| :------------------- | :----------------------------------------- |
| `requireAuth(to)`    | Redirects if `ctx.user` is null/undefined. |
| `requireRole(role)`  | Denies if user role doesn't match.         |
| `allowIf(predicate)` | Denies if predicate returns `false`.       |
| `blockIf(predicate)` | Denies if predicate returns `true`.        |

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

## License

MIT © [Rahmannugar](https://github.com/Rahmannugar)
