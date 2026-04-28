# UniVest Visual Redesign — Plan & Status

A multi-session plan for redesigning the UniVest visual layer. The goal is a
**slim, professional, modern look** anchored on **purple as the primary
accent**, while preserving every product invariant from `APP_MAP.md` and
every architectural rule in `AI_RULES.md`.

> **Hard constraint**: This redesign changes how the app *looks*. It does not
> change how it *behaves*. No store action, repository, navigation route,
> Firestore field, or product concept changes as part of these phases.

---

## Why this redesign

UniVest is a vestibular-prep app. Its users are 17–19-year-old Brazilian
students under real pressure: scores, cut-off lines, university choices, and
a hard deadline. The current UI works but feels *administrative* — flat
neutrals, mixed accents, no visual hierarchy of "what's important right now".

A great prep app should feel:

- **Aspirational** — the university goal pulls the user forward.
- **Calm and confident** — reduces, not amplifies, exam anxiety.
- **Slightly playful** — this is a teenage audience, not a tax dashboard.
- **Data-rich but legible** — grades, percentile, cut-off deltas read at a
  glance.

The strongest inspiration reference (`inspiration/Captura de Tela 2026-04-26
às 02.53.54.png` — the lavender "Learning Overview" learning-app shot)
encodes all four. Our locked design language is its UniVest-specific
adaptation.

---

## Design language (locked)

### Colour

- **Primary**: `#7C5CFF` (violet 500). Used for:
  - Filled primary buttons
  - Active tab pill background
  - Selected chip / segmented control
  - Active link / focus ring
  - Counters, badges, single-glyph CTAs
  - Chart accent line / active bar
- **Primary press**: `#6D4DEF` (violet 600 — only on touchables)
- **Primary glow**: `rgba(124,92,255,0.32)` for soft shadows on primary
  surfaces (dark only — looks noisy on light).
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
  `simulado`, `news`), recoloured to harmonise with violet.

### Stat / domain accent palette (NEW)

Inspiration `02.53.54` has each stat card carrying its own soft pastel.
We do the same so the user can scan dashboards by colour. These are
**accent backgrounds for icons**, not text colour. Single source of truth in
`src/theme/tokens.ts` once Phase 2 lands.

| Domain      | Light accent | Dark accent | Use                                          |
|-------------|--------------|-------------|-----------------------------------------------|
| `progress`  | `#EDE9FE`    | `#1F1840`   | streaks, overall progress, hero stat          |
| `simulado`  | `#FCE7F3`    | `#2A0F24`   | mock-exam score cards, simulado history       |
| `notas`     | `#DBEAFE`    | `#101A3A`   | grades, performance charts                    |
| `goal`      | `#FEF3C7`    | `#2A1C00`   | goal universities, target cut-off, aspiration |
| `news`      | `#DCFCE7`    | `#0A2820`   | feed announcements, alerts                    |

### Chart palette (NEW)

Charts in Notas need a small ramp. Use:
- Active series: `BRAND.primary` (`#7C5CFF`)
- Average / baseline: `T.muted` at 60%
- Soft-fill bars (inactive): `T.acBg` (lavender)
- Streak / highlight pill: violet 500 with `T.acBg` halo

### Radius

- `radius.sm` = 10 (chips, small pills, icon tiles)
- `radius.md` = 14 (buttons, inputs, tight cards)
- `radius.lg` = 18 (default cards)
- `radius.xl` = 22 (hero cards)
- `radius.full` = 999 (avatars, pill toggles)

### Spacing scale (4px base)

`xxs:4 · xs:8 · sm:12 · md:16 · lg:20 · xl:24 · xxl:32`

### Typography (system stack)

- `display` 32 / 800 / -0.5 — hero greetings ("Olá, Anna 👋")
- `title` 22 / 800 — screen titles
- `headline` 17 / 800 — card titles, section headlines
- `body` 14 / 500 — default reading
- `caption` 12 / 600 — subtitles, metadata
- `eyebrow` 10 / 700 / 0.8 / uppercase — section labels (`useLabelStyle`)

### Elevation

- `elev.card` — soft 1-step card shadow (rgba 0/0/0/0.06, 8px blur, iOS only)
- `elev.float` — floating UI shadow (sheets, popovers)
- `elev.primary` — coloured shadow keyed to `BRAND.primary`, theme-aware

### Component motifs

- **Filled primary button**: full-width, `radius.md`, `primary` bg, white
  text, `elev.primary` shadow.
