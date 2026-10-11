# Bite Web — Product Spec (Antigravity / implementer brief)

Live: https://mybite.vercel.app · Repo: iamnotbasant/bite · Stack: Vite + React 19 + Tailwind.
Backend: Supabase project `bite-db` (shared with the Android app). Auth = persistent
browser UUID (`src/utils/device.ts`), no email login. Offline-first sync engine
(`src/utils/syncEngine.ts`). Native Mifflin-St Jeor formulas (`src/utils/targets.ts`).

## 1. No fake data — hard rule
- NEVER ship seed/sample/preloaded foods, logs, steps, streaks, weight, or expenditure.
- Empty states must be honest and offer "Create Food".
- Library/search shows ONLY user-created custom foods + foods the user actually logged (recents).
- Defaults (e.g. 2000 kcal target before profile setup) are fine — they are clearly defaults, not fake logs.

## 2. Custom food with PNG image
- "Create Food" form MUST let the user attach a food photo (PNG or JPG) via file picker.
- Downscale client-side to max 512px (canvas) and store as data URL in `imageUrl`
  (localStorage budget — keep it small).
- Display the image as a **rounded rectangle thumbnail** (`rounded-[14px]`, `object-cover`).
  NEVER render it in a circle / circular crop / circular frame.
- Show the thumbnail in: search results, Library list, log-portion step, logged meal rows.

## 3. Nutrition field parity
The "Create Food" form MUST contain every nutrition field the app tracks —
the same set shown in the Nutrition/Analytics section:
calories (kcal), protein (g), carbs (g), fat (g), fiber (g), sugar (g),
sodium (mg), saturated fat (g), trans fat (g), cholesterol (mg),
potassium (mg), calcium (mg), iron (mg) + serving/portion + name (+ brand optional).
- Logging a food scales ALL fields by quantity (not just calories/protein/carbs/fat).
- `FoodLibraryItem` / `MealItem` in `src/types/index.ts` already define these fields.

## 4. Responsive — real desktop layout, not a stretched phone
- Mobile (<1024px): single-column app UI, edge-to-edge, floating pill bottom nav.
- Desktop (lg+): a REAL wide layout using the space, e.g.:
  - Shell up to ~1120px, real multi-column grids (NOT one centered 480px column).
  - Dashboard: Daily Nutrition card spans 2/3, side column stacks
    Nutrition / Body Metrics / Habits cards.
  - Food Log: meal sections in 2 columns; Analytics/More: 2-column section grids.
  - Bottom nav stays a centered floating pill on desktop too.
- No horizontal overflow at 360px or 1440px. Test both.

## 5. Everything must work
- Build green (`npm run build`), tests pass (`npm test`).
- Verify on the LIVE URL with screenshots (mobile-width AND desktop-width)
  before calling it done. Never claim "done" from a local build alone.
