---
applyTo: '**'
---

# Coding Preferences
- Prefer minimal DOM overlays in index.html; wire behavior in src/inventory.ts (InventoryManager).
- Use small, surgical patches; keep existing UI styling tokens (Courier New, existing rgba backgrounds, #333/#444 borders).
- Validate changes via `npm run build` (Vite + TS).

# Project Architecture
- Vite + TypeScript + Three.js game with DOM UI overlay.
- Inventory UI is implemented as HTML/CSS in index.html and controlled by InventoryManager in src/inventory.ts.

# Solutions Repository
- Drag UI issues: ensure drag ghost never intercepts clicks (pointer-events: none) and end drags on global mouseup.
