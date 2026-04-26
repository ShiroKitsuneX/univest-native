# UniVest Visual Redesign — Plan & Status

This is a multi-session plan for redesigning the UniVest visual layer. The goal
is a slim, professional, modern look anchored on **purple as the primary
accent**, while preserving every product invariant from `APP_MAP.md` and every
architectural rule in `AI_RULES.md`.

> **Hard constraint**: This redesign changes how the app looks. It does not
> change how it behaves. No store action, repository, navigation route,
> Firestore field, or product concept is altered as part of these phases.

---

## Design language (locked)

Synthesised from `inspiration/`. These choices guide every subsequent phase.

### Colour
- **Primary**: `#7C5CFF` (vivid violet 500). Used for:
  - Filled primary buttons
  - Active tab pill background
  - Selected chip / segmented control
  - Active link / focus ring
  - Counters, badges, single-glyph CTAs
- **Primary hover/press**: `#6D4DEF` (violet 600 — only on touchables)
- **Primary glow**: `rgba(124, 92, 255, 0.32)` for soft shadows on primary surfaces
- **Surfaces (dark)**:
  - `bg`: `#0B0B12` (near-black with violet undertone, not pure black)
  - `card`: `#15151F`
  - `card2`: `#1C1C2A`
  - `border`: `#23233A`
- **Surfaces (light)**:
  - `bg`: `#F6F4FB` (lavender-tinted off-white)
  - `card`: `#FFFFFF`
  - `card2`: `#F0EEFA`
  - `border`: `#E4E1F0`
- **Tag families** keep the same five buckets (`alert`, `lista`, `nota`,
  `simulado`, `news`) but recolour to harmonise with the new violet primary.

### Radius
- `radius.sm` = 10 (chips, small pills)
- `radius.md` = 14 (buttons, inputs, tight cards)
- `radius.lg` = 18 (default cards)
- `radius.xl` = 22 (hero cards)
- `radius.full` = 999 (avatars, pill toggles)

### Spacing scale (4px base)
- `space.xxs` = 4
- `space.xs` = 8
- `space.sm` = 12
- `space.md` = 16
- `space.lg` = 20
- `space.xl` = 24
- `space.xxl` = 32

### Typography (system font stack, via React Native default)
- `display` 32 / 800 / -0.5 letter-spacing — hero greetings ("Hello, Anna 👋")
- `title` 22 / 800 — screen titles
- `headline` 17 / 800 — card titles, section headlines
- `body` 14 / 500 — default reading
- `caption` 12 / 600 — subtitles, metadata
- `eyebrow` 10 / 700 / 0.8 letter-spacing / uppercase — section labels (already
  the `useLabelStyle` shape)

### Elevation (shadows)
- `elev.card` — soft 1-step card shadow (rgba 0 / 0 / 0 / 0.06, 8px blur)
- `elev.float` — floating UI shadow (sheets, popovers)
- `elev.primary` — coloured shadow for primary buttons (uses `primary.glow`)

### Component motifs
- Filled primary buttons: full-width, `radius.md`, `primary` background, white
  text, `elev.primary` shadow.
- Secondary / cancel buttons: `card2` background, `border` outline, muted text.
- Pill chips: `radius.full`, 6px vertical / 14px horizontal padding. Active =
  `primary` bg + white text; inactive = `card2` bg + `sub` text.
- Cards: `card` bg, `radius.lg`, 1px `border` outline, 16px padding (most), no
  shadow by default — shadow opt-in via `elev.card` for highlighted surfaces.
- Avatars: circle with `radius.full`, optional `primary` ring 2-2.5px when
  active/unviewed.
- Tab bar: pill behind the active icon, `acBg` colour. No background tint on
  inactive tabs.

---

## Phasing

Order matters. Each phase is independently shippable. After every phase the
app must build, type-check, and pass tests; no behaviour changes.

