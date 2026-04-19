# Univest Native — Migration Plan

Staged refactor of the monolithic `App.js` into a scalable, feature-oriented architecture without changing behavior or UI.

---

## 0. Current State

| | Before | After Phases 1–4 | After Phase A |
|---|---|---|---|
| `App.js` | 3,084 lines | ~2,570 lines | ~2,549 lines |
| `MainApp` `useState` sites | ~80 | ~80 | 57 (modals/forms/temp) |
| Modules under `src/` | 1 (firebase config) | 16 | 24 |
| Firebase calls inline in App | ~25 sites | ~15 sites | ~10 sites |
| UI/behavior changes | — | **None** | **None** |

`App.js` still contains a god-component `MainApp` and the full screen tree as a giant `tab === "..."` switch. Cross-screen state is now in Zustand stores; remaining `useState` calls are modal toggles, form fields, temporary pickers, and search strings. Splitting the screen tree is the next target.

### Phases completed (✅)

1. **Data extraction** → `src/data/` (userTypes, areas, universities, feed, notasCorte, events, geo)
2. **Theme extraction** → `src/theme/palette.js`, `src/theme/avatar.js`
3. **Utilities & Firebase services** → `src/utils/{format,string,validation}.js`, `src/services/{storage,auth,firestore,geo}.js`
4. **Standalone presentational components** → `src/components/{SBox,BottomSheet}.js`

Everything above is pure cut-and-paste. Zero behavioral risk.

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
