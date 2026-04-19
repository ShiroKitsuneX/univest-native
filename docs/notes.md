# Univest - Feature Notes & Ideas

This document contains all feature ideas, improvements, and planned enhancements for the Univest app, organized by the app's navigation structure.

---

## TABLE OF CONTENTS

1. [Onboarding](#1-onboarding)
2. [Auth](#2-auth)
3. [Feed Tab](#3-feed-tab)
4. [Explorar Tab](#4-explorar-tab)
5. [Notas Tab](#5-notas-tab)
6. [Perfil Tab](#6-perfil-tab)
7. [Ongoing Screens](#7-ongoing-screens)
8. [UI/UX Improvements](#8-uiux-improvements)
9. [Tech Considerations](#9-tech-considerations)
10. [Action Items](#10-action-items)

---

## 1. ONBOARDING

### Welcome Screen
- Slogan: "Seu portal inteligente para todos os momentos da sua jornada acadêmica"
- Button: "Começar Jornada"
- Remove ">" from selection cards

### Interests Selection (Page)
Select one or more areas:
- Ensino Médio e Técnico
- Vestibulares e ENEM
- Graduação
- Mestrado
- Doutorado
- Pós-doutorado
- Pesquisadores

### User Profile Selection (Page)
"O que melhor descreve você agora? (Você pode alterar depois)"

| Option | Description |
|--------|-------------|
| Ensino Médio | Cursando o ensino médio regular |
| Ensino Médio Técnico | ex: COTUCA, ETEC, SENAI, IFSP |
| Pré-vestibulando | Me preparando para vestibulares |
| Foco no ENEM | Estudando para o ENEM / SISU |
| Graduando | Cursando uma graduação |
| Pré-mestrado | Buscando uma vaga em mestrado |
| Mestrando | Cursando o mestrado |
| Pré-doutorado | Buscando uma vaga em doutorado |
| Doutorando | Cursando o doutorado |
| Pós-doutorando | Realizando pesquisa pós-doutoral |
| Educação Continuada | Cursos livres, MBA, Especializações |

Each option needs its own screen (e.g., pré-vestibulando → list courses)

### Follow Universities (Page)
"Você verá as novidades delas no seu feed"

- Filter based on user profile selection
- Show universities user wants to follow

---

## 2. AUTH

### Login / Signup (Page)
- Make name mandatory during account creation
- Terms and Conditions link
  - Should open as Modal or Page
  - Include basic placeholder content

---

## 3. FEED TAB

### Current Features (Page)
- Posts from followed universities
- Academic news
- Events
- Opportunities (internships, scholarships)
- Personalized feed by interest area

### Proposed Improvements

#### Calendar Summary (replace stories)
- Show upcoming events
- Quick tap to see details
- Monthly summary view

#### Quiz Mode (future - could be Modal or Page)
- Subject-specific quizzes
- General knowledge quizzes
- Timed mode

---

## 4. EXPLORAR TAB

### Current Features (Page)
- Search universities
- Search courses
- Search vestibulares
- Search events
- Lists: Notas de Corte, University Rankings
- My followed universities

### Proposed Improvements

#### Filters (Fields)
- By location (city, state)
- By course
- By difficulty
- By cost (free, paid)
- By duration

#### Past Exams
- All past exams from all vestibulares (future)
- Previous years exams
- Answer keys
- Mock exams history

#### ENEM Profile (Page)
Create as its own "university" profile with:
- Exam dates
- Requirements (ID, pen colors allowed)
- Notes de corte history
- Previous exams
- Study tips
- Registration dates

#### University Details (Page)
- **Verified Badge** ✓ - for accredited universities that control their pages
  - Blue checkmark ✓ next to name
  - "Verified" label
  - Manual verification in database
- All past exams per university
- Previous mock exams
- Previously required books
- Historical notes de corte
- Exam format changes over time
- Requirements per exam (pen color, ID, food, documents, etc.)

#### Tutor / Teacher Profiles (future - Page)
Explore idea:
- Private tutors listing
- Subject specialists
- Ratings and reviews
- Contact information
- Available for classes
- Questions: Separate tab? Verify? Booking?

---

## 5. NOTAS TAB

### Current Features (Page)
- Register notes (ENEM, vestibulares, university grades)
- Notes history
- Compare with notes de corte
- Simulate admission possibilities

### Proposed Improvements

#### Exams Separation (Card)
- **Real Exams** - official exams user has taken (ENEM, FUVEST, UNICAMP, etc.)
- **Mock Exams / Simulados** - practice tests done

#### Charts (Card)
Display counts: Real Exams vs Mock Exams

**Chart Views (toggle):**
- By Month - how many per month
- By Year - how many per year
- All Time - since first exam

```
┌─────────────────────────────────────┐
│         EXAMS OVERVIEW              │
├─────────────────────────────────────┤
│  Real Exams: ████ 24              │
│  Mock Exams: ████████████ 112    │
├─────────────────────────────────────┤
│  [Month] [Year] [All Time]        │
│  ┌─────────────────────────────┐   │
│  │   Chart visualization     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Filters (Fields)
- Filter by subject/year/exam type

#### Messaging (Change text)
"Esta nota de corte..." → **"Os cursos selecionados guiam toda a análise abaixo"**

---

## 6. PERFIL TAB

### Current Features (Page)
- Personal data
- Edit profile
- Goals
- Settings
- Discover new areas
- Logout

### Proposed Improvements

#### Profile Items - Modular (Cards)
Users customize which sections appear and order.

**Proposed Order/Sections:**
1. Personal Info (name, location, study location)
2. Universities Following
3. Exams Taken
4. Saved Content
5. Goals / TODO
6. Calendar
7. Achievements / Gamification
8. Settings

#### Home / Study Location (Fields in Profile)
- Add current city/state
- Add desired study city/location

#### Universities Following ("Universidades que sigo")
**Problem:** Icons too large, no sorting

**Solution:**
1. **Smaller Icons Grid** (Card)
   - Small circular format
   - 4-6 icons per row
   - Clean grid layout

2. **Sorting Options** (Fields)
   - **By Date** - based on exam dates (soonest first)
   - **By Preference** - rank by how much you want to get in

3. **Edit Screen** (Page - accessible via link, not new tab)
   - Drag and drop reordering
   - Mark preference (1st choice, 2nd choice, etc.)
   - Set exam date reminders

#### Universities to Take Vestibular (New Page/Modal)
Separate from "Following":
- Universities user intends to take exam
- Affects recommendations
- Shows TODO like books to read

#### TODO Based on Chosen Universities (Page)
- "Read these books"
- "Study this topic"
- "Writing style: letter"
- Auto-generate from university data (books in DB)

#### Exams - Countdown (Card/Modal)
- Add upcoming exams
- **Countdown display**: "X days until [exam name]"
- Show exam dates user is planning to take

#### Calendar (Page in Profile)
- Monthly view
- Add exam dates
- Add study sessions
- Add important deadlines

#### Saved Content (Page/Modal)
**Improvements:**
- Better organization (folders, tags, categories)
- Quick access search bar
- Thumbnails for visual recognition
- Categories: "Universities", "Courses", "Exams", "Study Materials"
- Option to add personal notes

#### Books Read (Page/Card)
- Section for books read
- Checkmark when completed
- Compare with required books per university

#### Gamification

1. **Exam Countdown** (Card)
   - Show upcoming exams
   - Display "X days until [exam name]"
   - Notifications as date approaches

2. **Achievements / Badges** (Page/Card)
   - First exam taken
   - 10 mock exams completed
   - University followed milestone
   - Study streak (consecutive days)

3. **Progress Tracking** (Page)
   - Study hours logged
   - Books read
   - Topics mastered

4. **Streaks** (Field/Card)
   - Daily login streak
   - Study streak
   - Notes updated streak

5. **Leaderboard** (future)
   - Compare with friends
   - Study group rankings

#### Acceptance Celebration (Modal)
When user marks acceptance:
- Confetti animation
- Option to set uni as profile background
- Multiple acceptances celebration
- Share option

---

## 7. ONGOING SCREENS

These are screens accessed from multiple places:

- **University Detail** (Page) → from Explorar or Feed
- **Course Detail** (Page) → from university or search
- **Exam Detail** (Page) → from university
- **Post Detail** (Page) → from Feed
- **Saved Items** (Page) → from Profile
- **Edit Universities** (Page) → from Profile (link, not tab)

### Flashcard Mode (future - Page or Modal)
- User creates own flashcards
- Pre-made subject flashcards
- Study mode

---

## 8. UI/UX IMPROVEMENTS

### Terminology Clarification

| Term | Definition |
|------|-------------|
| **Page** | Full screen content (e.g., Feed, Profile) |
| **Modal** | Overlay covering part of screen (bottom sheets) |
| **Popup** | Small overlay for confirmations/alerts |
| **Field** | Input area for text/data |
| **Card** | Container for content blocks |
| **Tab** | Bottom navigation item |

### Other Changes
- Remove ">" from selection boxes
- Improve tap animations
- Better loading states
- Empty states with helpful messages
- Better animation on "Entrar ou criar conta"

---

## 9. TECH CONSIDERATIONS

### Database Options
- **SQLite** for local data (future consideration)
- **SQL DB** for backend (explore)
- Current: Firebase Firestore

### Opportunities Section (future - could be new Tab or Page)
- **Job Openings** - new section
- **Internships** - listings
- **Scholarships** - general, FIES info
- **Scientific Initiation** - research positions
- **Monitoring** - positions
- **Extension Projects** - programs
- **Companies** - register to offer internships

---

## 10. ACTION ITEMS

### High Priority
- [ ] Make profile items modular
- [ ] Split exams into real vs mock
- [ ] Add exam charts (month, year, all-time)
- [ ] Add exam countdown
- [ ] Improve University Following (smaller icons, sorting)
- [ ] Add home/study location to profile
- [ ] Create ENEM profile
- [ ] Add exam requirements (pen color, documents, etc.)
- [ ] Add "universities to take vestibular" section
- [ ] Make name mandatory during signup

### Medium Priority
- [ ] Add calendar to profile
- [ ] Add calendar summary to feed
- [ ] Improve saved content organization
- [ ] Add gamification elements
- [ ] Add verified badges
- [ ] Expand university details (past exams, books)
- [ ] Add todo based on chosen universities
- [ ] Add acceptance celebration
- [ ] Add books read section

### Low Priority
- [ ] Quiz mode
- [ ] Flashcard mode
- [ ] Tutor profiles
- [ ] Job openings section
- [ ] Scholarships section
- [ ] FIES info
- [ ] Flashcard by subject
- [ ] Filter options in explore
- [ ] Filter options in notes
- [ ] All past exams database
- [ ] Leaderboard