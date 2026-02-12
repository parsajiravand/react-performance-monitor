# Tracking Tags

Assign human-friendly identifiers to interactive elements so the HUD shows meaningful labels. You can use `data-rpm-id` / `data-rpm-group` explicitly, or rely on **automatic resolution** from common attributes and content.

## Automatic Resolution (No Attributes Required)

The tracker resolves interaction IDs from many sources without requiring `data-rpm-id`:

| Source | Example |
|--------|---------|
| Button/link text | `<button>Load users</button>` → `"Load users"` |
| `id` | `<input id="search-filter" />` → `"search-filter"` |
| `aria-label` | `<button aria-label="Close">×</button>` → `"Close"` |
| `placeholder` | `<input placeholder="Search..." />` → `"Search..."` |
| `data-testid` | `<button data-testid="submit-btn">Submit</button>` → `"submit-btn"` |
| `name` (form controls) | `<input name="email" />` → `"email"` |

Labels are truncated to 30 characters. If none match, the element `tagName` is used (`button`, `input`, etc.).

## data-rpm-id

Use `data-rpm-id` on the element that the user interacts with (or a parent). The value becomes the **Last Interaction** label in the HUD.

```tsx
<button data-rpm-id="load-users">Load users</button>
<input data-rpm-id="search-query" placeholder="Search" />
<form data-rpm-id="submit-form" onSubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>
```

## data-rpm-group

Use `data-rpm-group` to tag a container. When the user interacts with any descendant, the group value is used as the interaction ID.

```tsx
<div data-rpm-group="auth-flow">
  <input type="email" />
  <input type="password" />
  <button>Sign in</button>
</div>
```

## Resolution Order

When an interaction occurs, the tracker resolves the ID in this order:

1. **Closest `[data-rpm-id]`** – Nearest ancestor (or self) with `data-rpm-id`
2. **Closest `[data-rpm-group]`** – Nearest ancestor (or self) with `data-rpm-group`
3. **Element `id`** – The interacted element’s `id` attribute
4. **`aria-label`** – Accessible label
5. **`placeholder`** – For `input` / `textarea`
6. **`data-testid`** – Common test identifier
7. **`name`** – For `input`, `select`, `textarea`
8. **Button/link text** – For `button`, `a`, `[role="button"]`, etc.
9. **Tag name** – Fallback to `button`, `input`, `form`, etc.

## Capture Phase

Listeners use the **capture phase** (`addEventListener(..., { capture: true })`), so the interaction is attributed even when events bubble through nested components or portals.

## Portals

Interactions inside React portals (e.g. modals) are still captured. The portal’s DOM is part of the same document, so `data-rpm-id` and `data-rpm-group` work as usual:

```tsx
// Inside a portal
<div data-rpm-group="modal-actions">
  <button data-rpm-id="modal-submit">Submit</button>
  <button data-rpm-id="modal-cancel">Cancel</button>
</div>
```

## Best Practices

- **Prefer automatic resolution** – Use `id`, `aria-label`, `placeholder`, or button text when possible; no extra attributes needed
- Use `data-rpm-id` when you need an explicit label that differs from the visible text
- Use `data-rpm-group` for section-level grouping when individual control labels don't matter
- Use short, descriptive values; avoid dynamic or random values for easier debugging