- **Secondary / cancel button**: `card2` bg, `border` outline, muted text.
- **Pill chip**: `radius.full`, 6px vertical / 14px horizontal padding.
  Active = `primary` bg + white text; inactive = `card2` bg + `sub` text.
- **Card**: `card` bg, `radius.lg`, 1px `border`, 16px padding (most). No
  shadow by default — opt-in via `elev.card` for highlighted surfaces.
- **Stat card with icon**: card surface, 36×36 icon tile in domain accent
  bg, headline number, caption label.
- **Avatar**: circle `radius.full`, optional `primary` ring 2-2.5px when
  active/unviewed.
- **Tab bar**: pill behind active icon (`acBg`), label visible only on
  active tab. No background tint on inactive tabs.
- **Streak badge**: small pill with bolt icon + count, `primary` text on
  `acBg` halo. Used in hero strip.

---

## Phasing

Order matters. Each phase is independently shippable. After every phase the
app must build, type-check, and pass tests; **no behaviour changes**.

| Phase | Scope | Status |
|---|---|---|
| **1. Foundation tokens** | `palette.ts` violet-primary values; new `tokens.ts` (radius/space/typography/elevation); `useTheme` exposes full token bag + theme-aware shadows; `styles.ts` reads from tokens. Avatar gradient palette retoned violet-friendly. Domain accent palette added (`progress`/`simulado`/`notas`/`goal`/`news`). | ✅ **Done** |
| **2. Shared primitives** | Extracted under `src/shared/components/`: `<Button>`, `<Pill>`, `<Avatar>`, `<Card>`, `<SectionHeader>`, `<StatCard>`, `<StreakBadge>`, `<HeroGreeting>`, `<EmptyState>`. Barrel `index.ts` re-exports. Each is stateless and reads tokens via `useTheme`. **No call-site migrations yet.** | ✅ **Done** |
| **3. App shell** | `MainTabs` tab-bar pill grows to inline-label-on-active; `TabHeader` typography upgrade + uses `<Avatar>`; `SplashScreen` rewritten with violet primary glow; `WelcomeScreen` hero rewritten (logo tile, primary CTA forced to white text on violet). `app.json` splash colour deferred to Phase 11. | ✅ **Done** |
| **4. Feed tab** | Post cards rebuilt on `<Card>`; stories strip ring uses `brand.primary`; countdown chips use the alert tag tone for ≤30 days; empty state uses `<EmptyState>` + primary `<Button>`. All hardcoded colour drift in `FeedScreen`, `StoriesStrip`, `StoryCircle` removed. | ✅ **Done** |
| **5. Explorar stack** | `ExplorarScreen` rebuilt on `<Pill>` chips + `domain.notas` info promos; `UniversityDetailScreen` hero rewritten with white-text follow CTA + violet info row + book status using `domain.goal` for "reading" and `T.acBg` for "read"; `FollowingScreen` empty state uses `<EmptyState>` + `<Button>`; `BooksListScreen` and `ExamsListScreen` had reading/PDF accents migrated to `domain.goal` + `T.acBg`. | ✅ **Done** |
| **6. Notas tab** | "Meu Objetivo" hero block migrated to `domain.notas`; "Área para melhorar" alert uses `TAG.alert`; comparison block uses `domain.notas`; chart palette switched to brand violet (line/dot) + per-subject domain colours for bars; grade-list semantic success/failure indicators (`#22c55e`/`#f87171`) intentionally kept as-is. | ✅ **Done** |
| **7. Perfil + Institution Admin** | "Meu Objetivo" + Tarefas hero blocks migrated to `T.acBg` (lavender halo); reading-progress amber → `domain.goal` family in both `PerfilScreen` and the `GoalsList` sub-component; `InstitutionAdminScreen` site link uses `T.acBg`; save-button text forced to white. Institution colour-picker palette intentionally kept hardcoded (it *is* the palette). | ✅ **Done** |
| **8. Modals pass** | `BottomSheet` shell drag handle now uses `T.muted` at 50% opacity (more visible, less heavy); modal corners aligned to `radius.xl`-ish (22px). `SettingsModal` "Sair" button rebuilt as a ghost destructive (red text on red outline) to fit the soft palette. `ExamDetailModal` "Prova ainda não realizada" alert uses `domain.goal`; PDF button uses `domain.notas`. | ✅ **Done** |
| **9. Onboarding** | "Seguindo" toggle in pick-step rebuilt as a soft chip (`card2` + checkmark) instead of red destructive; primary CTA text + course-chip text forced to white on violet (was theme-flipped via `AT`, rendering black on dark mode). Step indicator + course chips already token-aware so kept. | ✅ **Done** |
| **10. Polish & motion** | `<Button>` primary CTA now has a subtle 0.97 press-spring (RN `Animated`); `<Skeleton>` primitive added under `src/shared/components/` for loading states. `ErrorBoundary` colours migrated to violet brand fallback constants. `T.AT` (accent-text) bug fixed: changed from theme-flipped (`#000` on dark) to always white, fixing ~18 broken-on-dark CTAs in one shot. | ✅ **Done** |
| **11. Brand surfaces** | `app.json` splash + adaptive-icon background switched from navy `#003366` to dark brand `#0B0B12`. **Designer task remaining**: `assets/icon.png`, `assets/splash-icon.png`, `assets/adaptive-icon.png`, `assets/favicon.png` should be regenerated to use the violet primary `#7C5CFF` for the glyph stroke/fill. Code-side change is complete. | ✅ **Done (code)** / 🟡 Designer artwork pending |

