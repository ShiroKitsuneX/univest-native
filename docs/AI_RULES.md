# AI RULES (MANDATORY)

You must follow these rules when working on this project.

---

## SOURCE OF TRUTH ORDER

Always follow these documents in this order:

1. `/docs/APP_MAP.md`
2. `/docs/ARCHITECTURE.md`
3. `/docs/FIREBASE_GUIDE.md`
4. `/docs/DEVELOPMENT_GUIDE.md`
5. `/docs/ANTI_PATTERNS.md`

`APP_MAP.md` defines product truth.
The other documents define how that product truth must be implemented.

---

## CORE PRINCIPLE

Complexity is allowed, but only when responsibility stays explicit.

You must optimize for:

- clear ownership
- reuse
- predictability
- low-context maintainability

---

## BEFORE WRITING CODE

You MUST:

1. identify the affected account type:
   - common user
   - institution user
   - both
2. identify the primary domain:
   - auth
   - onboarding
   - feed
   - explore
   - notes
   - profile
   - planning
   - institution
   - reference/catalog
3. check `APP_MAP.md` for the relevant product behavior
4. inspect the existing screen, modal, store, service, and repository
5. determine the correct owner for:
   - UI
   - business logic
   - Firebase access
   - shared state

If this is not clear, do not improvise.

---

## PRODUCT INVARIANTS (MANDATORY)

You MUST preserve these distinctions:

- `followedUnis` is not `goalsUnis`
- notes are not goals
- common account is not institution account
- remote authoritative data is not the same as fallback seed data
- feature modals are first-class product surfaces, not miscellaneous extras

If your solution blurs any of these concepts, it is wrong.

---

## STRUCTURE RULES

- New product code should prefer the owning feature folder
- New infrastructure code should go to `app/`, `core/`, or shared infrastructure
- Do NOT create new domain-heavy logic in generic root utility buckets when a feature owner exists
- Do NOT add new feature logic to `App.js`-style root shells or navigation files
- Do NOT create new `.js` files in active app layers; prefer `.ts` and `.tsx`
- Use `@/` alias imports for internal modules

---

## FIREBASE RULES

- NEVER call Firebase directly from screens, components, or modals
- Use repositories for Firebase reads/writes
- Use services for orchestration, validation, optimistic updates, and rollback
- Use centralized Firestore path helpers
- Do NOT duplicate query definitions or path-building logic
- Do NOT use store middleware as a shortcut for new complex backend actions

---

## STATE RULES

- Keep ephemeral UI state local
- Keep shared feature state in a feature-owned store
- Keep app-wide state only when it is truly cross-feature
- Do NOT create a second source of truth for the same concept
- Do NOT merge different product concepts into one state slice because it is convenient

---

## REUSE RULES

Before creating anything new, check in this order:

1. existing screen
2. existing modal
3. existing store action
4. existing service
5. existing repository
6. existing selector/helper
7. existing reference data

Prefer:

1. reuse
2. extend
3. extract
4. create new only if the existing owner is wrong

---

## ANTI-PATTERNS (STRICT)

Do NOT introduce:

- scattered Firebase calls
- duplicated queries
- hidden ownership
- mixed product concepts
- new generic dumping-ground files
- architecture changes without doc updates
- student logic leaking into institution flows
- seed/fallback logic handled directly in UI

---

## VALIDATION BEFORE RESPONDING

Before answering or committing code, you MUST verify:

1. Does this follow `APP_MAP.md`?
2. Does this follow `ARCHITECTURE.md`?
3. Am I duplicating an existing capability?
4. Is UI separated from backend access?
5. Is the state owner clear?
6. Am I respecting common vs institution mode?
7. Am I respecting followed vs goals and notes vs goals?
8. Did I place code in the correct domain owner?

If any answer is “no” or “not sure”, fix the approach first.

---

## DOCUMENTATION RULES

Update docs when relevant:

- update `APP_MAP.md` for meaningful product behavior changes
- update architecture docs for meaningful structural changes
- do not leave new patterns undocumented

---

## OUTPUT RULES

- show only necessary files and changes
- keep explanations clear and structured
- explicitly state ownership and validation when useful
- do not hide architectural tradeoffs

---

## FAILURE HANDLING

If you realize your current approach breaks a rule:

1. stop
2. identify which rule is being broken
3. correct the structure
4. only then provide the final solution

---

## FINAL INSTRUCTION

Your goal is not only to make the app work.

Your goal is to keep Univest buildable, understandable, and extendable by multiple AI tools over time without structural drift.
