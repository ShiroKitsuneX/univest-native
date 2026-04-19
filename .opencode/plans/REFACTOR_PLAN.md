# Migration Plan: App.js Refactoring

## Current State

- **App.js**: 3084 lines (Plain JavaScript)
- **No TypeScript**: files are `.js`
- **Git Status**: main branch
- **Platform**: React Native (Expo SDK 54)

---

## Answers to Start

1. **TypeScript**: No - keep as JavaScript (best for this project size)
2. **Branch**: Single `refactor/` branch with commits per phase

---

## Proposed Structure

```
src/
├── constants/           // ~500 lines (data, not logic)
│   ├── index.js
│   ├── userTypes.js     // USER_TYPES
│   ├── areas.js        // AREAS
│   ├── courses.js      // ALL_COURSES
│   ├── universities.js // UNIVERSITIES
│   └── events.js      // EVENTS (FEED, NOTAS_CORTE inline)
├── theme/              // ~100 lines
│   ├── index.js       // Exports T, AT, isDark
│   └── colors.js     // DK, LT, theme()
├── services/           // Firebase + Auth
│   ├── index.js      // db, auth exports
│   └── auth.js      // onAuthStateChanged, signIn, etc.
├── screens/          // Main screen renders (~800 lines)
│   ├── FeedScreen.js
│   ├── ExplorarScreen.js
│   ├── NotasScreen.js
│   └── PerfilScreen.js
└── utils/             // Helper functions (~300 lines)
    ├── index.js
    ├── formatters.js // fmtCount, avg, timeAgo
    └── validation.js // isValidEmail, etc.
```

---

## Migration Phases

### Phase 1: Constants & Theme (Low Risk) - 600 lines
- Extract USER_TYPES, AREAS, UNIVERSITIES to `src/constants/`
- Extract DK, LT colors + styles to `src/theme/`
- Risk: Low

### Phase 2: Services (Medium Risk) - 200 lines
- Move Firebase to `src/services/`
- Separate auth logic
- Risk: Medium

### Phase 3: Screens (High Risk) - 800 lines
- Move 4 render functions
- Pass all props/context
- Risk: High

### Phase 4: Utils (Medium Risk) - 300 lines
- Move helpers
- Risk: Medium

### Phase 5: App.js Cleanup - 300→200 lines
- Import from new locations
- Risk: Low

---

## Git Workflow

```
main
  └── refactor/phase-1  (constants + theme)
       └── refactor/phase-2  (services)
            └── refactor/phase-3  (screens)
                 └── refactor/phase-4  (utils)
                      └── refactor/phase-5  (cleanup → merge)
```

Each phase = one commit

---

## Testing

After each phase run:
```bash
npx expo start
```
Press `i` → verify app loads → test navigation → commit

---

## Estimated: ~3 hours total

| Phase | Files | Time |
|-------|-------|------|
| 1 | 8 | 30 min |
| 2 | 3 | 30 min |
| 3 | 4 | 60 min |
| 4 | 4 | 30 min |
| 5 | 1 | 20 min |