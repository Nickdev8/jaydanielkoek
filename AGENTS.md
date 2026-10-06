# Project checkpoint

- Svelte 5 / SvelteKit portfolio, with Threlte for the gallery.
- Routes: `/` (hero, biography, projects), `/over`, `/contact`, `/showcase/all`.
- Edit biography, hero, project photographs/descriptions and contact links in `src/lib/site/content.ts`. Biography and email are intentional template content.
- Gallery positions and image URLs live in `showcase.categories.json`; photographs currently live in `static/images/`.
- Shared typography and colors: `src/lib/site/site.css`. Fonts and their OFL licenses are hosted in `static/fonts/`.
- The shared menu uses a native dialog. Its context state pauses gallery input and clears held keys and drag velocity.
- The homepage hero header stays at the page top. After 104px of scrolling, a compact fixed header shows the name on the left and Menu on the right (56px desktop, 52px mobile).
- The gallery minimap uses shared world X/Z layout helpers in `src/lib/showcase/layout.ts` and live scene camera bindings. It sits bottom-left. Mobile navigation uses dragging; the joystick is removed.
- The showcase has a 3D view and a photo-grid fallback. The grid groups by exact step and sorts posters by angle within each group.
- Poster proximity fades use hashed coverage with depth writes to preserve poster and floor reflection order. The camera stops at `distanceByStep[3]`.
- Homepage projects are non-linked image/text rows with a right-edge fade into white; numbered editorial rows use overlapping titles and placeholder Lorem ipsum; titles and descriptions live in `src/lib/site/content.ts`.
- The home biography lazily loads the existing camera and lens models in a small, on-demand Threlte canvas. Rotate the model group, not the scene camera, to change its angle.
- Site text is Dutch. Keep the single merged gallery; model credits and lens selection routes are removed.
- Use lean-coding for implementation. Preserve user edits and keep updates concise. Do not add Copilot author/co-author trailers to commits.
- Commands: `npm run dev`, `npm run check`, `npm run build`.
- Verified 2026-10-05: Svelte checks (zero errors/warnings), production build, desktop/mobile navigation, viewer keyboard controls/focus, gallery pause/held-key handling, legacy redirects and joystick removal. Build retains the large Three.js gallery chunk warning. No implementation blockers.

- Verified 2026-10-06: homepage project rows and descriptions; Svelte checks pass with zero errors/warnings.
