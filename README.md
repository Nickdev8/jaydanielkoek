# Jayden Daniel Koek

This is a minimal SvelteKit + Threlte project.

- `/` is an empty Threlte canvas, ready for the next standalone 3D page.
- `/showcase` is the existing interactive poster showcase.

Each 3D route should own its scene files. For a new page, create a new folder under `src/routes`, add its own `+page.svelte`, and keep route-specific Threlte components in that same folder.

```bash
npm run dev
npm run check
npm run build
```
