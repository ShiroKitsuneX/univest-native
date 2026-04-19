# Univest - Feature Notes & Ideas

This document contains all feature ideas, improvements, and planned enhancements for the Univest app.

---

## Profile (Modular Items)

Profile items should be modular, meaning users can customize which sections appear on their profile and in what order.

**Proposed Profile Sections:**
- Personal Info (name, location, study location)
- Universities Following (with sorting options)
- Exams Taken (real vs mock separation)
- Saved Content
- Goals / TODO
- Calendar
- Achievements / Gamification
- Settings

---

## Exams ("Provas")

### Separation: Real Exams vs Mock Exams
- "Real Exams" - official exams the user has taken (ENEM, FUVEST, UNICAMP, etc.)
- "Mock Exams" / "Simulados" - practice tests the user has done

### Charts & Analytics
Display charts showing:
- **Real Exams Taken** - count and history
- **Mock Exams Taken** - count and history

**Chart Views:**
- By Month - how many exams per month
- By Year - how many exams per year
- All Time - since the first exam taken

**Implementation:**
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

---

## Saved Content

Currently displays posts/links saved for later.

**Improvements:**
- Better organization (folders, tags, categories)
- Quick access search bar
- Add thumbnails for visual recognition
- Create categories: "Universities", "Courses", "Exams", "Study Materials"
- Option to add personal notes to saved items

---

## Gamification

### Ideas:

1. **Exam Countdown**
   - Show upcoming exams in profile/feed
   - Display "X days until [exam name]"
   - Notifications as date approaches

2. **Achievements / Badges**
   - First exam taken
   - 10 mock exams completed
   - University followed milestone
   - Study streak (consecutive days)

3. **Progress Tracking**
   - Study hours logged
   - Books read
   - Topics mastered

4. **Streaks**
   - Daily login streak
   - Study streak
   - Notes updated streak

5. **Leaderboard** (optional/future)
   - Compare with friends
   - Study group rankings

---

## Universities Following ("Universidades que sigo")

### Current Issues:
- Icons too large
- Poor organization
- No sorting options

### Proposed Solution:

**1. Smaller Icons Grid**
- University crest/logo in small circular format
- 4-6 icons per row
- Clean grid layout

**2. Sorting Options:**
- **By Date** - based on exam dates (soonest first)
- **By Preference** - rank universities by how much you want to get in

**3. Edit Screen**
- Accessible via link from profile (not new tab)
- Drag and drop reordering
- Mark preference (1st choice, 2nd choice, etc.)
- Set exam date reminders

---

## ENEM as "University" Profile

Create ENEM as its own profile similar to universities:

- Exam dates
- Requirements (ID, pen colors allowed, etc.)
- Notes de corte history
- Previous exams
- Study tips
- Registration dates

---

## Tutor / Teacher Profiles

Explore this feature for:

- Private tutors listing
- Subject specialists
- Ratings and reviews
- Contact information
- Availability for classes

**Questions to explore:**
- Should this be a separate tab?
- How to verify tutors?
- Allow booking through app?

---

## Calendar

### Profile Calendar
- Monthly view
- Add exam dates
- Add study sessions
- Add important deadlines (registration, documents)

### Feed Calendar Summary
- Replace "stories" area
- Show upcoming events
- Quick tap to see details

---

## Verified Badge

For universities that:
- Are officially accredited
- Control their own pages
- Have verified accounts

**Implementation:**
- Blue checkmark ✓ next to university name
- Show "Verified" label on profile
- Manual verification in database

---

## University Details

Expand to include:
- All past exams (years previous)
- Previous mock exams
- Previously required books
- Exam format changes over time
- Historical notes de corte

---

## Opportunities (Future Features)

### Job Openings
- New section for job opportunities
- Internship listings
- Part-time work

### Scholarships
- General scholarships
- Financial aid (FIES info)
- Merit-based scholarships
- Research grants

### Scientific Initiation
- Research opportunities
- Monitoring positions
- Extension projects

### Companies
Register companies that offer:
- Internships
- Scholarships
- Training programs

---

## Filters

### Explore Filter
- By location (city, state)
- By course
- By difficulty
- By cost (free, paid)
- By duration

### Notes Filter
- Filter by subject
- Filter by year
- Filter by exam type

---

## Acceptance Celebration

When user marks they got accepted into a university:

**Features:**
- Confetti animation
- Option to set university as profile background
- Celebration for multiple acceptances
- Share option

---

## UI/UX Improvements

### Terminology Clarification

| Term | Definition |
|------|------------|
| **Page** | Full screen content (e.g., Feed, Profile) |
| **Modal** | Overlay that covers part of screen (bottom sheets) |
| **Popup** | Small overlay for confirmations/alerts |
| **Field** | Input area for text/data |
| **Card** | Container for content blocks |
| **Tab** | Bottom navigation item |

### Other UI Changes:
- Remove ">" from selection boxes
- Improve click animations
- Better loading states
- Empty states with helpful messages

---

## Terms and Conditions

Add terms accessible from signup:
- Open as a modal or full page
- Include basic terms placeholder
- Link from signup form

---

## Additional Ideas

### Study Materials
- Add section for books read
- Checkmark system when book is completed
- Compare with required books per university

### Messaging
- Replace "Esta nota de corte..." with "Os cursos selecionados guiam toda a análise abaixo"

### Notes Section
- TODO based on chosen universities
  - "Read these books"
  - "Study this topic"
  - "Writing style: letter"

### Flashcard Mode
- User creates own flashcards
- Pre-made subject flashcards
- Study mode

### Quiz
- Subject-specific quizzes
- General knowledge quizzes
- Timed mode

---

## Tech Considerations

### Database Options
- SQLite for local data (consider in future)
- SQL DB for backend (explore)
- Current: Firebase Firestore

---

## Action Items (Priority Order)

### High Priority
- [ ] Make profile items modular
- [ ] Split exams into real vs mock
- [ ] Add exam charts (month, year, all-time)
- [ ] Add exam countdown
- [ ] Improve University Following (smaller icons, sorting)
- [ ] Create ENEM profile
- [ ] Add exam registration dates to universities

### Medium Priority
- [ ] Add calendar to profile
- [ ] Add calendar summary to feed
- [ ] Improve saved content organization
- [ ] Add gamification elements
- [ ] Add verified badges
- [ ] Expand university details

### Low Priority
- [ ] Tutor profiles
- [ ] Job openings section
- [ ] Scholarships section
- [ ] FIES info
- [ ] Acceptance celebration
- [ ] Quiz mode
- [ ] Flashcard mode