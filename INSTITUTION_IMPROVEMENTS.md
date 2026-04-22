# Institution Account Improvements - Plan for Claude

## Current Issues to Fix

### 1. Remove User-Specific Features from Institution Account

These features should be removed/hidden for institution accounts:

| Feature                | Current         | Required                                                                 |
| ---------------------- | --------------- | ------------------------------------------------------------------------ |
| Editar opções de curso | Available       | **Remove** - not applicable                                              |
| Localização            | User's location | **Change** to institution's address (country, state, city, full address) |
| Metas de vestibular    | Available       | **Remove** - not applicable                                              |
| E-mail                 | User email      | **Change** to contact info (show on university details)                  |
| Settings icon          | 1 in PerfilTab  | **Fix** duplicate - 2 icons showing                                      |

### 2. Add Institution-Specific Features

| Feature                                | Priority |
| -------------------------------------- | -------- |
| Edit profile picture (university logo) | HIGH     |
| Followers count display                | HIGH     |

### 3. Data Architecture Issues

Many institution fields are hardcoded in `universities.js`. All editable fields should:

- Come from Firebase `universidades/{uniId}` document
- Be editable via InstitutionAdminScreen
- Follow the architecture (service → repository → Firestore)

---

## Required Data Fields for Institutions

Based on the requirements, here's the data model:

### Institution Document (`usuarios/{uid}` for institution accounts)

```typescript
type InstitutionData = {
  tipo: 'instituicao'
  linkedUniId: string
  // Contact info (editable)
  email: string
  phone?: string
  website?: string
  // Location (editable - new)
  country: string // e.g., "Brasil"
  state: string // e.g., "SP"
  city: string // e.g., "Campinas"
  address: string // Full address
  // Profile (editable - new)
  logoUrl?: string // University logo from Firebase Storage
}
```

### University Document (`universidades/{uniId}`)

```typescript
type UniversityData = {
  name: string
  fullName: string
  color: string
  city: string
  state: string
  // Existing editable fields
  description: string
  vestibular: string
  inscricao: string
  prova: string
  site: string
  courses?: string[]
  books?: string[]
  exams?: unknown[]
  // New fields
  logoUrl?: string
  address?: string
  contactEmail?: string
  phone?: string
  // Counts
  followersCount: number
}
```

---

## Files to Modify

### High Priority (Issues Fix)

1. **InstitutionAdminScreen.tsx**
   - Remove: "Editar opções de curso", "Metas de vestibular"
   - Change: "Localização" → institution address fields
   - Change: "E-mail" → contact info
   - Add: profile picture/logo editor
   - Add: followers count display
   - Fix: Remove duplicate settings icon

2. **SettingsModal.tsx** (or create InstitutionSettingsModal)
   - Create separate modal for institutions
   - Different options for institution vs user

### Medium Priority (Architecture)

3. **universitiesRepository.ts**
   - Add functions for updating institution profile fields
   - Add: updateInstitutionProfile(), updateInstitutionContact(), updateInstitutionLocation()

4. **universityService.ts**
   - Add service functions for institution-specific updates

5. **InstitutionAdminScreen.tsx - Use Service Layer**
   - Replace direct state with service calls
   - Follow: UI → Service → Repository → Firebase

---

## Firestore Structure

```
universidades/{uniId}
├── name, fullName, color, city, state (static)
├── description, vestibular, inscricao, prova, site (editable via InstitutionAdminScreen)
├── logoUrl (NEW - from Firebase Storage)
├── contactEmail (NEW - denormalized from user doc)
├── phone (NEW)
├── address, country, state, city (NEW - institution address)
└── followersCount (computed)

usuarios/{uid} (for institution accounts)
├── tipo: 'instituicao'
├── linkedUniId: string
├── email (contact)
├── phone, website (contact)
├── country, state, city, address (location - NEW)
├── logoUrl (NEW - profile picture)
```

---

## Development Flow (per DEVELOPMENT_GUIDE.md)

```
data contract → repository → service → store → UI → verification
```

### Step 1: Update Repository

- Add: `updateInstitutionProfile()`, `updateInstitutionContact()`, `updateInstitutionLocation()` to universitiesRepository.ts

### Step 2: Update Service

- Add:对应的 service functions in universityService.ts

### Step 3: Update Store (optional)

- If shared state needed

### Step 4: Update UI

- Modify InstitutionAdminScreen.tsx to use service layer
- Add/remove fields as specified

---

## Testing Checklist

- [ ] Institution login skips onboarding
- [ ] Institution sees InstitutionAdminScreen
- [ ] No "Editar opções de curso" option
- [ ] No "Metas de vestibular" option
- [ ] Location shows institution address fields
- [ ] Email shows as contact info
- [ ] Can edit profile picture/logo
- [ ] Can see followers count
- [ ] Only one settings icon in Perfil tab
- [ ] Changes save to Firestore correctly
- [ ] User account still works normally

---

## Notes for Claude

1. **Follow the architecture** - Use service → repository → Firebase flow
2. **Don't mix concerns** - Keep UI, business logic, and Firebase separate
3. **Reuse existing patterns** - Follow what's already done for stories and posts
4. **Test both accounts** - Make sure institution changes don't break regular users