---

## Per-phase rules

1. **Read this file at the start of every redesign session.** It is the
   source of truth for which phase is in progress and which token to use.
2. **Don't edit shared tokens** (`palette.ts`, `tokens.ts`) inside a
   non-foundation phase. If a screen needs a new token, propose it back to
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
5. **No new dependencies** without explicit sign-off. RN `Animated` plus
   `View` + linear `backgroundColor` rgba layering is enough for what we
   want. Reanimated/gradient libs are deferred decisions (see Open
   Decisions).
6. **Behaviour-preserving only.** No store action, repository, navigation
   route, or Firestore field is altered. If a phase reveals a broken
   product behaviour, file it separately — do not bundle the fix.

---

## Phase 1 — done (this codebase, current commit)

- [`src/theme/tokens.ts`](../src/theme/tokens.ts) — `radius`, `space`,
  `typography`, `elevation`, `makeShadow`. Theme-independent.
- [`src/theme/palette.ts`](../src/theme/palette.ts) — refined `DK` / `LT`
  colour rolls. Violet primary `#7C5CFF`. Lavender-tinted neutrals. Tag
  families retoned. New `BRAND` constant for theme-independent uses.
  `ThemeColors` shape unchanged — every existing consumer (~157 usages)
  keeps working.
- [`src/theme/useTheme.ts`](../src/theme/useTheme.ts) — exposes a richer
  `ThemeResult` including `tokens`, `radius`, `space`, `typography`,
  `brand`, and `shadow.{card,float,primary}` ready-made platform-correct
  shadow objects. `shadow.primary` is theme-aware (saturated on dark, soft
  on light).
- [`src/theme/styles.ts`](../src/theme/styles.ts) — `useCardStyle` /
  `useLabelStyle` now read from the new tokens (drop-in compatible).
- [`src/theme/avatar.ts`](../src/theme/avatar.ts) — gradient pairs retoned
  to live in the violet family while keeping eight options for variety.

After Phase 1 every existing screen picks up the new colours without any
other edit. They look noticeably more "purple" and slightly softer;
behaviour is identical.

---

## Phase 2 — done (this codebase, current commit)

All under `src/shared/components/`. Barrel export at
[`src/shared/components/index.ts`](../src/shared/components/index.ts).

- [`Button.tsx`](../src/shared/components/Button.tsx) — variants
  `primary`/`secondary`/`ghost`, sizes `sm`/`md`/`lg`, loading + disabled
  states, optional left/right icons, optional `fullWidth`. Primary uses
  `shadow.primary`.
- [`Pill.tsx`](../src/shared/components/Pill.tsx) — chip with
  `active`/`onPress`/`leftIcon`/`size`. Active = brand violet bg + white;
  inactive = `card2` bg + `sub` text.
- [`Card.tsx`](../src/shared/components/Card.tsx) — `tone:
  default|highlight|flat`, optional `padding`/`radius`. `highlight` adds
  `shadow.card`.
- [`SectionHeader.tsx`](../src/shared/components/SectionHeader.tsx) —
  eyebrow / headline / right-slot row.
- [`StatCard.tsx`](../src/shared/components/StatCard.tsx) — accepts a
  `DomainTone`, renders icon tile in the matching pastel + value + label +
  optional delta.
- [`HeroGreeting.tsx`](../src/shared/components/HeroGreeting.tsx) — "Olá,
  {name} 👋" display strip with optional subtitle and right slot.
