# Univest Native — Migration Plan

Staged refactor of the monolithic `App.js` into a scalable, feature-oriented architecture without changing behavior or UI.

---

## 0. Current State

| | Before | After Phases 1–4 | After Phase A | After Phase B | After Phase C (Auth) | After Phase C (Onboarding) | After Phase C (Feed) | After Phase C (Notas) | After Phase C (Explorar) | After Phase C (Perfil) | After Phase C (sub-pages) | After Phase D |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `App.js` | 3,084 lines | ~2,570 lines | ~2,549 lines | ~2,551 lines | 2,317 lines | 2,192 lines | 2,070 lines | 1,825 lines | 1,736 lines | 1,504 lines | 1,174 lines | 528 lines |
| `MainApp` `useState` sites | ~80 | ~80 | 57 | 57 | 40 | 37 | 37 | 34 | 32 | 32 | 26 | 15 |
| Modules under `src/` | 1 (firebase config) | 16 | 24 | 26 | 27 | 29 | 30 | 31 | 32 | 33 | 37 | 50 |
| Firebase calls inline in App | ~25 sites | ~15 sites | ~10 sites | ~10 sites | ~10 sites | ~9 sites | ~5 sites | ~5 sites | ~5 sites | ~3 sites | ~3 sites | ~3 sites |
| UI/behavior changes | — | **None** | **None** | **None** | **None** | **None** | **None** | **None** | **None** | **None** | **None** | **None** |

`App.js` still contains a god-component `MainApp` and the full screen tree as a giant `tab === "..."` switch. Cross-screen state is now in Zustand stores; remaining `useState` calls are modal toggles, form fields, temporary pickers, and search strings. Splitting the screen tree is the next target.

### Phases completed (✅)

1. **Data extraction** → `src/data/` (userTypes, areas, universities, feed, notasCorte, events, geo)
2. **Theme extraction** → `src/theme/palette.js`, `src/theme/avatar.js`
3. **Utilities & Firebase services** → `src/utils/{format,string,validation,dates,goals,filter}.js`, `src/services/{storage,auth,firestore,geo}.js`
4. **Standalone presentational components** → `src/components/{SBox,BottomSheet,Chip,EmptyState}.js`

Everything above is pure cut-and-paste. Zero behavioral risk.

### Additional utilities added (risk-free)

| File | Purpose | Status |
|------|---------|--------|
| `src/utils/dates.js` | Date helpers — only `getMonthFromKey` survived G.d; the rest were never imported | ✂️ trimmed in G.d |
| `src/utils/goals.js` | Goal helpers — never consumed (goal logic lives in screens) | ❌ deleted in G.d |
| `src/utils/filter.js` | Filter/sort helpers — never consumed (screens inline their filters) | ❌ deleted in G.d |
| `src/data/constants.js` | App-wide constants — never referenced | ❌ deleted in G.d |
| `src/data/subjects.js` | ENEM subject metadata (k/short/long/color) + `subjectScore(s, k)` that normalizes Redação to 0–100 | ✅ in use |
| `src/components/Chip.js` | Reusable filter chip — never used (chips are inline) | ❌ deleted in G.d |
| `src/components/EmptyState.js` | Reusable empty-state placeholder — never used | ❌ deleted in G.d |

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

**Phase C complete for the five main tabs.**

