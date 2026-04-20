# Univest Native — Migration Plan

Staged refactor of the monolithic `App.js` into a scalable, feature-oriented architecture without changing behavior or UI.

---

## 0. Current State

| | Before | After Phases 1–4 | After Phase A | After Phase B | After Phase C (Auth) | After Phase C (Onboarding) | After Phase C (Feed) | After Phase C (Notas) | After Phase C (Explorar) | After Phase C (Perfil) |
|---|---|---|---|---|---|---|---|---|---|---|
| `App.js` | 3,084 lines | ~2,570 lines | ~2,549 lines | ~2,551 lines | 2,317 lines | 2,192 lines | 2,070 lines | 1,825 lines | 1,736 lines | 1,504 lines |
| `MainApp` `useState` sites | ~80 | ~80 | 57 | 57 | 40 | 37 | 37 | 34 | 32 | 32 |
| Modules under `src/` | 1 (firebase config) | 16 | 24 | 26 | 27 | 29 | 30 | 31 | 32 | 33 |
| Firebase calls inline in App | ~25 sites | ~15 sites | ~10 sites | ~10 sites | ~10 sites | ~9 sites | ~5 sites | ~5 sites | ~5 sites | ~3 sites |
| UI/behavior changes | — | **None** | **None** | **None** | **None** | **None** | **None** | **None** | **None** | **None** |

`App.js` still contains a god-component `MainApp` and the full screen tree as a giant `tab === "..."` switch. Cross-screen state is now in Zustand stores; remaining `useState` calls are modal toggles, form fields, temporary pickers, and search strings. Splitting the screen tree is the next target.

### Phases completed (✅)

1. **Data extraction** → `src/data/` (userTypes, areas, universities, feed, notasCorte, events, geo)
2. **Theme extraction** → `src/theme/palette.js`, `src/theme/avatar.js`
3. **Utilities & Firebase services** → `src/utils/{format,string,validation,dates,goals,filter}.js`, `src/services/{storage,auth,firestore,geo}.js`
4. **Standalone presentational components** → `src/components/{SBox,BottomSheet,Chip,EmptyState}.js`

Everything above is pure cut-and-paste. Zero behavioral risk.

### Additional utilities added (risk-free)

| File | Purpose |
|------|---------|
| `src/utils/dates.js` | Date helpers: daysUntil, formatDate, getMonthName, isToday/isPast/isFuture |
| `src/utils/goals.js` | Goal helpers: buildGoalTodos, getTodoStatus, getUpcomingExam, getGoalProgress |
| `src/utils/filter.js` | Filter/sort helpers: sortByDate, filterBySearch, groupBy, uniqueBy |
| `src/data/constants.js` | App-wide constants: TAB_NAMES, EXAM_TYPES, BOOK_STATUS, SORT_OPTIONS |
| `src/data/subjects.js` | ENEM subject metadata (k/short/long/color) + `subjectScore(s, k)` that normalizes Redação to 0–100 |
| `src/components/Chip.js` | Reusable filter chip component |
| `src/components/EmptyState.js` | Reusable empty state placeholder |

### Phase A complete (✅)

- ✅ `src/stores/geoStore.js` — countries/states/cities + selectors
- ✅ `src/stores/coursesStore.js` — fbCourses/fbIcons + getIcon
- ✅ `src/stores/postsStore.js` — posts, liked, saved + load/loadLikesFor/like+share deltas
- ✅ `src/stores/progressStore.js` — readBooks, readingBooks, completedTodos
- ✅ `src/stores/universitiesStore.js` — unis, fbUnis, selUni, goalsUnis, uniPrefs, uniSort + load/applyFollowedUnis
- ✅ `src/stores/onboardingStore.js` — step, done, uType, c1, c2
- ✅ `src/stores/profileStore.js` — nome, sobrenome, theme, av, avBgIdx, gs, ng, home/study geo ids
- ✅ `src/stores/authStore.js` — currentUser, userData, authLoading (+ subscribe action)
- ❌ `uiStore` deleted from the plan — theme/avatar live in `profileStore` since they are user-profile data; transient UI state (modals, pickers, searches) stays local in `MainApp`.