- [`StreakBadge.tsx`](../src/shared/components/StreakBadge.tsx) — bolt +
  count + Brazilian-Portuguese suffix on lavender halo.
- [`Avatar.tsx`](../src/shared/components/Avatar.tsx) — wraps existing
  `AVATAR_PRESETS`/`AVATAR_COLORS`. `ring` adds the violet ring used for
  unviewed-story / active states.
- [`EmptyState.tsx`](../src/shared/components/EmptyState.tsx) — icon
  circle + title + description + optional action.

Phase 3 starts the migration: app shell first.

---

## Phase 2 — primitives spec (reference)

All under `src/shared/components/`. Each is a stateless functional
component, reads tokens via `useTheme`, has no Firebase or store
dependency. **Both APIs and call-sites must remain backwards-compatible —
do not migrate any screen yet.**

| Component | Props | Notes |
|---|---|---|
| `<Button>` | `variant: 'primary'\|'secondary'\|'ghost'`, `size: 'md'\|'lg'`, `onPress`, `loading`, `disabled`, `leftIcon`, `children` | Primary uses `shadow.primary`. Loading shows spinner inline. |
| `<Pill>` | `active`, `onPress`, `leftIcon`, `children` | Used everywhere a chip toggles. |
| `<Card>` | `tone: 'default'\|'highlight'`, `padding?`, `radius?`, `children` | Wraps `useCardStyle`. `highlight` adds `shadow.card`. |
| `<SectionHeader>` | `title`, `eyebrow?`, `right?` | Standard "Eyebrow / Title / right action" row. |
| `<StatCard>` | `icon`, `tone: 'progress'\|'simulado'\|'notas'\|'goal'\|'news'`, `value`, `label`, `delta?` | Inspiration-style icon tile + value + caption. |
| `<HeroGreeting>` | `name`, `emoji?`, `right?` | "Olá, Anna 👋" + display typography + optional right slot. |
| `<StreakBadge>` | `days` | Bolt + count, primary on `acBg`. |
| `<Avatar>` | `seed`, `size`, `ring?: boolean`, `onPress?` | Wraps existing avatar gradient logic; adds optional violet ring. |
| `<EmptyState>` | `icon`, `title`, `description?`, `action?` | Reused by Feed empty / Notes empty / Following empty. |

Once Phase 2 is in, screens migrate one at a time in Phases 3–9.

---

## Where each shared concept lives

Per `ARCHITECTURE.md`:

- `src/theme/*` — design tokens + theme hooks. Pure UI. No store, no Firebase.
- `src/shared/components/*` (Phase 2 onward) — primitives that are app-wide
  and stateless. Read tokens via `useTheme`.
- `src/components/*` — kept for components that already exist there
  (`BottomSheet`, `SBox`, `StoriesStrip`, etc.). New shared primitives go
  under `src/shared/components/`.
- `src/features/<domain>/components/*` — feature-owned UI. Composes shared
  primitives.

---

## Open decisions (defer)

- **Custom font?** System is fine for v1. Re-evaluate after Phase 4. If we
  add one, `Inter` or `Geist` via `expo-font` plus one
  `@expo-google-fonts/*` package — single dep.
- **Gradient backgrounds?** The InstitutionAdmin hero uses a flat
  university colour; we may move to a 2-stop linear gradient after Phase 7.
  Either `expo-linear-gradient` or stacked `View`s with rgba.
- **Light-mode default?** Currently dark-default in `profileStore`. The
  strongest inspiration shots are light-mode; consider flipping the default
  after Phase 6 once we see Notas light-mode in real data. Keep
  `theme: 'auto'` wiring intact.
- **Reanimated?** Only if Phase 10 reveals a real need. RN `Animated` is
  preferred for now.
- **Tab bar labels visible always vs only-active?** Lean "only-active +
  small label under icon" per inspiration; finalise during Phase 3.

---

## Failure modes to watch

- **Hardcoded colours in screens.** `FeedScreen` and `StoriesStrip` already
  drift; future phases must replace literals with `T.*` or `BRAND.*`.
- **Token sprawl.** If a screen needs a new token, add it to
  `tokens.ts`/`palette.ts` and reuse — never inline.
- **Mixing new and old primitives.** During Phases 3–9, a screen either
  fully uses Phase-2 primitives or remains on the old shape. Never half-and-
  half within one screen.
- **Behaviour regressions disguised as restyles.** If a button changes from
  `TouchableOpacity` to a custom Pressable wrapper, smoke-test the screen
  at the end of the phase. Type-check is not enough.
