# Tracking Tags

Assign human-friendly identifiers to interactive elements so the HUD shows meaningful labels instead of generic fallbacks.

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
4. **Tag name** – Fallback to `button`, `input`, `form`, etc.

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

- Use short, descriptive IDs: `load-users`, `filter-list`, `submit-form`
- Prefer `data-rpm-id` for specific controls and `data-rpm-group` for sections
- Avoid dynamic or random values; keep IDs stable for easier debugging
