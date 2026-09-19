# SmartStock portfolio captures

These are the production screenshots to add to the main README after the V1.1 visual smoke test.

## Required captures

1. `dashboard.png` — Admin dashboard with inventory value, low-stock alerts, top products and recent movements visible.
2. `products.png` — Products table with realistic sample data, stock indicators and the main inventory actions visible.
3. `product-form.png` — New product dialog after the V1.1 sizing fix, showing the full form without horizontal scrolling.
4. `catalog.png` — Category and supplier management view.
5. `history.png` — Movement history showing IN/OUT chips, quantities, user and date.
6. `responsive.png` — Compact/mobile layout with the responsive navigation behavior visible.

## Capture rules

- Use the public production frontend, not localhost.
- Prefer a clean desktop viewport around 1440x900 for the first five captures.
- Do not expose passwords, tokens, environment variables, browser autofill, personal bookmarks or developer tools.
- Use demo/sample inventory data only.
- Keep the SmartStock navigation visible where it helps establish product identity.
- Capture UI states that contain enough data to explain the feature; avoid empty tables unless documenting an empty state.
- PNG is preferred for crisp UI text.

Once these files are committed under `docs/screenshots/`, the main README can include a compact visual tour without depending on external image hosting.
