# Campus Connect role palettes

The role color scheme follows the supplied Campus Connect concept. Update `src/styles/theme.css` to change colors; components use semantic utilities instead of individual brand hex values.

| Color       | Hex       | Role                                           |
| ----------- | --------- | ---------------------------------------------- |
| Bright Blue | `#2F80ED` | Buyer primary brand                            |
| Deep Navy   | `#16324F` | Buyer secondary actions                        |
| Warm Yellow | `#F2C94C` | Seller primary actions                         |
| Muted Gray  | `#64748B` | Seller secondary actions and shared muted text |
| Off-white   | `#F8FAFC` | Shared page background                         |
| Dark Text   | `#1F2937` | Shared body text and yellow button labels      |

Public, buyer, and authentication screens use `.buyer-theme`; seller pages and seller onboarding use `.seller-theme`. The root defaults to the buyer palette for loading and error boundaries.

Use `bg-primary-action text-primary-foreground` for primary controls, `text-primary-text` for links, and `bg-primary-soft text-primary-text` for selected items. Use `bg-secondary text-secondary-foreground` for secondary buttons. Role-aware focus indicators use `primary-text`, including inside shared inputs and buttons. Shared messaging inherits the active role palette.

Buyer action fills and links use the darker blue `#2469C4` so normal-size white labels remain readable. Seller links and focus indicators use `#725A12`; yellow remains the primary action fill rather than text on white. Hover shades and soft backgrounds are derived from the role palette. Error, warning, and verification status colors retain their separate meanings.

[Editable Figma palette and control samples](https://www.figma.com/design/aauB4OfTxYqJODmchiqbyb?node-id=4-2).

The ImageToCode color reference is saved at `design/role-palette-reference.png`. It is a design artifact, not a runtime website asset. Figma and code use the contrast-safe action shades described above.

## Image generation prompt

Generated with the built-in `image_gen` tool:

```text
Use case: ui-mockup. Create one large, readable UI color specification detail for the existing Campus Connect marketplace, using the user's supplied exact palette. Two large role samples side by side on off-white #F8FAFC: Buyer uses Bright Blue #2F80ED for solid action buttons with white text, Deep Navy #16324F for navigation and secondary actions, Dark Text #1F2937. Seller uses Warm Yellow #F2C94C for solid action buttons with Dark Text #1F2937, Muted Gray #64748B for secondary navigation and actions, same off-white background. Include role title, four readable labeled swatches with exact hex labels, one primary button 'Browse listings' or 'Add listing', one understated link, one selected navigation item and one simple outlined input per role. Yellow is never used as text on white. Buyer links use a darker readable blue. Flat UI, modest corner rounding, no new website layout, no photographs, no invented metrics, no gradients. This is a precise palette/control reference, not a full page redesign.
```