**Not yet done (deferred to keep behavior identical in Phase A):**
- `syncUserData` / `currentData()` / `saveTimerRef` debounce still live in `MainApp`. The plan called for per-slice persistence middleware — safer to land that in a dedicated follow-up so the all-in-one write path isn't disturbed while screens are still being split.
- The `onAuthChange` cascade still dispatches to each store inline. A `persistToUser` middleware + store-level `hydrateFromFb(fbData)` would be the clean final form; kept as-is for now to minimize behavior drift.

### Phase B scaffolded (🟡)

- ✅ `src/navigation/RootNavigator.js` — single-screen native-stack that renders `MainApp`
- ✅ `src/navigation/linking.js` — deep-link placeholder for Phase D
- ✅ `App.js` — wrapped in `<NavigationContainer><RootNavigator Main={MainApp} /></NavigationContainer>` inside `SafeAreaProvider`

**Why only scaffolding:** the plan's "each tab renders `<MainApp section='X'/>`" shim doesn't work in this codebase — `MainApp` holds ~57 local `useState` hooks (modals, searches, pickers), so mounting it four times inside `Tab.Screen`s would quadruple state and break scroll/modal persistence across tab switches. The meaningful navigator split has to happen in lock-step with Phase C screen extraction, not before.

**Deferred to Phase B+C (done together once screens exist):**
- `AuthStack` / `OnboardingStack` / `MainTabs` / `ExplorarStack` / `PerfilStack` — not created; would be empty shells today.
- Replacing `tab` / `showExamsPage` / `showBooksPage` / `showFollowingPage` / `selUni` booleans with navigator routes.
- Moving the `authLoading` spinner and `!currentUser` welcome gate from `MainApp` into `RootNavigator`.
- Removing `MainApp`'s custom bottom tab bar in favor of `MainTabs.screenOptions`.

### Phase C in progress (🟡)

- ✅ `src/screens/auth/WelcomeScreen.js` (245 lines) — self-contained: welcome card, login/signup modal, forgot-password flow, Terms modal. Owns all 16 auth-form `useState` hooks + `handleLogin`/`handleSignup`/`handleForgotPassword`. Consumes `useProfileStore` for theme and `useCoursesStore` for icons.
- ✅ `App.js`: `if (!currentUser) return <WelcomeScreen />;` — auth state, handlers, refs, and 172 lines of JSX removed. Dropped unused imports: `validatePassword`, `signIn`, `signUp`, `resetPassword`, `getAuthErrorMessage`, `LayoutAnimation`. **−228 lines** net.
- 🐛 **Fix:** a stray "Entrar ou criar conta" `TouchableOpacity` inside `renderExplorar` was referencing removed auth state (`loginBtnScale`, `setShowLogin`, `setLoginMode`, `setAuthTouched`) and crashing the Explorar tab on render. It was dead code (Explorar only renders for logged-in users) — deleted. **Lesson:** after removing state, grep every identifier across the whole file, not just obviously-related render blocks.