- ✅ `src/screens/explorar/FollowingScreen.js` (63 lines) — following-universities page. Pulls `unis`/`uniSort`/`uniPrefs` from `useUniversitiesStore`, computes the sorted `fol` list internally (by preference or exam month via `getMonthFromKey`). Props: `onBack`, `onExplore` (jumps to explorar tab), `onSelectUni`.
- ✅ `src/screens/explorar/BooksListScreen.js` (125 lines) — all-books-across-unis page. Pulls `unis` from `useUniversitiesStore`, `readBooks`/`setReadBooks` from `useProgressStore`, `currentUser` from `useAuthStore`. Owns `booksSearch`/`bookMenu` local state and the `persistReadBooks` Firestore write helper. Props: `onBack`, `currentData`.
- ✅ `src/screens/explorar/ExamsListScreen.js` (126 lines) — per-uni exams overview: upcoming strip + year-grouped accordions. Owns `examSearch`/`examSort`/`expandedYears` local state. Props: `selUni`, `onBack`, `onSelectExam`. Unmount-on-exit (triggered by MainApp's `showExamsPage` toggle) means state resets naturally each entry, so the old `setExpandedYears({}); setExamSearch(""); setExamSort("newest")` reset on the "open exams" button becomes implicit.
- ✅ `src/screens/explorar/UniversityDetailScreen.js` (154 lines) — uni detail overlay: header card, CTA to exams list, Próximo Vestibular block, courses chips, books checklist with tap-to-status menu, site link. Pulls `readBooks`/`setReadBooks` from `useProgressStore`, `currentUser` from `useAuthStore`. Owns `selectedBookYear`/`bookMenu` locally. Props: `selUni`, `onBack`, `onToggleFollow` (forwards to MainApp's `toggleFollow` since it does complex Firestore writes against two collections — `usuarios/{uid}.followedUnis` arrayUnion + `universidades/{id}.followersCount` increment — and still needs MainApp's `setUnis`/`setSU`/`setUserData` to reconcile the optimistic update on rollback), `onShowExams`, `currentData`.
- ✅ `App.js`: all four sub-page `render*` methods are now thin thunks. Removed 6 useState hooks from MainApp (`expandedYears`, `examSearch`, `examSort`, `bookMenu`, `booksSearch`, `selectedBookYear`). **−330 lines** net across the four extractions.

Remaining in `MainApp`: the `showExamsPage`/`showBooksPage`/`showFollowingPage` boolean toggles (will become navigator routes in Phase B), the `dArea` discover modal, the `toggleFollow` handler, and ~14 true modals (config/photo/edit-courses/name/grade/share/uni-search/location/saved/event/exam). These naturally belong to Explorar/Perfil sub-stacks once Phase B navigator routes replace the boolean toggles.

**Known deferred work for Phase C cleanup:** the `h*` handler wrappers (hStep/hDone/hUType/hC1/hC2) should eventually be absorbed by `onboardingStore` once per-slice persistence middleware exists (Phase A deferred item). Until then, passing them as props is fine.

### Remaining phases

---

## Remaining Plan (revised)

After the Phase C main-tab + sub-page extraction, what remains in `MainApp` (1,174 lines) is roughly:

- ~55 `useState` sites (most of them modal toggles + tmp-picker state)
- 13 bottom-sheet modals (`mCfg`, `mPho`, `mNome`, `mEdit`, `mEv`, `mGr`, `mShr`, `mDisc`, `mUni`, `mExam`, `mLoc`, `goalsModal`, `mSaved`)
- ~15 inline `setDoc(doc(db,"usuarios",uid), {...}, {merge:true})` sites, one per modal save
- The `onAuthChange` cascade (~55 lines of per-field `if (fbData.X) setX(...)`)
- `syncUserData` + `currentData()` + `h*` wrappers (Phase A deferred work)
- 4 boolean page toggles (`showExamsPage` / `showBooksPage` / `showFollowingPage` / `selUni`)
- Custom `BNav` bottom tab bar + `SBar` header

The original plan ended at "Phase C screen split → Phase D polish" and treated modals as "stay as `<Modal>`" — that conflated *presentation* (bottom sheet vs. route) with *location* (inlined in MainApp vs. own file). Modals should still be bottom sheets, but they should live in their own files; only then does the persistence middleware (Phase A deferred) have a clean target, and only then does the navigator (Phase B deferred) have routes to point at.

Revised phase order — each independently mergeable:

| Phase | Scope | Target delta |
|---|---|---|
| **C.1 — Deadwood sweep** | Remove `updateBookStatus` (unused since book status moved into BooksList/UniDetail), `examYear` (never read), orphaned useState, dead imports | App.js −30 lines; no UI change |
| **D — Modal extraction** | 13 PRs, one per modal, into `src/modals/`. MainApp passes only `visible`/`onClose` + any cross-store callbacks. Each modal owns its own tmp-picker useState and its own Firestore write (for now) | MainApp → ~500 lines; `tmp*` / `eC1`/`eC2`/`ePick`/`eSrch` / `goalsSearch` / tmp-geo all leave MainApp |
| **E — Persistence middleware** | `persistToUser` Zustand middleware subscribes each store's whitelisted keys and debounces `setDoc(doc(db,"usuarios",uid), partial, {merge:true})`. `authStore.hydrateFromFb(fbData)` collapses the 55-line cascade to 1 call. Delete `currentData()`, `syncUserData`, `h*` wrappers. Remove all 15 inline setDoc sites from modals | MainApp → ~350 lines; ~15 Firestore write sites → ~0 |
| **F — React Navigation execution** | AuthStack / OnboardingStack / MainTabs / ExplorarStack / PerfilStack. Kills `tab` / `showExamsPage` / `showBooksPage` / `showFollowingPage` / `selUni` booleans. Replaces custom `BNav` with `MainTabs.screenOptions`. ExamDetail / EventDetail may migrate from modal → route during this phase | MainApp → ~root auth/onboarding gate; page-boolean state machine gone |
| **G — Polish** (was Phase D) | TypeScript bottom-up, memo+FlatList on heavy lists, `useColorScheme()` instead of `Appearance.getColorScheme()`, error boundary, path aliases, ESLint/Prettier, Firestore rules review | Incremental quality; no single-PR target |

**Dependency notes:**
- D before E: trying to land E with 13 inline modals means touching each modal twice. Extracting first gives E exactly 13 tidy callsites to migrate.
- D and E can also interleave *per-modal* if you prefer small PRs (extract modal → migrate its write to store → repeat). Either ordering works.
- F after E is cleanest (so navigation code isn't mixed with store migration), but F can run in parallel with any modal that hasn't been extracted yet — they don't touch the same files.
- G waits for a stable structure. Don't start until D+E+F are merged.

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

## Phase B (was 6) — React Navigation (reference; executed as Phase F)

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

## Phase C.1 — Deadwood sweep

**Goal:** Remove unused code left behind by the Phase C extractions so downstream phases diff cleanly.

**Known targets:**
- `updateBookStatus` (App.js ~line 196) — defined but never called. Book-status writes now live in `BooksListScreen.persistReadBooks` and `UniversityDetailScreen.persistReadBooks`.
- `examYear` / `setExamYear` (App.js ~line 131) — defined but never read after the exam-detail modal was simplified.
- Any other orphaned `useState` or import surfaced by a grep sweep.

**Verification:**
- [ ] `grep <removed-identifier> App.js` returns 0 hits.
- [ ] App.js parses (`@babel/parser`).
- [ ] Book-status toggle still writes to Firestore from BooksListScreen & UniversityDetailScreen.

**Estimated delta:** −20 to −30 lines, 0 UI impact.

---

## Phase D — Modal extraction (✅ complete: 13 / 13 modals)

**Goal:** Move each of the 13 bottom-sheet modals out of `MainApp` into its own file under `src/modals/`. `MainApp` keeps only the `visible` / `onClose` wiring plus any cross-store callback it already passes today. This phase does *not* change the Firestore write pattern — each modal keeps its inline `setDoc` for now (those disappear in Phase E).

**Prerequisite:** C.1 merged (so the grep sweeps per modal don't surface dead code).

### Progress

Completed (App.js 1,174 → 528, −646 lines; ~11 useState sites eliminated):

- ✅ **D.1 ShareModal** (`mShr`) — props: `{item, onClose}`. Pure presentation + `Share.share(...)` native call. Inlined `TAG_L`/`TAG_D` maps with the feed tag metadata lives here now since ShareModal was the only MainApp consumer.
- ✅ **D.2 UniSortModal** (`mUni`) — pulls `unis`/`uniSort`/`uniPrefs` from `useUniversitiesStore` and computes the sorted `fol` list internally. Orphaned the MainApp-local `fol` derivation.
- ✅ **D.3 AddGradeModal** (`mGr`) — owns `ng` internally, seeded from `useProfileStore.ng` on visible. Writes `gs` via store setter. Orphaned `Platform`/`KeyboardAvoidingView` imports from MainApp.
- ✅ **D.4 SavedPostsModal** (`mSaved`) — pulls `saved`/`posts` from `usePostsStore`, folds in the `FEED` fallback internally. Takes optional `onSelectPost` callback. **Known pre-existing bug preserved as silent no-op:** the original MainApp tap handler called an undefined `setPost(...)`; extracted modal makes it `onSelectPost?.(item)` so the callback is currently unwired — behavior matches master (tap does nothing).
- ✅ **D.5 EventDetailModal** (`mEv`) — props: `{event, onClose}`. Pure presentation.
- ✅ **D.6 ExamDetailModal** (`mExam`) — props: `{exam, onClose}`. Two render modes (upcoming vs past) kept in one component.
- ✅ **D.7 DiscoverCoursesModal** (`mDisc`) — owns two-step `dArea` state with reset-on-close. Callback: `onPickCourse` wired to MainApp's `hC1`.
- ✅ **D.8 AvatarPickerModal** (`mPho`) — owns `tmpAv`/`tmpBgIdx`, seeded from `useProfileStore.av`/`avBgIdx` on visible. Takes `currentData` prop for the inline Firestore merge write (removed in Phase E).
- ✅ **D.9 EditNameModal** (`mNome`) — owns `tmpNome`/`tmpSobrenome`, seeded from store on visible. Same inline setDoc pattern.
- ✅ **D.10 EditCoursesModal** (`mEdit`) — owns `eC1`/`eC2`/`ePick`/`eSrch`, seeded from `useOnboardingStore.c1`/`c2` on visible. Callback: `onSave(c1, c2)` wired to MainApp's `hC1`/`hC2`. Three call sites (Perfil×2 + Settings row) collapsed from `setEC1(c1); setEC2(c2); setEpick(1); setEsrch(''); setMedit(true)` to plain `setMedit(true)`.
- ✅ **D.11 LocationSettingsModal** (`mLoc`) — owns all 10 picker/tmp-geo useStates internally, seeded from profileStore country/state/city + study* on visible. Inline setDoc preserved. Orphaned `countries`/`states`/`cities` `useGeoStore` selectors, 8 geo helper functions (`getCountry`/`getState`/`getCity`/`getStatesForCountry`/`getCitiesForState`/`getCountryDisplayName`/`getStateDisplayName`/`getCityDisplayName`), and `GEO_DATA` import out of MainApp.
- ✅ **D.12 GoalsModal** (`goalsModal`) — owns `goalsSearch` (reset on close). Toggles `goalsUnis` directly via `useUniversitiesStore.setGoalsUnis` (immediate mutation; save button only persists). Inline setDoc preserved. Orphaned `removeAccents` import.
- ✅ **D.13 SettingsModal** (`mCfg`) — extracted last so the sub-modal row handlers could collapse to `onClose(); onOpen*();` after all sub-modals self-seed. Pulls `nome`/`sobrenome`/`currentUser` directly from stores. Theme toggle keeps inline setDoc. Orphaned `lbl` style constant, `BottomSheet` import, `AVATAR_PRESETS` import, `fmtCount` import.

### Pattern lessons learned

- **Seed-on-visible is the key simplification:** every modal that owns tmp-picker state uses `useEffect(() => { if (visible) { setTmpX(storeX); ... } }, [visible])`. Before this pattern, MainApp had to call `setEC1(c1); setEC2(c2); setEpick(1); ...` at every open site (3 sites for EditCourses). After: `setMedit(true)`. Multiplies out across 8 modals' worth of seeding logic.
- **Orphan sweep is mandatory per extraction.** After each modal leaves, grep every identifier it owned — imports (`Platform`, `KeyboardAvoidingView`, `SBox`, `ScrollView`), derived values (`fol`, `feedItems`, `dArea`), and useState hooks. Missing one doesn't break the build (React just renders with an unused local) but bloats the delta.
- **Preserve known bugs as silent no-ops** when the extraction exposes them. SavedPostsModal's undefined `setPost` crashes would be new behavior; making the callback optional (`onSelectPost?.(item)`) preserves the master "tap does nothing" behavior exactly. Document in the commit message.

### Target layout

```
src/modals/
  SettingsModal.js         // mCfg
  AvatarPickerModal.js     // mPho  — owns tmpAv, tmpBgIdx
  EditNameModal.js         // mNome — owns tmpNome, tmpSobrenome
  EditCoursesModal.js      // mEdit — owns eC1, eC2, ePick, eSrch
  AddGradeModal.js         // mGr
  ShareModal.js            // mShr
  DiscoverCoursesModal.js  // mDisc — owns dArea
  UniSortModal.js          // mUni
  ExamDetailModal.js       // mExam
  EventDetailModal.js      // mEv
  LocationSettingsModal.js // mLoc  — owns all tmpCountry/tmpState/tmpCity + 4 search strings + 4 picker toggles
  GoalsModal.js            // goalsModal — owns goalsSearch
  SavedPostsModal.js       // mSaved
```

### Migration pattern (per modal)

1. Create `src/modals/<Name>Modal.js` wrapping `BottomSheet`. Props: `visible`, `onClose`, plus any callback the modal currently calls that lives in MainApp (e.g. `onLogout`, `onSelectPost` for SavedPostsModal → `setPost`).
2. Pull store reads inside the modal using Zustand selectors, same pattern as Phase C screens.
3. Move any `tmp*` / local-picker `useState` into the modal file. Seed them from store state on open (via the modal's own `useEffect(() => { if (visible) setTmpX(storeX); }, [visible])`).
4. Keep the inline `setDoc(...)` and `saveLocalUserData(...)` call exactly as-is — Phase E replaces these with store writes.
5. In `App.js`, replace the big `<BottomSheet>{...}</BottomSheet>` block with `<SettingsModal visible={mCfg} onClose={()=>setMcfg(false)} ... />`.
6. Delete the now-unused `useState` hooks from MainApp.
7. Parse-check + eyeball the flow.

### Special cases

- **LocationSettingsModal** — largest modal; owns 10+ useState hooks (4 tmp IDs × 2 + 4 search strings + 4 picker toggles). Consider extracting helper components (`<StatePicker>`, `<CityPicker>`) within the same file if it exceeds 300 lines.
- **ExamDetailModal** — has two render modes (`status === "upcoming"` vs. past). Keep both inside one component; do not premature-split.
- **DiscoverCoursesModal** — two-step (area list → course list). `dArea` is internal state, trivial.
- **GoalsModal** — only writes `goalsUnis` via `setDoc`; migrates cleanly in Phase E via `universitiesStore.setGoalsUnis + persist`.
- **SavedPostsModal** — reads `feedItems = posts.length ? posts : FEED`, which is MainApp-local. Either compute inside the modal (it can pull `posts` from `postsStore` itself) or lift `feedItems` to `postsStore` as a derived selector.

### Verification (per modal)

- [ ] Modal opens/closes with same animation; visible state unchanged.
- [ ] Save button still writes to Firestore (network tab check) and `/usuarios/{uid}` receives the same keys as before.
- [ ] No orphaned useState in MainApp after removal (grep the state name).
- [ ] `@babel/parser` passes.

**Actual delta:** App.js 1,174 → 528 lines. MainApp useState sites: 26 → 15. Phase D complete; all 13 modals live under `src/modals/` with self-owned tmp-picker state.

---

## Phase E — Persistence middleware & auth cascade

**Goal:** Eliminate the ~15 inline `setDoc(doc(db,"usuarios",uid), {...}, {merge:true})` sites scattered across modals by introducing a Zustand middleware that auto-syncs whitelisted keys. Collapse the 55-line `onAuthChange` cascade into a single store action. Delete the now-unneeded `currentData()` / `syncUserData` / `h*` wrappers.

**Prerequisite:** Phase D merged (so the write sites are all in modal files and the diff is narrow).

### The middleware

```js
// src/stores/middleware/persistToUser.js
// Subscribes to a whitelist of store keys. On change, debounces a merge-write to
// /usuarios/{currentUser.uid}. Also writes the whole slice to AsyncStorage.
//
// Usage:
//   export const useProfileStore = create(
//     persistToUser(
//       (set) => ({ theme: "auto", setTheme: (v) => set({ theme: v }), ... }),
//       { keys: ["theme", "av", "avBgIdx", "nome", "sobrenome", "countryId", ...], debounceMs: 500 }
//     )
//   );
```

The middleware listens to `authStore` for `currentUser` so it knows *which* user doc to write to. Debounce window defaults to 500 ms of silence (same as current `saveTimerRef`).

### `authStore.hydrateFromFb`

```js
// Replaces the ~55-line `if (fbData.X) setX(...)` cascade in App.js line ~266.
// authStore owns the cross-store fan-out, calling setters on every peer store.
hydrateFromFb: (fbData) => {
  useProfileStore.getState().hydrate(fbData);     // theme/av/nome/.../geo
  useOnboardingStore.getState().hydrate(fbData);  // step/done/uType/c1/c2
  useUniversitiesStore.getState().hydrate(fbData);// goalsUnis
  useProgressStore.getState().hydrate(fbData);    // readBooks/readingBooks/completedTodos
  usePostsStore.getState().hydrate(fbData);       // saved/liked
}
```

Each store's `hydrate(fbData)` is a ~5-line action that pulls its own keys.

### Cleanup in App.js

- Delete `currentData()` (line ~216) — no longer needed; stores own their slices.
- Delete `syncUserData` (line ~252) — replaced by middleware.
- Delete `hStep` / `hDone` / `hUType` / `hC1` / `hC2` wrappers — onboardingStore setters now auto-persist.
- Simplify `onAuthChange` effect to `authStore.subscribe()` which internally calls `hydrateFromFb(fbData)`.
- Remove `currentData` prop from every screen/modal that currently receives it.
- Remove every inline `setDoc(doc(db,"usuarios",uid),...)` call from extracted modals (13 sites).

### Migration pattern

1. Land the `persistToUser` middleware in isolation; wrap one small store first (e.g. `profileStore` with just `theme`). Verify writes still land in Firestore.
2. Add `hydrate(fbData)` action to each store; call from `authStore.hydrateFromFb`.
3. Swap the App.js `onAuthChange` cascade for `authStore.hydrateFromFb(fbData)`. Keep the old code commented-out for one commit to diff-check.
4. For each modal, replace `setDoc(...)` + `saveLocalUserData(...)` with the store's setter (which now auto-persists). Delete `currentData` prop drilling.
5. Drop `currentData` / `syncUserData` / `h*` once every caller is gone.

### Verification

- [ ] Change theme in Settings; Firestore doc shows `theme` updated after ~500 ms, nothing else changed.
- [ ] Add a goal; `goalsUnis` persists on reload.
- [ ] Cold-start with a logged-in user; all fields hydrate exactly as before.
- [ ] `grep "setDoc(doc(db,\"usuarios\"" App.js src/` — 0 hits outside the middleware.
- [ ] `grep "currentData" App.js src/` — 0 hits.

**Estimated delta:** App.js ~500 → ~350 lines; ~15 inline Firestore sites → 0.

### Progress

- ✅ **E.1** — Per-store `hydrate(d)` actions added (profile/progress/posts/universities); onboardingStore split into `hydrateFromLocal` / `hydrateFromFb` to preserve the `done===true`/`false`/neither branching. App.js local-load cascade (24 lines) and onAuthChange cascade (24 lines) each collapsed to 4 hydrate calls. App.js 528 → 490 lines.
- ✅ **E.2** — `persistToUser` middleware landed (suspend/resume, debounced Firestore + AsyncStorage flush, optional `serialize`).
- ✅ **E.3** — `profileStore` wrapped; inline `setDoc` dropped from Avatar / EditName / Location / Settings-theme.
- ✅ **E.4** — `onboarding` / `universities` / `progress` / `posts` stores wrapped; `currentData` / `syncUserData` / `h*` wrappers and all `currentData` prop drilling deleted. App.js 490 → 399 lines.

---

## Phase F — React Navigation execution (was Phase B)

Phase B was scaffolded (`RootNavigator` exists, wraps `<MainApp/>`) but the boolean state machine (`tab`, `showExamsPage`, `showBooksPage`, `showFollowingPage`, `selUni`) still drives routing. Now that every destination is its own screen file and modals are extracted, Phase B is unblocked. See the detailed plan in "Phase B (was 6)" above — it's unchanged except:

- `UniversityDetail`, `ExamsList`, `BooksList`, `Following` now point at the files created in Phase C (sub-pages).
- `ExamDetailModal` and `EventDetailModal` (extracted in Phase D) are candidates to become routes instead of modals during this phase, if deep-linkability is desired.
- Replaces the custom `BNav` component + `SBar` header — `MainTabs.screenOptions` owns both.

**Estimated delta:** MainApp becomes a thin root auth/onboarding gate; 4 page-boolean useStates deleted.

### Progress

- ✅ **F.1** — `RootNavigator` is now the splash/welcome/onboarding/main gate. Bootstrap effects (local load, `onAuthChange`, courses/geo/unis load, followed-unis apply, posts load) lifted into `useBootstrap` hook. `SplashScreen` extracted. `OnboardingScreen` reads its setters from the store directly (no more `h*` prop drill). App.js 399 → 307 lines.
- ✅ **F.2** — `MainTabs` (bottom-tabs navigator) owns the tab bar and header. `tab`/`setTab`, `SBar`, `BNav` deleted from MainApp. Handlers flow into tabs via context. Overlay pages render as absolute-fill siblings so the tab navigator stays mounted (state preserved across overlay open/close).
- ✅ **F.3** — `ExplorarStack` (native-stack) owns `UniversityList` / `UniversityDetail` / `ExamsList` / `BooksList` / `Following`. The 4 overlay booleans deleted; their mutation sites now do `navigation.navigate("ExplorarTab", { screen: "..." })`. Cross-tab nav from Feed/Perfil also uses stack nav. Tab header hides on non-root Explorar routes. App.js 221 → 179 lines.
- ⏭️ **F.4** — Skipped. A `PerfilStack` would contain only `Profile`: every other Perfil destination (`Goals`, `Discover`, `EditName`, `AvatarPicker`, `LocationSettings`, `EditCourses`) is explicitly listed as a bottom-sheet modal in the phase doc ("Keep these as `<Modal>`"). `ExamDetail` / `EventDetail` are also modals today; converting them to routes is deferred until deep-linking is actually needed.

---

## Phase G — Polish (was Phase D)

Once the structure is clean, tighten quality. Don't do any of this before C/D/E/F — premature optimization on a moving target.

### Progress

- ✅ **G.a (resilience)** — `src/theme/useTheme.js` centralizes theme derivation on top of React Native's live `useColorScheme()`; 29 files migrated off `Appearance.getColorScheme()` so OS theme changes propagate without restart. `ErrorBoundary` wraps the root and shows a retry screen instead of a blank crash. `src/services/logger.js` gates console output on `__DEV__`; 9 `console.log("...error")` catch sites now call `logger.warn`.
- ✅ **G.c (perf)** — `useMemo` wraps derived data pipelines across 7 screens: Feed (`fol`, `upcoming`), Explorar (`filtU`, `filterChips`), Notas (`tgt`, `radar`, `bars`, `filtN`, `filteredGrades`), ExamsList (`upcoming`, `filteredYears`), Following (`fol`), BooksList (`filteredBooks`, `readCount`/`readingCount`), Perfil (`tgt`, `followedCount`). Prevents filter/sort/map recomputation on unrelated re-renders.
- ✅ **G.d (deadcode sweep)** — Removed 5 fully-unused modules (`utils/filter.js`, `utils/goals.js`, `components/Chip.js`, `components/EmptyState.js`, `data/constants.js`) and trimmed partial exports (`utils/dates.js` → only `getMonthFromKey`; `services/firestore.js` dropped `saveUserDoc`; `data/stories.js` dropped `STORIES_SCHEMA`). −290 LOC, 0 UI impact. Pre-existing utility stubs from phases 3–4 were speculative; nothing in the live tree referenced them.
- ⏭️ **G.b (path alias)** — deferred: `babel-plugin-module-resolver` requires `npm install` + Metro cache clear; best done alongside a round of manual sim testing.
- ⏭️ **G.1 / G.5 / G.6** — deferred (TypeScript migration, Jest + @testing-library/react-native, ESLint/Prettier) — all require `npm install` of new toolchains; batch with the path-alias work when you're ready to sim-test.

### G.1 TypeScript migration (optional but recommended)

- Add `tsconfig.json` with `strict: true`, `jsx: react-native`.
- Rename files bottom-up: stores first, then services, then components, then screens.
- Define domain types in `src/types/`: `User`, `University`, `Post`, `Exam`, `Book`, `Grade`.
- Firestore types: write converter functions (`withConverter<T>`) per collection rather than scattering `as` casts.

### G.2 Performance

- Wrap list items in `React.memo`.
- Replace long `ScrollView`s with `FlatList` / `FlashList` (see below) — feed, universities, notas.
- Memoize filtered/sorted derived data with `useMemo` (currently recomputed every render).
- Audit `AnimatedValue.ref` usage; ensure no `new Animated.Value(...)` inside render body.
- Consider `react-native-reanimated` for the login button shake (already imported from deps).
- Use `@shopify/flash-list` for the feed if list grows beyond ~50 items.

### G.3 Correctness & UX

- Add an **error boundary** at the root (`src/app/ErrorBoundary.js`) that logs and shows a friendly fallback.
- Replace swallowed `try/catch {}` blocks with structured logging (`src/services/logger.js` — thin wrapper; console in dev, Sentry/Crashlytics in prod).
- Standardize all Alerts into a single `showConfirm`/`showError` helper to make them themeable and testable.
- Replace `Appearance.getColorScheme()` (called once at mount) with `useColorScheme()` so theme follows OS changes live.

### G.4 Security

- Audit `.env` usage — make sure no Firebase private keys are in client code. (The Firebase web SDK config is publicly shippable; anything else must stay server-side.)
- Add Firestore security rules review checklist; current client trusts that rules guard `/usuarios/{uid}` writes.
- Validate all user input at the boundary (signup form, edit profile) — `src/utils/validation.js` is the home for new validators (email, birthdate, name).
- Rate-limit writes on the client (the `prefsInitRef` debounce is a start) to prevent accidental Firestore quota burn.

### G.5 Testing

- Unit-test pure modules first: `src/utils/*`, validation, formatters, store reducers (Zustand supports `create` outside React → pure function tests).
- Integration-test stores against a Firestore emulator (`firebase-tools`).
- Component smoke tests with `@testing-library/react-native` — start with auth screens.
- No E2E until flows stabilize.

### G.6 Developer experience

- Add ESLint + Prettier with a shared config.
- Add a `path` alias `@/` → `src/` in `babel.config.js` (`babel-plugin-module-resolver`) so imports stop being `../../../services/...`.
- Consider Expo Router if you ever want file-based routing — but not now; React Navigation is fine.

### G.7 Analytics / observability (when relevant)

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

| Phase | Status | Rough size | Risk |
|---|---|---|---|
| A — Zustand stores | ✅ done | ~9 stores, ~400 lines cut from App.js | Medium (state migrations subtle) |
| B — React Navigation (scaffolding) | ✅ done | `RootNavigator` + `linking`; stacks landed in F | Low (shim only) |
| C — Screen split (main tabs + sub-pages) | ✅ done | 11 screens, ~1,900 lines moved | High (many cuts, easy to drop a prop) |
| C.1 — Deadwood sweep | ✅ done | Absorbed into D extractions (per-modal orphan cleanup) | Trivial |
| D — Modal extraction | ✅ done | 13 modals under `src/modals/`, App.js 1,174 → 528 | Low per modal, medium aggregate |
| E — Persistence middleware & auth cascade | ✅ done | `persistToUser` middleware + 5 `hydrate` actions; inline `setDoc` sites eliminated; App.js 528 → 399 | Medium (touches every store's write path) |
| F — React Navigation execution (was B) | ✅ done | `RootNavigator` / `MainTabs` / `ExplorarStack` landed; 4 page booleans deleted; App.js 399 → 179. F.4 (PerfilStack) skipped — every Perfil destination is a modal | Low if staged, High if rushed |
| G — Polish (was D) | 🟡 partial | G.a (resilience) + G.c (perf) + G.d (deadcode) done. G.b (path alias) + G.1/G.5/G.6 (TS/Jest/ESLint) deferred — all need `npm install` | Low per change |

Execution order: **C.1 → D → E → F → G**. D and E can interleave per-modal if you prefer smaller PRs. Remaining G items (path alias, TS, tests, lint) are all gated on `npm install` + Metro cache clear and are best batched with a round of manual sim-testing.
