# RepRoute — Complete Project Documentation

> **For personal reference & portfolio interviews**
> Built by Aman

---

## Table of Contents
1. [The Idea](#1-the-idea)
2. [Tech Stack & Why](#2-tech-stack--why)
3. [Database Schema](#3-database-schema)
4. [Authentication Flow](#4-authentication-flow)
5. [Design System](#5-design-system)
6. [Component Architecture](#6-component-architecture)
7. [Feature Deep Dives](#7-feature-deep-dives)
8. [Data Flow](#8-data-flow)
9. [Responsive Strategy](#9-responsive-strategy)
10. [Progressive Overload Engine](#10-progressive-overload-engine)
11. [Challenges & Solutions](#11-challenges--solutions)
12. [Deployment Checklist](#12-deployment-checklist)

---

## 1. The Idea

### Problem
Tracking workouts manually (notebooks, spreadsheets) makes it hard to apply progressive overload consistently. Most fitness apps are either too complex (Jefit, Strong) or don't guide you on what weight to use next session.

### Solution
A web app where users:
- Create custom workout plans with days and exercises
- Log sets (weight × reps) by selecting a plan + day
- Get AI-free, rule-based progressive overload suggestions based on their last session
- View volume and estimated 1RM trends over time

### Target User
Lifters who follow structured programs (PPL, Upper/Lower, Bro Split) and want guided progression without over-engineering.

### Key Differentiator
The progressive overload engine uses **double progression**: stay at a weight until you hit all target reps across all sets, then increase by 2.5 kg. No other free app does this cleanly without subscriptions.

---

## 2. Tech Stack & Why

### Frontend
| Technology | Why |
|------------|-----|
| **Next.js 16** | React framework with file-based routing, automatic code splitting, SSG/SSR |
| **React 19** | Latest React with improved concurrent rendering |
| **Tailwind CSS v4** | Utility-first CSS, CSS-first config (no tailwind.config.js needed), `@theme inline` for design tokens |
| **shadcn/ui (New York)** | Copy-paste component library built on Radix UI primitives, fully customizable, uses `data-slot` attributes |
| **Radix UI** | Headless, accessible UI primitives (Dialog, DropdownMenu, Select, Tabs, Tooltip, etc.) |
| **lucide-react** | Clean, consistent icon set |
| **class-variance-authority (cva)** | Variant-based component styling (button variants, badge variants) |
| **clsx + tailwind-merge** | `cn()` utility for conditional className merging without conflicts |
| **recharts** | React charting library for progress charts |

### Backend (Serverless)
| Technology | Why |
|------------|-----|
| **Supabase** | All-in-one: PostgreSQL database + Auth + REST API. No backend code needed. |
| **Row Level Security (RLS)** | Database-level access control — users can only read/write their own data |

### Why Supabase over alternatives?
- **vs Firebase**: Supabase uses PostgreSQL (relational, powerful queries). Firebase is NoSQL.
- **vs Clerk + Neon**: Two separate services to manage. Supabase is one.
- **vs NextAuth + Turso**: Requires API routes for auth and database operations. Supabase JS client talks directly from the browser (with RLS security), eliminating the need for API routes.

### Why no TypeScript?
The user hasn't learned TypeScript yet. The project uses `.jsx` files throughout. The `jsconfig.json` sets up `@/` path aliases. Supabase's JS SDK provides decent autocomplete even without TypeScript.

---

## 3. Database Schema

### Tables

```sql
-- Public exercises (seeded, no user_id — shared across all users)
exercises:
  id            bigint PK auto
  name          text NOT NULL        -- e.g. "Bench Press"
  muscle_group  text?                -- e.g. "Chest"
  category      text?                -- e.g. "Strength", "Isolation"
  user_id       uuid? references auth.users  -- null = public, non-null = user-created

-- User's workout plans
workout_plans:
  id            bigint PK auto
  user_id       uuid FK auth.users NOT NULL
  name          text NOT NULL
  created_at    timestamp default now()

-- Days within a plan (e.g., "Push Day", "Pull Day")
plan_days:
  id            bigint PK auto
  plan_id       bigint FK workout_plans ON DELETE CASCADE NOT NULL
  name          text NOT NULL
  sort_order    int NOT NULL

-- Links exercises to plan days with target sets/reps
day_exercises:
  id            bigint PK auto
  day_id        bigint FK plan_days ON DELETE CASCADE NOT NULL
  exercise_id   bigint FK exercises
  target_sets   int default 3
  target_reps   int default 10
  sort_order    int NOT NULL

-- A logged workout session (date + plan)
workout_sessions:
  id            bigint PK auto
  user_id       uuid FK auth.users NOT NULL
  plan_id       bigint FK workout_plans
  date          date NOT NULL

-- Individual sets within a session
exercise_sets:
  id            bigint PK auto
  session_id    bigint FK workout_sessions ON DELETE CASCADE NOT NULL
  day_exercise_id bigint FK day_exercises
  set_number    int NOT NULL
  reps          int?
  weight        numeric(6,2)?
  rpe           numeric(2,1)?
```

### Key Design Decisions

**`exercises.user_id` nullable** — Seeded exercises have `user_id = NULL` (public, readable by all). Users can create their own exercises with their `user_id`. RLS policy: `SELECT` allowed if `user_id IS NULL OR user_id = auth.uid()`.

**Cascading deletes** — Deleting a `workout_plan` cascades to `plan_days` → `day_exercises`. Deleting a `workout_session` cascades to `exercise_sets`. This prevents orphaned rows.

**Generated always as identity** — The `id` columns use `generated always as identity` (not serial/bigserial). This is the modern PostgreSQL way — it cannot be overridden in INSERTs, which avoids ID conflicts.

**`workout_sessions` has no unique constraint on (user_id, plan_id, date)** — A user could theoretically log the same plan twice on the same day. The app prevents this at the UI level (checks for existing session before showing the log form).

### RLS Policies

```sql
-- exercises: public read, user-specific write
CREATE POLICY "read public exercises" ON exercises
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "insert own exercises" ON exercises
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- workout_plans: user owns their plans
CREATE POLICY "users own plans" ON workout_plans
  FOR ALL USING (auth.uid() = user_id);

-- plan_days: access through parent plan
CREATE POLICY "users plan days" ON plan_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_plans WHERE id = plan_days.plan_id AND user_id = auth.uid())
  );

-- day_exercises: access through grandparent plan
CREATE POLICY "users day exercises" ON day_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM plan_days pd
      JOIN workout_plans wp ON wp.id = pd.plan_id
      WHERE pd.id = day_exercises.day_id AND wp.user_id = auth.uid())
  );

-- workout_sessions: user owns their sessions
CREATE POLICY "users sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- exercise_sets: access through parent session
CREATE POLICY "users sets" ON exercise_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_sessions WHERE id = exercise_sets.session_id AND user_id = auth.uid())
  );
```

**Important gotcha**: `FOR ALL USING (...)` applies the `USING` expression as `WITH CHECK` for INSERT operations. This is standard PostgreSQL behavior. If inserts fail despite correct RLS, verify the `user_id` column matches `auth.uid()`.

---

## 4. Authentication Flow

### Implementation
The app uses Supabase's built-in auth with email/password. There's no backend — the browser talks directly to Supabase.

### Auth Context (`lib/auth.jsx`)
```jsx
// Wraps the app. On mount:
supabase.auth.getSession()  // Check if already logged in
supabase.auth.onAuthStateChange()  // Listen for login/logout
// Provides { user, loading } to all children via React Context
```

### Login/Signup Pages
- Simple forms with email + password
- Call `supabase.auth.signUp()` or `supabase.auth.signInWithPassword()`
- On success, redirect to `/dashboard`

### Session Persistence
Supabase stores the auth session in the browser's localStorage (for `createClient` from `@supabase/supabase-js`). The auth token is automatically attached to every API request via the `Authorization` header.

### Email Confirmation
Disabled in Supabase dashboard for development. For production: enable it and set the Site URL to your deployed domain (e.g., `https://reproute.vercel.app`).

### Why Basic `createClient` (not `@supabase/ssr`)?
In a pure client-side app (all pages use `'use client'`), the basic Supabase JS client works fine. The SSR client (`createBrowserClient`) is only needed when mixing server components with client session data. Since every page in this app is client-rendered (needs auth state), there's no benefit to the SSR wrapper.

---

## 5. Design System

### Inspiration
The design system is copied from **GroupHub**, a previous project. Same CSS variables, same spacing, same typography, same component conventions. Every visual element in RepRoute is recognizable from GroupHub.

### Colors (Dark Theme in `:root`)
```css
--background: oklch(0.13 0.01 240);        /* Very dark navy */
--foreground: oklch(0.98 0 0);             /* Near white */
--primary: oklch(0.75 0.15 180);           /* Teal/cyan */
--border: oklch(0.28 0.01 240);
--radius: 0.75rem;
```

### App-Level Palette (used directly in JSX)
These are NOT CSS variables — they're hardcoded hex values applied directly in pages:

| Token | Hex | Usage |
|-------|-----|-------|
| Page bg | `#f7f7f3` | Main background |
| Card bg | `#fbfbfa` | Cards, sections, containers |
| Dark bg | `#2f2f2d` | Navbar (inner pages), hero, footer, sidebar highlights |
| Near-black | `#171717` | Text, buttons, icons, hover borders |
| Light border | `#d9d8d2` | All borders, dividers |
| Muted | `#62615d` | Labels, meta text |
| Muted lighter | `#55544f` | Description text |
| Muted lightest | `#77766f` | Secondary labels, placeholders |

### Typography
```
Headings:    font-black (900), leading-[0.95]
Labels:      font-black, uppercase, tracking-[0.14em] or [0.18em]
Body strong: font-bold (700)
Body:        font-semibold (600)
Nav links:   font-medium (500)
Links:       underline underline-offset-4
Font stack:  'Geist', 'Geist Fallback' (via next/font/google)
Font mono:   'Geist Mono', 'Geist Mono Fallback'
```

### Spacing
```
Page padding (consistent across all pages):
  px-6 sm:px-10 lg:px-20 xl:px-28

Section padding:
  py-8 sm:py-10 (header sections)
  py-6 sm:py-8 (content sections)

Cards: p-4 sm:p-5
```

### Component Conventions
Every shadcn/ui component follows:
- `function` keyword (not arrow functions)
- Named exports (not default)
- `data-slot="component-name"` on root elements
- CVA for variant-based styling
- `cn()` utility for className merging
- Single quotes for imports

### Button Styles (App-Level)
```
Filled: bg-[#171717] text-white font-black
Outline: border border-[#171717] font-black, hover:bg-[#171717] hover:text-white
Icon: size-11 sm:size-9, border
```

---

## 6. Component Architecture

### File Structure
```
app/
├── globals.css              # Tailwind v4 + CSS variables + @theme
├── layout.jsx               # Root layout: Geist fonts, Navbar, Footer, AuthProvider
├── page.jsx                 # Landing page
├── login/page.jsx           # Login form
├── signup/page.jsx          # Signup form
├── dashboard/page.jsx       # Overview: plans + recent sessions
├── plans/page.jsx           # List + create plans + template import
├── plans/[id]/page.jsx      # Edit plan: days + exercises
├── log/page.jsx             # Log a session (date → plan → day → sets)
├── progress/page.jsx        # Volume chart + 1RM chart
├── summary/page.jsx         # All sessions with inline editing
└── exercises/page.jsx       # Exercise library browser

components/
├── navbar.jsx               # Responsive nav with mobile drawer
├── footer.jsx               # Footer with columns
├── progressive-overload.jsx # Overload suggestion engine
└── ui/                      # shadcn/ui components
    ├── button.jsx, card.jsx, input.jsx, label.jsx, badge.jsx
    ├── dialog.jsx, dropdown-menu.jsx, select.jsx, tabs.jsx
    ├── tooltip.jsx, avatar.jsx, separator.jsx
    ├── skeleton.jsx, spinner.jsx

lib/
├── utils.jsx                # cn() function
├── supabase.jsx             # Supabase client singleton
├── auth.jsx                 # AuthProvider + useAuth hook
├── dates.jsx                # timeAgo() + formatDate()
└── templates.jsx            # Pre-built workout templates

hooks/
└── use-mobile.jsx           # useIsMobile() hook (768px breakpoint)
```

### Component Patterns

**Page Structure (consistent across all pages):**
```jsx
// 1. Auth check on mount
useEffect(() => {
  if (authLoading) return
  if (!user) router.push('/login')
  // ... fetch data
}, [user, authLoading, router])

// 2. Loading state
if (authLoading || loading) {
  return <div>Spinner...</div>
}

// 3. Render
return (
  <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
    <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-8 sm:px-10 ...">
      {/* Page header */}
    </section>
    <section className="px-6 py-6 sm:px-10 ...">
      {/* Page content, mx-auto max-w-2xl for centered content */}
    </section>
  </div>
)
```

**Data fetching pattern:**
```jsx
// Simple fetch on mount
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  supabase.from('table').select('*').then(({ data }) => {
    if (data) setData(data)
    setLoading(false)
  })
}, [])
```

---

## 7. Feature Deep Dives

### 7a. Landing Page
Two-column hero layout: `lg:grid-cols-[1fr_29vw]`. Dark left column (`bg-[#2f2f2d]`) with headline + CTA, light right column (`bg-[#fbfbfa]`) with decorative illustration. Below: features section and CTA. All sections use the GroupHub color palette.

### 7b. Plan Builder (`/plans`)
- **Text input** + **Create button** at top
- **Pre-built templates** section below (4 templates imported from `lib/templates.jsx`)
- Template import: looks up exercise IDs by **name matching** (lowercased), creates plan → days → exercises sequentially
- Plan list with delete buttons
- Clicking a plan goes to `/plans/[id]` for editing

### 7c. Plan Detail (`/plans/[id]`)
- Add days (name only)
- Each day card: add exercises from dropdown + target sets/reps
- Delete individual exercises or entire days
- If exercise library is empty, shows link to `/exercises`
- Exercises dropdown loads from Supabase `exercises` table

### 7d. Log Session (`/log`)
The most complex page. Three-step flow:
1. **Choose date + plan** — date input + plan dropdown
2. **Choose day** — buttons for each day in the plan
3. **Log sets** — pre-populated inputs based on target sets/reps

Key behaviors:
- Selecting a day creates **local state only** (no DB insert until Save)
- Overload suggestion shows above each exercise
- If a session is already saved for this date+plan, loads existing data and shows "already logged" banner
- Past sessions list at the bottom with delete

**Why "already logged" check matters:** `workout_sessions` has no unique constraint, so the app must check manually with `.maybeSingle()` before creating a new session. This prevents duplicate sessions for the same date+plan.

### 7e. Progress Charts (`/progress`)
Two charts using recharts:

**Volume Bar Chart:**
- X-axis: session dates (relative labels like "2 days ago")
- Y-axis: total volume = sum of (weight × reps) for all sets in that session
- Single bar per session

**Estimated 1RM Line Chart:**
- User selects an exercise from dropdown
- For each session, calculates 1RM using Epley formula: `weight × (1 + reps / 30)`
- Uses the BEST set's estimated 1RM per session (highest value)
- Line chart shows trend over time

Data is fetched once on mount: all sessions → all exercise_sets → grouped by exercise in JS.

### 7f. Summary (`/summary`)
Lists every saved session with full set-by-set detail. Each set's weight and reps are **inline editable**:
- Click a weight or reps value → turns into a text input
- Edit and press Enter or blur → saves immediately to Supabase via `.update()`
- Pencil icon shows on hover as visual cue
- Each session has a delete button (cascading: deletes all sets first, then the session)

### 7g. Exercise Library (`/exercises`)
- Form to add exercises (name + optional muscle group)
- Exercises displayed grouped by muscle group, alphabetically
- Uses the `rounded-full border border-[#d9d8d2]` tag style from GroupHub
- 55 exercises seeded via SQL (common lifts)

---

## 8. Data Flow

### Log → Save Session
```
User clicks Save
  → validate: selected plan, day, and date
  → check: existingSession?
    → YES: DELETE exercise_sets WHERE session_id = existingSession.id
           INSERT new exercise_sets with existing session_id
    → NO:  INSERT workout_sessions (user_id, plan_id, date)
           INSERT exercise_sets with new session_id
  → update local state: setExistingSession(newSession)
  → setSaving(false)
```

### Overload Suggestion Flow
```
User selects a day → dayExercises loaded
  → OverloadSuggestion mounts for each exercise
  → query 1: day_exercises WHERE exercise_id = current exercise_id
    → returns all day_exercise IDs for this exercise
  → query 2: workout_sessions WHERE user_id = current user, ORDER BY date DESC
    → returns all session IDs + dates
    → exclude current sessionId if provided
  → query 3: exercise_sets WHERE session_id IN (sessions) AND day_exercise_id IN (ids)
    → returns last N sets (N = target_sets)
  → calculate: allHitTarget? bestWeight?
    → allHitTarget + bestWeight > 0: "Go for {nextWeight} kg"
    → bestWeight > 0: "Hit {reps} on all sets to unlock next weight"
    → else: "Establish your baseline"
  → display colored suggestion box
```

### Template Import Flow
```
User clicks template
  → fetch ALL exercises from DB (build name→id map)
  → INSERT workout_plan (template.name)
  → for each day in template.days:
    → INSERT plan_day
    → for each exercise in day.exercises:
      → lookup exercise ID by name (lowercased match)
      → INSERT day_exercise if ID found
  → update plans list
```

---

## 9. Responsive Strategy

### Base Approach
Mobile-first with `sm:`, `lg:`, `xl:` breakpoints. Every page uses:
```jsx
px-6 sm:px-10 lg:px-20 xl:px-28
```

### Key Responsive Patterns

**Forms:** Stack vertically on mobile, horizontal on `sm:`:
```jsx
flex flex-col gap-3 sm:flex-row
```

**Input heights:** Touch-friendly on mobile, compact on desktop:
```jsx
h-12 sm:h-11       // buttons
h-12 sm:h-10       // number inputs (log page)
h-12 sm:text-base  // form inputs
```

**Grids that stack:**
```jsx
// Sidebar layout — sidebar goes full-width below on mobile
grid gap-8 lg:grid-cols-[1fr_360px]

// Two-column hero — stacks on mobile
grid grid-cols-1 lg:grid-cols-[1fr_29vw]
```

**Set inputs (Log page):** Use `inputMode` for proper mobile keyboards:
```jsx
inputMode="decimal"  // for weight (decimal keypad)
inputMode="numeric"  // for reps (numeric keypad)
```

**Navbar:** Desktop nav links hidden on mobile via `hidden lg:flex`. Mobile uses a `<details>` drawer with `w-[min(82vw,360px)]`.

**Viewport meta:**
```jsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,  // Prevent zoom on input focus
}
```

### Touch Targets
All interactive elements on mobile are at least:
- Height: `h-12` (48px) — exceeds Apple's 44px minimum
- Day buttons: `h-11` (44px)
- Set number inputs: `h-12` (48px)

---

## 10. Progressive Overload Engine

### What is Progressive Overload?
The principle of gradually increasing the stress placed on muscles during training to stimulate growth. Without it, muscles adapt and stop growing.

### Double Progression Method (Implemented)
1. Pick a weight you can do for **all target reps across all sets**
   - Example: target is 3 × 10. You do 135 kg × 10, 10, 10 ✓
2. **Next session**: increase weight by 2.5 kg, drop back to target reps
   - 137.5 kg × 10, 10, 10
3. If you can't hit all reps, **stay at the same weight** and try to hit the reps
   - 135 kg × 10, 9, 8 → next session try 135 kg × 10, 10, 10

### Implementation (`components/progressive-overload.jsx`)

The component takes a `dayExercise` (with `target_sets`, `target_reps`, `exercise_id`) and a `sessionId` (to exclude the current session from comparison).

**Query (3 simple queries, no complex joins):**
1. Get all `day_exercise` IDs for this `exercise_id` (finds the same exercise across different plans/days)
2. Get all `workout_sessions` for this user (newest first)
3. Get `exercise_sets` matching those IDs, limited to `target_sets`

**Decision tree:**
```
lastSets found?
  NO  → "Hit {reps} on all {sets} sets to establish your baseline."
  YES →
    all sets hit target reps?
      YES + weight > 0 → "Go for {ceil((bestWeight + 2.5) / 2.5) * 2.5} kg × {target_reps}"
      weight > 0        → "Last session: {bestWeight} kg — reps: {summary}. Hit {reps} on all sets."
      weight == 0       → "Establish your baseline."
```

**Color coding:**
- `baseline`: `bg-[#efeee8] text-[#55544f]` (grey, neutral)
- `push` (hit reps): `bg-[#2f2f2d] text-white` (dark, encouraging)
- `increase` (increase weight): `bg-[#171717] text-white` (bold, celebratory)

**Icon coding:**
- baseline: `Target` icon
- push: `TrendingUp` icon
- increase: `Zap` icon

### Increment Calculation
Since we use metric (kg), the standard plate increment is 2.5 kg (smallest standard plate = 1.25 kg each side):
```js
const nextWeight = Math.ceil((bestWeight + 2.5) / 2.5) * 2.5
```
This rounds UP to the nearest 2.5 kg increment.

---

## 11. Challenges & Solutions

### Challenge 1: Overload Suggestion Not Showing After Save
**Symptom:** User saved a session but overload showed "establish your baseline" on next visit.

**Root cause 1:** The query used `!inner` Supabase join syntax:
```javascript
.select('reps, weight, workout_sessions!inner(date, user_id)')
.eq('workout_sessions.user_id', user.id)
```
This join was silently failing — the Supabase REST API returned empty results without error.

**Root cause 2:** The query filtered by `day_exercise_id`, which changes when you create a new plan with different days/IDs. Even for the same exercise (e.g., "Decline Bench Press"), a new plan creates new `day_exercise` rows.

**Fix:**
1. Replaced the single complex join with **3 separate queries**: get day_exercise IDs by exercise_id → get session IDs → get matching sets
2. Changed from `day_exercise_id` lookup to `exercise_id` lookup (finds the same exercise across ALL your plans/days)

### Challenge 2: Supabase Save Silently Failing
**Symptom:** User clicked Save but no data appeared in the database.

**Root cause:** RLS policies weren't forwarding auth tokens correctly, OR the `user_id` in the insert didn't match `auth.uid()`. Added error handling:
```javascript
const { error: sessErr } = await supabase.from('workout_sessions').insert({...}).select().single()
if (sessErr) { alert('Session error: ' + sessErr.message); return }
```

**Lesson:** Always handle Supabase errors explicitly — many operations fail silently without `.error` checks.

### Challenge 3: Auto-Creating Sessions on Day Selection
**Symptom:** Selecting a day in the Log page created an empty `workout_session` row in the database immediately.

**Fix:** Changed the flow so selecting a day only creates **local state** (`_local` flag on sets). The `workout_session` is only created when the user clicks **Save**. This also required changing the overload component to handle `sessionId = undefined` (no session saved yet).

### Challenge 4: Tailwind v4 + shadcn/ui Compatibility
**Symptom:** shadcn/ui components designed for Tailwind v3 use `@apply` with utility classes that changed in v4.

**Fix:** Used `@tailwindcss/postcss` plugin (Tailwind v4's postCSS integration) and `tw-animate-css` for animation utilities. CSS variables in `:root` are mapped to Tailwind's design tokens via `@theme inline {}` — this is the v4 way of doing `tailwind.config.js` `extend` theme.

### Challenge 5: `useSearchParams` Without Suspense Boundary
**Symptom:** Build failed with error about `useSearchParams()` needing a Suspense boundary.

**Fix:** Wrapped the LogPage component in a Suspense boundary:
```jsx
export default function LogPageWrapper() {
  return (
    <Suspense fallback={<Spinner />}>
      <LogPage />
    </Suspense>
  )
}
```
This is required by Next.js 16 for any component using `useSearchParams()`.

---

## 12. Deployment Checklist

### Prerequisites
- [ ] Supabase project with all tables created
- [ ] Exercises seeded (55 common exercises)
- [ ] RLS policies applied
- [ ] Email confirmation disabled (or Site URL set correctly)

### Vercel Deployment
1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Deploy

### Post-Deployment
- [ ] Update Supabase Auth settings → Site URL to your Vercel domain
- [ ] Enable email confirmation if needed
- [ ] Test auth flow end-to-end on production URL
- [ ] Set up custom domain if desired

### Production Considerations
- The app uses `NEXT_PUBLIC_` prefix for env vars (exposed to browser). This is fine for Supabase's anon key — security comes from RLS, not key secrecy.
- No API routes — everything is client-side. This means no server costs beyond Vercel's free tier.
- If you add sensitive logic later (e.g., payment), move it to Supabase Edge Functions or API routes.

---

## Quick Reference: Key Files to Edit

| What you want to change | File |
|--------------------------|------|
| Colors | `app/globals.css` (CSS variables) |
| Landing page | `app/page.jsx` |
| Navbar links | `components/navbar.jsx` (navLinks array) |
| Templates | `lib/templates.jsx` |
| Overload logic | `components/progressive-overload.jsx` |
| Database queries | Each page's `useEffect` / handler functions |
| Icon set | Import from `lucide-react` |
| Charts | `app/progress/page.jsx` (recharts) |
| Add a new page | Create `app/page-name/page.jsx`, add to navbar |
| Inline editing | `app/summary/page.jsx` (InlineEdit component) |
| Mobile styles | Look for `sm:`, `lg:` breakpoints in each page |
| Time ago display | `lib/dates.jsx` |
| Auth | `lib/auth.jsx` (AuthProvider + useAuth) |
