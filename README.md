# TaskMate — Smart Task Management for Busy Professionals

TaskMate is a clean, intelligent task-management app designed for teachers and busy professionals. It helps users capture tasks, set priorities and deadlines, and stay on top of what matters most — all from a single, focused dashboard.

---

## App Overview

TaskMate is built around a simple idea: a to-do app should not just store tasks, it should help you finish them. The app combines priority, deadline, and reminder frequency to surface what needs attention today, and gently nudges you before things slip through the cracks.

**Target users:** Teachers, working professionals, and anyone juggling multiple small but important tasks daily.

**Example tasks the app is designed for:**

- Review weekly lesson plans
- Submit assessment reports
- Prepare classroom activity materials
- Reply to parent messages
- Attend meetings and follow-ups

---

## Core Features

### 1. Add Task

Users can create a new task by entering:

- **Task name** — a short, clear description of what needs to be done
- **Priority** — High, Medium, or Low
- **Deadline** — date and exact time
- **Reminder frequency** — Once, Daily, Every 2 days, or Weekly

A smart-scheduling callout reassures the user that reminders will be handled automatically based on priority and deadline.

### 2. Smart Reminders

Reminders adapt based on task priority and deadline:

| Priority | Reminder behaviour |
|---|---|
| High | Frequent reminders; stronger alerts as the deadline approaches |
| Medium | Balanced, periodic reminders |
| Low | Occasional, gentle reminders |

Users can choose a reminder frequency that fits each task, and the app respects that cadence.

### 3. Dashboard / Home Screen

The dashboard gives a complete at-a-glance view of the user's workload:

- **Active tasks** — count of tasks not yet completed
- **Completed tasks** — count and percentage of total tasks finished
- **High priority** — count of unfinished high-priority items needing attention
- **Weekly progress** — a live progress bar showing completion percentage
- **Smart reminders banner** — confirms that smart reminders are active

Below the stats, the full task list is shown with:

- Task name
- Priority colour pill (red / amber / green)
- Deadline date and time
- Relative due label ("Due today", "Due tomorrow", "Overdue")
- Current status badge (To Do / In Progress / Done)

### 4. Colour Coding

Every task carries a colour-coded priority label for instant visual scanning:

- **Red** — High priority
- **Amber/Yellow** — Medium priority
- **Green** — Low priority

### 5. Task Status

Each task moves through three statuses:

1. **To Do** — newly created, not yet started
2. **In Progress** — actively being worked on
3. **Done** — completed

Status can be cycled with a single tap on the round check button next to any task. The dashboard updates instantly.

### 6. Search and Filter

- **Filter tabs** — All tasks, To do, In progress, Completed (each with a live count)
- **Search box** — find any task by name instantly

### 7. Task Detail Panel

Tapping any task opens a focused detail panel showing:

- Full task name
- Priority label
- Deadline date and time
- Reminder frequency
- Current status
- Actions: mark as done / reopen, or delete the task

### 8. Persistent Storage

All tasks are saved to a Supabase database. The app survives refreshes and reloads — your task list is always there when you come back. On first visit, five demo tasks are automatically loaded so the workspace is never empty.

---

## User Journey

1. User opens the app and sees the dashboard with pending tasks
2. User taps the "Add task" button
3. A clean modal opens: task name, priority, deadline, and reminder frequency
4. User fills in the details and saves
5. The task appears in the dashboard, sorted by deadline
6. The user works through tasks, tapping the check to move them from To Do → In Progress → Done
7. Completed tasks are visually marked (strikethrough, muted colour)
8. The progress bar and stat cards update in real time
9. The user can search or filter to focus on specific tasks
10. The user can open any task for full details, update status, or delete it

---

## Screens

| Screen | Status |
|---|---|
| Dashboard / Home | Implemented |
| Add Task modal | Implemented |
| Task Detail panel | Implemented |
| Edit Task | Planned |
| Notification Settings | Planned (button visible in sidebar) |
| Calendar view | Planned (button visible in sidebar) |
| Splash / Login | Optional — not required per spec |

---

## Behind the Scenes

The app is built on three conceptual layers, as described in the product spec:

### Storage

Tasks are stored in a Supabase Postgres database with row-level security enabled. The schema captures task name, priority, status, deadline, reminder frequency, and creation timestamp. Data persists across sessions and is safe across reloads.

### Reminder Engine

Reminder frequency is captured per task and stored in the database. The smart-reminder behaviour (priority-aware, deadline-aware nudges) is designed and the UI communicates it; the background notification engine is the next build phase.

### Dashboard

The dashboard reads from the database and presents tasks in a clean, colour-coded, sortable, filterable view. Stat cards and a progress bar give a quick summary; the task list gives the detail.

---

## Nice-to-Have Features

These enhancements are called out in the product spec for an impressive demo:

| Feature | Status |
|---|---|
| Daily task completion progress bar | Implemented |
| Filter / search (e.g. only High Priority) | Implemented |
| Calendar view | Planned |
| Dark mode | Planned |
| Daily summary notification ("You have 3 pending tasks today") | Planned |
| Smart reminder behaviour | Designed (UI + data model ready; engine is next) |
| One-click task completion | Implemented |
| Responsive mobile layout | Implemented |

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS with custom design system (DM Sans + Manrope fonts)
- **Icons:** Lucide React
- **Database / Backend:** Supabase (Postgres + row-level security)
- **Design language:** Navy sidebar, orange accent, white content cards, calm professional aesthetic

---

## Getting Started

The app runs automatically in the Bolt environment — no manual setup needed. If you want to run it locally:

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

---

## Project Structure

```
src/
  App.tsx           Main dashboard, task list, modals, and all app logic
  index.css         Full design system (colours, layout, components, responsive)
  main.tsx          React entry point
  lib/supabase.ts   Supabase client singleton
supabase/
  migrations/       Database schema and RLS policies
```

---

## What's Next

The current demo delivers a strong, working showcase of the core dashboard experience. To reach the full product vision, the next phases are:

1. **Edit task flow** — let users update title, priority, deadline, and reminder after creation
2. **Reminder engine** — background scheduling that fires real notifications based on priority and deadline
3. **Notification settings screen** — full control over reminder timing and frequency
4. **Calendar view** — a month-grid view of tasks by deadline
5. **Dark mode** — a full dark theme toggle
6. **Daily summary** — a daily digest notification summarizing pending work

---

## Summary

TaskMate is a focused, intelligent task manager that respects the user's time. The current demo covers the dashboard, task creation, priority colour coding, status management, search, filtering, progress tracking, and persistent storage — the core of what the product spec asks for. Reminder automation, editing, calendar, and dark mode are the natural next steps to take it from showcase to full product.