| Phase | Scope | Status |
|---|---|---|
| **1. Foundation tokens** | New `palette.ts` values; new `radius.ts`, `space.ts`, `typography.ts`, `elevation.ts`. `useTheme` exposes the full token bag. `useCardStyle`/`useLabelStyle` use new tokens. | ✅ Done (this session) |
| **2. Shared primitives** | Extract `<Button>`, `<Pill>`, `<Avatar>`, `<Card>`, `<SectionHeader>`, `<StatBlock>` under `src/shared/components/`. Each consumes design tokens. No call-site migrations yet — keep both old and new working. | 🟡 Pending |
| **3. App shell** | `MainTabs` tab bar pill polish, `TabHeader` typography upgrade, `SplashScreen`, `WelcomeScreen` hero rewrite. | 🟡 Pending |
| **4. Feed tab** | Post cards, stories strip ring, countdown chips. Resolve the uncommitted hardcoded-colour drift in `FeedScreen` and `StoriesStrip`. | 🟡 Pending |
| **5. Explorar stack** | University list cards, detail hero, exams + books rows, following list. | 🟡 Pending |
| **6. Notas tab** | Hero stat block, chart card surround, grade list rows, cut-off list. | 🟡 Pending |
| **7. Perfil + Institution Admin** | Profile hero with avatar ring, stat row, action grid; institution admin field rows. | 🟡 Pending |
| **8. Modals pass** | `BottomSheet` shell drag handle + header standardisation; per-modal alignment. | 🟡 Pending |
| **9. Onboarding** | Step indicator, course chips, university cards in pick step. | 🟡 Pending |
| **10. Polish** | Empty states, loading skeletons, subtle micro-interactions on the active tab and primary buttons (Animated). | 🟡 Pending |

---

## Per-phase rules

1. **Read this file at the start of every redesign session** — it's the source
   of truth for which phase is in progress and which colour or token to use.
2. **Don't edit shared tokens (`palette.ts`, `radius.ts`, etc.) inside a
   non-foundation phase.** If a screen needs a new token, propose it back to
   Phase 1 and update the token source.
3. **Every PR touches one phase.** Don't combine token changes with screen
   migrations in the same diff — they look similar in review and fail
   differently.
4. **Verification per phase**:
   - `npx tsc --noEmit` clean
   - `npx jest` passes
   - Manual smoke: each touched screen renders in both `theme: 'dark'` and
     `theme: 'light'` and on both common-user and institution-user accounts
     where applicable.
5. **Don't introduce new dependencies** (no `react-native-reanimated`, no
   gradient libs) without an explicit sign-off — react-native's `Animated`
   plus `View` + linear `backgroundColor` rgba layering is enough for what we
   want.

---

## Phase 1 deliverables — done

This session laid the foundation. Specifics:

- [`src/theme/tokens.ts`](../src/theme/tokens.ts) — `radius`, `space`,
  `typography`, `elevation` constant maps (theme-independent).
- [`src/theme/palette.ts`](../src/theme/palette.ts) — refined `DK` / `LT`
  colour rolls, purple primary at `#7C5CFF`, lavender-tinted neutrals.
  `ThemeColors` shape unchanged; existing consumers keep working.
- [`src/theme/useTheme.ts`](../src/theme/useTheme.ts) — exposes a richer
  `ThemeResult` that includes `tokens` (the shared maps) and `shadow.card` /
  `shadow.primary` ready-made platform-correct shadow objects.
- [`src/theme/styles.ts`](../src/theme/styles.ts) — `useCardStyle` /
  `useLabelStyle` now read from the new tokens (still drop-in compatible).

Every existing screen now picks up the new colour palette without any other
edit. Once Phase 1 ships, screens will look noticeably more "purple" and
slightly softer; behaviour is identical.

---

## Where each shared concept lives

Per `ARCHITECTURE.md`:
- `src/theme/*` — design tokens + theme hooks. Pure UI. No store, no Firebase.
- `src/shared/components/*` (Phase 2 onward) — primitives that are app-wide
  and stateless. Read tokens via `useTheme`.
- `src/components/*` — kept for components that already exist there
  (`BottomSheet`, `SBox`, `StoriesStrip`, etc.). New shared primitives go
  under `src/shared/components/`.

---

## Open decisions (defer)

- **Custom font?** System font is fine for v1 of the redesign. Re-evaluate
  after Phase 4. If we add one, Inter or Geist via `expo-font` and one
  `@expo-google-fonts/*` package — single dep.
- **Gradient backgrounds?** The hero in InstitutionAdmin uses a flat
  university colour. We can move to a 2-stop linear gradient after Phase 4.
  Use `react-native-linear-gradient` (or stick with stacked `View`s if we
  want to avoid the dep).
- **Light mode default?** Currently `theme: 'dark'` in `profileStore` initial
  state. Keep dark-default; `useColorScheme` already wires `theme: 'auto'`.
- **Reanimated**? Only if Phase 10 reveals a real need.