- ✅ **Constants cleanup:** inline `months={JAN:1,...}` map in `MainApp` replaced with the existing `getMonthFromKey` util from `src/utils/dates.js` (was a duplicate). ENEM subject metadata — duplicated across the radar array, bar-chart object keys, and the "você vs meta" comparativo block — extracted to `src/data/subjects.js` as `ENEM_SUBJECTS` + `subjectScore(s, k)`. All three render blocks now iterate the shared list, so adding a subject or recoloring happens in one place. **Caveat:** `bars` skips `k === "r"` because the bar chart omits Redação (intentional, different scale).
- ✅ `src/screens/onboarding/OnboardingScreen.js` (174 lines) — 3-step picker (user type → courses → universities) lifted out. Pulls step/uType/c1/c2 from `useOnboardingStore`, unis from `useUniversitiesStore`, fbCourses/getIcon from `useCoursesStore`, currentUser from `useAuthStore`. Keeps `cSrch`/`uSrch`/`picking` local. Receives `hStep`/`hDone`/`hUType`/`hC1`/`hC2` as props since these wrappers call `syncUserData`, which still lives in MainApp.
- ✅ `App.js`: `if (!done) return <OnboardingScreen ... />;` — replaced ~125 lines of JSX. Removed three now-unused useState hooks (`cSrch`, `uSrch`, `picking`).
- ✅ `src/screens/feed/FeedScreen.js` (187 lines) — feed + stories strip + upcoming-exams countdown + like/share/report actions. Pulls posts/liked/saved from `usePostsStore`, unis/goalsUnis/uniSort/uniPrefs from `useUniversitiesStore`, currentUser from `useAuthStore`. Owns `toggleLike`/`shareItem`/`reportItem` (Firestore writes stayed co-located with the UI that triggers them — splitting them out would create action-at-a-distance). Takes props for cross-screen concerns: `refreshing`/`onRefresh` (shared with Explorar), `goExplorar`/`onSelectUni` (tab navigation), `onShare` (opens MainApp's share sheet), `currentData` (needed by `saveLocalUserData` after like toggle).
- ✅ `App.js`: `renderFeed` is now a 7-line thunk that returns `<FeedScreen ... />`. Removed unused imports: `timeAgo`, `collection`, `addDoc`, `serverTimestamp`, `deleteDoc`, `TAG_D`, `TAG_L`, and the `TG` local derived constant.
- ✅ `src/screens/notas/NotasScreen.js` (279 lines) — goal card + notas de corte list + "minhas notas" history (evolution bar chart, você-vs-meta comparativo, compare-mode vs cut scores, grade rows with delete). Pulls `theme`/`gs`/`setGs` from `useProfileStore`, `c1`/`c2` from `useOnboardingStore`. Owns local `nSrch`/`gradeFilter`/`compareMode` state. Recomputes `last`/`avg`/`tgt`/`radar`/`weak`/`bars`/`chartConfig`/`uCourses`/`filtN` internally. Reimplements the `cd()`/`lbl` style helpers locally since they're tiny and screen-scoped. Takes `onEditCourses`/`onAddGrade` as props so the Edit-courses (`mEdit`) and Add-grade (`mGr`) modals stay MainApp-owned for now.
- ✅ `App.js`: `renderNotas` is now a 5-line thunk. Removed three now-unused useState hooks (`nSrch`, `gradeFilter`, `compareMode`) and the local derivations `radar`/`weak`/`bars`/`chartConfig`/`uCourses`/`filtN`. Kept `last`/`avg`/`tgt` in MainApp since `renderExplorar` still references them. Dropped unused imports: `BarChart`, `ENEM_SUBJECTS`, `subjectScore`. **−245 lines** net.
- ✅ `src/screens/explorar/ExplorarScreen.js` (127 lines) — location-picker CTA, discover card, university search box, state filter chips, university list. Pulls `theme`/`studyStateId` from `useProfileStore`, `unis` from `useUniversitiesStore`, `states` from `useGeoStore`. Owns local `query`/`fSt` state and recomputes `filtU`/`hasSearch`/`userStudyState` + `getState`/`getStateDisplayName` helpers internally. Takes callback props for cross-screen/modal side-effects: `refreshing`/`onRefresh`, `onOpenLocation` (MainApp primes tmp-location state + opens `mLoc`), `onOpenDiscover` (sets `mDisc`), `onSelectUni` (sets `selUni`, which MainApp renders as a detail overlay).
- ✅ `App.js`: `renderExplorar` is now a 9-line thunk. Removed two unused useState hooks (`query`, `fSt`) and the derivations `userStudyState`/`isMyRegionFilter`/`filtU`/`hasSearch`. `isMyRegionFilter` was dead code — defined but never consumed. Dropped now-unused `RefreshControl` import (ExplorarScreen was the sole user). **−89 lines** net.
- ✅ `src/screens/perfil/PerfilScreen.js` (342 lines) — profile card (avatar/banner/name/courses/location/stats), goal card (objetivo with last/avg/tgt progress), books summary, goals-as-tasks section (with nested `GoalsList` component owning the `bookMenu` local state), upcoming exams from goals, and EVENTS list. Pulls from `useProfileStore`/`useOnboardingStore`/`useUniversitiesStore`/`useProgressStore`/`usePostsStore`/`useAuthStore`/`useGeoStore`. Reimplements `getCityDisplayName`, `last`/`avg`/`tgt`, and `cd`/`lbl` locally (screen-scoped, small). Receives 10 MainApp callback props for modal/tab transitions: `onChangePhoto`, `onChangeName`, `onEditCourses`, `onShowFollowing`, `onShowSaved`, `onShowBooks`, `onAddGoal`, `onOpenEvent`, `onSelectUni`, `goNotas`, plus `currentData` for the goal-todo persistence writes. Inlined `followedCount = unis.filter(u=>u.followed).length` (didn't need the sorted `fol` list, just its count).
- ✅ `App.js`: `renderPerfil` is now a 14-line thunk. Removed the now-unused `last`/`avg`/`tgt` derivations (Perfil was the last consumer after Notas left). Moved Firestore writes for `readBooks`/`completedTodos` inside the Goals/Tasks section into PerfilScreen's `GoalsList`. Dropped the `EVENTS` import (no other MainApp consumer). **−232 lines** net.

**Phase C complete for the five main tabs.** Remaining in `MainApp`: the `selUni` university detail overlay, the `showExamsPage`/`showBooksPage`/`showFollowingPage` sub-pages, the `dArea` discover modal, and ~14 true modals (config/photo/edit-courses/name/grade/share/uni-search/location/saved/book-menu/event/exam). These naturally belong to Explorar/Perfil sub-stacks once Phase B navigator routes replace the boolean toggles.

**Known deferred work for Phase C cleanup:** the `h*` handler wrappers (hStep/hDone/hUType/hC1/hC2) should eventually be absorbed by `onboardingStore` once per-slice persistence middleware exists (Phase A deferred item). Until then, passing them as props is fine.

### Remaining phases

---

## Remaining Plan

Order matters. The original proposal was 5 → 6 → 7, but the correct dependency order is **7 → 6 → 5 → 8**:

- **Screens can't be split until shared state is lifted out of MainApp.** Zustand (Phase 7) must come first.
- **Navigation can't replace `tab` state cleanly until screens are separate components.** So nav sits between store-lifting and screen-splitting (Phase 6) — register placeholder screens that still render slices of MainApp, then cut those slices out (Phase 5).
- **Polish (Phase 8)** — TypeScript, memoization, error boundaries, security — only makes sense once the structure is stable.

Each phase below lists: goal, prerequisites, concrete files, a migration pattern, and a verification checklist.

---

## Phase A (was 7) — Lift shared state into Zustand stores

**Goal:** Move cross-screen state out of `MainApp` into small, focused stores. Each store owns its slice of state, exposes actions, and handles its own persistence (AsyncStorage + Firestore).

**Why Zustand over Context / Redux:**
- Lighter than Redux, no boilerplate, no Provider required at the tree root.
- Selectors prevent re-rendering the whole tree when one field changes (Context's main weakness with ~80 state fields).
- Testable without React — actions are plain functions.

### Store layout

```
src/stores/
  authStore.js        // currentUser, authLoading, userData; login/signup/logout actions
  onboardingStore.js  // step, done, uType, c1, c2 (pick flow)
  uiStore.js          // theme, avatar, avBgIdx, activeTab, all modal toggles
  universitiesStore.js // unis, fbUnis, selUni, goalsUnis, uniPrefs, uniSort
  coursesStore.js     // fbCourses, fbIcons
  postsStore.js       // posts, liked, saved
  profileStore.js     // nome, sobrenome, country/state/city (home + study), grades (gs), ng
  progressStore.js    // readBooks, readingBooks, completedTodos
  geoStore.js         // countries, states, cities
```

### Canonical store shape

```js
// src/stores/authStore.js
import { create } from "zustand";
import { onAuthChange, signIn, signUp, logout, getAuthErrorMessage } from "../services/auth";
import { fetchUserDoc } from "../services/firestore";
import { saveLocalUserData } from "../services/storage";

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  userData: null,
  authLoading: true,

  subscribe: () => onAuthChange(async (user) => {
    if (!user) { set({ currentUser: null, userData: null, authLoading: false }); return; }
    set({ currentUser: user });
    try {
      const fbData = await fetchUserDoc(user.uid);
      if (fbData) { await saveLocalUserData(fbData); set({ userData: fbData }); }
      else set({ userData: { followedUnis: [] } });
    } finally { set({ authLoading: false }); }
  }),

  login: async (email, password) => {
    try { await signIn(email, password); }
    catch (err) { throw new Error(getAuthErrorMessage(err, "login")); }
  },
  // ...signup, resetPassword, logout
}));
```

### Persistence pattern

Per-slice persistence beats the current all-in-one `saveLocalUserData(currentData())` because writes become scoped and debouncable per store.

```js
// src/stores/middleware/persistToUser.js
// Tiny middleware: debounces setDoc(doc(db,"usuarios",uid), partial, {merge:true})
// Subscribes to selected keys and flushes after 500 ms of silence.
```

Replace the current debounced sync block (`saveTimerRef`/`prefsInitRef` in `App.js`) with subscriptions at the module level.

### Migration pattern (per store)

1. Create the store file with state + actions.
2. Replace usages in `MainApp` one slice at a time:
   - `const [foo, setFoo] = useState(...)` → `const foo = useFooStore(s => s.foo)`
   - `setFoo(x)` → `useFooStore.getState().setFoo(x)` or `useFooStore(s => s.setFoo)`
3. Move related `useEffect` hooks (e.g. `fetchPosts` load) into the store as an action called once from `App.js`.
4. Keep `MainApp` compiling after each slice — don't batch.

### Verification (after **each** store)

- [ ] Open the app; target screen still renders with same data.
- [ ] Trigger any action that writes to the slice; Firestore doc updated exactly once per debounce window.
- [ ] No visual changes anywhere.

**Estimated delta:** ~400 lines out of `App.js` (state + effects + sync timer).

---

## Phase B (was 6) — React Navigation

**Goal:** Replace the `tab` / `showExamsPage` / `showBooksPage` / `showFollowingPage` / `selUni` state machine with a proper navigator tree. Back button, deep linking, and screen lifecycle all become free.

**Dependencies (already installed):** `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`.

### Navigator tree

```
RootNavigator (native-stack)
├─ AuthStack        (when !currentUser)
│   ├─ Login
│   ├─ Signup
│   └─ ForgotPassword
├─ OnboardingStack  (when currentUser && !userData.done)
│   ├─ PickUserType
│   ├─ PickCourses
│   └─ PickUniversities
└─ MainTabs         (when currentUser && userData.done)
    ├─ FeedTab        → FeedScreen
    ├─ ExplorarTab    → ExplorarStack
    │                    ├─ UniversityList
    │                    ├─ UniversityDetail (selUni)
    │                    ├─ ExamsList       (showExamsPage)
    │                    ├─ ExamDetail      (mExam/mEv)
    │                    ├─ BooksList       (showBooksPage)
    │                    └─ Following       (showFollowingPage)
    ├─ NotasTab       → NotasScreen
    └─ PerfilTab      → PerfilStack
                         ├─ Profile
                         ├─ EditProfile
                         ├─ Goals
                         └─ Discover
```

### Files

```
src/navigation/
  RootNavigator.js      // picks AuthStack / OnboardingStack / MainTabs
  AuthStack.js
  OnboardingStack.js
  MainTabs.js
  ExplorarStack.js
  PerfilStack.js
  linking.js            // deep link config (optional in phase B, required in phase D)
```

### Migration pattern

1. Install native-stack + bottom-tabs wrappers. Wrap the app:
   ```jsx
   <NavigationContainer>
     <RootNavigator />
   </NavigationContainer>
   ```
   inside the existing `SafeAreaProvider`. `authLoading` gate stays in `RootNavigator`.
2. **At first, every screen component renders `<MainApp route={route} />` with a prop telling it what to show.** This lets nav switch the outer tree without having split MainApp yet.
3. Remove the custom tab bar (bottom nav buttons) from MainApp; `MainTabs` now owns it. Style the `Tab.Screen`s to match existing colors from `palette.js`.
4. Replace modal-like pages (`showExamsPage`, `showBooksPage`, `showFollowingPage`, `selUni`, `mExam`, `mEv`) with `navigation.navigate("ExamDetail", { id })`. Keep the old booleans briefly as a fallback while you migrate one-by-one.
5. When all modal-pages are navigated routes, delete the booleans from the UI store.

### Keep these as `<Modal>` (bottom sheets):

`goalsModal`, `requirementsModal`, `mCfg`, `mPho`, `mEdit`, `mNome`, `mGr`, `mShr`, `mDisc`, `mUni`, `mLoc`, `mSaved`, `bookMenu`. These are true modals, not routes.

### Verification

- [ ] Hardware back button navigates up on Android.
- [ ] Swipe-to-go-back works on iOS.
- [ ] Tab state persists when switching tabs (scroll position etc.).
- [ ] No regressions in any flow that previously toggled a `show*Page` boolean.

---

## Phase C (was 5) — Split MainApp into per-screen components

**Goal:** Physically move screen JSX out of `MainApp` and into dedicated files. Prerequisite: Phase A (state is in stores) and Phase B (navigator is calling screens).

**Inline constants to extract:**
| Constant | Location | Proposed Destination |
|----------|----------|---------------------|
| `goalTodos` | App.js line ~1556 | Move to `src/utils/goals.js` as helper |

Note: This is built dynamically from `goalsUnis`, so it's a helper function, not a static constant.

### Target layout

```
src/screens/
  auth/
    LoginScreen.js
    SignupScreen.js
    ForgotPasswordScreen.js
  onboarding/
    PickUserTypeScreen.js
    PickCoursesScreen.js
    PickUniversitiesScreen.js
  feed/
    FeedScreen.js
    components/        // post cards, tag pills, share sheet
  explorar/
    ExplorarScreen.js
    UniversityDetailScreen.js
    ExamsListScreen.js
    ExamDetailScreen.js
    BooksListScreen.js
    FollowingScreen.js
    components/        // UniversityCard, ExamCard, BookCard, AreaChips
  notas/
    NotasScreen.js
    components/        // GradeRow, AddGradeModal, GradesChart
  perfil/
    ProfileScreen.js
    EditProfileScreen.js
    GoalsScreen.js
    DiscoverScreen.js
    components/        // AvatarPicker, LocationPicker, GoalCard
```

### Order (safest to riskiest)

1. **Auth screens** (small, isolated, already use `handleLogin` etc.).
2. **Onboarding screens** (self-contained step machine; state already in `onboardingStore`).
3. **Feed** (single screen, renders `posts`; lowest coupling).
4. **Notas** (self-contained; grades list + add modal).
5. **Explorar** (biggest: 6 sub-screens, most modal state).
6. **Perfil** (many modals and edit flows; leave for last).

### Migration pattern (per screen)

1. Create the file with a skeleton that pulls all needed state from stores and props from `route.params`.
2. Cut the corresponding JSX block out of `MainApp` and paste into the new file.
3. Replace any local helper functions with either store actions or module-level pure functions in `src/utils/` or `src/features/.../helpers.js`.
4. Import and render the new screen from the navigator (or keep `<MainApp section="feed">` shim until fully cut).
5. Delete dead state from `MainApp`.
6. Commit. Test in simulator. Repeat.

### Handling shared small components

Extract these **while** splitting screens (not before — you only know what's reusable once you see the boundaries):

- `Badge`, `Pill`, `Chip`, `SectionHeader`, `EmptyState`, `IconButton`, `Avatar`, `UniversityCard`, `PostCard`, `ExamCard`, `BookCard`, `GradeRow`, `ShareSheet`, `LocationPicker`, `ThemeToggle`.

Put them in `src/components/` if truly app-wide, or `src/screens/<feature>/components/` if feature-specific.

### Verification (per screen cut)

- [ ] `App.js` line count drops by roughly the size of the cut block.
- [ ] Screen renders with same content, same theme behavior, same Firestore side-effects.
- [ ] Fast Refresh works when editing the new screen file alone.
- [ ] All deep flows out of the screen (open modals, navigate) still work.

---

## Phase D — Polish

Once the structure is clean, tighten quality. Don't do any of this before C — premature optimization on a moving target.

### D.1 TypeScript migration (optional but recommended)

- Add `tsconfig.json` with `strict: true`, `jsx: react-native`.
- Rename files bottom-up: stores first, then services, then components, then screens.
- Define domain types in `src/types/`: `User`, `University`, `Post`, `Exam`, `Book`, `Grade`.
- Firestore types: write converter functions (`withConverter<T>`) per collection rather than scattering `as` casts.

### D.2 Performance

- Wrap list items in `React.memo`.
- Replace long `ScrollView`s with `FlatList` / `FlashList` (see below) — feed, universities, notas.
- Memoize filtered/sorted derived data with `useMemo` (currently recomputed every render).
- Audit `AnimatedValue.ref` usage; ensure no `new Animated.Value(...)` inside render body.
- Consider `react-native-reanimated` for the login button shake (already imported from deps).
- Use `@shopify/flash-list` for the feed if list grows beyond ~50 items.

### D.3 Correctness & UX

- Add an **error boundary** at the root (`src/app/ErrorBoundary.js`) that logs and shows a friendly fallback.
- Replace swallowed `try/catch {}` blocks with structured logging (`src/services/logger.js` — thin wrapper; console in dev, Sentry/Crashlytics in prod).
- Standardize all Alerts into a single `showConfirm`/`showError` helper to make them themeable and testable.
- Replace `Appearance.getColorScheme()` (called once at mount) with `useColorScheme()` so theme follows OS changes live.

### D.4 Security

- Audit `.env` usage — make sure no Firebase private keys are in client code. (The Firebase web SDK config is publicly shippable; anything else must stay server-side.)
- Add Firestore security rules review checklist; current client trusts that rules guard `/usuarios/{uid}` writes.
- Validate all user input at the boundary (signup form, edit profile) — `src/utils/validation.js` is the home for new validators (email, birthdate, name).
- Rate-limit writes on the client (the `prefsInitRef` debounce is a start) to prevent accidental Firestore quota burn.

### D.5 Testing

- Unit-test pure modules first: `src/utils/*`, validation, formatters, store reducers (Zustand supports `create` outside React → pure function tests).
- Integration-test stores against a Firestore emulator (`firebase-tools`).
- Component smoke tests with `@testing-library/react-native` — start with auth screens.
- No E2E until flows stabilize.

### D.6 Developer experience

- Add ESLint + Prettier with a shared config.
- Add a `path` alias `@/` → `src/` in `babel.config.js` (`babel-plugin-module-resolver`) so imports stop being `../../../services/...`.
- Consider Expo Router if you ever want file-based routing — but not now; React Navigation is fine.

### D.7 Analytics / observability (when relevant)

- Add `expo-application` for version, `expo-device` for device info.
- Tag every Firestore write with a `source` field to understand usage patterns.
- If/when Sentry is added, hook it into the error boundary and unhandled rejections.

---

## Risks & Rollback

Every phase should be a separate PR (or at least a separate commit) so you can:

- Revert any single phase without losing earlier gains.
- Bisect regressions cleanly (`git bisect` over phase commits is invaluable).
- Merge phases independently as the team has capacity to review.

**Hard rule:** never combine a state-lifting commit with a UI-splitting commit. They look similar in a diff but fail in completely different ways.

---

## Estimated effort

| Phase | Rough size | Risk |
|---|---|---|
| A — Zustand stores | ~9 stores, ~400 lines cut from App.js | Medium (state migrations subtle) |
| B — React Navigation | ~6 navigator files, shim MainApp | Low if staged, High if rushed |
| C — Screen split | ~25 new screen/component files, ~2,000 lines moved | High (many cuts, easy to drop a prop) |
| D — Polish | Incremental, indefinite | Low per change |

Do A and B on quiet days with simulator open. Don't start C until A+B are merged and stable.
