# Development Guide

## Purpose

This guide defines how to add or extend features without creating structural drift.

The intended audience includes:

- human developers
- strong AI coding tools
- weak AI coding tools with low context

The process must therefore be explicit and repeatable.

## Before You Build Anything

Always inspect these areas first:

1. the feature screen
2. the related store
3. the related service
4. the related repository
5. shared components that may already solve part of the UI

If the needed structure does not exist, create it once in the correct place.
Do not solve the task by placing logic in the nearest convenient file.

## Standard Build Flow

Use this order for every new Firebase-backed feature:

```text
data contract
-> repository
-> service
-> store or hook
-> UI
-> verification
```

## How To Create A New Feature From Scratch

### Step 1: Define The Feature Boundary

Write down:

- feature name
- user goal
- screens involved
- remote data needed
- shared state needed
- reusable UI pieces needed

Example:

```text
Feature: Exam reminders
User goal: Save reminder preferences for upcoming exams
Screens: UniversityDetailScreen, Profile reminders area
Remote data: user reminder settings
Shared state: reminders map keyed by exam id
```

### Step 2: Choose The Correct Place

Use these rules:

- one screen only and local behavior only -> keep local
- shared inside one feature -> feature store
- reused across multiple features -> shared component or shared utility
- any Firebase access -> repository

### Step 3: Create The Files

Example structure:

```text
src/features/explorar/
  screens/
    UniversityDetailScreen.js
  services/
    examReminderService.js
  repositories/
    remindersRepository.js
  store/
    useExploreStore.js
```

### Step 4: Implement The Repository First

Example:

```js
// remindersRepository.js
export async function updateExamReminder(userId, examId, enabled) {
  const fieldPath = `examReminders.${examId}`;

  await setDoc(
    doc(db, "usuarios", userId),
    {
      examReminders: {
        [examId]: enabled,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { examId, enabled };
}
```

### Step 5: Add Service Logic

Example:

```js
// examReminderService.js
export async function toggleExamReminder({ userId, examId, enabled }) {
  if (!userId) {
    throw new Error("User must be authenticated");
  }

  return updateExamReminder(userId, examId, enabled);
}
```

### Step 6: Connect The Store

Example:

```js
// useExploreStore.js
toggleReminder: async ({ examId, enabled, userId }) => {
  set((state) => ({
    examReminders: { ...state.examReminders, [examId]: enabled },
  }));

  try {
    await toggleExamReminder({ userId, examId, enabled });
  } catch (error) {
    set((state) => ({
      examReminders: { ...state.examReminders, [examId]: !enabled },
    }));
    throw error;
  }
},
```

### Step 7: Connect The UI

Example:

```js
// UniversityDetailScreen.js
const toggleReminder = useExploreStore((state) => state.toggleReminder);
const reminderEnabled = useExploreStore((state) => !!state.examReminders[exam.id]);

<TouchableOpacity
  onPress={() =>
    toggleReminder({
      examId: exam.id,
      enabled: !reminderEnabled,
      userId: currentUser?.uid,
    })
  }
>
  <Text>{reminderEnabled ? "Reminder enabled" : "Enable reminder"}</Text>
</TouchableOpacity>
```

The UI does not import Firebase.

## How To Extend An Existing Feature Safely

### Safe Extension Checklist

1. Reuse the existing feature folder if the behavior belongs there.
2. Reuse the existing store if the state belongs to the same domain.
3. Reuse an existing repository function if the query/write is the same.
4. Create a new repository function only when the backend operation is genuinely different.
5. Update selectors or derived helpers instead of duplicating filtered lists in several screens.

### Example: Extending Feed Likes

Wrong approach:

- add a new Firestore write directly in `FeedScreen`
- update local storage manually
- patch counts inline again in another file

Right approach:

- add `postsRepository.setPostLike`
- call it from `feedService.toggleLike`
- update `useFeedStore.toggleLike`
- let `FeedScreen` only trigger the action

## How To Connect UI -> Logic -> Firebase

Always use this chain:

```text
UI event
  -> hook/store action
  -> service
  -> repository
  -> Firebase
  -> state update
  -> rerender
```

### Practical Mapping For This Project

- Button press in `FeedScreen`
  -> `useFeedStore.toggleLike`
  -> `feedService.toggleLike`
  -> `postsRepository.setPostLike`
  -> Firestore

- Submit in `OnboardingScreen`
  -> `useOnboardingStore.completeOnboarding`
  -> `onboardingService.completeOnboarding`
  -> `userRepository.saveOnboarding`
  -> Firestore

- Mark book as read in profile or explore
  -> `useProgressStore.updateBookStatus`
  -> `profileService.updateReadingProgress`
  -> `profileRepository.updateReadBooks`
  -> Firestore

## How To Reuse Existing Code Properly

Before creating anything new, search for:

- existing UI component
- existing store action
- existing repository method
- existing static data file
- existing selector or helper

Use this decision order:

1. Reuse as-is.
2. Extend the existing module.
3. Extract a shared helper.
4. Create a new module only if none of the above is clean.

## How To Avoid Breaking Existing Functionality

### Rule 1: Preserve Existing Data Shapes

If the app already stores:

- `followedUnis`
- `readBooks`
- `completedTodos`

do not silently rename fields during a small feature change.
If renaming is necessary, do it as an explicit migration task.

### Rule 2: Keep One Write Path

If a field is persisted by store middleware, do not also write it directly from the screen.

### Rule 3: Change One Responsibility At A Time

Good:

- extract repository first
- then move service logic
- then simplify the screen

Bad:

- change naming
- rewrite navigation
- alter persistence
- change UI behavior

all in one step

### Rule 4: Verify By Flow, Not Just By File

For any change, manually test:

1. first load
2. logged out state if relevant
3. logged in state if relevant
4. save action
5. app reload after save
6. another screen that consumes the same data

## Feature Template

Use this template for new feature work:

```text
Feature:
User problem:
Existing files reviewed:
Shared state needed:
Firebase collections involved:
Repository functions:
Service actions:
UI files affected:
Manual verification:
```

## Rules For Simple Features

A simple feature is allowed to remain compact if:

- it touches one screen
- it has one repository action
- it has no cross-feature behavior
- the file remains easy to scan

Do not split a tiny feature into many files just to follow a pattern mechanically.

## Rules For Complex Features

A complex feature must be organized before it is expanded further.

Use explicit subfolders when the feature has:

- more than one screen
- more than one backend entity
- optimistic updates
- several derived views
- reusable internal components

Complex feature minimum structure:

```text
feature/
  screens/
  components/
  services/
  repositories/
  store/
```

## Minimum Done Definition

A feature is not complete until:

1. Firebase access is centralized.
2. State ownership is clear.
3. UI code does not contain backend details.
4. Existing code reuse was checked.
5. Manual verification was performed.
6. File placement matches the architecture.
