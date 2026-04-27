# Univest - Feature Notes & Ideas

Organized by app flow for development reference.

---

## TABLE OF CONTENTS

1. [Onboarding](#1-onboarding)
2. [Auth](#2-auth)
3. [Feed Tab](#3-feed-tab)
4. [Explorar Tab](#4-explorar-tab)
5. [Notas Tab](#5-notas-tab)
6. [Perfil Tab](#6-perfil-tab)
7. [Ongoing Screens](#7-ongoing-screens)
8. [Institution Mode](#8-institution-mode)
9. [UI/UX Improvements](#9-uiux-improvements)
10. [Tech Considerations](#10-tech-considerations)
11. [Action Items](#11-action-items)

---

## 1. ONBOARDING

### Welcome Screen

- Improve tap animations
- Remove ">" from selection boxes

### Interests Selection

- Current: 11 interest areas
- Filter universities based on selection

### User Profile Selection

- Make name mandatory during signup

### Follow Universities

- "Follow" vs "Intending to take vestibular" separation
- University suggestions based on profile

---

## 2. AUTH

### Login / Signup

- Terms and Conditions link
  - Should open as Modal or Page
  - Store in database (updateable)
- Buttons "Entrar" and "Criar conta" are darker, until "Li e aceito os Termos e Condições" are checked. That should not happen.
- Add password requirements (show them for the user)

### Terms and Conditions

- The checkbox and text of the terms and conditions are too close to the Data de Nascimento's field
- Bug: when clicking in Termos e Condições, the pop-up opens up in the first page of the app (you can see "Entrar ou criar conta" in the back). That should not happen since the signup pages should be a real page.
- Store in database for updates without app update
- Accessible from signup
- Everytime the Terms and Conditions are updated, the user must receive and email notifying them that it was updated and with a summary of what's been updated
- Everytime the Terms and Conditions are updated, the user must agree again inside the app (a pop-up should appear the next time the user opens the app or logs in)

---

## 3. FEED TAB

### Current Features

- Posts from followed universities
- Academic news
- Events
- Opportunities (internships, scholarships)

### Proposed Improvements

#### Calendar Summary

- Replace "stories" area
- Show upcoming vestibular dates
- Quick tap to see details
- Monthly summary view

#### University Stories

- Institution-only 24h content
- Short videos/photos from campus
- "A day at USP"
- Lab tours, student interviews
- Only verified institutions can post
- Moderate before publish
- Users can react/save

#### Interest Counters (Inverted Social Proof)

- "2,340 students interested in Medicina at UNICAMP"
- No user data exposed
- Aggregate numbers only

#### Trend Indicators

- "Interest grew 45% this year"
- Rising/falling indicators
- No tracking - opt-in only

---

## 4. EXPLORAR TAB

### Current Features

- Search universities
- Search courses
- Search vestibulares
- Search events
- Lists: Notas de Corte, Rankings

### Filters

- By location (city, state)
- By course
- By difficulty
- By cost (free, paid)
- By duration

### Course Navigator

**Hierarchical structure:**

```
Level 1: Área (12)
├── Ciências Exatas, Saúde, Humanas, Biológicas
└── Linguística, Artes, Educação, Tecnologia

Level 2: Sub-área (~30 per área)
├── Exatas → Engenharia, Computação, Matemática
└── Saúde → Medicina, Farmácia, Odontologia

Level 3: Curso (~500+)
├── Medicina → 180+ universities
└── Engenharia Civil → 250+ universities
```

Features:

- Browse by interest
- Quick filters: Public/Private, Free/Paid, Location
- "What can I do with this course?" career info

### Vestibular Calendar

- All vestibular dates: FUVEST, UNICAMP, ENEM, SISU
- Filter by region, course, date
- One tap → Add to device calendar
- Notifications: 30/7/1 days before

### University Details

- Verified Badge ✓ for accredited institutions
- All past exams (years previous)
- Previous mock exams
- Previously required books
- Historical notes de corte
- Exam format changes over time

### ENEM Profile

- Created as "university" with:
  - Exam dates
  - Requirements (ID, pen colors)
  - Notes de corte history
  - Previous exams
  - Study tips
  - Registration dates

### Exam Requirements (Expand existing modal)

Per vestibular:

- Documents: ID, registration confirmation
- Materials: pen color, calculator allowed?
- Logistics: location, arrive time, food
- Day-before checklist

### Saved Search Alerts

- "Notify me when ENEM cutoff released"
- "Notify me when USP registration opens"
- Push notifications on trigger

---

## 5. NOTAS TAB

### Current Features

- Register notes (ENEM, vestibulares, university grades)
- Notes history
- Compare with notes de corte

### Proposed Improvements

#### Exams Separation

- Real Exams: official (ENEM, FUVEST, etc.)
- Mock Exams/Simulados: practice tests
- Separate counts and history

#### Charts

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

#### Percentile / Competition

- "You scored better than 73% of students"
- Requires 5,000+ submissions for accuracy
- Below threshold: "Not enough data"
- All data anonymized
- Opt-in only

#### Admission Calculator (Peso)

ENEM = (L+H+N+M+R)/5

Custom weights per university:

- USP 2025: L:20%, H:15%, N:15%, M:30%, R:20%
- User enters scores → weighted final
- "What if I improve X points?" simulator
- Per-area impact visualization

#### Filters

- By subject
- By year
- By exam type

---

## 6. PERFIL TAB

### Current Features

- Personal data
- Edit profile
- Goals
- Settings
- Discover new areas
- Logout

### Profile Items - Modular

Users customize which sections appear and order.

**Proposed Sections:**

- Personal Info (name, location, study location)
- Universities Following
- Exams Taken (real vs mock)
- Saved Content
- Goals / TODO
- Calendar
- Achievements / Gamification
- Settings

### Home / Study Location

- Current city/state
- Desired study city/location

### Universities Following ("Universidades que sigo")

**Problems:**

- Icons too large
- No sorting

**Solutions:**

1. Smaller Icons Grid (4-6 per row)
2. Sorting: By Date / By Preference
3. Edit screen (accessible via link)
4. Drag and drop reordering
5. Mark preference (1st, 2nd choice)

### Universities to Take Vestibular

Separate from "Following":

- Universities user intends to take exam
- Affects recommendations
- Shows TODO (books to read)

### TODO Based on Chosen Universities

- "Read these books"
- "Study this topic"
- "Writing style: letter"
- Auto-generate from university data

### Exam Countdown

- Add upcoming exams
- "X days until [exam name]"
- Notifications as date approaches

### Preparation Tracker

**Tracks:**

- Study hours per subject/week
- Topics covered checklist
- Required books progress
- Mock exam score progression

**Goals:**

- Select 1-5 target universities
- Set study goals per week/month
- Progress dashboard

### Calendar

- Monthly view
- Add exam dates
- Add study sessions
- Add deadlines

### Saved Content

- Organization (folders, tags)
- Search bar
- Thumbnails
- Categories: Universities/Courses/Exams/Materials

### Books Read

- Section for books read
- Checkmark when completed
- Compare with required books

### Gamification

1. **Exam Countdown** - Show upcoming
2. **Achievements / Badges** - First exam, 10 simulado, streaks
3. **Progress Tracking** - Hours, books, topics
4. **Streaks** - Daily login, study, notes

### Acceptance Celebration

- Confetti animation
- Set university as background
- Multiple acceptances
- Share option

### Alternative Routes

- "If you can't get into X, try Y"
- Consider: similar course, other state, scholarship
- Filter: same course, any state, scholarship OK

---

## 7. ONGOING SCREENS

### University Detail

- Verified badge
- All past exams
- Requirements checklist
- Historical cutoffs

### Course Detail

- All universities offering that course
- Filters: location, cost, public/private
- "What can I do with this course?"

### Flashcard Mode

- User creates own flashcards
- Pre-made subject flashcards
- Study mode

### Quiz Mode

- Subject-specific quizzes
- General knowledge
- Timed mode

---

## 8. INSTITUTION MODE

### Core Idea

Separate experience for universities to manage their data.

### Features

#### Institution Login

- Separate auth flow
- Verified account required
- Multi-admin support

#### Content Management

- Post news and updates
- Update exam dates/requirements
- Upload past years' exams
- Manage courses/vagas

#### Analytics Dashboard

- Students following
- Saved as interest
- Growth over time
- Most viewed pages

#### Opportunity Posting

- Internships
- Scholarships
- Research positions
- Extension projects

#### Communication

- Push notifications to followers
- Announcement banners
- Respond to questions (optional)

---

## 9. UI/UX IMPROVEMENTS

### Terminology

| Term      | Definition                  |
| --------- | --------------------------- |
| **Page**  | Full screen (Feed, Profile) |
| **Modal** | Bottom sheets overlay       |
| **Popup** | Confirmations/alerts        |
| **Field** | Input for text/data         |
| **Card**  | Content container           |
| **Tab**   | Bottom navigation           |

### UI Changes

- Remove ">" from selection boxes
- Improve animations
- Better loading states
- Empty states with helpful messages

### Verified Badge

- Blue checkmark ✓
- For accredited institutions
- Manual verification in DB

---

## 10. TECH CONSIDERATIONS

### Database

- Current: Firebase Firestore
- Consider: SQLite for local data
- Consider: SQL DB for backend

### Privacy

- All data anonymized for percentiles
- Minimum threshold: 5,000+ submissions
- GDPR/LGPD compliant
- Opt-in only for tracking

---

## 11. ACTION ITEMS

### Onboarding

- [ ] Improve tap animations
- [ ] Remove ">" from selections
- [ ] Make name mandatory

### Auth

- [ ] Terms link (Modal/Page)
- [ ] Store terms in database

### Feed Tab

- [ ] Calendar summary
- [ ] University Stories
- [ ] Feed: Interest counters

### Explorar Tab

- [ ] Course Navigator (hierarchical)
- [ ] Vestibular calendar
- [ ] Expand filters
- [ ] University details (past exams, books)
- [ ] ENEM profile
- [ ] Exam requirements (expand)
- [ ] Saved search alerts

### Notas Tab

- [ ] Real vs mock separation
- [ ] Charts (month, year, all-time)
- [ ] Percentile calculation
- [ ] Admission calculator
- [ ] Filters

### Perfil Tab

- [ ] Modular profile items
- [ ] Location fields
- [ ] Universities following (smaller icons, sorting)
- [ ] "Intending to take vestibular" section
- [ ] TODO based on universities
- [ ] Exam countdown
- [ ] Preparation tracker
- [ ] Calendar
- [ ] Saved content organization
- [ ] Books read section
- [ ] Gamification elements
- [ ] Alternative routes
- [ ] Acceptance celebration

### Institution Mode

- [ ] Institution auth
- [ ] Dashboard
- [ ] Content management
- [ ] Analytics
- [ ] Opportunity posting
- [-] InstitutionAdminScreen exists

### INSTITUTION IMPROVEMENTS (TODO)

- [ ] Remove 'Editar opções de curso' option from InstitutionAdminScreen
- [ ] Remove 'Metas de vestibular' for institution accounts
- [ ] Add institution address fields (country, state, city, address) to InstitutionAdminScreen
- [ ] Display contact info instead of email in institution profile
- [ ] Followers count display (PARTIAL - shows followers)
- [ ] Edit profile picture/logo (PARTIAL - option exists)

### Decision Engine (Core Feature)

- [ ] "Can I Pass?" simulator
- [ ] University comparator
- [ ] "What If" scenarios
- [ ] Smart recommendations
- [ ] Trend analysis

### Medium Priority

- [ ] Verified badges
- [ ] Expand university details
- [ ] Tutoring profiles
- [ ] Job openings section
- [ ] Scholarships section

### Low Priority

- [ ] Quiz mode
- [ ] Flashcard mode
- [ ] FIES info

Avaliar quais informações precisam estar em database:

- Cidade, Pais, Estado, Universidades... Pra não ficar hardcodado
